import React from 'react'
import { NavLink } from 'react-router-dom'

const AppShell = ({ user, onLogout, title, subtitle, children }) => {
  const isAdmin = user?.role === 'admin'

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-brand">
          <p className="eyebrow">Task Manager</p>
          <h1>Control Center</h1>
          <p>Role-based workspace for focused execution.</p>
        </div>

        <nav className="workspace-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `workspace-nav__link ${isActive ? 'is-active' : ''}`}
          >
            Dashboard
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `workspace-nav__link ${isActive ? 'is-active' : ''}`}
            >
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="workspace-profile">
          <span className="workspace-profile__badge">{user?.role || 'user'}</span>
          <strong>{user?.username || 'Unknown user'}</strong>
          <p>{user?.email}</p>
          <button type="button" className="ghost-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">{user?.role === 'admin' ? 'Administrator' : 'User workspace'}</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="workspace-header__usercard">
            <span>Signed in as</span>
            <strong>{user?.username || user?.email}</strong>
            <small>{user?.role}</small>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}

export default AppShell
