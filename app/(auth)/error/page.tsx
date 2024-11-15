import {FC} from 'react';
import { FormWrapper } from "@/components/auth/form-wrapper";
import {FormError} from "@/components/form-error"

const ErrorPage: FC = () => {
  return (
    <FormWrapper title=" Something went wrong"
    backButtonLinkText="Back to login"
    backButtonUrl={`/login`}>
      <FormError message="Sign in unsuccessful" />
    </FormWrapper>
  )
}

export default ErrorPage
