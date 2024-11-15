import { useState, useEffect } from "react";

 const useIsTyping = () => {
  const [error, setError] = useState<undefined | string>(undefined);
  const [success, setSuccess] = useState<undefined | string>(undefined);
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    if (isTyping && error) {
      setError(undefined);
      setSuccess(undefined);
    }
  }, [isTyping]);
  return {
    
    error,
    setError,
    success,
    setSuccess,
    isTyping, setIsTyping
  };
};

export default useIsTyping
