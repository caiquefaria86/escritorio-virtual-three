// --- Lógica de Autenticação ---
const authForms = document.getElementById('auth-forms');
const loginFormDiv = document.getElementById('login-form');
const registerFormDiv = document.getElementById('register-form');
const messageContainer = document.getElementById('message-container');
const webglCanvas = document.querySelector('.webgl');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');

const registerNameInput = document.getElementById('register-name');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerPasswordConfirmationInput = document.getElementById('register-password-confirmation');
const registerButton = document.getElementById('register-button');

const toggleLinks = document.querySelectorAll('.toggle-link');

const LARAVEL_BACKEND_URL = 'http://localhost:8003';

function showMessage(message, type = 'info') {
    messageContainer.textContent = message;
    messageContainer.style.backgroundColor = type === 'error' ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 128, 0, 0.7)';
    messageContainer.style.display = 'block';
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 3000);
}

function showAuthForms() {
    authForms.style.display = 'block';
    webglCanvas.style.display = 'none';
}

function hideAuthForms() {
    authForms.style.display = 'none';
    webglCanvas.style.display = 'block';
}

async function getCsrfToken() {
    try {
        await fetch(`${LARAVEL_BACKEND_URL}/sanctum/csrf-cookie`, {
            credentials: 'include'
        });
        console.log('Token CSRF obtido com sucesso.');
        // O token CSRF é automaticamente enviado em cookies subsequentes
    } catch (error) {
        console.error('Erro ao obter o token CSRF:', error);
        showMessage('Erro de conexão com o servidor.', 'error');
    }
}

async function loginUser(email, password) {
    await getCsrfToken();
    try {
        const response = await fetch(`${LARAVEL_BACKEND_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',

            },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
            // Laravel Sanctum não retorna um token diretamente no /login
            // Ele usa cookies para autenticação de SPA.
            // Para usar com o Echo, precisamos de um token de API.
            // Vamos gerar um token após o login bem-sucedido.
            const tokenResponse = await fetch(`${LARAVEL_BACKEND_URL}/api/user/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') // Obter o token do cookie
                },
                body: JSON.stringify({ name: 'auth_token', abilities: ['*'] }),
            });

            const tokenData = await tokenResponse.json();

            if (tokenResponse.ok && tokenData.token) {
                localStorage.setItem('auth_token', tokenData.token);
                showMessage('Login bem-sucedido!', 'success');
                hideAuthForms();
                // Recarregar a página ou inicializar a cena 3D
                window.location.reload(); // Simples para recarregar e iniciar a cena
            } else {
                showMessage('Erro ao gerar token de API.', 'error');
            }
        } else {
            showMessage(data.message || 'Erro de login.', 'error');
        }
    } catch (error) {
        console.error('Erro de rede ou servidor:', error);
        showMessage('Erro de conexão com o servidor.', 'error');
    }
}

