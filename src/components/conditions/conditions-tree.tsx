import { ChevronDown, ChevronRight, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { ConditionsOfParticipationType } from "@/server/controllers/tender/conditionsOfParticipationType/schema";
import type { ConditionsOfParticipation } from "@/server/controllers/tender/conditionsOfParticipation/schema";

interface ConditionsTreeProps {
  types: ConditionsOfParticipationType[];
  conditions: ConditionsOfParticipation[];
  onAddType: (parentId?: string) => void;
  onAddCondition: (typeId: string) => void;
  onTypeClick: (id: string) => void;
  onConditionClick: (id: string) => void;
  onDeleteType: (id: string) => void;
  onDeleteCondition: (id: string) => void;
  selectedTypeId?: string;
  selectedConditionId?: string;
}

export function ConditionsTree({
  types,
  conditions,
  onAddType,
  onAddCondition,
  onTypeClick,
  onConditionClick,
  onDeleteType,
  onDeleteCondition,
  selectedTypeId,
  selectedConditionId,
}: ConditionsTreeProps) {
  // Get root types (types without parents)
  const rootTypes = types.filter((type) => !type.parentTypeIDs);

  return (
    <div className="space-y-2">
      {rootTypes.map((type) => (
        <TypeNode
          key={type.id}
          type={type}
          allTypes={types}
          conditions={conditions}
          onAddType={onAddType}
          onAddCondition={onAddCondition}
          onTypeClick={onTypeClick}
          onConditionClick={onConditionClick}
          onDeleteType={onDeleteType}
          onDeleteCondition={onDeleteCondition}
          selectedTypeId={selectedTypeId}
          selectedConditionId={selectedConditionId}
          level={0}
        />
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddType()}
        className="w-full justify-start"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Neuer Typ
      </Button>
    </div>
  );
}

interface TypeNodeProps {
  type: ConditionsOfParticipationType;
  allTypes: ConditionsOfParticipationType[];
  conditions: ConditionsOfParticipation[];
  onAddType: (parentId?: string) => void;
  onAddCondition: (typeId: string) => void;
  onTypeClick: (id: string) => void;
  onConditionClick: (id: string) => void;
  onDeleteType: (id: string) => void;
  onDeleteCondition: (id: string) => void;
  selectedTypeId?: string;
  selectedConditionId?: string;
  level: number;
}

function TypeNode({
  type,
  allTypes,
  conditions,
  onAddType,
  onAddCondition,
  onTypeClick,
  onConditionClick,
  onDeleteType,
  onDeleteCondition,
  selectedTypeId,
  selectedConditionId,
  level,
}: TypeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Get child types
  const childTypes = allTypes.filter((t) => t.parentTypeIDs === type.id);
  
  // Get conditions for this type
  const typeConditions = conditions.filter(
    (c) => c.conditionsOfParticipationTypeIDs === type.id
  );

  const hasChildren = childTypes.length > 0 || typeConditions.length > 0;

  const handleAddType = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddType(type.id);
  };

  const handleAddCondition = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddCondition(type.id);
  };

  const handleTypeClick = () => {
    onTypeClick(type.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteType(type.id);
  };

  // Determine background color based on level
  const getTypeBackgroundColor = (level: number) => {
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
          getTypeBackgroundColor(level),
          selectedTypeId === type.id && "ring-2 ring-primary/20",
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
          onClick={handleTypeClick}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{type.title}</span>
          </div>
          {type.description && (
            <div className="text-sm text-muted-foreground">
              {type.description}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddType}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddCondition}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Bedingung
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
          {/* Render child types */}
          {childTypes.map((childType) => (
            <TypeNode
              key={childType.id}
              type={childType}
              allTypes={allTypes}
              conditions={conditions}
              onAddType={onAddType}
              onAddCondition={onAddCondition}
              onTypeClick={onTypeClick}
              onConditionClick={onConditionClick}
              onDeleteType={onDeleteType}
              onDeleteCondition={onDeleteCondition}
              selectedTypeId={selectedTypeId}
              selectedConditionId={selectedConditionId}
              level={level + 1}
            />
          ))}

          {/* Visual separator between types and conditions */}
          {childTypes.length > 0 && typeConditions.length > 0 && (
            <div className="flex items-center gap-2 px-2">
             <div className="h-px flex-1 bg-border" />
             <span className="text-sm font-medium text-muted-foreground">Bedingungen</span>
             <div className="h-px flex-1 bg-border" />
             </div>
          )}

          {/* Render conditions */}
          {typeConditions.length > 0 && (
            <div className="space-y-2">
              {typeConditions.map((condition) => (
                <div
                  key={condition.id}
                  className={cn(
                    "ml-8 rounded-lg p-2 transition-colors",
                    "bg-green-50/50 hover:bg-green-100/50",
                    selectedConditionId === condition.id && "ring-2 ring-primary/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => condition.id && onConditionClick(condition.id)}
                    >
                      <div className="font-medium">{condition.title}</div>
                      {condition.requirements && (
                        <div className="text-sm text-muted-foreground">
                          {condition.requirements}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (condition.id) {
                          onDeleteCondition(condition.id);
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 