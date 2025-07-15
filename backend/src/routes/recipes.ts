import { Router } from 'express';
import { recipeController } from '../controllers/recipeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes (future use)
router.get('/search/public', recipeController.searchPublicRecipes);

// Protected routes - require authentication
router.use(authenticateToken);

// Recipe CRUD operations
router.post('/', recipeController.createRecipe);
router.get('/', recipeController.getUserRecipes);
router.get('/stats', recipeController.getUserStats);
router.get('/:id', recipeController.getRecipeById);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

export { router as recipeRoutes };