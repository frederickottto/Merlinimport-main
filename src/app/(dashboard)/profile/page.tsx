"use client";

import { Card } from "@/components/ui/card";

function ProfileContent() {
	return (
		<div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
			<div className="p-6">
				<div className="flex items-center justify-center h-full">
					<Card className="p-8 max-w-md">
						<div className="text-center">
							<h2 className="text-2xl font-semibold mb-4">Profile Unavailable</h2>
							<p className="text-muted-foreground">
								The profile functionality has been disabled since authentication was removed from the application.
							</p>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default function Page() {
	return <ProfileContent />;
}
