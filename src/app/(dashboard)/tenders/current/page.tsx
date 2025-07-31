"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { KANBAN_COLUMNS, TenderStatus, TenderStatusType } from "@/server/controllers/tender/schema";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	useDroppable,
	DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState } from "react";

type TenderBackend = {
	id: string;
	title: string | null;
	type: string | null;
	shortDescription: string | null;
	offerDeadline?: string | Date | null;
	status: TenderStatusType | null;
	keywords: string[];
	organisations?: Array<{
		id: string;
		organisation: {
			id: string;
			name: string;
		};
		organisationRole: string;
	}>;
	employees?: Array<{
		id: string;
		employee: {
			id: string;
			foreName: string;
			lastName: string;
		};
		employeeCallToTenderRole: string;
	}>;
	conditionsOfParticipation?: Array<{
		id: string;
		title: string;
		conditionsOfParticipationType?: {
			id: string;
			title: string;
		};
		certificate?: Array<{
			id: string;
			title: string;
		}>;
		industrySector?: Array<{
			id: string;
			industrySector: string;
		}>;
	}>;
	lotDivisions?: Array<{
		id: string;
		number?: string;
		title?: string;
		description: string;
		volumeEuro?: number;
		volumePT?: number;
		workpackages?: Array<{
			id: string;
			number: string;
			title: string;
			description: string;
			volumeEuro?: number;
			volumePT?: number;
		}>;
	}>;
	workpackages?: Array<{
		id: string;
		number: string;
		title: string;
		description: string;
		volumeEuro?: number;
		volumePT?: number;
	}>;
	template?: Array<{
		id: string;
		title: string;
		description?: string;
	}>;
	callToTenderDeliverables?: Array<{
		id: string;
		deliverables: {
			id: string;
			title: string;
			description: string;
		};
	}>;
	riskQualityProcesses?: Array<{
		id: string;
		type: string;
		status: string;
		note?: string;
	}>;
};

// Draggable Tender Card Component
const DraggableTenderCard = ({ tender }: { tender: TenderBackend }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: tender.id,
		data: {
			type: "tender",
			tender,
		},
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<Link
				href={`/tenders/${tender.id}`}
				aria-label={`Ausschreibung ${tender.title ?? tender.id}`}
				className="group block"
			>
				<Card className="flex flex-col justify-between transition-shadow group-hover:shadow-lg cursor-pointer">
					<CardHeader className="p-3">
						<CardTitle className="text-sm">{tender.title ?? "-"}</CardTitle>
						<CardDescription className="text-xs">{tender.type ?? "-"}</CardDescription>
					</CardHeader>
					<CardContent className="p-3 pt-0">
						<p className="text-xs mb-1 line-clamp-2">{tender.shortDescription ?? "-"}</p>
						<p className="text-xs text-gray-400">
							Deadline: {formatDate(tender.offerDeadline)}
						</p>
					</CardContent>
				</Card>
			</Link>
		</div>
	);
};

// Add DroppableColumn component
const DroppableColumn = ({ column, children, tenderCount }: { 
	column: typeof KANBAN_COLUMNS[keyof typeof KANBAN_COLUMNS], 
	children: React.ReactNode,
	tenderCount: number 
}) => {
	const { setNodeRef } = useDroppable({
		id: column.id,
	});

	return (
		<div 
			ref={setNodeRef}
			className="flex flex-col space-y-4"
		>
			<div className="bg-gray-100 p-2 rounded-lg">
				<h3 className="font-semibold">{column.label}</h3>
				<span className="text-sm text-gray-500">
					{tenderCount} Ausschreibungen
				</span>
			</div>
			<div className="flex flex-col space-y-2 min-h-[200px] p-2 rounded-lg ">
				{children}
			</div>
		</div>
	);
};

