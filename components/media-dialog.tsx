import { FC, Dispatch, SetStateAction } from "react";
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
import type { PostWithDetails } from "@/lib/types";
import { Modals } from "@/components/modals";
type MediaDialogProps = {
  isOpen: boolean;
  closeModal: (e?: React.MouseEvent<HTMLDivElement>) => void;
  media: ImageModal[];
  isPostMedia?: boolean;
  postMetrics?: PostMetricsTypes;
  setHasLiked?: Dispatch<SetStateAction<boolean>>;
  hasLiked?: boolean;
  postDetails?: PostWithDetails;
  hasBookmarked?: boolean;
  isProfilePic?: boolean;
  userId?: string;
  sessionId: string;

  searchQuery?: string;
  searchFilter?: "TOP" | "LATEST" | "MEDIA";
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
  searchFilter,
  searchQuery,
  isProfilePic = false,
  userId,
  sessionId
}) => {
  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };
  return (
    <Modals isOpen={isOpen} closeModal={closeModal}>
      {media.length === 1 && (
        <div
          className={`relative w-full aspect-square   ${
            isProfilePic
              ? "rounded-full max-w-[350px]"
              : "md:aspect-video md:w-3/4"
          }  overflow-hidden `}
          onClick={stopPropagation}
        >
          <Images
            alt="Dialog image"
            imgSrc={media[0].url}
            contain={!isProfilePic}
          />
        </div>
      )}
      {media.length > 1 && (
        <div
          className="w-full flex items-center justify-center"
          onClick={stopPropagation}
        >
          <div className=" w-3/4">
            {" "}
            <Carousel className="w-full ">
              <CarouselContent>
                {media.map((file, index) => (
                  <CarouselItem key={index}>
                    <div
                      className={`relative w-full aspect-square   ${
                        isProfilePic
                          ? "rounded-full max-w-[350px]"
                          : "md:aspect-video"
                      } overflow-hidden `}
                    >
                      <Images
                        alt="Dialog image"
                        imgSrc={file.url}
                        contain={!isProfilePic}
                      />
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
        postDetails &&
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
              userId={userId}
              metrics={postMetrics}
              sessionId={sessionId}
              hasLiked={hasLiked}
              hasBookmarked={hasBookmarked}
              searchQuery={searchQuery}
              searchFilter={searchFilter}
            />
          </section>
        )}
    </Modals>
  );
};
