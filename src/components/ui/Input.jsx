import {useState} from "react"

export function Input({label, id, className = "", style, ...props}) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} className={`input ${className}`.trim()} style={style} {...props} />
    </div>
  )
}

export function TextArea({label, id, className = "", style, ...props}) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <textarea id={id} className={`input ${className}`.trim()} style={style} {...props} />
    </div>
  )
}

export function Select({label, id, className = "", style, children, ...props}) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} className={`input ${className}`.trim()} style={style} {...props}>
        {children}
      </select>
    </div>
  )
}

export default Input
