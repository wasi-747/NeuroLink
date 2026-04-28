import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Hero from "../components/home/Hero";
import StatsBar from "../components/home/StatsBar";
import FeaturesGrid from "../components/home/FeaturesGrid";
import HowItWorks from "../components/home/HowItWorks";
import Testimonials from "../components/home/Testimonials";
import CTABanner from "../components/home/CTABanner";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  return (
    <div className="bg-slate-50 min-h-screen">
      <Hero />
      <StatsBar />
      <FeaturesGrid />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
    </div>
  );
};

export default Home;
