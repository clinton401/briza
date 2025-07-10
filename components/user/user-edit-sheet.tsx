import {FC} from "react"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  // SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
// import { CompleteProfileForm } from "../auth/complete-profile-form";
import {UserEditProfileForm} from "@/components/user/user-edit-profile-form";
import {UserResponse, SessionType} from "@/lib/types"

export const UserEditSheet: FC<{user: UserResponse, session: SessionType}> =({user, session}) =>  {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="rounded-full">Edit Profile</Button>
      </SheetTrigger>
      <SheetContent className="w-[50vw] min-w-[300px]  overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        {/* <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" />
          </div>
        </div> */}
        <UserEditProfileForm SheetCloseComponent={SheetClose} user={user} session={session} />
        {/* <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose> */}
          {/* </UserEditProfileForm> */}
        {/* </SheetFooter> */}
      </SheetContent>
    </Sheet>
  )
}
