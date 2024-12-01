import ReactPlayer from 'react-player/lazy';
import {FC} from "react";
type VideosType = {
    url: string;
}
export const Videos: FC<VideosType> = ({url}) => {
  return (
      <ReactPlayer 
        url={url} 
        controls 
        width="100%" 
        height="100%"
        loop
      />
  );
};
