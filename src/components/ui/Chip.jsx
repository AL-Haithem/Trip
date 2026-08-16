export default function Chip({green = false, className = "", style, children, ...props}) {
  const base = green ? "chip chip-green" : "chip"
  return (
    <span className={`${base} ${className}`.trim()} style={style} {...props}>
      {children}
    </span>
  )
}
