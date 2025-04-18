"use client";
import { useEffect } from 'react';
import {ErrorComp} from "@/components/error-comp";
function ConvoErrorPage({ error }: { error: Error}) {
  
    useEffect(() => {
        console.error(`${error}`);
    }, [error]);
   
    return (
      <ErrorComp message={error.message} />
    );
}
export default ConvoErrorPage;