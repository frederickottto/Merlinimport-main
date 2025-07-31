"use client";

import { api } from "@/trpc/react";
import { DataTable } from "@/components/table/table";
import { getTaskColumns, type TaskTableItem } from "@/server/controllers/tasks/table-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, Suspense } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DetailView } from "@/components/detail/DetailView";
import { taskDetailConfig } from "@/server/controllers/tasks/detail-config";
import { DynamicForm } from "@/components/form/dynamic-form";
import { getFormFields, defaultValues } from "@/server/controllers/tasks/form-config";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

function TasksContent() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const searchParams = useSearchParams();

  // Handle taskId from URL
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId) {
      setSelectedItemId(taskId);
    }
  }, [searchParams]);

  const { data: allTasks, isLoading: isLoadingAllTasks } = api.tasks.getAll.useQuery({});
  const { data: assignedTasks, isLoading: isLoadingAssignedTasks } = api.tasks.getAll.useQuery(
    { assignedToId: "current" },
    { enabled: true }
  );

  const { data: selectedTask } = api.tasks.getById.useQuery(
    { id: selectedItemId! },
    { enabled: !!selectedItemId }
  );

  const utils = api.useUtils();

  const { mutate: createTask } = api.tasks.create.useMutation({
    onSuccess: async () => {
      toast.success("Task created successfully");
      setIsCreating(false);
      await utils.tasks.getAll.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create task: " + error.message);
    },
  });

  const { mutate: updateTask } = api.tasks.update.useMutation({
    onSuccess: async () => {
      toast.success("Task updated successfully");
      setIsEditing(false);
      await utils.tasks.getById.invalidate({ id: selectedItemId! });
      await utils.tasks.getAll.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update task: " + error.message);
    },
  });

  const handleModalOpen = (id: string | number) => {
    setSelectedItemId(String(id));
    setIsEditing(false);
  };

  const handleModalClose = () => {
    setSelectedItemId(null);
    setIsEditing(false);
  };

  const handleCreateTask = async (data: unknown) => {
    const formData = data as {
      title: string;
      description: string;
      status: "TODO" | "IN_PROGRESS" | "DONE";
      assignedToId?: string;
      tenderId: string;
      dueDate?: Date;
    };

    await createTask({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      tenderId: formData.tenderId,
      assignedToId: formData.assignedToId,
      dueDate: formData.dueDate,
      createdById: "", // This will be set by the server based on the current user
    });
  };

  const handleUpdateTask = async (data: unknown) => {
    if (!selectedItemId || !selectedTask) return;
    const formData = data as {
      title: string;
      description: string;
      status: "TODO" | "IN_PROGRESS" | "DONE";
      assignedToId?: string;
      tenderId: string;
      dueDate?: Date;
    };
    await updateTask({
      ...formData,
      id: selectedItemId,
      createdById: selectedTask.createdBy.id,
    });
  };

  const onCreateClick = () => {
    setIsCreating((v) => !v);
  };

  if (isLoadingAllTasks || isLoadingAssignedTasks) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-gray-400">Loading...</div>
        <Skeleton className="w-[500px] h-[20px] rounded-full" />
        <Skeleton className="w-[500px] h-[20px] rounded-full" />
        <Skeleton className="w-[300px] h-[20px] rounded-full" />
        <Skeleton className="w-[200px] h-[20px] rounded-full" />
      </div>
    );
  }

  if (!allTasks && !assignedTasks) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-gray-400">No Tasks Found!</div>
        <Skeleton className="w-[500px] h-[20px] rounded-full" />
        <Skeleton className="w-[500px] h-[20px] rounded-full" />
        <Skeleton className="w-[300px] h-[20px] rounded-full" />
        <Skeleton className="w-[200px] h-[20px] rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Aufgaben</h1>
      </div>

      {isCreating && (
        <Card className="mb-6 p-4">
          <DynamicForm
            schema={{
              fields: getFormFields(),
              onSubmit: handleCreateTask,
            }}
            defaultValues={defaultValues}
          />
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Alle Aufgaben</TabsTrigger>
          <TabsTrigger value="assigned">Meine Aufgaben</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Alle Aufgaben</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={getTaskColumns('modal', '/tasks')} 
                data={allTasks as TaskTableItem[]} 
                viewMode="modal"
                onView={handleModalOpen}
                onCreate={onCreateClick}
                createLabel={isCreating ? "Abbrechen" : "Neue Aufgabe"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle>Meine Aufgaben</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={getTaskColumns('modal', '/tasks')} 
                data={assignedTasks as TaskTableItem[]} 
                viewMode="modal"
                onView={handleModalOpen}
                onCreate={onCreateClick}
                createLabel={isCreating ? "Abbrechen" : "Neue Aufgabe"}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedItemId} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Aufgabendetails</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            isEditing ? (
              <DynamicForm
                schema={{
                  fields: getFormFields(),
                  onSubmit: handleUpdateTask,
                }}
                defaultValues={{
                  ...defaultValues,
                  ...selectedTask,
                  assignedToId: selectedTask.assignedTo?.id || "",
                  tenderId: selectedTask.tender.id,
                }}
              />
            ) : (
              <DetailView
                schema={taskDetailConfig}
                data={selectedTask ?? {}}
                onEdit={() => setIsEditing(true)}
                className="py-4"
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksContent />
    </Suspense>
  );
}