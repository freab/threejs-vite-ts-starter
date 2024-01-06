import {
  CylinderGeometry,
  ConeGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";

export default class Gojo {
  mesh: any;

  constructor() {
    const gojo = new Object3D();

    const baseGeometry = new CylinderGeometry(3, 3, 4, 22);
    const baseMaterial = new MeshStandardMaterial({ color: 0x814d1a });
    const base = new Mesh(baseGeometry, baseMaterial);
    gojo.add(base);

    const topGeometry = new ConeGeometry(4, 6, 32);
    const topMaterial = new MeshStandardMaterial({ color: 0x5e3913 });
    const top = new Mesh(topGeometry, topMaterial);
    top.position.y = 4.3;
    gojo.add(top);

    this.mesh = gojo;
  }
}
