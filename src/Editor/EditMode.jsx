import {useState, useRef, useCallback, useEffect} from "react"

import TOOLS from "./registry.js"
import {WAYPOINT_TYPES} from "./Tools/PointDrawer.jsx"

function EditMode({view, onRegister, defaultTool = null, initialRoute = null}) {

  const [activeTool, setActiveTool] = useState(defaultTool)
  const [pointSelected, setPointSelected] = useState(false)
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const toolRef = useRef({})
  const activeToolRef = useRef(defaultTool)
  activeToolRef.current = activeTool

  const registerTool = useCallback((id, api) => {
    toolRef.current[id] = api;
  }, []);

  const toggleTool = (id) => {
    setActiveTool(prev => {
      const next = prev === id ? null : id;
      if (prev === "point" && next !== "point") {
        const api = toolRef.current["point"];
        if (api && api.clearSelection) api.clearSelection();
      }
      return next;
    });
  }

  const handlePointSelectChange = useCallback((graphic) => {
    setPointSelected(!!graphic);
    setShowTypeMenu(false);
  }, []);

  useEffect(() => {
    if (onRegister) {
      Object.entries(toolRef.current).forEach(([id, api]) => onRegister(id, api));
    }
  }, [onRegister, activeTool]);

  const pointApi = () => toolRef.current["point"];

  const handleDeletePoint = () => {
    const api = pointApi();
    if (api && api.deleteSelected) api.deleteSelected();
    setPointSelected(false);
    setShowTypeMenu(false);
  };

  const handleChangeType = (typeId) => {
    const api = pointApi();
    if (api && api.changeType) api.changeType(typeId);
    setShowTypeMenu(false);
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          gap: "8px",
          alignItems: "center",
          background: "rgba(0, 0, 0, 0.55)",
          padding: "8px",
          borderRadius: "10px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
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

        {activeTool && (
          <button
            title="Done"
            onClick={() => setActiveTool(null)}
            style={{
              height: "42px",
              padding: "0 14px",
              borderRadius: "8px",
              border: "1px solid #ffb84c",
              background: "rgba(255, 184, 76, 0.15)",
              color: "#ffb84c",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 L9 17 L4 12" />
            </svg>
            Done
          </button>
        )}

        {pointSelected && (
          <>
            <div style={{width: "1px", height: "28px", background: "#555", margin: "0 2px"}} />

            <div style={{position: "relative"}}>
              <button
                title="Change waypoint type"
                onClick={() => setShowTypeMenu(prev => !prev)}
                style={{
                  height: "42px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  border: "1px solid #4c9fff",
                  background: "rgba(76, 159, 255, 0.15)",
                  color: "#4c9fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Change Type
              </button>

              {showTypeMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "50px",
                    left: "0",
                    background: "#1b1f2a",
                    border: "1px solid #0cff25",
                    borderRadius: "8px",
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
                    minWidth: "180px",
                    zIndex: 20,
                  }}
                >
                  {WAYPOINT_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleChangeType(t.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid #333",
                        background: "rgba(255,255,255,0.04)",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "13px",
                        textAlign: "right",
                        direction: "rtl",
                      }}
                      >
                        <span style={{
                          fontSize: "16px",
                          display: "inline-block",
                        }}>{t.emoji}</span>
                        {t.label}
                      </button>
                  ))}
                </div>
              )}
            </div>

            <button
              title="Delete waypoint"
              onClick={handleDeletePoint}
              style={{
                height: "42px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid #ff4c4c",
                background: "rgba(255, 76, 76, 0.15)",
                color: "#ff4c4c",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>

      {TOOLS.map(tool => {
        const Component = tool.component;
        return (
          <Component
            key={tool.id}
            view={view}
            active={activeTool === tool.id}
            onRegister={registerTool}
            onSelectChange={tool.id === "point" ? handlePointSelectChange : undefined}
            toolId={tool.id}
            initialRoute={initialRoute}
          />
        );
      })}
    </>
  )
}

export default EditMode
