import { FC } from "react";
import { FormWrapper } from "@/components/auth/form-wrapper";
import { ResetForm } from "@/components/auth/reset-form";
export const metadata = {
  title: 'Reset Your Password',
  description: 'Securely reset your Briza password and regain access to your account.',
};

const ResetPasswordPage: FC<{
  searchParams: Promise<{
    redirect?: string;
  }>;
}> = async ({ searchParams }) => {
  const { redirect } = await searchParams;
  return (
    <FormWrapper
      title="Forgot your password?"
      backButtonLinkText="Back to login"
      backButtonUrl={`/login${
        redirect ? `?redirect=${encodeURIComponent(redirect)} ` : ""
      }`}
    >
      <ResetForm />
    </FormWrapper>
  );
};

export default ResetPasswordPage;
