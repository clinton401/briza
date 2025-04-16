"use client";
import { FC, useState } from "react";
import createToast from "@/hooks/create-toast";
import { MiniLoader } from "@/components/mini-loader";
import { Button } from "@/components/ui/button";
import { unknown_error } from "@/lib/variables";
import {createMultiplePosts} from "@/actions/create-multiple-posts";
import { Input } from "@/components/ui/input";
// import { createMultipleUsers } from "@/actions/create-multiple-users";
export type RedditPost = {
  kind: string;
  data: {
    approved_at_utc: number | null;
    subreddit: string;
    selftext: string;
    author_fullname: string;
    saved: boolean;
    mod_reason_title: string | null;
    gilded: number;
    clicked: boolean;
    title: string;
    link_flair_richtext: string[]; // Adjust type if the exact structure is known
    subreddit_name_prefixed: string;
    hidden: boolean;
    pwls: number;
    link_flair_css_class: string | null;
    downs: number;
    thumbnail_height: number | null;
    top_awarded_type: string | null;
    hide_score: boolean;
    name: string;
    quarantine: boolean;
    link_flair_text_color: string;
    upvote_ratio: number;
    author_flair_background_color: string | null;
    subreddit_type: string;
    ups: number;
    total_awards_received: number;
    media_embed: Record<string, unknown>;
    thumbnail_width: number | null;
    author_flair_template_id: string | null;
    is_original_content: boolean;
    user_reports: string[]; // Adjust type if the exact structure is known
    secure_media: {
      reddit_video?: {
        bitrate_kbps: number;
        fallback_url: string;
        has_audio: boolean;
        height: number;
        width: number;
        scrubber_media_url: string;
        dash_url: string;
        duration: number;
        hls_url: string;
        is_gif: boolean;
        transcoding_status: string;
      };
    } | null;
    is_reddit_media_domain: boolean;
    is_meta: boolean;
    category: string | null;
    secure_media_embed: Record<string, unknown>;
    link_flair_text: string | null;
    can_mod_post: boolean;
    score: number;
    approved_by: string | null;
    is_created_from_ads_ui: boolean;
    author_premium: boolean;
    thumbnail: string;
    edited: boolean;
    author_flair_css_class: string | null;
    author_flair_richtext: string[]; // Adjust type if the exact structure is known
    gildings: Record<string, unknown>;
    post_hint: string | null;
    content_categories: string | null;
    is_self: boolean;
    mod_note: string | null;
    created: number;
    link_flair_type: string;
    wls: number;
    removed_by_category: string | null;
    banned_by: string | null;
    author_flair_type: string;
    domain: string;
    allow_live_comments: boolean;
    selftext_html: string | null;
    likes: boolean | null;
    suggested_sort: string | null;
    banned_at_utc: number | null;
    url_overridden_by_dest: string;
    view_count: number | null;
    archived: boolean;
    no_follow: boolean;
    is_crosspostable: boolean;
    pinned: boolean;
    over_18: boolean;
    preview?: {
      images: Array<{
        source: {
          url: string;
          width: number;
          height: number;
        };
        resolutions: Array<{
          url: string;
          width: number;
          height: number;
        }>;
        variants: Record<string, unknown>;
        id: string;
      }>;
      enabled: boolean;
    };
    all_awardings: string[]; // Adjust type if the exact structure is known
    awarders: string[]; // Adjust type if the exact structure is known
    media_only: boolean;
    can_gild: boolean;
    spoiler: boolean;
    locked: boolean;
    author_flair_text: string | null;
    treatment_tags: string[];
    visited: boolean;
    removed_by: string | null;
    num_reports: number | null;
    distinguished: string | null;
    subreddit_id: string;
    author_is_blocked: boolean;
    mod_reason_by: string | null;
    removal_reason: string | null;
    link_flair_background_color: string;
    id: string;
    is_robot_indexable: boolean;
    report_reasons: string[] | null;
    author: string;
    discussion_type: string | null;
    num_comments: number;
    send_replies: boolean;
    contest_mode: boolean;
    mod_reports: string[]; // Adjust type if the exact structure is known
    author_patreon_flair: boolean;
    author_flair_text_color: string | null;
    permalink: string;
    stickied: boolean;
    url: string;
    subreddit_subscribers: number;
    created_utc: number;
    num_crossposts: number;
    media: {
      reddit_video?: {
        bitrate_kbps: number;
        fallback_url: string;
        has_audio: boolean;
        height: number;
        width: number;
        scrubber_media_url: string;
        dash_url: string;
        duration: number;
        hls_url: string;
        is_gif: boolean;
        transcoding_status: string;
      };
    } | null;
    is_video: boolean;
  };
};
export const CreateMultipleData: FC = () => {
  const [isPending, setIsPending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { createSimple, createError } = createToast();

  const createMulltipleData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsPending(true);
      const url = `https://www.reddit.com/search.json?q=${inputValue}`;
      const result = await fetch(url);
      if (!result.ok) {
        throw new Error(`HTTP error! Status: ${result.status}`);
      }
      const reddit = await result.json();
      if(!reddit?.data?.children) {
        throw new Error(unknown_error)
      }
      const posts: RedditPost[] = reddit.data.children;
      // console.log(posts)
      // createSimple("Posts created successfully")
      const response = await createMultiplePosts(posts);
      const { success, error, data } = response;
      if (error || !success) return createError(error || unknown_error);
      createSimple(success);
      setInputValue("")
      console.log(data);
    } catch (error) {
      console.error(`Unable to add multiple data: ${error}`);
      createError(unknown_error);
    } finally {
      setIsPending(false);
    }
  };
  return (
    <form className="w-full flex flex-col gap-4" onSubmit={createMulltipleData}>
      <Input
      required
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isPending}
      />
      <Button disabled={isPending} type="submit">
        {isPending ? <MiniLoader /> : "Create multiple data"}
      </Button>
    </form>
  );
};
