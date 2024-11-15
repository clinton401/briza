"use server";
import * as z from "zod";
import { sendEmail } from "@/lib/mail";
import { findUnique } from "@/data/users";
import { RegisterSchema } from "@/schemas";
import { verificationEmailTemplate } from "@/lib/mail-html-templates";
import { otpGenerator } from "@/lib/auth-utils";
import { createUser } from "@/data/users";
import { createVerificationToken } from "@/data/email-verification-tokens";
import { unknown_error } from "@/lib/variables";
import getUserIpAddress from "@/hooks/get-user-ip-address";
import { rateLimit } from "@/lib/rate-limits";
import {createErrorResponse} from "@/lib/random-utils"
export const register = async (
  values: z.infer<typeof RegisterSchema>,
  redirect: string | null
) => {
  const validatedFields = RegisterSchema.safeParse(values);
  const userIp = await getUserIpAddress();
  if (!validatedFields.success) return createErrorResponse("Invalid fields");

  try {
    const { error } = rateLimit(userIp, false);
    if (error) return createErrorResponse(error);
        
    const { name, email, password } = validatedFields.data;
    const { verificationCode, expiresAt } = otpGenerator();
    const lowercaseEmail = email.toLowerCase();

    const { subject, text, template } =
      verificationEmailTemplate(verificationCode);
    const emailExists = await findUnique(lowercaseEmail);
    if (emailExists) return createErrorResponse("This email is already registered. Please use a different one.");
    const newUser = await createUser(name, lowercaseEmail, password);
    if (!newUser) return createErrorResponse(unknown_error);
    const newToken = await createVerificationToken(
      newUser.id,
      verificationCode,
      expiresAt
    );
    if (!newToken ) return createErrorResponse(unknown_error);

    await sendEmail(lowercaseEmail, subject, text, template);
    return {
      success:
        "User created successfully!. Verification code sent to your email",
      redirectUrl: `/verify-email/${newUser.id}${
        redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
      }`,
      error: undefined,
    };
  } catch (err) {
    console.error(`Unable to register user: ${err}`);
    return {
      error: err instanceof Error ? err.message : unknown_error,
      success: undefined,
      redirectUrl: undefined,
    };
  }
};
