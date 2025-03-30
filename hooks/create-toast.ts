import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { toast as sonner } from "sonner"

const createToast = () => {
    const {toast} = useToast()
    const createError = (description: string, title ="Uh oh! Something went wrong.") => {
        toast({
            variant: "destructive",
            title,
            description,
            
          })
    }
    const createSimple = (description: string, title?: string) => {
        if(title) {
            toast({
                title,
                description,
              })
        } else {
            toast({
                description,
              })
        }
    } 

    const createWithAction = (title: string, description: string, actionText: string , actionHandler: () => void) => {
      sonner(title, {
        description,
        action: {
          label: actionText,
          onClick: () => actionHandler(),
        },
      })
    }
    // const createWithTitle = (
    //   description: string,
    //   actionText: string,
    //   actionHandler: () => void,
    //   title?: string
    // ) => {
    //   // Define the action separately
    //   const action = (
    //     <ToastAction altText={actionText} onClick={actionHandler}>
    //       {actionText}
    //     </ToastAction>
    //   );
    
    //   // If a title is provided, include it in the toast
    //   if (title) {
    //     toast({
    //       title,
    //       description,
    //       action, 
    //     });
    //     return;
    //   }
    
     
    //   toast({
    //     description,
    //     action, 
    //   });
    // };
  return {createError, createSimple, createWithAction}
}

export default createToast
