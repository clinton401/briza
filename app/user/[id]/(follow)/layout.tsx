import {UserFollowLayout} from "@/components/user/user-follow-layout";
export default async  function FollowLayout({

  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}>) {
    const { id } = await params;
  return (
    <div className="w-full">
<UserFollowLayout id={id}> {children}</UserFollowLayout>

    </div>
  );
}
