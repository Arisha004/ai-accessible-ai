const WCAGGuide = () => (
  <main className="container mx-auto px-4 py-10">
    <h1 className="font-display text-3xl md:text-4xl font-bold">WCAG Guide</h1>
    <p className="mt-2 text-muted-foreground max-w-2xl">Key WCAG 2.2 considerations this tool touches:</p>
    <ol className="mt-6 list-decimal pl-6 space-y-2 text-sm">
      <li>Perceivable: Provide sufficient color contrast (1.4.3)</li>
      <li>Understandable: Ensure readable content (3.1.5)</li>
      <li>Inclusive language supports respectful communication</li>
      <li>Consistency and clear labels for inputs and actions</li>
    </ol>
    <p className="mt-6 text-sm text-muted-foreground">For comprehensive guidance, visit the official <a className="story-link" href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noreferrer">WCAG documentation</a>.</p>
  </main>
);

export default WCAGGuide;