async function registerUser(name, email, password, passwordConfirmation) {
    await getCsrfToken();
    try {
        const response = await fetch(`${LARAVEL_BACKEND_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',

            },
            body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }),
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Registro bem-sucedido! Faça login agora.', 'success');
            loginFormDiv.style.display = 'block';
            registerFormDiv.style.display = 'none';
        } else {
            showMessage(data.message || 'Erro de registro.', 'error');
        }
    } catch (error) {
        console.error('Erro de rede ou servidor:', error);
        showMessage('Erro de conexão com o servidor.', 'error');
    }
}

// Função auxiliar para obter cookies (necessário para XSRF-TOKEN)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Event Listeners
loginButton.addEventListener('click', () => {
    loginUser(loginEmailInput.value, loginPasswordInput.value);
});

registerButton.addEventListener('click', () => {
    registerUser(
        registerNameInput.value,
        registerEmailInput.value,
        registerPasswordInput.value,
        registerPasswordConfirmationInput.value
    );
});

toggleLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const formToShow = e.target.dataset.form;
        if (formToShow === 'login') {
            loginFormDiv.style.display = 'block';
            registerFormDiv.style.display = 'none';
        } else {
            loginFormDiv.style.display = 'none';
            registerFormDiv.style.display = 'block';
        }
    });
});

// Verificar se já está autenticado
const authToken = localStorage.getItem('auth_token');
if (authToken) {
    hideAuthForms();
    // Se já autenticado, configure o Echo com o token
    echo.options.auth = {
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    };
    echo.connect(); // Reconecta o Echo com o token
} else {
    showAuthForms();
}

// --- Fim da Lógica de Autenticação ---

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.echo = new Echo({
    broadcaster: 'reverb',
    key: 'yr2oc4brce7lpp6ncgs7', // REVERB_APP_KEY from .env
    wsHost: window.location.hostname, // Or 'localhost' if always local
    wsPort: 8080, // REVERB_PORT from .env
    wssPort: 8080, // REVERB_PORT from .env
    forceTLS: false, // Set to true if using HTTPS
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
});

import * as THREE from 'three';
import { scene, camera, renderer } from './core/sceneManager.js';
import { controls, updateControls } from './core/controls.js';
import { setupMouseClick } from './utils/raycaster.js';
import { loadCharacter, updateCharacter, getModelPosition, setTarget } from './models/character.js';
import { loadRoom, getRoomBoundingBox } from './models/room.js';
import { getCharacterModel } from './models/character.js';
import { loadAllProps } from './models/props/index.js';
import { createMarker, updateMarker } from './models/marker.js';
import CannonDebugger from 'cannon-es-debugger';
import { stepPhysics, updatePhysicsMeshes, world, registerPhysicsObject, createGroundBox, initPhysics } from './core/physics.js';

let cannonDebugger;

let isObserving = false;
const keysPressed = {};
document.addEventListener('keydown', e => keysPressed[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keysPressed[e.key.toLowerCase()] = false);
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') isObserving = true;
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') isObserving = false;
});

let floor;
let clock = new THREE.Clock();

initPhysics(); // Inicializa o mundo Cannon antes de tudo
cannonDebugger = CannonDebugger(scene, world, { color: 0x00ff00 });
createMarker();

// Função para criar o chão visual e físico
async function setupGround() {
  const room = await loadRoom();
  const box = getRoomBoundingBox();
  if (box) {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Chão visual
    floor = new THREE.Mesh(
      // new THREE.PlaneGeometry(size.x, size.z), // Apenas para raycast do mouse
      // new THREE.MeshBasicMaterial({ visible: false }) // O chão do modelo já é visível
      new THREE.PlaneGeometry(size.x, size.z),
      // Tornando o chão visível para depuração
      new THREE.MeshBasicMaterial({
        color: 0x00ff00, // Uma cor visível
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3 
      })
    );
    floor.rotation.x = -Math.PI / 2;
    // Posiciona o chão visual exatamente na base do bounding box da sala
    floor.position.set(center.x, box.min.y, center.z);
    scene.add(floor);
    setupMouseClick(renderer.domElement, floor, setTarget);

    // Chão físico
    if (world) {
      createGroundBox('ground', size, floor.position, floor);
    }

    // Luzes
    scene.add(new THREE.AmbientLight(0xffffff, .5));
    const directional1 = new THREE.DirectionalLight(0xffffff, .3);
    directional1.position.set(10, 12, 0);
    const directional2 = new THREE.DirectionalLight(0xffffff, .8);
    directional2.position.set(-10, 12, 0);
    scene.add(directional1);
    scene.add(directional2);
  }
}

// Fluxo organizado: chão -> personagem -> loop -> props
setupGround().then(() => {
  return loadCharacter();
}).then(() => {
  const loop = () => {
    const delta = clock.getDelta();
    stepPhysics(delta);
    updatePhysicsMeshes();
    cannonDebugger.update();
    updateCharacter(delta, keysPressed);
    updateMarker();

    const model = getCharacterModel();
    if (model) {
      const modelPos = model.position.clone();

      if (isObserving) {
        controls.enabled = true;
        controls.target.copy(modelPos);
        controls.update();
      } else {
        controls.enabled = false;

        const offset = new THREE.Vector3(0, 2, -3);
        const cameraPos = modelPos.clone().add(offset.applyEuler(model.rotation));

        camera.position.lerp(cameraPos, .05);
        camera.lookAt(modelPos);
      }
    }

    updateControls(getModelPosition());
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  loop();
}).then(() => {
  return loadAllProps();
}).then(() => {
  console.log('Todas as props foram carregadas');
});
