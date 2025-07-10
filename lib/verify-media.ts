export interface ModerationResult {
  safe: boolean;
  error?: string;
  details?: any;
}

export const verifyMedia = async (file: File): Promise<ModerationResult> => {
  const API_USER = process.env.NEXT_PUBLIC_SIGHTENGINE_USER;
  const API_SECRET = process.env.NEXT_PUBLIC_SIGHTENGINE_SECRET;

  if (!API_USER || !API_SECRET) {
    return {
      safe: false,
      error: "Sightengine credentials are missing",
    };
  }

  const formData = new FormData();
  formData.append("media", file);
  formData.append("models", "nudity,violence,wad");
  formData.append("api_user", API_USER);
  formData.append("api_secret", API_SECRET);

  const isVideo = file.type.startsWith("video/");
  const endpoint = isVideo
    ? "https://api.sightengine.com/1.0/video/check-sync.json"
    : "https://api.sightengine.com/1.0/check.json";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.status !== "success") {
      return {
        safe: false,
        error: data.error?.message || "Moderation failed",
      };
    }

    if (!isVideo) {
      // image response
      const { nudity, violence, weapon, alcohol, drugs } = data;

      const isNude =
        nudity?.raw > 0.3 ||
        nudity?.partial > 0.5 ||
        nudity?.suggestive > 0.7;
      const isViolent = violence?.prob > 0.3 || weapon > 0.3;
      const hasIllegalContent = alcohol > 0.5 || drugs > 0.5;

      return {
        safe: !isNude && !isViolent && !hasIllegalContent,
        details: { nudity, violence, weapon, alcohol, drugs },
      };
    } else {
      
      const frames = data?.data?.frames || [];

      let unsafe = false;

      for (const frame of frames) {
        const {
          nudity,
          violence,
          weapon,
          alcohol,
          drugs
        } = frame;

        const isNude =
          nudity?.raw > 0.3 ||
          nudity?.partial > 0.5 ||
          nudity?.suggestive > 0.7;
        const isViolent = violence?.prob > 0.3 || weapon > 0.3;
        const hasIllegalContent = alcohol > 0.5 || drugs > 0.5;

        if (isNude || isViolent || hasIllegalContent) {
          unsafe = true;
          break;
        }
      }

      return {
        safe: !unsafe,
        details: data.data,
      };
    }
  } catch (error) {
    console.error("verifyMedia error:", error);
    return {
      safe: false,
      error: "Unknown error during moderation",
    };
  }
};