const Page = () => {
	const { data, isLoading, error } = api.tenders.all.useQuery();
	const utils = api.useUtils();
	const updateTender = api.tenders.update.useMutation({
		onSuccess: () => {
			// Invalidate and refetch the tenders query
			utils.tenders.all.invalidate();
			utils.tenders.all.refetch();
		},
	});

	const [activeId, setActiveId] = useState<string | null>(null);

	// Configure sensors for drag detection
	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 10, // 10px movement required before drag starts
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 250, // 250ms delay before drag starts
				tolerance: 5, // 5px movement allowed before drag starts
			},
		})
	);

	if (isLoading) {
		return (
			<div className="flex flex-col space-y-4">
				<Skeleton className="w-[500px] h-[20px] rounded-full" />
				<Skeleton className="w-[500px] h-[20px] rounded-full" />
				<Skeleton className="w-[300px] h-[20px] rounded-full" />
				<Skeleton className="w-[200px] h-[20px] rounded-full" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-red-500">
				Error fetching data. Please try again later.
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex flex-col space-y-4">
				<div className="text-gray-400">No Data Found!</div>
				<Skeleton className="w-[500px] h-[20px] rounded-full" />
				<Skeleton className="w-[500px] h-[20px] rounded-full" />
				<Skeleton className="w-[300px] h-[20px] rounded-full" />
				<Skeleton className="w-[200px] h-[20px] rounded-full" />
			</div>
		);
	}

	// Cast the API data to our expected type
	const typedData = data.map(tender => ({
		...tender,
		status: tender.status as TenderStatusType | null,
		organisations: tender.organisations || [],
		employees: tender.employees || [],
		conditionsOfParticipation: tender.conditionsOfParticipation || [],
		workpackages: tender.workpackages || [],
		template: tender.template || [],
		callToTenderDeliverables: tender.callToTenderDeliverables || [],
		riskQualityProcesses: tender.riskQualityProcesses || [],
	})) as unknown as TenderBackend[];

	// Filter tenders: status !== 'gewonnen' && status !== 'verloren'
	const filtered = typedData.filter(
		(tender) =>
			tender.status !== TenderStatus.GEWONNEN &&
			tender.status !== TenderStatus.VERLOREN
	);

	// Group tenders by KANBAN column
	const groupedTenders = filtered.reduce((acc, tender) => {
		const status = tender.status;
		if (!status) return acc;
		
		// Find which column this tender belongs to
		const column = Object.values(KANBAN_COLUMNS).find(col => col.statuses.includes(status));
		if (column) {
			if (!acc[column.id]) {
				acc[column.id] = [];
			}
			acc[column.id].push(tender);
		}
		return acc;
	}, {} as Record<string, TenderBackend[]>);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		// Find the column for the drop target
		const column = Object.values(KANBAN_COLUMNS).find(col => col.id === overId);
		if (!column) return;

		// Update the status immediately on drag over
		updateTender.mutate({
			id: activeId,
			data: {
				status: column.statuses[0],
			},
		}, {
			onSuccess: () => {
				// Optimistically update the local state
				if (data) {
					const updatedData = data.map(tender => 
						tender.id === activeId 
							? { ...tender, status: column.statuses[0] }
							: tender
					);
					utils.tenders.all.setData(undefined, updatedData);
				}
			}
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (!over) return;

		const tenderId = active.id as string;
		const columnId = over.id as string;

		// Find the column and get its first status
		const column = Object.values(KANBAN_COLUMNS).find(col => col.id === columnId);
		if (!column) return;

		// Use the first status from the column's statuses array
		const newStatus = column.statuses[0];

		// Update only the status field
		updateTender.mutate({
			id: tenderId,
			data: {
				status: newStatus,
			},
		}, {
			onSuccess: () => {
				// Optimistically update the local state
				if (data) {
					const updatedData = data.map(tender => 
						tender.id === tenderId 
							? { ...tender, status: newStatus }
							: tender
					);
					utils.tenders.all.setData(undefined, updatedData);
				}
			}
		});
	};

	const activeTender = activeId ? typedData.find(t => t.id === activeId) : null;

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{Object.values(KANBAN_COLUMNS).map((column) => (
						<DroppableColumn 
							key={column.id} 
							column={column}
							tenderCount={(groupedTenders[column.id] || []).length}
						>
							<SortableContext
								items={groupedTenders[column.id]?.map(t => t.id) || []}
								strategy={verticalListSortingStrategy}
							>
								{(groupedTenders[column.id] || []).map((tender) => (
									<div
										key={tender.id}
										className="cursor-move"
									>
										<DraggableTenderCard tender={tender} />
									</div>
								))}
							</SortableContext>
						</DroppableColumn>
					))}
				</div>
			</div>
			<DragOverlay>
				{activeTender ? <DraggableTenderCard tender={activeTender} /> : null}
			</DragOverlay>
		</DndContext>
	);
};

export default Page;