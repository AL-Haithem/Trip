import {createContext, useContext, useEffect, useRef, useState} from "react"
import Icon from "./Icon.jsx"
import "../../styles/popup.css"

const PopupContext = createContext(null)

export function PopupProvider({children}) {
  const [popup, setPopup] = useState(null)
  const confirmResolver = useRef(null)

  const showPopup = (message, type = "error") => {
    setPopup({message, type})
  }

  const closePopup = () => setPopup(null)

  const confirmPopup = (message, options = {}) => new Promise((resolve) => {
    confirmResolver.current = resolve
    setPopup({message, type: "confirm", ...options})
  })

  const resolveConfirmation = (result) => {
    confirmResolver.current?.(result)
    confirmResolver.current = null
    setPopup(null)
  }

  useEffect(() => {
    if (!popup) return undefined
    if (popup.type === "confirm") return undefined
    const timer = window.setTimeout(closePopup, 5000)
    return () => window.clearTimeout(timer)
  }, [popup])

  return (
    <PopupContext.Provider value={{showPopup, closePopup, confirmPopup}}>
      {children}
      {popup && (
        <div className={`popup popup-${popup.type}`} role={popup.type === "confirm" ? "dialog" : "alert"} aria-modal={popup.type === "confirm" || undefined}>
          {popup.type === "confirm" ? (
            <div className="popup-confirm-content">
              <div className="popup-confirm-icon"><Icon name={popup.icon || "circle-question"} /></div>
              <div className="popup-confirm-copy">
                <strong>{popup.title || "Are you sure?"}</strong>
                <span>{popup.message}</span>
              </div>
              <div className="popup-confirm-actions">
                <button type="button" className="popup-action popup-action-cancel" onClick={() => resolveConfirmation(false)}>Cancel</button>
                <button type="button" className="popup-action popup-action-delete" onClick={() => resolveConfirmation(true)}>{popup.confirmLabel || "Confirm"}</button>
              </div>
            </div>
          ) : (
            <>
              <Icon name={popup.type === "success" ? "circle-check" : "circle-exclamation"} />
              <span>{popup.message}</span>
              <button type="button" className="popup-close" onClick={closePopup} aria-label="Close message">
                <Icon name="xmark" />
              </button>
            </>
          )}
        </div>
      )}
    </PopupContext.Provider>
  )
}

export function usePopup() {
  const context = useContext(PopupContext)
  if (!context) throw new Error("usePopup must be used inside PopupProvider")
  return context
}