import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function DocumentationContent() {
  return (
    <Card>
      
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          <AccordionItem value="welcome">
            <AccordionTrigger>🚀 Willkommen im MERLIN Service-Hub</AccordionTrigger>
            <AccordionContent>
              MERLIN ist dein smarter Copilot für Ausschreibungen im Public Sector.
              Kein Dateichaos mehr. Kein Rätselraten. Mit MERLIN findest du, was du brauchst – in Sekunden.
              Und du triffst Entscheidungen auf Basis von echten Daten, nicht von Bauchgefühl.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="overview">
            <AccordionTrigger>🧭 Was du hier findest</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Schnellstart & Navigation:</strong> Von der Projektanlage bis zur Profilsuche – wir zeigen dir, wo’s langgeht. Ohne Fachchinesisch.</li>
                <li><strong>Use-Cases erklärt:</strong> Du willst ein Angebot bauen? Ein Team zusammenstellen? Daten pflegen? Wir zeigen dir, wie’s geht – einfach und konkret.</li>
                <li><strong>Tipps für smarte Entscheidungen:</strong> Welche Projekte laufen? Welche Skills fehlen? Wer sind unsere stärksten Partner? Wie schneiden wir im Vergleich ab?</li>
                
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="target-group">
            <AccordionTrigger>💡 Für wen ist MERLIN gemacht?</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Sales-Teams & PMOs:</strong> Angebote schneller bauen und besser gewinnen</li>
                <li><strong>Projektleitungen & Entscheider*innen:</strong> den vollen Überblick behalten</li>
                <li><strong>Alle Mitarbeitenden:</strong> einfach nutzen, sofort verstehen</li>
                <li><strong>IT-Teams:</strong> keine Komplexität, volle Skalierbarkeit</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="beta-feedback">
            <AccordionTrigger>🧪 Noch in der Beta?</AccordionTrigger>
            <AccordionContent>
              Ja – und genau deshalb freuen wir uns über dein Feedback. Sag uns, was fehlt, wo’s hakt, was du brauchst. MERLIN wächst mit dir.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
