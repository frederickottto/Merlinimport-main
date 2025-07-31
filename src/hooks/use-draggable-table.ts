import {
	useSensors,
	useSensor,
	MouseSensor,
	TouchSensor,
	KeyboardSensor,
	DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Column } from "@tanstack/react-table";
import { useState } from "react";

const useDraggableTable = <T>(columns: Column<T>[]) => {
	const [columnOrder, setColumnOrder] = useState<string[]>(() => {
		const fixedColumns = ["select", "actions"];
		const movableColumns = columns
			.map((c) => c.id as string)
			.filter((id) => !fixedColumns.includes(id));

		return ["select", ...movableColumns, "actions"];
	});

	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {})
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		const fixedColumns = ["select", "actions"];
		if (
			fixedColumns.includes(active.id as string) ||
			fixedColumns.includes(over?.id as string)
		) {
			return;
		}

		if (active && over && active.id !== over.id) {
			setColumnOrder((currentOrder) => {
				const movableColumns = currentOrder.filter(
					(id) => !fixedColumns.includes(id)
				);

				const oldIndex = movableColumns.indexOf(active.id as string);
				const newIndex = movableColumns.indexOf(over.id as string);
				const reorderedMovableColumns = arrayMove(
					movableColumns,
					oldIndex,
					newIndex
				);
				return ["select", ...reorderedMovableColumns, "actions"];
			});
		}
	}

	return {
		sensors,
		columnOrder,
		handleDragEnd,
	};
};

export default useDraggableTable;
