import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

const WCAGGuide = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEO
      title="WCAG Guide – Accessibly"
      description="Key WCAG 2.2 considerations with practical tips for readability and color contrast."
    />
    <Header />
    <main className="container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl md:text-4xl font-bold">WCAG Guide</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">Key WCAG 2.2 considerations this tool touches:</p>
      <ol className="mt-6 list-decimal pl-6 space-y-2 text-sm">
        <li>Perceivable: Provide sufficient color contrast (1.4.3)</li>
        <li>Understandable: Ensure readable content (3.1.5)</li>
        <li>Inclusive language supports respectful communication</li>
        <li>Consistency and clear labels for inputs and actions</li>
      </ol>
      <section className="mt-8 text-sm text-muted-foreground max-w-3xl space-y-2">
        <p>Tip: Large text (18pt regular or 14pt bold) can use a 3.0:1 contrast ratio; normal text should meet 4.5:1.</p>
        <p>Test text in context: backgrounds can be semi‑transparent and layered—our checker resolves that by walking the DOM.</p>
      </section>
      <p className="mt-6 text-sm text-muted-foreground">For comprehensive guidance, visit the official <a className="story-link" href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noreferrer">WCAG documentation</a>.</p>
    </main>
    <Footer />
  </div>
);

export default WCAGGuide;
