"use client"
import {FC, useContext} from 'react';
import { FollowContext } from './user-follow-layout';
import { NotFollowedCard } from "@/components/home/not-followed-card";
import { SessionType } from '@/lib/types';



export const UserFollowPage: FC<{session: SessionType}> = ({session}) => {
    const {users, filter, followId} = useContext(FollowContext);
    return (
        <section className='flex flex-col px-p-half gap-4 w-full overflow-hidden pb-16 md:pb-8 items-center'>
            {users.map(user => {
                return <NotFollowedCard key={user.id} user={user} bioNeeded filter={filter} followId={followId} userId={session.id}/>
            })}
        </section>
    )
}