"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import createToast from "@/hooks/create-toast";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionType } from "@/lib/types";
import { updateSettingsDetails } from "@/actions/update-settings-details";
import { unknown_error } from "@/lib/variables";
// import { update } from "next-auth/react";
// import {update}

 const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50, {
      message: "Name must not be longer than 50 characters.",
    })
    .optional(),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileSettings({ session }: { session: SessionType }) {
  const [isLoading, setIsLoading] = useState(false);
  const { createSimple, createError } = createToast();
  const defaultValues: Partial<ProfileFormValues> = {
    name: session.name,
    email: session.email,
    // phone: session.p,
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ProfileFormValues) {
    const isNothingChanged =
      data.name === session.name && data.email === session.email;

    if (isNothingChanged) {
      createError("No changes were made to your profile.", "No changes");
      return;
    }

    try {
      setIsLoading(true);
      const error_message = await updateSettingsDetails(data);
      if (error_message) {
        createError(error_message);
        return;
      }
      // refresh()
      // await update();
      
      createSimple(
        "Your profile has been updated successfully.",
        "Profile updated"
      );
    } catch (error) {
      console.error(`Unable to update user details: ${error}`);
      createError(unknown_error);
    } finally {
      setIsLoading(false);
    }
  }
  const createdAtDate = new Date(session.createdAt ?? new Date());
  const formatCreatedAt = createdAtDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  function formatLastLogin(): string {
    const date = new Date(session.lastLogin ?? session.createdAt ?? new Date());
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const timeString = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) {
      return `Today at ${timeString}`;
    }

    if (isYesterday) {
      return `Yesterday at ${timeString}`;
    }

    const dateString = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `${dateString} at ${timeString}`;
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Update your personal information.
          </p>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Your name" {...field} />
                  </FormControl>
                  <FormDescription>Your full name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormDescription>Your email address.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormDescription>Your contact phone number.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <div className="flex justify-end gap-2">
              {/* <Button variant="outline">Cancel</Button> */}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </div>
          </form>
        </Form>

        <Separator className="my-6" />

        <div>
          <h3 className="text-lg font-medium mb-4">Account Information</h3>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Account Details</CardTitle>
              <CardDescription>
                Information about your Briza account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Account ID
                  </p>
                  <p className="text-sm">{session.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Account Type
                  </p>
                  <p className="text-sm">Regular</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created On
                  </p>
                  <p className="text-sm">{formatCreatedAt}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Login
                  </p>
                  <p className="text-sm">{formatLastLogin()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <p className="text-sm">
                      {session.isSuspended ? "Suspended" : "Active"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verification
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <p className="text-sm">
                      {session.isVerified ? "Verified" : "Unverified"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
