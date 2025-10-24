import React from 'react';
import { motion } from 'framer-motion';

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ show, message = 'Success!' }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, times: [0, 0.6, 1] }}
        className="bg-white dark:bg-gray-800 rounded-full p-8 shadow-2xl"
      >
        <motion.svg
          className="w-24 h-24 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute mt-40 text-xl font-semibold text-gray-800 dark:text-white"
      >
        {message}
      </motion.p>
    </motion.div>
  );
};

export default SuccessAnimation;
