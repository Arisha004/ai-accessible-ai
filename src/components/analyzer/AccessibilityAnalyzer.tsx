import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { computeReadability } from "./utils";
import { findInclusiveLanguageIssues } from "./language";
import { extractColorsFromHtml, sampleContrastChecks } from "./contrast";
import { Download, History, KeyRound, Wand2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : initial;
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue] as const;
}

const MAX_HISTORY = 3;

type Analysis = {
  text: string;
  readability: ReturnType<typeof computeReadability> | null;
  inclusive: ReturnType<typeof findInclusiveLanguageIssues>;
  colors: ReturnType<typeof sampleContrastChecks>;
  ai?: string;
  createdAt: number;
};

async function aiRewrite(text: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You rewrite text to be inclusive, plain, accessible, and easy to understand while preserving meaning." },
          { role: "user", content: `Rewrite to be accessible and inclusive. Keep tone professional, simplify jargon, and keep structure.\n\n${text}` },
        ],
        temperature: 0.3,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || `OpenAI error ${res.status}`;
      throw new Error(msg);
    }
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("No content returned");
    return content;
}

const AccessibilityAnalyzer = () => {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [simulateCB, setSimulateCB] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage<string>("accessibly_openai_key", "");
  const [history, setHistory] = useLocalStorage<Analysis[]>("accessibly_history", []);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const readability = useMemo(() => text ? computeReadability(text) : null, [text]);
  const inclusive = useMemo(() => text ? findInclusiveLanguageIssues(text) : [], [text]);
  const colors = useMemo(() => sampleContrastChecks(), []);

  const performAnalyze = () => {
    if (!text.trim()) { toast({ title: "Add some text", description: "Paste text or fetch a URL to analyze." }); return; }
    const a: Analysis = { text, readability, inclusive, colors, createdAt: Date.now(), ai: analysis?.ai } as Analysis;
    setAnalysis(a);
  };

  const fetchAndAnalyze = async () => {
    if (!url) return;
    try {
      const res = await fetch(url, { mode: "cors" });
      const html = await res.text();
      const extracted = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      setText(extracted.slice(0, 20000));
      const colorsFound = extractColorsFromHtml(html);
      setAnalysis({ text: extracted, readability: computeReadability(extracted), inclusive: findInclusiveLanguageIssues(extracted), colors: sampleContrastChecks(colorsFound), createdAt: Date.now() });
    } catch (e) {
      console.error(e);
      toast({ title: "Could not fetch page", description: "This site may block cross-origin requests. Try pasting the content instead." });
    }
  };

  const onRewrite = async () => {
    if (!apiKey) { toast({ title: "OpenAI key required", description: "Click the key icon to set your API key." }); return; }
    if (!text.trim()) { toast({ title: "No text", description: "Paste text first." }); return; }
    try {
      setLoadingAI(true);
      const result = await aiRewrite(text, apiKey);
      setAnalysis(prev => prev ? { ...prev, ai: result } : { text, readability: readability!, inclusive, colors, ai: result, createdAt: Date.now() });
      toast({ title: "AI rewrite ready", description: "Review and edit the result before exporting." });
    } catch (e: any) {
      toast({ title: "AI error", description: e?.message || "Unable to rewrite now." });
    } finally {
      setLoadingAI(false);
    }
  };

  const saveHistory = () => {
    if (!analysis) return;
    const next = [analysis, ...history].slice(0, MAX_HISTORY);
    setHistory(next);
    toast({ title: "Saved", description: "Analysis stored locally (last 3)." });
  };

  const exportPDF = async () => {
    const el = reportRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2, useCORS: true, windowWidth: el.scrollWidth, windowHeight: el.scrollHeight });

    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 24;
    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    const pageCanvas = document.createElement('canvas');
    const pageCtx = pageCanvas.getContext('2d')!;
    const pageWidthPx = canvas.width;
    const pageHeightPx = Math.floor(pageWidthPx * printableHeight / printableWidth);
    pageCanvas.width = pageWidthPx;
    pageCanvas.height = pageHeightPx;

    let renderedHeight = 0;
    while (renderedHeight < canvas.height) {
      pageCtx.clearRect(0, 0, pageWidthPx, pageHeightPx);
      pageCtx.drawImage(
        canvas,
        0,
        renderedHeight,
        pageWidthPx,
        Math.min(pageHeightPx, canvas.height - renderedHeight),
        0,
        0,
        pageWidthPx,
        Math.min(pageHeightPx, canvas.height - renderedHeight)
      );
      const pageData = pageCanvas.toDataURL('image/png');
      if (renderedHeight === 0) {
        pdf.addImage(pageData, 'PNG', margin, margin, printableWidth, printableHeight);
      } else {
        pdf.addPage();
        pdf.addImage(pageData, 'PNG', margin, margin, printableWidth, printableHeight);
      }
      renderedHeight += pageHeightPx;
    }

    pdf.save('accessibility-report.pdf');
  };

  return (
    <section id="app-panel" aria-label="Accessibility Checker" className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Main App Panel</span>
              <div className="flex items-center gap-3">
                <button aria-label="Set OpenAI API key" onClick={() => {
                  const v = window.prompt('Enter your OpenAI API key');
                  if (v) setApiKey(v);
                }} className="text-muted-foreground hover:text-foreground"><KeyRound /></button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Simulate Color Blindness</span>
                  <Switch checked={simulateCB} onCheckedChange={setSimulateCB} aria-label="Toggle color blindness simulation" />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left: Inputs */}
              <div>
                <Tabs value={tab} onValueChange={setTab} aria-label="Input Mode">
                  <TabsList>
                    <TabsTrigger value="text">Paste Text</TabsTrigger>
                    <TabsTrigger value="url">Website URL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="space-y-3">
                    <label htmlFor="paste" className="sr-only">Paste text</label>
                    <Textarea id="paste" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste content to analyze" rows={12} />
                    <div className="flex gap-2">
                      <Button onClick={performAnalyze}>Analyze</Button>
                      <Button variant="secondary" onClick={() => setText("")}>Clear</Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="url" className="space-y-3">
                    <label htmlFor="url" className="sr-only">Website URL</label>
                    <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
                    <Button onClick={fetchAndAnalyze}>Fetch & Analyze</Button>
                  </TabsContent>
                </Tabs>

                {/* History */}
                {history.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground"><History className="h-4 w-4" /> Recent Analyses</div>
                    <div className="space-y-2">
                      {history.map((h, i) => (
                        <button key={i} className="w-full text-left text-sm hover:bg-muted/50 p-2 rounded-md" onClick={() => { setText(h.text); setAnalysis(h); }}>
                          {new Date(h.createdAt).toLocaleString()} • {h.text.slice(0, 60)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Results */}
              <div ref={reportRef} className={simulateCB ? "cb-simulate" : undefined}>
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary">Readability</Badge>
                    {readability ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Ease: <strong>{readability.readingEase}</strong></span>
                        <span className="text-sm">Grade: <strong>{readability.gradeLevel}</strong></span>
                        <span className="text-sm text-muted-foreground">{readability.words} words, {readability.sentences} sentences</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No text yet</span>
                    )}
                  </div>

                  <div>
                    <Badge variant="secondary">Inclusive Language</Badge>
                    <ul className="mt-2 space-y-2">
                      {inclusive.length === 0 && <li className="text-sm text-muted-foreground">No issues detected.</li>}
                      {inclusive.map((iss, idx) => (
                        <li key={idx} className="text-sm">
                          <span className="text-destructive font-medium">{iss.term}</span> → <span className="text-primary font-medium">{iss.suggestion}</span>
                          <span className="text-muted-foreground"> • “…{iss.context}…”</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Badge variant="secondary">Color Contrast</Badge>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {colors.map((c, i) => (
                        <div key={i} className="rounded-md border p-2">
                          <div className="h-10 rounded mb-2" style={{ background: c.bg }}>
                            <div className="h-full w-full flex items-center justify-center" style={{ color: c.fg }}>Aa</div>
                          </div>
                          <div className="text-xs">{c.fg} on {c.bg}</div>
                          <div className={`text-xs ${c.passes ? 'text-primary' : 'text-destructive'}`}>Ratio {c.ratio} {c.passes ? 'Pass' : 'Fail'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Badge variant="secondary">AI Rewrite</Badge>
                    <Textarea className="mt-2" rows={8} value={analysis?.ai || ""} onChange={(e) => setAnalysis(prev => prev ? { ...prev, ai: e.target.value } : null)} placeholder="Run AI rewrite to populate…" />
                    <div className="mt-2 flex gap-2">
                      <Button onClick={onRewrite} disabled={loadingAI}><Wand2 className="mr-1 h-4 w-4" /> {loadingAI ? 'Rewriting…' : 'Rewrite with AI'}</Button>
                      <Button variant="secondary" onClick={saveHistory}>Save</Button>
                      <Button variant="outline" onClick={exportPDF}><Download className="mr-1 h-4 w-4" /> Export PDF</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AccessibilityAnalyzer;
