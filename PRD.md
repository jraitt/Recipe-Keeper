# Product Requirements Document: Recipe Storage Web Application

## 1. Executive Summary

### Product Overview
A modern, containerized web application that enables users to store, manage, and organize their favorite recipes with AI-powered features for recipe extraction from photos and URLs using Google's Gemini 2.5 Flash API.

### Target Users
- Home cooks and food enthusiasts
- People who collect recipes from various sources
- Users who want to digitize and organize their recipe collections

### Key Value Propositions
- Effortless recipe creation through AI-powered photo and URL extraction
- Beautiful, intuitive interface for recipe management
- Comprehensive recipe information storage
- Easy deployment via Docker containerization

## 2. Product Goals & Objectives

### Primary Goals
1. Provide a seamless recipe storage and management experience
2. Leverage AI to minimize manual data entry
3. Deliver a visually appealing, modern interface
4. Ensure easy deployment and scalability through containerization

### Success Metrics
- User engagement: Average recipes stored per user
- Feature adoption: % of recipes created via AI features
- System performance: Recipe creation/retrieval time < 2 seconds
- User satisfaction: NPS score > 50

## 3. Functional Requirements

### 3.1 Recipe Data Model

Each recipe must include:
- **Title** (required, text)
- **Rating** (optional, 1-5 stars)
- **Photo** (required, image file)
- **Preparation Summary Box**:
  - Prep time
  - Cook time
  - Total time
  - Servings
  - Difficulty level
- **Ingredients List** (array of items with quantities)
- **Directions** (ordered list of steps)
- **Nutrition Facts**:
  - Calories
  - Protein
  - Carbohydrates
  - Fat
  - Fiber
  - Sodium

### 3.2 Core Features

#### Recipe Management
- **Create Recipe**
  - Manual entry form
  - AI-powered creation from photo upload
  - AI-powered extraction from recipe URL
- **View Recipe**
  - Full recipe display with all components
  - Print-friendly view
  - Share functionality
- **Update Recipe**
  - Edit all recipe fields
  - Replace/update photos
  - Version history (optional for MVP)
- **Delete Recipe**
  - Soft delete with recovery option
  - Confirmation dialog

#### AI-Powered Features
- **Photo Upload Processing**
  - Accept image uploads (JPG, PNG, WEBP)
  - Use Gemini 2.5 Flash to extract recipe information
  - Generate recipe image if none provided
  - Auto-populate all recipe fields
- **URL Extraction**
  - Accept recipe URLs from popular cooking sites
  - Use Gemini 2.5 Flash to parse and extract recipe data
  - Handle various recipe schema formats
  - Download and store recipe images

#### Search & Organization
- Search by recipe title, ingredients, or tags
- Filter by rating, prep time, dietary restrictions
- Sort by date added, rating, prep time
- Category/tag system for organization

### 3.3 User Interface Requirements

#### Design Principles
- Clean, minimalist aesthetic
- Mobile-responsive design
- Accessible (WCAG 2.1 AA compliant)
- Fast loading times
- Intuitive navigation

#### Key Screens
1. **Dashboard/Home**
   - Grid/list view of all recipes
   - Search bar
   - Quick add button
   - Filter options

2. **Recipe Detail View**
   - Hero image
   - Rating display
   - Preparation summary card
   - Ingredients checklist
   - Step-by-step directions
   - Nutrition facts panel

3. **Recipe Editor**
   - Multi-step form or single page with sections
   - Real-time preview
   - Image upload with drag-and-drop
   - Rich text editor for directions

4. **AI Import Modal**
   - Photo upload interface
   - URL input field
   - Processing status indicator
   - Preview before saving

## 4. Technical Requirements

### 4.1 Architecture

#### Frontend
- **Framework**: React.js or Vue.js
- **UI Library**: Material-UI, Ant Design, or Tailwind CSS
- **State Management**: Redux/Zustand or Vuex/Pinia
- **Build Tool**: Vite or Webpack

#### Backend
- **Framework**: Node.js with Express or Python with FastAPI
- **Database**: PostgreSQL with JSON support for flexible recipe data
- **File Storage**: Local volume mount or S3-compatible storage
- **API Design**: RESTful with potential GraphQL consideration

#### AI Integration
- **Service**: Google Gemini 2.5 Flash API
- **Implementation**: Server-side API calls
- **Rate Limiting**: Implement queuing system for API calls
- **Caching**: Cache AI responses to minimize API usage

### 4.2 Docker Configuration

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

#### Docker Compose Setup
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

### 4.3 Security Requirements
- User authentication (JWT tokens)
- HTTPS encryption
- Input validation and sanitization
- Rate limiting for AI features
- Secure API key management
- CORS configuration

