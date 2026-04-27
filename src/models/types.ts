export type FoodCategory = 'Fridge' | 'Pantry' | 'Freezer';

export type ExpiryStatus = 'expired' | 'today' | 'soon' | 'safe';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed in production
  createdAt: string;
}

export interface FoodItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string; // ISO date string
  category: FoodCategory;
  createdAt: string;
}

export interface Donation {
  id: string;
  userId: string;
  items: DonationItem[];
  ngoName: string;
  ngoId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface DonationItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  cookingTime: number; // in minutes
  ingredients: RecipeIngredient[];
  instructions: string[];
  image: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  matched?: boolean;
}

export interface NGO {
  id: string;
  name: string;
  address: string;
  distance: number; // in km
  pickupAvailable: boolean;
  operatingHours: string;
  phone: string;
}

export interface Analytics {
  wasteReduced: number; // in kg
  moneySaved: number; // in ₹
  weeklyData: { day: string; waste: number }[];
  categoryBreakdown: { category: string; amount: number; color: string }[];
  monthlyGoal: number;
  monthlyProgress: number;
  totalDonations: number;
  itemsSaved: number;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}
