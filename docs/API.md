# Recipe Keeper API Documentation

## Overview

The Recipe Keeper API provides a RESTful interface for managing recipes, users, and AI-powered recipe extraction. This API supports JSON requests and responses and uses JWT tokens for authentication.

**Base URL:** `http://localhost:3000/api`

**Version:** v1

---

## Authentication

### JWT Token Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

---

## Recipes

### Get All Recipes
```http
GET /api/recipes
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `category` (optional): Filter by category
- `tags` (optional): Comma-separated tags
- `difficulty` (optional): Filter by difficulty (easy, medium, hard)
- `cookTime` (optional): Maximum cook time in minutes
- `rating` (optional): Minimum rating (1-5)

**Response:**
```json
{
  "success": true,
  "data": {
    "recipes": [
      {
        "id": "uuid",
        "title": "Chocolate Chip Cookies",
        "rating": 5,
        "photo_url": "/uploads/recipe1.jpg",
        "prep_time": 15,
        "cook_time": 12,
        "servings": 24,
        "difficulty": "easy",
        "ingredients": [
          {
            "quantity": "2",
            "unit": "cups",
            "item": "flour"
          }
        ],
        "directions": [
          {
            "step": 1,
            "instruction": "Preheat oven to 375°F"
          }
        ],
        "nutrition": {
          "calories": 150,
          "protein": 2,
          "carbohydrates": 20,
          "fat": 7,
          "fiber": 1,
          "sodium": 100
        },
        "tags": ["dessert", "cookies"],
        "created_at": "2024-01-01T12:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Get Single Recipe
```http
GET /api/recipes/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipe": {
      "id": "uuid",
      "title": "Chocolate Chip Cookies",
      // ... full recipe object
    }
  }
}
```

### Create Recipe
```http
POST /api/recipes
```

**Request Body:**
```json
{
  "title": "Chocolate Chip Cookies",
  "rating": 5,
  "prep_time": 15,
  "cook_time": 12,
  "servings": 24,
  "difficulty": "easy",
  "ingredients": [
    {
      "quantity": "2",
      "unit": "cups",
      "item": "flour"
    }
  ],
  "directions": [
    {
      "step": 1,
      "instruction": "Preheat oven to 375°F"
    }
  ],
  "nutrition": {
    "calories": 150,
    "protein": 2,
    "carbohydrates": 20,
    "fat": 7,
    "fiber": 1,
    "sodium": 100
  },
  "tags": ["dessert", "cookies"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipe": {
      "id": "uuid",
      "title": "Chocolate Chip Cookies",
      // ... full recipe object
    }
  }
}
```

### Update Recipe
```http
PUT /api/recipes/:id
```

**Request Body:** Same as Create Recipe

**Response:**
```json
{
  "success": true,
  "data": {
    "recipe": {
      // ... updated recipe object
    }
  }
}
```

### Delete Recipe
```http
DELETE /api/recipes/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Recipe deleted successfully"
}
```

---

## AI-Powered Recipe Import

### Import Recipe from Photo
```http
POST /api/recipes/import/photo
```

**Request:** Multipart form data with image file

**Response:**
```json
{
  "success": true,
  "data": {
    "recipe": {
      "title": "Extracted Recipe Name",
      "ingredients": [...],
      "directions": [...],
      "nutrition": {...},
      "prep_time": 30,
      "cook_time": 45,
      "servings": 4,
      "confidence": 0.85
    }
  }
}
```

### Import Recipe from URL
```http
POST /api/recipes/import/url
```

**Request Body:**
```json
{
  "url": "https://example.com/recipe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipe": {
      "title": "Extracted Recipe Name",
      "ingredients": [...],
      "directions": [...],
      "nutrition": {...},
      "prep_time": 30,
      "cook_time": 45,
      "servings": 4,
      "confidence": 0.85,
      "source_url": "https://example.com/recipe"
    }
  }
}
```

---

## Search

### Search Recipes
```http
GET /api/recipes/search
```

**Query Parameters:**
- `q` (required): Search query
- `filters` (optional): JSON object with filters
- `page` (optional): Page number
- `limit` (optional): Items per page

**Example:**
```
GET /api/recipes/search?q=chocolate&filters={"difficulty":"easy","cookTime":30}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipes": [...],
    "pagination": {...},
    "searchMeta": {
      "query": "chocolate",
      "filters": {...},
      "resultsCount": 15,
      "searchTime": 0.045
    }
  }
}
```

---

## File Upload

### Upload Recipe Image
```http
POST /api/upload/image
```

**Request:** Multipart form data with image file

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "recipe_image_123.jpg",
    "url": "/uploads/recipe_image_123.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg"
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Example Error Response
```json
{
  "success": false,
  "error": {
    "message": "Recipe not found",
    "code": "RECIPE_NOT_FOUND",
    "details": "No recipe found with the provided ID"
  }
}
```

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **AI Import**: 10 requests per hour
- **File Upload**: 20 requests per hour

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

---

## Data Models

### Recipe Model
```typescript
interface Recipe {
  id: string;
  title: string;
  rating?: number; // 1-5
  photo_url: string;
  prep_time?: number; // minutes
  cook_time?: number; // minutes
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  directions: Direction[];
  nutrition?: Nutrition;
  tags: string[];
  created_at: string;
  updated_at: string;
}
```

### Ingredient Model
```typescript
interface Ingredient {
  quantity: string;
  unit: string;
  item: string;
}
```

### Direction Model
```typescript
interface Direction {
  step: number;
  instruction: string;
}
```

### Nutrition Model
```typescript
interface Nutrition {
  calories?: number;
  protein?: number; // grams
  carbohydrates?: number; // grams
  fat?: number; // grams
  fiber?: number; // grams
  sodium?: number; // mg
}
```

---

## SDKs and Tools

### JavaScript/TypeScript SDK
```bash
npm install @recipe-keeper/api-client
```

### Postman Collection
Download the Postman collection: [recipe-keeper-api.postman_collection.json](./postman/recipe-keeper-api.postman_collection.json)

### OpenAPI/Swagger
Interactive API documentation: `http://localhost:3000/api/docs`

---

## Changelog

### Version 1.0.0
- Initial API release
- Basic CRUD operations for recipes
- JWT authentication
- AI-powered recipe import
- Search functionality
- File upload support

---

## Support

For API support and questions:
- Documentation: [API Documentation](./API.md)
- Issues: [GitHub Issues](https://github.com/your-repo/recipe-keeper/issues)
- Email: support@recipekeeper.com