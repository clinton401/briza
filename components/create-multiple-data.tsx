"use client"
import {FC, useState} from 'react';
import createToast from "@/hooks/create-toast"
import {MiniLoader} from "@/components/mini-loader";
import {Button} from "@/components/ui/button";
import {unknown_error} from "@/lib/variables";
import {createMultiplePosts} from "@/actions/create-multiple-posts";
import { createMultipleUsers } from '@/actions/create-multiple-users';
export const CreateMultipleData: FC = () => {
const [isPending, setIsPending] = useState(false);
    const {createSimple, createError} = createToast();

    const createMulltipleData = async() => {
try {
    setIsPending(true);
const response = await createMultiplePosts();
const {success, error, data} = response;
if(error || !success) return createError(error || unknown_error);
createSimple(success)
console.log(data)

} catch(error) {
console.error(`Unable to add multiple data: ${error}`)
createError( unknown_error);
} finally{
    setIsPending(false)
}
    }
  return (
    <Button disabled={isPending} onClick={createMulltipleData}>{isPending ? <MiniLoader /> : "Create multiple data"}</Button>
  )
}
