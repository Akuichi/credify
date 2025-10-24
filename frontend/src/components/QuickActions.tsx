import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  to?: string;
  onClick?: () => void;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
};

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {actions.map((action, index) => {
        const content = (
          <>
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
              <p className="text-sm text-white/90 line-clamp-2">{action.description}</p>
            </div>
            <svg
              className="w-5 h-5 flex-shrink-0 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        );

        return (
          <motion.div key={index} variants={itemVariants}>
            {action.to ? (
              <Link
                to={action.to}
                className={`group relative bg-gradient-to-r ${colorClasses[action.color]} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-start space-x-4 min-h-[44px] w-full`}
              >
                {content}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className={`group relative bg-gradient-to-r ${colorClasses[action.color]} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-start space-x-4 min-h-[44px] w-full text-left`}
              >
                {content}
              </button>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};
