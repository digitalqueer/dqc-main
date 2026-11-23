import { getServerEnv } from "@/server/env.server";
import { Prettify } from "@/lib/utils";
import { CONTACT_TURNSTILE_ACTION } from "@/schemas/contactRequest.schema";

type SiteVerifyErrorCode =
  | "missing-input-secret"
  | "invalid-input-secret"
  | "missing-input-response"
  | "invalid-input-response"
  | "bad-request"
  | "timeout-or-duplicate"
  | "internal-error"
  | "server-action-error" // Additional
  | "action-mismatch" // Additional
  | "request-timeout"; // Additional

interface ValidSiteVerifyResponse {
  success: true;
  challenge_ts: string;
  hostname: string;
  "error-codes": never[];
  metadata?: {
    result_with_testing_key?: boolean;
    ephemeral_id?: string; // enterprise-only
  };
  action?: string;
  cdata?: string;
}

interface InvalidSiteVerifyResponse {
  success: false;
  "error-codes": SiteVerifyErrorCode[];
}

type SiteVerifyResponse = Prettify<
  ValidSiteVerifyResponse | InvalidSiteVerifyResponse
>;

export async function validateTurnstileToken(
  token: string,
  action: typeof CONTACT_TURNSTILE_ACTION,
): Promise<SiteVerifyResponse> {
  try {
    const body = {
      secret: getServerEnv().turnstile.secretKey,
      response: token,
    };
    const validationResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    const result: SiteVerifyResponse = await validationResponse.json();
    if (
      result.success &&
      !result.metadata?.result_with_testing_key &&
      result.action !== action
    ) {
      return {
        success: false,
        "error-codes": ["action-mismatch"],
      };
    }
    return result;
  } catch (err) {
    console.error("Siteverify request - server-action-error");
    return {
      success: false,
      "error-codes": ["server-action-error"],
    };
  }
}
