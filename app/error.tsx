"use client";
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { notable } from '@/lib/fonts';
import Link from "next/link";
import {ErrorComp} from "@/components/error-comp";
function ErrorPage({ error }: { error: Error}) {
  
    useEffect(() => {
        console.error(`${error}`);
    }, [error]);
   
    return (
      <ErrorComp message={error.message} />
    );
}
export default ErrorPage;