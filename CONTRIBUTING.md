# Contributing to Recipe Keeper

Thank you for your interest in contributing to Recipe Keeper! This guide will help you get started with contributing to our AI-powered recipe management application.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Guidelines](#issue-guidelines)

---

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and constructive
- Focus on what's best for the community
- Show empathy towards other contributors

---

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/recipe-keeper.git
   cd recipe-keeper
   ```
3. **Set up the development environment** (see below)
4. **Create a feature branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Setup

### Prerequisites

- Node.js 20+ LTS
- Docker Desktop
- PostgreSQL client tools
- Git

### Environment Setup

1. **Install dependencies**:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

3. **Get a Gemini API key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Generate an API key
   - Add it to your `.env` file

4. **Start the development environment**:
   ```bash
   docker-compose up -d
   npm run dev
   ```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Provide type annotations for function parameters and return types
- Use interfaces for object types, types for unions/primitives

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

#### Key Style Rules

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Line Length**: 80 characters max
- **Trailing Commas**: ES5 style (objects, arrays)

### File Organization

```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── recipe/          # Recipe-specific components
│   └── ai/              # AI-related components
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── store/               # State management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── __tests__/           # Test files
```

### Naming Conventions

- **Files**: kebab-case (`recipe-card.tsx`)
- **Components**: PascalCase (`RecipeCard`)
- **Functions**: camelCase (`handleSubmit`)
- **Variables**: camelCase (`recipeData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`Recipe`, `ApiResponse`)

### React Components

```typescript
// Good: Functional component with TypeScript
interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onEdit }) => {
  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      <button onClick={() => onEdit(recipe.id)}>Edit</button>
    </div>
  );
};
```

### API Routes

```typescript
// Good: Express route with TypeScript
export const getRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recipe = await recipeService.findById(id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: { message: 'Recipe not found' }
      });
    }

    res.json({
      success: true,
      data: { recipe }
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add JWT refresh token functionality

Implement automatic token refresh when access token expires.
Add refresh token storage and rotation logic.

Closes #123

fix(recipe): resolve image upload validation issue

Update file type validation to accept WebP images.
Fix MIME type checking for uploaded recipe photos.

Fixes #456

docs(api): update recipe endpoints documentation

Add examples for new filtering parameters.
Update response schemas for consistency.
```

### Required Footer

All commits must include the following footer:

```
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Pull Request Process

1. **Create a feature branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Write tests** for your changes

4. **Run the test suite**:
   ```bash
   npm test
   npm run test:e2e
   ```

5. **Lint and format your code**:
   ```bash
   npm run lint:fix
   npm run format
   ```

6. **Update documentation** if needed

7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request** with:
   - Clear title and description
   - Link to related issues
   - Screenshots for UI changes
   - Test plan description

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

---

## Testing

### Test Structure

- **Unit Tests**: `*.test.ts` files next to source files
- **Integration Tests**: `/tests/integration/`
- **E2E Tests**: `/tests/e2e/`

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

### Writing Tests

```typescript
// Unit test example
describe('RecipeService', () => {
  it('should create a new recipe', async () => {
    const recipeData = {
      title: 'Test Recipe',
      ingredients: [{ quantity: '1', unit: 'cup', item: 'flour' }]
    };

    const result = await recipeService.create(recipeData);
    
    expect(result).toBeDefined();
    expect(result.title).toBe('Test Recipe');
  });
});
```

### Test Requirements

- All new features must have unit tests
- Bug fixes must include regression tests
- Aim for 80%+ code coverage
- E2E tests for critical user flows

---

## Documentation

### Code Documentation

- Use JSDoc for functions and classes
- Include parameter types and return types
- Provide usage examples for complex functions

```typescript
/**
 * Extracts recipe information from a photo using AI
 * @param imageBuffer - The image buffer to analyze
 * @param options - Configuration options for analysis
 * @returns Promise resolving to extracted recipe data
 * @throws {AIServiceError} When AI service fails
 */
async function extractRecipeFromPhoto(
  imageBuffer: Buffer,
  options: AnalysisOptions = {}
): Promise<RecipeData> {
  // Implementation
}
```

### API Documentation

- Update `docs/API.md` for API changes
- Include request/response examples
- Document all error cases

### README Updates

- Update feature lists for new functionality
- Add setup instructions for new dependencies
- Include troubleshooting for common issues

---

## Issue Guidelines

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots/logs if applicable

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Implementation complexity estimate

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `good-first-issue`: Good for newcomers
- `help-wanted`: Extra attention needed
- `priority-high`: High priority issue

---

## Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities. Instead:

1. Email security@recipekeeper.com
2. Include detailed description
3. Provide steps to reproduce
4. Allow 90 days for response

### Security Best Practices

- Never commit API keys or secrets
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication
- Follow OWASP guidelines

---

## Getting Help

### Community Support

- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: Real-time chat (link in README)

### Maintainer Contact

- Project Lead: [maintainer@recipekeeper.com]
- Security: [security@recipekeeper.com]

---

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- GitHub contributors page
- Release notes for significant contributions

---

## License

By contributing to Recipe Keeper, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Recipe Keeper! Your help makes this project better for everyone. 🍳✨