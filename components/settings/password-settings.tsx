"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {  Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator";
import { unknown_error } from "@/lib/variables";
import { settingsPasswordReset } from "@/actions/settings-password-reset";
import createToast from "@/hooks/create-toast";

 const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    newPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

 type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function PasswordSettings() {
  const [isLoading, setIsLoading] = useState(false)
  
  const { createSimple, createError } = createToast();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  async function onSubmit(data: PasswordFormValues) {


    try{
      setIsLoading(true);
const error_message = await settingsPasswordReset(data);
if (error_message) {
  createError(error_message);
  return;
}

createSimple(
  "Your password has been updated successfully.",
  "Password updated"
);
form.reset();

    } catch(error){
      console.error(`Unable to update user password: ${error}`);
      createError(unknown_error);
      
    }finally {
      setIsLoading(false);

    }

  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Password</h3>
          <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  {/* <div className="relative"> */}
                    <FormControl>
                      <Input
                      disabled={isLoading}
                        placeholder="Enter your current password"
                        type={ "password"}
                        {...field}
                      />
                    </FormControl>
                    {/* <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showCurrentPassword ? "Hide password" : "Show password"}</span>
                    </Button> */}
                  {/* </div> */}
                  <FormDescription>Enter your current password to verify your identity.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  {/* <div className="relative"> */}
                    <FormControl>
                      <Input
                      disabled={isLoading}
                        placeholder="Enter your new password"
                        type={ "password"}
                        {...field}
                      />
                    </FormControl>
                    {/* <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
                    </Button> */}
                  {/* </div> */}
                  <FormDescription>Your new password must be at least 8 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  {/* <div className="relative"> */}
                    <FormControl>
                      <Input
                      disabled={isLoading}
                        placeholder="Confirm your new password"
                        type={ "password"}
                        {...field}
                      />
                    </FormControl>
                    {/* <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                    </Button> */}
                  {/* </div> */}
                  <FormDescription>Confirm your new password.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
