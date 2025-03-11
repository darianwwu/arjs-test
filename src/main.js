import { AbsoluteDeviceOrientationControls } from './AbsoluteDeviceOrientationControls.js';
import { THREE } from './AbsoluteDeviceOrientationControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as LocAR from './locar/dist/locar.es.js';


// Global variables
var scene, camera, renderer, gltfloader, carModel;
var locar, cam, absoluteDeviceOrientationControls;
var box, cube1, markerSprite;

var targetCoords = {
  longitude: 7.650252,
  latitude: 51.934518
};

var currentCoords = {
  longitude: null,
  latitude: null
};

const lonInput = document.getElementById("longitude");
const latInput = document.getElementById("latitude");
const distanceOverlay = document.getElementById("distance-overlay"); // HTML-Distanzanzeige

// Im Overlay definierte Elemente werden in index.html existieren:
const compassContainer = document.getElementById("compassContainer");
const compassArrow = document.getElementById("compassArrow");
const compassText = document.getElementById("compassText");

window.onload = () => {
  console.log("page loaded, proceed to init");
  const overlay = document.getElementById("overlay");
  const startBtn = document.getElementById("btnStart");
  const lonLatInput = document.getElementById("lonlatinput");
  
  startBtn.addEventListener('click', () => {
    targetCoords.longitude = parseFloat(lonInput.value);
    targetCoords.latitude = parseFloat(latInput.value);
    document.body.removeChild(overlay);
    document.body.removeChild(lonLatInput);
    init();
  });
};

function init() {
  scene = new THREE.Scene();

  // Licht hinzufügen
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // Kamera und Renderer
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 500);
  scene.add(camera);
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // LocAR initialisieren
  locar = new LocAR.LocationBased(scene, camera);
  cam = new LocAR.WebcamRenderer(renderer);
  absoluteDeviceOrientationControls = new AbsoluteDeviceOrientationControls(camera);

  let firstLocation = true;
  gltfloader = new GLTFLoader();

  locar.on("gpsupdate", (pos, distMoved) => {
    if (firstLocation) {
      const textureLoader = new THREE.TextureLoader();
      const markerTexture = textureLoader.load('./images/map-marker.png');
      const markerMaterial = new THREE.SpriteMaterial({ map: markerTexture });
      markerSprite = new THREE.Sprite(markerMaterial);
      markerSprite.scale.set(5, 5, 1);
      locar.add(markerSprite, targetCoords.longitude, targetCoords.latitude);
      
      // GLTF-Modell laden
      gltfloader.load('./car-arrow-glb/source/carArrow.glb', function (gltf) {
        carModel = gltf.scene;
        carModel.scale.set(0.3, 0.3, 0.3);
        carModel.traverse(child => child.frustumCulled = false);
        camera.add(carModel);
        carModel.position.set(0, -1, -3);
        updateArrow();
      });

      firstLocation = false;
    }
    currentCoords.longitude = pos.coords.longitude;
    currentCoords.latitude = pos.coords.latitude;
    
    updateArrow();
    updateDistance();
  });

  locar.startGps();
  renderer.setAnimationLoop(animate);
}

function animate() {
  updateArrow();
  updateDistance();
  updateCompass(); // NEU: Kompass-Update
  cam.update();
  absoluteDeviceOrientationControls.update();
  renderer.render(scene, camera);
}

// Aktualisiert die Kompass-Anzeige basierend auf der Geräteausrichtung
function updateCompass() {
  if (!absoluteDeviceOrientationControls.deviceOrientation) return;

  let heading = absoluteDeviceOrientationControls.deviceOrientation.webkitCompassHeading || 
                absoluteDeviceOrientationControls.getAlpha() * (180 / Math.PI); // iOS Fix

  if (heading !== null) {
    compassArrow.style.transform = `rotate(${heading}deg)`; // Pfeil drehen
    compassText.innerText = `${Math.round(heading)}°`; // Text aktualisieren
    //console.log("Tatsächliche Ausrichtung: " + heading);
  }
}

// Berechnet die Entfernung zwischen zwei GPS-Koordinaten in Metern
function computeDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Erdradius in Metern
  const φ1 = THREE.MathUtils.degToRad(lat1);
  const φ2 = THREE.MathUtils.degToRad(lat2);
  const Δφ = THREE.MathUtils.degToRad(lat2 - lat1);
  const Δλ = THREE.MathUtils.degToRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Aktualisiert die Richtung des Pfeils
function updateArrow() {
  
  if (!carModel || currentCoords.longitude === null || currentCoords.latitude === null) {
    return;
  }
  //carModel.setWorldPosition(currentCoords.longitude, currentCoords.latitude, 1.5);
  var lonlattoworld = locar.lonLatToWorldCoords(targetCoords.longitude, targetCoords.latitude);
  console.log("Zielkoordinaten: " , lonlattoworld);
  var ausrichtungsvektor = new THREE.Vector3(-lonlattoworld[0], 1.5, -lonlattoworld[1]);
  console.log("ausrichtungsvektor:" , ausrichtungsvektor);
  console.log("Kameraposition:" , camera.position);
  var kopiervektor = new THREE.Vector3();
  carModel.getWorldPosition(kopiervektor);
  console.log("Weltposition Pfeil: ", carModel.getWorldPosition(kopiervektor));
  carModel.lookAt(ausrichtungsvektor);
}

// Aktualisiert die Distanzanzeige
function updateDistance() {
  if (currentCoords.longitude === null || currentCoords.latitude === null) return;
  const distance = computeDistance(currentCoords.latitude, currentCoords.longitude, targetCoords.latitude, targetCoords.longitude);
  distanceOverlay.innerText = `${Math.round(distance)} m`;
}
