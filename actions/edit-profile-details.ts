"use server";
import { checkUsernameUnique } from "@/actions/check-username-unique";
import { updateUser } from "@/data/users";
import * as z from "zod";
import { createErrorResponse } from "@/lib/random-utils";
import { unknown_error, unauthorized_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limits";

type FormDetails = {
  username?: string;
  bio?: string;
  website?: string;
  websiteName?: string;
};

type UploadedDetails = {
  profileUrl?: string | null;
  profileId?: string | null;
  coverUrl?: string | null;
  coverId?: string | null;
};

const FormDetailsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(30, "Username must not exceed 30 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.")
    .optional()
    .or(z.literal("")), 

  bio: z
    .string()
    .optional()
    .or(z.literal("")) 
    .refine(value => !value || value.trim().split(/\s+/).length >= 2, {
      message: "Bio must contain at least two words.",
    }),

  website: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(value => !value || value.startsWith("https://"), {
      message: "Website link must start with https://",
    }),

  websiteName: z.string().optional().or(z.literal("")), 
});


const UploadedDetailsSchema = z.object({
  profileUrl: z.string().url("Profile URL must be a valid URL.").nullable(),
  profileId: z.string().min(1, "Profile ID is required if provided.").nullable(),
  coverUrl: z.string().url("Cover URL must be a valid URL.").nullable(),
  coverId: z.string().min(1, "Cover ID is required if provided.").nullable(),
});

export const editProfileDetails = async (
  id: string,
  formDetails: FormDetails = {},
  uploadedDetails: UploadedDetails = {}
) => {
  try {
    const session = await getServerUser();
    if (!session) return createErrorResponse(unauthorized_error);
    const { error } = rateLimit(session.id, true);
    if(error){
      return createErrorResponse(error);
    }
    if (id !== session.id) {
      return createErrorResponse("Unauthorized: You can only edit your own profile.");
    }

    const validatedFormDetails = FormDetailsSchema.safeParse(formDetails);
    const validatedUploadedDetails = UploadedDetailsSchema.safeParse(uploadedDetails);

    if (!validatedFormDetails.success)
      return createErrorResponse("Please ensure all required fields are filled out correctly.");

    if (!validatedUploadedDetails.success)
      return createErrorResponse("Profile and Cover details must be valid.");

    const { username, bio, website, websiteName } = validatedFormDetails.data;
    const { profileUrl, profileId, coverUrl, coverId } = validatedUploadedDetails.data;

    const hasFormDetails = Object.values(formDetails).some(value => value !== undefined && value !== "");
    const hasUploadedDetails = Object.values(uploadedDetails).some(value => value !== null && value !== "");

    if (!hasFormDetails && !hasUploadedDetails) {
      return createErrorResponse("At least one field must be updated.");
    }

    if ((profileUrl && !profileId) || (!profileUrl && profileId)) {
      return createErrorResponse("Both profileUrl and profileId must be provided together.");
    }
    if ((coverUrl && !coverId) || (!coverUrl && coverId)) {
      return createErrorResponse("Both coverUrl and coverId must be provided together.");
    }

    if (username) {
      const usernameExists = await checkUsernameUnique(username);
      if (usernameExists) return createErrorResponse("Username is already taken.");
    }

    const dataToBeUpdated = Object.fromEntries(
      Object.entries({
        username: username?.toLowerCase(),
        bio,
        website,
        websiteName,
        profilePictureUrl: profileUrl,
        profilePicturePublicId: profileId,
        coverPhotoUrl: coverUrl,
        coverPhotoPublicId: coverId,
      }).filter(([_, value]) => value !== null && value !== undefined && value?.trim() !== "")
    );
console.log({dataToBeUpdated})
    if (Object.keys(dataToBeUpdated).length === 0) {
      return createErrorResponse("No valid updates were provided.");
    }

    const updatedUser = await updateUser(session.id, dataToBeUpdated);
    if (!updatedUser) return createErrorResponse(unknown_error);

    return {
      error: undefined,
      success: "User details have been successfully updated.",
    };
  } catch (error) {
    console.error(`Unable to update profile: ${error}`);
    return createErrorResponse(unknown_error);
  }
};
