import { Meal } from '../types/meal';

export const INITIAL_MEALS: Meal[] = [
  {
    id: 1,
    name: "Grilled Chicken Bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    nutrition: "520 cal | Protein: 32g",
    time: "Lunch",
    likes: 45,
    dislikes: 3
  },
  {
    id: 2,
    name: "Vegetarian Buddha Bowl",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    nutrition: "420 cal | Protein: 15g",
    time: "Lunch",
    likes: 38,
    dislikes: 5
  },
  {
    id: 3,
    name: "Asian Stir Fry",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19",
    nutrition: "480 cal | Protein: 25g",
    time: "Dinner",
    likes: 52,
    dislikes: 4
  }
];
