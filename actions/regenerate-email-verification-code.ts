"use server";
import * as z from "zod";
import { OtpSchema } from "@/schemas";
import { unknown_error } from "@/lib/variables";
import getUserIpAddress from "@/hooks/get-user-ip-address";
import { rateLimit } from "@/lib/rate-limits";
import { findUnique as findUniqueUser } from "@/data/users";
import {createErrorResponse} from "@/lib/random-utils"
import { otpGenerator } from "@/lib/auth-utils";
import { verificationEmailTemplate } from "@/lib/mail-html-templates";
import { sendEmail } from "@/lib/mail";
import { createVerificationToken } from "@/data/email-verification-tokens";

export const regenerateEmailVerificationCode = async(userId: string, redirect: string | null) => {
    try{
        const userIp = await getUserIpAddress();
        const { error } = rateLimit(userIp, false);
        if (error) {
          return createErrorResponse(error);
        }
        const { verificationCode, expiresAt } = otpGenerator();
        const user = await findUniqueUser(userId, true);
    if (!user) return createErrorResponse("User not found.");

    if (user.isVerified) {
      return {
        success: "Email has already been registered",
        redirectUrl: `/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`,
        error: undefined,
      };
    }
    const { subject, text, template } =
      verificationEmailTemplate(verificationCode);
    const newToken = await createVerificationToken(
      user.id,
      verificationCode,
      expiresAt
    );
    if (!newToken ) return createErrorResponse(unknown_error);

    await sendEmail(user.email, subject, text, template);
    return {
        success: "New verification code sent to your email",
        redirectUrl: undefined,
        error: undefined,
      };
    }catch(err) {
        console.error(`Unable to regenerate email verification code: ${err}`);
        return {
            error: err instanceof Error ? err.message : unknown_error,
            success: undefined,
            redirectUrl: undefined,
          };
    }

}