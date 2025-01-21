import {useState, useEffect} from "react";
const isNearBottom = (bottom = 1600): boolean => {
const [isNear, setIsNear] = useState(false) ;

const handleScroll = () => {
    const scrollPosition =
    window.innerHeight + document.documentElement.scrollTop;
  const documentHeight = document.documentElement.offsetHeight;

  if (
    scrollPosition + bottom >= documentHeight 
  ) {
    setIsNear(true)
  } else {
    setIsNear(false)
  }
}
useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isNear]);

return isNear;
}
export default isNearBottom;