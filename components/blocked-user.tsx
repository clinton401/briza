"use client"
import React, { useState } from "react"
import {
  Shield,
  AlertCircle,
  Calendar,
  FileText,
  Mail,
  LogOut,
  Loader
} from "lucide-react";
import { SessionType } from "@/lib/types"
import { Button } from "@/components/ui/button";
import { MAX_SUSPEND_COUNT } from "@/lib/auth-utils";
import {notable} from "@/lib/fonts";
import createToast from "@/hooks/create-toast";
import { signOut } from "next-auth/react";

interface BlockedUserProps {
  session?: SessionType
  children: React.ReactNode
}


export const BlockedUser: React.FC<BlockedUserProps> = ({ session, children }) => {
  const [isPending, setIsPending ] = useState(false);
  const {createError, createSimple} = createToast();
  const isSuspended = session && 
    session?.suspendCount &&
    session.suspendCount >= MAX_SUSPEND_COUNT;


     const handleLogout = async () => {
      if(isPending) return;
        try {
          setIsPending(true)
          await signOut();
          createSimple("You have logged out successfully.");
    
          window.location.href = "/login";
          // router.push("/auth/login");
        } catch (error) {
          console.error(`Unable to logout: ${error}`);
          createError("There was a problem trying to logout");
        }finally{
          setIsPending(false)
        }
      };

      if(!isSuspended) return  <>{children}</>
      const supportEmail = "clintonphillips464@gmail.com";
      const subject = encodeURIComponent("Account Suspension Appeal");
      const body = encodeURIComponent(
        `Hello,\n\nMy account has been suspended and I would like to appeal or understand the reason. My session ID is ${session.id}.\n\nPlease let me know what steps I can take.\n\nThank you.`
      );

  return (
    <>
      <div className="min-h-dvh flex items-center justify-center px-p-half py-4">
        <div className="max-w-md w-full  rounded-lg shadow-lg   text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-100 p-4 rounded-full">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <h1 className={` ${notable.className} text-2xl font-black  mb-4`}>
            Account Access Restricted
          </h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Your account has been temporarily blocked from accessing this
            platform.
            {session?.suspendCount && session.suspendCount > 1 && (
              <span className="block mt-2 text-red-600 font-medium">
                This is your{" "}
                {session.suspendCount === 2
                  ? "2nd"
                  : session.suspendCount === 3
                  ? "3rd"
                  : `${session.suspendCount}th`}{" "}
                violation.
              </span>
            )}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-medium text-amber-800 text-sm mb-1">
                  What this means:
                </h3>
                <ul className="text-amber-700 text-sm space-y-1">
                  <li>• You cannot post or comment</li>
                  <li>• Your profile is hidden from others</li>
                  <li>• You cannot send messages</li>
                </ul>
              </div>
            </div>
          </div>

          {(session?.suspendedDate || session?.suspendReason) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-red-800 text-sm mb-3">
                Suspension Details
              </h3>
              <div className="space-y-2 text-left">
                {session.suspendedDate && (
                  <div className="flex items-start text-sm">
                    <Calendar className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-red-800">
                        Suspended on:{" "}
                      </span>
                      <span className="text-red-700">
                        {new Date(session.suspendedDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {session.suspendReason && (
                  <div className="flex items-start text-sm">
                    <FileText className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-red-800">Reason: </span>
                      <span className="text-red-700">
                        {session.suspendReason}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 items-center  flex-wrap justify-center ">
            <Button asChild>
              <a
                href={`mailto:${supportEmail}?subject=${subject}&body=${body}`}
                 className="w-full md:w-[200px]"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button  disabled={isPending} onClick={handleLogout} className="w-full md:w-[200px]">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
              {isPending && <Loader className="size-4 ml-2 animate-spin" />}
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {session?.suspendCount && session.suspendCount > 2
                ? "Multiple violations may result in permanent account suspension. Please review our community guidelines."
                : "If you believe this is an error, please contact our support team. We're here to help resolve any issues."}
            </p>
          </div>
        </div>
      </div>

      <div className="hidden">{children}</div>
    </>
  );
}

export default BlockedUser
