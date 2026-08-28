import {Component} from "react"
import {errorBoundary as copy} from "./content/siteContent.js"
import "./styles/errorBoundary.css"

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
        <div className="eb-page">
          <h2 className="eb-title">{copy.title}</h2>
          <p className="eb-message">
            {String(this.state.error && this.state.error.message || this.state.error)}
          </p>
          <pre style={{whiteSpace: "pre-wrap", fontSize: 11, color: "#999", maxWidth: 700}}>
            {String(this.state.error && this.state.error.stack || "")}
          </pre>
          <button onClick={this.handleReload} className="eb-reload">
            {copy.reload}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
