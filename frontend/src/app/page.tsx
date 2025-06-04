import CategoriesSection from "./components/CategoriesSection";
import FeaturesSection from "./components/FeaturesSection";
import HeroSection from "./components/HeroSection";
import HorizontalLine from "./components/ui/HorizontalLine";
import NavBar from "./components/ui/NavBar";
import TypingHeader from "./components/ui/TypingHeader";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-background">
      <NavBar />

      {/* Header Section */}
      <section className="w-full flex flex-col items-center">
        <HorizontalLine />
        <h1 className="text-5xl text-text font-heading pt-5">TAQYIM</h1>
        <TypingHeader />
        <HorizontalLine />
      </section>

      <div className="w-full flex flex-col items-center">
        <HeroSection />
        <HorizontalLine />
      </div>

      <div className="w-full flex flex-col items-center">
        <FeaturesSection />
        <HorizontalLine />
      </div>

      <div className="w-full flex flex-col items-center">
        <CategoriesSection />
        <HorizontalLine />
      </div>
    </div>
  );
}
