import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
const Erklaerungen = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Erklärungen & Rechte</h1>

        <div className="max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Die Aufgaben und Pflichten der VNB</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Verteilnetzbetreiber haben verschiedene Pflichten gegenüber Projektierern, Anlagenbetreibern und
                Anschlussnehmern. Hier soll in Zukunft für die verschiedenen Aufgabenbereiche ein Überblick gegeben
                werden: denn nicht alles, was ein Netzkunde sich wünscht, muss auch die Pflicht des VNB sein.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links zu Leitfäden und weiteren Informationen für die betrachteten Themen</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Hier sollen in Zukunft Links zu Leitfäden und anderen relevanten Dokumenten zu finden sein</li>
              </ul>
              <p className="text-sm text-muted-foreground italic mt-4"></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">...</h3>
                <p className="text-sm text-muted-foreground">...</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">...</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default Erklaerungen;
