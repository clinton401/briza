
import {unknown_error} from "@/lib/variables";
const fetcher = async (url: string) => {
    const res = await fetch(url);
  
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.error || unknown_error);
    }
  
    return res.json(); 
  };
  
  export default fetcher;
  