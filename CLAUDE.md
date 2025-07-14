# CLAUDE.md - Recipe Storage Web App

## Project Overview

This is a modern web application for storing and managing recipes with AI-powered features. The app uses Google's Gemini 2.5 Flash API to extract recipe information from photos and URLs, runs in Docker containers, and provides a clean, beautiful interface for recipe management.

## Tech Stack

### Frontend
- **Framework**: React.js (preferred) or Vue.js
- **UI Library**: Material-UI, Ant Design, or Tailwind CSS
- **State Management**: Redux/Zustand (React) or Vuex/Pinia (Vue)
- **Build Tool**: Vite (preferred) or Webpack

### Backend
- **Framework**: Node.js with Express or Python with FastAPI
- **Database**: PostgreSQL with JSON support
- **File Storage**: Local volume mount or S3-compatible storage
- **API Design**: RESTful

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **AI Service**: Google Gemini 2.5 Flash API

## Database Schema

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  photo_url TEXT NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  difficulty VARCHAR(50),
  ingredients JSONB NOT NULL,
  directions JSONB NOT NULL,
  nutrition JSONB,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Data Structure Examples

```javascript
// Ingredients format
ingredients: [
  { quantity: "2", unit: "cups", item: "flour" },
  { quantity: "1", unit: "tsp", item: "salt" }
]

// Directions format
directions: [
  { step: 1, instruction: "Preheat oven to 350°F" },
  { step: 2, instruction: "Mix dry ingredients" }
]

// Nutrition format
nutrition: {
  calories: 250,
  protein: 10,
  carbohydrates: 30,
  fat: 8,
  fiber: 2,
  sodium: 300
}
```

## API Endpoints

```
GET    /api/recipes              # List all recipes
GET    /api/recipes/:id          # Get single recipe
POST   /api/recipes              # Create recipe
PUT    /api/recipes/:id          # Update recipe
DELETE /api/recipes/:id          # Delete recipe
POST   /api/recipes/import/photo # Import from photo
POST   /api/recipes/import/url   # Import from URL
GET    /api/recipes/search       # Search recipes
```

## Gemini API Integration

### Environment Variables
```
GEMINI_API_KEY=your_api_key_here
```

### Photo Analysis Prompt
```javascript
const photoPrompt = `
Analyze this food photo and extract recipe information. Return a JSON object with:
- title: Recipe name
- servings: Number of servings
- prepTime: Preparation time in minutes
- cookTime: Cooking time in minutes
- ingredients: Array of {quantity, unit, item}
- directions: Array of step-by-step instructions
- nutrition: {calories, protein, carbs, fat, fiber, sodium}

If information is not visible, make reasonable estimates based on the dish type.
`;
```

### URL Extraction Prompt
```javascript
const urlPrompt = `
Extract recipe information from this webpage content. Parse and return a JSON object with:
[Same structure as photo analysis]

Prioritize accuracy and completeness. Handle various recipe formats and schemas.
`;
```

### Example API Call (Node.js)
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

async function analyzeRecipePhoto(imageBuffer) {
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: 'image/jpeg'
    }
  };
  
  const result = await model.generateContent([photoPrompt, imagePart]);
  const response = await result.response;
  return JSON.parse(response.text());
}
```

## Docker Configuration

### Dockerfile
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/recipes
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - uploads:/app/uploads
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=recipes
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  uploads:
  postgres_data:
```

## Key Features Implementation Notes

### 1. Recipe CRUD Operations
- Implement soft delete with `deleted_at` timestamp
- Add validation for required fields
- Handle image upload and storage
- Implement proper error handling

### 2. AI-Powered Import
- Implement rate limiting for Gemini API calls
- Add loading states during processing
- Cache AI responses to minimize API usage
- Provide manual override for AI-extracted data

### 3. Search & Filtering
- Use PostgreSQL full-text search for recipe content
- Index frequently searched fields
- Implement faceted search (by ingredients, time, etc.)
- Add pagination for large result sets

