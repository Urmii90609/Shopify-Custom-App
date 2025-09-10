import {
  reactExtension,
  Banner,
  useApi,
  useTranslate,
  useDiscountCodes,
  useApplyDiscountCodeChange,
  useCartLines,
  useSettings,
  useDiscountAllocations,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

// purchase.checkout.reductions.render-after
export default reactExtension("purchase.checkout.reductions.render-after", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { extension, checkoutSettings } = useApi();
  const cartLines = useCartLines();
  const discountCodes = useDiscountCodes() ?? [];
  const applyDiscountCodeChange = useApplyDiscountCodeChange();
  const [hasRemovedDiscountCode, sethasRemovedDiscountCode] = useState(false);
  const discountAllocate = useDiscountAllocations();
  const settings = useSettings();
  const rejectionEnabled = settings["rejection-enable"];
  // Debugging logs
  console.log("API Data:", useApi());
  console.log("Cart lines:", cartLines);
  console.log("Checkout Data:", checkoutSettings);
  console.log("Discount Codes:", discountCodes);
  console.log(discountAllocate);
  console.log("Settings:", settings);

  // Handle discount application
  async function handleDiscountApply() {
    if (discountCodes.length > 0) {
      // Prevent the discount from being applied
      await applyDiscountCodeChange({ type: "removeDiscountCode", code: discountCodes[0].code });
      console.log("Discount blocked: 'nodiscount' product detected.");
    }
  }

  // Run when discount codes change (user applies a new code)
  useEffect(() => {
    if (discountCodes.length > 0 && rejectionEnabled) {
      handleDiscountApply();
      sethasRemovedDiscountCode(true);
    }
  }, [discountCodes]);

  // 3. Render a UI
  return (
    rejectionEnabled ? (
      hasRemovedDiscountCode ? (
        <Banner status="critical">
          {translate("showError")}
        </Banner>
      ) : null
    ) : null
  );
}