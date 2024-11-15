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

import useIsTyping from "@/hooks/use-is-typing";
export const LoginForm: FC = () => {
    const [is2FA, setIs2FA] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isNewEmailPending, setIsNewEmailPending] = useState(false);
  const { error, setError, success, setSuccess, isTyping, setIsTyping } =
    useIsTyping();
  const redirect = useGetRedirectUrl();
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
            twoFA: is2FA ? "" : undefined,
        },
      })

      function loginHandler(values: z.infer<typeof LoginSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
      
    }
  return (
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
                  onInput={() => setIsTyping(true)}
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
            isPending={isPending || isNewEmailPending}
          />
    </form>
  </Form>
  )
}
