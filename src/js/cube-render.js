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

// Function to create a cubie geometry based on its position
function createCubieGeometry(x, y, z, cubieSize) {
  const materials = [
    new THREE.MeshBasicMaterial({ color: 0xffffff }), // Internals - Black
    new THREE.MeshBasicMaterial({ color: 0x017eff }), // Right - Blue
    new THREE.MeshBasicMaterial({ color: 0x00e202 }), // Left - Green
    new THREE.MeshBasicMaterial({ color: 0xffffff }), // Up - White
    new THREE.MeshBasicMaterial({ color: 0xf6ff00 }), // Down - Yellow
    new THREE.MeshBasicMaterial({ color: 0xdd0000 }), // Front - Red
    new THREE.MeshBasicMaterial({ color: 0xff8b1a }) // Back - Orange
  ]
  // Decide which faces are internal and thus should be coloured black
  const cubieMaterials = [
    x > 0 ? materials[1] : materials[0],
    x < 0 ? materials[2] : materials[0],
    y > 0 ? materials[3] : materials[0],
    y < 0 ? materials[4] : materials[0],
    z > 0 ? materials[5] : materials[0],
    z < 0 ? materials[6] : materials[0]
  ]
  const cubieGeometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize)
  return new THREE.Mesh(cubieGeometry, cubieMaterials)
}

// Create and position the cubies
const cubieSize = 1
for (let x = 0; x < 3; x += 1) {
  for (let y = 0; y < 3; y += 1) {
    for (let z = 0; z < 3; z += 1) {
      // Create a cubie
      const cubie = createCubieGeometry(x - 1, y - 1, z - 1, cubieSize)
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
  // Update the previous position object for the next movement
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  }
})

// Handle turns, following standard Rubik's cube notation for faces
// Direction is either c or i for clockwise/inverted
function rotateFace(face, direction = 'c') {
  // Create a temporary subgroup for the face
  const tempSubGroup = new THREE.Group()
  // Iterate through cubies in cubeGroup
  const rotationAmount = ((direction === 'i' ? 1 : -1) * Math.PI) / 2
  switch (face) {
    case 'r':
      for (let i = cubeGroup.children.length - 1; i >= 0; i -= 1) {
        const cubie = cubeGroup.children[i]
        if (cubie.position.x > 0) {
          tempSubGroup.add(cubie)
        }
      }
      tempSubGroup.rotation.x += rotationAmount
      break
    case 'l':
      for (let i = cubeGroup.children.length - 1; i >= 0; i -= 1) {
        const cubie = cubeGroup.children[i]
        if (cubie.position.x < 0) {
          tempSubGroup.add(cubie)
        }
      }
      tempSubGroup.rotation.x -= rotationAmount
      break
    case 'u':
      for (let i = cubeGroup.children.length - 1; i >= 0; i -= 1) {
        const cubie = cubeGroup.children[i]
        if (cubie.position.y > 0) {
          tempSubGroup.add(cubie)
        }
      }
      tempSubGroup.rotation.y += rotationAmount
      break
    case 'd':
      for (let i = cubeGroup.children.length - 1; i >= 0; i -= 1) {
        const cubie = cubeGroup.children[i]
        if (cubie.position.y < 0) {
          tempSubGroup.add(cubie)
        }
      }
      tempSubGroup.rotation.y -= rotationAmount
      break
    case 'f':
      for (let i = cubeGroup.children.length - 1; i >= 0; i -= 1) {
        const cubie = cubeGroup.children[i]
        if (cubie.position.z > 0) {
          tempSubGroup.add(cubie)
        }
      }
      tempSubGroup.rotation.z += rotationAmount
      break
    case 'b':
      for (let i = cubeGroup.children.length - 1; i >= 0; i -= 1) {
        const cubie = cubeGroup.children[i]
        if (cubie.position.z < 0) {
          tempSubGroup.add(cubie)
        }
      }
      tempSubGroup.rotation.z -= rotationAmount
      break
    default:
      break
  }
  // Update the rotation and position of each cubie in the temporary subgroup
  tempSubGroup.children.forEach((cubie) => {
    cubie.rotation.setFromQuaternion(
      cubie.quaternion.clone().invert().multiply(tempSubGroup.quaternion.clone().invert()).clone().invert()
    )
    cubie.position.applyQuaternion(tempSubGroup.quaternion)
    // Round the positions to integers after rotation
    cubie.position.x = Math.round(cubie.position.x)
    cubie.position.y = Math.round(cubie.position.y)
    cubie.position.z = Math.round(cubie.position.z)
  })

  // Add cubies back to the main cubeGroup
  for (let i = tempSubGroup.children.length - 1; i >= 0; i -= 1) {
    const cubie = tempSubGroup.children[i]
    cubeGroup.add(cubie)
  }
}

// Initial rotation to show front, right, and top faces
cubeGroup.rotation.set(toRadians(30), toRadians(-35), 0)
// Create an animation loop
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()
