import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'

export default function CustomSelect({ id, value, options, onChange, ariaLabel, className = '', disabled = false }) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState({})
  const wrapperRef = useRef(null)
  const menuRef = useRef(null)
  const menuId = useId()
  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return undefined
    const positionMenu = () => {
      const trigger = wrapperRef.current?.getBoundingClientRect()
      if (!trigger) return
      const maxHeight = Math.min(280, Math.max(120, window.innerHeight - 24))
      const spaceBelow = window.innerHeight - trigger.bottom - 12
      const placeAbove = spaceBelow < Math.min(180, maxHeight) && trigger.top > spaceBelow
      setMenuStyle({
        left: Math.max(8, Math.min(trigger.left, window.innerWidth - Math.max(trigger.width, 190) - 8)),
        width: Math.min(Math.max(trigger.width, 190), window.innerWidth - 16),
        maxHeight: Math.min(maxHeight, placeAbove ? trigger.top - 12 : spaceBelow),
        top: placeAbove ? undefined : trigger.bottom + 6,
        bottom: placeAbove ? window.innerHeight - trigger.top + 6 : undefined,
      })
    }
    const closeOnOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    positionMenu()
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', positionMenu)
    window.addEventListener('scroll', positionMenu, true)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', positionMenu)
      window.removeEventListener('scroll', positionMenu, true)
    }
  }, [open])

  return (
    <div className={`custom-select ${className}`} ref={wrapperRef}>
      <button
        id={id}
        type="button"
        className="custom-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedOption?.label || 'Select an option'}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && createPortal(
        <div id={menuId} ref={menuRef} className="custom-select-menu" style={menuStyle} role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
