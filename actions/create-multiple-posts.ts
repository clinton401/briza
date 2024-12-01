
"use server";
import { prisma } from "@/lib/db";
import { unknown_error } from "@/lib/variables";

import { unauthorized_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
const posts = [
  {
      "content": "Movies are easy to find, everything else not so much",
      "url": "https://i.redd.it/idn3txeebxrd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "Not a good time for movies sites rn",
      "url": "https://i.redd.it/jxbjs0osqfzd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "Movies that were ruined by the actors before you even saw it",
      "url": "https://i.redd.it/qh9ga2yu0syd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "Whats ur fav movie",
      "url": "https://i.redd.it/lm7whltvg12e1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "name one actor whose movies you'll watch simply because they’re in it",
      "url": "https://i.redd.it/wfobqv34bayd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "What movie is this?",
      "url": "https://i.redd.it/e5gy13439wxd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "What's this movie for you?",
      "url": "https://i.redd.it/msdxizbaaj0e1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "This movie was a banger",
      "url": "https://i.redd.it/336vwsg2uc2e1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "This is a children’s movie… This is a children’s movie. This is a children’s movie! THIS IS A CHILDREN’S MOVIE! Fuck you Disney! ",
      "url": "https://i.redd.it/9lm96gthp4xd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "The military in Zombie movies Starterpack",
      "url": "https://i.redd.it/bjqr96cya5yd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "Venom movies ",
      "url": "https://i.redd.it/cepwbtcdzbxd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "What movies from the 2000's have already aged poorly?",
      "url": "https://i.redd.it/4dx0mlbfkiid1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "Which movie had the best song that was written for the movie?",
      "url": "https://i.redd.it/k0gh64yec8sd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "What movie is this?",
      "url": "https://i.redd.it/mhdpfdf1n3zd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "This is 4 different movies",
      "url": "https://i.redd.it/rp2exg5k2iqd1.jpeg",
      "type": "IMAGE"
  },
  {
      "content": "It's like all the parody movies just vanished",
      "url": "https://i.redd.it/f09fo3gmpjpd1.png",
      "type": "IMAGE"
  },
  {
      "content": "These are 4 different movies",
      "url": "https://i.redd.it/mcemm336wqqd1.png",
      "type": "IMAGE"
  },
  {
      "content": "Matt Damon explains why movies aren’t made the way they used to be",
      "url": "https://v.redd.it/d1h99inkgkyd1/DASH_720.mp4?source=fallback",
      "type": "VIDEO"
  },
  {
      "content": "Any website to watch movies free",
      "url": "https://www.reddit.com/r/Piracy/comments/1dksl15/any_website_to_watch_movies_free/",
      "type": "NONE"
  },
  {
      "content": "I watched 135 time loop movies.",
      "url": "https://www.reddit.com/r/movies/comments/1flvzco/i_watched_135_time_loop_movies/",
      "type": "NONE"
  },
  {
      "content": "Teens Want Less Sex in Movies and TV Shows, Study Finds\n\n\n",
      "url": "https://variety.com/2024/film/news/teens-sex-movies-tv-shows-study-preferences-babygirl-tell-me-lies-1236189703/",
      "type": "NONE"
  },
  {
      "content": "Movies just aren’t very good anymore. ",
      "url": "https://www.reddit.com/r/unpopularopinion/comments/1fgol5y/movies_just_arent_very_good_anymore/",
      "type": "NONE"
  },
  {
      "content": "Movies whose productions had unintended consequences on the film industry. ",
      "url": "https://www.reddit.com/r/movies/comments/1fxxgrt/movies_whose_productions_had_unintended/",
      "type": "NONE"
  },
  {
      "content": "Hasbro Will No Longer Co-Finance Movies Based on Their Products",
      "url": "https://www.bloomberg.com/news/articles/2024-11-20/hasbro-s-gamer-ceo-refocuses-on-play-after-selling-film-business",
      "type": "NONE"
  },
  {
      "content": "Movies ruined by obvious factual errors?",
      "url": "https://www.reddit.com/r/movies/comments/1evl4bv/movies_ruined_by_obvious_factual_errors/",
      "type": "NONE"
  }
]

enum MediaType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
  }

  export const createMultiplePosts = async() => {
    const session = await getServerUser();
    if (!session) return {error: unauthorized_error, success: undefined, data: undefined};
    try{
        const result = await prisma.$transaction(
            async (tx) => {
              
              const createdPosts = await Promise.all(
                posts.map(async (post) => {
                  // Create the post
                  const createdPost = await tx.post.create({
                    data: {
                      content: post.content,
                      userId: session.id,
                    },
                  });
        let createdMedia
        if (post.type === MediaType.IMAGE || post.type === MediaType.VIDEO) {
          createdMedia = await tx.postMedia.create({
            data: {
              mediaType: post.type,
              mediaUrl: post.url,
              postId: createdPost.id,
            },
          });
        }
        
                  return { ...createdPost, media: createdMedia };
                //  return createdPost;
                })
              );
        
  
              const userMetrics = await tx.userMetrics.upsert({
                where: { userId: session.id },
                create: { userId: session.id, postCount: posts.length },
                update: { postCount: { increment: posts.length } },
              });
        
      
              const postMetrics = await Promise.all(
                createdPosts.map((post) =>
                  tx.postMetrics.create({
                    data: { postId: post.id },
                  })
                )
              );
        
              return {
                posts: createdPosts,
                metrics: {
                  userMetrics,
                  postMetrics,
                },
              };
            },
            { timeout: 50000 } 
          );
        
          return {
            error: undefined,
            success: "Posts created successfully",
            data: result,
          };
        
    }catch(err) {
        console.log(`Error while creating multile posts: ${err}`);
        return {
          error: err instanceof Error ? err.message : unknown_error,
          success: undefined,
          data: undefined,
        };
      }
    }
  