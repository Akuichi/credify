import React from 'react';
import { motion } from 'framer-motion';

export interface ActivityItem {
  id: string;
  type: 'login' | 'logout' | 'security' | 'profile' | 'email';
  title: string;
  description: string;
  timestamp: string;
  icon?: React.ReactNode;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'login':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        icon: 'text-green-600 dark:text-green-400',
        dot: 'bg-green-500',
      };
    case 'logout':
      return {
        bg: 'bg-gray-100 dark:bg-gray-700',
        icon: 'text-gray-600 dark:text-gray-400',
        dot: 'bg-gray-500',
      };
    case 'security':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        icon: 'text-purple-600 dark:text-purple-400',
        dot: 'bg-purple-500',
      };
    case 'profile':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        icon: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
      };
    case 'email':
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        icon: 'text-orange-600 dark:text-orange-400',
        dot: 'bg-orange-500',
      };
  }
};

const getDefaultIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'login':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      );
    case 'logout':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      );
    case 'security':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case 'profile':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'email':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
  }
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, maxItems = 5 }) => {
  const displayedActivities = activities.slice(0, maxItems);

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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</span>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
        {displayedActivities.length > 0 ? (
          displayedActivities.map((activity, index) => {
            const colors = getActivityColor(activity.type);
            const isLast = index === displayedActivities.length - 1;

            return (
              <motion.div key={activity.id} variants={itemVariants} className="relative">
                <div className="flex items-start space-x-3">
                  {/* Timeline dot and line */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center ${colors.icon}`}>
                      {activity.icon || getDefaultIcon(activity.type)}
                    </div>
                    {!isLast && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -mb-3" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-3">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{activity.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{activity.description}</p>
                      </div>
                      <time className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <svg
              className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </motion.div>

      {activities.length > maxItems && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
};
