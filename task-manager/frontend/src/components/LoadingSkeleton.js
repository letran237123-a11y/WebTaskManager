import React from 'react'

const LoadingSkeleton = ({ rows = 3 }) => (
  <div className="skeleton-list">
    {Array.from({ length: rows }).map((_, index) => (
      <div className="skeleton-card" key={index}>
        <div className="skeleton-card__top">
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
        <div className="skeleton-card__bottom">
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      </div>
    ))}
  </div>
)

export default LoadingSkeleton
