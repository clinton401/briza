import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export default {
  providers: [
    Google,
    // Credentials({
    //   async authorize(credentials) {
    //     await connectToDatabase();
    //     const validatedFields = LoginSchema.safeParse(credentials);
    //     if (validatedFields.success) {
    //       const { email, password } = validatedFields.data;
    //       const user = await findOne({ email: email.toLowerCase() });
    //       if (!user  || !user.password ) return null;
    //       const isValid = await validatePassword(password, user.password);
    //       if (!isValid) return null;

    //       return user;
    //     }
    //     return null;
    //   },
    // }),
  ],
} satisfies NextAuthConfig;
