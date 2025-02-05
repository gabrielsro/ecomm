"use client";
import LoadingButton from "@/components/LoadingButton";
import Order from "@/components/Order";
import { Skeleton } from "@/components/ui/skeleton";
import { wixBrowserClient } from "@/lib/wix-client.browser";
import { getUserOrders } from "@/wix-api/orders";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function Orders() {
  const { data, fetchNextPage, hasNextPage, isFetchNextPage, status } =
    useInfiniteQuery({
      queryKey: ["orders"], //Key for the cached entries
      queryFn: async ({ pageParam }) =>
        getUserOrders(wixBrowserClient, { limit: 2, cursor: pageParam }), //pageParam is the cursor (last loaded element)
      initialPageParam: null as string | null, //First cursor
      getNextPageParam: (lastPage) => lastPage.metadata?.cursors?.next, //Tell react query how to get the next cursor. lastPage is the returned value of getUserOrders
    });

  const orders = data?.pages.flatMap((page) => page.orders) || [];
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Your orders</h2>
      {status === "pending" && <OrdersLoadingSkeleton />}
      {status === "error" && (
        <p className="text-destructive">Error fetching orders</p>
      )}
      {status === "success" && !orders.length && !hasNextPage && (
        <p>No orders yet</p>
      )}
      {orders.map((order) => (
        <Order key={order.number} order={order} />
      ))}
      {hasNextPage && (
        <LoadingButton
          loading={isFetchNextPage}
          onClick={() => fetchNextPage()}
          className="mx-auto"
        >
          Load more orders
        </LoadingButton>
      )}
    </div>
  );
}

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  );
}
