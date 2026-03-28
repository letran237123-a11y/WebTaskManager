import React from 'react'

const ErrorMessage = ({ message }) => (
  <div className="alert alert--danger" role="alert">
    <p>{message}</p>
  </div>
)

export default ErrorMessage
