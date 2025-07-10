"use server";
import getServerUser from "@/hooks/get-server-user";
import { updateUser, findUnique } from "@/data/users";
// import { ProfileFormValues } from "@/components/settings/profile-settings";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import { hasAtLeastOneProperty } from "@/lib/random-utils";
import { z } from "zod";
import {MAX_SUSPEND_COUNT} from "@/lib/auth-utils";
// import { signIn } from "@/auth";

const profileFormSchema = z.object({
    name: z
      .string()
      .min(2, {
        message: "Name must be at least 2 characters.",
      })
      .max(50, {
        message: "Name must not be longer than 50 characters.",
      })
      .optional(),
    email: z
      .string()
      .email({
        message: "Please enter a valid email address.",
      })
      .optional(),
  });


export const updateSettingsDetails = async (details: z.infer<typeof profileFormSchema>) => {
   
    const session = await getServerUser();
    if (!session) {
        return unauthorized_error;
    }
    
    if (session.suspendCount && session.suspendCount >= MAX_SUSPEND_COUNT) {
        return "Your account has been blocked due to multiple violations.";
    }
    const values = profileFormSchema.safeParse(details);
    if (!values.success) {

        return "Invalid fields"
    }
    const data = values.data;
    const isNothingChanged = data.name === session.name && data.email === session.email;
    if (!hasAtLeastOneProperty(data) || isNothingChanged) {
        return "No changes were made to your profile.";
    }
    try {
        const validData = {
            ...(data.email !== session.email ? { email: data.email } : {}),
            ...(data.name !== session.name ? { name: data.name } : {}),
        }
        if (validData.email) {
            const emailExists = await findUnique(validData.email);
            if (emailExists) {
                return "Email already exists.";
            }
        }
       

        const user = await updateUser(session.id, validData);
        if (!user) {
            return "Failed to update user settings.";
        }
        // await signIn("credentials", {
        //     email: user.email,
        //     password: user.password,
        //     redirect: false,
        //   });

    } catch (error) {
        console.error(`Unable to update user settings: ${error}`);
        return unknown_error;
    }
}