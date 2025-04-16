"use server";
import * as z from "zod";
import { findUnique, updatePassword } from "@/data/users";
import { unknown_error, user_not_found, unauthorized_error } from "@/lib/variables";
import { rateLimit } from "@/lib/rate-limits";
import getServerUser from "@/hooks/get-server-user";
import { validatePassword } from "@/lib/password-utils";


const passwordFormSchema = z
.object({
  currentPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>
export const settingsPasswordReset = async (data: PasswordFormValues) => {

    const session = await getServerUser();
    if (!session) return unauthorized_error;

    const result = passwordFormSchema.safeParse(data);
    if (!result.success) {
        return "Invalid details"
    }
    try{
    const { error } = rateLimit(session.id, false);

    if(error) return error;
    const {currentPassword, newPassword, confirmPassword} = result.data;
    
    const user = await findUnique(session.email);
    if (!user) {
        return user_not_found;
    }
    if (!user.password) {
        return "User has no password set";
    }
   const  isOldPasswordValid = await validatePassword(currentPassword, user.password);
    if (!isOldPasswordValid) {
        return "Current password is incorrect";
    }
    const isNewPasswordValid = await validatePassword(newPassword, user.password);
    if (isNewPasswordValid) {
        return "New password cannot be the same as the old password";
    }

    const updatedUser = await updatePassword(user.id, newPassword);
    if(!updatedUser) return unknown_error
    return null

    }catch(error){
        console.error(`Unable to reset user password`)
        return unknown_error
    }
}