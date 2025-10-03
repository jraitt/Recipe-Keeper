import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { ToastProvider } from './components/common/Toast';
import { HomePage } from './pages/HomePage';
import { RecipesPage } from './pages/RecipesPage';
import { PublicRecipesPage } from './pages/PublicRecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { RecipeCreationHub } from './pages/RecipeCreationHub';
import { CreateRecipePage } from './pages/CreateRecipePage';
import { EditRecipePage } from './pages/EditRecipePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/public" element={<PublicRecipesPage />} />
            <Route path="/recipes/new" element={<RecipeCreationHub />} />
            <Route path="/recipes/create/manual" element={<CreateRecipePage />} />
            <Route path="/recipes/create/url" element={<CreateRecipePage />} />
            <Route path="/recipes/create/photo-dish" element={<CreateRecipePage />} />
            <Route path="/recipes/create/recipe-card" element={<CreateRecipePage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;