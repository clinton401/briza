"use server";

import * as z from "zod";
import { sendEmail } from "@/lib/mail";
import { unknown_error, user_not_found } from "@/lib/variables";
import getUserIpAddress from "@/hooks/get-user-ip-address";
import { rateLimit } from "@/lib/rate-limits";
import { otpGenerator } from "@/lib/auth-utils";
import { createTwoFAToken } from "@/data/two-fa-tokens";
import { findUnique  } from "@/data/users";
import { twoFactorAuthenticationEmailTemplate } from "@/lib/mail-html-templates";
import { createErrorResponse } from "@/lib/random-utils";

const EmailSchema = z.string().email();

export const regenerateTwoFAToken = async (email: string) => {
  try {
    const validation = EmailSchema.safeParse(email);
    if (!validation.success) {
      return createErrorResponse("Invalid email address.");
    }

    const lowercaseEmail = email.toLowerCase();

    const userIp = await getUserIpAddress();
    const { error } = rateLimit(userIp, false);
    if (error) return createErrorResponse(error);

    const user = await findUnique(lowercaseEmail);
    if (!user) return createErrorResponse(user_not_found);

    const { verificationCode, expiresAt } = otpGenerator();

    const newToken = await createTwoFAToken(user.id, verificationCode, expiresAt);
    if (!newToken) return createErrorResponse(unknown_error);

    const { subject, text, template } = twoFactorAuthenticationEmailTemplate(
      verificationCode
    );
    await sendEmail(lowercaseEmail, subject, text, template);

    return {
      success: "New verification code sent to your email.",
      error: undefined,
    };
  } catch (err) {
    console.error(
      `Unable to regenerate reset token for email ${email}: ${err instanceof Error ? err.message : err}`
    );
    return {
      error: unknown_error,
      success: undefined,
    };
  }
};
