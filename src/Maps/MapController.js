import { useState } from "react"

export function updateZoom(zoom,center,setViewBox,clampViewBox) {

  const width = 360 / zoom
  const height = 180 / zoom

  setViewBox(clampViewBox({ x:center.x - width/2, y:center.y - height/2, width, height}))
}
export function useMapController() {

  const [viewBox,setViewBox] = useState({ x:-180, y:-90, width:360, height:180})
  const zoom = 360 / viewBox.width
  const [dragging,setDragging] = useState(false)
  const [startPoint,setStartPoint] = useState(null)

  function clampViewBox(viewBox){

    const minX = -180
    const maxX = 180
    const minY = -90
    const maxY = 90

    if(viewBox.width >= 360){return {...viewBox, x:minX, y:minY, width:360, height:180}}

    let x = viewBox.x
    let y = viewBox.y

    x = Math.max(minX, Math.min(x, maxX - viewBox.width))
    y = Math.max(minY, Math.min(y, maxY - viewBox.height))

    return {...viewBox,x,y}
  }

  function getRenderedSize(svg, viewBox) {

    const rect = svg.getBoundingClientRect()
    const viewRatio = viewBox.width / viewBox.height
    const screenRatio = rect.width / rect.height

    if (screenRatio > viewRatio) {
      const height = rect.height
      const width = height * viewRatio
      return { width, height, offsetX: (rect.width - width) / 2, offsetY: 0}
    } else {
      const width = rect.width
      const height = width / viewRatio
      return { width, height, offsetX: 0, offsetY: (rect.height - height) / 2}
    }
  }

  function screenToMap(event, svg, viewBox){

    const rect = svg.getBoundingClientRect()
    const rendered = getRenderedSize(svg, viewBox)

    const screenX = event.clientX - rect.left - rendered.offsetX
    const screenY = event.clientY - rect.top - rendered.offsetY

    return {
      x: viewBox.x + (screenX / rendered.width) * viewBox.width,
      y: viewBox.y + (screenY / rendered.height) * viewBox.height
    }
  }

  function getCenter(){return {x:viewBox.x + viewBox.width / 2,y:viewBox.y + viewBox.height / 2}}

  // *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* //

  function zoomIn() {
    const value = Math.min(zoom + 1, 10)
    updateZoom(value, getCenter(), setViewBox, clampViewBox)
  }

  function zoomOut() {
    const value = Math.max(zoom - 1, 1)
    updateZoom(value, getCenter(), setViewBox, clampViewBox)
  }

  function startPan(event) {
    setDragging(true)
    setStartPoint({x: event.clientX, y: event.clientY})
  }

  function movePan(event) {

    if (!dragging || !startPoint) {return}

    const svg = event.currentTarget

    const dx = event.clientX - startPoint.x
    const dy = event.clientY - startPoint.y

    setViewBox(prev => {

      const rendered = getRenderedSize( svg,prev )

      const moveX = dx * (prev.width / rendered.width)
      const moveY = dy * (prev.height / rendered.height)

      return clampViewBox({...prev,x: prev.x - moveX, y: prev.y - moveY})
    })

    setStartPoint({x: event.clientX, y: event.clientY})
  }

  function endPan() {
    if (!dragging) {return}
    setDragging(false)
    setStartPoint(null)
  }

  function zoomAtPoint(event, direction){

    const svg = event.currentTarget
    const mousePoint = screenToMap( event, svg, viewBox)

    const factor = direction === "in" ? 0.8 : 1.25

    const minWidth = 36
    const maxWidth = 360

    let newWidth = viewBox.width * factor
    newWidth =Math.min(Math.max( newWidth,minWidth),maxWidth)

    const realFactor = newWidth / viewBox.width
    const newHeight = newWidth / 2

    const newViewBox = {

      width: newWidth,
      height: newHeight,

      x: mousePoint.x - (mousePoint.x - viewBox.x) * realFactor,
      y: mousePoint.y -(mousePoint.y - viewBox.y) * realFactor

    }
    setViewBox(clampViewBox(newViewBox))
  }
  
  function zoomWheel(event){
    const direction = event.deltaY < 0 ? "in" : "out"
    zoomAtPoint(event, direction)
  }

  return {
    viewBox,
    zoom,
    zoomIn,
    zoomOut,
    zoomWheel,
    startPan,
    movePan,
    endPan
  }
}