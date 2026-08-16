export default function Panel({as: Tag = "div", solid = false, className = "", style, children, ...props}) {
  const base = solid ? "panel-solid" : "panel"
  return (
    <Tag className={`${base} ${className}`.trim()} style={style} {...props}>
      {children}
    </Tag>
  )
}
