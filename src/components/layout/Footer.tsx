import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t mt-16" role="contentinfo">
      <div className="container mx-auto px-4 py-10 grid gap-6 md:grid-cols-2">
        <div>
          <p className="font-display text-lg font-semibold">Accessibly</p>
          <p className="text-muted-foreground mt-2">Made by Arisha Mumtaz. Built with love for inclusive web experiences.</p>
        </div>
        <div className="flex items-center md:justify-end gap-4">
          <a className="story-link" href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noreferrer" aria-label="WCAG Reference">WCAG Reference</a>
          <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground"><Github /></a>
          <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground"><Twitter /></a>
          <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground"><Linkedin /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
