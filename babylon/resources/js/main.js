/// <reference path='./vendor/babylon.d.ts' />

const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

function createCamera(scene) {
    const camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas);

    camera.lowerRadiusLimit = 6;
    camera.upperRadiusLimit = 20;
}

function createLight(scene) {
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0,1,0), scene);
    light.intensity = 0.5;
    light.groundColor = new BABYLON.Color3(0,0,1);
}

function createSkyBox(scene) {
    const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMaterial', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.diffuseColor = BABYLON.Color3.Black();
    skyboxMaterial.specularColor = BABYLON.Color3.Black();

    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('./resources/assets/images/skybox/skybox', scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    const skybox = BABYLON.MeshBuilder.CreateBox('skybox', {
        size: 1000
    }, scene);

    skybox.infiniteDistance = true;
    skybox.material = skyboxMaterial;
}

function createSun(scene) {
    const sunMaterial = new BABYLON.StandardMaterial('sunMaterial', scene)
    sunMaterial.emissiveTexture = new BABYLON.Texture('./resources/assets/images/sun.jpg', scene)
    sunMaterial.diffuseColor = BABYLON.Color3.Black();
    sunMaterial.specularColor = BABYLON.Color3.Black();

    const sun = BABYLON.MeshBuilder.CreateSphere('sun', {
        segments: 16,
        diameter: 4
    }, scene);

    sun.material = sunMaterial;

    //Sunlight
    const sunlight = new BABYLON.PointLight('sunlight', BABYLON.Vector3.Zero(), scene);
    sunlight.intensity = 4
}

function createPlanet(material, position, speed, size, scene) {
    const planetMaterial = new BABYLON.StandardMaterial('planetMaterial', scene);
    planetMaterial.diffuseTexture = new BABYLON.Texture(material, scene);
    planetMaterial.specularColor = BABYLON.Color3.Black();

    const planet = BABYLON.MeshBuilder.CreateSphere('planet', {
        segments: 16,
        diameter: size
    }, scene);
    planet.position.x = position;
    planet.material = planetMaterial;

    planet.orbit = {
        radius: planet.position.x,
        speed: speed,
        angle: 0
    };

    scene.registerBeforeRender(() => {
        planet.position.x = planet.orbit.radius * Math.sin(planet.orbit.angle);
        planet.position.z = planet.orbit.radius * Math.cos(planet.orbit.angle);
        planet.orbit.angle += planet.orbit.speed;
        //planet.rotation.x = Math.sin(planet.orbit.angle);
        planet.rotation.y = Math.cos(planet.orbit.angle)
    }
    );
}

function createScene() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.Black;

    createCamera(scene);
    createLight(scene);
    createSkyBox(scene);
    createSun(scene);
    createPlanet('./resources/assets/images/sand.png', 4, 0.02, 0.3, scene);
    createPlanet('./resources/assets/images/brown_rock.png', 6, 0.01, 0.7, scene);
    createPlanet('./resources/assets/images/dark_rock.png', 8, 0.005, 1, scene);
    createPlanet('./resources/assets/images/sand.png', 10, 0.003, 0.6, scene);
    createPlanet('./resources/assets/images/brown_rock.png', 14, 0.001, 2, scene);
    return scene;
}

const mainScene = createScene();

engine.runRenderLoop(() => {
    mainScene.render();
})

