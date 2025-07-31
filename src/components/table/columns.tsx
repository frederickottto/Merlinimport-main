"use client";
import { ColumnDef, Row, CellContext } from "@tanstack/react-table";

import { Checkbox } from "../ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { BooleanBadge } from "./boolean-badge";
import { useTableActions } from "@/hooks/use-table-actions";

export type ColumnConfig<T> = {
	id: keyof T | string;
	header: string;
	accessorKey?: keyof T;
	cell?: (props: CellContext<T, unknown>) => React.ReactNode;
	enableSorting?: boolean;
	enableHiding?: boolean;
	size?: number;
};

export function createTableHeaders(
	keys: string[],
	options: {
		capitalize?: boolean;
		customLabels?: Record<string, string>;
		excludeKeys?: string[];
	} = {}
) {
	const { capitalize = true, customLabels = {}, excludeKeys = [] } = options;

	return keys
		.filter((key) => !excludeKeys.includes(key))
		.map((key) => ({
			key,
			label:
				customLabels[key] ||
				(capitalize
					? key.charAt(0).toUpperCase() +
					  key
							.toLowerCase()
							.slice(1)
							.replace(/([A-Z])/g, " $1")
							.trim()
					: key),
		}));
}

type TableColumnOptions<T> = {
	columns?: ColumnConfig<T>[];
	defaultColumns?: boolean;
	capitalize?: boolean;
	customLabels?: Record<string, string>;
	excludeKeys?: string[];
	pathname: string;
	viewMode?: 'navigation' | 'modal';
	onView?: (id: string | number) => void;
};

export function createTableColumns<T extends { id: number | string }>(
	keys: (keyof T)[],
	options: TableColumnOptions<T>
): ColumnDef<T>[] {
	const { 
		columns: customColumns,
		defaultColumns = true,
		pathname,
		viewMode,
		onView,
		...headerOptions
	} = options;

	const headers = createTableHeaders(keys as string[], headerOptions);

	const selectColumn: ColumnDef<T> = {
		id: "select",
		size: 20,
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	};

	const ActionsCell = ({ row }: { row: Row<T> }) => {
		const item = row.original;
		const { handleView, handleDelete } = useTableActions({ 
			item, 
			pathname,
			viewMode,
			onModalOpen: onView
		});

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={handleView}>
						View
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleDelete}>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	};

	const actionsColumn: ColumnDef<T> = {
		id: "actions",
		size: 20,
		enableHiding: false,
		cell: ActionsCell,
	};

	// Create default columns if enabled
	const defaultDynamicColumns: ColumnDef<T>[] = defaultColumns ? headers.map(({ key, label }) => ({
		id: key,
		accessorKey: key,
		header: ({ column }) => (
			<div onPointerDown={() => column.toggleSorting()}>{label}</div>
		),
		cell: ({ row }: { row: Row<T> }) => {
			const value = row.getValue(key as string) as unknown;
			if (key === 'id') {
				return <div>{row.index + 1}</div>;
			}
			if (typeof value === 'boolean') {
				return <BooleanBadge value={value} />;
			}
			return <div>{String(value)}</div>;
		},
	})) : [];

	// Convert custom columns to ColumnDef
	const customDynamicColumns: ColumnDef<T>[] = customColumns?.map(col => ({
		id: col.id as string,
		accessorKey: col.accessorKey || col.id as keyof T,
		header: ({ column }) => (
			<div onPointerDown={() => column.toggleSorting()}>{col.header}</div>
		),
		cell: col.cell || (({ row }) => {
			const value = row.getValue(col.id as string) as unknown;
			if (typeof value === 'boolean') {
				return <BooleanBadge value={value} />;
			}
			return <div>{String(value)}</div>;
		}),
		enableSorting: col.enableSorting ?? true,
		enableHiding: col.enableHiding ?? true,
		size: col.size,
	})) || [];

	return [
		selectColumn,
		...(customColumns ? customDynamicColumns : defaultDynamicColumns),
		actionsColumn
	];
}

export function getSelectionColumn<T>(): ColumnDef<T> {
	return {
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	};
}
