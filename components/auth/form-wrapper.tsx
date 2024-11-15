import {FC, ReactNode} from 'react'
import { notable } from "@/lib/fonts";
import logo from "../../public/logo.png";
import { Images } from "@/components/images";
import Link from "next/link";
import { Social } from "@/components/auth/social";
type FormWrapperProps = {
    children: ReactNode;
    title: string
    backButtonText?: string;
    backButtonLinkText: string;
    backButtonUrl: string;
    showSocial?: boolean,
    
}


export const FormWrapper: FC<FormWrapperProps> = ({children, title, backButtonText, backButtonLinkText, backButtonUrl, showSocial = false}) => {

  
  return (
<div className="flex flex-col items-center px-p-half py-8 justify-center min-h-dvh w-full gap-4">
      <div className="flex flex-col  lg:w-[50%] max-w-[500px] w-full gap-4">
        <span className="relative w-[80px] aspect-square overflow-hidden ">
          <Images imgSrc={logo} alt="website logo" />
        </span>
        <span className="w-full flex flex-col gap-2 ">
          <h2 className={`${notable.className}  text-xl sm:text-2xl`}>
           {title}
          </h2>
          <p className="flex flex-wrap text-sm items-center">
         {backButtonText && backButtonText}
            <Link href={backButtonUrl} className={` ${backButtonText ? "ml-1" : ""} text-primary`}>
           {backButtonLinkText}
            </Link>
          </p>
        </span>
        {showSocial && <Social/>}



        {children}
      </div>
      
    </div>
  )
}
