import { FC } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { FormWrapper } from "@/components/auth/form-wrapper";
const LoginPage: FC<{searchParams: {
  redirect?: string
}}> = async ({searchParams}) => {
  const {redirect} = await searchParams;
  return (
    <FormWrapper
      title="Sign in to your account"
      backButtonText="Don't have an account?"
      backButtonLinkText="Create one"
      backButtonUrl={`/register${
        redirect ? `?redirect=${encodeURIComponent(redirect)} ` : ""
      }`}
      showSocial
    >
      <div className="w-full flex items-center justify-center gap-2">
        <span className="flex-grow flex h-[1px] bg-input"></span>{" "}
        <h4 className="text-lg">OR</h4>{" "}
        <span className="flex-grow flex h-[1px] bg-input"></span>
      </div>
      <LoginForm />
    </FormWrapper>
  );
};

export default LoginPage;
