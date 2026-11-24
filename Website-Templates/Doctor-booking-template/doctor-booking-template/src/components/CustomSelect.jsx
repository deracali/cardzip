import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export default function CustomSelect({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  ariaLabel,
  className = '',
  triggerClassName = '',
  disabled = false,
}) {
  const id = useId()
  const rootRef = useRef(null)
  const optionRefs = useRef([])
  const selectedIndex = options.findIndex((option) => option.value === value)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(Math.max(selectedIndex, 0))
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null

  useEffect(() => {
    if (!open) return undefined
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus()
  }, [activeIndex, open])

  const openAt = (index = Math.max(selectedIndex, 0)) => {
    setActiveIndex(index)
    setOpen(true)
  }

  const selectOption = (option) => {
    onChange(option.value)
    setOpen(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      rootRef.current?.querySelector('button')?.focus()
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        openAt()
        return
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => (index + direction + options.length) % options.length)
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1)
      if (!open) setOpen(true)
      return
    }
    if ((event.key === 'Enter' || event.key === ' ') && !open) {
      event.preventDefault()
      openAt()
      return
    }
    if (event.key === 'Enter' && open) {
      event.preventDefault()
      selectOption(options[activeIndex])
    }
  }

  return (
    <div className={`custom-select ${className}`} ref={rootRef}>
      <button
        className={`custom-select-trigger ${triggerClassName}`}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        disabled={disabled}
        onClick={() => open ? setOpen(false) : openAt()}
        onKeyDown={handleKeyDown}
      >
        <span className={!selectedOption ? 'custom-select-placeholder' : ''}>{selectedOption?.label || placeholder}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div className="custom-select-menu" id={`${id}-options`} role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => (
            <button
              className="custom-select-option"
              type="button"
              role="option"
              aria-selected={value === option.value}
              key={option.value}
              ref={(element) => { optionRefs.current[index] = element }}
              tabIndex={activeIndex === index ? 0 : -1}
              onMouseEnter={() => setActiveIndex(index)}
              onKeyDown={handleKeyDown}
              onClick={() => selectOption(option)}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
