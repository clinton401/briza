import {FC, ReactNode} from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
  type TooltipPropsType = {
    children: ReactNode,
    text: string,
    isButtonChild?: boolean
  }
export const TooltipComp: FC<TooltipPropsType> = ({children, text, isButtonChild = true}) => {
  return (
    <TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild={isButtonChild}>{children}</TooltipTrigger>
    <TooltipContent>
      <p>{text}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

  )
}


