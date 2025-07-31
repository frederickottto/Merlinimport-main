"use client";

import React, { useState } from "react";
import { supportTopics } from "@/support/supportTopics";
import FAQContent from "@/support/faq";
import DocumentationContent from "@/support/documentation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const topicComponents: Record<string, React.FC> = {
  FAQ: FAQContent,
  Dokumentation: DocumentationContent,
};

export default function SupportPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (title: string) => setSelected(title);

  const SelectedComponent = selected ? topicComponents[selected] : null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Support</h1>
      {!selected ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {supportTopics.map((topic) => (
            <Card
              key={topic.title}
              className="cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
              onClick={() => handleSelect(topic.title)}
            >
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{topic.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <button
            className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setSelected(null)}
          >
            ← Zurück
          </button>
          {SelectedComponent && <SelectedComponent />}
        </div>
      )}
    </div>
  );
} 