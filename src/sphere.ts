import { SphereGeometry, Mesh, MeshStandardMaterial, DoubleSide } from "three";

export default class SkySphere {
  mesh: any;

  constructor() {
    const skySphere = new Mesh();

    // Create a sphere geometry
    const sphereGeometry = new SphereGeometry(400, 64, 64); // Adjusted size and segments

    // Create a material with the flipped sky texture
    const sphereMaterial = new MeshStandardMaterial({
      side: DoubleSide,
    });

    // Create a sphere mesh with the geometry and material
    const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);
    skySphere.add(sphereMesh);

    this.mesh = skySphere;
  }
}
