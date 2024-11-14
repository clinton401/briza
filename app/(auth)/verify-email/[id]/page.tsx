import {FC} from 'react'
import { FormWrapper } from "@/components/auth/form-wrapper";
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
const VerifyEmailPage: FC = () => {
  return (
    <FormWrapper title="Verify your email"
    backButtonLinkText="Back to login"
    backButtonUrl="/login"
    >
      <VerifyEmailForm/>
    </FormWrapper>
  )
}

export default VerifyEmailPage
