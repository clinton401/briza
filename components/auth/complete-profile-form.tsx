"use client";
import { FC, useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import createToast from "@/hooks/create-toast";
import { cloudinaryUrl } from "@/lib/random-utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { unknown_error } from "@/lib/variables";
import { checkUsernameUnique } from "@/actions/check-username-unique";
import { Cross2Icon, CheckIcon } from "@radix-ui/react-icons";
import { DotLoader } from "@/components/dot-loader";
import { useDebouncedCallback } from "use-debounce";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MiniLoader } from "@/components/mini-loader";
import useGetRedirectUrl from "@/hooks/use-get-redirect-url";
import { completeProfileDetails } from "@/actions/complete-profile-details";

export const CompleteProfileForm: FC = () => {
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [formDetails, setFormDetails] = useState({
    username: "",
    bio: "",
    website: "",
    websiteName: "",
  });
  const [formErrors, setFormErrors] = useState<{
    usernameError: null | string;
    bioError: null | string;
    websiteError: null | string;
  }>({
    usernameError: null,
    bioError: null,
    websiteError: null,
  });
  const [uploadedDetails, setUploadedDetails] = useState<{
    profileUrl: null | string;
    profileId: null | string;
    coverUrl: null | string;
    coverId: null | string;
  }>({
    profileUrl: null,
    coverUrl: null,
    coverId: null,
    profileId: null,
  });

  const { createError, createSimple } = createToast();
  const profilePicRef = useRef<HTMLInputElement | null>(null);
  const coverPicRef = useRef<HTMLInputElement | null>(null);
  const redirect = useGetRedirectUrl();
  const { push } = useRouter();
  const { profileUrl, coverUrl, coverId, profileId } = uploadedDetails;
  const { usernameError, bioError, websiteError } = formErrors;
  const { username, bio, website, websiteName } = formDetails;

  const updateFormDetails = (key: string, value: string) => {
    setFormDetails((prev) => ({ ...prev, [key]: value }));
  };
  const updateFormErrors = (key: string, value: string | null) => {
    setFormErrors((prev) => ({ ...prev, [key]: value }));
  };
  const fileSelector = (fileRef: React.RefObject<HTMLInputElement>) => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isProfile: boolean
  ) => {
    const fileInput = event.target;

    if (!fileInput.files || fileInput.files.length === 0) {
      createError("No file selected.");
      return;
    }

    const upload_preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
    const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!upload_preset || !cloud_name) {
      createError("Cloudinary configuration is not set");
      return;
    }
    const file = fileInput.files[0];
    if (file.type !== "image/jpeg") {
      createError("Please upload a JPG or JPEG image.", "Invalid image type");
      return;
    }

    setUploading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", upload_preset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentComplete = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentComplete);
            } else {
              setProgress(100);
              console.warn(
                "Total size is undefined, unable to calculate progress."
              );
            }
          },
        }
      );

      setUploadedDetails((prev) => {
        if (isProfile) {
          return {
            ...prev,
            profileUrl: response.data.secure_url,
            profileId: response.data.public_id,
          };
        } else {
          return {
            ...prev,
            coverUrl: response.data.secure_url,
            coverId: response.data.public_id,
          };
        }
      });
    } catch (error) {
      console.error("Upload failed:", error);
      createError(unknown_error);
    } finally {
      setUploading(false);
    }
  };
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const validValue = value.replace(/[^a-zA-Z0-9_]/g, "");
    if (validValue.length < 3 || validValue.length > 30) {
      updateFormErrors(
        "usernameError",
        "Username must be 3-30 characters long."
      );
    } else {
      updateFormErrors("usernameError", null);
    }
    updateFormDetails("username", validValue);
    // setUsername(validValue);
  };
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const wordCount = value.trim().split(/\s+/).length;

    // Check if the word count is at least 2
    if (wordCount < 2) {
      updateFormErrors("bioError", "Bio must contain at least two words.");
    } else {
      updateFormErrors("bioError", null);
    }
    updateFormDetails("bio", value);
    // setBio(value);
  };
  const checkUserUnique = async () => {
    try {
      setIsUsernameLoading(true);
      const isTaken = await checkUsernameUnique(username);
      if (isTaken) {
        updateFormErrors("usernameError", "Username is already taken.");
      } else {
        updateFormErrors("usernameError", null);
      }

      setIsUsernameValid(!isTaken);
    } catch (err) {
      console.error(`Error checking username unique status: ${err}`);
      updateFormErrors("usernameError", null);
      setIsUsernameValid(true);
    } finally {
      setIsUsernameLoading(false);
    }
  };
  const debouncedFetchUnique = useDebouncedCallback(checkUserUnique, 500);
  useEffect(() => {
    if (username.length > 2) {
      debouncedFetchUnique();
    }
  }, [username]);
  const handleWebsiteChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const value = e.target.value;
    if (key === "website" && value.length > 0 && (!value || !value.startsWith("https://"))) {
      updateFormErrors(
        "websiteError",
        "Website link must start with https://."
      );
    } else {
      updateFormErrors("websiteError", null);
    }

    updateFormDetails(key, value);
  };
  const submitHandler = async () => {
    if (uploading) return createError("Picture still uploading");

    if (!profileId || !profileUrl) {
      return createError("Profile picture is required.");
    }
    if (!bio || !username) {
      return createError("Bio and username are required.");
    }
    if (usernameError) return createError(usernameError);
    if (bioError) return createError(bioError);
    if (websiteError) return createError(websiteError);

    try {
      setSubmitLoading(true);
      const data = await completeProfileDetails(
        formDetails,
        uploadedDetails,
        redirect
      );
      const { error, success, redirectUrl } = data;
      if (error) {
        createError(error);
        if(redirectUrl){
            push(redirectUrl)
        }
        return;
      }
      if (success) {
        createSimple(success);
        setUploadedDetails({
          profileUrl: null,
          profileId: null,
          coverUrl: null,
          coverId: null,
        });
        setFormDetails({
          username: "",
          bio: "",
          website: "",
          websiteName: "",
        });
        if(redirectUrl){
            push(redirectUrl)
        }
      }
    } catch (error) {
      console.error("Error submitting details", error);
      createError(unknown_error);
    } finally {
      setSubmitLoading(false);
    }
  };
  return (
    <div className="w-full  flex flex-col gap-4  ">
      <div className="relative flex w-full  aspect-[1/0.3] min-h-[150px]">
        <button
          disabled={uploading || submitLoading}
          className={`w-full h-full flex items-center bg-center text-sm ${
            coverUrl && coverId ? "" : "border border-dashed"
          } justify-center px-p-half  rounded`}
          style={{
            backgroundImage:
              coverUrl && coverId
                ? `url(${cloudinaryUrl(coverId, "w_1000,h_500,c_fill")})`
                : "none",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          onClick={() => fileSelector(coverPicRef)}
        >
          {!coverUrl &&
            "Click to add a cover photo or select the circle to upload a profile picture."}
        </button>
        <button
          disabled={uploading || submitLoading}
          className={`absolute  w-[120px] left-[50%] ${
            profileUrl && profileId ? "" : "border border-dashed"
          } flex items-center justify-center translate-x-[-50%] aspect-square  rounded-full complete_profile_picture bg-background`}
          onClick={() => fileSelector(profilePicRef)}
          style={{
            backgroundImage:
              profileUrl && profileId
                ? `url(${cloudinaryUrl(profileId, "w_300,h_300,c_fill")})`
                : "none",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          {!profileUrl && (
            <svg
              width="25"
              height="25"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 3C1.44772 3 1 3.44772 1 4V11C1 11.5523 1.44772 12 2 12H13C13.5523 12 14 11.5523 14 11V4C14 3.44772 13.5523 3 13 3H2ZM0 4C0 2.89543 0.895431 2 2 2H13C14.1046 2 15 2.89543 15 4V11C15 12.1046 14.1046 13 13 13H2C0.895431 13 0 12.1046 0 11V4ZM2 4.25C2 4.11193 2.11193 4 2.25 4H4.75C4.88807 4 5 4.11193 5 4.25V5.75454C5 5.89261 4.88807 6.00454 4.75 6.00454H2.25C2.11193 6.00454 2 5.89261 2 5.75454V4.25ZM12.101 7.58421C12.101 9.02073 10.9365 10.1853 9.49998 10.1853C8.06346 10.1853 6.89893 9.02073 6.89893 7.58421C6.89893 6.14769 8.06346 4.98315 9.49998 4.98315C10.9365 4.98315 12.101 6.14769 12.101 7.58421ZM13.101 7.58421C13.101 9.57302 11.4888 11.1853 9.49998 11.1853C7.51117 11.1853 5.89893 9.57302 5.89893 7.58421C5.89893 5.5954 7.51117 3.98315 9.49998 3.98315C11.4888 3.98315 13.101 5.5954 13.101 7.58421Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          )}
        </button>
      </div>
      <Input
        type="file"
        accept=".jpg,.jpeg"
        ref={coverPicRef}
        className="hidden"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          handleFileChange(event, false)
        }
      />
      <Input
        type="file"
        accept=".jpg,.jpeg"
        ref={profilePicRef}
        className="hidden"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          handleFileChange(event, true)
        }
      />
      {uploading && (
        <div className="lg:w-[50%] px-p-half max-w-[600px] w-full left-1/2 translate-x-[-50%] fixed bottom-[30px] ">
          <progress value={progress} max="100" />
        </div>
      )}

      <div className="w-full pt-[60px] flex flex-col gap-2">
        <Label htmlFor="username" className="text-sm">
          Username *
        </Label>
        <div className="w-full relative">
          <Input
            spellCheck={false}
            id="username"
            value={username}
            onChange={handleUsernameChange}
            disabled={submitLoading}
          />
          <span className="absolute right-4 top-1/2 translate-y-[-50%]">
            {isUsernameLoading && <DotLoader />}
            {!isUsernameLoading &&
              username.length > 0 &&
              (usernameError || !isUsernameValid) && (
                <Cross2Icon className=" text-destructive  " />
              )}
            {!isUsernameLoading &&
              username.length > 0 &&
              !usernameError &&
              isUsernameValid && <CheckIcon className=" text-emerald-500  " />}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">Minimum of 3 characters</p>
        {!isUsernameLoading && usernameError && (
          <p className="text-sm text-destructive">{usernameError}</p>
        )}
      </div>

      <div className="w-full  flex flex-col gap-2">
        <Label htmlFor="bio" className="text-sm">
          Bio *
        </Label>
        <Textarea
          spellCheck={false}
          id="bio"
          value={bio}
          onChange={handleBioChange}
          disabled={submitLoading}
        />
        <p className="text-sm text-muted-foreground">Minimum of 2 words</p>
        {bioError && <p className="text-sm text-destructive">{bioError}</p>}
      </div>
      <div className="w-full  flex flex-col gap-2">
        <Label htmlFor="website" className="text-sm">
          Website
        </Label>
        <Input
          id="website"
          spellCheck={false}
          value={website}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleWebsiteChange(e, "website")
          }
          disabled={submitLoading}
        />
        <p className="text-sm text-muted-foreground">
          Add a link that will appear at the top of your profile
        </p>
        {websiteError && (
          <p className="text-sm text-destructive">{websiteError}</p>
        )}
      </div>
      <div className="w-full  flex flex-col gap-2">
        <Label htmlFor="bio" className="text-sm">
          Website text
        </Label>
        <Input
          id="bio"
          spellCheck={false}
          value={websiteName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleWebsiteChange(e, "websiteName")
          }
          disabled={submitLoading}
        />
      </div>
      <Button
        type="submit"
        disabled={uploading || submitLoading}
        onClick={submitHandler}
        className="w-full items-center justify-center"
      >
        {submitLoading ? <MiniLoader /> : "Complete"}
      </Button>
    </div>
  );
};
