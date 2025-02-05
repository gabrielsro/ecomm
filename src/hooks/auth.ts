import { usePathname } from "next/navigation";
import { useToast } from "./use-toast";
import { generateOAuthData, getLoginUrl, getLogoutUrl } from "@/wix-api/auth";
import { wixBrowserClient } from "@/lib/wix-client.browser";
import Cookies from "js-cookie";
import { WIX_OAUTH_DATA_COOKIE, WIX_SESSION_COOKIE } from "@/lib/constants";

export default function useAuth() {
  //Get current path name to construct redirect url:
  const pathname = usePathname();

  //Notify user in case of error:
  const { toast } = useToast();

  async function login() {
    try {
      //Generate oauth data:
      const oAuthData = await generateOAuthData(wixBrowserClient, pathname);

      //Store oauth data in a cookie:
      Cookies.set(WIX_OAUTH_DATA_COOKIE, JSON.stringify(oAuthData), {
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 10 * 60 * 1000), //Login process cannot take more than 10 minutes
      });

      //Get redirect URL:
      const redirectUrl = await getLoginUrl(wixBrowserClient, oAuthData);

      //Do the actual redirection to the external url previously obtained:
      window.location.href = redirectUrl;
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Failed to login. Pleas try again.",
      });
    }
  }

  async function logout() {
    try {
      const logoutUrl = await getLogoutUrl(wixBrowserClient);

      Cookies.remove(WIX_SESSION_COOKIE);

      window.location.href = logoutUrl;
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Failed to logout. Pleas try again.",
      });
    }
  }

  return { login, logout };
}
