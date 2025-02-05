import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import {
  BackInStockNotificationRequestValues,
  createBackInStockNotificationRequest,
} from "@/wix-api/backInStockNotifications";
import { wixBrowserClient } from "@/lib/wix-client.browser";

export function useCreateBackInStockNotificationRequest() {
  //Toast handler in case we get an error
  const { toast } = useToast();

  //Error states, loading states, callbacks for free:
  return useMutation({
    mutationFn: (values: BackInStockNotificationRequestValues) =>
      createBackInStockNotificationRequest(wixBrowserClient, values),
    onError(error) {
      console.error(error);
      if (
        (error as any).details.applicationError.code ===
        "BACK_IN_STOCK_NOTIFICATION_REQUEST_ALREADY_EXISTS"
      ) {
        toast({
          variant: "destructive",
          description: "You are already subscribed to this product.",
        });
      } else {
        toast({
          variant: "destructive",
          description: "Something went wrong. Pleas try again.",
        });
      }
    },
  });
}
