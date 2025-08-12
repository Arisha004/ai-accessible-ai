import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/SEO";
import SectionFeatures from "@/components/sections/Features";

const FeaturesPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEO
      title="Features – Accessibly Accessibility Checker"
      description="Readability, inclusive language, DOM-aware contrast checks, and AI rewriting toward plain language."
    />
    <Header />
    <main className="container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl md:text-4xl font-bold">Features</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">Accessibly brings together readability metrics, inclusive language detection, DOM-aware contrast checks, and a local AI rewrite engine targeting plain language.</p>

      <SectionFeatures />

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Readability & Guidance</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Flesch–Kincaid scoring, reading time, complex sentence highlights, long word flags, and goal setting (default Grade 6).
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contrast with Context</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Checks live DOM, ignores hidden/decorative elements, resolves transparent backgrounds, and suggests WCAG‑compliant alternatives.
          </CardContent>
        </Card>
      </section>
    </main>
    <Footer />
  </div>
);

export default FeaturesPage;
