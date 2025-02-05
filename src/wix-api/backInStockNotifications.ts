import { WIX_STORES_APP_ID, WIX_STORES_APP_ID_ALT } from "@/lib/constants";
import { findVariant } from "@/lib/utils";
import { WixClient } from "@/lib/wix-client.base";
import { products } from "@wix/stores";

export interface BackInStockNotificationRequestValues {
  email: string;
  itemUrl: string;
  product: products.Product;
  selectedOptions: Record<string, string>;
}

export async function createBackInStockNotificationRequest(
  wixClient: WixClient,
  {
    email,
    itemUrl,
    product,
    selectedOptions,
  }: BackInStockNotificationRequestValues,
) {
  const selectedVariant = findVariant(product, selectedOptions);

  await wixClient.backInStockNotifications.createBackInStockNotificationRequest(
    //Data for wix to locate the item:
    {
      email,
      itemUrl,
      catalogReference: {
        appId: WIX_STORES_APP_ID_ALT,
        catalogItemId: product._id,
        options: selectedVariant
          ? { variantId: selectedVariant._id }
          : { options: selectedOptions },
      },
    },
    //Data for wix to compose the emails:
    {
      name: product.name || undefined,
      price: product.priceData?.discountedPrice?.toFixed(2),
      image: product.media?.mainMedia?.image?.url,
    },
  );
}
