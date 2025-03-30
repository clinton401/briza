import { FC } from "react";
import { Videos } from "@/components/videos";
import { Images } from "@/components/images";
import useCloseOnEscKey from "@/hooks/use-close-on-esc-key";
import type { PostWithDetails } from "@/lib/types";

import { MediaDialog } from "@/components/media-dialog";
type MediaCardType = {
  metrics: {
    id: string;
    postId: string;
    likesCount: number;
    commentsCount: number;
    bookmarksCount: number;
    viewsCount: number;
  };
  media: {
    id: string;
    mediaUrl: string;
    mediaType: "IMAGE" | "VIDEO";
    mediaPublicId: string | null;
  };
  
  searchQuery?: string;
   searchFilter?: "TOP" | "LATEST" | "MEDIA",
};

export const MediaCard: FC<MediaCardType> = ({ media, metrics, searchQuery, searchFilter }) => {
    const { isOpen: openModal, setIsOpen: setOpenModal } = useCloseOnEscKey();
    const modalHandler = (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!e) return;
        e.stopPropagation();
        if (openModal === false) {
          document.body.style.height = "auto";
          document.body.style.overflow = "auto";
        }
        setOpenModal(!openModal);
      };
      const modalLinks = media.mediaType === "VIDEO" ? null : [{url: media.mediaUrl, id: media.id}];
  return (
    <>
      {media.mediaType === "VIDEO" ? (
        <div
          className="w-full max-h-[400px] aspect-video"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          <Videos url={media.mediaUrl} />
        </div>
      ) : (
        <div
        className="w-full max-h-[400px] aspect-square rounded-lg cursor-pointer "
        onClick={modalHandler}
      >
        <Images imgSrc={media.mediaUrl} alt={`Post Image`} />
      </div>
      )}
        {/* {openModal && modalLinks && (
          <MediaDialog
            isOpen={openModal}
            userId={session.id}
            closeModal={modalHandler}
            media={modalLinks}
            hasLiked={postDetails.hasLiked}
            hasBookmarked={postDetails.hasBookmarked}
            postMetrics={metrics}
            // postDetails={postDetails}
            searchQuery={searchQuery}
            searchFilter={searchFilter}
          />
        )} */}
    </>
  );
};
