import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { I18nProvider } from './i18n/I18nProvider';
import { AddRecipe } from './pages/AddRecipe';
import { EditRecipe } from './pages/EditRecipe';
import { ImportRecipe } from './pages/ImportRecipe';
import { Inspiration } from './pages/Inspiration';
import { MyRecipes } from './pages/MyRecipes';
import { NotFound } from './pages/NotFound';
import { Privacy } from './pages/Privacy';
import { RecipeDetail } from './pages/RecipeDetail';
import { Tonight } from './pages/Tonight';

/**
 * Routes.
 *
 * HashRouter keeps the app deployable as plain static files anywhere, with no
 * server rewrite rules to configure.
 */
export default function App() {
  return (
    <I18nProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Tonight />} />
            <Route path="recipes" element={<MyRecipes />} />
            <Route path="recipes/new" element={<AddRecipe />} />
            <Route path="recipes/:id" element={<RecipeDetail />} />
            <Route path="recipes/:id/edit" element={<EditRecipe />} />
            <Route path="import" element={<ImportRecipe />} />
            <Route path="inspiration" element={<Inspiration />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="tonight" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </I18nProvider>
  );
}
