import { Recipe, FoodItem, RecipeIngredient } from '../models/types';
import { API_CONFIG } from '../config/apiConfig';

export interface RecipeMatch {
  recipe: Recipe;
  matchedCount: number;
  totalIngredients: number;
  matchPercentage: number;
  matchedIngredients: RecipeIngredient[];
  missingIngredients: RecipeIngredient[];
}

export class RecipeService {
  /**
   * Get recipes from Spoonacular API that match available inventory items.
   */
  static async getMatchingRecipes(inventoryItems: FoodItem[]): Promise<RecipeMatch[]> {
    if (inventoryItems.length === 0) return [];

    // Comma-separated list of ingredient names
    const ingredientsString = inventoryItems.map(item => item.name.toLowerCase().replace(/[^a-z0-9 ]/g, '')).join(',');

    try {
      const response = await fetch(
        `${API_CONFIG.SPOONACULAR_BASE_URL}/recipes/findByIngredients?apiKey=${API_CONFIG.SPOONACULAR_API_KEY}&ingredients=${ingredientsString}&number=15&ranking=2`
      );

      if (!response.ok) {
        console.error('Spoonacular API error:', await response.text());
        throw new Error('Failed to fetch recipes from Spoonacular');
      }

      const data = await response.json();

      const matches: RecipeMatch[] = data.map((item: any) => {
        const matchedCount = item.usedIngredientCount || 0;
        const totalCount = matchedCount + (item.missedIngredientCount || 0);

        const matchedIngredients = item.usedIngredients?.map((ing: any) => ({
          name: ing.name,
          quantity: `${Math.round(ing.amount * 10) / 10} ${ing.unitLong || ing.unit}`,
          matched: true,
        })) || [];

        const missingIngredients = item.missedIngredients?.map((ing: any) => ({
          name: ing.name,
          quantity: `${Math.round(ing.amount * 10) / 10} ${ing.unitLong || ing.unit}`,
          matched: false,
        })) || [];

        const recipe: Recipe = {
          id: item.id.toString(),
          name: item.title,
          cookingTime: 30, // Default; will be updated when specific recipe is loaded
          ingredients: [...matchedIngredients, ...missingIngredients],
          instructions: [], // Default; will be loaded on demand
          image: item.image,
          servings: 2, // Default
          difficulty: 'Medium',
        };

        return {
          recipe,
          matchedCount,
          totalIngredients: totalCount,
          matchPercentage: totalCount === 0 ? 0 : Math.round((matchedCount / totalCount) * 100),
          matchedIngredients,
          missingIngredients,
        };
      });

      // Filter out low matches or 0 matches
      return matches
        .filter(m => m.matchedCount > 0)
        .sort((a, b) => {
          if (b.matchPercentage !== a.matchPercentage) {
            return b.matchPercentage - a.matchPercentage;
          }
          return a.missingIngredients.length - b.missingIngredients.length;
        });

    } catch (error) {
      console.error('getMatchingRecipes Error:', error);
      return [];
    }
  }

  /**
   * Get full recipe instructions and details by ID from Spoonacular API
   */
  static async getRecipeById(id: string): Promise<Recipe | undefined> {
    try {
      const response = await fetch(
        `${API_CONFIG.SPOONACULAR_BASE_URL}/recipes/${id}/information?apiKey=${API_CONFIG.SPOONACULAR_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recipe details');
      }

      const data = await response.json();

      let instructions: string[] = [];
      if (data.analyzedInstructions && data.analyzedInstructions.length > 0) {
        instructions = data.analyzedInstructions[0].steps.map((step: any) => step.step);
      } else if (data.instructions) {
        // Fallback for older recipes
        instructions = data.instructions.replace(/<[^>]*>?/gm, '').split('\n').filter((s: string) => s.trim() !== '');
      } else {
        instructions = ['No instructions provided by the recipe author.'];
      }

      const ingredients = data.extendedIngredients?.map((ing: any) => ({
        name: ing.nameClean || ing.name,
        quantity: `${Math.round(ing.amount * 10)/10} ${ing.unit}`,
        matched: false, // We check matched status in the RecipeMatch object
      })) || [];

      // Calculate difficulty based on time
      const difficulty = data.readyInMinutes > 60 ? 'Hard' : data.readyInMinutes > 30 ? 'Medium' : 'Easy';

      return {
        id: data.id.toString(),
        name: data.title,
        cookingTime: data.readyInMinutes || 30,
        ingredients,
        instructions,
        image: data.image,
        servings: data.servings || 2,
        difficulty,
      };
    } catch (error) {
      console.error('getRecipeById Error:', error);
      return undefined;
    }
  }
}
