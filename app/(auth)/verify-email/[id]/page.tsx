import {FC} from 'react'
import { FormWrapper } from "@/components/auth/form-wrapper";
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
export const metadata = {
  title: 'Verify Your Email',
  description: 'Verify your email address to activate your Briza account and start connecting.',
};

const VerifyEmailPage: FC<{searchParams: Promise<{
  redirect?: string
}>}> = async({searchParams}) => {
  const {redirect} =  await searchParams;
  return (
    <FormWrapper title="Verify your email"
    backButtonLinkText="Back to login"
    backButtonUrl={`/login${
      redirect ? `?redirect=${encodeURIComponent(redirect)} ` : ""
    }`}
    >
      <VerifyEmailForm/>
    </FormWrapper>
  )
}

export default VerifyEmailPage
