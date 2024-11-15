"use server";
import * as z from "zod";
import { sendEmail } from "@/lib/mail";
import { unknown_error, user_not_found } from "@/lib/variables";
import getUserIpAddress from "@/hooks/get-user-ip-address";
import { rateLimit } from "@/lib/rate-limits";
import { otpGenerator } from "@/lib/auth-utils";

import {createResetToken, findUnique } from "@/data/reset-password-tokens";
import {passwordResetEmailTemplate} from "@/lib/mail-html-templates";

import {createErrorResponse} from "@/lib/random-utils"
export const regenerateResetToken = async(email: string)=> {
    try {
        const lowercaseEmail = email.toLowerCase()
  
  const { verificationCode, expiresAt } = otpGenerator();
    const userIp = await getUserIpAddress();
    const { error } = rateLimit(userIp, false);
    if (error) return createErrorResponse(error);
    const user = await findUnique(lowercaseEmail);
    if(!user) return createErrorResponse(user_not_found);
    const newToken = await createResetToken(
        user.id,
        verificationCode,
        expiresAt
      );
      if(!newToken) return createErrorResponse(unknown_error);
      const { subject, text, template } =
      passwordResetEmailTemplate(verificationCode);
      
      await sendEmail(lowercaseEmail, subject, text, template);
      return {
        success: "New verification code sent to your email",
        error: undefined,
      };
    }catch(err){
        console.error(`Unable to regenerate reset token: ${err}`);
        return {
            error: err instanceof Error ? err.message : unknown_error,
            success: undefined,
          };
    }

}