import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

const About = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEO
      title="About – Accessibly: Inclusive Accessibility Checker"
      description="Learn how Accessibly helps you create inclusive, readable content with local analysis and privacy-first design."
    />
    <Header />
    <main className="container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl md:text-4xl font-bold">About Accessibly</h1>
      <section className="mt-3 text-muted-foreground max-w-3xl space-y-4">
        <p>
          Accessibly is a privacy-first accessibility checker that helps teams write clear, inclusive content and verify color contrast against WCAG. Analyses run locally in your browser, and you can optionally use AI rewriting—without storing any of your data on our servers.
        </p>
        <p>
          What you can do with Accessibly:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Check readability (Flesch–Kincaid) with reading time and complexity highlights.</li>
          <li>Flag non‑inclusive terms and suggest alternatives.</li>
          <li>Test color contrast in context, ignoring hidden/decorative elements.</li>
          <li>Rewrite copy toward a target grade level for plain language.</li>
        </ul>
        <p className="text-sm">
          Data policy: your content stays on your device. Only when you choose to use remote AI (disabled by default) would text be sent to the AI provider.
        </p>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