### 4.4 Performance Requirements
- Page load time < 3 seconds
- API response time < 500ms
- Support 100 concurrent users
- Image optimization and lazy loading
- Database query optimization

## 5. AI Integration Specifications

### 5.1 Gemini 2.5 Flash Implementation

#### Photo Analysis Pipeline
1. User uploads photo
2. Image preprocessed (resize, format conversion if needed)
3. Send to Gemini API with structured prompt
4. Parse AI response into recipe schema
5. Present to user for review/editing
6. Save to database

#### URL Extraction Pipeline
1. User provides recipe URL
2. Fetch webpage content
3. Extract text and images
4. Send to Gemini API for parsing
5. Map to recipe schema
6. Download and store images
7. Present for user confirmation

### 5.2 Prompt Engineering

#### Photo Analysis Prompt Template
```
Analyze this food photo and extract recipe information. Return a JSON object with:
- title: Recipe name
- servings: Number of servings
- prepTime: Preparation time in minutes
- cookTime: Cooking time in minutes
- ingredients: Array of {quantity, unit, item}
- directions: Array of step-by-step instructions
- nutrition: {calories, protein, carbs, fat, fiber, sodium}

If information is not visible, make reasonable estimates based on the dish type.
```

#### URL Extraction Prompt Template
```
Extract recipe information from this webpage content. Parse and return a JSON object with:
[Same structure as photo analysis]

Prioritize accuracy and completeness. Handle various recipe formats and schemas.
```

## 6. User Experience Design

### 6.1 User Flows

#### Adding Recipe via Photo
1. Click "Add Recipe" → Select "Upload Photo"
2. Upload/capture photo
3. View AI-generated recipe preview
4. Edit any fields as needed
5. Add rating (optional)
6. Save recipe

#### Adding Recipe via URL
1. Click "Add Recipe" → Select "Import from URL"
2. Paste recipe URL
3. Wait for processing
4. Review extracted recipe
5. Make adjustments
6. Save recipe

### 6.2 Visual Design Guidelines
- **Color Palette**: Neutral base with accent colors
- **Typography**: Clean, readable fonts (e.g., Inter, Roboto)
- **Spacing**: Generous whitespace for clarity
- **Components**: Card-based layout with subtle shadows
- **Icons**: Consistent icon library (e.g., Lucide, Heroicons)

## 7. Development Phases

### Phase 1: MVP (Weeks 1-6)
- Basic recipe CRUD operations
- Simple UI implementation
- Database setup
- Docker configuration
- Manual recipe entry

### Phase 2: AI Integration (Weeks 7-10)
- Gemini API integration
- Photo upload processing
- URL extraction feature
- Error handling and fallbacks

### Phase 3: Enhanced Features (Weeks 11-14)
- Advanced search and filtering
- User authentication
- Recipe sharing
- Performance optimization

### Phase 4: Polish & Launch (Weeks 15-16)
- UI/UX refinements
- Testing and bug fixes
- Documentation
- Deployment preparation

## 8. Testing Strategy

### 8.1 Testing Types
- **Unit Testing**: API endpoints, data validation
- **Integration Testing**: AI service integration, database operations
- **E2E Testing**: Critical user flows
- **Performance Testing**: Load testing, API rate limits
- **Usability Testing**: User feedback sessions

### 8.2 Test Coverage Goals
- Backend API: >80% coverage
- Frontend components: >70% coverage
- E2E critical paths: 100% coverage

## 9. Deployment & DevOps

### 9.1 Deployment Strategy
- Docker containers for all services
- Environment-based configuration
- Health checks and monitoring
- Automated backups
- Rolling updates

### 9.2 Monitoring & Analytics
- Application performance monitoring
- Error tracking (e.g., Sentry)
- User analytics
- AI API usage tracking
- Database performance metrics

## 10. Future Enhancements

### Potential Features
- Mobile applications (iOS/Android)
- Social features (following, sharing)
- Meal planning integration
- Shopping list generation
- Voice-controlled recipe navigation
- Multi-language support
- Recipe recommendations
- Dietary restriction filters
- Cooking timer integration
- Video recipe support

## 11. Appendices

### A. API Endpoints Specification
```
GET    /api/recipes          # List all recipes
GET    /api/recipes/:id      # Get single recipe
POST   /api/recipes          # Create recipe
PUT    /api/recipes/:id      # Update recipe
DELETE /api/recipes/:id      # Delete recipe
POST   /api/recipes/import/photo  # Import from photo
POST   /api/recipes/import/url    # Import from URL
GET    /api/recipes/search   # Search recipes
```

### B. Database Schema
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

### C. Error Handling Strategy
- Graceful fallbacks for AI failures
- User-friendly error messages
- Retry mechanisms for transient failures
- Manual override options
- Comprehensive logging

---

*This PRD is a living document and should be updated as requirements evolve and new insights are gained during development.*