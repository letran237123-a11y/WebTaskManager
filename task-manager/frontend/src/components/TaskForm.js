import { useMemo, useRef, useState } from 'react'
import React from 'react'

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read image file'))
    reader.readAsDataURL(file)
  })

const TaskForm = React.memo(({ onAddTask, disabled }) => {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [deadline, setDeadline] = useState('')
  const [deadlineNote, setDeadlineNote] = useState('')
  const [deadlineImage, setDeadlineImage] = useState('')
  const [imageError, setImageError] = useState('')
  const [localBusy, setLocalBusy] = useState(false)
  const fileInputRef = useRef(null)

  const isSubmitDisabled = useMemo(
    () => disabled || localBusy || !title.trim(),
    [disabled, localBusy, title]
  )

  const clearImage = () => {
    setDeadlineImage('')
    setImageError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      clearImage()
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError('Image is too large. Please choose one under 2MB.')
      setDeadlineImage('')
      event.target.value = ''
      return
    }

    try {
      setImageError('')
      const nextImage = await toDataUrl(file)
      setDeadlineImage(nextImage)
    } catch (error) {
      setImageError(error.message || 'Could not load image')
      setDeadlineImage('')
      event.target.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    setLocalBusy(true)
    try {
      await onAddTask({
        title: title.trim(),
        priority,
        deadline: deadline || null,
        deadlineNote: deadlineNote || null,
        deadlineImage: deadlineImage || null,
      })
      setTitle('')
      setPriority('medium')
      setDeadline('')
      setDeadlineNote('')
      clearImage()
      event.target.reset()
    } finally {
      setLocalBusy(false)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__headline">
        <div>
          <p className="eyebrow">New task</p>
          <h3>Plan the next move</h3>
        </div>
      </div>
      <div className="task-form__inputs">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
        />
        <div className="task-form__selects">
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} priority
              </option>
            ))}
          </select>
          <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        </div>
        <textarea
          className="task-form__textarea"
          value={deadlineNote}
          onChange={(event) => setDeadlineNote(event.target.value)}
          placeholder="Write a note, reminder, or checklist for this deadline"
          rows={4}
        />
        <div className="task-form__media">
          <label className="task-form__upload">
            <span>Attach deadline image</span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} />
          </label>
          {imageError && <p className="field-error">{imageError}</p>}
          {deadlineImage && (
            <div className="task-form__preview">
              <img src={deadlineImage} alt="Deadline preview" />
              <button type="button" className="ghost-button" onClick={clearImage}>
                Remove image
              </button>
            </div>
          )}
        </div>
      </div>
      <button type="submit" className="primary" disabled={isSubmitDisabled}>
        {isSubmitDisabled ? 'Saving...' : 'Add task'}
      </button>
    </form>
  )
})

TaskForm.displayName = 'TaskForm'

export default TaskForm
