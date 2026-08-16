import Button from "./components/ui/Button.jsx"
import Panel from "./components/ui/Panel.jsx"
import {notFound as copy} from "./content/siteContent.js"
import "./styles/notFound.css"

export default function NotFound() {
  return (
    <main className="nf-page">
      <Panel className="nf-panel">
        <div className="nf-code">{copy.code}</div>
        <h2 className="nf-title">{copy.title}</h2>
        <p className="nf-text">{copy.text}</p>
        <Button as="link" to="/" variant="primary">{copy.button}</Button>
      </Panel>
    </main>
  )
}
