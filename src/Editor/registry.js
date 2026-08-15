import PolylineDrawer from "./Tools/PolylineDrawer.jsx";
import PointDrawer from "./Tools/PointDrawer.jsx";

const TOOLS = [
  {
    id: "polyline",
    label: "Draw Route",
    icon: "M4 12 L8 6 L12 14 L16 8 L20 12",
    component: PolylineDrawer,
  },
  {
    id: "point",
    label: "Add Point",
    icon: "M12 2 A4 4 0 1 0 12 10 A4 4 0 1 0 12 2 M12 10 L12 22",
    component: PointDrawer,
  },
];

export default TOOLS;