### 4. Image Handling
- Accept JPG, PNG, WEBP formats
- Implement image compression/optimization
- Generate thumbnails for list views
- Store images with unique filenames

## UI/UX Guidelines

### Design Principles
- Clean, minimalist aesthetic
- Mobile-first responsive design
- Card-based layouts
- Generous whitespace
- Consistent spacing (8px grid system)

### Component Structure
```
src/
  components/
    common/
      - Header.jsx
      - Footer.jsx
      - LoadingSpinner.jsx
    recipe/
      - RecipeCard.jsx
      - RecipeDetail.jsx
      - RecipeForm.jsx
      - RecipeGrid.jsx
    ai/
      - PhotoUpload.jsx
      - UrlImport.jsx
      - ImportPreview.jsx
```

### Key Screens
1. **Dashboard**: Grid/list view with search and filters
2. **Recipe Detail**: Full recipe display with all information
3. **Recipe Editor**: Multi-section form with preview
4. **Import Modal**: AI-powered import interface

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Input Validation**: Sanitize all user inputs
3. **File Upload**: Validate file types and sizes
4. **API Security**: Rate limiting, CORS configuration
5. **Environment Variables**: Never commit API keys

## Performance Optimization

1. **Frontend**:
   - Lazy load images
   - Code splitting for routes
   - Implement virtual scrolling for large lists
   - Cache API responses

2. **Backend**:
   - Database query optimization
   - Implement Redis caching
   - Compress API responses
   - Optimize image serving

## Testing Strategy

### Unit Tests
```javascript
// Example test structure
describe('Recipe API', () => {
  test('should create a new recipe', async () => {
    // Test implementation
  });
  
  test('should validate required fields', async () => {
    // Test implementation
  });
});
```

### E2E Tests
- Test critical user flows
- Test AI import features
- Test search functionality
- Test responsive design

## Development Workflow

1. **Local Development**:
   ```bash
   # Start services
   docker-compose up -d
   
   # Install dependencies
   cd frontend && npm install
   cd ../backend && npm install
   
   # Run development servers
   npm run dev
   ```

2. **Environment Setup**:
   ```bash
   # Create .env file
   cp .env.example .env
   # Add your GEMINI_API_KEY and other configs
   ```

3. **Database Migrations**:
   ```bash
   # Run migrations
   npm run migrate
   
   # Seed sample data
   npm run seed
   ```

## Common Patterns

### Error Handling
```javascript
try {
  const result = await someOperation();
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({ 
    success: false, 
    error: 'An error occurred processing your request' 
  });
}
```

### AI Integration Pattern
```javascript
async function processWithAI(input, type) {
  // Check cache first
  const cached = await cache.get(`ai:${type}:${hash(input)}`);
  if (cached) return cached;
  
  // Rate limit check
  await rateLimiter.check();
  
  // Call Gemini API
  const result = await callGeminiAPI(input, type);
  
  // Cache result
  await cache.set(`ai:${type}:${hash(input)}`, result, 3600);
  
  return result;
}
```

## Troubleshooting

### Common Issues
1. **Gemini API errors**: Check API key and rate limits
2. **Database connection**: Verify DATABASE_URL format
3. **Image upload fails**: Check file permissions and disk space
4. **Docker issues**: Ensure Docker daemon is running

### Debug Commands
```bash
# View logs
docker-compose logs -f web

# Access database
docker-compose exec db psql -U user -d recipes

# Clear cache
docker-compose exec web npm run cache:clear
```

## Resources

