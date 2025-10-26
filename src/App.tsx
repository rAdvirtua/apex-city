import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ReportChoice from "./pages/ReportChoice";
import ReportWithAI from "./pages/ReportWithAI";
import ReportManually from "./pages/ReportManually";
import CategoryReport from "./pages/CategoryReport";
import MyReports from "./pages/MyReports";
import MapView from "./pages/MapView";
import Chat from "./pages/Chat";
import TrackIssues from "./pages/TrackIssues";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Rate from "./pages/Rate";
import Contribute from "./pages/Contribute";
import NotFound from "./pages/NotFound";
import EditReport from "./pages/EditReport";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AssignMultipleIssues from "./pages/AssignMultipleIssues";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportChoice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-ai"
              element={
                <ProtectedRoute>
                  <ReportWithAI />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-manual"
              element={
                <ProtectedRoute>
                  <ReportManually />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-manual/:category"
              element={
                <ProtectedRoute>
                  <CategoryReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track"
              element={
                <ProtectedRoute>
                  <TrackIssues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rate"
              element={
                <ProtectedRoute>
                  <Rate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contribute"
              element={
                <ProtectedRoute>
                  <Contribute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-report/:id"
              element={
                <ProtectedRoute>
                  <EditReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/assign-multiple"
              element={
                <AdminProtectedRoute>
                  <AssignMultipleIssues />
                </AdminProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;