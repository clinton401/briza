import {FC} from 'react'
import { FormWrapper } from "@/components/auth/form-wrapper";
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
const VerifyEmailPage: FC<{searchParams: {
  redirect?: string
}}> = async({searchParams}) => {
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
