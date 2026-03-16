import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

interface FocusTrapOptions {
  onEscape?: () => void
}

export function useFocusTrap(ref: RefObject<HTMLElement | null>, isActive: boolean, options?: FocusTrapOptions) {
  const previousFocus = useRef<Element | null>(null)
  const onEscapeRef = useRef(options?.onEscape)
  onEscapeRef.current = options?.onEscape

  useEffect(() => {
    if (!isActive || !ref.current) return

    previousFocus.current = document.activeElement

    const container = ref.current
    const first = container.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onEscapeRef.current?.()
        return
      }

      if (e.key !== 'Tab') return

      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }

      const firstEl = focusable[0]
      const lastEl = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocus.current instanceof HTMLElement && document.contains(previousFocus.current)) {
        previousFocus.current.focus()
      }
    }
  }, [isActive, ref])
}
