"use client";
import { FC, useState, useRef } from "react";
import type { UploadedMediaDetails, SessionType } from "@/lib/types";
import { User2, Image, Video, Smile, X, Loader } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiSelector } from "@/components/emoji-selector";
import createToast from "@/hooks/create-toast";
import { Videos } from "@/components/videos";
// import { MiniLoader } from "@/components/mini-loader";
import { TooltipComp } from "@/components/tooltip-comp";
import {useRouter} from "next/navigation";
import axios from "axios";
import { Images } from "../images";
import { createPost } from "@/actions/create-post";
import { unknown_error } from "@/lib/variables";
import handleTextAreaHeight from "@/hooks/handle-text-area-height";
import { useQueryClient } from '@tanstack/react-query';
type EmojiData = {
  emoji: string;
};
export const CreatePostUI: FC<{ session: SessionType, borderNeeded?: boolean, closeHandler?: () => void }> = ({ session, borderNeeded = true, closeHandler }) => {
  const [content, setContent] = useState("");
  const [isPostPending, setIsPostPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audience] = useState<"PUBLIC" | "FOLLOWERS">("PUBLIC");
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO" | "NONE">(
    "NONE"
  );
  const [uploadedImagesDetails, setUploadedImagesDetails] = useState<
    UploadedMediaDetails[]
  >([]);

  const [uploadedVideoDetails, setUploadedVideoDetails] = useState<
    undefined | UploadedMediaDetails
  >(undefined);
  const {textareaRef, handleInput} = handleTextAreaHeight();
  const imageInputRef = useRef<null | HTMLInputElement>(null);
  const videoInputRef = useRef<null | HTMLInputElement>(null);
  const { createSimple, createError, createWithAction } = createToast();
  const queryClient = useQueryClient();
  const {push} = useRouter()
  // const handleInput = () => {
  //   if (!textareaRef || !textareaRef?.current) return null;
  //   textareaRef.current.style.height = "auto";
  //   textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  // };
  const handleEmojiClick = (emojiData: EmojiData) => {
    if (!textareaRef || !textareaRef?.current) return null;
    const { emoji } = emojiData;
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    setContent(`${textBeforeCursor}${emoji}${textAfterCursor}`);
  };

  const uploadToCloudinary = async (
    image: File,
    type = "image"
  ): Promise<UploadedMediaDetails | null> => {
    const upload_preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
    const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!upload_preset || !cloud_name) {
      throw new Error("Cloudinary configuration is not set");
      return null;
    }

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", upload_preset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/${type}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
      };
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      return null;
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileInput = event.target;
    if (isPostPending)
      return createError(
        "Post is being sent. Please wait until it's completed."
      );
    if (uploading)
      return createError(
        "A file is currently uploading. Please wait for it to finish."
      );
    if (mediaType === "VIDEO")
      return createError(
        "A video has already been selected. Please clear it before uploading an image."
      );
    if (!fileInput.files || fileInput.files.length === 0) {
      createError("No Image selected.");
      return;
    }
    const files = Array.from(fileInput.files);
    const hasInvalidFile = files.some(
      (file) => !file.type.startsWith("image/")
    );
    if (hasInvalidFile)
      return createError(
        "All files must be images, or click the video icon to add a video."
      );

    const newImages = [...uploadedImagesDetails, ...files];
    if (newImages.length > 4) {
      createError("You can only upload up to 4 images.");
      return;
    }
    try {
      setUploading(true);
      setMediaType("IMAGE");
      setUploadedVideoDetails(undefined);
      const uploadPromises = files.map((image) =>
        uploadToCloudinary(image).catch((error) => {
          console.error(`Error uploading image:`, error);
          return null;
        })
      );
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((upload) => {
        return upload !== null;
      });
      const uploadsWithCorrectDetails = successfulUploads.filter((upload) => {
        return upload.publicId && upload.url;
      });

      if (uploadsWithCorrectDetails.length > 0) {
        if (uploadsWithCorrectDetails.length < files.length) {
          createSimple(
            `Image(s) uploaded successfully. ${
              files.length - uploadsWithCorrectDetails.length
            } images failed to upload.`
          );
        }
        setUploadedImagesDetails((prev) => [
          ...prev,
          ...uploadsWithCorrectDetails,
        ]);
      } else {
        createError("No valid images were uploaded.");
      }
    } catch (error) {
      console.error(`Unable to upload images: ${error}`);
      createError("An unknown error occurred while uploading.");
    } finally {
      setUploading(false);
    }
  };
  const handleVideoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileInput = event.target;
    if (isPostPending)
      return createError(
        "Post is being sent. Please wait until it's completed."
      );
    if (uploading)
      return createError(
        "A file is currently uploading. Please wait for it to finish."
      );
    if (mediaType === "IMAGE")
      return createError(
        "An image has already been selected. Please clear it before uploading a video."
      );
    if (!fileInput.files || fileInput.files.length === 0) {
      createError("No video selected.");
      return;
    }

    const videoFile = fileInput.files[0];

    if (videoFile.size > 50 * 1024 * 1024) {
      createError(
        "Video is too large. Max size is 50MB.",
        "Video size limit exceeded"
      );
      return;
    }

    if (!/^video\/(mp4|ogg|webm)$/i.test(videoFile.type)) {
      createError(
        "Invalid video format. Only MP4, Ogg, and WebM are allowed.",
        "Invalid video format"
      );
      return;
    }
    const videoDuration = await getVideoDuration(videoFile);

    if (videoDuration > 2 * 60) {
      createError(
        "Video exceeds the maximum allowed duration of 2 minutes.",
        "Video duration limit exceeded"
      );
      return;
    }

    try {
      setUploading(true);
      setMediaType("VIDEO");
      setUploadedImagesDetails([]);

      const videoDetails = await uploadToCloudinary(videoFile, "video");

      if (videoDetails === null) {
        createError("Failed to upload video.");
        return;
      }

      setUploadedVideoDetails(videoDetails);

      createSimple("Video uploaded successfully!");
    } catch (error) {
      console.error(`Unable to upload video: ${error}`);
      createError("An unknown error occurred while uploading.");
    } finally {
      setUploading(false);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement("video");
      videoElement.src = URL.createObjectURL(file);

      videoElement.onloadedmetadata = () => {
        // Return duration in seconds
        resolve(videoElement.duration);
      };

      videoElement.onerror = (error) => {
        reject(new Error("Failed to load video duration"));
      };
    });
  };

  const handleRemoveImage = (url: string) => {
    if (isPostPending)
      return createError(
        "Post is being sent. Please wait until it's completed."
      );
    if (uploadedImagesDetails.length < 1) return null;
    const newUploadedDetails = uploadedImagesDetails.filter((upload) => {
      return upload.url !== url;
    });
    const imagesLength = uploadedImagesDetails.length;
    if (imagesLength === 1) setMediaType("NONE");
    setUploadedImagesDetails(newUploadedDetails);
  };
  const handleRemoveVideo = () => {
    if (isPostPending)
      return createError(
        "Post is being sent. Please wait until it's completed."
      );
    setUploadedVideoDetails(undefined);
    setMediaType("NONE");
  };
  const handleInputClick = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (isPostPending)
      return createError(
        "Post is being sent. Please wait until it's completed."
      );
    if (inputRef && inputRef.current && !uploading) {
      inputRef.current.click();
    }
  };
  
  const submitHandler = async () => {
    if (isPostPending)
      return createError(
        "Post is being sent. Please wait until it's completed."
      );
    if (uploading)
      return createError(
        "A file is currently uploading. Please wait for it to finish."
      );

    if (
      content.length < 1 &&
      uploadedImagesDetails.length < 1 &&
      uploadedVideoDetails === undefined
    )
      return createError("Image, video, or text is required. ");
    try {
      setIsPostPending(true);
      const postData = {
        content,
        audience,
        mediaType,
        uploadedImagesDetails,
        uploadedVideoDetails
      }
      const result = await createPost(postData);
      const {error, success, data} = result;
      if(error) return createError(error);
      if(!success || !data) return createError(unknown_error);
      await queryClient.invalidateQueries(
        {
          queryKey: ['posts'], 
          exact: true,     
          refetchType: 'active', 
        },
        {
          throwOnError: true,  
          cancelRefetch: true,  
        }
      );
      
      const actionHandler = () =>{
        push(`/status/${data.id}`);
          }

      createWithAction(success, "Check out your post", "View", actionHandler);
      
      setContent("");
      setUploadedImagesDetails([]);
      setUploadedVideoDetails(undefined);
      setMediaType("NONE");
      if (textareaRef && textareaRef?.current){
        textareaRef.current.style.height = "40px"
      }
      if(closeHandler) {
        closeHandler()
      }
     
      // push(`/status/${data.id}`);
    } catch (error) {
      console.error("Error creating post:", error);
      return createError("An error occurred while creating the post.");
    } finally {
      setIsPostPending(false);
    }
  };
  return (
    <section className={`w-full ${borderNeeded ? "border-y" : ""} relative flex  px-p-half  py-4 gap-4 `}>
      <Avatar>
        <AvatarImage src={session?.profilePictureUrl || ""} alt="User profile picture" />
        <AvatarFallback>
          <User2 />
        </AvatarFallback>
      </Avatar>
      <div className="grow  flex flex-col gap-4  ">
        <Textarea
          placeholder="Share something"
          spellCheck={false}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-[40px]  min-h-[40px] max-h-[400px] resize-none overflow-hidden"
          ref={textareaRef}
          disabled={isPostPending}
          onInput={handleInput}
        />
    
        {uploading && (
          <div className="w-full justify-center flex  items-center ">
             <Loader className="mr-2 h-4 w-4 animate-spin"/>
            
          </div>
        )}
        {mediaType === "VIDEO" &&
          uploadedVideoDetails &&
          uploadedImagesDetails.length < 1 && (
            <div className="w-full aspect-video relative">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full absolute z-[500] top-2 right-2"
                onClick={handleRemoveVideo}
                disabled={uploading || isPostPending}
              >
                <X />
              </Button>
              <Videos url={uploadedVideoDetails.url} />
            </div>
          )}
        {mediaType === "IMAGE" &&
          uploadedVideoDetails === undefined &&
          uploadedImagesDetails.length > 0 && (
            <div className="w-full flex flex-wrap gap-4 aspect-video relative">
              {uploadedImagesDetails.map((images) => {
                return (
                  <div
                    key={images.url}
                    className="create_post_images aspect-square relative"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full absolute z-[500] top-2 right-2"
                      disabled={uploading || isPostPending}
                      onClick={() => handleRemoveImage(images.url)}
                    >
                      <X />
                    </Button>
                    <Images alt="Post images" imgSrc={images.url} />
                  </div>
                );
              })}

              {/* <Videos url={uploadedVideoDetails.url} /> */}
            </div>
          )}
        {/* </div> */}
        <div className="flex items-center gap-2 flex-wrap justify-between">
          <span className="flex  items-center gap-2 flex-wrap">
            <TooltipComp text={"Upload images"}>
              <Button
                className="bg-transparent h-8 w-8 flex items-center justify-center text-foreground rounded-full "
                onClick={() => handleInputClick(imageInputRef)}
                disabled={
                  uploadedImagesDetails.length >= 4 ||
                  uploading ||
                  mediaType === "VIDEO" ||
                  isPostPending
                }
              >
                <Image className="text-sm h-4 aspect-square" />
              </Button>
            </TooltipComp>
            <TooltipComp text={"Upload a video"}>
              <Button
                className="bg-transparent h-8 w-8 flex items-center justify-center text-foreground rounded-full "
                onClick={() => handleInputClick(videoInputRef)}
                disabled={
                  uploadedVideoDetails !== undefined ||
                  uploading ||
                  isPostPending ||
                  mediaType === "IMAGE"
                }
              >
                <Video className="text-sm h-4 aspect-square" />
              </Button>
            </TooltipComp>
            <EmojiSelector
            content={content}
            setContent={setContent}
            ref={textareaRef}
          >
            {/* <TooltipComp text="Add an emoji"> */}
            <Button
              className="bg-transparent h-8 w-8  text-foreground rounded-full "
              disabled={isPostPending}
            >
              <Smile className="text-sm h-4 aspect-square" />
            </Button>
            {/* </TooltipComp> */}
          </EmojiSelector>
            {/* <TooltipComp text="Add an emoji">
              <Button
                className="bg-transparent h-8 w-8 flex items-center justify-center text-foreground rounded-full "
                disabled={isPostPending}
                onClick={() => setShowPicker((prev) => !prev)}
              >
                <Smile className="text-sm h-4 aspect-square" />
              </Button>
            </TooltipComp> */}
            {/* <TooltipComp text="Select an audience">
              <Button className="bg-transparent h-8 w-8 flex items-center justify-center text-foreground rounded-full ">
                <Earth className="text-sm h-4 aspect-square" />
              </Button>
            </TooltipComp> */}
          </span>
          <span className="flex gap-2 items-center ">
            <Button
              className="rounded-full"
              disabled={
                (content.length < 1 &&
                  uploadedImagesDetails.length < 1 &&
                  uploadedVideoDetails === undefined) ||
                uploading ||
                isPostPending
              }
              onClick={submitHandler}
            >
              {isPostPending ? <Loader className=" h-4 w-4 animate-spin"/> : "Post"}
            </Button>
          </span>
        </div>
      </div>
   
      <Input
        type="file"
        multiple
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
        // disabled={
        //   uploadedImagesDetails.length >= 4 ||
        //   uploading ||
        //   mediaType === "IMAGE"
        // }
      />
      <Input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/mp4, video/ogg, video/webm"
        onChange={handleVideoChange}
        // disabled={
        //   uploadedVideoDetails !== undefined ||
        //   uploading ||
        //   mediaType === "IMAGE"
        // }
      />
    </section>
  );
};
