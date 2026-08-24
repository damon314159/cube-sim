import "./css/main.css";
import { render } from "./scripts/render/main-render.js";

render();

setTimeout(
  () =>
    alert(
      "Left click the centre of a face to rotate CW\n" +
        "Shift+Left to rotate ACW\n" +
        "Hold Right click and drag to rotate\n" +
        "Enter to test for Solved state",
    ),
  0,
);
