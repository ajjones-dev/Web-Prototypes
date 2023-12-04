/// <reference path='./vendor/babylon.d.ts' />

const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

function createScene() {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0,0,-10), scene,);
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0,1,0), scene);

    const box = BABYLON.MeshBuilder.CreateBox('box', {
        size: 1
    }, scene);

    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {
        segments: 32,
        diameter: 2
    }, scene);
    sphere.position = new BABYLON.Vector3(3,0,0);

    const plane = BABYLON.MeshBuilder.CreatePlane('plane', {}, scene);
    plane.position = new BABYLON.Vector3(-2,0,0);

    return scene;
}

const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
})

