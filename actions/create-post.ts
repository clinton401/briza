"use server";
import { prisma } from "@/lib/db";
import type { UploadedMediaDetails } from "@/lib/types";
import { createErrorResponse } from "@/lib/random-utils";
import getServerUser from "@/hooks/get-server-user";
import { unauthorized_error } from "@/lib/variables";

import getUserIpAddress from "@/hooks/get-user-ip-address";
import { rateLimit } from "@/lib/rate-limits";
type CreatePostTypes = {
  content: string;
  audience: "PUBLIC" | "FOLLOWERS";
  mediaType: "IMAGE" | "VIDEO" | "NONE";
  uploadedImagesDetails: UploadedMediaDetails[];
  uploadedVideoDetails: UploadedMediaDetails | undefined;
};
enum MediaType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
  }
export const createPost = async (postData: CreatePostTypes) => {
  const session = await getServerUser();
  if (!session) return createErrorResponse(unauthorized_error);
  const {
    content,
    audience,
    mediaType,
    uploadedImagesDetails,
    uploadedVideoDetails,
  } = postData;
  console.log(postData)
  const { error } = rateLimit(session.id, true);
  if (error) return createErrorResponse(error);
  if (
    content.length < 1 &&
    uploadedImagesDetails.length < 1 &&
    uploadedVideoDetails === undefined
  )
    return createErrorResponse("Image, video, or text is required.");
try{
    const result = await prisma.$transaction(async (tx) => {
        
        const post = await tx.post.create({
          data: {
            content,
            audience,
            userId: session.id,
          },
        });
  
        
        if (mediaType === "IMAGE"  && uploadedImagesDetails.length > 0) {
          const imageMediaData = uploadedImagesDetails.map((image) => ({
            postId: post.id,
            mediaType: MediaType.IMAGE,
            mediaUrl: image.url,
            mediaPublicId: image.publicId,
          }));
  
          await tx.postMedia.createMany({
            data: imageMediaData,
          });
        } else if (mediaType === "VIDEO" && uploadedVideoDetails) {
          await tx.postMedia.create({
            data: {
              postId: post.id,
              mediaType: MediaType.VIDEO,
              mediaUrl: uploadedVideoDetails.url,
              mediaPublicId: uploadedVideoDetails.publicId,
            },
          });
        }
  
       
        await tx.userMetrics.upsert({
            where: { userId: session.id },
            create: { userId: session.id, postCount: 1 },
            update: { postCount: { increment: 1 } },
          });
          
  
        // 4. Initialize PostMetrics
        await tx.postMetrics.upsert({
            where: { postId: post.id },
            create: {
              postId: post.id,
            },
            update: {},
          });
        return post;
    });
console.log(result);
return {
    error: undefined,
    success: "Post created successfully!"
}
}catch(err) {
    console.error("Error creating post:", err);
    return createErrorResponse("An error occurred while creating the post.");
}

};
