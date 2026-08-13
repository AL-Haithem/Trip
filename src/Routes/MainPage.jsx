import MainMap from '../Maps/MainMap.jsx'
import EditMode from "../Editor/EditMode.jsx"

function MainPage() {

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative"
      }}
    >

      <MainMap />

      <EditMode />

    </div>
  )
}

export default MainPage