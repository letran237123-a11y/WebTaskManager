import { AnimatePresence, motion } from 'framer-motion'
import React, { useMemo } from 'react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import TaskItem from './TaskItem'

const TaskColumn = React.memo(({ column, onToggleStatus, onDelete, onRename }) => (
  <div className="task-column">
    <div className="task-column__header">
      <div>
        <p className="eyebrow">{column.subtitle}</p>
        <h3>{column.title}</h3>
      </div>
      <span className="task-column__count">{column.tasks.length}</span>
    </div>

    <Droppable droppableId={column.id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`task-column__list ${snapshot.isDraggingOver ? 'is-over' : ''}`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <motion.div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.25 }}
                  >
                    <TaskItem
                      task={task}
                      onToggle={onToggleStatus}
                      onDelete={onDelete}
                      onRename={onRename}
                      busy={dragSnapshot.isDragging}
                    />
                  </motion.div>
                )}
              </Draggable>
            ))}
          </AnimatePresence>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
))

TaskColumn.displayName = 'TaskColumn'

const TaskBoard = React.memo(
  ({ columns, onDragEnd, onToggleStatus, onDelete, onRename, emptyMessage }) => {
    const hasTasks = useMemo(() => columns.some((column) => column.tasks.length), [columns])

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="task-board">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </div>

        {!hasTasks && (
          <div className="task-board__empty">
            <p>{emptyMessage}</p>
          </div>
        )}
      </DragDropContext>
    )
  }
)

TaskBoard.displayName = 'TaskBoard'

export default TaskBoard
