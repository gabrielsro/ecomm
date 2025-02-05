import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
import { updateMemberInfo, UpdateMemberInfoValues } from "@/wix-api/members";
import { wixBrowserClient } from "@/lib/wix-client.browser";

export function useUpdateMember() {
  const { toast } = useToast();

  const router = useRouter();

  return useMutation({
    mutationFn: (variables: UpdateMemberInfoValues) =>
      updateMemberInfo(wixBrowserClient, variables),
    onSuccess() {
      toast({ description: "Profile updated" });
      //useMutation will refresh cache for client components. Line below refreshes server components so they will send updated versions:
      //wix api takes some time to process the updates, so if router.refresh() is called immediately, it might still show the old data.
      //unsophisticated hack: delay the execution of router.refresh().
      setTimeout(() => router.refresh(), 2000);
    },
    onError(error) {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile. Please try again",
      });
    },
  });
}
