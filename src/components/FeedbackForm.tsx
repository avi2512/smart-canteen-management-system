import React from 'react';
import { Star } from 'lucide-react';

interface FeedbackFormProps {
  rating: number;
  feedback: string;
  onChangeRating: (rating: number) => void;
  onChangeFeedback: (feedback: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  rating,
  feedback,
  onChangeRating,
  onChangeFeedback,
  onSubmit,
}) => {
  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Feedback</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex space-x-2 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onChangeRating(star)}
                  className={`transition duration-150 transform hover:scale-110 ${
                    rating >= star ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Comments</label>
            <textarea
              value={feedback}
              onChange={(e) => onChangeFeedback(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 border"
              placeholder="Share your thoughts..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};
