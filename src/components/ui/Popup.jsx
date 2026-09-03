import {createContext, useContext, useEffect, useState} from "react"
import Icon from "./Icon.jsx"
import "../../styles/popup.css"

const PopupContext = createContext(null)

export function PopupProvider({children}) {
  const [popup, setPopup] = useState(null)

  const showPopup = (message, type = "error") => {
    setPopup({message, type})
  }

  const closePopup = () => setPopup(null)

  useEffect(() => {
    if (!popup) return undefined
    const timer = window.setTimeout(closePopup, 5000)
    return () => window.clearTimeout(timer)
  }, [popup])

  return (
    <PopupContext.Provider value={{showPopup, closePopup}}>
      {children}
      {popup && (
        <div className={`popup popup-${popup.type}`} role="alert">
          <Icon name={popup.type === "success" ? "circle-check" : "circle-exclamation"} />
          <span>{popup.message}</span>
          <button type="button" className="popup-close" onClick={closePopup} aria-label="Close message">
            <Icon name="xmark" />
          </button>
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