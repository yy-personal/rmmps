# RMMPS - Frontend service

The frontend service for RMMPS.

## Running the app locally

### Pre-requisites

- Node: Install at https://nodejs.org/en/download

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
