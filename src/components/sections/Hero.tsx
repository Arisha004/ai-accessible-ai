import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center animate-enter">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight">
            Build Accessible Content with AI Precision
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            Instantly analyze and improve your text or website for inclusivity, readability, and compliance.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="#app-panel">
              <Button variant="hero" size="lg" className="btn-hero">Start Checking</Button>
            </a>
            <a href="/features" className="story-link">Explore Features</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
