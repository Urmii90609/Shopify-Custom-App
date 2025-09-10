/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */

export function run(input) {
  let reject = false;
  let displayableErrors = [];

  // Get the first discount code applied
  const discountCode = input.discounts?.[0];

  // Check if discount is a percentage-based discount
  const isPercentageDiscount = discountCode?.discountProposals?.some(
    (proposal) => proposal.value?.__typename === "Percentage"
  );

  // Create discounts array
  const lineDiscounts = input.cart.lines.map((lineItem) => {

    const hasNoDiscountTag = lineItem.merchandise.product.hasTags?.some(
      (tagObj) => tagObj.tag === "Nodiscount" && tagObj.hasTag
    );

    // Check if this line item is part of the discount proposal
    const isItemInProposal = discountCode?.discountProposals?.some(proposal =>
      proposal.targets.some(target => target.cartLineId === lineItem.id)
    );

    if (isItemInProposal) {
      //console.log(`Skipping ${lineItem.merchandise.product.title} as it is in discount proposals`);

      if (hasNoDiscountTag) {
        reject = true;
        console.log("No discount applied");

        discountCode.discountProposals[0].message = "";

       // console.log('disocunt ' + discountCode.discountProposals[0].message);

        displayableErrors.push({
          discountId: input.discounts[0].id.toString(),
          reason: "Discount is not applied for several products.",
        });

        // return {
        //   cartLineId: lineItem.id,
        //   quantity: lineItem.quantity,
        //   allocations: [
        //     {
        //       discountProposalId: discountCode?.discountProposals[0]?.handle,
        //       amount: 0, // No discount
        //     },
        //   ],
        // };

        return null; // Exclude only if the item was not targeted

      } else if (isPercentageDiscount) {
       // console.log("Applying discount:", discountCode.code);

        // Calculate discount amount for this line item
        const discountAmount = parseFloat(
          (discountCode.discountProposals[0].value.value / 100.0) *
          lineItem.cost.amountPerQuantity.amount
        );

        return {
          cartLineId: lineItem.id,
          quantity: lineItem.quantity,
          allocations: [
            {
              discountProposalId: discountCode?.discountProposals[0]?.handle,
              amount: discountAmount, // Apply discount
            },
          ],
        };
      }
    }
    return null;
  }).filter(Boolean); // Remove null values

  return {
    lineDiscounts,
    displayableErrors,
  };
}

