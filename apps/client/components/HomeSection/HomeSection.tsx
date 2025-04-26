"use client";

import { ProductType } from "@/utils/types";
import { BranchesPage } from "../BranchesPage/BranchesPage";
import HeroSection from "../HeroSection/HeroSection";
import HighlightSecond from "../HighlightSecond/HighlightSeccond";
import HighlightSection from "../HighlightSection/HighlightSection";
import ModelSection from "../ModelSection/ModelSection";
import ResellerSection from "../ResellerSection/ResellerSection";
import SoloHighlight from "../SoloHighlight/SoloHighlight";
type Variant = {
  variants: ProductType[];
};

const HomeSection = ({ variants }: Variant) => {
  return (
    <main className="flex flex-col w-full min-h-screen h-full">
      <HeroSection />
      <ModelSection variants={variants} />
      <SoloHighlight />
      <HighlightSecond />
      <HighlightSection />
      <BranchesPage />
      <ResellerSection />
    </main>
  );
};

export default HomeSection;
