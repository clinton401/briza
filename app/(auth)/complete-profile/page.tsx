import { FC } from "react";
import { notable } from "@/lib/fonts";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
export const metadata = {
  title: 'Complete Your Profile',
  description: 'Set up your Briza profile to start sharing and connecting with others on the platform.',
};

const CompleteProfilePage: FC = () => {
   
  return (
    <div className="flex flex-col items-center px-p-half py-8  min-h-dvh w-full ">
      <div className="flex flex-col items-center  lg:w-[50%] max-w-[600px] w-full gap-6">
      <h2 className={`${notable.className} w-full text-center  text-xl sm:text-2xl`}>
           Complete your profile
          </h2>
          
      <CompleteProfileForm/>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
