import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Häufige Fragen (FAQ)</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          <AccordionItem value="registration">
            <AccordionTrigger>📝 Wie kann ich mich registrieren?</AccordionTrigger>
            <AccordionContent>
              Ganz einfach! Über die Anmeldeseite kannst du mit wenigen Klicks ein neues Konto erstellen. Du brauchst dafür nur eine gültige E-Mail-Adresse.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="support">
            <AccordionTrigger>📬 Wie kontaktiere ich den Support?</AccordionTrigger>
            <AccordionContent>
              Du erreichst uns jederzeit über Teams oder E-Mail Wir antworten in der Regel innerhalb von 24 Stunden.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="browser">
            <AccordionTrigger>🌐 Muss ich etwas installieren?</AccordionTrigger>
            <AccordionContent>
              Nein. MERLIN läuft vollständig im Browser – egal ob Chrome, Firefox oder Safari. Einfach einloggen und loslegen.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="costs">
            <AccordionTrigger>💰 Was kostet MERLIN?</AccordionTrigger>
            <AccordionContent>
              Aktuell testen wir MERLIN in der Beta – komplett kostenlos. Für spätere Versionen wird es faire, transparente Lizenzmodelle geben. Versprochen.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}