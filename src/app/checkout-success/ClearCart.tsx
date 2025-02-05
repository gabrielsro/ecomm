//Wrapper component around useClearCart hook. Page is a server component, so this component will run client side instead.
"use client";

import { useClearCart } from "@/hooks/cart";
import { useEffect } from "react";

export default function ClearCart() {
  const { mutate } = useClearCart();

  //Call mutate as soon as page for checkout-success is rendered:
  useEffect(mutate, [mutate]);

  return null;
}
