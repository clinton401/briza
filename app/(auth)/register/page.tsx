import {FC} from 'react'
import { FormWrapper } from "@/components/auth/form-wrapper";
import { RegisterForm } from '@/components/auth/register-form';
export const metadata = {
  title: 'Create an Account',
  description: 'Join Briza and start sharing your thoughts, following others, and being part of the conversation.',
};

 const RegisterPage: FC<{searchParams: {
  redirect?: string
}}> = async ({searchParams}) => {
  const {redirect} = await searchParams;
  return (
    <FormWrapper
      title="Create an account"
      backButtonText="Already have an account?"
      backButtonLinkText="Sign in"
      backButtonUrl={`/login${
        redirect ? `?redirect=${encodeURIComponent(redirect)} ` : ""
      }`}
      showSocial
    >
      <div className="w-full flex items-center justify-center gap-2">
        <span className="flex-grow flex h-[1px] bg-input"></span>{" "}
        <h4 className="text-lg">OR</h4>{" "}
        <span className="flex-grow flex h-[1px] bg-input"></span>
      </div>
      
      <RegisterForm />
    </FormWrapper>
  )
}

export default RegisterPage;
