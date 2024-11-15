import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import {LoginSchema} from "@/schemas";
import {validatePassword} from "@/lib/password-utils";
import { findUnique } from "@/data/users";
import Credentials from "next-auth/providers/credentials";
export default {
  providers: [
    Google,
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) {
          console.error("Invalid input fields:", validatedFields.error);
          return null;
        }
      
        const { email, password } = validatedFields.data;
        const user = await findUnique(email.toLowerCase());
        if (!user || !user.password) {
          console.error("User not found or password is missing");
          return null;
        }
      
        const isValid = await validatePassword(password, user.password);
        if (!isValid) {
          console.error("Invalid password");
          return null;
        }
      
        return user;
      }
      
    }),
  ],
} satisfies NextAuthConfig;
