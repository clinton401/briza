"use server";
import * as z from "zod";
import { sendEmail } from "@/lib/mail";
import { findUnique, updatePassword } from "@/data/users";
import {ResetSchema} from "@/schemas";
import { unknown_error, user_not_found } from "@/lib/variables";
import getUserIpAddress from "@/hooks/get-user-ip-address";
import { rateLimit } from "@/lib/rate-limits";
import { otpGenerator } from "@/lib/auth-utils";
import {createResetToken, findUnique as findUniqueToken, deleteById } from "@/data/reset-password-tokens";
import {passwordResetEmailTemplate} from "@/lib/mail-html-templates";
import { hasExpired } from "@/lib/auth-utils";
import {validatePassword} from "@/lib/password-utils"
export const reset = async(values: z.infer<ReturnType<typeof ResetSchema>>, isCodeSent: boolean,
    redirect: string | null) => {
        const userIp = await getUserIpAddress();
        const validatedFields = ResetSchema(isCodeSent).safeParse(values);
  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      success: undefined,
      redirectUrl: undefined,
      isOtpSent: false
    };
  }
  try{
    const { error } = rateLimit(userIp, false);
    if (error) return {
        error,
        success: undefined,
        redirectUrl: undefined,
        isOtpSent: false
    }
    
    const { email, otp, newPassword } = validatedFields.data;
  const { verificationCode, expiresAt } = otpGenerator();
  const lowercaseEmail = email.toLowerCase();
  const user = await findUnique(lowercaseEmail);
    if (!user) {
        return {
          error: user_not_found,
          success: undefined,
          redirectUrl: undefined,
          isOtpSent: false
        };
      }
  if (!isCodeSent) {
    
      const newToken = await createResetToken(
        user.id,
        verificationCode,
        expiresAt
      );
      if (!newToken) {
        return {
          error: unknown_error,
          success: undefined,
          redirectUrl: undefined,
          isOtpSent: false
        };
      }
      const { subject, text, template } =
      passwordResetEmailTemplate(verificationCode);
      
      await sendEmail(lowercaseEmail, subject, text, template);
      return {
        success: "Password reset request successful! OTP code sent to your email.",
        redirectUrl: undefined,
        error: undefined,
        isOtpSent: true
      };

  }
  
  if (isCodeSent && (!otp || !newPassword)) {

    return {
      error: "Verification code and new password fields are required",
      success: undefined,
      redirectUrl: undefined,
      isOtpSent: false
    };
  

  }
  const foundToken = await findUniqueToken(user.id);
  if(!foundToken) return {
    error: user_not_found,
    success: undefined,
    redirectUrl: undefined,
    isOtpSent: false
  };
  
  const isExpired = hasExpired(foundToken.expiresAt);
  if (isExpired) {
    return {
        error: "Code has expired, generate a new one",
        success: undefined,
        redirectUrl: undefined,
        isOtpSent: false
      };
  }

  const isOtpValid = otp === foundToken.token;
  if (!isOtpValid) return  {
    error: "Invalid code",
    success: undefined,
    redirectUrl: undefined,
    isOtpSent: false
  };
  if(!newPassword || newPassword.length < 6) return {
    error: "Password must be at least 6 characters long",
    success: undefined,
    redirectUrl: undefined,
    isOtpSent: false
  }
  if(!user?.password) {
    return {
        error: "Password can't be changed for accounts signed in with an OAuth provider.",
        success: "",
        redirectUrl: undefined,
    isOtpSent: false
    }
}
const isPasswordTheSameAsLastOne =  await validatePassword(newPassword, user.password);
  if(isPasswordTheSameAsLastOne) return {
    error: "New password cannot be the same as the current one",
    success: undefined,
    redirectUrl: undefined,
    isOtpSent: false
  };
const updatedUser = await updatePassword(user.id, newPassword);
if(!updatedUser) return {
    error: unknown_error,
    success: undefined,
    redirectUrl: undefined,
    isOtpSent: false
  };
  const deletedToken = await deleteById(foundToken.id);
  if(!deletedToken) return {
    error: unknown_error,
    success: undefined,
    redirectUrl: undefined,
    isOtpSent: false
  };

  return {
    success: "Password changed successfully",
    error: undefined,
    redirectUrl: `/login${redirect ? `?redirect=${encodeURIComponent(redirect)}`: ""}`,
    isOtpSent: false
  };

  }catch(err) {
    console.error(`Unable to reset user password: ${err}`);
    return {
        error: err instanceof Error ? err.message : unknown_error,
        success: undefined,
        redirectUrl: undefined,
        isOtpSent: false
      };
  }
    }