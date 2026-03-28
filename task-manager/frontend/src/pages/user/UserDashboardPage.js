import React, { useCallback } from 'react'
import AppShell from '../../components/common/AppShell'
import { useAuth } from '../../context/AuthContext'
import FilterBar from '../../components/FilterBar'
import TaskForm from '../../components/TaskForm'
import LoadingSkeleton from '../../components/LoadingSkeleton'
import ErrorMessage from '../../components/ErrorMessage'
import TaskBoard from '../../components/TaskBoard'
import useTasks from '../../hooks/useTasks'

const UserDashboardPage = () => {
  const {
    tasks,
    boardColumns,
    loading,
    busy,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    addTask,
    toggleTaskStatus,
    deleteTask,
    stats,
    renameTask,
    reorderColumn,
    moveTaskStatus,
  } = useTasks()

  const { user, logout } = useAuth()

  const handleDragEnd = useCallback(
    async (result) => {
      const { source, destination, draggableId } = result

      if (!destination) {
        return
      }

      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return
      }

      const [, idString] = draggableId.split('-')
      const taskId = Number(idString)
      if (!taskId) {
        return
      }

      if (destination.droppableId !== source.droppableId) {
        await moveTaskStatus(taskId, destination.droppableId)
      } else {
        reorderColumn(source.droppableId, source.index, destination.index)
      }
    },
    [moveTaskStatus, reorderColumn]
  )

  const emptyMessage = search
    ? 'No tasks match your search. Try another keyword.'
    : 'No tasks yet. Add your first one to start the board.'

  return (
    <AppShell
      user={user}
      onLogout={logout}
      title="Your dashboard"
      subtitle="Track priorities, keep deadlines visible, and know exactly when work was finished."
    >
      <section className="summary-grid">
        <article className="summary-card summary-card--accent">
          <span>Total tasks</span>
          <strong>{stats.totalCount}</strong>
        </article>
        <article className="summary-card">
          <span>Completed</span>
          <strong>{stats.completedCount}</strong>
        </article>
        <article className="summary-card">
          <span>Due soon</span>
          <strong>{stats.dueSoonCount}</strong>
        </article>
        <article className="summary-card summary-card--warning">
          <span>Overdue</span>
          <strong>{stats.overdueCount}</strong>
        </article>
      </section>

      <section className="panel panel--hero">
        <TaskForm onAddTask={addTask} disabled={busy} />
      </section>

      <section className="panel">
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          resultCount={tasks.length}
        />
      </section>

      {error && <ErrorMessage message={error} />}

      <section className="panel panel--board">
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <TaskBoard
            columns={boardColumns}
            onDragEnd={handleDragEnd}
            onToggleStatus={toggleTaskStatus}
            onDelete={deleteTask}
            onRename={renameTask}
            emptyMessage={emptyMessage}
          />
        )}
      </section>
    </AppShell>
  )
}

export default UserDashboardPage
