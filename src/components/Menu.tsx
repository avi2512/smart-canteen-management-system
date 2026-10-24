import React from 'react';
import { Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Meal } from '../types/meal';

interface MenuProps {
  meals: Meal[];
  onRateMeal: (mealId: number, isLike: boolean) => void;
}

export const Menu: React.FC<MenuProps> = ({ meals, onRateMeal }) => {
  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition duration-300">
              <img
                src={meal.image}
                alt={meal.name}
                className="w-full h-48 object-cover hover:scale-105 transition duration-500"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{meal.name}</h3>
                <p className="text-sm text-gray-500">{meal.nutrition}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="ml-1 text-sm text-gray-500">{meal.time}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onRateMeal(meal.id, true)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded transition"
                      aria-label="Like this meal"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm font-medium">{meal.likes}</span>
                    </button>
                    <button
                      onClick={() => onRateMeal(meal.id, false)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded transition"
                      aria-label="Dislike this meal"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm font-medium">{meal.dislikes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
