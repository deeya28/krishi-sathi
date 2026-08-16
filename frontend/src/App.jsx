import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Expert from "./pages/Expert";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import MyPosts from "./pages/MyPosts";
import SavedPosts from "./pages/SavedPosts";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import AppointmentSuccess from "./pages/AppointmentSuccess";
import AppointmentFailed from "./pages/AppointmentFailed";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      {/* Public-facing profile for viewing OTHER users - separate from the
          editable "My Profile" page above. Linked from author names/avatars
          in the feed via /profile/:id */}
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/posts"
        element={
          <ProtectedRoute>
            <MyPosts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/saved"
        element={
          <ProtectedRoute>
            <SavedPosts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <Marketplace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expert"
        element={
          <ProtectedRoute>
            <Expert />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointment-success"
        element={
          <ProtectedRoute>
            <AppointmentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointment-failed"
        element={
          <ProtectedRoute>
            <AppointmentFailed />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;