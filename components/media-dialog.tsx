import { FC, Dispatch, SetStateAction, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PostMetrics } from "@/components/post/post-metrics";
import type { ImageModal, PostMetricsTypes } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Images } from "@/components/images";
type MediaDialogProps = {
  isOpen: boolean;
  closeModal: (e: React.MouseEvent<HTMLDivElement>) => void;
  media: ImageModal[];
  isPostMedia?: boolean;
  postMetrics?: PostMetricsTypes;
  setHasLiked?: Dispatch<SetStateAction<boolean>>;
  setHasBookmarked?: Dispatch<SetStateAction<boolean>>;
  hasLiked?: boolean;
  hasBookmarked?: boolean;
};

export const MediaDialog: FC<MediaDialogProps> = ({
  isOpen,
  closeModal,
  media,
  isPostMedia = true,
  postMetrics,
  setHasLiked,
  setHasBookmarked,
  hasLiked,
  hasBookmarked,
}) => {
  // useEffect(() => {

  //   if (isOpen) {
  //     document.body.style.height = "100dvh";
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.height = "auto";
  //     document.body.style.overflow =  "auto";
  //   }

  // }, [isOpen]);

  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };
  return (
    <div
      className="bg-black/80 z-[5000] fixed top-0 left-0 w-full px-p-half py-8 h-dvh overflow-x-hidden overflow-y-auto"
      onClick={closeModal}
    >
      <div className="w-full flex  items-center flex-col gap-6 justify-center relative  h-full ">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full absolute inset-0 "
        >
          <X />
        </Button>
        {media.length === 1 && (
          <div
            className="relative w-full aspect-square md:aspect-video overflow-hidden md:w-3/4"
            onClick={stopPropagation}
          >
            <Images alt="Dialog image" imgSrc={media[0].url} />
          </div>
        )}
        {media.length > 1 && (
          <div className="w-full flex items-center justify-center" onClick={stopPropagation}>
          <div className=" w-3/4" >
            {" "}
            <Carousel className="w-full ">
              <CarouselContent>
                {media.map((file, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full aspect-square md:aspect-video overflow-hidden ">
                      <Images alt="Dialog image" imgSrc={file.url} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          </div>
        )}

        {isPostMedia &&
          postMetrics &&
          hasLiked !== undefined &&
          setHasLiked &&
          hasBookmarked !== undefined &&
          setHasBookmarked && (
            <section
              className="w-full md:w-1/2 absolute bottom-0 left-1/2 translate-x-[-50%] bg-black/80 p-2 rounded-t-md "
              onClick={(e: React.MouseEvent<HTMLOptionElement>) =>
                e.stopPropagation()
              }
            >
              {" "}
              <PostMetrics
                metrics={postMetrics}
                hasLiked={hasLiked}
                setHasLiked={setHasLiked}
                hasBookmarked={hasBookmarked}
                setHasBookmarked={setHasBookmarked}
              />
            </section>
          )}
      </div>
    </div>
  );
};
