import {useState, useRef, useCallback, useEffect} from "react"

import TOOLS from "./registry.js"
import {WAYPOINT_TYPES} from "./Tools/PointDrawer.jsx"
import "../styles/editMode.css"

function EditMode({view, onRegister, defaultTool = null, initialRoute = null}) {

  const [activeTool, setActiveTool] = useState(defaultTool)
  const [pointSelected, setPointSelected] = useState(false)
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [polyState, setPolyState] = useState({
    selectedIndex: null,
    canUndo: false,
  })
  const [pointState, setPointState] = useState({
    selectedIndex: null,
    canUndo: false,
  })
  const toolRef = useRef({})
  const activeToolRef = useRef(defaultTool)
  activeToolRef.current = activeTool

  const registerTool = useCallback((id, api) => {
    toolRef.current[id] = api;
  }, []);

  const handlePolylineState = useCallback((state) => {
    setPolyState(prev => ({...prev, ...state}));
  }, []);

  const handlePointState = useCallback((state) => {
    setPointState(prev => ({...prev, ...state}));
  }, []);

  const activeApi = () => activeToolRef.current ? toolRef.current[activeToolRef.current] : null;

  const handleUndo = () => {
    const api = activeApi();
    if (api && api.undo) api.undo();
  };

  const handleDelete = () => {
    if (pointSelected) {
      const api = toolRef.current["point"];
      if (api && api.deleteSelected) api.deleteSelected();
      return;
    }
    const api = activeApi();
    if (api && api.deleteSelected) api.deleteSelected();
  };

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

  const handleChangeType = (typeId) => {
    const api = pointApi();
    if (api && api.changeType) api.changeType(typeId);
    setShowTypeMenu(false);
  };

  const undoEnabled = polyState.canUndo || pointState.canUndo;
  const deleteEnabled = polyState.selectedIndex !== null || pointSelected;

  return (
    <>
      <div className="em-toolbar">
        {TOOLS.map(tool => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              title={tool.label}
              onClick={() => toggleTool(tool.id)}
              className={isActive ? "em-tool-btn em-tool-active" : "em-tool-btn"}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tool.icon} />
              </svg>
            </button>
          );
        })}

        <div className="em-divider" />

        <button
          title="Undo"
          onClick={handleUndo}
          disabled={!undoEnabled}
          className={undoEnabled ? "em-tool-btn em-undo" : "em-tool-btn em-disabled"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 L4 9 L9 4" />
            <path d="M4 9 H12 a6 6 0 0 1 6 6 v1 a6 6 0 0 1 -6 6 H7" />
          </svg>
        </button>

        <button
          title="Delete selected"
          onClick={handleDelete}
          disabled={!deleteEnabled}
          className={deleteEnabled ? "em-tool-btn em-delete" : "em-tool-btn em-disabled"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6 h18 M8 6 V4 h8 v2 M6 6 l1 14 h10 l1 -14 M10 11 v6 M14 11 v6" />
          </svg>
        </button>

        {activeTool && (
          <button
            title="Done"
            onClick={() => setActiveTool(null)}
            className="em-text-btn em-done"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 L9 17 L4 12" />
            </svg>
            Done
          </button>
        )}

        {pointSelected && (
          <>
            <div className="em-divider" />

            <div className="em-type-wrap">
              <button
                title="Change waypoint type"
                onClick={() => setShowTypeMenu(prev => !prev)}
                className="em-tool-btn em-change-type"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41 13.42 20.59a2 2 0 0 1-2.83 0L3 13V4h9l8.59 8.59a2 2 0 0 1 0 2.82Z" />
                  <circle cx="7.5" cy="7.5" r="1.5" />
                </svg>
              </button>

              {showTypeMenu && (
                <div className="em-type-menu">
                  {WAYPOINT_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleChangeType(t.id)}
                      className="em-type-item"
                    >
                      <span className="em-type-emoji">{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
            onStateChange={tool.id === "polyline" ? handlePolylineState : (tool.id === "point" ? handlePointState : undefined)}
            toolId={tool.id}
            initialRoute={initialRoute}
          />
        );
      })}
    </>
  )
}

export default EditMode
