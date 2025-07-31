import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex flex-col p-4 items-center justify-center space-y-4">
      <span className="text-sm text-gray-600 ">
        Welcome to the MERLIN-Project V4
      </span>

      <Button variant="outline" asChild>
        <Link href="/dashboard">Dashboard (Go here for App)</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/api/reference">API Reference</Link>
      </Button>
    </div>
  );
}
