// =============================================
// IMPORTATIONS ET INITIALISATION DE THREE.JS
// =============================================
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// =============================================
// PARAMÈTRES DU L-SYSTEM POUR UN MIMOSA
// =============================================
// Paramètres du L-system 3D
const axiom = "F";
let currentString = axiom;
const rules = {
  "F": "FF+[+F-F-^F]-[-F+F&F]"
};

const iterations = 5; // Nombre d'itérations
const angle = Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6; 
const length = 0.5; // Longueur des branches

// =============================================
// GÉNÉRATION DE LA CHAÎNE DU L-SYSTEM
// =============================================
/**
 * Génère la chaîne du L-system en appliquant les règles à chaque itération.
 */
function generateLSystem() {
  for (let i = 0; i < iterations; i++) {
    let newString = "";
    for (let char of currentString) {
      if (rules[char]) {
        newString += rules[char]; // Applique la règle si elle existe
      } else {
        newString += char; // Garde le caractère tel quel sinon
      }
    }
    currentString = newString;
  }
  return currentString;
}

// =============================================
// INITIALISATION DE LA SCÈNE THREE.JS
// =============================================
// Crée la scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Fond bleu ciel

// Crée la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// Crée le rendu
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ajoute les contrôles OrbitControls pour naviguer dans la scène
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// =============================================
// FONCTION POUR DESSINER LE MIMOSA
// =============================================
/**
 * Dessine le mimosa en 3D en utilisant la chaîne du L-system.
 */
function drawMimosa() {
  const stack = []; // Pile pour sauvegarder les états (position et direction)
  const branchPositions = []; // Tableau pour stocker les positions des branches
  let currentPosition = new THREE.Vector3(0, 0, 0); // Position initiale
  let currentDirection = new THREE.Vector3(0, 1, 0); // Direction initiale (vers le haut)
  const branchColor = new THREE.Color(0x5D4037); // Couleur marron pour les branches

  // Génère la chaîne du L-system
  const lSystemString = generateLSystem();

  // Parcourt chaque symbole de la chaîne
  for (let char of lSystemString) {
    switch (char) {
      case "F":
        // Avance et dessine une branche
        const newPosition = currentPosition.clone().add(currentDirection.clone().multiplyScalar(length));
        branchPositions.push(currentPosition.clone(), newPosition.clone());
        currentPosition = newPosition;
        break;
      case "+":
        // Tourne autour de l'axe Z (gauche) avec un angle légèrement aléatoire
        currentDirection.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle * (0.7 + Math.random() * 0.6));
        break;
      case "-":
        // Tourne autour de l'axe Z (droite) avec un angle légèrement aléatoire
        currentDirection.applyAxisAngle(new THREE.Vector3(0, 0, 1), -angle * (0.7 + Math.random() * 0.6));
        break;
      case "&":
        // Tourne vers le bas (autour de l'axe X) avec un angle légèrement aléatoire
        currentDirection.applyAxisAngle(new THREE.Vector3(1, 0, 0), angle * (0.7 + Math.random() * 0.6));
        break;
      case "^":
        // Tourne vers le haut (autour de l'axe X) avec un angle légèrement aléatoire
        currentDirection.applyAxisAngle(new THREE.Vector3(1, 0, 0), -angle * (0.7 + Math.random() * 0.6));
        break;
      case "\\":
        // Tourne à gauche autour de l'axe Y avec un angle légèrement aléatoire
        currentDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle * (0.7 + Math.random() * 0.6));
        break;
      case "/":
        // Tourne à droite autour de l'axe Y avec un angle légèrement aléatoire
        currentDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), -angle * (0.7 + Math.random() * 0.6));
        break;
      case "[":
        // Sauvegarde l'état actuel (position et direction)
        stack.push({ position: currentPosition.clone(), direction: currentDirection.clone() });
        break;
      case "]":
        // Restaure l'état précédent
        const savedState = stack.pop();
        currentPosition = savedState.position;
        currentDirection = savedState.direction;
        break;
    }
  }

  // =============================================
  // DESSINE LES BRANCHES
  // =============================================
  // Crée une géométrie de ligne pour les branches
  const branchGeometry = new THREE.BufferGeometry().setFromPoints(branchPositions);
  const branchMaterial = new THREE.LineBasicMaterial({ color: branchColor, linewidth: 1 });
  const branches = new THREE.LineSegments(branchGeometry, branchMaterial);
  scene.add(branches);

  // =============================================
  // AJOUTE LES FEUILLES (PHYLLODES)
  // =============================================
  // Crée des feuilles (petites sphères vertes) aux extrémités des branches
  const leafGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x8BC34A });
  branchPositions.forEach((position, index) => {
    if (index % 2 === 1) { // Aux extrémités des segments
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.copy(position);
      scene.add(leaf);
    }
  });

  // =============================================
  // AJOUTE LES FLEURS (POMPONS JAUNES)
  // =============================================
  // Ajoute des fleurs (petites sphères jaunes) aléatoirement sur les branches
  const flowerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const flowerMaterial = new THREE.MeshBasicMaterial({ color: 0xFFEB3B });
  for (let i = 0; i < branchPositions.length / 4; i++) {
    const randomIndex = Math.floor(Math.random() * branchPositions.length);
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
    flower.position.copy(branchPositions[randomIndex]);
    scene.add(flower);
  }
}
// =============================================
// AJOUTE UN VASE SIMPLISTE À LA BASE DU MIMOSA
// =============================================
// Crée un vase en forme de cylindre
const vaseGeometry = new THREE.CylinderGeometry(1, 1.2, 2, 32); // Rayon haut, rayon bas, hauteur, segments
const vaseMaterial = new THREE.MeshStandardMaterial({
  color: 0x8B4513, // Couleur marron pour le vase
  roughness: 0.8, // Texture légèrement rugueuse
  metalness: 0.2 // Légèrement métallique
});
const vase = new THREE.Mesh(vaseGeometry, vaseMaterial);

// Positionne le vase sous l'arbre
vase.position.y = -1; // Place le vase 1 unité en dessous de l'origine
scene.add(vase);

// Ajoute une lumière pour éclairer le vase et l'arbre
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// =============================================
// APPPEL DE LA FONCTION POUR DESSINER LE MIMOSA
// =============================================
drawMimosa();

// =============================================
// GESTION DU REDIMENSIONNEMENT DE LA FENÊTRE
// =============================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// =============================================
// BOUCLE D'ANIMATION
// =============================================
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Met à jour les contrôles
  renderer.render(scene, camera); // Rendu de la scène
}
animate();
