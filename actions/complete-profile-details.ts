"use server";
import { checkUsernameUnique } from "@/actions/check-username-unique";
import { updateUser } from "@/data/users";
import * as z from "zod";
import { createErrorResponse } from "@/lib/random-utils";
import { unknown_error, unauthorized_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
type FormDetails = {
  username: string;
  bio: string;
  website: string;
  websiteName: string;
};
type UploadedDetails = {
  profileUrl: null | string;
  profileId: null | string;
  coverUrl: null | string;
  coverId: null | string;
};
const FormDetailsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(30, "Username must not exceed 30 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores."
    ),

  bio: z
    .string()
    .min(1, "Bio is required.")
    .refine((value) => value.trim().split(/\s+/).length >= 2, {
      message: "Bio must contain at least two words.",
    }),

  website: z
    .string()
    .optional()
    .refine((value) => !value || value.startsWith("https://"), {
      message: "Website link must start with https://",
    }),

  websiteName: z.string().optional(),
});
const UploadedDetailsSchema = z.object({
  profileUrl: z.string().url("Profile URL must be a valid URL."),
  profileId: z.string().min(1, "Profile ID is required."),
  coverUrl: z.string().url("Cover URL must be a valid URL.").nullable(),
  coverId: z.string().min(1, "Cover ID is required if provided.").nullable(),
});

export const completeProfileDetails = async (
  formDetails: FormDetails,
  uploadedDetails: UploadedDetails,
  redirect: string | null
) => {
  try {
    const session = await getServerUser();
    if (!session) return createErrorResponse(unauthorized_error, "/login");
    const validatedFormDetails = FormDetailsSchema.safeParse(formDetails);
    const validatedUploadedDetails =
      UploadedDetailsSchema.safeParse(uploadedDetails);
    if (!validatedFormDetails.success)
      return createErrorResponse(
        "Please ensure all required fields are filled out correctly."
      );
    if (!validatedUploadedDetails.success)
      return createErrorResponse("Profile URL and Profile ID are required.");
    const { username, bio, website, websiteName } = validatedFormDetails.data;
    const { profileUrl, profileId, coverUrl, coverId } =
      validatedUploadedDetails.data;
    const usernameExists = await checkUsernameUnique(username);
    if (usernameExists)
      return createErrorResponse("Username is already taken.");
    const dataToBeUpdated = {
      username: username.toLowerCase(),
      bio,
      website,
      websiteName,
      profilePictureUrl: profileUrl,
      profilePicturePublicId: profileId,
      coverPhotoUrl: coverUrl,
      coverPhotoPublicId: coverId,
    };
    const updatedUser = await updateUser(session.id, dataToBeUpdated);
    if (!updatedUser) return createErrorResponse(unknown_error);
    return {
      error: undefined,
      success: "User details have been successfully saved.",
      redirectUrl: redirect || DEFAULT_LOGIN_REDIRECT,
    };
  } catch (error) {
    console.error(`Unable to complete user profile details: ${error}`);
    const errMsg = error instanceof Error ? error.message : unknown_error;
    return createErrorResponse(errMsg);
  }
};
