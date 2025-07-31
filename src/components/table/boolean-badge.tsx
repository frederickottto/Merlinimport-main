import { Badge } from "@/components/ui/badge";

interface BooleanBadgeProps {
  value: boolean;
}

export function BooleanBadge({ value }: BooleanBadgeProps) {
  return (
    <Badge variant={value ? "default" : "destructive"}>
      {value ? "Yes" : "No"}
    </Badge>
  );
} 