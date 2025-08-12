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
import { analyzeContrastInDom, type DomContrastResult } from "./contrastDom";
import { localRewrite } from "./localRewrite";
import { Download, History, Wand2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { diffWords } from "diff";
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
  colors: DomContrastResult[];
  ai?: string;
  createdAt: number;
};

// AI rewrite is optional; we also support local fallback (no key required)

const AccessibilityAnalyzer = () => {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [simulateCB, setSimulateCB] = useState(false);
  const [history, setHistory] = useLocalStorage<Analysis[]>("accessibly_history", []);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const readability = useMemo(() => text ? computeReadability(text) : null, [text]);
  const inclusive = useMemo(() => text ? findInclusiveLanguageIssues(text) : [], [text]);
  const [targetGrade, setTargetGrade] = useState<number>(6);
  const defaultColors = useMemo(() => analyzeContrastInDom(), []);

  const getReadingTime = (words: number) => Math.max(1, Math.round(words / 200));
  const getComplexSentences = (t: string) => t
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => ({ s, w: s.trim().split(/\s+/).filter(Boolean).length }))
    .filter(x => x.w > 24)
    .slice(0, 3);
  const getLongWords = (t: string) => (t.match(/\b[\w'-]{13,}\b/g) || []).slice(0, 6);

  const performAnalyze = () => {
    if (!text.trim()) { toast({ title: "Add some text", description: "Paste text or fetch a URL to analyze." }); return; }
    const colorsNow = analyzeContrastInDom();
    const a: Analysis = { text, readability, inclusive, colors: colorsNow, createdAt: Date.now(), ai: analysis?.ai } as Analysis;
    setAnalysis(a);
    toast({ title: "Analysis complete", description: "Results updated. You can now Save or Export." });
  };

  const fetchAndAnalyze = async () => {
    if (!url) return;
    try {
      const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      const { data, error } = await supabase.functions.invoke('fetch-url', { body: { url: safeUrl } });
      if (error) {
        let desc = error.message || 'Fetch failed';
        try {
          const ctx = (error as any).context;
          if (ctx && typeof ctx.json === 'function') {
            const body = await ctx.json();
            if (body?.error) desc = body.error;
          }
        } catch {}
        throw new Error(desc);
      }
      const html: string = data?.html || '';
      const extracted: string = data?.text || '';
      if (!extracted) {
        throw new Error('No text could be extracted from this page.');
      }
      setText(extracted.slice(0, 20000));
      const domColors = analyzeContrastInDom();
      setAnalysis({ text: extracted, readability: computeReadability(extracted), inclusive: findInclusiveLanguageIssues(extracted), colors: domColors, createdAt: Date.now() });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Could not fetch page', description: e?.message || 'Please check the URL and try again.' });
    }
  };

  const onRewrite = async () => {
    if (!text.trim()) { toast({ title: 'No text', description: 'Paste text first.' }); return; }
    setLoadingAI(true);
    try {
      const result = localRewrite(text, targetGrade);
      setAnalysis(prev => prev ? { ...prev, ai: result } : { text, readability: readability!, inclusive, colors: defaultColors, ai: result, createdAt: Date.now() });
      toast({ title: 'Rewrite ready', description: `Simplified toward Grade ${targetGrade}.` });
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
              <span>Accessibility Checker</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Simulate color blindness</span>
                  <Switch checked={simulateCB} onCheckedChange={setSimulateCB} aria-label="Toggle color blindness simulation" />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <aside aria-label="How to use" className="mb-6 text-sm text-muted-foreground">
              <ol className="list-decimal list-inside space-y-1">
                <li>Paste text or enter a website URL, then click Analyze or Fetch & Analyze.</li>
                <li>Review readability, inclusive language, and contrast results.</li>
                <li>Use Rewrite to simplify wording (works locally; AI optional if configured).</li>
                <li>Export PDF to save or share the report, or Save to keep recent results.</li>
              </ol>
            </aside>
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
                    <div className="flex items-center gap-3">
                      <Button onClick={performAnalyze}>Analyze</Button>
                      <Button variant="secondary" onClick={() => setText("")}>Clear</Button>
                      <label className="text-sm text-muted-foreground flex items-center gap-2">Target grade
                        <Input type="number" min={1} max={12} className="w-16" value={targetGrade} onChange={(e) => setTargetGrade(Number(e.target.value) || 6)} />
                      </label>
                    </div>
                  </TabsContent>
                  <TabsContent value="url" className="space-y-3">
                    <label htmlFor="url" className="sr-only">Website URL</label>
                    <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
                    <div className="flex items-center gap-3">
                      <Button onClick={fetchAndAnalyze}>Fetch & Analyze</Button>
                      <div className="text-xs text-muted-foreground">Target grade: <strong>{targetGrade}</strong></div>
                    </div>
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
                    {(analysis?.readability || readability) ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">Ease: <strong>{(analysis?.readability ?? readability)!.readingEase}</strong></span>
                        <span className="text-sm">Grade: <strong>{(analysis?.readability ?? readability)!.gradeLevel}</strong></span>
                        <span className="text-sm text-muted-foreground">{(analysis?.readability ?? readability)!.words} words, {(analysis?.readability ?? readability)!.sentences} sentences</span>
                        <span className="text-xs text-muted-foreground">~{getReadingTime((analysis?.readability ?? readability)!.words)} min read</span>
                        <span className="text-xs text-muted-foreground">Target Grade: {targetGrade} • Aim for Ease 60–80, Grade 8–10</span>
                        {analysis?.createdAt ? <span className="text-xs text-muted-foreground">Analyzed {new Date(analysis.createdAt).toLocaleTimeString()}</span> : null}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No text yet</span>
                    )}
                  </div>

                  <div>
                    <Badge variant="secondary">Inclusive Language</Badge>
                    <ul className="mt-2 space-y-2">
                      {(analysis?.inclusive ?? inclusive).length === 0 && <li className="text-sm text-muted-foreground">No issues detected.</li>}
                      {(analysis?.inclusive ?? inclusive).map((iss, idx) => (
                        <li key={idx} className="text-sm">
                          <span className="text-destructive font-medium">{iss.term}</span> → <span className="text-primary font-medium">{iss.suggestion}</span>
                          <span className="text-muted-foreground"> • “…{iss.context}…”</span>
                        </li>
                      ))}
                    </ul>
                    {text && (
                      <div className="mt-3 space-y-1">
                        <div className="text-xs text-muted-foreground">Complex sentences:</div>
                        <ul className="list-disc pl-5 text-xs space-y-1">
                          {getComplexSentences(text).map((c, i) => (<li key={i} className="truncate" title={c.s}>{c.s}</li>))}
                        </ul>
                        <div className="text-xs text-muted-foreground mt-2">Long words:</div>
                        <div className="text-xs text-muted-foreground">{getLongWords(text).join(', ')}</div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Badge variant="secondary">Color Contrast</Badge>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(analysis?.colors ?? defaultColors).map((c, i) => (
                        <div key={i} className="rounded-md border p-2">
                          <div className="h-10 rounded mb-2" style={{ background: c.bg }}>
                            <div className="h-full w-full flex items-center justify-center" style={{ color: c.fg }}>Aa</div>
                          </div>
                          <div className="text-xs">{c.fg} on {c.bg}</div>
                          <div className={`text-xs ${c.passes ? 'text-primary' : 'text-destructive'}`}>Ratio {c.ratio} {c.passes ? 'Pass' : 'Fail'}</div>
                          <div className="text-[10px] text-muted-foreground" title={c.snippet}>
                            “{c.snippet}”
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1 truncate" title={c.selector}>{c.selector}</div>
                          <div className="text-[10px] text-muted-foreground">Font {c.fontSize}px</div>
                          {!c.passes && c.suggestedFg && (
                            <div className="text-[10px] text-muted-foreground">Try: <span className="font-medium" style={{ color: c.suggestedFg }}>{c.suggestedFg}</span></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Badge variant="secondary">Rewrite</Badge>
                    <Textarea className="mt-2" rows={8} value={analysis?.ai || ""} onChange={(e) => setAnalysis(prev => prev ? { ...prev, ai: e.target.value } : null)} placeholder="Run rewrite to populate…" />
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <Button onClick={onRewrite} disabled={loadingAI}><Wand2 className="mr-1 h-4 w-4" /> {loadingAI ? 'Rewriting…' : 'Rewrite'}</Button>
                      <div className="text-xs text-muted-foreground">Target Grade: {targetGrade}</div>
                      <Button variant="secondary" onClick={saveHistory} disabled={!analysis}>Save</Button>
                      <Button variant="outline" onClick={exportPDF}><Download className="mr-1 h-4 w-4" /> Export PDF</Button>
                    </div>
                    {analysis?.ai && (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Original</div>
                          <div className="p-2 border rounded text-xs leading-relaxed">
                            {diffWords(text, analysis.ai).map((part, idx) => (
                              part.added ? null : (
                                <span key={idx} className={part.removed ? 'bg-destructive/20 rounded px-0.5' : undefined}>{part.value}</span>
                              )
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Rewritten</div>
                          <div className="p-2 border rounded text-xs leading-relaxed">
                            {diffWords(text, analysis.ai).map((part, idx) => (
                              part.removed ? null : (
                                <span key={idx} className={part.added ? 'bg-primary/20 rounded px-0.5' : undefined}>{part.value}</span>
                              )
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
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
