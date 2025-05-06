
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import HomePage from "./pages/public/HomePage";
import TreatmentPage from "./pages/public/TreatmentPage";
import BlogPage from "./pages/public/BlogPage";
import BlogPostPage from "./pages/public/BlogPostPage";
import PrivacyPolicyPage from "./pages/public/PrivacyPolicyPage";
import TermsPage from "./pages/public/TermsPage";
import ContactPage from "./pages/public/ContactPage";
import AnamneseFlowPage from "./pages/public/AnamneseFlowPage";
import NotFound from "./pages/NotFound";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

// Client Pages
import ClientLayout from "./layouts/ClientLayout";
import ClientDashboard from "./pages/client/Dashboard";
import ClientPrescriptions from "./pages/client/Prescriptions";
import ClientHistory from "./pages/client/History";
import ClientProfile from "./pages/client/Profile";
import ClientSupport from "./pages/client/Support";

// Doctor Pages
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorPatientDetail from "./pages/doctor/PatientDetail";
import DoctorHistory from "./pages/doctor/History";
import DoctorProfile from "./pages/doctor/Profile";

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAnamneseFlow from "./pages/admin/AnamneseFlow";
import AdminAnamneseCreate from "./pages/admin/AnamneseCreate";
import AdminAnamneseEdit from "./pages/admin/AnamneseEdit";
import AdminTreatmentPlans from "./pages/admin/TreatmentPlans";
import AdminUsers from "./pages/admin/Users";
import AdminDoctors from "./pages/admin/Doctors";
import AdminFinancial from "./pages/admin/Financial";
import AdminSettings from "./pages/admin/Settings";

// Auth Guards
import RequireAuth from "./components/guards/RequireAuth";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/tratamento/:type" element={<TreatmentPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/termos" element={<TermsPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/anamnese/:type" element={<AnamneseFlowPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrar" element={<RegisterPage />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          
          {/* Client Routes - Protected */}
          <Route 
            path="/cliente" 
            element={
              <RequireAuth role="client">
                <ClientLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="prescricoes" element={<ClientPrescriptions />} />
            <Route path="historico" element={<ClientHistory />} />
            <Route path="perfil" element={<ClientProfile />} />
            <Route path="suporte" element={<ClientSupport />} />
          </Route>
          
          {/* Doctor Routes - Protected */}
          <Route 
            path="/medico" 
            element={
              <RequireAuth role="doctor">
                <DoctorLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="paciente/:id" element={<DoctorPatientDetail />} />
            <Route path="historico" element={<DoctorHistory />} />
            <Route path="perfil" element={<DoctorProfile />} />
          </Route>
          
          {/* Admin Routes - Protected */}
          <Route 
            path="/admin" 
            element={
              <RequireAuth role="admin">
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="anamnese" element={<AdminAnamneseFlow />} />
            <Route path="anamnese/criar" element={<AdminAnamneseCreate />} />
            <Route path="anamnese/:id" element={<AdminAnamneseEdit />} />
            <Route path="planos" element={<AdminTreatmentPlans />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="medicos" element={<AdminDoctors />} />
            <Route path="financeiro" element={<AdminFinancial />} />
            <Route path="configuracoes" element={<AdminSettings />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
