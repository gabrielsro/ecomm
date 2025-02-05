import { wixBrowserClient } from "@/lib/wix-client.browser";
import {
  addToCart,
  addToCartValues,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
  UpdateCartItemQuantityValues,
} from "@/wix-api/cart";
import {
  MutationKey,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { currentCart } from "@wix/ecom";
import { useToast } from "./use-toast";

const queryKey: QueryKey = ["cart"];

export function useCart(initialData: currentCart.Cart | null) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => getCart(wixBrowserClient),
    initialData,
  });
}

export function useAddItemToCart() {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: addToCartValues) =>
      addToCart(wixBrowserClient, values),
    onSuccess(data) {
      toast({ description: "Item added to cart" });
      queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, data.cart);
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to add item to cart. Please try again.",
      });
    },
  });
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  //Uniquely identify the mutation for preventing race conditions and server overuse later:
  const mutationKey: MutationKey = ["useUpdateCartItemQuantity"];

  return useMutation({
    mutationKey,
    //The actual server update. Can take a while:
    mutationFn: (values: UpdateCartItemQuantityValues) =>
      updateCartItemQuantity(wixBrowserClient, values),
    //While the server works, update the cache so react can show frontend actions right away:
    onMutate: async ({ productId, newQuantity }) => {
      await queryClient.cancelQueries({ queryKey });

      //If update fails, return to the old value (we store this value first):
      const previousState =
        queryClient.getQueryData<currentCart.Cart>(queryKey);

      //Do the optimistic update:
      queryClient.setQueryData<currentCart.Cart>(queryKey, (oldData) => ({
        ...oldData,
        lineItems: oldData?.lineItems?.map((lineItem) =>
          lineItem._id === productId
            ? { ...lineItem, quantity: newQuantity }
            : lineItem,
        ),
      }));

      //Return previousState so that it can be used to roll back in case of error
      return { previousState };
    },
    //In case the server ended up with an error:
    onError(error, variables, context) {
      //The actual rollback:
      queryClient.setQueryData(queryKey, context?.previousState);
      //Error information for devs and users
      console.log(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again later.",
      });
    },
    //What to do after error or success:
    onSettled() {
      //How many mutations are going on? wait for all to be resolved (1 being the min) and then ask the server for the latest data:
      if (queryClient.isMutating({ mutationKey }) === 1) {
        //Tell the server to fetch the data again so we can update ALL components with the end result of user action:
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  //Since items are removed once (button for removin dissapears thereafter), there's no race conditions.
  //So no need for a mutation key to keep track of multiple mutations going on

  return useMutation({
    mutationFn: (productId: string) =>
      removeCartItem(wixBrowserClient, productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousState =
        queryClient.getQueryData<currentCart.Cart>(queryKey);

      queryClient.setQueryData<currentCart.Cart>(queryKey, (oldData) => ({
        ...oldData,
        lineItems: oldData?.lineItems?.filter(
          (lineItem) => lineItem._id !== productId,
        ),
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.log(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again later.",
      });
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearCart(wixBrowserClient),
    onSuccess() {
      queryClient.setQueryData(queryKey, null);
      //Re-fetch data to update cache in case something else happened while hook was running:
      queryClient.invalidateQueries({ queryKey });
    },
    //If mutationFn fails, retry at most 3 times:
    retry: 3,
  });
}
