import {FC} from 'react'

export const MainLoader: FC = () => {
  return (
    <div className=" w-full relative">
    <div className="blobs">
        <div className="blob-center"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo"></feColorMatrix>
          <feBlend in="SourceGraphic" in2="goo"></feBlend>
          </filter>
      </defs>
    </svg></div>
  )
}
