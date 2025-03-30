"use client"
import {FC, useContext} from 'react';
import { FollowContext } from './user-follow-layout';
import { NotFollowedCard } from "@/components/home/not-followed-card";



export const UserFollowPage: FC = () => {
    const {users, filter, followId} = useContext(FollowContext);
    return (
        <section className='flex flex-col px-p-half gap-4 w-full overflow-hidden items-center'>
            {users.map(user => {
                return <NotFollowedCard key={user.id} user={user} bioNeeded filter={filter} followId={followId}/>
            })}
        </section>
    )
}