export default function Card({className = "", style, children, ...props}) {
  return (
    <div className={`card ${className}`.trim()} style={style} {...props}>
      {children}
    </div>
  )
}
