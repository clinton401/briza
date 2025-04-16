import { CreatePostUI } from "@/components/post/create-post-ui";
// import { HomeAside } from "@/components/home/home-aside";
import getServerUser from "@/hooks/get-server-user";
import { FC } from "react";
import { HomePostUi } from "@/components/home/home-post-ui";
import { HomeNavbar } from "@/components/home/home-navbar";

const Home: FC = async () => {
  const session = await getServerUser();
  if (!session) return null;
  return (
    // <main
    //   className={`flex w-full py-8 px-p-half lg:pl-0 overflow-hidden lg:pr-[20rem] min-h-dvh `}
    // >
    <div className="w-full pb-16 md:pb-8  ">
      <HomeNavbar session={session} />
      <div className="w-full hidden sm:flex">
        <CreatePostUI session={session} />
      </div>
      <HomePostUi session={session} />
    </div>
    //   <HomeAside />
    // </main>
  );
};
export default Home;
