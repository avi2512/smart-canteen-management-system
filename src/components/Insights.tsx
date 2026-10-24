import React from 'react';
import { Utensils, TrendingUp } from 'lucide-react';

interface InsightsProps {
  recommendationsText?: string;
  reductionText?: string;
}

export const Insights: React.FC<InsightsProps> = ({
  recommendationsText = "Based on today's weather and historical data, we recommend increasing the portion of salads and light meals. Expected temperature: 28°C",
  reductionText = "Last week's AI-powered predictions helped reduce food waste by 23%. Continue monitoring portion sizes for optimal results.",
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Insights</h2>
        <div className="space-y-4">
          {/* Recommendations Item */}
          <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="flex-shrink-0 mt-1">
              <Utensils className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Meal Recommendations</h3>
              <p className="mt-1 text-sm text-gray-500">{recommendationsText}</p>
            </div>
          </div>

          {/* Waste Reduction Item */}
          <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="flex-shrink-0 mt-1">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Waste Reduction</h3>
              <p className="mt-1 text-sm text-gray-500">{reductionText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
