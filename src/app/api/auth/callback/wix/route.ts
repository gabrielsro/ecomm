import { WIX_OAUTH_DATA_COOKIE, WIX_SESSION_COOKIE } from "@/lib/constants";
import { getWixServerClient } from "@/lib/wix-client.server";
import { OauthData } from "@wix/sdk";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  //Code is used to make sure user is authorized to get tokens:
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");
  const error_description = req.nextUrl.searchParams.get("error_description");

  if (error) {
    return new Response(error_description, { status: 400 });
  }

  const oAuthData: OauthData = JSON.parse(
    (await cookies()).get(WIX_OAUTH_DATA_COOKIE)?.value || "{}",
  );

  if (!code || !state || !oAuthData) {
    return new Response("Invalid request", { status: 400 });
  }

  const wixClient = await getWixServerClient();

  //The params used are needed to verify that the request is valid:
  //Retrieves access and refresh tokens for an authenticated user rather than an anonymous cart:
  const memberTokens = await wixClient.auth.getMemberTokens(
    code,
    state,
    oAuthData,
  );

  (await cookies()).delete(WIX_OAUTH_DATA_COOKIE);
  (await cookies()).set(WIX_SESSION_COOKIE, JSON.stringify(memberTokens), {
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: oAuthData.originalUri || "/",
    },
  });
}
