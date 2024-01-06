import { Mesh, MeshStandardMaterial, Object3D, Color } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { GUI } from 'lil-gui';

export default class ThreeDText {
  mesh: any;
  textParams: any;
  inputElement: HTMLInputElement | undefined;

  constructor(gui: GUI) {
    const textObject = new Object3D();
    this.textParams = {};

    const texts = [
      {
        key: 'melkam',
        text: 'መልካም',
        color: 0x009739,
        position: { x: 0, y: 3, z: 0 },
      },
      {
        key: 'yegena',
        text: 'የገና',
        color: 0xffd500,
        position: { x: 0, y: 1.9, z: 0 },
      },
      {
        key: 'beal',
        text: 'በአል',
        color: 0xd52b1e,
        position: { x: 0, y: 0.8, z: 0 },
      },
      {
        key: 'leferab',
        text: 'ለፍሬአብ',
        color: 0x21449c,
        position: { x: 0, y: -0.3, z: 0 },
      },
    ];

    const fontLoader = new FontLoader();
    fontLoader.load('../public/fonts/Meaza_Regular.json', (font) => {
      const commonMaterialOptions = {
        color: 0xffffff,
        flatShading: true,
      };

      texts.forEach((textInfo) => {
        const textGeometry = new TextGeometry(textInfo.text, {
          font,
          size: 1,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelSegments: 5,
        });

        const textMaterial = new MeshStandardMaterial({
          ...commonMaterialOptions,
          color: new Color(textInfo.color),
        });

        const textMesh = new Mesh(textGeometry, textMaterial);
        textMesh.position.set(
          textInfo.position.x,
          textInfo.position.y,
          textInfo.position.z,
        );
        textMesh.castShadow = true;
        textObject.add(textMesh);

        this.textParams[textInfo.key] = {
          mesh: textMesh,
          color: `#${textInfo.color.toString(16)}`,
          position: { ...textInfo.position },
          text: textInfo.text,
        };
      });

      const textFolder = gui.addFolder('Text Properties');

      texts.forEach((textInfo) => {
        const textParams = this.textParams[textInfo.key];

        const colorControl = textFolder
          .addColor(textParams, 'color')
          .name(`${textParams.text} Color`);
        colorControl.onChange(() => {
          textParams.mesh.material.color.set(colorControl.getValue());
        });

        const positionFolder = textFolder.addFolder(
          `${textParams.text} Position`,
        );
        positionFolder
          .add(textParams.position, 'x', -10, 10)
          .name('X Position')
          .onChange(() => {
            textParams.mesh.position.x = textParams.position.x;
          });
        positionFolder
          .add(textParams.position, 'y', -10, 10)
          .name('Y Position')
          .onChange(() => {
            textParams.mesh.position.y = textParams.position.y;
          });
        positionFolder
          .add(textParams.position, 'z', -10, 10)
          .name('Z Position')
          .onChange(() => {
            textParams.mesh.position.z = textParams.position.z;
          });

        // Add text input control for changing the text content
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = textParams.text;
        textInput.addEventListener('input', (event) => {
          const newText = (event.target as HTMLInputElement).value;
          textParams.text = newText;
          updateTextGeometry(textParams);
        });

        textFolder.add(textInput, 'value').name(`${textParams.text} Text`);
        textFolder.close();

        function updateTextGeometry(params: {
          text: string;
          mesh: { geometry: TextGeometry };
        }) {
          const newTextGeometry = new TextGeometry(params.text, {
            font,
            size: 1,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelSegments: 5,
          });

          params.mesh.geometry.dispose();
          params.mesh.geometry = newTextGeometry;
        }
      });

      gui.close();
    });

    this.mesh = textObject;
  }
}
