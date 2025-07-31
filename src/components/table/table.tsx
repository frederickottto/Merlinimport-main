"use client";

import {
	Column,
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, Plus } from "lucide-react";
import * as React from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import useDraggableTable from "@/hooks/use-draggable-table";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
	horizontalListSortingStrategy,
	SortableContext,
} from "@dnd-kit/sortable";
import { DraggableTableHead } from "./table-head";
import { DragAlongCell } from "./table-cell";
import { createTableColumns } from "./columns";
import { useMemo } from "react";
import { CreateButton } from "@/components/ui/create-button";

type DataTableProps<T extends { id: string | number }> = {
	data: T[];
	tabValue?: string;
	onView?: (id: string | number) => void;
	onEdit?: (id: string | number) => void;
	onDelete?: (id: string | number) => void;
	viewMode?: 'navigation' | 'modal';
	columns?: ColumnDef<T>[];
	hideCreateButton?: boolean;
	onCreate?: () => void;
	createLabel?: string;
};

function createColumns<T extends { id: string | number }>(
	data: T[],
	pathname: string,
	viewMode?: 'navigation' | 'modal',
	onView?: (id: string | number) => void,
	customColumns?: ColumnDef<T>[]
): ColumnDef<T>[] {
	if (customColumns) {
		return customColumns;
	}

	if (!data || data.length === 0) {
		return [
			{ accessorKey: "name", header: "Name" },
			{ accessorKey: "description", header: "Description" },
		] as ColumnDef<T>[];
	}

	const keys = Object.keys(data[0] as T).filter(
		(key) => typeof (data[0] as T)[key as keyof T] !== "object"
	) as (keyof T)[];
	return createTableColumns<T>([...keys], {
		capitalize: true,
		customLabels: {
			_id: "id",
		},
		pathname,
		viewMode,
		onView,
	});
}

export function DataTable<T extends { id: string | number }>({
	data,
	tabValue,
	onView,
	onEdit,
	onDelete,
	viewMode = 'navigation',
	columns: customColumns,
	hideCreateButton = false,
	onCreate,
	createLabel
}: DataTableProps<T>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const pathname = usePathname();

	const columns = useMemo(
		() => createColumns(data, pathname, viewMode, onView, customColumns),
		[data, pathname, viewMode, onView, customColumns]
	);

	const { sensors, columnOrder, handleDragEnd } = useDraggableTable<T>(
		columns as Column<T>[]
	);

	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnOrder,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		meta: {
			onView,
		},
	});

	const renderCreateButton = () => {
		if (hideCreateButton) return null;
		if (onCreate) {
			return (
				<Button onClick={onCreate}>
					<Plus className="h-4 w-4 mr-2" />
					{createLabel || "Create"}
				</Button>
			);
		}
		return <CreateButton tabValue={tabValue} />;
	};

	// Find the name or title column
	const nameColumn = table.getAllColumns().find(
		column => column.id === 'name' || column.id === 'title'
	);

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToHorizontalAxis]}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<div className="w-full">
				<div className="flex items-center py-4">
					<Input
						placeholder={`Filtern nach ${nameColumn?.id || 'Name'}...`}
						value={nameColumn?.getFilterValue() as string || ""}
						onChange={(event) =>
							nameColumn?.setFilterValue(event.target.value)
						}
						className="max-w-sm max-h-6"
					/>
					<div className="ml-auto flex items-center gap-2">
						{renderCreateButton()}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">
									Spalten <ChevronDown />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{table
									.getAllColumns()
									.filter((column) => column.getCanHide())
									.map((column) => {
										return (
											<DropdownMenuCheckboxItem
												key={column.id}
												className="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={(value) =>
													column.toggleVisibility(!!value)
												}
											>
												{column.id}
											</DropdownMenuCheckboxItem>
										);
									})}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									<SortableContext
										items={columnOrder}
										strategy={horizontalListSortingStrategy}
									>
										{headerGroup.headers.map((header) => {
											return header.id !== "select" &&
												header.id !== "actions" ? (
												<DraggableTableHead key={header.id} header={header} />
											) : (
												<TableCell
													key={header.id}
													className="border-r last:border-r-0"
												>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext()
														  )}
												</TableCell>
											);
										})}
									</SortableContext>
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<SortableContext
												key={cell.id}
												items={columnOrder}
												strategy={horizontalListSortingStrategy}
											>
												<DragAlongCell 
													key={cell.id} 
													cell={cell} 
													onView={onView}
													onEdit={onEdit}
													onDelete={onDelete}
													viewMode={viewMode}
												/>
											</SortableContext>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										Keine Ergebnisse.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
				<div className="flex items-center justify-end space-x-2 py-4">
					<div className="flex-1 text-xs text-muted-foreground">
						{table.getFilteredSelectedRowModel().rows.length} von{" "}
						{table.getFilteredRowModel().rows.length} Zeile(n) ausgewählt.
					</div>
					<div className="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							Zurück
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Weiter
						</Button>
					</div>
				</div>
			</div>
		</DndContext>
	);
}
