import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { lazy, Suspense } from "react";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ReportChoice = lazy(() => import("./pages/ReportChoice"));
const ReportWithAI = lazy(() => import("./pages/ReportWithAI"));
const ReportManually = lazy(() => import("./pages/ReportManually"));
const CategoryReport = lazy(() => import("./pages/CategoryReport"));
const MyReports = lazy(() => import("./pages/MyReports"));
const MapView = lazy(() => import("./pages/MapView"));
const Chat = lazy(() => import("./pages/Chat"));
const TrackIssues = lazy(() => import("./pages/TrackIssues"));
const Profile = lazy(() => import("./pages/Profile"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Rate = lazy(() => import("./pages/Rate"));
const Contribute = lazy(() => import("./pages/Contribute"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EditReport = lazy(() => import("./pages/EditReport"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AssignMultipleIssues = lazy(() => import("./pages/AssignMultipleIssues"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;