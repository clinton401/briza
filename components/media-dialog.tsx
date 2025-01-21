import { FC, Dispatch, SetStateAction, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import type {  PostWithDetails } from "@/lib/types";
import {Modals} from "@/components/modals";
type MediaDialogProps = {
  isOpen: boolean;
  closeModal: (e?: React.MouseEvent<HTMLDivElement>) => void;
  media: ImageModal[];
  isPostMedia?: boolean;
  postMetrics?: PostMetricsTypes;
  setHasLiked?: Dispatch<SetStateAction<boolean>>;
  hasLiked?: boolean;
  postDetails: PostWithDetails;
  hasBookmarked?: boolean;
};

export const MediaDialog: FC<MediaDialogProps> = ({
  postDetails,
  isOpen,
  closeModal,
  media,
  isPostMedia = true,
  postMetrics,
  hasLiked,
  hasBookmarked,
}) => {


  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };
  return (
    
    <Modals isOpen={isOpen} closeModal={closeModal}>
        {media.length === 1 && (
          <div
            className="relative w-full aspect-square md:aspect-video overflow-hidden md:w-3/4"
            onClick={stopPropagation}
          >
            <Images alt="Dialog image" imgSrc={media[0].url} contain />
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
                      <Images alt="Dialog image" imgSrc={file.url} contain/>
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
          hasBookmarked !== undefined && (
            <section
              className="w-full md:w-1/2 absolute bottom-0 left-1/2 translate-x-[-50%] bg-black/80 p-2 rounded-t-md "
              onClick={(e: React.MouseEvent<HTMLOptionElement>) =>
                e.stopPropagation()
              }
            >
              {" "}
              <PostMetrics
              postDetails={postDetails}
                metrics={postMetrics}
                hasLiked={hasLiked}
                hasBookmarked={hasBookmarked}
              />
            </section>
          )}
          </Modals>
   
  );
};
