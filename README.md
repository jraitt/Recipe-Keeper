# Recipe Keeper

A modern, AI-powered web application for storing, organizing, and managing your favorite recipes. Built with React, Node.js, and Google's Gemini AI for intelligent recipe extraction from photos and URLs.

## ✨ Features

- 🤖 **AI-Powered Recipe Extraction**: Extract recipes from photos and URLs using Google Gemini
- 📸 **Multi-Photo Import**: Upload multiple photos of recipe cards for intelligent merging
- 🗂️ **Smart Organization**: Categorize, tag, and search your recipe collection
- 📱 **Responsive Design**: Beautiful interface that works on all devices
- 🔍 **Advanced Search**: Find recipes by ingredients, cooking time, difficulty, and more
- 💾 **Secure Storage**: Your recipes are stored securely in PostgreSQL
- 🚀 **Fast Performance**: Optimized for speed with modern web technologies
- 📊 **Nutrition Information**: AI-extracted nutrition facts for each recipe
- ⭐ **Rating System**: Rate and review your recipes
- 🔐 **User Authentication**: Secure login and personal recipe collections

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **Zustand** for state management
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Prisma ORM
- **JWT** authentication
- **Google Gemini AI** for recipe extraction

### Infrastructure
- **Docker** containerization
- **Docker Compose** for local development
- **GitHub Actions** for CI/CD

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ LTS
- Docker Desktop
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipe-keeper
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

3. **Add your Google Gemini API key**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add it to your `.env` file:
     ```
     GEMINI_API_KEY=your-api-key-here
     ```

4. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

5. **Install dependencies and run the application**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   npm run dev

   # In another terminal, install backend dependencies
   cd backend
   npm install
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3020
   - Backend API: http://localhost:3021/api
   - Database: postgresql://localhost:5432/recipes

## 📊 Current Status (July 14, 2025)

### ✅ Implemented Features
- **Full Docker Environment**: All services containerized and running
- **Frontend Application**: React app with navigation, pages, and responsive design
- **Backend API Server**: Express server with TypeScript, middleware, and logging
- **Database**: PostgreSQL with Prisma ORM, migrations, and connection pooling
- **Authentication System**: Complete JWT-based auth with registration, login, and protected routes
- **API Endpoints**:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User authentication  
  - `GET /api/auth/profile` - Protected user profile
  - `GET /api/health` - Health check with database status

### 🚧 In Progress
- Recipe CRUD operations
- Frontend-backend API integration
- AI-powered recipe extraction (Gemini integration)
- Advanced UI components

### 🎯 Upcoming Features
- Photo upload and analysis
- URL recipe extraction
- Recipe search and filtering
- Categories and tags
- Nutrition information display

## 📖 Usage

### Adding Recipes

1. **Manual Entry**: Click "Add Recipe" and fill in the details
2. **Photo Upload**: Upload a photo of a recipe and let AI extract the information
3. **URL Import**: Paste a recipe URL and let AI extract the content

### Organizing Recipes

- **Search**: Use the search bar to find recipes by name, ingredients, or tags
- **Filter**: Filter by cooking time, difficulty, rating, or dietary restrictions
- **Categories**: Organize recipes into custom categories
- **Tags**: Add tags for easy classification

### AI Features

- **Photo Analysis**: Upload food photos to automatically extract recipe information
- **URL Extraction**: Import recipes from cooking websites automatically
- **Nutrition Calculation**: Get estimated nutrition facts for each recipe

## 🔧 Development

### Project Structure

```
recipe-keeper/
├── frontend/           # React frontend application
├── backend/            # Node.js backend API
├── docker/             # Docker configuration files
├── docs/              # Documentation
├── tests/             # Test files
├── .github/           # GitHub Actions workflows
└── docker-compose.yml # Development environment
```

### Development Commands

```bash
# Start development environment
docker-compose up -d

# Run frontend development server
cd frontend && npm run dev

# Run backend development server
cd backend && npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

### API Documentation

When running in development mode, API documentation is available at:
- Swagger UI: http://localhost:3000/api/docs

### Database Management

```bash
# Run database migrations
cd backend && npm run migrate

# Reset database
npm run db:reset

# Seed sample data
npm run db:seed
```

## 🚢 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy to production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Set up SSL and domain**
   - Configure your reverse proxy (Nginx, Cloudflare, etc.)
   - Set up SSL certificates
   - Point your domain to the server

### Environment Variables

Make sure to set the following environment variables in production:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `JWT_SECRET`: Strong JWT secret key
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV=production`

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Individual component and function tests
- **Integration Tests**: API endpoint and database tests
- **E2E Tests**: Full user workflow tests with Playwright

## 📋 API Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token

### Recipes
- `GET /api/recipes` - List all recipes
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### AI Features
- `POST /api/recipes/import/photo` - Extract recipe from photo
- `POST /api/recipes/import/url` - Extract recipe from URL

### Search
- `GET /api/recipes/search` - Search recipes with filters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure code passes linting and formatting
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for recipe extraction capabilities
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Prisma](https://www.prisma.io/) for database management
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [FAQ](docs/FAQ.md)
2. Search existing [Issues](https://github.com/your-username/recipe-keeper/issues)
3. Create a new issue with detailed information
4. Check the [troubleshooting guide](docs/TROUBLESHOOTING.md)

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Recipe sharing and social features
- [ ] Advanced meal planning
- [ ] Grocery list integration
- [ ] Recipe scaling and conversion
- [ ] Voice-activated recipe reading
- [ ] Multi-language support

---

**Recipe Keeper** - Transform your cooking experience with AI-powered recipe management.

Made with ❤️ by [Your Name]