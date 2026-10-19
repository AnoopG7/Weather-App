import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { FavoritesProvider } from "./context/FavoritesContext";
import CityWeatherPage from "./pages/CityWeatherPage";
import ComparePage from "./pages/ComparePage";
import ExportPage from "./pages/ExportPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="city/:cityName" element={<CityWeatherPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </FavoritesProvider>
    </BrowserRouter>
  );
}
