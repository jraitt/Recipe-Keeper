import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { ToastProvider } from './components/common/Toast';
import { HomePage } from './pages/HomePage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { RecipeCreationHub } from './pages/RecipeCreationHub';
import { CreateRecipePage } from './pages/CreateRecipePage';
import { EditRecipePage } from './pages/EditRecipePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/new" element={<RecipeCreationHub />} />
            <Route path="/recipes/create/manual" element={<CreateRecipePage />} />
            <Route path="/recipes/create/url" element={<CreateRecipePage />} />
            <Route path="/recipes/create/photo-dish" element={<CreateRecipePage />} />
            <Route path="/recipes/create/recipe-card" element={<CreateRecipePage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;