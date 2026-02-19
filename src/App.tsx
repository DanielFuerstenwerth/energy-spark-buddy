import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NewHome from "./pages/NewHome";
import UniversalCategory from "./pages/UniversalCategory";
import UniversalSubcategoryPage from "./pages/UniversalSubcategoryPage";
import UniversalCriterionPage from "./pages/UniversalCriterionPage";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import VnbDetail from "./pages/VnbDetail";
import Methodik from "./pages/Methodik";
import Mitmachen from "./pages/Mitmachen";
import About from "./pages/About";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AdminComments from "./pages/AdminComments";
import AdminVnbMapping from "./pages/AdminVnbMapping";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Reply from "./pages/Reply";
import Survey from "./pages/Survey";

import SurveyDocumentation from "./pages/SurveyDocumentation";
import Dateninput from "./pages/Dateninput";
import NotFound from "./pages/NotFound";
import AnliegenGgv from "./pages/anliegen/Ggv";
import AnliegenZvne from "./pages/anliegen/Zvne";
import AnliegenDv from "./pages/anliegen/Dv";
import AnliegenSmgw from "./pages/anliegen/Smgw";
import AnliegenBidi from "./pages/anliegen/Bidi";
import Admin from "./pages/Admin";
import EmbedGgvMap from "./pages/EmbedGgvMap";
import SandraChatWidget from "./components/SandraChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SandraChatWidget />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NewHome />} />
          
          {/* Category Overview Routes - Dynamic */}
          <Route path="/:category" element={<UniversalCategory />} />
          
          {/* Subcategory Routes - Dynamic */}
          <Route path="/:category/:subcategory" element={<UniversalSubcategoryPage />} />
          
          {/* Criterion Routes - Dynamic */}
          <Route path="/:category/:subcategory/:criterion" element={<UniversalCriterionPage />} />
          
          {/* Embed Routes */}
          <Route path="/embed/ggv" element={<EmbedGgvMap />} />
          
          {/* Anliegen Landing Pages */}
          <Route path="/anliegen/ggv" element={<AnliegenGgv />} />
          <Route path="/anliegen/zvne" element={<AnliegenZvne />} />
          <Route path="/anliegen/dv" element={<AnliegenDv />} />
          <Route path="/anliegen/smgw" element={<AnliegenSmgw />} />
          <Route path="/anliegen/bidi" element={<AnliegenBidi />} />
          
          {/* Other Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/vnb/:id" element={<VnbDetail />} />
          <Route path="/methodik" element={<Methodik />} />
          <Route path="/mitmachen" element={<Mitmachen />} />
          <Route path="/reply" element={<Reply />} />
          <Route path="/Umfrage-GGV" element={<Survey />} />
          <Route path="/Umfrage-GGV/dokumentation" element={<SurveyDocumentation />} />
          <Route path="/dateninput" element={<Dateninput />} />
          
          {/* Temporäre Redirects – nach Juli 2026 entfernen */}
          <Route path="/umfrage" element={<Navigate to="/Umfrage-GGV" replace />} />
          <Route path="/umfrage/dokumentation" element={<Navigate to="/Umfrage-GGV/dokumentation" replace />} />
          {/* /umfrage/audit is served as static HTML from public/umfrage/audit/index.html */}
          <Route path="/about" element={<About />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/comments" element={<AdminComments />} />
          <Route path="/admin-comments" element={<Navigate to="/admin/comments" replace />} />
          <Route path="/admin/vnb-mapping" element={<AdminVnbMapping />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
