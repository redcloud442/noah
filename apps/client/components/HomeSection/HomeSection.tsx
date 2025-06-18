"use client";

import { ProductType } from "@/utils/types";
import BranchesPage from "../BranchesPage/BranchesPage";
import HeroSection from "../HeroSection/HeroSection";
import HighlightSecond from "../HighlightSecond/HighlightSeccond";
import HighlightSection from "../HighlightSection/HighlightSection";
import ModelSection from "../ModelSection/ModelSection";
import ResellerSection from "../ResellerSection/ResellerSection";
import SoloHighlight from "../SoloHighlight/SoloHighlight";

const HomeSection = ({ products }: { products: ProductType[] }) => {
  return (
    <section className="flex flex-col w-full min-h-screen h-full">
      <HeroSection />
      <ModelSection products={products} />
      <SoloHighlight />
      <HighlightSecond />
      <HighlightSection />
      <BranchesPage />
      <ResellerSection />
    </section>
  );
};

export default HomeSection;
