import * as THREE from 'three'

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

// Create a scene
const scene = new THREE.Scene()

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

// Create a renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Create a group to hold all cubies
const cubeGroup = new THREE.Group()
scene.add(cubeGroup)

// Function to create a wireframe around a cubie
function createCubieWireframe(cubie) {
  const edges = new THREE.EdgesGeometry(cubie.geometry)
  const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })

  const wireframe = new THREE.LineSegments(edges, wireframeMaterial)
  cubie.add(wireframe)
}

// Create and position the cubies
const cubieSize = 1
for (let x = 0; x < 3; x += 1) {
  for (let y = 0; y < 3; y += 1) {
    for (let z = 0; z < 3; z += 1) {
      // Create a cubie
      const cubieGeometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize)
      const cubieMaterials = [
        new THREE.MeshBasicMaterial({ color: 0x017eff }),
        new THREE.MeshBasicMaterial({ color: 0x00e202 }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xf6ff00 }),
        new THREE.MeshBasicMaterial({ color: 0xdd0000 }),
        new THREE.MeshBasicMaterial({ color: 0xff8b1a })
      ]
      const cubie = new THREE.Mesh(cubieGeometry, cubieMaterials)
      createCubieWireframe(cubie)

      // Position the cubie
      cubie.position.set((x - 1) * cubieSize, (y - 1) * cubieSize, (z - 1) * cubieSize)
      cubeGroup.add(cubie)
    }
  }
}

// Handle window resizing
window.addEventListener('resize', () => {
  const newWidth = window.innerWidth
  const newHeight = window.innerHeight

  camera.aspect = newWidth / newHeight
  camera.updateProjectionMatrix()

  renderer.setSize(newWidth, newHeight)
})

// Handle mouse dragging
let isDragging = false
let previousMousePosition = { x: 0, y: 0 }
document.addEventListener('mousedown', (event) => {
  isDragging = true
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  }
})

document.addEventListener('mouseup', () => {
  isDragging = false
})

document.addEventListener('mousemove', (event) => {
  if (!isDragging) return

  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y
  }

  // Rotate the entire group
  const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(toRadians(deltaMove.y * 1), toRadians(deltaMove.x * 1), 0, 'XYZ')
  )

  cubeGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, cubeGroup.quaternion)

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  }
})

// Create an animation loop
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()
