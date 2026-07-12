import Hero from "../components/sections/Hero";
import FeaturesBar from "../components/sections/FeaturesBar";
import NewArrivals from "../components/sections/NewArrivals";
import { useEffect } from 'react';
import api from '../api/auth.api.js';
//import BlogSection from "../components/sections/BlogSection";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturesBar />
      <NewArrivals />
    </>
  );
}
