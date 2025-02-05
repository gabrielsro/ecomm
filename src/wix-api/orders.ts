import { WixClient } from "@/lib/wix-client.base";

export async function getOrder(wixClient: WixClient, orderId: string) {
  try {
    return await wixClient.orders.getOrder(orderId);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).details.applicationError.code === "NOT_FOUND") {
      return null;
    } else {
      throw error;
    }
  }
}

export interface GetUserOrdersFilters {
  limit?: number; //Pagination
  cursor?: string | null; //Last fetched element. Starting point for fetching next one
}

export async function getUserOrders(
  wixClient: WixClient,
  { limit, cursor }: GetUserOrdersFilters,
) {
  return await wixClient.orders.searchOrders({
    search: {
      cursorPaging: { limit, cursor },
    },
  });
}
