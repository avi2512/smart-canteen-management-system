import React from 'react';
import { TrendingUp, Users, MessageSquare } from 'lucide-react';

interface StatsProps {
  prediction?: string;
  activeUsers?: number;
  feedbackScore?: string;
}

export const Stats: React.FC<StatsProps> = ({
  prediction = "450 Meals",
  activeUsers = 328,
  feedbackScore = "4.8/5.0",
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Prediction Card */}
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-green-500 animate-pulse" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Today's Prediction</p>
            <p className="text-2xl font-semibold text-gray-900">{prediction}</p>
          </div>
        </div>
      </div>

      {/* Active Users Card */}
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Active Users</p>
            <p className="text-2xl font-semibold text-gray-900">{activeUsers}</p>
          </div>
        </div>
      </div>

      {/* Feedback Score Card */}
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
        <div className="flex items-center">
          <MessageSquare className="h-8 w-8 text-purple-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Feedback Score</p>
            <p className="text-2xl font-semibold text-gray-900">{feedbackScore}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