- [Gemini API Documentation](https://ai.google.dev/api/rest)
- [PostgreSQL JSON Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [React Best Practices](https://react.dev/learn)

---

## Quick Reference

### Start Project
```bash
git clone [repo]
cd recipe-app
docker-compose up -d
```

### Access Application
- Frontend: http://localhost:3000
- API: http://localhost:3000/api
- Database: postgresql://localhost:5432/recipes

### Key Files
- `/docker-compose.yml` - Service configuration
- `/backend/server.js` - Main server file
- `/frontend/src/App.jsx` - Main React component
- `/.env` - Environment variables (create from .env.example)

---

## Session Summary

### Development Session - January 14, 2025

**Completed Milestone 0: Project Setup & Planning**

#### Environment Setup ✅
- **Git Repository**: Initialized with proper .gitignore, main/develop branch structure
- **Project Structure**: Created complete folder hierarchy following PLANNING.md specifications
  - `/frontend/` with React component structure (common, recipe, ai)
  - `/backend/` with Node.js/Express structure (controllers, services, models, etc.)
  - `/docker/`, `/docs/`, `/tests/`, `/.github/workflows/` directories
- **Environment Configuration**: Set up .env.example files for frontend, backend, and Docker
- **README.md**: Comprehensive project overview with setup instructions and feature descriptions

#### Development Environment ✅
- **Code Quality Tools**: ESLint and Prettier configurations for both frontend and backend
  - Frontend: React/TypeScript rules with accessibility checks
  - Backend: Node.js/TypeScript rules with security best practices
  - Prettier configs with consistent formatting rules
- **Development Workflow**: Git workflow established with conventional commits

#### Documentation ✅
- **API Documentation**: Complete API.md template with all endpoints, authentication, error handling
- **Contributing Guidelines**: Comprehensive CONTRIBUTING.md with:
  - Code standards and style guidelines
  - Development setup instructions
  - Testing requirements
  - Pull request process
  - Commit message conventions
- **Change Tracking**: CHANGELOG.md set up for version tracking
- **Architecture Decisions**: ADR (Architecture Decision Records) structure with 3 initial decisions:
  - ADR-001: Technology Stack Selection (React, Node.js, PostgreSQL, Docker)
  - ADR-002: Database Schema Design (Hybrid approach with JSONB)
  - ADR-003: AI Integration (Google Gemini API selection)

#### Key Decisions Made
1. **Technology Stack**: React + TypeScript, Node.js + Express, PostgreSQL, Docker
2. **Database Design**: Hybrid relational/JSON approach using PostgreSQL JSONB
3. **AI Service**: Google Gemini 2.0 Flash for recipe extraction
4. **Development Tools**: Vite, Tailwind CSS, Prisma ORM, Shadcn/ui

#### Project Status
- **Current Branch**: `develop`
- **Commits**: 4 commits with proper conventional commit messages
- **Next Phase**: Ready to begin Milestone 1 (Backend Foundation)
- **Outstanding**: PostgreSQL client tools installation (system-level task)

#### File Structure Created
```
recipe-keeper/
├── .env.example, .gitignore, .prettierignore
├── README.md, CHANGELOG.md, CONTRIBUTING.md
├── CLAUDE.md, PLANNING.md, TASKS.md
├── frontend/
│   ├── src/components/{common,recipe,ai}/
│   ├── src/{hooks,services,store,types,utils}/
│   ├── .env.example, .eslintrc.js, .prettierrc
├── backend/
│   ├── src/{controllers,middleware,models,routes,services,utils,types}/
│   ├── prisma/migrations/, uploads/
│   ├── .env.example, .eslintrc.js, .prettierrc
├── docker/{nginx,scripts}/
├── docs/
│   ├── API.md
│   └── adr/{README.md,001-technology-stack.md,002-database-schema.md,003-ai-integration.md}
├── tests/{e2e,integration,fixtures}/
└── .github/workflows/
```

**Ready for next phase**: Backend Foundation (Node.js server, database setup, authentication)

---

### Additional Items
- always read PLANNING.md at the start of every new conversation
- check TASKS.md before starting your work
- mark completed tasks immediatly
- add newly discovered tasks
		
*This document should be updated as the project evolves. When working with Claude Code, reference this document for consistent implementation details.*