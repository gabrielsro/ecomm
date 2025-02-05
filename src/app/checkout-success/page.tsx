import Order from "@/components/Order";
import { getWixServerClient } from "@/lib/wix-client.server";
import { getLoggedInMember } from "@/wix-api/members";
import { getOrder } from "@/wix-api/orders";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClearCart from "./ClearCart";

export const metadata: Metadata = {
  title: "Checkout success",
};

type PageProps = Promise<{ orderId: string }>;

export default async function Page({
  searchParams,
}: {
  searchParams: PageProps;
}) {
  const { orderId } = await searchParams;
  const wixClient = await getWixServerClient();

  const [order, loggedInMember] = await Promise.all([
    getOrder(wixClient, orderId),
    getLoggedInMember(wixClient),
  ]);

  if (!order) notFound();

  //By default, success page clears carts, but a user who just had its cart cleared can navigate back to the success page
  //Ceteris paribus, the success page would clear his cart again. Not ideal because the user didn't check out.
  //Prevent this problem by having the ClearCart component active 5 minutes, at most, after order creation.
  //If the new order was made within the last 5 minutes, cart will be cleared.
  //If user navigates back to success page after 5 minutes, his cart won't be cleared. Otherwise it will.
  const orderCreatedDate = order._createdDate
    ? new Date(order._createdDate)
    : null;

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center space-y-5 px-5 py-10">
      <h1 className="text-3xl font-bold">We received your order!</h1>
      <p>A summary of your order was sent to your email address.</p>
      <h2 className="text-2xl font-bold">Order details</h2>
      <Order order={order} />
      {loggedInMember && (
        <Link href="/profile" className="block text-primary hover:underline">
          View all your orders
        </Link>
      )}
      {orderCreatedDate &&
        orderCreatedDate.getTime() > Date.now() - 60000 * 5 && <ClearCart />}
    </main>
  );
}
