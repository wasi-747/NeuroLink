import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mood" element={<MoodTracker />} />
            <Route path="/journal" element={<Journal />} />
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
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
