import {Link} from "react-router-dom"

const VARIANTS = {
  primary: "btn-primary",
  info: "btn-info",
  warning: "btn-warning",
  danger: "btn-danger",
  ghost: "btn-ghost",
}

const SIZES = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
}

export default function Button({
  children,
  variant = "ghost",
  size = "md",
  block = false,
  loading = false,
  as = "button",
  className = "",
  ...props
}) {
  const classes = [
    "btn",
    VARIANTS[variant] || "btn-ghost",
    SIZES[size] || "",
    block ? "btn-block" : "",
    className,
  ].filter(Boolean).join(" ")

  if (as === "link") {
    return (
      <Link className={classes} {...props}>
        {loading && <span className="spinner" />}
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={loading} {...props}>
      {loading && <span className="spinner" />}
      {children}
    </button>
  )
}
