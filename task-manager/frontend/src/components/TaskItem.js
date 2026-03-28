import React, { useEffect, useRef, useState } from 'react'

const formatDateTime = (value) => {
  if (!value) {
    return null
  }

  return new Date(value).toLocaleString()
}

const formatDate = (value) => {
  if (!value) {
    return 'No deadline'
  }

  return new Date(value).toLocaleDateString()
}

const TaskItem = React.memo(({ task, onToggle, onDelete, onRename }) => {
  const createdAt = formatDateTime(task.created_at)
  const completedAt = formatDateTime(task.completed_at)
  const isDone = task.status === 'done'
  const normalizedPriority = (task.priority || 'low').toLowerCase()
  const priorityClass = `priority-dot priority-${normalizedPriority}`
  const formattedPriority = `${normalizedPriority[0].toUpperCase()}${normalizedPriority.slice(1)}`
  const deadlineLabel = formatDate(task.deadline)
  const deadlineValue = task.deadline ? new Date(task.deadline) : null
  const isOverdue = deadlineValue && deadlineValue < new Date() && !isDone
  const isDueSoon = deadlineValue && !isOverdue && deadlineValue - new Date() < 1000 * 60 * 60 * 24
  const hasDeadlineContent = Boolean(task.deadline_note || task.deadline_image)

  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)
  const [showDeadlineContent, setShowDeadlineContent] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  useEffect(() => {
    setDraftTitle(task.title)
  }, [task.title])

  useEffect(() => {
    if (!hasDeadlineContent) {
      setShowDeadlineContent(false)
    }
  }, [hasDeadlineContent])

  const handleSave = () => {
    const nextTitle = draftTitle.trim()
    setIsEditing(false)

    if (!nextTitle || nextTitle === task.title) {
      return
    }

    onRename(task.id, nextTitle)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Delete' && !isEditing) {
      event.preventDefault()
      onDelete(task.id)
    }

    if (event.key === 'Enter' && !isEditing) {
      event.preventDefault()
      onToggle(task)
    }

    if (event.key === 'Escape' && isEditing) {
      event.preventDefault()
      setDraftTitle(task.title)
      setIsEditing(false)
    }
  }

  return (
    <article
      className={`task-item ${isDone ? 'is-complete' : ''} ${isOverdue ? 'is-overdue' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="task-item__main">
        <div className="task-item__topline">
          <label className="task-item__checkbox">
            <input
              type="checkbox"
              checked={isDone}
              aria-label={`Mark ${task.title} as ${isDone ? 'pending' : 'done'}`}
              onChange={() => onToggle(task)}
            />
            {isEditing ? (
              <input
                ref={inputRef}
                className="task-item__inline-input"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                onBlur={handleSave}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleSave()
                  }
                }}
              />
            ) : (
              <span
                className={`task-item__title ${isDone ? 'is-done' : ''}`}
                onClick={() => setIsEditing(true)}
              >
                {task.title}
              </span>
            )}
          </label>
          {isDone && completedAt && <span className="task-item__badge">Finished</span>}
        </div>

        <div className="task-item__meta">
          <span className={priorityClass}>{formattedPriority}</span>
          {hasDeadlineContent ? (
            <button
              type="button"
              className={`task-item__deadline task-item__deadline--button ${isOverdue ? 'deadline--overdue' : isDueSoon ? 'deadline--soon' : ''}`}
              onClick={() => setShowDeadlineContent((prev) => !prev)}
            >
              {deadlineLabel}
              <span className="task-item__deadline-icon">{showDeadlineContent ? 'Hide notes' : 'Open notes'}</span>
            </button>
          ) : (
            <span
              className={`task-item__deadline ${isOverdue ? 'deadline--overdue' : isDueSoon ? 'deadline--soon' : ''}`}
            >
              {deadlineLabel}
            </span>
          )}
        </div>

        {showDeadlineContent && hasDeadlineContent && (
          <div className="task-item__deadline-panel">
            {task.deadline_note && <p className="task-item__deadline-note">{task.deadline_note}</p>}
            {task.deadline_image && (
              <div className="task-item__deadline-image-wrap">
                <img src={task.deadline_image} alt={`Deadline note for ${task.title}`} className="task-item__deadline-image" />
              </div>
            )}
          </div>
        )}

        <div className="task-item__timeline">
          <span className="task-item__time">Created {createdAt}</span>
          {completedAt && <span className="task-item__time task-item__time--done">Completed {completedAt}</span>}
        </div>
      </div>
      <div className="task-item__actions">
        <button type="button" className="ghost" onClick={() => onDelete(task.id)}>
          Remove
        </button>
      </div>
    </article>
  )
})

TaskItem.displayName = 'TaskItem'

export default TaskItem
