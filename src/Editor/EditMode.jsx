import {useState, useRef, useCallback} from "react"

import TOOLS from "./registry.js"

function EditMode({view, onRegister}) {

  const [activeTool, setActiveTool] = useState(null)
  const toolRef = useRef({})

  const registerTool = useCallback((id, api) => {
    toolRef.current[id] = api;
    if (onRegister) onRegister(id, api);
  }, [onRegister]);

  const toggleTool = (id) => {
    setActiveTool(prev => prev === id ? null : id);
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 10,
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }}
      >
        {TOOLS.map(tool => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              title={tool.label}
              onClick={() => toggleTool(tool.id)}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "8px",
                border: isActive ? "2px solid #0cff25" : "1px solid #555",
                background: isActive ? "rgba(12, 255, 37, 0.15)" : "#2a2a2a",
                color: isActive ? "#0cff25" : "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={tool.icon} />
              </svg>
            </button>
          );
        })}
      </div>

      {TOOLS.map(tool => {
        const Component = tool.component;
        return (
          <Component
            key={tool.id}
            view={view}
            active={activeTool === tool.id}
            onRegister={registerTool}
            toolId={tool.id}
          />
        );
      })}
    </>
  )
}

export default EditMode
