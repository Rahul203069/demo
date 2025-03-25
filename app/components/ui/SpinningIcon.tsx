import { Settings } from "lucide-react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

const SpinningIcon = ({children}:{children:ReactNode}) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    >
      {children}
    </motion.div>
  );
};

export default SpinningIcon;