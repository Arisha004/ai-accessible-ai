import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import AccessibilityAnalyzer from "@/components/analyzer/AccessibilityAnalyzer";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Accessibly – AI Accessibility Checker";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Analyze text or websites for accessibility issues and get AI suggestions.');
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Features />
        <AccessibilityAnalyzer />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
