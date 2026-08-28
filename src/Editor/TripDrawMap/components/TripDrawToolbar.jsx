import React, {useState, useEffect} from 'react'
import Icon from "../../../components/ui/Icon.jsx"

const ToolbarButton = ({ title, onClick, active, disabled, children, className = "" }) => (
  <button
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`tdm-tool-btn ${active ? "tdm-tool-active" : ""} ${disabled ? "tdm-tool-disabled" : ""} ${className}`}
  >
    {children}
  </button>
)

export const TripDrawToolbar = ({ activeTool, setActiveTool, pointMode, setPointMode, hasStart, clearSelection, handleUndo, handleDelete, canUndo, canDelete, selWaypoint, selVertex, setShowTypeMenu, handleChangeType, showTypeMenu, showLabelInput, setShowLabelInput, handleSetLabel, currentLabel, WAYPOINT_TYPES, Icon: IconComponent }) => {
  const [draft, setDraft] = useState("")

  useEffect(() => {
    if (showLabelInput) setDraft(currentLabel)
  }, [showLabelInput, currentLabel, selWaypoint, selVertex])

  const handleStartTool = () => {
    setActiveTool(null)
    clearSelection()
    if (setPointMode) setPointMode(p => p === "start" ? null : "start")
  }

  return (
    <div className="tdm-toolbar">
      <ToolbarButton
        title={hasStart ? "Move start point" : "Set start point"}
        onClick={handleStartTool}
        active={pointMode === "start"}
      >
        <IconComponent name="location-dot" />
      </ToolbarButton>

      <div className="tdm-divider" />

      <ToolbarButton
        title="Draw route"
        onClick={() => {
          setActiveTool(t => t === "polyline" ? null : "polyline")
          clearSelection()
        }}
        active={activeTool === "polyline"}
        disabled={!hasStart}
      >
        <IconComponent name="route" />
      </ToolbarButton>

      <div className="tdm-divider" />

      <ToolbarButton
        title="Undo (Ctrl+Z)"
        onClick={handleUndo}
        disabled={!canUndo}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 14 L4 9 L9 4" /><path d="M4 9 H12 a6 6 0 0 1 6 6 v1 a6 6 0 0 1 -6 6 H7" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        title="Delete selected"
        onClick={handleDelete}
        disabled={!canDelete}
        className="tdm-tool-delete"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6 h18 M8 6 V4 h8 v2 M6 6 l1 14 h10 l1 -14 M10 11 v6 M14 11 v6" />
        </svg>
      </ToolbarButton>

      {(selWaypoint !== null || selVertex !== null) && (
        <>
          <div className="tdm-divider" />
          <div className="tdm-type-wrap">
            <ToolbarButton
              title="Change point type"
              onClick={() => { setShowTypeMenu(p => !p); setShowLabelInput(false) }}
              style={{color: "var(--accent)"}}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41 13.42 20.59a2 2 0 0 1-2.83 0L3 13V4h9l8.59 8.59a2 2 0 0 1 0 2.82Z" />
                <circle cx="7.5" cy="7.5" r="1.5" />
              </svg>
            </ToolbarButton>
            {showTypeMenu && (
              <div className="tdm-type-menu">
                {WAYPOINT_TYPES.map(t => (
                  <button key={t.id} onClick={() => handleChangeType(t.id)} className="tdm-type-item">
                    <span className="tdm-type-emoji"><IconComponent name={t.icon} /></span>
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="tdm-type-wrap">
            <ToolbarButton
              title="Add text label"
              onClick={() => { setShowLabelInput(p => !p); setShowTypeMenu(false) }}
              style={{color: "var(--accent)"}}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7 V5 h16 v2 M12 5 v14 M9 19 h6" />
              </svg>
            </ToolbarButton>
            {showLabelInput && (
              <div className="tdm-type-menu">
                <input
                  autoFocus
                  className="tdm-label-input"
                  value={draft}
                  placeholder="Label above the point..."
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSetLabel(draft) }}
                />
                <div className="tdm-label-actions">
                  <button className="tdm-type-item" onClick={() => handleSetLabel(draft)}>Apply</button>
                  <button className="tdm-type-item" onClick={() => handleSetLabel("")}>Clear</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {(activeTool || pointMode) && (
        <button
          className="tdm-done-btn"
          title="Done"
          onClick={() => {setActiveTool(null); if (setPointMode) setPointMode(null); clearSelection()}}
        >
          Done
        </button>
      )}
    </div>
  )
}
