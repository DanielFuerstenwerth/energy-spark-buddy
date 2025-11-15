import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import VnbDetail from "./pages/VnbDetail";
import Methodik from "./pages/Methodik";
import Erklaerungen from "./pages/Erklaerungen";
import Mitmachen from "./pages/Mitmachen";
import Reply from "./pages/Reply";
import About from "./pages/About";
import Api from "./pages/Api";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";
import DezentraleEw from "./pages/DezentraleEw";
import Ggv from "./pages/dezentrale-ew/Ggv";
import Mieterstrom from "./pages/dezentrale-ew/Mieterstrom";
import A14 from "./pages/dezentrale-ew/A14";
import Direktvermarktung from "./pages/dezentrale-ew/Direktvermarktung";
import ComingSoon from "./pages/dezentrale-ew/ComingSoon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/vnb/:id" element={<VnbDetail />} />
          <Route path="/methodik" element={<Methodik />} />
          <Route path="/erklaerungen" element={<Erklaerungen />} />
          <Route path="/mitmachen" element={<Mitmachen />} />
          <Route path="/reply" element={<Reply />} />
          <Route path="/about" element={<About />} />
          <Route path="/api" element={<Api />} />
          <Route path="/legal/impressum" element={<Impressum />} />
          <Route path="/legal/datenschutz" element={<Datenschutz />} />
          <Route path="/dezentrale-ew" element={<DezentraleEw />} />
          <Route path="/dezentrale-ew/ggv" element={<Ggv />} />
          <Route path="/dezentrale-ew/mieterstrom" element={<Mieterstrom />} />
          <Route path="/dezentrale-ew/14a" element={<A14 />} />
          <Route path="/dezentrale-ew/direktvermarktung" element={<Direktvermarktung />} />
          <Route path="/dezentrale-ew/coming-soon" element={<ComingSoon />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
