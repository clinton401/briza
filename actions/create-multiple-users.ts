"use server";
import { prisma } from "@/lib/db";
import { createErrorResponse } from "@/lib/random-utils";
import { unknown_error } from "@/lib/variables";
const users = [
  {
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    username: "alicej123",
    bio: "Exploring the wonders of the world, one step at a time.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/landscapes/girl-urban-view.jpg",
    profilePicturePublicId: "samples/landscapes/girl-urban-view",
  },
  {
    name: "Bob Smith",
    email: "bob.smith@example.com",
    username: "bobsmith88",
    bio: "Tech enthusiast and coffee lover.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/people/kitchen-bar.jpg",
    profilePicturePublicId: "samples/people/kitchen-bar",
  },
  {
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    username: "charlie_b_007",
    bio: "Life is better with good books and great friends.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/food/pot-mussels.jpg",
    profilePicturePublicId: "samples/food/pot-mussels",
  },
  {
    name: "Diana Prince",
    email: "diana.prince@example.com",
    username: "dianap_wonder",
    bio: "Spreading positivity and chasing dreams.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/animals/reindeer.jpg",
    profilePicturePublicId: "samples/animals/reindeer",
  },
  {
    name: "Ethan Hunt",
    email: "ethan.hunt@example.com",
    username: "ethan_mission",
    bio: "Adventurer by day, dreamer by night.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750023/samples/balloons.jpg",
    profilePicturePublicId: "samples/balloons",
  },
  {
    name: "Fiona Davis",
    email: "fiona.davis@example.com",
    username: "fionad_2024",
    bio: "Living life with a creative flair.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/landscapes/girl-urban-view.jpg",
    profilePicturePublicId: "samples/landscapes/girl-urban-view",
  },
  {
    name: "George Miller",
    email: "george.miller@example.com",
    username: "georgem93",
    bio: "Music is the rhythm of my soul.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/people/kitchen-bar.jpg",
    profilePicturePublicId: "samples/people/kitchen-bar",
  },
  {
    name: "Hannah Walker",
    email: "hannah.walker@example.com",
    username: "hannahwalker4",
    bio: "Dream big and work hard.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/food/pot-mussels.jpg",
    profilePicturePublicId: "samples/food/pot-mussels",
  },
  {
    name: "Ian Carter",
    email: "ian.carter@example.com",
    username: "ianc_art",
    bio: "Photography is my passion.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/animals/reindeer.jpg",
    profilePicturePublicId: "samples/animals/reindeer",
  },
  {
    name: "Jane Foster",
    email: "jane.foster@example.com",
    username: "jane_inspire",
    bio: "Avid reader and aspiring writer.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750023/samples/balloons.jpg",
    profilePicturePublicId: "samples/balloons",
  },
  {
    name: "Kevin Lewis",
    email: "kevin.lewis@example.com",
    username: "kevinl25",
    bio: "Gamer and tech geek.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/landscapes/girl-urban-view.jpg",
    profilePicturePublicId: "samples/landscapes/girl-urban-view",
  },
  {
    name: "Laura King",
    email: "laura.king@example.com",
    username: "laurak2024",
    bio: "Fitness and healthy living enthusiast.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/people/kitchen-bar.jpg",
    profilePicturePublicId: "samples/people/kitchen-bar",
  },
  {
    name: "Michael Scott",
    email: "michael.scott@example.com",
    username: "michaels_office",
    bio: "World's best boss. Probably.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/food/pot-mussels.jpg",
    profilePicturePublicId: "samples/food/pot-mussels",
  },
  {
    name: "Natalie Moore",
    email: "natalie.moore@example.com",
    username: "natalie_life",
    bio: "Chasing sunsets and new adventures.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/animals/reindeer.jpg",
    profilePicturePublicId: "samples/animals/reindeer",
  },
  {
    name: "Oliver Lee",
    email: "oliver.lee@example.com",
    username: "oliverlee22",
    bio: "Cooking up stories in my kitchen.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750023/samples/balloons.jpg",
    profilePicturePublicId: "samples/balloons",
  },
  {
    name: "Paul Green",
    email: "paul.green@example.com",
    username: "paulgreen12",
    bio: "Explorer at heart, adventure awaits.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/landscapes/girl-urban-view.jpg",
    profilePicturePublicId: "samples/landscapes/girl-urban-view",
  },
  {
    name: "Quincy Adams",
    email: "quincy.adams@example.com",
    username: "quincyadams24",
    bio: "Photography is my escape.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/people/kitchen-bar.jpg",
    profilePicturePublicId: "samples/people/kitchen-bar",
  },
  {
    name: "Rita White",
    email: "rita.white@example.com",
    username: "ritawhite123",
    bio: "Art, music, and travel – my three passions.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/food/pot-mussels.jpg",
    profilePicturePublicId: "samples/food/pot-mussels",
  },
  {
    name: "Sammy Collins",
    email: "sammy.collins@example.com",
    username: "sammycollins35",
    bio: "Chasing sunsets and a better life.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/animals/reindeer.jpg",
    profilePicturePublicId: "samples/animals/reindeer",
  },
  {
    name: "Tina Williams",
    email: "tina.williams@example.com",
    username: "tinaw_25",
    bio: "Adventure awaits, let's go!",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750023/samples/balloons.jpg",
    profilePicturePublicId: "samples/balloons",
  },
  {
    name: "Ursula White",
    email: "ursula.white@example.com",
    username: "ursulawhite44",
    bio: "Let the journey begin.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/landscapes/girl-urban-view.jpg",
    profilePicturePublicId: "samples/landscapes/girl-urban-view",
  },
  {
    name: "Victor Stone",
    email: "victor.stone@example.com",
    username: "victorstone33",
    bio: "Tech and gaming enthusiast.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/people/kitchen-bar.jpg",
    profilePicturePublicId: "samples/people/kitchen-bar",
  },
  {
    name: "Wendy Miller",
    email: "wendy.miller@example.com",
    username: "wendymiller56",
    bio: "Learning, exploring, and evolving every day.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/food/pot-mussels.jpg",
    profilePicturePublicId: "samples/food/pot-mussels",
  },
  {
    name: "Xander Brown",
    email: "xander.brown@example.com",
    username: "xanderb_7",
    bio: "Life is a journey, let's enjoy the ride.",
    password: "$2a$10$LJzAP2ikNu93vrCsUgMVx.uqqMyQOKmK7ViswqMkvvh4mahg6urf6",
    isVerified: true,
    verifiedDate: new Date("2024-11-20T12:00:00"),
    profilePictureUrl:
      "https://res.cloudinary.com/dgewykhor/image/upload/v1731750017/samples/animals/reindeer.jpg",
    profilePicturePublicId: "samples/animals/reindeer",
  },
];

export const createMultipleUsers = async () => {
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Create users
        const createdUsers = await Promise.all(
          users.map((user) =>
            tx.user.create({
              data: {
                name: user.name,
                email: user.email,
                username: user.username,
                bio: user.bio,
                password: user.password,
                isVerified: user.isVerified,
                verifiedDate: user.verifiedDate,
                profilePictureUrl: user.profilePictureUrl,
                profilePicturePublicId: user.profilePicturePublicId,
              },
            })
          )
        );

        // Create corresponding UserMetrics for each user
        const userMetrics = await Promise.all(
          createdUsers.map((user) =>
            tx.userMetrics.create({
              data: {
                userId: user.id, // Link metrics to the newly created user
              },
            })
          )
        );

        return { users: createdUsers, metrics: userMetrics };
      },
      {
        timeout: 20000,
      }
    );
    return {
      error: undefined,
      success: "Users created successfully",
      data: result,
    };
  } catch (err) {
    console.log(`Error while creating multile users: ${err}`);
    return {
      error: err instanceof Error ? err.message : unknown_error,
      success: undefined,
      data: undefined,
    };
  }
};
