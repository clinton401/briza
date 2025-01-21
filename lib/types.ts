export type SessionType = {
  id: string;
  username?: string;
  name: string;
  email: string;
  bio?: string;
  profilePictureUrl?: string;
  coverPhotoUrl?: string;
  verifiedDate?: Date;
  isVerified?: boolean;
  isSuspended?: boolean;
  suspendCount?: number;
  suspendedDate?: Date;
  suspendReason?: string;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  googleId?: string;
  twoFactorAuthentication?: boolean;
  isPasswordAvailable?: boolean;
};

export type UploadedMediaDetails = {
  url: string;
  publicId: string;
};
export type NotFollowedUsers = {
  id: string;
  username: string | null;
  name: string;
  profilePictureUrl: string | null;
  profilePicturePublicId: string | null;
  bio: string | null;
  createdAt: Date;
  blueCheckVerified: boolean;
  hasFollowed: boolean;
};
export type PostWithDetails = {
  id: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  isEdited: boolean;
  audience: "PUBLIC" | "FOLLOWERS" ; 
  userId: string;
  user: {
    id: string;
    username: string | null;
    name: string;
    // email: string;
    bio: string | null;
    profilePictureUrl: string | null;
    blueCheckVerified: boolean
    createdAt: Date;
  };
  metrics: {
    id: string;
    postId: string;
    likesCount: number | null ;
    commentsCount: number | null ;
    bookmarksCount: number | null ;
    viewsCount: number | null ;
  } | null;
  media: Array<{
    id: string;
    mediaUrl: string;
    mediaType: "IMAGE" | "VIDEO" ;
    mediaPublicId: string | null
  }> | null;
  hasLiked: boolean,
  hasBookmarked: boolean;
  isFollowing: boolean;

};
export type PostMetricsTypes =  {
  id: string;
  postId: string;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  viewsCount: number;
};
export type ImageModal = {
id: string,
url: string,


}

export type CommentWithUserAndFollowers = {
  id: string;
  content: string;
  createdAt: Date;
  parentCommentId: string | null;
  hasLiked: boolean;
  metrics: {
    id: string;
    likesCount: number | null;
    repliesCount: number | null;
  } | null;
  user: {
    id: string;
    name: string; 
    profilePictureUrl: string | null;
    bio: string | null;
    username: string | null;
    createdAt: Date;
    blueCheckVerified: boolean;
    followers: {
      id: string;
      followingId: string;
    }[];
  };
};
export enum NotificationType {
  REPLY = "REPLY",
  COMMENT = "COMMENT",
  
  LIKE_COMMENT = "LIKE_COMMENT",
  LIKE = "LIKE",
  FOLLOW = "FOLLOW",
  SYSTEM = "SYSTEM",
  TAG = "TAG"
}
export type NotificationWithTriggeredBy = {
  id: string;
  isRead: boolean;
  createdAt: Date;
  type: NotificationType; 
  url: string;
  triggeredById: string;
  userId: string;
  triggeredBy: {
    id: string;
    name: string;
    profilePictureUrl: string | null;
    bio: string | null;
    username: string | null;
    createdAt: Date;
    blueCheckVerified: boolean;
  } | null;
};



