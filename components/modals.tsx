"use client";
import { FC, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ModalsProps = {
  isOpen: boolean;
  closeModal: (e?: React.MouseEvent<HTMLDivElement>) => void;
  showCloseButton?: boolean;
  children: ReactNode;
};
const appearAnimation = {
  hidden: { opacity: 0,
    //  filter: "blur(10px)"
     },
  visible: {
    opacity: 1,
    // filter: "blur(0px)",
    transition: { ease: "easeIn", duration: 0.3 },
  },
  exit: {
    opacity: 0,
   
    // filter: "blur(10px)",
    transition: { ease: "easeIn", duration: 0.3 },
  },
};
export const Modals: FC<ModalsProps> = ({ isOpen, closeModal, children, showCloseButton = true }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={appearAnimation}
          initial="hidden"
          animate="visible"
          exit="exit"
          key="modals"
          className="bg-black/80 z-[5000] fixed top-0 left-0 w-full px-p-half py-8 h-dvh overflow-x-hidden overflow-y-auto"
          onClick={closeModal}
        >
          <div className="w-full flex  items-center flex-col gap-6 justify-center relative  h-full ">
            {showCloseButton && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full absolute inset-0 "
            >
              <X />
            </Button>)}
            <div onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} className="w-full flex items-center justify-center">
            {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
