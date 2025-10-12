import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemStatement from "@/components/ProblemStatement";
import SolutionSnapshot from "@/components/SolutionSnapshot";
import Features from "@/components/Features";
import Architecture from "@/components/Architecture";
import UseCases from "@/components/UseCases";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen dark">
      <Navbar />
      <main>
        <Hero />
        <ProblemStatement />
        <SolutionSnapshot />
        <Features />
        <Architecture />
        <UseCases />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
