"use client";
import { FC, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Skeleton } from "@/components/ui/skeleton"
type ImagesProps = {
  imgSrc: string | StaticImageData;
  alt: string;
  detailsPg?: boolean;
};

export const Images: FC<ImagesProps> = ({ imgSrc, alt, detailsPg = false }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-full">
      <Image
        src={
          imgSrc 
        }
        alt={alt}
        placeholder={typeof imgSrc === "object" ? "blur" : "empty"}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`w-full h-full ${
          detailsPg ? "object-cover sm:object-contain" : "object-cover"
        } overflow-hidden rounded `}
        fill={true}
        onLoad={() => setIsLoading(false)} 
      />
      {isLoading && <Skeleton className="h-full w-full" />}
      
    </div>
  );
};
