export default function Icon({name, className = "", ...rest}) {
  return (
    <i
      className={`fa-solid fa-${name} ${className}`}
      aria-hidden="true"
      {...rest}
    />
  )
}
