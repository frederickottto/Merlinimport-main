"use client";

import { Card } from "@/components/ui/card";

export default function DashboardPage() {
	return (
		<div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
			<div className="p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold tracking-tight">Ausschreibungs Präqualifikation</h1>
					<p className="text-muted-foreground mt-2">
						Hier können Sie Präqualifikationen für Ausschreibungen erstellen und verwalten.
					</p>
				</div>

				<Card className="border-none shadow-none p-6">
					<div className="min-h-[calc(100vh-16rem)] flex items-center justify-center text-muted-foreground">
						LabelStudio UI will be integrated here soon. Please check back later.
					</div>
				</Card>
			</div>
		</div>
	);
}
