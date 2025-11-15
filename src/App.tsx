import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewHome from "./pages/NewHome";
import GGVPage from "./pages/GGVPage";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import VnbDetail from "./pages/VnbDetail";
import Methodik from "./pages/Methodik";
import Mitmachen from "./pages/Mitmachen";
import About from "./pages/About";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NewHome />} />
          <Route path="/GGV" element={<GGVPage />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/vnb/:id" element={<VnbDetail />} />
          <Route path="/methodik" element={<Methodik />} />
          <Route path="/mitmachen" element={<Mitmachen />} />
          <Route path="/about" element={<About />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
