import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewHome from "./pages/NewHome";
import EHH from "./pages/EHH";
import TaE from "./pages/TaE";
import EiG from "./pages/EiG";
import NiH from "./pages/NiH";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import VnbDetail from "./pages/VnbDetail";
import Methodik from "./pages/Methodik";
import Mitmachen from "./pages/Mitmachen";
import About from "./pages/About";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AdminComments from "./pages/AdminComments";
import Auth from "./pages/Auth";
import Reply from "./pages/Reply";
import NotFound from "./pages/NotFound";
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
          <Route path="/" element={<NewHome />} />
          <Route path="/GGV" element={<Ggv />} />
          
          {/* Dezentrale Energiewende Routes */}
          <Route path="/dezentrale-ew/ggv" element={<Ggv />} />
          <Route path="/dezentrale-ew/mieterstrom" element={<Mieterstrom />} />
          <Route path="/dezentrale-ew/14a" element={<A14 />} />
          <Route path="/dezentrale-ew/direktvermarktung" element={<Direktvermarktung />} />
          <Route path="/dezentrale-ew/coming-soon" element={<ComingSoon />} />
          
          {/* Category Routes */}
          <Route path="/EHH" element={<EHH />} />
          <Route path="/EHH/zvNE" element={<EHH />} />
          <Route path="/EHH/zvNE/:kriterium" element={<EHH />} />
          <Route path="/TaE" element={<TaE />} />
          <Route path="/EiG" element={<EiG />} />
          <Route path="/NiH" element={<NiH />} />
          
          {/* Other Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/vnb/:id" element={<VnbDetail />} />
          <Route path="/methodik" element={<Methodik />} />
          <Route path="/mitmachen" element={<Mitmachen />} />
          <Route path="/reply" element={<Reply />} />
          <Route path="/about" element={<About />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/admin/comments" element={<AdminComments />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
