import React from 'react'

const FILTERS = [
  { value: 'all', label: 'All tasks' },
  { value: 'pending', label: 'Pending' },
  { value: 'done', label: 'Completed' },
]

const FilterBar = React.memo(
  ({
    filter,
    onFilterChange,
    search,
    onSearchChange,
    resultCount,
  }) => (
    <section className="filter-bar">
      <div>
        <p className="filter-bar__summary">{resultCount} items</p>
        <div className="filter-bar__controls">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`pill ${item.value === filter ? 'is-active' : ''}`}
              onClick={() => onFilterChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <label className="filter-bar__search">
        <span className="sr-only">Search tasks</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tasks"
        />
      </label>
    </section>
  )
)

FilterBar.displayName = 'FilterBar'

export default FilterBar
