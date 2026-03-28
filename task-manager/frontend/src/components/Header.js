import React from 'react'

const Header = React.memo(
  ({
    completedCount,
    totalCount,
    progress,
    darkMode,
    onToggleDarkMode,
    userEmail,
    onLogout,
  }) => (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">Productivity workspace</p>
        <h1>Task Manager</h1>
        <p className="dashboard-header__subtitle">
          Capture wins, stay aligned, and keep the day organized.
        </p>
      </div>
      <div className="dashboard-header__toolbar">
        <span className="dashboard-header__user">{userEmail || 'Registered User'}</span>
        <button type="button" className="mode-toggle" onClick={onToggleDarkMode}>
          {darkMode ? 'Switch to light' : 'Switch to dark'}
        </button>
        <button type="button" className="logout-button" onClick={onLogout}>
          Log out
        </button>
      </div>
      <div className="dashboard-header__stats">
        <div className="dashboard-header__progress">
          <span>
            {completedCount} / {totalCount} done
          </span>
          <div className="progress__track">
            <div className="progress__fill" style={{ width: progress + '%' }} />
          </div>
          <small>{progress}% complete</small>
        </div>
      </div>
    </header>
  )
)

Header.displayName = 'Header'

export default Header
