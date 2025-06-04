import CategoriesSection from "./components/CategoriesSection";
import FeaturesSection from "./components/FeaturesSection";
import Footer from "./components/Footer";
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

      <Footer />
    </div>
  );
}
