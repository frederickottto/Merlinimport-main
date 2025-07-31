import { ChevronDown, ChevronRight, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Lot } from "@/server/controllers/tender/lot/schema";
import type { Workpackage } from "@/server/controllers/tender/workpackage/schema";

interface LotDivisionTreeProps {
  lots: Lot[];
  workpackages: Workpackage[];
  onAddLot: (parentId?: string) => void;
  onAddWorkpackage: (lotId: string) => void;
  onLotClick: (id: string) => void;
  onWorkpackageClick: (id: string) => void;
  onDeleteLot: (id: string) => void;
  onDeleteWorkpackage: (id: string) => void;
  selectedLotId?: string;
  selectedWorkpackageId?: string;
}

export function LotDivisionTree({
  lots,
  workpackages,
  onAddLot,
  onAddWorkpackage,
  onLotClick,
  onWorkpackageClick,
  onDeleteLot,
  onDeleteWorkpackage,
  selectedLotId,
  selectedWorkpackageId,
}: LotDivisionTreeProps) {
  // Get root lots (lots without parents)
  const rootLots = lots.filter((lot) => !lot.parentLotID);

  return (
    <div className="space-y-2">
      {rootLots.map((lot) => (
        <LotDivisionNode
          key={lot.id}
          lot={lot}
          lots={lots}
          workpackages={workpackages}
          onAddLot={onAddLot}
          onAddWorkpackage={onAddWorkpackage}
          onLotClick={onLotClick}
          onWorkpackageClick={onWorkpackageClick}
          onDeleteLot={onDeleteLot}
          onDeleteWorkpackage={onDeleteWorkpackage}
          selectedLotId={selectedLotId}
          selectedWorkpackageId={selectedWorkpackageId}
          level={0}
        />
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddLot()}
        className="w-full justify-start"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Neues Los
      </Button>
    </div>
  );
}

interface LotDivisionNodeProps {
  lot: Lot;
  lots: Lot[];
  workpackages: Workpackage[];
  onAddLot: (parentId?: string) => void;
  onAddWorkpackage: (lotId: string) => void;
  onLotClick: (id: string) => void;
  onWorkpackageClick: (id: string) => void;
  onDeleteLot: (id: string) => void;
  onDeleteWorkpackage: (id: string) => void;
  selectedLotId?: string;
  selectedWorkpackageId?: string;
  level: number;
}

function LotDivisionNode({
  lot,
  lots,
  workpackages,
  onAddLot,
  onAddWorkpackage,
  onLotClick,
  onWorkpackageClick,
  onDeleteLot,
  onDeleteWorkpackage,
  selectedLotId,
  selectedWorkpackageId,
  level,
}: LotDivisionNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Get child lots
  const childLots = lots.filter((l) => l.parentLotID === lot.id);
  
  // Get workpackages for this lot
  const lotWorkpackages = workpackages.filter(
    (w) => w.lotID === lot.id
  );

  const hasChildren = childLots.length > 0 || lotWorkpackages.length > 0;



  const handleAddWorkpackage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddWorkpackage(lot.id);
  };

  const handleLotClick = () => {
    onLotClick(lot.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteLot(lot.id);
  };

  // Determine background color based on level
  const getLotBackgroundColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-blue-50/50 hover:bg-blue-100/50";
      case 1:
        return "bg-purple-50/50 hover:bg-purple-100/50";
      case 2:
        return "bg-pink-50/50 hover:bg-pink-100/50";
      default:
        return "bg-gray-50/50 hover:bg-gray-100/50";
    }
  };

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg p-2 transition-colors",
          getLotBackgroundColor(level),
          selectedLotId === lot.id && "ring-2 ring-primary/20",
          level > 0 && "ml-4"
        )}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        <div
          className="flex-1 cursor-pointer"
          onClick={handleLotClick}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {lot.number ? `${lot.number} - ` : ""}
              {lot.title || "Unbenannt"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {lot.description}
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            {lot.volumeEuro && (
              <span>{lot.volumeEuro.toLocaleString()} €</span>
            )}
            {lot.volumePT && <span>{lot.volumePT.toLocaleString()} PT</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddWorkpackage}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Arbeitspaket
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-1">
          {/* Render child lots */}
          {childLots.map((childLot) => (
            <LotDivisionNode
              key={childLot.id}
              lot={childLot}
              lots={lots}
              workpackages={workpackages}
              onAddLot={onAddLot}
              onAddWorkpackage={onAddWorkpackage}
              onLotClick={onLotClick}
              onWorkpackageClick={onWorkpackageClick}
              onDeleteLot={onDeleteLot}
              onDeleteWorkpackage={onDeleteWorkpackage}
              selectedLotId={selectedLotId}
              selectedWorkpackageId={selectedWorkpackageId}
              level={level + 1}
            />
          ))}

          {/* Render workpackages with a separator and header */}
          {lotWorkpackages.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm font-medium text-muted-foreground">Arbeitspakete</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-2">
                {lotWorkpackages.map((workpackage) => (
                  <div
                    key={workpackage.id}
                    className={cn(
                      "ml-8 rounded-lg p-3 transition-colors",
                      "bg-green-50/50 hover:bg-green-100/50 border border-green-100",
                      selectedWorkpackageId === workpackage.id && "ring-2 ring-primary/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => onWorkpackageClick(workpackage.id)}
                      >
                        <div className="font-medium flex items-center gap-2">
                          <span className="text-green-700">AP</span>
                          {workpackage.number ? `${workpackage.number} - ` : ""}
                          {workpackage.title || "Unbenannt"}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {workpackage.description}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {workpackage.volumeEuro && (
                            <span>{workpackage.volumeEuro.toLocaleString()} €</span>
                          )}
                          {workpackage.volumePT && (
                            <span>{workpackage.volumePT.toLocaleString()} PT</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWorkpackage(workpackage.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 