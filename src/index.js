import './css/main.css'
import './scripts/render/cube'

setTimeout(
  () =>
    alert(
      'Left click the center of a face to rotate CW\n' +
        'Shift+Left to rotate ACW\n' +
        'Hold Right click and drag to rotate\n' +
        'Enter to test for Solved state'
    ),
  0
)
