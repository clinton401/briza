"use client"
import {FC, useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {LoginSchema} from "@/schemas"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { LoadingButton } from "@/components/auth/loading-button";
import Link from "next/link";
import useGetRedirectUrl from "@/hooks/use-get-redirect-url";
import  useCountdown  from "@/hooks/use-countdown";
import { useRouter } from "next/navigation";
import {login} from "@/actions/login"
import useIsTyping from "@/hooks/use-is-typing";
import {regenerateTwoFAToken} from "@/actions/regenerate-two-fa-tokens";
import { RegenerateButton } from "@/components/auth/regenerate-button";
export const LoginForm: FC = () => {
    const [is2FA, setIs2FA] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isNewEmailPending, setIsNewEmailPending] = useState(false);
  const { error, setError, success, setSuccess, isTyping, setIsTyping } =
    useIsTyping();
    const {
      isNewClicked: isResendClicked,
      setIsNewClicked: setIsResendClicked,
      countdown: resetCounter,
    } = useCountdown();
  const redirect = useGetRedirectUrl();
  const {push } = useRouter();
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
            twoFA: is2FA ? "" : undefined,
        },
      })

      async function loginHandler(values: z.infer<typeof LoginSchema>) {
        try{
          setIsPending(true);
          setError(undefined); 
          setSuccess(undefined);
          const data = await login(values, redirect, is2FA);
          const {error, success, redirectUrl, isTwoFA} = data;
            setError(error); 
        
            setSuccess(success); 
            if(isTwoFA) {
              setIs2FA(true);
            }
         
          if(redirectUrl) {
            setTimeout(() => {
              window.location.href = redirectUrl;
              // push(redirectUrl)

            }, 1500)
          }
         }catch(error) {
          console.error(error)
          setSuccess(undefined);
          setError("An unexpected error occurred.");
          console.error(error)
        } finally {
          setIsPending(false);
        }
      
    }

    const regenerateCode = async () => {
      const emailValue = form.watch('email');
      if(!emailValue || typeof emailValue !== "string" ) {
        setError("Invalid email");
        setSuccess(undefined);
        return ;
      }
      try{
        setIsNewEmailPending(true);
        setIsResendClicked(false);
        setError(undefined);
        setSuccess(undefined);
       const data =  await  regenerateTwoFAToken(emailValue);
       const {error, success} = data;
       setError(error);
       setSuccess(success);
    if(success) {
      setIsResendClicked(true);
    } else {
      setIsResendClicked(false);
    }
      } catch(error){
  console.error(error);
  setIsResendClicked(false);
  } finally {

    setIsNewEmailPending(false);
  }
};

  return (
    <div>
    <Form {...form}>
    <form onSubmit={form.handleSubmit(loginHandler)} className="space-y-4">
    <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                  onInput={() => setIsTyping(true)}
                    placeholder="janesmith@example.com "
                    disabled={isPending || is2FA}
                    type="email"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                  // onInput={() => setIsTyping(true)}
                    placeholder="******"
                    disabled={isPending || is2FA}
                    type="password"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          {is2FA && (
            <FormField
              control={form.control}
              name="twoFA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Two-Factor Authentication Code</FormLabel>
                  <FormControl>
                    <Input 
                    onInput={() => setIsTyping(true)} placeholder="******" disabled={isPending } {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
           <div className="flex items-center justify-end w-full">
            <Button
              size="sm"
              variant="link"
              asChild
              className="px-0 font-normal"
            >
              <Link
                href={`/reset${
                  redirect ? `?redirect=${encodeURIComponent(redirect)} ` : ""
                }`}
              >
                Forgot Password
              </Link>
            </Button>
          </div>
          {error && <FormError message={error}/>}
          {success && <FormSuccess message={success} />}
      <LoadingButton
            message={"Login"}
            disabled={isPending || isNewEmailPending}
            isPending={isPending}
          />
    </form>
  </Form>
  {is2FA && (
        <div className="w-full gap-4 flex flex-col justify-center items-center pt-4">
          <p className="text-xs w-full text-center">Didn&apos;t send code yet?</p>
          <RegenerateButton
            disabled={isNewEmailPending || isPending}
            isNewEmailPending={isNewEmailPending}
            isResendClicked={isResendClicked}
            resendCode={regenerateCode}
            resetCounter={resetCounter}
          />
        </div>
      )}
  </div>
  )
}
