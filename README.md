# 🌿 FoodSaver — Food Waste Reduction App

A React Native (Expo) mobile application that helps users **track food inventory**, **get recipe suggestions** based on available ingredients, **donate surplus food** to nearby NGOs, and **view analytics** on food waste reduction.

---

## 📚 Table of Contents

1. [Tech Stack & Libraries](#tech-stack--libraries)
2. [Project Structure Overview](#project-structure-overview)
3. [How the App Starts (Entry Points)](#how-the-app-starts-entry-points)
4. [Configuration Files](#configuration-files)
5. [Data Models (TypeScript Types)](#data-models-typescript-types)
6. [Services — Backend Logic](#services--backend-logic)
7. [Context Providers — State Management](#context-providers--state-management)
8. [Navigation — Screen Routing](#navigation--screen-routing)
9. [Screens — What the User Sees](#screens--what-the-user-sees)
10. [Reusable UI Components](#reusable-ui-components)
11. [Theme System](#theme-system)
12. [Data & Utilities](#data--utilities)
13. [UI → Code Mapping (Quick Reference)](#ui--code-mapping-quick-reference)

---

## Tech Stack & Libraries

| Technology | Purpose | Where Used |
|---|---|---|
| **React Native** (v0.81) | Core mobile UI framework | Every `.tsx` screen/component |
| **Expo** (SDK 54) | Build toolchain, dev server, native APIs | `app.json`, `package.json` |
| **TypeScript** | Type-safe JavaScript | Every `.ts` / `.tsx` file |
| **Firebase Auth** | User signup/login/session | `firebaseConfig.ts`, `authService.ts` |
| **Cloud Firestore** | NoSQL database for inventory, donations, user profiles | `inventoryService.ts`, `donationService.ts`, `authService.ts` |
| **React Navigation** | Screen navigation (stacks + bottom tabs) | `src/navigation/` folder |
| **Spoonacular API** | Live recipe suggestions by ingredients | `recipeService.ts`, `apiConfig.ts` |
| **OpenStreetMap Overpass API** | Find nearby NGOs/food banks by GPS location | `donationService.ts` |
| **expo-location** | Get user's GPS coordinates | `donationService.ts` |
| **AsyncStorage** | Local key-value storage, Firebase auth persistence | `storage.ts`, `firebaseConfig.ts` |
| **react-native-chart-kit** | Line chart on Analytics screen | `AnalyticsScreen.tsx` |
| **date-fns** | Date formatting & math (expiry calculations) | `inventoryService.ts`, multiple screens |
| **@expo/vector-icons** | Material Community Icons throughout UI | Every screen |

---

## Project Structure Overview

```
FoodWasteApp/
├── App.tsx                        ← Root component (wraps providers + navigator)
├── index.ts                       ← Expo entry point (registers App)
├── package.json                   ← Dependencies & scripts
├── app.json                       ← Expo app configuration
├── .env                           ← Environment variables (Firebase API key)
│
└── src/
    ├── config/                    ← Firebase & API configuration
    │   ├── firebaseConfig.ts      ← Firebase app/auth/db initialization
    │   └── apiConfig.ts           ← Spoonacular & Overpass API keys/URLs
    │
    ├── models/                    ← TypeScript interfaces/types
    │   └── types.ts               ← All data models (User, FoodItem, Recipe, etc.)
    │
    ├── services/                  ← Business logic (talks to Firebase/APIs)
    │   ├── authService.ts         ← Signup, login, logout, session
    │   ├── inventoryService.ts    ← CRUD for food items in Firestore
    │   ├── recipeService.ts       ← Spoonacular API recipe matching
    │   ├── donationService.ts     ← NGO discovery + donation creation
    │   ├── analyticsService.ts    ← Compute waste/savings analytics
    │   └── storage.ts             ← AsyncStorage wrapper (local storage)
    │
    ├── context/                   ← React Context providers (global state)
    │   ├── AuthContext.tsx         ← Current user state + login/signup/logout
    │   ├── InventoryContext.tsx    ← Food items state + CRUD actions
    │   └── DonationContext.tsx     ← Donations state + create action
    │
    ├── navigation/                ← React Navigation setup
    │   ├── AppNavigator.tsx        ← Root: shows AuthStack or MainTabs
    │   ├── AuthStack.tsx           ← Login → Signup stack
    │   ├── MainTabs.tsx            ← Bottom tab bar (5 tabs)
    │   ├── InventoryStack.tsx      ← Inventory list → Add/Edit stack
    │   ├── RecipeStack.tsx         ← Recipe list → Recipe detail stack
    │   └── DonateStack.tsx         ← Select items → NGO list → Confirm → History
    │
    ├── screens/                   ← UI screens (what the user sees)
    │   ├── auth/
    │   │   ├── LoginScreen.tsx     ← Email/password login form
    │   │   └── SignupScreen.tsx    ← Registration form
    │   ├── home/
    │   │   └── HomeScreen.tsx      ← Dashboard with summary + expiring items
    │   ├── inventory/
    │   │   ├── InventoryListScreen.tsx  ← List of all food items with filters
    │   │   └── AddEditItemScreen.tsx    ← Form to add/edit food items
    │   ├── recipes/
    │   │   ├── RecipeListScreen.tsx     ← API-matched recipes list
    │   │   └── RecipeDetailScreen.tsx   ← Full recipe with "mark cooked"
    │   ├── donate/
    │   │   ├── SelectItemsScreen.tsx    ← Pick items to donate
    │   │   ├── NGOListScreen.tsx        ← Nearby NGOs from Overpass API
    │   │   ├── DonationConfirmScreen.tsx ← Review & confirm donation
    │   │   └── DonationHistoryScreen.tsx ← Past donations list
    │   └── analytics/
    │       └── AnalyticsScreen.tsx  ← Charts, stats, monthly goal
    │
    ├── components/                ← Reusable UI components
    │   ├── Badge.tsx              ← Expiry status badge (Expired/Soon/Safe)
    │   ├── Button.tsx             ← Multi-variant button component
    │   ├── Card.tsx               ← Shadow card wrapper
    │   ├── EmptyState.tsx         ← "No data" placeholder
    │   ├── FoodItemCard.tsx       ← Food item display card
    │   ├── Input.tsx              ← Styled text input with label/error
    │   ├── LoadingSpinner.tsx     ← Loading indicator
    │   └── ProgressBar.tsx        ← Animated progress bar
    │
    ├── theme/                     ← Design system tokens
    │   ├── colors.ts              ← Color palette
    │   ├── spacing.ts             ← Spacing & border radius values
    │   ├── typography.ts          ← Font sizes & weights
    │   └── index.ts               ← Re-exports all theme tokens
    │
    ├── data/
    │   └── mockData.ts            ← Sample recipes, NGOs, food items for seeding
    │
    └── utils/
        └── uuid.ts                ← Simple unique ID generator
```

---

## How the App Starts (Entry Points)

### `index.ts` — Expo Entry Point
```
registerRootComponent(App)
```
**What it does:** This is the very first file that runs. It tells Expo to render the `App` component as the root of the application.

### `App.tsx` — Root Component
```
<AuthProvider>
  <InventoryProvider>
    <DonationProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </DonationProvider>
  </InventoryProvider>
</AuthProvider>
```
**What it does:** Wraps the entire app in three **Context Providers** (Auth, Inventory, Donation) so that every screen can access user data, food items, and donations. Then renders `AppNavigator` which decides which screen to show.

**Why providers are nested:** `InventoryProvider` needs `AuthProvider` (to know which user's data to load), and `DonationProvider` needs `AuthProvider` too. So `AuthProvider` must be the outermost wrapper.

---

## Configuration Files

### `src/config/firebaseConfig.ts` — Firebase Setup
**What it does:** Initializes the Firebase SDK with the project credentials and exports three objects used everywhere:
- **`app`** — The Firebase app instance
- **`auth`** — Firebase Authentication instance (configured with AsyncStorage so the user stays logged in even after closing the app)
- **`db`** — Firestore database instance (used to read/write inventory, donations, and user profiles)

**Key concept — `getReactNativePersistence(AsyncStorage)`:** This tells Firebase to save the user's login session to the phone's local storage, so they don't have to log in every time they open the app.

### `src/config/apiConfig.ts` — External API Keys
**What it does:** Stores the API keys and base URLs for:
- **Spoonacular API** — Used to fetch recipe suggestions based on ingredients
- **Overpass API** — Used to find nearby NGOs/food banks from OpenStreetMap data

---

## Data Models (TypeScript Types)

### `src/models/types.ts`
This file defines the **shape of all data** used throughout the app. Every variable, function parameter, and database document conforms to these types.

| Type | Fields | Where Used |
|---|---|---|
| **`User`** | `id`, `name`, `email`, `password`, `createdAt` | Auth system, user profiles |
| **`FoodItem`** | `id`, `userId`, `name`, `quantity`, `unit`, `expiryDate`, `category`, `createdAt` | Inventory system |
| **`FoodCategory`** | `'Fridge' \| 'Pantry' \| 'Freezer'` | Category filter chips |
| **`ExpiryStatus`** | `'expired' \| 'today' \| 'soon' \| 'safe'` | Color-coded badges |
| **`Donation`** | `id`, `userId`, `items[]`, `ngoName`, `ngoId`, `date`, `status` | Donation flow |
| **`DonationItem`** | `name`, `quantity`, `unit` | Items within a donation |
| **`Recipe`** | `id`, `name`, `cookingTime`, `ingredients[]`, `instructions[]`, `image`, `servings`, `difficulty` | Recipe screens |
| **`RecipeIngredient`** | `name`, `quantity`, `matched?` | Ingredient matching |
| **`NGO`** | `id`, `name`, `address`, `distance`, `pickupAvailable`, `operatingHours`, `phone` | NGO list |
| **`Analytics`** | `wasteReduced`, `moneySaved`, `weeklyData[]`, `categoryBreakdown[]`, `monthlyGoal`, `monthlyProgress`, `totalDonations`, `itemsSaved` | Analytics dashboard |
| **`AuthSession`** | `user`, `token`, `expiresAt` | Login/signup return value |

---

## Services — Backend Logic

These files contain the **actual business logic** that talks to Firebase and external APIs. Screens never talk to Firebase directly — they always go through a Service.

### `src/services/authService.ts` — Authentication Service

| Function | What It Does |
|---|---|
| **`AuthService.signup(name, email, password)`** | 1. Creates user in Firebase Auth via `createUserWithEmailAndPassword()`. 2. Sets the display name via `updateProfile()`. 3. Saves user profile to Firestore `users/{uid}` collection. 4. Returns an `AuthSession` with user data + JWT token. |
| **`AuthService.login(email, password)`** | 1. Signs in via `signInWithEmailAndPassword()`. 2. Fetches user profile from Firestore `users/{uid}`. 3. Returns `AuthSession`. |
| **`AuthService.getSession()`** | Checks if there's a currently logged-in Firebase user (`auth.currentUser`). If yes, fetches their profile from Firestore and returns the session. Used to restore login state on app restart. |
| **`AuthService.logout()`** | Calls `signOut(auth)` to clear the Firebase session. |

### `src/services/inventoryService.ts` — Food Inventory Service

All food items are stored in Firestore at path: `users/{userId}/foodItems/{itemId}`

| Function | What It Does |
|---|---|
| **`InventoryService.getItems(userId)`** | Queries all food items for a user from Firestore, ordered by `createdAt` descending (newest first). Returns array of `FoodItem`. |
| **`InventoryService.addItem(userId, name, quantity, unit, expiryDate, category)`** | Creates a new food item document in Firestore using `addDoc()`. Sets `createdAt` to current timestamp. Returns the new `FoodItem` with its generated Firestore ID. |
| **`InventoryService.updateItem(itemId, updates, userId)`** | Updates specific fields of an existing food item using `updateDoc()`. Used when editing name, quantity, unit, or category. |
| **`InventoryService.deleteItem(itemId, userId)`** | Permanently removes a food item from Firestore using `deleteDoc()`. |
| **`InventoryService.getItemsByCategory(userId, category)`** | Fetches all items, then filters client-side by category (Fridge/Pantry/Freezer). |
| **`InventoryService.getExpiringItems(userId, limit?)`** | Gets items expiring within 3 days. Uses `date-fns` `differenceInDays()` to calculate days until expiry. Sorts by expiry date ascending (most urgent first). |
| **`InventoryService.getExpiryStatus(expiryDate)`** | Pure function. Returns `'expired'` if past due, `'today'` if expires today, `'soon'` if within 3 days, `'safe'` otherwise. **This drives the color-coded badges on the UI.** |
| **`InventoryService.getDaysUntilExpiry(expiryDate)`** | Returns the number of days until expiry (negative = already expired). |
| **`InventoryService.seedData(userId)`** | Called once when a new user signs up. Uses Firestore `writeBatch()` to insert 15 sample food items (from `mockData.ts`) so the app doesn't look empty. Only runs if the user has 0 items. |
| **`InventoryService.decreaseQuantity(itemId, amount, userId)`** | Reduces an item's quantity (e.g., after cooking a recipe). If quantity reaches 0, deletes the item entirely. |

### `src/services/recipeService.ts` — Recipe Suggestion Service

Uses the **Spoonacular API** to find recipes that match the user's current inventory.

| Function | What It Does |
|---|---|
| **`RecipeService.getMatchingRecipes(inventoryItems)`** | 1. Extracts ingredient names from inventory items and joins them as a comma-separated string. 2. Calls Spoonacular `findByIngredients` endpoint with `ranking=2` (minimize missing ingredients). 3. Returns up to 15 recipes sorted by match percentage. Each result is a `RecipeMatch` containing: the recipe, how many ingredients matched, which ones are missing, and the match percentage. |
| **`RecipeService.getRecipeById(id)`** | Fetches full recipe details (instructions, all ingredients, cooking time) from Spoonacular's `recipes/{id}/information` endpoint. Parses `analyzedInstructions` into step-by-step array. Determines difficulty based on cooking time: ≤30 min = Easy, ≤60 min = Medium, >60 min = Hard. |

### `src/services/donationService.ts` — Donation & NGO Service

| Function | What It Does |
|---|---|
| **`DonationService.createDonation(userId, items, ngoId, ngoName)`** | Saves a new donation document to Firestore at `users/{userId}/donations`. Sets status to `'pending'`. Returns the created `Donation` object. |
| **`DonationService.getNGOs()`** | 1. Requests location permission via `expo-location`. 2. Gets user's GPS coordinates (falls back to Mumbai coordinates if denied). 3. Builds an Overpass QL query to search for social facilities, food banks, and charities within 25km radius. 4. Sends POST request to Overpass API. 5. Parses results, calculates distance using **Haversine formula**, removes duplicates, sorts by distance. 6. Returns up to 15 nearest NGOs. If API fails or returns nothing, returns hardcoded fallback NGOs. |
| **`DonationService.calculateDistance(lat1, lon1, lat2, lon2)`** | Private helper that implements the **Haversine formula** to calculate the great-circle distance between two GPS coordinates in kilometers. |
| **`DonationService.getDonations(userId)`** | Fetches all past donations from Firestore `users/{userId}/donations`, ordered by date descending. |

### `src/services/analyticsService.ts` — Analytics Computation

| Function | What It Does |
|---|---|
| **`AnalyticsService.getAnalytics(userId)`** | Computes all analytics from real Firestore data: **wasteReduced** = kg estimate from donated items + tracked items. **moneySaved** = ₹30 per tracked item + ₹50 per donation. **weeklyData** = donation quantities grouped by day of week (for the line chart). **categoryBreakdown** = count of items per category (Fridge/Pantry/Freezer) for the bar chart. **monthlyGoal** = hardcoded 10 kg target. **monthlyProgress** = current waste reduced capped at goal. |

### `src/services/storage.ts` — Local Storage Wrapper

| Function | What It Does |
|---|---|
| **`StorageService.get<T>(key)`** | Reads a value from AsyncStorage and JSON-parses it. |
| **`StorageService.set<T>(key, value)`** | JSON-stringifies and saves a value to AsyncStorage. |
| **`StorageService.remove(key)`** | Deletes a key from AsyncStorage. |
| **`StorageService.clear()`** | Clears all AsyncStorage data. |

---

## Context Providers — State Management

Contexts use React's `createContext` + `useContext` pattern. They wrap the app so any screen can access shared state without prop drilling.

### `src/context/AuthContext.tsx`

**Provides:** `user`, `isAuthenticated`, `isLoading`, `login()`, `signup()`, `logout()`

| Function/Hook | What It Does |
|---|---|
| **`AuthProvider`** | Component that wraps the app. On mount, it calls `onAuthStateChanged(auth, ...)` — a Firebase listener that fires whenever the user logs in or out. When fired, it fetches the user profile from Firestore and updates the `user` state. |
| **`login(email, password)`** | Calls `AuthService.login()`, then sets the user in state. |
| **`signup(name, email, password)`** | Calls `AuthService.signup()`, sets user in state, then calls `InventoryService.seedData()` to populate the new user's inventory with sample items. |
| **`logout()`** | Calls `AuthService.logout()` and clears user state to `null`. |
| **`useAuth()`** | Custom hook. Any screen calls `const { user, login, logout } = useAuth()` to access auth state. |

### `src/context/InventoryContext.tsx`

**Provides:** `items`, `isLoading`, `loadItems()`, `addItem()`, `updateItem()`, `deleteItem()`, `getExpiringItems()`

| Function | What It Does |
|---|---|
| **`loadItems()`** | Calls `InventoryService.getItems(user.id)` and stores the result in state. Called whenever a screen needs fresh data. |
| **`addItem(...)`** | Calls `InventoryService.addItem()` then refreshes the list. |
| **`updateItem(itemId, updates)`** | Calls `InventoryService.updateItem()` then refreshes. |
| **`deleteItem(itemId)`** | Calls `InventoryService.deleteItem()` then refreshes. |
| **`useInventory()`** | Custom hook for screens to access inventory state. |

### `src/context/DonationContext.tsx`

**Provides:** `donations`, `isLoading`, `loadDonations()`, `createDonation()`

| Function | What It Does |
|---|---|
| **`loadDonations()`** | Fetches donation history from Firestore via `DonationService.getDonations()`. |
| **`createDonation(items, ngoId, ngoName)`** | Creates a new donation via `DonationService.createDonation()` then refreshes the list. |
| **`useDonation()`** | Custom hook for donation screens. |

---

## Navigation — Screen Routing

### `src/navigation/AppNavigator.tsx` — Root Navigator
**What it does:** Checks `isAuthenticated` from `useAuth()`. If the user is logged in → shows `MainTabs`. If not → shows `AuthStack`. While checking auth state (`isLoading`), shows a `LoadingSpinner`.

### `src/navigation/AuthStack.tsx` — Login/Signup Flow
Stack navigator with two screens: `Login` → `Signup`. No header shown. Slide-from-right animation.

### `src/navigation/MainTabs.tsx` — Bottom Tab Bar
Creates 5 bottom tabs using `createBottomTabNavigator`:

| Tab | Icon | Screen/Stack | What It Shows |
|---|---|---|---|
| **Home** | `home` | `HomeScreen` | Dashboard overview |
| **Inventory** | `fridge-outline` | `InventoryStack` | Food items list + add/edit |
| **Recipes** | `chef-hat` | `RecipeStack` | Recipe suggestions + details |
| **Donate** | `heart-outline` | `DonateStack` | Donation flow (4 screens) |
| **Analytics** | `chart-bar` | `AnalyticsScreen` | Charts & stats |

### `src/navigation/InventoryStack.tsx`
Stack: `InventoryList` → `AddEditItem` (with optional `item` param for editing)

### `src/navigation/RecipeStack.tsx`
Stack: `RecipeList` → `RecipeDetail` (receives `recipeMatch` param)

### `src/navigation/DonateStack.tsx`
Stack: `SelectItems` → `NGOList` (receives `selectedItems`) → `DonationConfirm` (receives `selectedItems` + `ngo`) → `DonationHistory`

---

## Screens — What the User Sees

### `src/screens/auth/LoginScreen.tsx` — Login Page

**What the user sees:** A centered form with the app logo (leaf icon), "FoodSaver" title, email input, password input, "Log In" button, and a "Sign up" link at the bottom.

| Function | What It Does |
|---|---|
| **`validate()`** | Checks that email is non-empty and matches `\S+@\S+\.\S+` regex pattern, and password is at least 6 characters. Sets error messages below the fields if validation fails. |
| **`handleLogin()`** | Calls `validate()` first. If valid, calls `login(email, password)` from `useAuth()` context. Shows loading spinner on the button. If Firebase returns an error (wrong password, user not found), shows an `Alert.alert()` popup. |

**Navigation:** "Sign up" link calls `navigation.navigate('Signup')`.

---

### `src/screens/auth/SignupScreen.tsx` — Registration Page

**What the user sees:** Similar to login but with 4 fields: Full Name, Email, Password, Confirm Password.

| Function | What It Does |
|---|---|
| **`validate()`** | Validates all 4 fields — name required, email format, password ≥ 6 chars, confirm password must match. |
| **`handleSignup()`** | Calls `signup(name, email, password)` from `useAuth()`. On success, the `AuthContext` automatically calls `InventoryService.seedData()` to populate 15 sample food items for the new user. |

---

### `src/screens/home/HomeScreen.tsx` — Dashboard (Home Tab)

**What the user sees:** Greeting with user's first name, logout button, two impact cards (Money Saved, Waste Reduced), "Expiring Soon" section showing up to 3 items, Quick Action buttons (Add Item, Recipes, Donate), and Inventory Overview (Fridge/Pantry/Freezer/Total counts).

| Function | What It Does |
|---|---|
| **`loadData()`** | Loads inventory items via `loadItems()` from `useInventory()`, then fetches analytics via `AnalyticsService.getAnalytics(user.id)`. Called every time the screen comes into focus via `useFocusEffect`. |
| **`onRefresh()`** | Called when user pulls down to refresh. Re-runs `loadData()`. |
| **`useEffect` (expiring filter)** | Whenever `items` changes, filters items expiring within 3 days, sorts by expiry date, takes the top 3. These appear in the "Expiring Soon" section. |
| **`QuickAction` component** | Inline component rendering a tappable icon+label. "Add Item" navigates to `InventoryTab > AddEditItem`. "Recipes" navigates to `RecipesTab`. "Donate" navigates to `DonateTab`. |

**Inventory Overview:** Counts items by category using `items.filter(i => i.category === 'Fridge').length` etc.

---

### `src/screens/inventory/InventoryListScreen.tsx` — Food Items List (Inventory Tab)

**What the user sees:** Category filter chips (All/Fridge/Pantry/Freezer) at top, item count, scrollable list of food item cards with color-coded expiry badges, a floating "+" button to add items.

| Function | What It Does |
|---|---|
| **`useFocusEffect → loadItems()`** | Refreshes the inventory from Firestore every time the screen is focused. |
| **`filteredItems`** | If `selectedCategory` is 'All', shows all items. Otherwise filters by the selected category. |
| **`sortedItems`** | Sorts filtered items by `expiryDate` ascending so most urgent items appear first. |
| **`handleDelete(item)`** | Shows a confirmation `Alert.alert()` dialog ("Are you sure?"). On confirm, calls `deleteItem(item.id)` from context which deletes from Firestore. |
| **`renderItem`** | Renders each item as a `FoodItemCard` component. Tap → navigates to `AddEditItem` with the item data for editing. Swipe/delete icon → calls `handleDelete`. |
| **FAB (Floating Action Button)** | Green "+" button positioned at bottom-right. Navigates to `AddEditItem` with no params (= add new mode). |

---

### `src/screens/inventory/AddEditItemScreen.tsx` — Add/Edit Food Item Form

**What the user sees:** Form with: item name input, quantity input + unit selector chips (pcs/g/kg/L/ml/loaf), category selector cards (Fridge/Pantry/Freezer with icons), days-until-expiry input (add mode) or read-only expiry date (edit mode), and Save button.

| Function | What It Does |
|---|---|
| **`validate()`** | Checks name is non-empty, quantity is a positive number, expiry days is valid (add mode only). |
| **`handleSave()`** | **Add mode:** Calculates expiry date as `addDays(new Date(), expiryDays)`, calls `addItem(name, quantity, unit, expiry, category)` from context. **Edit mode:** Calls `updateItem(existingItem.id, { name, quantity, unit, category })`. Shows success alert and navigates back. |

**Edit vs Add detection:** `const isEditing = !!route.params?.item` — if the navigation passed an `item` param, it's edit mode.

---

### `src/screens/recipes/RecipeListScreen.tsx` — Recipe Suggestions (Recipes Tab)

**What the user sees:** Info banner showing inventory item count, list of recipe cards each showing: recipe image from Spoonacular, name, cooking time, servings, difficulty, a colored match percentage bar, and which ingredients are available vs missing.

| Function | What It Does |
|---|---|
| **`useFocusEffect → loadItems()`** | Refreshes inventory from Firestore when screen is focused. |
| **`useEffect → loadRecipes()`** | When `items` array changes, calls `RecipeService.getMatchingRecipes(items)` to fetch matching recipes from Spoonacular API. Stores results in `recipes` state. |
| **`getMatchColor(percentage)`** | Returns green (`Colors.safe`) for ≥80% match, yellow (`Colors.warning`) for ≥50%, red (`Colors.danger`) for below. |
| **`renderRecipe`** | Renders each `RecipeMatch` as a card. Shows the recipe image via `<Image source={{ uri: item.recipe.image }} />`. Tapping navigates to `RecipeDetail` with the full `recipeMatch` object. |

---

### `src/screens/recipes/RecipeDetailScreen.tsx` — Full Recipe View

**What the user sees:** Hero section with recipe image (circular), name, cooking time / servings / difficulty metadata. Ingredients card with checkmarks (✅ matched from inventory, ○ missing). Step-by-step instructions with numbered circles. "Mark as Cooked" button at bottom.

| Function | What It Does |
|---|---|
| **`useEffect → loadDetails()`** | Calls `RecipeService.getRecipeById(basicRecipe.id)` to fetch full recipe details (instructions, all ingredients) from Spoonacular. The list screen only has partial data. |
| **`handleMarkCooked()`** | Shows confirmation alert. On confirm: loops through `matchedIngredients`, finds matching items in inventory by name, calls `InventoryService.decreaseQuantity()` for each. This reduces inventory quantities or removes items that reach 0. Then refreshes inventory and shows success alert. |

**Ingredient matching logic:** `items.find(i => i.name.toLowerCase().includes(ingredient.name.toLowerCase()))` — fuzzy match between recipe ingredient names and inventory item names.

---

### `src/screens/donate/SelectItemsScreen.tsx` — Select Items to Donate

**What the user sees:** Info banner, "View Donation History" link, checklist of all inventory items with checkboxes. Bottom bar appears when items are selected showing count and "Choose NGO →" button.

| Function | What It Does |
|---|---|
| **`toggleItem(id)`** | Adds/removes an item ID from the `selected` Set. Uses immutable Set updates. |
| **`handleNext()`** | Converts selected item IDs to `DonationItem[]` objects (name, quantity, unit), then navigates to `NGOList` passing `selectedItems`. |

---

### `src/screens/donate/NGOListScreen.tsx` — Choose NGO (Live API)

**What the user sees:** Location-based banner showing number of nearby organizations, list of NGO cards each showing: name, address, distance in km, operating hours, and pickup availability badge.

| Function | What It Does |
|---|---|
| **`useEffect → loadNGOs()`** | Calls `DonationService.getNGOs()` which: requests GPS permission → gets coordinates → queries Overpass API for nearby social facilities → calculates distances → returns sorted list. Falls back to hardcoded NGOs if API fails. |
| **`renderNGO`** | Renders each NGO as a card. Tapping navigates to `DonationConfirm` passing both `selectedItems` and the chosen `ngo`. |

---

### `src/screens/donate/DonationConfirmScreen.tsx` — Review & Confirm Donation

**What the user sees:** Heart banner "Review Your Donation", NGO info card with name/address/distance/pickup badge, list of items being donated with quantities, "Confirm Donation" button, and "Cancel" button.

| Function | What It Does |
|---|---|
| **`handleConfirm()`** | Calls `createDonation(selectedItems, ngo.id, ngo.name)` from `useDonation()` context. This saves the donation to Firestore. On success, shows a celebratory alert. On dismiss, resets the navigation stack back to `SelectItems` using `CommonActions.reset()`. |

---

### `src/screens/donate/DonationHistoryScreen.tsx` — Past Donations

**What the user sees:** Summary banner ("You've made X donations!"), list of past donation cards each showing: NGO name with heart icon, status badge (pending/confirmed/completed), formatted date, and list of donated items.

| Function | What It Does |
|---|---|
| **`useFocusEffect → loadDonations()`** | Fetches donation history from Firestore every time screen is focused. |
| **`getStatusColor(status)`** | Returns green for 'completed', yellow for 'confirmed', grey for 'pending'. |
| **Date formatting** | Uses `format(parseISO(item.date), 'MMM dd, yyyy • h:mm a')` from `date-fns`. |

---

### `src/screens/analytics/AnalyticsScreen.tsx` — Analytics Dashboard (Analytics Tab)

**What the user sees:** Title "Analytics Dashboard", 4 summary cards (Waste Reduced, Money Saved, Donations, Items Tracked), a weekly waste trend line chart, category breakdown with horizontal bars, and monthly goal progress bar.

| Function | What It Does |
|---|---|
| **`loadAnalytics()`** | Calls `AnalyticsService.getAnalytics(user.id)` which computes all stats from real Firestore data. Called via `useFocusEffect`. |
| **`onRefresh()`** | Pull-to-refresh handler. Re-runs `loadAnalytics()`. |
| **Line Chart** | Uses `react-native-chart-kit`'s `<LineChart>` component. Data comes from `analytics.weeklyData` (day names + waste amounts). Renders a bezier curve with green color. |
| **Category Breakdown** | Renders horizontal bars for Fridge/Pantry/Freezer. Bar width = `(cat.amount / analytics.itemsSaved) * 100` percent. |
| **Monthly Goal** | Uses the `<ProgressBar>` component with `progress={monthlyProgress / monthlyGoal}`. Shows "Goal Achieved! 🎉" if reached. |

---

## Reusable UI Components

### `src/components/Button.tsx` — Multi-Variant Button
A customizable button supporting 5 variants: `primary` (green), `secondary` (light green bg), `danger` (red), `outline` (green border), `ghost` (transparent). Props: `title`, `onPress`, `variant`, `loading` (shows spinner), `disabled`, `icon`, `fullWidth`.

**`getVariantStyles(variant)`** — Returns the correct background color and text color for each variant.

### `src/components/Card.tsx` — Shadow Card Wrapper
A simple `View` wrapper that applies white background, rounded corners (`BorderRadius.base = 12`), and a subtle shadow. All content cards in the app use this.

### `src/components/Input.tsx` — Styled Text Input
A labeled text input with: uppercase label, styled input field, error message display, and support for password mode (`secureTextEntry`), numeric keyboard, multiline, and disabled state.

### `src/components/Badge.tsx` — Expiry Status Badge + Category Badge
**`Badge`** — Shows a colored pill with text: red "EXPIRED", red "TODAY", yellow "SOON", green "SAFE". Configuration is in `BADGE_CONFIG` mapping.
**`CategoryBadge`** — Shows the storage category: blue for Fridge, orange for Pantry, purple for Freezer.

### `src/components/FoodItemCard.tsx` — Food Item Display Card
The main card used to display food items throughout the app. Has two modes:
- **Full mode** (inventory list): Shows icon, name, quantity, unit, expiry date, category badge, expiry status badge, days-left text, and optional delete button.
- **Compact mode** (home screen expiring section): Simplified horizontal layout with just name, expiry text, and badge.

**Key functions:**
- **`getExpiryText()`** — Returns human-readable text like "Expired 2 day(s) ago", "Expires today!", "Expires tomorrow", or "5 days left".
- Uses `InventoryService.getExpiryStatus()` and `InventoryService.getDaysUntilExpiry()` to determine status and color.

### `src/components/EmptyState.tsx` — Empty List Placeholder
Shows a large icon, title, and message when a list has no data. Used in inventory list, recipe list, donation history, etc.

### `src/components/LoadingSpinner.tsx` — Loading Indicator
A centered `ActivityIndicator` with an optional message. Used as full-screen loading state while data is being fetched.

### `src/components/ProgressBar.tsx` — Animated Progress Bar
Shows a track with an animated fill. Uses `Animated.spring()` for smooth animation when progress changes. Shows optional label and percentage text. Used in the Analytics screen for the monthly goal.

---

## Theme System

### `src/theme/colors.ts`
Defines the entire color palette:
- **Primary:** `#2ECC71` (green) — used for buttons, active states, primary accents
- **Status colors:** `danger` (#E74C3C red), `warning` (#F39C12 yellow), `safe` (#2ECC71 green)
- **Text hierarchy:** `textPrimary` (#1A1A2E), `textSecondary` (#6C757D), `textLight` (#ADB5BD)
- **Chart colors:** 6 distinct colors for data visualization

### `src/theme/spacing.ts`
Spacing scale: `xs=4, sm=8, md=12, base=16, lg=20, xl=24, xxl=32, xxxl=40, huge=48`
Border radius scale: `sm=6, md=8, base=12, lg=16, xl=20, full=9999`

### `src/theme/typography.ts`
Font size/weight presets: `h1` (28px/800), `h2` (22px/700), `h3` (18px/600), `body` (16px/400), `bodyBold` (16px/600), `caption` (13px/400), `small` (11px/400), `button` (16px/600), `tabLabel` (11px/500)

### `src/theme/index.ts`
Re-exports everything: `Colors`, `Spacing`, `BorderRadius`, `Typography`.

---

## Data & Utilities

### `src/data/mockData.ts`
Contains three datasets used for seeding and fallbacks:
- **`MOCK_RECIPES`** — 15 sample recipes (Vegetable Stir Fry, Tomato Basil Pasta, etc.) with ingredients and step-by-step instructions. Used as offline fallback.
- **`MOCK_NGOS`** — 6 sample NGOs with names, addresses, distances, and phone numbers. Used as offline fallback.
- **`SAMPLE_FOOD_ITEMS`** — 15 common food items (Milk, Eggs, Bread, etc.) with categories and days-until-expiry. Used by `InventoryService.seedData()` to populate a new user's inventory.

### `src/utils/uuid.ts`
**`uuidv4()`** — Generates a simple unique ID by combining `Date.now().toString(36)` with a random string. Used as a lightweight alternative to the `uuid` npm package for generating IDs.

---

## UI → Code Mapping (Quick Reference)

Use this table to quickly find where any UI feature lives in the code:

| What You See in the App | Screen File | Service Called | Context Used |
|---|---|---|---|
| **Login form** | `screens/auth/LoginScreen.tsx` | `AuthService.login()` | `AuthContext.login()` |
| **Signup form** | `screens/auth/SignupScreen.tsx` | `AuthService.signup()` | `AuthContext.signup()` |
| **Home dashboard** | `screens/home/HomeScreen.tsx` | `AnalyticsService.getAnalytics()` | `useAuth()`, `useInventory()` |
| **"Expiring Soon" items on home** | `screens/home/HomeScreen.tsx` (line ~46) | — (filters from loaded items) | `useInventory().items` |
| **Quick action buttons** | `screens/home/HomeScreen.tsx` (line ~178) | — (just navigation) | — |
| **Inventory list with filters** | `screens/inventory/InventoryListScreen.tsx` | `InventoryService.getItems()` | `useInventory()` |
| **Category filter chips** | `screens/inventory/InventoryListScreen.tsx` (line ~72) | — (client-side filter) | — |
| **Add food item form** | `screens/inventory/AddEditItemScreen.tsx` | `InventoryService.addItem()` | `useInventory().addItem()` |
| **Edit food item** | `screens/inventory/AddEditItemScreen.tsx` | `InventoryService.updateItem()` | `useInventory().updateItem()` |
| **Delete food item** | `screens/inventory/InventoryListScreen.tsx` (line ~46) | `InventoryService.deleteItem()` | `useInventory().deleteItem()` |
| **Green "+" FAB button** | `screens/inventory/InventoryListScreen.tsx` (line ~118) | — (navigates to AddEditItem) | — |
| **Recipe suggestions list** | `screens/recipes/RecipeListScreen.tsx` | `RecipeService.getMatchingRecipes()` | `useInventory().items` |
| **Recipe match % bar** | `screens/recipes/RecipeListScreen.tsx` (line ~106) | — (from RecipeMatch data) | — |
| **Recipe detail + instructions** | `screens/recipes/RecipeDetailScreen.tsx` | `RecipeService.getRecipeById()` | `useInventory()`, `useAuth()` |
| **"Mark as Cooked" button** | `screens/recipes/RecipeDetailScreen.tsx` (line ~53) | `InventoryService.decreaseQuantity()` | `useInventory().loadItems()` |
| **Select items to donate** | `screens/donate/SelectItemsScreen.tsx` | — (uses loaded items) | `useInventory()` |
| **NGO list (live from map)** | `screens/donate/NGOListScreen.tsx` | `DonationService.getNGOs()` | — |
| **Confirm donation** | `screens/donate/DonationConfirmScreen.tsx` | `DonationService.createDonation()` | `useDonation().createDonation()` |
| **Donation history** | `screens/donate/DonationHistoryScreen.tsx` | `DonationService.getDonations()` | `useDonation()` |
| **Analytics charts** | `screens/analytics/AnalyticsScreen.tsx` | `AnalyticsService.getAnalytics()` | `useAuth()` |
| **Weekly waste line chart** | `screens/analytics/AnalyticsScreen.tsx` (line ~109) | — (data from AnalyticsService) | — |
| **Monthly goal progress** | `screens/analytics/AnalyticsScreen.tsx` (line ~173) | — (data from AnalyticsService) | — |
| **Bottom tab bar** | `navigation/MainTabs.tsx` | — | — |
| **Expiry color badges** | `components/Badge.tsx` + `components/FoodItemCard.tsx` | `InventoryService.getExpiryStatus()` | — |
| **Loading spinners** | `components/LoadingSpinner.tsx` | — | — |

---

## How to Run

```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start

# Scan the QR code with Expo Go app on your phone
```

## Environment Variables

Create a `.env` file in the root directory:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
```
