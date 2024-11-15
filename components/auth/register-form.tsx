"use client"
import {FC, useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {RegisterSchema} from "@/schemas"
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
import useGetRedirectUrl from "@/hooks/use-get-redirect-url";
import {register} from "@/actions/register"
import useIsTyping from "@/hooks/use-is-typing";
import {useRouter} from "next/navigation";
export const RegisterForm: FC = () => {
    const [isPending, setIsPending] = useState(false);
  const redirect = useGetRedirectUrl();
  const { error, setError, success, setSuccess, isTyping, setIsTyping } =
  useIsTyping();
  const {push} = useRouter();
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const registerHandler = async(values: z.infer<typeof RegisterSchema>) => {
    try{
      setIsPending(true);
      setError(undefined); 
      setSuccess(undefined);
      const data = await register(values, redirect);
      const {error, success, redirectUrl} = data;
  
        setError(error); 
 
      
        setSuccess(success); 
     
      if(redirectUrl) {
        setTimeout(() => {
          push(redirectUrl);
        }, 1500);
      }
    }catch(error) {
      setSuccess(undefined);
      setError("An unexpected error occurred.");
      console.error(error)
    } finally {
      setIsPending(false);
    }
  }
    return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(registerHandler)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input onInput={() => setIsTyping(true)}  disabled={isPending} 
                    placeholder="janesmith@example.com "
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input onInput={() => setIsTyping(true)}  disabled={isPending}  placeholder="Jane smith " {...field} />
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
                  <Input onInput={() => setIsTyping(true)}  disabled={isPending}  placeholder="******" type="password" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          
          {error && <FormError message={error}/>}
          {success && <FormSuccess message={success} />}
       <LoadingButton isPending={isPending} message="Create account"/>
        </form>
      </Form>
    )
}