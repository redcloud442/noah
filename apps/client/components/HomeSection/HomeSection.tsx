"use client";

import HeroSection from "../HeroSection/HeroSection";
import HighlightSection from "../HighlightSection/HighlightSection";
import ModelSection from "../ModelSection/ModelSection";
import SoloHighlight from "../SoloHighlight/SoloHighlight";
const HomeSection = () => {
  return (
    <main className="flex flex-col w-full min-h-screen h-full">
      <HeroSection />
      <HighlightSection />
      <ModelSection />
      <SoloHighlight />
    </main>
  );
};

export default HomeSection;
