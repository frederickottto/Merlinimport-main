import { useSortable } from "@dnd-kit/sortable";
import { Cell, flexRender } from "@tanstack/react-table";
import { TableCell } from "../ui/table";

interface HasId {
	id: string | number;
}

export function DragAlongCell<T extends HasId>({
	cell,
	onView,
	onEdit,
	onDelete,
	viewMode = 'navigation'
}: {
	cell: Cell<T, unknown>;
	onView?: (id: string | number) => void;
	onEdit?: (id: string | number) => void;
	onDelete?: (id: string | number) => void;
	viewMode?: 'navigation' | 'modal';
}): JSX.Element {
	const { isDragging, setNodeRef, transform } = useSortable({
		id: cell.column.id,
	});

	const style: React.CSSProperties = {
		opacity: isDragging ? 0.8 : 1,
		position: "relative",
		transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
		transition: "width transform 0.2s ease-in-out",
		width: cell.column.getSize(),
		zIndex: isDragging ? 1 : 0,
	};

	const handleClick = () => {
		const row = cell.row;
		const id = row.original.id;
		const columnId = cell.column.id;
		
		// Skip action handling for select and actions columns
		if (columnId === "select" || columnId === "actions") {
			return;
		}

		// Handle click based on column and available actions
		if (columnId === "name" || columnId === "title") {
			if (onView) {
				onView(id);
				// In modal mode, we don't want any navigation to happen
				if (viewMode === 'modal') {
					return;
				}
			}
		} else if (columnId === "edit" && onEdit) {
			onEdit(id);
		} else if (columnId === "delete" && onDelete) {
			onDelete(id);
		}
	};

	const isClickable = cell.column.id === "name" || 
		cell.column.id === "title" || 
		cell.column.id === "edit" || 
		cell.column.id === "delete";

	return (
		<TableCell
			className={`border-r last:border-r-0 ${isClickable ? "cursor-pointer hover:bg-muted" : ""}`}
			style={style}
			ref={setNodeRef}
			key={cell.id}
			onClick={handleClick}
		>
			{flexRender(cell.column.columnDef.cell, cell.getContext())}
		</TableCell>
	);
}
