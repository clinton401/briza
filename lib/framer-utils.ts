export const rightAnimation = {
  hidden: { x: 500, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
        duration: 0.2,
    //   type: "spring",
    //   stiffness: 100,
    //   damping: 10,
    },
  },
  exit: {
    x: 500,
    opacity: 0,
    transition: {
        duration: 0.2,
    //   type: "spring",
    //   stiffness: 100,
    //   damping: 10,
    },
  }
};
