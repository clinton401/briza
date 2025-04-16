import {FC} from 'react';
import { FormWrapper } from "@/components/auth/form-wrapper";
import {FormError} from "@/components/form-error";
export const metadata = {
  title: 'Something Went Wrong',
  description: 'An error occurred. Please try again or return to the login page.',
};


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
