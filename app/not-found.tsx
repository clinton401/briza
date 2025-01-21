import { FC } from "react";
import errorImg from "../public/error.gif";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Images } from "@/components/images";
const NotFound: FC = () => {
  return (
    <main className="w-full min-h-dvh flex flex-col items-center px-[5%]  py-8 justify-center gap-4">
      <div className="w-[100px] aspect-square relative">
        <Images imgSrc={errorImg} alt="error gif" gif />
      </div>

      <h1 className="font-cinzel font-black text-center text-3xl">
        Oops! Page Not Found
      </h1>
      <p className="text-center">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>

      <Button asChild>
        <Link href="/">Go Back Home</Link>
      </Button>
    </main>
  );
};

export default NotFound;
