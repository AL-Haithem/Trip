import {Component} from "react"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {error: null}
  }

  static getDerivedStateFromError(error) {
    return {error}
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info)
  }

  handleReload = () => {
    this.setState({error: null})
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#11141c",
            color: "#fff",
            fontFamily: "system-ui, sans-serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h2 style={{color: "#ff4c4c", margin: 0}}>Something went wrong</h2>
          <p style={{color: "#aab", maxWidth: "480px"}}>
            {String(this.state.error && this.state.error.message || this.state.error)}
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#0cff25",
              color: "#06210b",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
