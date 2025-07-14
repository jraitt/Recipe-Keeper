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

### Container Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Docker Host System                  │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐           │
│  │   Web Container │  │  DB Container   │           │
│  │   - Node.js     │  │  - PostgreSQL   │           │
│  │   - React App   │  │  - Persistent   │           │
│  │   - API Server  │  │    Storage      │           │
│  └────────┬────────┘  └────────▲────────┘           │
│           │                     │                   │
│           └─────────────────────┘                   │
│                Docker Network                       │
└─────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Action → Frontend → API → Business Logic → Database
                  ↓                    ↓
              Validation          AI Service
                                 (Gemini API)
```

## 💻 Technology Stack

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | React | 18.x | Component-based UI framework |
| Language | TypeScript | 5.x | Type safety and better DX |
| Styling | Tailwind CSS | 3.x | Utility-first CSS framework |
| State Management | Zustand | 4.x | Lightweight state management |
| Routing | React Router | 6.x | Client-side routing |
| HTTP Client | Axios | 1.x | API communication |
| UI Components | Shadcn/ui | Latest | Modern component library |
| Build Tool | Vite | 5.x | Fast build tool and dev server |
| Image Handling | react-dropzone | 14.x | Drag-and-drop file uploads |
| Form Handling | React Hook Form | 7.x | Performant form library |
| Validation | Zod | 3.x | Schema validation |

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Runtime | Node.js | 20 LTS | JavaScript runtime |
| Framework | Express | 4.x | Web application framework |
| Language | TypeScript | 5.x | Type safety |
| Database | PostgreSQL | 15.x | Primary data storage |
| ORM | Prisma | 5.x | Database toolkit |
| Authentication | jsonwebtoken | 9.x | JWT implementation |
| Validation | Joi | 17.x | Request validation |
| File Upload | Multer | 1.x | Multipart form data |
| AI Integration | @google/generative-ai | Latest | Gemini API client |
| Web Scraping | Puppeteer | 21.x | URL recipe extraction |
| Image Processing | Sharp | 0.33.x | Image optimization |
| CORS | cors | 2.x | Cross-origin requests |
| Security | Helmet | 7.x | Security headers |
| Logging | Winston | 3.x | Application logging |
| Rate Limiting | express-rate-limit | 7.x | API rate limiting |

### DevOps & Infrastructure

| Category | Technology | Purpose |
|----------|------------|---------|
| Containerization | Docker | Application containers |
| Orchestration | Docker Compose | Multi-container apps |
| Process Manager | PM2 | Node.js process management |
| Reverse Proxy | Nginx (optional) | Load balancing, SSL |
| Monitoring | Prometheus + Grafana | System monitoring |
| CI/CD | GitHub Actions | Automated deployment |
| Environment Management | dotenv | Environment variables |

### Development Tools

| Category | Tool | Purpose |
|----------|------|---------|
| Code Editor | VS Code | Primary IDE |
| API Testing | Postman/Insomnia | API development |
| Database GUI | pgAdmin/TablePlus | Database management |
| Version Control | Git | Source control |
| Package Manager | npm/pnpm | Dependency management |
| Linting | ESLint | Code quality |
| Formatting | Prettier | Code formatting |
| Testing | Jest + React Testing Library | Unit/integration tests |
| E2E Testing | Playwright | End-to-end testing |

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
   GEMINI_MODEL=gemini-2.0-flash-exp
   ```

#### Optional Services (Future Enhancements)
- **AWS S3 / Cloudflare R2**: Object storage for images
- **SendGrid / Resend**: Email notifications
- **Sentry**: Error tracking
- **Vercel / Railway**: Deployment platforms
- **Cloudflare**: CDN and DDoS protection

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

### Phase 1: Foundation (Weeks 1-3)
- [ ] Project setup and configuration
- [ ] Database schema design
- [ ] Basic Docker configuration
- [ ] Authentication system
- [ ] Core API endpoints

### Phase 2: Core Features (Weeks 4-6)
- [ ] Recipe CRUD operations
- [ ] File upload system
- [ ] Basic UI implementation
- [ ] Search functionality
- [ ] Responsive design

### Phase 3: AI Integration (Weeks 7-9)
- [ ] Gemini API integration
- [ ] Photo analysis feature
- [ ] URL extraction feature
- [ ] AI response caching
- [ ] Error handling

### Phase 4: Polish & Optimization (Weeks 10-12)
- [ ] Performance optimization
- [ ] Advanced search filters
- [ ] UI/UX improvements
- [ ] Testing suite
- [ ] Documentation

### Phase 5: Deployment (Weeks 13-14)
- [ ] Production setup
- [ ] CI/CD pipeline
- [ ] Monitoring setup
- [ ] Security audit
- [ ] Launch preparation

### Phase 6: Post-Launch (Weeks 15-16)
- [ ] Bug fixes
- [ ] Performance monitoring
- [ ] User feedback integration
- [ ] Feature prioritization
- [ ] Scaling planning

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