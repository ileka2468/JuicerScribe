import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TranscriptionPage from "./pages/TranscriptionPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentCenter from "./pages/PaymentCenter";
import SupportPage from "./pages/SupportPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ErrorPage from "./pages/ErrorPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Banner from "./components/Banner";

export default function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Banner />
            <Navbar />
            <Toaster position="top-right" />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/support" element={<SupportPage />} />

                {/* Protected User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route
                    path="/transcribe/:videoId"
                    element={<TranscriptionPage />}
                  />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/payments" element={<PaymentCenter />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute requireAdmin />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </DarkModeProvider>
    </AuthProvider>
  );
}
