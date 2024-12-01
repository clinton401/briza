import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
export const SuggestionLoader = () => {
  return (
    <div className="flex w-full items-center space-x-4">
      <Skeleton className="h-10 aspect-square rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-[150px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
    </div>
  )
}
