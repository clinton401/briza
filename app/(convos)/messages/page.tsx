import {FC} from "react";
import {notable} from "@/lib/fonts";
import {NewConvoDialog} from "@/components/conversations/new-convo-dialog";
import {Button} from "@/components/ui/button"



const ConversationsPage: FC = () => {
    return (
        <div className="w-full hidden lg:flex flex-col px-p-half min-h-dvh items-center *:w-full gap-4 *:text-center justify-center">
            <h2 className={`${notable.className} text-2xl font-black`}>
            Select a message
            </h2>
            <p>
                
            Choose from your existing conversations, start a new one, or just keep swimming.
            </p>
            <div className="flex items-center justify-center">
                <NewConvoDialog><Button size="lg">New message</Button></NewConvoDialog>
            </div>
      </div>
    )
}

export default ConversationsPage