const acceptedFiberFormats = ['.trk', '.tko', '.trx'];
const acceptedMeshFormats = [".obj", ".vtk", ".stl", ".mz3", ".smoothwm"];

export function getFirstCompatibleFiber(viewer) {
  if (!viewer.meshes || viewer.meshes.length === 0) return null;

  for (let i = 0; i < viewer.meshes.length; i++) {
    const mesh = viewer.meshes[i];
    const fileExtension = '.' + mesh.name.split('.').pop().toLowerCase();
    if (acceptedFiberFormats.includes(fileExtension)) {
      return { mesh, index: i };
    }
  }
  return null;
}

export function getFirstCompatibleMesh(viewer) {
  if (!viewer.meshes || viewer.meshes.length === 0) return null;

  for (let i = 0; i < viewer.meshes.length; i++) {
    const mesh = viewer.meshes[i];
    const fileExtension = "." + mesh.name.split(".").pop().toLowerCase();
    if (acceptedMeshFormats.includes(fileExtension)) {
      return { mesh, index: i };
    }
  }
  return null;
}