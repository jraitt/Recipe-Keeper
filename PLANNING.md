# PLANNING.md - Recipe Storage Web App

## 📋 Table of Contents
- [Vision & Mission](#vision--mission)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Required Tools & Services](#required-tools--services)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Deployment Strategy](#deployment-strategy)
- [Development Timeline](#development-timeline)

## 🎯 Vision & Mission

### Vision Statement
To create the most intuitive and intelligent recipe management platform that transforms how people discover, store, and interact with their culinary collections through the power of AI and beautiful design.

### Mission
Build a containerized web application that:
- Eliminates the friction of recipe collection through AI-powered extraction
- Provides a delightful user experience with a clean, modern interface
- Ensures recipes are always accessible and well-organized
- Respects user privacy while leveraging cloud AI capabilities
- Deploys easily anywhere using Docker containers

### Core Values
1. **Simplicity First**: Every feature should reduce complexity, not add to it
2. **AI-Augmented**: Use AI to enhance human capabilities, not replace them
3. **Beautiful by Default**: Aesthetics matter as much as functionality
4. **Privacy Conscious**: User data stays private and secure
5. **Developer Friendly**: Easy to deploy, maintain, and extend

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  React SPA    │  Progressive Web App  │  Responsive Design  │
└───────────────┬─────────────────────────────────────────────┘
                │ HTTPS
┌───────────────▼─────────────────────────────────────────────┐
│                      APPLICATION LAYER                      │
├─────────────────────────────────────────────────────────────┤
│   Node.js/Express API  │  JWT Auth  │  File Upload Handler  │
│   RESTful Endpoints    │  Validation │  Image Processing    │
└───────────────┬───────────────────┬─────────────────────────┘
                │                   │
┌───────────────▼────────┐  ┌──────▼──────────────────────────┐
│     DATA LAYER         │  │      EXTERNAL SERVICES          │
├────────────────────────┤  ├─────────────────────────────────┤
│  PostgreSQL Database   │  │  Google Gemini 2.5 Flash API    │
│  File Storage Volume   │  │  Recipe Website Scrapers        │
│  Redis Cache (Future)  │  │  Image CDN (Future)             │
└────────────────────────┘  └─────────────────────────────────┘
```

### Application Architecture

```
User → Frontend (React) → API (Express) → Database (PostgreSQL)
                   ↓              ↓
               Validation    AI Service (Gemini)
```

## 💻 Technology Stack

### Frontend
- **Framework**: React.js with TypeScript
- **UI Library**: Tailwind CSS with Shadcn/ui
- **State Management**: Zustand
- **Build Tool**: Vite

### Backend
- **Framework**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Local volume mount with Sharp image processing
- **AI Service**: Google Gemini 2.5 Flash API
- **API Design**: RESTful

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Development Tools**: VS Code, ESLint, Prettier
- **Testing**: Jest + React Testing Library

## 🛠️ Required Tools & Services

### Local Development Requirements

#### Essential Tools
- **Node.js** (v20 LTS or higher)
  ```bash
  # Install via nvm (recommended)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 20
  nvm use 20
  ```

- **Docker Desktop**
  - [Download for Mac](https://www.docker.com/products/docker-desktop/)
  - [Download for Windows](https://www.docker.com/products/docker-desktop/)
  - [Install on Linux](https://docs.docker.com/engine/install/)

- **Git**
  ```bash
  # macOS
  brew install git
  
  # Ubuntu/Debian
  sudo apt-get install git
  
  # Windows
  # Download from https://git-scm.com/
  ```

- **PostgreSQL Client Tools**
  ```bash
  # macOS
  brew install postgresql
  
  # Ubuntu/Debian
  sudo apt-get install postgresql-client
  ```

#### Recommended IDE & Extensions

**Visual Studio Code**
- [ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
- [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

### External Services

#### Google Gemini API
1. **Account Setup**
   - Create a Google Cloud account
   - Enable Gemini API
   - Generate API key
   - Set up billing (pay-as-you-go)

2. **API Limits & Pricing**
   - Free tier: 60 requests per minute
   - Rate limits: 1000 requests per day
   - Pricing: ~$0.00025 per 1K characters

3. **Configuration**
   ```bash
   # .env file
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

#### Optional Services (Future Enhancements)
- **Image CDN**: Cloudflare R2 or AWS S3 for scalable image storage
- **Error Tracking**: Sentry for production monitoring
- **Deployment**: Vercel or Railway for easy deployment

### System Requirements

#### Minimum Development Machine
- **CPU**: 4 cores
- **RAM**: 8GB (16GB recommended)
- **Storage**: 20GB free space
- **OS**: macOS 12+, Windows 10+, Ubuntu 20.04+

#### Production Server Requirements
- **CPU**: 2 vCPUs minimum
- **RAM**: 4GB minimum
- **Storage**: 40GB SSD
- **Network**: 100Mbps connection
- **OS**: Ubuntu 22.04 LTS recommended

## 📁 Project Structure

```
recipe-storage-app/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── recipe/
│   │   │   └── ai/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docker/
│   ├── nginx/
│   │   └── nginx.conf
│   └── scripts/
│       └── entrypoint.sh
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── fixtures/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker-compose.prod.yml
├── Dockerfile
├── CLAUDE.md
├── PLANNING.md
└── README.md
```

## 🚀 Deployment Strategy

### Development Environment
```yaml
# docker-compose.yml (development)
version: '3.8'
services:
  web:
    build: 
      context: .
      target: development
    volumes:
      - ./frontend:/app/frontend
      - ./backend:/app/backend
    environment:
      - NODE_ENV=development
```

### Staging Environment
- Use production builds
- Connect to staging database
- Use test Gemini API key
- Enable debug logging

### Production Environment
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  web:
    image: recipe-app:latest
    restart: always
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 2G
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Rate limiting enabled
- [ ] Security headers set
- [ ] Image optimization enabled
- [ ] Error tracking configured
- [ ] Health checks passing

## 📅 Development Timeline

### Remaining Development Goals

#### Next Phase: Testing & Optimization
- [ ] Performance optimization (caching, bundling)
- [ ] Comprehensive testing suite
- [ ] Production deployment setup
- [ ] CI/CD pipeline
- [ ] Security audit

#### Future Enhancements
- [ ] Advanced search filters
- [ ] User feedback integration
- [ ] Mobile app development
- [ ] Recipe sharing features
- [ ] Nutrition tracking

## 🔧 Development Workflow

### Git Branch Strategy
```
main
├── develop
│   ├── feature/user-auth
│   ├── feature/recipe-crud
│   ├── feature/ai-integration
│   └── feature/search
└── release/v1.0.0
```

### Commit Convention
```
type(scope): subject

feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: tests
chore: maintenance
```

### Code Review Process
1. Create feature branch
2. Implement feature
3. Write tests
4. Submit PR
5. Code review
6. Address feedback
7. Merge to develop

## 📊 Success Metrics

### Technical Metrics
- Page load time < 3s
- API response time < 500ms
- 99.9% uptime
- Zero critical security vulnerabilities
- 80%+ test coverage

### User Metrics
- User registration rate
- Recipes created per user
- AI feature adoption rate
- User retention (30-day)
- Feature usage analytics

### Business Metrics
- Infrastructure cost per user
- API usage optimization
- Storage efficiency
- Development velocity
- Time to deployment

---

*This planning document serves as the north star for the Recipe Storage Web App project. It should be reviewed and updated regularly as the project evolves.*