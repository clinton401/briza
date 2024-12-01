"use client";
import React, { FC, useState, useEffect, Fragment } from "react";
import { MainLoader } from "@/components/loaders/main-loader";
import { notable } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import type { SessionType, PostWithDetails } from "@/lib/types";
import { unknown_error } from "@/lib/variables";
import { getHomePagePosts } from "@/actions/get-home-page-posts";
import { PostCard } from "@/components/post/post-card";
import useSWR from "swr";
import fetcher from "@/hooks/fetcher";
import { DotLoader } from "@/components/dot-loader";
export const HomePostUi: FC<{ session: SessionType }> = ({ session }) => {
  const [isNewPostLoading, setIsNewPostLoading] = useState(false);
  const [newPostError, setNewPostError] = useState<undefined | string>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/posts?page=1`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 300000,
    }
  );
  const getNewPost = async () => {
    try {
      setNewPostError(undefined);
      setIsNewPostLoading(true);
      const result = await getHomePagePosts(page);
      const { error, success, data } = result;
      // console.log(data);
      if (error || !success || !data) {
        setNewPostError(error || unknown_error);
        return;
      }

      setPosts((prev) => {
        return [...prev, ...data.posts];
      });
    } catch (error) {
      console.error(`Unable to get posts: ${error}`);
      setNewPostError(unknown_error);
    } finally {
      setIsNewPostLoading(false);
    }
  };
  const handleScroll = () => {
    const scrollPosition =
      window.innerHeight + document.documentElement.scrollTop;
    const documentHeight = document.documentElement.offsetHeight;

    if (
      scrollPosition + 600 >= documentHeight &&
      !isLoading && !isNewPostLoading &&

      posts.length > 0 &&
      totalPages > page
    ) {
      
      setIsNewPostLoading(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (data && data?.posts && data?.totalPages) {
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    }
  }, [data]);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [page, isLoading, posts, totalPages]);
  useEffect(() => {
    if(!isLoading  && posts.length > 0 && page > 1 && totalPages > page) {

      getNewPost()
    }
  }, [page]);
  // console.log({data, page, totalPages, isLoading});
  if (isLoading)
    return (
      <div className="w-full ">
        <MainLoader />
      </div>
    );
  if (error) {
    const errorMessage = error?.message || unknown_error;
    return (
      <div className="w-full flex items-center flex-col pt-4 gap-4">
        <h2
          className={`${notable.className} w-full text-center font-black text-2xl`}
        >
          {errorMessage}
        </h2>
        <Button onClick={() => mutate()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* {error && (
        <div className="w-full flex items-center flex-col pt-4 gap-4">
          <h2
            className={`${notable.className} w-full text-center font-black text-2xl`}
          >
            {error}
          </h2>
          <Button>Retry</Button>
        </div>
      )} */}
      {posts.length > 0 && (
        <section className="w-full flex flex-col gap-4">
          {posts.map((post: PostWithDetails, index) => {
            return (
              <Fragment key={index}>
                <PostCard session={session} postDetails={post} />
              </Fragment>
            );
          })}
        </section>
      )}
      {newPostError &&  <section className="w-full flex items-center flex-col pt-4 gap-4">
        <h2
          className={`${notable.className} w-full text-center font-black text-2xl`}
        >
          {newPostError}
        </h2>
        <Button onClick={getNewPost}>Retry</Button>
      </section>}
      {!error && isNewPostLoading && (
        <section className="w-full flex items-center justify-center py-14 ">
          <DotLoader />
        </section>
      )}
    </div>
  );
};
