const FeaturesPage = () => (
  <main className="container mx-auto px-4 py-10">
    <h1 className="font-display text-3xl md:text-4xl font-bold">Features</h1>
    <p className="mt-2 text-muted-foreground max-w-2xl">Accessibly brings together readability metrics, inclusive language detection, contrast checks, and AI rewriting—fully client-side.</p>
    <ul className="mt-6 list-disc pl-6 space-y-2 text-sm">
      <li>Flesch–Kincaid readability scoring</li>
      <li>Dictionary-based inclusive language signals</li>
      <li>WCAG contrast tester with samples</li>
      <li>OpenAI-powered rewrite with your API key</li>
      <li>Local history and PDF export</li>
    </ul>
  </main>
);

export default FeaturesPage;
