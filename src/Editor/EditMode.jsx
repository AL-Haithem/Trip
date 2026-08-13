import {useState} from "react"

function TripEditor() {

  const [editing, setEditing] = useState(false)

  const startEditing = () => {setEditing(true)}

  const cancelEditing = () => {setEditing(false)}

  const saveEditing = () => {setEditing(false)}

  if (!editing) {

    return (
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 10
        }}
      >

        <button onClick={startEditing}>
          Plan Trip
        </button>

      </div>
    )
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 10
      }}
    >

      <button onClick={cancelEditing}>
        Cancel
      </button>

      <button onClick={saveEditing}>
        Save
      </button>

    </div>
  )
}

export default TripEditor