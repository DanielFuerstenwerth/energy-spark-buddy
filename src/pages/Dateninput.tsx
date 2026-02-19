import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NavSubcategory {
  slug: string;
  title: string;
}
interface NavCategory {
  slug: string;
  title: string;
  unterkategorien: NavSubcategory[];
}
interface NavData {
  kategorien: NavCategory[];
}

const FALLBACK_CATEGORIES = [
  { value: "ggv", label: "Gemeinschaftliche Gebäudeversorgung (GGV)" },
  { value: "mieterstrom", label: "Mieterstrom" },
  { value: "zvne", label: "zeitvariable Netzentgelte (zvNE)" },
  { value: "sonstiges", label: "Sonstiges" },
];

const Dateninput = () => {
  const [navData, setNavData] = useState<NavData | null>(null);
  const [category, setCategory] = useState("");
  const [categoryOther, setCategoryOther] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/data/nav.json")
      .then((r) => r.json())
      .then((data: NavData) => setNavData(data))
      .catch(() => setNavData(null));
  }, []);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description.trim()) {
      toast.error("Bitte wählen Sie ein Anliegen und geben Sie eine Beschreibung ein.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      if (category === "sonstiges" && categoryOther) formData.append("categoryOther", categoryOther);
      formData.append("description", description);
      if (contactName) formData.append("contactName", contactName);
      if (contactEmail) formData.append("contactEmail", contactEmail);
      files.forEach((file, i) => formData.append(`file_${i}`, file));

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/submit-data-input`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Fehler beim Senden");
      }

      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Senden. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Banner />
        <Header />
        <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Vielen Dank!</h1>
            <p className="text-muted-foreground text-lg">
              Ihre Daten wurden erfolgreich übermittelt. Wir melden uns bei Bedarf bei Ihnen.
            </p>
            <Button variant="outline" onClick={() => window.location.href = "/mitmachen"}>
              Zurück zur Übersicht
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Daten & Dokumente einreichen</h1>
            <p className="text-muted-foreground">
              Sie haben Erfahrungsberichte, Dokumente oder Daten zu einem Verteilnetzbetreiber?
              Hier können Sie diese unkompliziert mit uns teilen.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Anliegen einordnen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Themenbereich *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Bitte wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {navData ? (
                        <>
                          {navData.kategorien.map((kat) => (
                            <SelectGroup key={kat.slug}>
                              <SelectLabel>{kat.title}</SelectLabel>
                              {kat.unterkategorien.map((sub) => (
                                <SelectItem key={sub.slug} value={sub.slug}>
                                  {sub.title}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                          <SelectGroup>
                            <SelectLabel>Andere</SelectLabel>
                            <SelectItem value="sonstiges">Sonstiges</SelectItem>
                          </SelectGroup>
                        </>
                      ) : (
                        FALLBACK_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {category === "sonstiges" && (
                  <div className="space-y-2">
                    <Label htmlFor="category-other">Bitte spezifizieren</Label>
                    <Input
                      id="category-other"
                      value={categoryOther}
                      onChange={(e) => setCategoryOther(e.target.value)}
                      placeholder="Um welches Thema geht es?"
                      maxLength={200}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Beschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="description">Was möchten Sie uns mitteilen? *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beschreiben Sie Ihre Erfahrung, den Sachverhalt oder die Daten, die Sie einreichen möchten..."
                    rows={6}
                    maxLength={10000}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-right">{description.length} / 10.000</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Dateien hochladen (optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sie können bis zu 5 Dateien hochladen (max. 10 MB pro Datei). Z.B. E-Mail-Verkehr, Screenshots, Bescheide, Tabellen.
                </p>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted text-sm">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate flex-1">{f.name}</span>
                        <span className="text-muted-foreground text-xs">{(f.size / 1024).toFixed(0)} KB</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {files.length < 5 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileAdd}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.txt,.eml,.msg"
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Datei auswählen
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. Kontakt (optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Falls wir Rückfragen haben. Ihre Kontaktdaten werden nicht veröffentlicht.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ihr Name"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">E-Mail</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="ihre@email.de"
                      maxLength={255}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground">
                Mit dem Absenden erklären Sie sich einverstanden, dass Ihre Angaben von VNB-Transparenz zur Auswertung
                genutzt werden. Kontaktdaten werden nur für eventuelle Rückfragen verwendet und nicht veröffentlicht.
                Löschung auf Anfrage jederzeit möglich an{" "}
                <a href="mailto:vnb-transparenz@1000gw.de" className="underline">vnb-transparenz@1000gw.de</a>.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Wird gesendet..." : "Daten absenden"}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dateninput;
