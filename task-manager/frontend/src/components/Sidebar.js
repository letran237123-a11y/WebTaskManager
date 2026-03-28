import React from 'react'

const Sidebar = React.memo(
  ({ totalCount, completedCount, pendingCount, overdueCount, progress }) => (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <p className="eyebrow">Workspace</p>
        <h2>Task HQ</h2>
      </div>

      <div className="sidebar__progress">
        <div className="sidebar__progress-label">
          <span>Completion</span>
          <strong>{progress}%</strong>
        </div>
        <div className="progress__track">
          <div className="progress__fill" style={{ width: progress + '%' }} />
        </div>
      </div>

      <div className="sidebar__stats">
        <div>
          <p>All tasks</p>
          <strong>{totalCount}</strong>
        </div>
        <div>
          <p>Pending</p>
          <strong>{pendingCount}</strong>
        </div>
        <div>
          <p>Overdue</p>
          <strong>{overdueCount}</strong>
        </div>
      </div>
    </aside>
  )
)

Sidebar.displayName = 'Sidebar'

export default Sidebar
