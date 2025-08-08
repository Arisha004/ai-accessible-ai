import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Edit3, Eye, Sparkles } from "lucide-react";

const items = [
  { title: "Readability Analyzer", icon: Eye, desc: "Flesch–Kincaid metrics for quick clarity checks." },
  { title: "Inclusive Language", icon: Brain, desc: "Detect and suggest inclusive alternatives." },
  { title: "Color Contrast", icon: Sparkles, desc: "WCAG contrast checks with pass/fail signals." },
  { title: "AI Rewriter", icon: Edit3, desc: "Rewrite content to be clear, plain, and accessible." },
];

const Features = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map(({ title, icon: Icon, desc }) => (
            <Card key={title} className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon className="text-primary" /> {title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
