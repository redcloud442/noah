import HeroSection from "../HeroSection/HeroSection";
import HighlightSecond from "../HighlightSecond/HighlightSeccond";
import HighlightSection from "../HighlightSection/HighlightSection";
import ModelSection from "../ModelSection/ModelSection";
import ResellerSection from "../ResellerSection/ResellerSection";
import SoloHighlight from "../SoloHighlight/SoloHighlight";

const HomeSection = () => {
  return (
    <section className="flex flex-col w-full min-h-screen h-full">
      <HeroSection />
      <ModelSection />
      <SoloHighlight />
      <HighlightSecond />
      <HighlightSection />
      <ResellerSection />
    </section>
  );
};

export default HomeSection;
