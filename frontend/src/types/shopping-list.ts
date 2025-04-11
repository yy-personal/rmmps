// src/types/shopping-list.ts

export interface ShoppingListItem {
    ingredientId: number;
    ingredientName: string;
    quantity: string;
    purchased: boolean;
    recipeId?: number;
    recipeTitle?: string;
    servings?: number;
}

export interface ShoppingList {
    id: number;
    title: string;
    userEmail: string;
    createdAt: string;
    items: ShoppingListItem[];
}

export interface ShoppingListCreateRequest {
    title: string;
    recipeIds: number[];
}

// Group items by recipe for better display
export interface GroupedItems {
    [key: string]: ShoppingListItem[];
}