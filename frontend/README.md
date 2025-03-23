# RMMPS - Frontend Service

The frontend service for the Recipe Management and Meal Planning System built with React, TypeScript, and Material-UI.

## Features

- **Recipe Management**: Create, view, edit, and delete recipes
- **User Authentication**: JWT-based authentication system with access and refresh tokens
- **Responsive Design**: Fully responsive UI optimized for desktop, tablet, and mobile devices
- **Material UI**: Modern and clean user interface using Material-UI components
- **Form Validation**: Client-side validation for all forms

## Project Structure

```
frontend/
├── public/                # Static files
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── Header/        # Application header
│   │   ├── Login/         # Authentication components
│   │   ├── RecipeCard/    # Recipe card component
│   │   ├── RecipeDetail/  # Recipe detail modal
│   │   ├── RecipeForm/    # Recipe creation/editing form
│   │   └── RecipeList/    # Recipe list/grid view
│   ├── contexts/          # React contexts
│   │   └── auth-context.ts # Authentication context
│   ├── hooks/             # Custom React hooks
│   │   └── http-hook.ts   # HTTP request hook
│   ├── templates/         # Template components
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
└── package.json           # Dependencies and scripts
```

## Running the App Locally

### Pre-requisites

- Node.js: Install from https://nodejs.org/en/download (version 18+ recommended)
- Backend service running (see main project README)

### Configuration

Configure the backend connection in `.env`:

```.env
REACT_APP_BACKEND_URL=http://localhost:8080/api
REACT_APP_ASSET_URL=http://localhost:8080
```

### Running Locally

```bash
# From the root folder of the project, navigate to the frontend folder
cd frontend

# Install all necessary packages with npm
npm i

# Run the frontend at localhost:3000
npm start
```

## Key Features Implementation

### Authentication

Authentication is implemented using JWT tokens with the Context API. The system uses:
- Access tokens for API authorization
- Refresh tokens for obtaining new access tokens
- Automatic token refresh when access tokens expire

See `src/contexts/auth-context.ts` and `src/App.tsx` for implementation details.

### Making HTTP Requests

For convenient HTTP requests, use the custom React hook `useHttpClient` defined in `hooks/http-hook.ts`:

```tsx
import { useHttpClient } from "hooks/http-hook";

function MyComponent() {
  const { isLoading, sendRequest, serverError, statusCode } = useHttpClient();
  
  // Example GET request
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/recipes`
        );
        // Handle response data
      } catch (err) {
        console.log(
          serverError || err.message || `Unknown error: ${statusCode}`
        );
      }
    };
    fetchData();
  }, [sendRequest, serverError, statusCode]);
  
  // Handle loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Component rendering
  return (
    // Your component
  );
}
```

### Styling with Material-UI

This project uses [Material-UI](https://mui.com/) (version 6.4.3) for styling. Key styling approaches:

1. **Component Styling**: Use the `sx` prop for component-specific styling
2. **Theme Customization**: App-wide theming defined in the Material-UI theme
3. **Responsive Design**: Use breakpoints for responsive layouts

#### Responsive Design Example

```tsx
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const ResponsiveComponent = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // Stack on small screens, row on medium+
        p: { xs: 2, sm: 3, md: 4 }, // Different padding based on screen size
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }} // Responsive font sizes
      >
        Responsive Content
      </Typography>
    </Box>
  );
};
```

### Form Validation

Form validation is implemented directly in components. See `RecipeForm.tsx` for examples of form validation implementation.

## Component Usage Guidelines

### RecipeCard

The `RecipeCard` component displays a recipe preview with basic information:

```tsx
import RecipeCard from "components/RecipeCard/RecipeCard";

// Usage
<RecipeCard
  recipeId={1}
  title="Recipe Title"
  user={{ userId: 1, email: "user@example.com" }}
  preparationTime={15}
  cookingTime={30}
  difficultyLevel="MEDIUM"
  servings={4}
  steps="1. Step one\n2. Step two"
  mealTypes={[{ mealTypeId: 1, name: "Breakfast" }]}
/>
```

### RecipeDetail

The `RecipeDetail` component shows a detailed view of a recipe:

```tsx
import RecipeDetail from "components/RecipeDetail/RecipeDetail";

// Usage
<RecipeDetail
  recipeId={1}
  open={true}
  onClose={() => setOpen(false)}
/>
```

## Testing

To run tests:

```bash
npm test
```

## Troubleshooting

### Common Issues

1. **API Connection Problems**:
   - Verify backend is running
   - Check that `.env` has correct API URL
   
2. **Authentication Issues**:
   - Clear local storage
   - Check expiration of JWT tokens
   
3. **Rendering Problems**:
   - Check console for React errors
   - Verify component props are correct