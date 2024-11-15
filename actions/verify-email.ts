"use server";
import * as z from "zod";
import { OtpSchema } from "@/schemas";
import { unknown_error } from "@/lib/variables";
import getUserIpAddress from "@/hooks/get-user-ip-address";
import { rateLimit } from "@/lib/rate-limits";
import { findUnique as findUniqueToken, deleteById } from "@/data/email-verification-tokens";
import { hasExpired } from "@/lib/auth-utils";
import { findUnique as findUniqueUser, updateUser } from "@/data/users";
import {createErrorResponse} from "@/lib/random-utils"



export const verifyEmail = async (
  values: z.infer<typeof OtpSchema>,
  userId: string,
  redirect: string | null
) => {
  const validatedFields = OtpSchema.safeParse(values);
  const userIp = await getUserIpAddress();
  console.log(`IP address: ${userIp}`);

  if (!validatedFields.success) {
    return createErrorResponse("Invalid fields");
  }

  try {
    const { error } = rateLimit(userIp, false);
    if (error) {
      return createErrorResponse(error);
    }

    const { otp } = validatedFields.data;
    const user = await findUniqueUser(userId, true);
    if (!user) return createErrorResponse("User not found.");

    if (user.isVerified) {
      return {
        success: "Email has already been registered",
        redirectUrl: `/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`,
        error: undefined,
      };
    }

    const foundToken = await findUniqueToken(userId);
    if (!foundToken) return createErrorResponse("No verification token available for user.");

    const isExpired = hasExpired(foundToken.expiresAt);
    if (isExpired) {
      return createErrorResponse("Code has expired, generate a new one");
    }

    const isOtpValid = otp === foundToken.token;
    if (!isOtpValid) return createErrorResponse("Invalid code");

    const dataToBeUpdated = {
      isVerified: true,
      verifiedDate: new Date(),
    };

    const updatedUser = await updateUser(userId, dataToBeUpdated);
    if (!updatedUser) return createErrorResponse(unknown_error);

    const deletedToken = await deleteById(foundToken.id);
    if (!deletedToken) return createErrorResponse(unknown_error);
    
    return {
      success: "Email verified successfully.",
      redirectUrl: `/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`,
      error: undefined,
    };
  } catch (err) {
    console.error(`Unable to verify user email: ${err}`);
    return {
      error: err instanceof Error ? err.message : unknown_error,
      success: undefined,
      redirectUrl: undefined,
    };
  }
};
