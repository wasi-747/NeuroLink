import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import GratitudeLog from "./pages/dashboard/GratitudeLog";
import HabitTracker from "./pages/dashboard/HabitTracker";
import Journal from "./pages/dashboard/Journal";
import MoodTracker from "./pages/dashboard/MoodTracker";
import StressQuiz from "./pages/dashboard/StressQuiz";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import ForumHome from "./pages/forum/ForumHome";
import ForumPostDetail from "./pages/forum/ForumPostDetail";
import Resources from "./pages/resources/Resources";
import TherapistDirectory from "./pages/therapists/TherapistDirectory";
import TherapistProfile from "./pages/therapists/TherapistProfile";
import UserBookings from "./pages/therapists/UserBookings";
import VideoRoom from "./pages/therapists/VideoRoom";
import CourseCatalog from "./pages/courses/CourseCatalog";
import CourseDetail from "./pages/courses/CourseDetail";
import LearningInterface from "./pages/courses/LearningInterface";
import MyCourses from "./pages/dashboard/MyCourses";

import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminTherapists from "./pages/admin/AdminTherapists";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminArticles from "./pages/admin/AdminArticles";

import EmergencyRibbon from "./components/layout/EmergencyRibbon";

import "./App.css";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route element={
          <div className="min-h-screen flex flex-col bg-slate-50">
            <EmergencyRibbon />
            <Navbar />
            <main className="flex-grow">
              <Outlet />
            </main>
          </div>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/mood" element={<MoodTracker />} />
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/gratitude" element={<GratitudeLog />} />
            <Route path="/stress-quiz" element={<StressQuiz />} />
            
            {/* Community Forum Routes */}
            <Route path="/community" element={<ForumHome />} />
            <Route path="/community/post/:id" element={<ForumPostDetail />} />
            
            {/* Resources Route */}
            <Route path="/resources" element={<Resources />} />
            
            {/* Therapist Directory */}
            <Route path="/therapists" element={<TherapistDirectory />} />
            <Route path="/therapists/:id" element={<TherapistProfile />} />
            <Route path="/bookings" element={<UserBookings />} />

            {/* Courses */}
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/my-courses" element={<MyCourses />} />
          </Route>
        </Route>
        
        {/* Fullscreen Routes (Outside Layout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/room/:roomId" element={<VideoRoom />} />
          <Route path="/courses/:id/learn" element={<LearningInterface />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/moderation" element={<AdminModeration />} />
            <Route path="/admin/therapists" element={<AdminTherapists />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
