import { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { Header, flexRender } from "@tanstack/react-table";
import { TableHead } from "../ui/table";

export const DraggableTableHead = <T,>({
	header,
}: {
	header: Header<T, unknown>;
}) => {
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		transform,
	} = useSortable({
		id: header.column.id,
	});

	const style: CSSProperties = {
		opacity: isDragging ? 0.8 : 1,
		transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
		transition: "width transform 0.2s ease-in-out",
		whiteSpace: "nowrap",
		width: header.column.getSize(),
		zIndex: isDragging ? 1 : 0,
		pointerEvents: isDragging ? "none" : "auto",
	};

	return (
		<TableHead
			className="border-r last:border-r-0"
			colSpan={header.colSpan}
			ref={setNodeRef}
			style={style}
			{...attributes}
			aria-describedby="DndDescribedBy-0"
			{...listeners}
		>
			{header.isPlaceholder
				? null
				: flexRender(header.column.columnDef.header, header.getContext())}
		</TableHead>
	);
};
