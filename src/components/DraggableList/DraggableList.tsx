import React, { useEffect, useState } from "react";
import ReactDragListView from "react-drag-listview";
import { GripVertical } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DraggedMovement {
  fromId: string;
  toId: string;
}

export interface DraggableItem {
  id?: string;
}

interface DraggableListProps<T extends DraggableItem = DraggableItem> {
  list: T[];
  labelTitle: string;
  labelSubtitle: string;
  componentParentId?: string;
  onChangeOrder(data: T[], draggedMovement: DraggedMovement[]): void; 
}

export default function DraggableList<T extends DraggableItem = DraggableItem>({
  list = [],
  labelTitle,
  labelSubtitle,
  componentParentId,
  onChangeOrder = () => {}
}: Readonly<DraggableListProps<T>>) {
  const [listedData, setListedData] = useState<T[]>([]);
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number>(-1);
  const [draggedMove, setDraggedMove] = useState<DraggedMovement[]>([]);
  const [touchMove, setTouchMove] = useState<number>(0);

  useEffect(() => {
    setListedData(list);
  }, [list]);

  const historyMovement = (fromIndex: number, toIndex: number) => {
    const toId = listedData[toIndex]?.id;
    const fromId = listedData[fromIndex]?.id;
    if (!toId || !fromId) return;

    const isRevertMovement = draggedMove.findIndex(
      (movement) => movement.fromId === toId && movement.toId === fromId,
    );
    const isRepeatedMovement = draggedMove.findIndex(
      (movement) => movement.fromId === fromId && movement.toId === toId,
    );

    if (isRevertMovement >= 0) {
      draggedMove.splice(isRevertMovement, 1);
    } else if (isRepeatedMovement <= 0) {
      draggedMove.push({ fromId, toId });
    }

    setDraggedMove([...draggedMove]);
  };

  const onDragStart = (
    _e: React.DragEvent | React.TouchEvent,
    index: number,
  ) => {
    setDraggedItem(listedData[index]);
    setDraggedItemIndex(index);
  };

  const onTouchEnd = () => {
    if (draggedMove.length) {
      onDragEnd(0, 0);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.changedTouches && e.changedTouches.length) {
      const touch = e.changedTouches[0];
      const movement = touch.clientY;
      const componentParent = document.getElementById(componentParentId || "");
      
      const scroll = (y: number) => {
        if (componentParent) {
          componentParent.scrollTo(y, y);
        }
      };

      const moveToNext = (_index: number) => {
        if (0 <= _index && listedData.length > _index) {
          onDragOver(_index);
          setTimeout(() => {
            setDraggedItemIndex(_index);
          }, 3000);
        }
      };

      if (touchMove > movement + 5) {
        const index = draggedItemIndex - 1;
        scroll(movement + 5);
        moveToNext(index);
      } else if (touchMove < movement - 5) {
        const index = draggedItemIndex + 1;
        scroll(movement - 5);
        moveToNext(index);
      }

      if (!touchMove) {
        setTouchMove(movement);
      }
    }
  };

  const onDragOver = (toIndex: number) => {
    const draggedOverItem = listedData[toIndex];
    if (!draggedItem || !draggedOverItem) return;

    // if the item is dragged over itself, ignore
    if (draggedItem.id === draggedOverItem.id) {
      return;
    }

    // filter out the currently dragged item
    const fromIndex = listedData.findIndex((item) => item.id === draggedItem.id);
    const orderedDataList = listedData.filter((item) => item.id !== draggedItem.id);

    // add the dragged item after the dragged over item
    orderedDataList.splice(toIndex, 0, draggedItem);

    historyMovement(fromIndex, toIndex);

    return setListedData(orderedDataList);
  };

  const onDragEnd = (_fromIndex: number, toIndex: number) => {
    /* IGNORES DRAG IF OUTSIDE DESIGNATED AREA */
    if (toIndex < 0) return;

    /* REORDER PARENT OR SUBLIST, ELSE THROW ERROR */
    const movements: DraggedMovement[] = [];
    draggedMove.forEach((m) => {
      if (
        !movements.find(
          (movement) => movement.fromId === m.fromId && movement.toId === m.toId,
        )
      ) {
        movements.push(m);
      }
    });
    onChangeOrder(listedData, movements);
    setDraggedMove([]);
  };

  return (
    <ReactDragListView
      nodeSelector=".draggable"
      handleSelector=".drag-handle"
      lineClassName="dragLine"
      onDragEnd={(fromIndex: number, toIndex: number) =>
        onDragEnd(fromIndex, toIndex)
      }
    >
      {listedData.map((data, index) => {
        const itemRecord = data as Record<string, unknown>;
        const titleVal = String(itemRecord[labelTitle] ?? "");
        const subtitleVal = String(itemRecord[labelSubtitle] ?? "");

        return (
          <div
            className={cn(
              "draggable select-none rounded-[10px] shadow-[0px_1px_1px_1px]",
              "transition-all duration-200 ease-in-out hover:scale-[1.01]",
            )}
            key={index + "drag"}
            onDragStart={(e) => onDragStart(e, index)}
            onTouchStart={(e) => onDragStart(e, index)}
            onDragOver={() => onDragOver(index)}
            onTouchMove={(e) => onTouchMove(e)}
            onTouchEnd={() => onTouchEnd()}
          >
            <div className="card-listagem mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
              <div className="flex gap-3">
                {/* Alça de arraste com ícone lucide-react GripVertical */}
                <div className="drag-handle flex shrink-0 cursor-grab items-center text-gray-500 hover:text-foreground">
                  <GripVertical className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="card-listagem-text text-black">
                    <p className="mb-1 font-bold">{titleVal}</p>
                    <p className="mb-0 text-sm">
                      {subtitleVal.length > 150
                        ? subtitleVal.substring(0, 150) + "..."
                        : subtitleVal}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </ReactDragListView>
  );
}
