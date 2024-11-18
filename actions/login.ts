"use server";
import * as z from "zod";
import { sendEmail } from "@/lib/mail";
import { findUnique } from "@/data/users";
import { LoginSchema } from "@/schemas";
import {
  verificationEmailTemplate,
  twoFactorAuthenticationEmailTemplate,
} from "@/lib/mail-html-templates";
import { signIn } from "@/auth";
import { otpGenerator, hasExpired } from "@/lib/auth-utils";
import { validatePassword } from "@/lib/password-utils";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import getUserIpAddress from "@/hooks/get-user-ip-address";
import { rateLimit } from "@/lib/rate-limits";
import { createErrorResponse } from "@/lib/random-utils";
import { createVerificationToken } from "@/data/email-verification-tokens";
import { createTwoFAToken, findUnique as findUniqueTwoFA, deleteById } from "@/data/two-fa-tokens";
import { unknown_error, user_not_found } from "@/lib/variables";
export const login = async (
  values: z.infer<typeof LoginSchema>,
  redirect: string | null,
  is2FA: boolean
) => {
  try {
    const userIp = await getUserIpAddress();
    const { error } = rateLimit(userIp, false);
    if (error) return createErrorResponse(error);
    const validatedFields = LoginSchema.safeParse(values);
    if (!validatedFields.success) {
      return createErrorResponse("Invalid fields");
    }
    const { twoFA, email, password } = validatedFields.data;
    const lowercaseEmail = email.toLowerCase();
    const user = await findUnique(lowercaseEmail);
    if (!user) return createErrorResponse(user_not_found);
    if (user.isVerified === false) {
      const { verificationCode, expiresAt } = otpGenerator();
      const { subject, text, template } =
        verificationEmailTemplate(verificationCode);
      const newToken = await createVerificationToken(
        user.id,
        verificationCode,
        expiresAt
      );
      if (!newToken) return createErrorResponse(unknown_error);

      await sendEmail(lowercaseEmail, subject, text, template);
      return {
        success:
          "Please verify your email before signing in. A verification link has been sent to your email address",
        redirectUrl: `/verify-email/${user.id}${
          redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
        }`,
        error: undefined,
        isTwoFA: false,
      };
    }
    if (!user.password) return createErrorResponse("No password found. Please sign in using Google.");
    const isPasswordValid = await validatePassword(password, user.password);
    if(!isPasswordValid) return createErrorResponse("Invalid credentials. Check password and try again");
    const is2FAActive = user.twoFactorAuthentication;
    if (is2FAActive && !is2FA) {
        const { verificationCode, expiresAt } = otpGenerator(true);
        const { subject, text, template } =
        twoFactorAuthenticationEmailTemplate(verificationCode);
        const newToken = await createTwoFAToken(
            user.id,
            verificationCode,
            expiresAt
          );
          if(!newToken) return createErrorResponse(unknown_error);
          await sendEmail(lowercaseEmail, subject, text, template);
      return {
        success:
          "Your Two-Factor Authentication code has been sent to your email.",
        redirectUrl: undefined,
        error: undefined,
        isTwoFA: true,
      };
    }
    if (is2FAActive && !twoFA) return createErrorResponse("Two-Factor Authentication field is required.");
    if(is2FAActive && is2FA ) {
        const foundToken = await findUniqueTwoFA(user.id);
        if (!foundToken) return createErrorResponse(user_not_found)
          
        
        const isExpired = hasExpired(foundToken.expiresAt);
        if (isExpired) return createErrorResponse("Code has expired, generate a new one.")
          
    
        const isCodeValid = twoFA?.toUpperCase() === foundToken.token;
        if (!isCodeValid) return createErrorResponse("Invalid Two-Factor Authentication code")
            const deletedToken = await deleteById(foundToken.id);
    if (!deletedToken) return createErrorResponse(unknown_error);
          
       
      }
      const result = await signIn("credentials", {
        email: lowercaseEmail,
        password,
        redirect: false,
      });
      if(!result || result.error) return createErrorResponse(unknown_error);
      const newRedirect = !user.username || !user.bio || !user.profilePictureUrl ? "/complete-profile": redirect;
      return {
        success: "Login successful!",
        error: undefined,
        redirectUrl: newRedirect
          ? newRedirect
          : DEFAULT_LOGIN_REDIRECT,
        isTwoFA: false,
      };
  } catch (err) {
    console.error(`Unable to login: ${err}`);
    return {
      error: err instanceof Error ? err.message : unknown_error,
      success: undefined,
      redirectUrl: undefined,
      isTwoFA: undefined,
    };
  }
};
