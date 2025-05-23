"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 4000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Context Definition
interface ToastContextType {
  toasts: ToasterToast[]
  toast: (props: Omit<ToasterToast, "id" | "open" | "onOpenChange">) => { id: string, dismiss: () => void, update: (props: ToasterToast) => void }
  dismiss: (toastId?: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

// Reducer
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) {
        // Clear existing timeout
        const existingTimeout = toastTimeouts.get(toastId)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
          toastTimeouts.delete(toastId)
        }
        // Add to remove queue
        const timeout = setTimeout(() => {
          toastTimeouts.delete(toastId)
          // Dispatch REMOVE_TOAST from provider's dispatch
          // This requires dispatch to be accessible here or passed to addToRemoveQueue
          // For simplicity, we'll rely on the onOpenChange in the toast object itself or manual dismiss.
          // Or, the ToastProvider's dispatch must be used directly.
          // Let's make dismiss dispatch REMOVE_TOAST after a delay.
        }, TOAST_REMOVE_DELAY)
        toastTimeouts.set(toastId, timeout)
      } else {
        state.toasts.forEach((t) => {
          // Similar logic for all toasts if no specific toastId
          const existingTimeout = toastTimeouts.get(t.id)
          if (existingTimeout) {
            clearTimeout(existingTimeout)
            toastTimeouts.delete(t.id)
          }
          const timeout = setTimeout(() => {
            toastTimeouts.delete(t.id)
          }, TOAST_REMOVE_DELAY)
          toastTimeouts.set(t.id, timeout)
        })
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

// --- ToastProvider Component --- (경계 명확화를 위한 주석)
// Provider Component
function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] })

  const toast = React.useCallback((props: Omit<ToasterToast, "id" | "open" | "onOpenChange">) => {
    const id = genId()
    const newToast = {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) {
          setTimeout(() => {
            dispatch({ type: "REMOVE_TOAST", toastId: id })
          }, 1000)
        }
      },
    }
    dispatch({ type: "ADD_TOAST", toast: newToast })

    const timeoutId = setTimeout(() => {
       dispatch({ type: "REMOVE_TOAST", toastId: id })
    }, TOAST_REMOVE_DELAY)
    toastTimeouts.set(id, timeoutId)

    return {
      id: id,
      dismiss: () => {
        clearTimeout(toastTimeouts.get(id))
        toastTimeouts.delete(id)
        dispatch({ type: "REMOVE_TOAST", toastId: id })
      },
      update: (updateProps: ToasterToast) => dispatch({ type: "UPDATE_TOAST", toast: { ...updateProps, id } }),
    }
  }, [])

  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      clearTimeout(toastTimeouts.get(toastId))
      toastTimeouts.delete(toastId)
      dispatch({ type: "REMOVE_TOAST", toastId })
    } else {
      state.toasts.forEach(t => {
        clearTimeout(toastTimeouts.get(t.id))
        toastTimeouts.delete(t.id)
      })
      dispatch({ type: "REMOVE_TOAST" })
    }
  }, [state.toasts])
  
  React.useEffect(() => {
    return () => {
      toastTimeouts.forEach(timeout => clearTimeout(timeout))
      toastTimeouts.clear()
    }
  }, [])

  // React.useMemo를 사용하지 않고 직접 객체를 전달
  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

// Hook to use the context
function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export { useToast, ToastProvider }
