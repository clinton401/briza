"use client";
import { FC, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ResetSchema } from "@/schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { LoadingButton } from "@/components/auth/loading-button";
import useGetRedirectUrl from "@/hooks/use-get-redirect-url";
import { useRouter } from "next/navigation";
import useIsTyping from "@/hooks/use-is-typing";
export const ResetForm: FC = () => {
  const [isPending, setIsPending] = useState(false);
  const [isNewEmailPending, setIsNewEmailPending] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const { error, setError, success, setSuccess, isTyping, setIsTyping } =
    useIsTyping();
  const redirect = useGetRedirectUrl();
  const { push } = useRouter();
  const form = useForm<z.infer<ReturnType<typeof ResetSchema>>>({
    resolver: zodResolver(ResetSchema(isCodeSent)),
    defaultValues: {
      email: "",
      otp: isCodeSent ? "" : undefined,
      newPassword: isCodeSent ? "" : undefined,
    },
  });
  const resetHandler = async (
    values: z.infer<ReturnType<typeof ResetSchema>>
  ) => {
    console.log(values);
    setIsCodeSent(!isCodeSent);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(resetHandler)} className="space-y-4">
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
                  disabled={isCodeSent || isPending}
                  type="email"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        {isCodeSent && (
          <>
            {" "}
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input
                    onInput={() => setIsTyping(true)}
                      placeholder="******"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                    onInput={() => setIsTyping(true)}
                      placeholder="******"
                      type="password"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
        <LoadingButton
          message={isCodeSent ? "Confirm" : "Verify"}
          isPending={isPending || isNewEmailPending}
        />
      </form>
    </Form>
  );
};
