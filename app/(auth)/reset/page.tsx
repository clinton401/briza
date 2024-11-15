import { FC } from "react";
import { FormWrapper } from "@/components/auth/form-wrapper";
import { ResetForm } from "@/components/auth/reset-form";
const ResetPasswordPage: FC<{searchParams: {
    redirect?: string
  }}> = async ({searchParams}) => {
    const {redirect} =  await searchParams;
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
