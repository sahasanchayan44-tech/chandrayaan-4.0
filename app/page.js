"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

// Passcode Configuration
const PASSCODE_HASH = 'a7a6fa669b0521b31f653dcb345091a123132025d1e2ae651b5fdec459478fe0'; // SHA-256 of 'ISRO-2026'
const CRYPTO_SALT = 'ISRO_SALT_CY4_0';

// Default credentials pre-populated from system detection
const DEFAULTS = {
  ghUsername: 'sahasanchayan44-tech',
  ghRepo: 'chandrayaan-4.0',
  mode: 'auto'
};

// Checkpoint targets for map
const checkpoints = [
  { name: 'Lander Zone (Shackleton)', x: 100, y: 150, color: 'var(--color-primary)' },
  { name: 'Ridge Alpha (Slope Sensor)', x: 220, y: 80, color: 'var(--color-secondary)' },
  { name: 'Water Ice Site (Shadowed Rim)', x: 380, y: 220, color: '#00ff87' },
  { name: 'Lunar Hopper (Deploy Zone)', x: 500, y: 110, color: 'var(--color-accent)' },
];

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const hopperDesigns = [
  {
    id: 'v1',
    name: 'CY-HP-V1 (Monopropellant Hydrazine)',
    desc: 'High-thrust chemical monopropellant system designed for rapid elevation changes and long-range ballistic hops across deep craters.',
    dryMass: '45 kg',
    wetMass: '115 kg',
    thrust: '440 N',
    maxRange: '800 m',
    maxAltitude: '150 m',
    isp: '235 s',
    stack: [
      { name: 'Propulsion: Monopropellant Thrusters (4x)', desc: 'Hydrazine thrusters for attitude control and jump impulses', status: 'Ready', health: 100 },
      { name: 'Tanks: Titanium Propellant Cell', desc: 'Diaphragm-equipped pressurised fuel delivery tank', status: '85% Fill', health: 98 },
      { name: 'Avionics: Autonav Guidance Unit', desc: 'Real-time IMU + LiDAR navigation array for touchdown site matching', status: 'Active', health: 96 },
      { name: 'Energy: Solar-Mesh Recharge Array', desc: 'Flexible high-efficiency solar fabric wrapping outer frame', status: '100% Charge', health: 100 },
      { name: 'Structure: Carbon-Composite Frame', desc: 'Ultra-lightweight shock-absorbing truss shell with landing legs', status: 'Nominal', health: 99 }
    ]
  },
  {
    id: 'v2',
    name: 'CY-HP-V2 (Gaseous Cold-Gas Hybrid)',
    desc: 'Clean nitrogen cold-gas system engineered specifically for shadowed ice craters to prevent landing plume chemical contamination of pristine ice.',
    dryMass: '38 kg',
    wetMass: '68 kg',
    thrust: '180 N',
    maxRange: '350 m',
    maxAltitude: '60 m',
    isp: '70 s',
    stack: [
      { name: 'Propulsion: High-Pressure Cold-Gas Jets (8x)', desc: 'Micro-thruster cluster for precision vectoring and low-gravity lift', status: 'Ready', health: 100 },
      { name: 'Tanks: Carbon-Fiber Gas Cylinders (2x)', desc: 'Storing high-pressure nitrogen gas at 300 bar pressure', status: '92% Pressure', health: 99 },
      { name: 'Sensors: Dual Laser Altimeter Array', desc: 'Sub-millimeter terrain scanning altimeter for slope matching', status: 'Standby', health: 100 },
      { name: 'Energy: Li-Sulfur Thermal battery block', desc: 'High-density solid-state batteries insulated against -180°C cold', status: '95% Capacity', health: 97 },
      { name: 'Structure: Aluminum-Lithium Landing Pad', desc: 'Wide footprint landing base designed for powdery lunar soil stability', status: 'Nominal', health: 95 }
    ]
  },
  {
    id: 'v3',
    name: 'CY-HP-V3 (Bipropellant Lander-Link)',
    desc: 'Advanced bipropellant (MMH/NTO) hopper serving as an heavy payload shuttle between Vikram Lander and shadowed polar ice sites.',
    dryMass: '95 kg',
    wetMass: '240 kg',
    thrust: '880 N',
    maxRange: '2.5 km',
    maxAltitude: '500 m',
    isp: '310 s',
    stack: [
      { name: 'Propulsion: Liquid Bipropellant Engine (1x)', desc: 'Deep-throttling main engine (10% to 100% control)', status: 'Armed', health: 99 },
      { name: 'Tanks: MMH Fuel & NTO Oxidizer Tanks', desc: 'Separate pressurized fuel cells with helium pressure supply', status: '78% Fill', health: 98 },
      { name: 'Guidance: Optical Flow Descent Camera', desc: 'Real-time hazard detection camera matching crater hazards', status: 'Active', health: 100 },
      { name: 'Energy: Radioisotope Thermoelectric Gen (RTG)', desc: 'Miniaturised thermal cell for uninterrupted power during lunar night', status: 'Operational', health: 99 },
      { name: 'Structure: Hexagonal Honeycomb Core', desc: 'Titanium honeycomb core designed for heavy payload carrying capabilities', status: 'Nominal', health: 100 }
    ]
  }
];

const modelsData = {
  v1: {
    vertices: [
      ...Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return { x: Math.cos(a) * 35, y: -60, z: Math.sin(a) * 35 };
      }),
      ...Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return { x: Math.cos(a) * 35, y: 40, z: Math.sin(a) * 35 };
      }),
      { x: -55, y: 70, z: -55 },
      { x: 55, y: 70, z: -55 },
      { x: 55, y: 70, z: 55 },
      { x: -55, y: 70, z: 55 },
      { x: 0, y: -100, z: 0 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
      [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8],
      [0, 8], [2, 10], [4, 12], [6, 14],
      [8, 16], [10, 17], [12, 18], [14, 19],
      [0, 20], [2, 20], [4, 20], [6, 20]
    ]
  },
  v2: {
    vertices: [
      { x: 0, y: -45, z: 0 },
      { x: 0, y: 45, z: 0 },
      { x: -45, y: 0, z: 0 },
      { x: 45, y: 0, z: 0 },
      { x: 0, y: 0, z: -45 },
      { x: 0, y: 0, z: 45 },
      ...Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return { x: Math.cos(a) * 65, y: 55, z: Math.sin(a) * 65 };
      }),
      { x: -55, y: -15, z: -15 }, { x: -55, y: 15, z: -15 }, { x: -55, y: 15, z: 15 }, { x: -55, y: -15, z: 15 }
    ],
    edges: [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [4, 3], [3, 5], [5, 2],
      [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 6],
      [2, 6], [3, 9], [4, 8], [5, 11],
      [14, 15], [15, 16], [16, 17], [17, 14], [2, 14], [2, 16]
    ]
  },
  v3: {
    vertices: [
      ...Array.from({length: 6}, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return { x: Math.cos(a) * 45, y: -50, z: Math.sin(a) * 45 };
      }),
      ...Array.from({length: 6}, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return { x: Math.cos(a) * 45, y: 35, z: Math.sin(a) * 45 };
      }),
      ...Array.from({length: 6}, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return { x: Math.cos(a) * 65, y: 65, z: Math.sin(a) * 65 };
      }),
      { x: 0, y: 55, z: 0 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
      [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 6],
      [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
      [6, 12], [7, 13], [8, 14], [9, 15], [10, 16], [11, 17],
      [6, 18], [8, 18], [10, 18], [18, 12]
    ]
  }
};

function project(x, y, z, width, height, yaw, pitch, zoom, explodedFactor = 0) {
  const length = Math.sqrt(x * x + y * y + z * z);
  if (length > 0 && explodedFactor > 0) {
    const factor = 1 + explodedFactor * 0.45;
    x *= factor;
    y *= factor;
    z *= factor;
  }
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  let x1 = x * cosYaw - z * sinYaw;
  let z1 = x * sinYaw + z * cosYaw;
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  let y2 = y * cosPitch - z1 * sinPitch;
  let z2 = y * sinPitch + z1 * cosPitch;
  const scale = zoom * 220 / (z2 + 300);
  const projX = width / 2 + x1 * scale;
  const projY = height / 2 + y2 * scale;
  return { x: projX, y: projY, z: z2 };
}

export default function Dashboard() {
  // --- STATE ---
  const [authorized, setAuthorized] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // App settings
  const [settings, setSettings] = useState({
    ghUsername: DEFAULTS.ghUsername,
    ghRepo: DEFAULTS.ghRepo,
    ghToken: '',
    modePreference: DEFAULTS.mode
  });
  const [currentMode, setCurrentMode] = useState('local');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeHopperTab, setActiveHopperTab] = useState('v1');

  // CAD 360 Viewport States & Refs
  const [cadOrbit, setCadOrbit] = useState(true);
  const [cadWireframe, setCadWireframe] = useState(true);
  const [cadExploded, setCadExploded] = useState(false);
  const [cadExplodedFactor, setCadExplodedFactor] = useState(0);
  const [cadZoom, setCadZoom] = useState(1);

  const angleV1Ref = useRef({ yaw: 0.5, pitch: 0.3 });
  const angleV2Ref = useRef({ yaw: 1.2, pitch: 0.4 });
  const angleV3Ref = useRef({ yaw: 2.1, pitch: 0.2 });

  const dragStartRef = useRef(null);
  const isDraggingRef = useRef(false);

  const canvasV1Ref = useRef(null);
  const canvasV2Ref = useRef(null);
  const canvasV3Ref = useRef(null);


  // File explorer state
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFilename, setUploadingFilename] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Previews
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFileState, setPreviewFileState] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  // Slideshow
  const [activeSlide, setActiveSlide] = useState(0);

  // Rover Telemetry values
  const [telemetry, setTelemetry] = useState({
    latLong: '89.9000°S, 0.0000°E',
    battery: 98,
    temp: -10,
    water: 4.82,
    connectivity: 'CONNECTIVITY: 99.4%'
  });

  // Lander Telemetry values
  const [landerTelemetry, setLanderTelemetry] = useState({
    altitude: 4.25, // km
    velocity: 14.8, // m/s
    fuel: 84.6, // %
    mainEngine: 'Active (38% Thrust)'
  });

  // Scientific Payloads
  const [payloads, setPayloads] = useState([
    { name: 'LIBS (Laser Spectroscopy)', status: 'scanning', info: 'Laser scanning regolith' },
    { name: 'APXS (X-Ray Spectrometer)', status: 'idle', info: 'Calibration cycle complete' },
    { name: 'ChaSTE (Thermal Probe)', status: 'active', info: 'Depth temperature profile log' },
    { name: 'ILSA (Seismology Array)', status: 'active', info: 'Monitoring seismic triggers' }
  ]);

  // Autonav Diagnostic Logs
  const [autonavLogs, setAutonavLogs] = useState([
    { time: '15:16:01', tag: 'AUTONAV', text: 'AutoNav system online. Radar sensor scanning crater rim...', type: 'info' },
    { time: '15:16:05', tag: 'TELESCOPE', text: 'ChaSTE temperature probe: Thermal model derived.', type: 'success' },
    { time: '15:16:10', tag: 'AUTONAV', text: 'Hazard identified at [x: 18.4m, y: 12.1m]: Slope gradient 14.2° (>10° limit).', type: 'alert' },
    { time: '15:16:13', tag: 'AUTONAV', text: 'Autonav: Recalculating local detour trajectory.', type: 'info' },
    { time: '15:16:16', tag: 'AUTONAV', text: 'Detour path locked. Signal latency: 1.25 seconds.', type: 'success' }
  ]);

  // System logs
  const [logText, setLogText] = useState('System initialized. Awaiting user telemetry inputs...');
  const [logColor, setLogColor] = useState('');
  const [systemTime, setSystemTime] = useState('2026-07-16 13:47:06 UTC');

  // Canvas map references
  const canvasRef = useRef(null);
  const mapPathStatusRef = useRef(null);
  const roverPosRef = useRef({ ...checkpoints[0] });
  const isSimulatingRef = useRef(false);
  const animationFrameIdRef = useRef(null);
  const consoleEndRef = useRef(null);

  // --- LOGGING HELPER ---
  const writeLog = useCallback((message, isError = false) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`[${timestamp}] ${message}`);
    setLogText(message);
    setLogColor(isError ? 'var(--color-error)' : '');
  }, []);

  // --- CRYPTOGRAPHY ---
  async function sha256(message) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        console.warn("Subtle crypto failed, falling back to JS implementation:", e);
      }
    }
    return jsSha256(message);
  }

  function jsSha256(str) {
    function rotateRight(n, x) {
      return (x >>> n) | (x << (32 - n));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const result = [];
    const words = [];
    let strLen = str.length * 8;
    
    const K = [];
    let H = [];
    let primeCounter = 0;
    const isPrime = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isPrime[candidate]) {
        for (let i = candidate; i < 311; i += candidate) {
          isPrime[i] = true;
        }
        H[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        K[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    
    str += '\x80';
    while (str.length % 64 - 56) str += '\x00';
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      words[i >> 2] |= charCode << (24 - (i % 4) * 8);
    }
    words[words.length] = ((strLen / maxWord) | 0);
    words[words.length] = (strLen | 0);
    
    for (let j = 0; j < words.length; ) {
      const w = words.slice(j, j += 16);
      const oldH = H.slice(0);
      for (let i = 0; i < 64; i++) {
        const wItem = i < 16 ? w[i] : (
          (rotateRight(17, w[i - 2]) ^ rotateRight(19, w[i - 2]) ^ (w[i - 2] >>> 10)) +
          w[i - 7] +
          (rotateRight(7, w[i - 15]) ^ rotateRight(18, w[i - 15]) ^ (w[i - 15] >>> 3)) +
          w[i - 16]
        ) | 0;
        const a = H[0], e = H[4];
        const temp1 = (H[7] +
          (rotateRight(6, e) ^ rotateRight(11, e) ^ rotateRight(25, e)) +
          ((e & H[5]) ^ (~e & H[6])) +
          K[i] +
          wItem
        ) | 0;
        const temp2 = ((rotateRight(2, a) ^ rotateRight(13, a) ^ rotateRight(22, a)) +
          ((a & H[1]) ^ (a & H[2]) ^ (H[1] & H[2]))
        ) | 0;
        
        const nextH = [(temp1 + temp2) | 0];
        nextH.push(H[0], H[1], H[2]);
        nextH.push((H[3] + temp1) | 0);
        nextH.push(H[4], H[5], H[6]);
        H = nextH;
      }
      for (let i = 0; i < 8; i++) {
        H[i] = (H[i] + oldH[i]) | 0;
      }
    }
    for (let i = 0; i < 8; i++) {
      let word = H[i];
      if (word < 0) word += maxWord;
      result.push(word.toString(16).padStart(8, '0'));
    }
    return result.join('');
  }


  const getFileKey = useCallback(async (pass) => {
    const encoder = new TextEncoder();
    const salt = encoder.encode(CRYPTO_SALT);
    const baseKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(pass),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }, []);

  const decryptBuffer = useCallback(async (arrayBuffer, pass) => {
    const key = await getFileKey(pass);
    const iv = arrayBuffer.slice(0, 12);
    const ciphertext = arrayBuffer.slice(12);
    return crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      ciphertext
    );
  }, [getFileKey]);

  const encryptBuffer = useCallback(async (arrayBuffer, pass) => {
    const key = await getFileKey(pass);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      arrayBuffer
    );
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
    return combined;
  }, [getFileKey]);

  // --- ENVIRONMENT CONFIGS ---
  const determineMode = useCallback((pref, username, repo) => {
    const host = window.location.hostname;
    let computedMode = 'local';
    
    if (pref === 'local') {
      computedMode = 'local';
    } else if (pref === 'cloud') {
      computedMode = 'cloud';
    } else {
      if (host === 'localhost' || host === '127.0.0.1' || host === '' || host.startsWith('192.168.')) {
        computedMode = 'local';
      } else {
        computedMode = 'cloud';
      }
    }
    
    setCurrentMode(computedMode);
    writeLog(computedMode === 'local' 
      ? 'Switched to Local mode. Interfacing with Next.js Route Handlers.'
      : `Switched to Cloud mode. Fetching repository data from GitHub: ${username}/${repo}`
    );
  }, [writeLog]);

  // --- API / ACTIONS ---
  const loadFilesList = useCallback(async (mode, username, repo, token) => {
    setIsLoadingFiles(true);
    writeLog('Refreshing secure file inventory...');
    try {
      if (mode === 'local') {
        const response = await fetch('/api/files');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setFiles(data);
      } else {
        // Query the gh-pages branch directly so dynamic uploads are visible instantly!
        const url = `https://api.github.com/repos/${username}/${repo}/contents/chandrayaan?ref=gh-pages`;
        const headers = {};
        if (token) headers['Authorization'] = `token ${token}`;
        
        const response = await fetch(url, { headers });
        if (response.status === 404) {
          writeLog('GitHub directory "chandrayaan" not found in gh-pages. Ready for first file commit.', true);
          setFiles([]);
        } else if (!response.ok) {
          throw new Error(`GitHub Error: HTTP ${response.status}`);
        } else {
          const githubContents = await response.json();
          const mapped = githubContents
            .filter(item => item.type === 'file')
            .map(item => ({
              name: item.name,
              size: item.size,
              mtime: new Date(),
              url: item.download_url,
              sha: item.sha,
              gitUrl: item.url
            }));
          setFiles(mapped);
        }
      }
      writeLog('Successfully synced file inventory.');
    } catch (e) {
      writeLog(`Failed to fetch file inventory: ${e.message}`, true);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [writeLog]);

  // Upload file (with client-side browser encryption)
  async function uploadFile(file) {
    setIsUploading(true);
    setUploadingFilename(`Encrypting: ${file.name}`);
    setUploadProgress(20);
    writeLog(`Encrypting document: ${file.name}...`);

    const pass = sessionStorage.getItem('cy4_passcode');
    if (!pass) {
      alert('Security session expired. Please reload.');
      setIsUploading(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const rawBuffer = reader.result;
          const encryptedBytes = await encryptBuffer(rawBuffer, pass);
          const encryptedBlob = new Blob([encryptedBytes], { type: 'application/octet-stream' });
          const encFilename = file.name + '.enc';

          writeLog(`Securely transmitting: ${encFilename} (AES-256 encrypted)...`);
          setUploadProgress(50);

          if (currentMode === 'local') {
            const formData = new FormData();
            formData.append('file', encryptedBlob, encFilename);

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.error || 'Server rejected file upload');
            }
            writeLog(`Successfully uploaded encrypted asset ${file.name} locally.`);
            setUploadProgress(100);
            setTimeout(() => {
              setIsUploading(false);
              loadFilesList(currentMode, settings.ghUsername, settings.ghRepo, settings.ghToken);
            }, 800);
          } else {
            if (!settings.ghToken) throw new Error('GitHub API Token required. Click CONFIG.');

            const base64Reader = new FileReader();
            base64Reader.onload = async () => {
              try {
                const base64Data = base64Reader.result.split(',')[1];
                const url = `https://api.github.com/repos/${settings.ghUsername}/${settings.ghRepo}/contents/chandrayaan/${encodeURIComponent(encFilename)}`;
                
                let sha = null;
                const existingFile = files.find(f => f.name === encFilename);
                if (existingFile) sha = existingFile.sha;

                // Explicitly commit directly to the gh-pages branch
                const payload = {
                  message: `Upload secure asset ${encFilename} via Next.js Dashboard`,
                  content: base64Data,
                  branch: 'gh-pages'
                };
                if (sha) payload.sha = sha;

                setUploadProgress(80);
                const response = await fetch(url, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `token ${settings.ghToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(payload)
                });

                if (!response.ok) {
                  const errData = await response.json();
                  throw new Error(errData.message || 'GitHub API upload failed');
                }

                setUploadProgress(100);
                writeLog(`Successfully uploaded encrypted ${file.name} to GitHub cloud (gh-pages).`);
                setTimeout(() => {
                  setIsUploading(false);
                  loadFilesList(currentMode, settings.ghUsername, settings.ghRepo, settings.ghToken);
                }, 800);
              } catch (e) {
                alert(e.message);
                setIsUploading(false);
              }
            };
            base64Reader.readAsDataURL(encryptedBlob);
          }
        } catch (err) {
          writeLog(`Encryption/upload failed: ${err.message}`, true);
          alert(err.message);
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (e) {
      writeLog(`Upload failed: ${e.message}`, true);
      setIsUploading(false);
    }
  }

  // Decrypt and Download File
  async function downloadFile(file) {
    writeLog(`Downloading encrypted asset stream: ${file.name}...`);
    const pass = sessionStorage.getItem('cy4_passcode');
    if (!pass) return alert('Session expired.');

    try {
      const res = await fetch(file.url);
      if (!res.ok) throw new Error('Failed to retrieve file from repository.');
      const encryptedBuffer = await res.arrayBuffer();

      writeLog(`Decrypting local stream for: ${file.name} (AES-256)...`);
      const decryptedBuffer = await decryptBuffer(encryptedBuffer, pass);

      const mimeType = getMimeType(file.name);
      const blob = new Blob([decryptedBuffer], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const cleanName = file.name.endsWith('.enc') ? file.name.slice(0, -4) : file.name;
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      writeLog(`Download completed: ${cleanName}`);
    } catch (e) {
      writeLog(`Download/Decryption failed: ${e.message}`, true);
      alert(`Decryption failed: ${e.message}. Your passcode might be incorrect.`);
    }
  }

  // Delete file
  async function deleteFile(filename, sha) {
    const cleanName = filename.endsWith('.enc') ? filename.slice(0, -4) : filename;
    if (!confirm(`Are you sure you want to delete the secure asset "${cleanName}"?`)) return;

    writeLog(`Initiating delete request for: ${filename}`);
    try {
      if (currentMode === 'local') {
        const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Server error deleting file');
        }
      } else {
        if (!settings.ghToken) throw new Error('GitHub API Token required.');
        const url = `https://api.github.com/repos/${settings.ghUsername}/${settings.ghRepo}/contents/chandrayaan/${encodeURIComponent(filename)}`;
        
        // Delete directly from the gh-pages branch
        const payload = {
          message: `Delete secure file ${filename} via Next.js Dashboard`,
          sha: sha,
          branch: 'gh-pages'
        };

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `token ${settings.ghToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'GitHub deletion failed');
        }
      }
      writeLog(`Successfully deleted secure asset: ${filename}`);
      loadFilesList(currentMode, settings.ghUsername, settings.ghRepo, settings.ghToken);
    } catch (error) {
      writeLog(`Deletion failed: ${error.message}`, true);
      alert(`Error deleting file: ${error.message}`);
    }
  }

  // Preview File
  async function previewFile(file) {
    setPreviewFileState(file);
    setPreviewLoading(true);
    setPreviewError('');
    setPreviewUrl('');
    setPreviewText('');
    setIsPreviewOpen(true);

    const pass = sessionStorage.getItem('cy4_passcode');
    if (!pass) {
      setPreviewError('Security session expired.');
      setPreviewLoading(false);
      return;
    }

    try {
      const res = await fetch(file.url);
      if (!res.ok) throw new Error('Failed to retrieve file from repository.');
      const encryptedBuffer = await res.arrayBuffer();

      const decryptedBuffer = await decryptBuffer(encryptedBuffer, pass);
      const cleanName = file.name.endsWith('.enc') ? file.name.slice(0, -4) : file.name;
      const ext = cleanName.split('.').pop().toLowerCase();
      const mime = getMimeType(cleanName);

      const blob = new Blob([decryptedBuffer], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
        setPreviewUrl(blobUrl);
      } else if (ext === 'pdf') {
        setPreviewUrl(blobUrl);
      } else if (['txt', 'json', 'js', 'css', 'html', 'md', 'csv'].includes(ext)) {
        const text = new TextDecoder().decode(decryptedBuffer);
        setPreviewText(text);
      } else {
        setPreviewUrl(blobUrl);
      }
    } catch (e) {
      setPreviewError(e.message);
    } finally {
      setPreviewLoading(false);
    }
  }

  // Helpers
  function getFileIconClass(filename) {
    const cleanName = filename.endsWith('.enc') ? filename.slice(0, -4) : filename;
    const ext = cleanName.split('.').pop().toLowerCase();
    switch(ext) {
      case 'pdf': return 'fa-solid fa-file-pdf file-pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp': return 'fa-solid fa-file-image file-image';
      case 'zip':
      case 'tar':
      case 'gz':
      case 'rar': return 'fa-solid fa-file-zipper file-archive';
      case 'json':
      case 'js':
      case 'css':
      case 'html': return 'fa-solid fa-file-code file-code';
      case 'csv':
      case 'xlsx':
      case 'txt':
      case 'md': return 'fa-solid fa-file-csv file-data';
      default: return 'fa-solid fa-file file-generic';
    }
  }

  function getMimeType(filename) {
    const cleanName = filename.endsWith('.enc') ? filename.slice(0, -4) : filename;
    const ext = cleanName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      case 'svg': return 'image/svg+xml';
      case 'webp': return 'image/webp';
      case 'json': return 'application/json';
      case 'js': return 'application/javascript';
      case 'css': return 'text/css';
      case 'html': return 'text/html';
      case 'csv': return 'text/csv';
      case 'txt': return 'text/plain';
      case 'md': return 'text/markdown';
      default: return 'application/octet-stream';
    }
  }

  // --- PASSCODE SUBMIT ---
  async function handleLockSubmit(e) {
    e.preventDefault();
    const hash = await sha256(passcode);
    if (hash === PASSCODE_HASH) {
      sessionStorage.setItem('cy4_authorized', 'true');
      sessionStorage.setItem('cy4_passcode', passcode);
      setAuthorized(true);
      writeLog('Security authorization accepted. Access granted.');
    } else {
      setPasscodeError(true);
      setIsShaking(true);
      setPasscode('');
      setTimeout(() => setIsShaking(false), 500);
      writeLog('Failed login attempt. Intrusion alert triggered.', true);
    }
  }

  // --- SETTINGS FORM SUBMIT ---
  function handleSettingsSubmit(e) {
    e.preventDefault();
    localStorage.setItem('cy4_gh_username', settings.ghUsername);
    localStorage.setItem('cy4_gh_repo', settings.ghRepo);
    localStorage.setItem('cy4_gh_token', settings.ghToken);
    localStorage.setItem('cy4_mode_pref', settings.modePreference);
    
    setIsSettingsOpen(false);
    writeLog('Configuration settings updated and saved.');
    determineMode(settings.modePreference, settings.ghUsername, settings.ghRepo);
  }

  function resetSettings() {
    if (confirm('Reset default configuration values?')) {
      setSettings({
        ghUsername: DEFAULTS.ghUsername,
        ghRepo: DEFAULTS.ghRepo,
        ghToken: '',
        modePreference: DEFAULTS.mode
      });
    }
  }

  // --- CAD 360 INTERACTIVE DESCENT/ORBIT HANDLERS ---
  const handleCadMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleCadMouseMove = (e) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.007;
    if (activeHopperTab === 'v1') {
      angleV1Ref.current.yaw += dx * sensitivity;
      angleV1Ref.current.pitch += dy * sensitivity;
    } else if (activeHopperTab === 'v2') {
      angleV2Ref.current.yaw += dx * sensitivity;
      angleV2Ref.current.pitch += dy * sensitivity;
    } else if (activeHopperTab === 'v3') {
      angleV3Ref.current.yaw += dx * sensitivity;
      angleV3Ref.current.pitch += dy * sensitivity;
    }
  };

  const handleCadMouseUp = () => {
    isDraggingRef.current = false;
    dragStartRef.current = null;
  };

  // Exploded view animation loop
  useEffect(() => {
    let animFrame;
    const animateExploded = () => {
      setCadExplodedFactor(prev => {
        if (cadExploded && prev < 1) {
          return Math.min(1, prev + 0.06);
        } else if (!cadExploded && prev > 0) {
          return Math.max(0, prev - 0.06);
        }
        return prev;
      });
      animFrame = requestAnimationFrame(animateExploded);
    };
    animFrame = requestAnimationFrame(animateExploded);
    return () => cancelAnimationFrame(animFrame);
  }, [cadExploded]);

  // Main 3D wireframe render loop
  useEffect(() => {
    if (!authorized) return;
    let animFrame;

    const render = () => {
      if (cadOrbit && !isDraggingRef.current) {
        const spinSpeed = 0.006;
        angleV1Ref.current.yaw += spinSpeed;
        angleV2Ref.current.yaw += spinSpeed;
        angleV3Ref.current.yaw += spinSpeed;
      }

      let canvas, activeAngle, modelData, color;
      if (activeHopperTab === 'v1') {
        canvas = canvasV1Ref.current;
        activeAngle = angleV1Ref.current;
        modelData = modelsData.v1;
        color = '0, 242, 254';
      } else if (activeHopperTab === 'v2') {
        canvas = canvasV2Ref.current;
        activeAngle = angleV2Ref.current;
        modelData = modelsData.v2;
        color = '0, 255, 135';
      } else if (activeHopperTab === 'v3') {
        canvas = canvasV3Ref.current;
        activeAngle = angleV3Ref.current;
        modelData = modelsData.v3;
        color = '185, 39, 252';
      }

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width = canvas.parentElement.clientWidth || 300;
          const h = canvas.height = canvas.parentElement.clientHeight || 300;
          ctx.clearRect(0, 0, w, h);

          // Projected vertices
          const projectedPoints = modelData.vertices.map(v => 
            project(v.x, v.y, v.z, w, h, activeAngle.yaw, activeAngle.pitch, cadZoom, cadExplodedFactor)
          );

          // Draw wireframe edges
          ctx.lineWidth = 1.3;
          modelData.edges.forEach(([p1, p2]) => {
            const pt1 = projectedPoints[p1];
            const pt2 = projectedPoints[p2];
            if (pt1 && pt2) {
              if (cadWireframe) {
                ctx.strokeStyle = `rgba(${color}, 0.85)`;
                ctx.shadowColor = `rgb(${color})`;
                ctx.shadowBlur = 3;
              } else {
                ctx.strokeStyle = `rgba(255, 255, 255, 0.65)`;
                ctx.shadowBlur = 0;
              }
              ctx.beginPath();
              ctx.moveTo(pt1.x, pt1.y);
              ctx.lineTo(pt2.x, pt2.y);
              ctx.stroke();
            }
          });
          ctx.shadowBlur = 0;

          // Draw vertices nodes
          ctx.fillStyle = `rgb(${color})`;
          projectedPoints.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame);
  }, [authorized, activeHopperTab, cadOrbit, cadZoom, cadWireframe, cadExplodedFactor]);

  // --- FILE FILTERS ---
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      setFilteredFiles(files.filter(f => {
        const cleanName = f.name.endsWith('.enc') ? f.name.slice(0, -4) : f.name;
        return cleanName.toLowerCase().includes(query);
      }));
    } else {
      setFilteredFiles([...files]);
    }
  }, [searchQuery, files]);

  // --- CANVAS MAP SIMULATOR ---
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, w, h);

    // Coordinates grid
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Topography contours
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(w * 0.35, h * 0.4, 80, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.35, h * 0.4, 45, 0, Math.PI * 2); ctx.stroke();

    // Crater ice
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
    ctx.fillStyle = 'rgba(0, 242, 254, 0.015)';
    ctx.beginPath(); ctx.arc(w * 0.7, h * 0.65, 110, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.7, h * 0.65, 70, 0, Math.PI * 2); ctx.stroke();

    const scaleX = w / 600;
    const scaleY = h / 300;

    // Dashed planned path
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(checkpoints[0].x * scaleX, checkpoints[0].y * scaleY);
    for (let i = 1; i < checkpoints.length; i++) {
      ctx.lineTo(checkpoints[i].x * scaleX, checkpoints[i].y * scaleY);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw checkpoints
    checkpoints.forEach(cp => {
      const cx = cp.x * scaleX;
      const cy = cp.y * scaleY;
      ctx.fillStyle = 'rgba(0, 242, 254, 0.05)';
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cp.color;
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(cp.name.split(' (')[0], cx, cy - 14);
    });

    // Draw rover position
    const rx = roverPosRef.current.x * scaleX;
    const ry = roverPosRef.current.y * scaleY;
    const pulseRadius = 12 + Math.sin(Date.now() / 200) * 3;
    ctx.strokeStyle = 'rgba(0, 255, 135, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(rx, ry, pulseRadius, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = '#00ff87';
    ctx.beginPath(); ctx.arc(rx, ry, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#00ff87';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx - 12, ry); ctx.lineTo(rx + 12, ry);
    ctx.moveTo(rx, ry - 12); ctx.lineTo(rx, ry + 12);
    ctx.stroke();

    if (isSimulatingRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(drawMap);
    }
  }, []);

  const initMapCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = rect.height || 300;
    drawMap();
  }, [drawMap]);

  function startRoverSimulation() {
    if (isSimulatingRef.current) return;
    isSimulatingRef.current = true;
    writeLog('Rover motor drivers engaged. Dynamic Path Simulation initiated.');
    if (mapPathStatusRef.current) mapPathStatusRef.current.textContent = 'Simulating traverse...';

    let segment = 0;
    let pathProgress = 0;
    const speed = 0.008;

    function step() {
      if (!isSimulatingRef.current) return;
      pathProgress += speed;
      if (pathProgress >= 1) {
        pathProgress = 0;
        segment++;
      }

      if (segment >= checkpoints.length - 1) {
        roverPosRef.current = { ...checkpoints[checkpoints.length - 1] };
        isSimulatingRef.current = false;
        if (mapPathStatusRef.current) mapPathStatusRef.current.textContent = 'Completed Traverse';
        writeLog('Rover reached terminal checkpoint: Deploy Zone. spectrometer scan locked.');
        drawMap();
        return;
      }

      const start = checkpoints[segment];
      const end = checkpoints[segment + 1];
      roverPosRef.current.x = start.x + (end.x - start.x) * pathProgress;
      roverPosRef.current.y = start.y + (end.y - start.y) * pathProgress;

      const simulatedLat = (89.9 - (roverPosRef.current.y / 2000)).toFixed(4);
      const simulatedLong = (roverPosRef.current.x / 10).toFixed(4);
      
      setTelemetry(prev => ({
        ...prev,
        latLong: `${simulatedLat}°S, ${simulatedLong}°E`
      }));

      animationFrameIdRef.current = requestAnimationFrame(step);
    }
    drawMap();
    step();
  }

  function resetRover() {
    isSimulatingRef.current = false;
    if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    roverPosRef.current = { ...checkpoints[0] };
    if (mapPathStatusRef.current) mapPathStatusRef.current.textContent = 'Ready for simulation';
    setTelemetry(prev => ({ ...prev, latLong: '89.9000°S, 0.0000°E' }));
    writeLog('Rover coordinates reset to default Lander Zone.');
    drawMap();
  }

  // --- INITIALIZATION ---
  useEffect(() => {
    const authStatus = sessionStorage.getItem('cy4_authorized') === 'true';
    const pass = sessionStorage.getItem('cy4_passcode');
    if (authStatus && pass) {
      setAuthorized(true);
    }

    const clockInterval = setInterval(() => {
      const now = new Date();
      setSystemTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Bootstrap app when authorized
  useEffect(() => {
    if (!authorized) return;

    async function loadLocalConfig() {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host === '') {
        try {
          const res = await fetch('/api/config');
          if (res.ok) {
            const configData = await res.json();
            const loaded = {
              ghUsername: configData.ghUsername || localStorage.getItem('cy4_gh_username') || DEFAULTS.ghUsername,
              ghRepo: configData.ghRepo || localStorage.getItem('cy4_gh_repo') || DEFAULTS.ghRepo,
              ghToken: configData.ghToken || localStorage.getItem('cy4_gh_token') || '',
              modePreference: localStorage.getItem('cy4_mode_pref') || DEFAULTS.mode
            };
            setSettings(loaded);
            determineMode(loaded.modePreference, loaded.ghUsername, loaded.ghRepo);
            loadFilesList(
              loaded.modePreference === 'auto' ? 'local' : loaded.modePreference,
              loaded.ghUsername,
              loaded.ghRepo,
              loaded.ghToken
            );
          }
        } catch (e) {
          console.warn('Failed local config fetch:', e);
        }
      } else {
        const loaded = {
          ghUsername: localStorage.getItem('cy4_gh_username') || DEFAULTS.ghUsername,
          ghRepo: localStorage.getItem('cy4_gh_repo') || DEFAULTS.ghRepo,
          ghToken: localStorage.getItem('cy4_gh_token') || '',
          modePreference: localStorage.getItem('cy4_mode_pref') || DEFAULTS.mode
        };
        setSettings(loaded);
        determineMode(loaded.modePreference, loaded.ghUsername, loaded.ghRepo);
        loadFilesList(
          loaded.modePreference === 'auto' ? 'cloud' : loaded.modePreference,
          loaded.ghUsername,
          loaded.ghRepo,
          loaded.ghToken
        );
      }
    }

    loadLocalConfig();
    initMapCanvas();
    const handleResize = () => initMapCanvas();
    window.addEventListener('resize', handleResize);

    const slideTimer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 3);
    }, 7000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(slideTimer);
    };
  }, [authorized, determineMode, loadFilesList, initMapCanvas]);

  // Telemetry fluctuation (Rover)
  useEffect(() => {
    if (!authorized) return;
    const telemetryInterval = setInterval(() => {
      setTelemetry(prev => {
        const nextBattery = Math.max(20, Math.min(100, prev.battery - (Math.random() > 0.85 ? 1 : 0)));
        const nextTemp = prev.temp + Math.floor(Math.random() * 3) - 1;
        const nextWater = Math.max(0.1, Math.min(30, prev.water + (Math.random() * 0.1 - 0.05)));
        const nextSig = (95 + Math.random() * 5).toFixed(1);
        return {
          ...prev,
          battery: nextBattery,
          temp: nextTemp,
          water: nextWater,
          connectivity: `CONNECTIVITY: ${nextSig}%`
        };
      });
    }, 4000);
    return () => clearInterval(telemetryInterval);
  }, [authorized]);

  // Lander Descent Simulator
  useEffect(() => {
    if (!authorized) return;
    const landerInterval = setInterval(() => {
      setLanderTelemetry(prev => {
        const nextAlt = Math.max(0, parseFloat((prev.altitude - 0.02).toFixed(3)));
        const nextVel = nextAlt === 0 ? 0 : parseFloat(Math.max(1, Math.min(25, prev.velocity + (Math.random() * 0.8 - 0.4))).toFixed(1));
        const nextFuel = Math.max(0, parseFloat((prev.fuel - 0.05).toFixed(2)));
        const nextEngine = nextAlt === 0 ? 'Shut Down' : `Active (${Math.floor(35 + Math.random() * 10)}% Thrust)`;
        return {
          altitude: nextAlt,
          velocity: nextVel,
          fuel: nextFuel,
          mainEngine: nextEngine
        };
      });
    }, 3000);

    return () => clearInterval(landerInterval);
  }, [authorized]);

  // Scientific Payloads Simulator
  useEffect(() => {
    if (!authorized) return;
    const payloadInterval = setInterval(() => {
      setPayloads(prev => {
        return prev.map(p => {
          if (p.name.startsWith('LIBS')) {
            return { ...p, status: Math.random() > 0.4 ? 'scanning' : 'idle' };
          }
          if (p.name.startsWith('APXS')) {
            return { ...p, status: Math.random() > 0.7 ? 'scanning' : 'idle' };
          }
          return p;
        });
      });
    }, 8500);
    return () => clearInterval(payloadInterval);
  }, [authorized]);

  // Autonav log simulation
  useEffect(() => {
    if (!authorized) return;
    const logInterval = setInterval(() => {
      const tags = ['AUTONAV', 'SPECTROSCOPY', 'TELEMETRY', 'POWER', 'CHA-STE'];
      const tag = tags[Math.floor(Math.random() * tags.length)];
      let text = '';
      let type = 'info';
      
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      if (tag === 'AUTONAV') {
        const detours = [
          'Path planning updated. Clear zone found ahead.',
          'Scanning local topography. Rough terrain detected.',
          'Detour check completed. Continuous drive enabled.',
          'Autonav tracking active. Heading angle: 218.4°.'
        ];
        text = detours[Math.floor(Math.random() * detours.length)];
      } else if (tag === 'SPECTROSCOPY') {
        const minerals = [
          'Spectrometer: Soil sample contains 2.1% Titanium Dioxide.',
          'Spectrometer: Ice water absorption feature detected at 3.0µm.',
          'Spectrometer: Lunar regolith sample density: 1.54 g/cm³.',
          'Spectrometer: Helium-3 traces observed in shadow trap.'
        ];
        text = minerals[Math.floor(Math.random() * minerals.length)];
        type = text.includes('water') ? 'success' : 'info';
      } else if (tag === 'TELEMETRY') {
        text = `Transmitting telemetry packet. RSSI: -84dBm. Bit error rate: 10^-6.`;
      } else if (tag === 'POWER') {
        text = `Solar panels generating 114W power. Charging battery cells.`;
        type = 'success';
      } else {
        text = `ChaSTE: Deep core thermal gradient measured at -112°C.`;
      }

      setAutonavLogs(prev => {
        const nextLogs = [...prev, { time: timeStr, tag, text, type }];
        if (nextLogs.length > 20) nextLogs.shift();
        return nextLogs;
      });
    }, 6000);

    return () => clearInterval(logInterval);
  }, [authorized]);

  // Auto scroll console logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autonavLogs]);

  // Drag & drop logic
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(file => uploadFile(file));
    }
  };

  const handleFilesSelection = (filesList) => {
    if (filesList.length === 0) return;
    Array.from(filesList).forEach(file => uploadFile(file));
  };

  if (!authorized) {
    return (
      <>
        <div className="starfield"></div>
        <div className="nebula"></div>
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className={`modal-content glass-card lock-card ${isShaking ? 'lock-card-shake' : ''}`}>
            <div className="lock-header">
              <i className="fa-solid fa-user-shield lock-icon"></i>
              <h2>SECURE TRANSMISSION INTERCEPT</h2>
              <p>CHANDRAYAAN 4.0 MISSION CONTROL</p>
            </div>
            <div className="lock-body">
              <form onSubmit={handleLockSubmit}>
                <div className="form-group">
                  <label htmlFor="input-passcode">ENTER MISSION CONTROL PASSCODE</label>
                  <input
                    type="password"
                    id="input-passcode"
                    placeholder="••••••••"
                    required
                    autoFocus
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                  />
                </div>
                {passcodeError && (
                  <div className="lock-error" id="lock-error-msg">
                    <i className="fa-solid fa-triangle-exclamation"></i> INVALID PASSCODE. ACCESS DENIED.
                  </div>
                )}
                <button type="submit" className="btn btn-primary btn-block btn-lock-submit">
                  <i className="fa-solid fa-key"></i> DECRYPT & ENTER
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="starfield"></div>
      <div className="nebula"></div>

      <div className="app-container">
        {/* Navbar */}
        <header className="navbar">
          <div className="brand">
            <div className="logo-container">
              <i className="fa-solid fa-shuttle-space logo-icon"></i>
              <div className="logo-glow"></div>
            </div>
            <div className="brand-text">
              <h1 className="logo-title">CHANDRAYAAN 4.0</h1>
              <span className="logo-subtitle">LUNAR EXPLORATION MISSION</span>
            </div>
          </div>

          <div className="quick-status">
            <div className="status-indicator online">
              <span className="pulse-dot"></span>
              <span className="status-text">{currentMode === 'local' ? 'LOCAL EXPRESS MODE' : 'CLOUD SYNC ACTIVE'}</span>
            </div>
            <div className="status-indicator online">
              <span className="pulse-dot"></span>
              <span className="status-text">{currentMode === 'local' ? 'LOCAL STORAGE ACTIVE' : 'CONNECTIVITY: CLOUD CDN'}</span>
            </div>
          </div>

          <div className="nav-actions">
            <button className="btn btn-secondary" onClick={() => setIsSettingsOpen(true)}>
              <i className="fa-solid fa-gear"></i> CONFIG
            </button>
            <a
              href={`https://github.com/${settings.ghUsername}/${settings.ghRepo}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              <i className="fa-brands fa-github"></i> REPOSITORY
            </a>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="dashboard-grid">
          {/* Left Column */}
          <section className="dashboard-col col-left">
            {/* Side-by-side Telemetry Dashboard */}
            <div className="glass-card">
              <div className="card-header">
                <h2 className="card-title">
                  <i className="fa-solid fa-chart-line header-icon"></i> DUAL TELEMETRY MODULE
                </h2>
                <span className="badge">{telemetry.connectivity}</span>
              </div>
              <div className="panel-row">
                {/* Rover Status */}
                <div className="telemetry-grid">
                  <div className="telemetry-item" style={{ gridColumn: 'span 2', background: 'rgba(0, 242, 254, 0.02)', borderBottom: '1px solid rgba(0, 242, 254, 0.1)' }}>
                    <span className="telemetry-label" style={{ color: 'var(--color-primary)' }}><i className="fa-solid fa-robot"></i> PRAGYAN 4.0 ROVER Telemetry</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">ROVER LAT/LONG</span>
                    <span className="telemetry-value">{telemetry.latLong}</span>
                    <span className="telemetry-sub">Shackleton Crater Zone</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">ROVER BATTERY</span>
                    <span className="telemetry-value">{telemetry.battery}%</span>
                    <div className="battery-bar-container">
                      <div className="battery-bar" style={{ width: `${telemetry.battery}%` }}></div>
                    </div>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">SOLAR TEMP</span>
                    <span className="telemetry-value">{telemetry.temp}°C</span>
                    <span className="telemetry-sub">Optimal Range</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">WATER INDEX</span>
                    <span className="telemetry-value">{telemetry.water.toFixed(2)}%</span>
                    <span className="telemetry-sub">Spectrometer Active</span>
                  </div>
                </div>

                {/* Lander descent status */}
                <div className="telemetry-grid" style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div className="telemetry-item" style={{ gridColumn: 'span 2', background: 'rgba(185, 39, 252, 0.02)', borderBottom: '1px solid rgba(185, 39, 252, 0.1)' }}>
                    <span className="telemetry-label" style={{ color: 'var(--color-accent)' }}><i className="fa-solid fa-circle-down"></i> VIKRAM 4.0 LANDER Telemetry</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">DESCENT ALTITUDE</span>
                    <span className="telemetry-value" style={{ color: 'var(--color-warning)' }}>{landerTelemetry.altitude} km</span>
                    <span className="telemetry-sub">Descent path active</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">LANDING VELOCITY</span>
                    <span className="telemetry-value">{landerTelemetry.velocity} m/s</span>
                    <span className="telemetry-sub">Vertical speed</span>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">FUEL RESERVE</span>
                    <span className="telemetry-value">{landerTelemetry.fuel}%</span>
                    <div className="battery-bar-container">
                      <div className="battery-bar" style={{ width: `${landerTelemetry.fuel}%`, background: 'linear-gradient(90deg, #ff0055, #ffd000)' }}></div>
                    </div>
                  </div>
                  <div className="telemetry-item">
                    <span className="telemetry-label">THRUST CONTROL</span>
                    <span className="telemetry-value" style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>{landerTelemetry.mainEngine}</span>
                    <span className="telemetry-sub">Thruster status</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Canvas Card */}
            <div className="glass-card">
              <div className="card-header">
                <h2 className="card-title">
                  <i className="fa-solid fa-map-location-dot header-icon"></i> PATH DETECTOR & TRAVERSE
                </h2>
                <div className="map-controls">
                  <button className="btn-icon" onClick={resetRover} title="Reset Path">
                    <i className="fa-solid fa-rotate-left"></i>
                  </button>
                  <button className="btn-icon" onClick={startRoverSimulation} title="Simulate Traverse">
                    <i className="fa-solid fa-play"></i>
                  </button>
                </div>
              </div>
              <div className="map-container">
                <canvas id="lunar-canvas" ref={canvasRef}></canvas>
                <div className="map-overlay">
                  <div className="map-info">
                    <span className="map-label">ACTIVE MISSION PATH</span>
                    <span className="map-value" ref={mapPathStatusRef}>Ready for simulation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Payloads & Autonav Logs Card */}
            <div className="glass-card">
              <div className="card-header">
                <h2 className="card-title">
                  <i className="fa-solid fa-satellite header-icon"></i> SCIENTIFIC PAYLOADS & AUTONAV MATRIX
                </h2>
              </div>
              <div className="panel-row">
                {/* Payloads list */}
                <div className="payload-list">
                  {payloads.map((p, idx) => (
                    <div className="payload-item" key={idx}>
                      <span className="payload-name">{p.name}</span>
                      <span className={`payload-status ${p.status}`}>
                        <span className="pulse-dot"></span>
                        {p.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Autonav Diagnostic Console */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <div className="terminal-console">
                    {autonavLogs.map((log, idx) => (
                      <div className={`console-line ${log.type}`} key={idx}>
                        <span className="time">[{log.time}]</span>
                        <span className="tag">[{log.tag}]</span>
                        <span>{log.text}</span>
                      </div>
                    ))}
                    <div ref={consoleEndRef} />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual briefings slideshow */}
            <div className="glass-card" id="card-briefings">
              <div className="card-header">
                <h2 className="card-title">
                  <i className="fa-solid fa-person-chalkboard header-icon"></i> MISSION BRIEFINGS & VISUALS
                </h2>
                <div className="slider-controls">
                  <button className="btn-icon btn-small" onClick={() => setActiveSlide((activeSlide - 1 + 3) % 3)} title="Previous Slide">
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button className="btn-icon btn-small" onClick={() => setActiveSlide((activeSlide + 1) % 3)} title="Next Slide">
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
              <div className="slider-container">
                <div className="slides-wrapper">
                  {/* Slide 0 */}
                  <div className={`slide ${activeSlide === 0 ? 'active' : ''}`}>
                    <img src="/images/rover_schematic.jpg" alt="Indian Lunar Rover Schematic" className="slide-img" />
                    <div className="slide-caption">
                      <h3>Pragyan 4.0 Schematic Blueprint</h3>
                      <p>Futuristic technical schematic of the Indian lunar rover including LIBS spectrometer, robotic arm, and solar cell configuration.</p>
                    </div>
                  </div>
                  {/* Slide 1 */}
                  <div className={`slide ${activeSlide === 1 ? 'active' : ''}`}>
                    <img src="/images/crater_water_map.jpg" alt="Shackleton Crater Water Ice Map" className="slide-img" />
                    <div className="slide-caption">
                      <h3>Shackleton Crater Water Distribution</h3>
                      <p>Thermal and spectroscopic scan showing water ice concentration deposits (green/blue signatures) in shadowed lunar craters.</p>
                    </div>
                  </div>
                  {/* Slide 2 */}
                  <div className={`slide ${activeSlide === 2 ? 'active' : ''}`}>
                    <img src="/images/landing_workflow.jpg" alt="Lunar Landing Site Workflow" className="slide-img" />
                    <div className="slide-caption">
                      <h3>Touchdown Site Workflow Protocol</h3>
                      <p>Strategic stages: Orbital Scanning, Slope Gradients (&lt;10° threshold), Solar Illumination, and Touchdown Lock.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column */}
          <section className="dashboard-col col-right">
            {/* Uploader */}
            <div className="glass-card uploader-card">
              <div className="card-header">
                <h2 className="card-title">
                  <i className="fa-solid fa-cloud-arrow-up header-icon"></i> SECURE TRANSMISSION LINK
                </h2>
              </div>
              <div
                className="drop-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <div className="drop-zone-content">
                  <i className={`fa-solid fa-satellite-dish upload-icon ${isUploading ? 'fa-pulse' : ''}`}></i>
                  <p className="drop-prompt">Drag & Drop secure files here or <span className="highlight">browse computer</span></p>
                  <p className="drop-specs">PDF, JPG, PNG, JSON, CSV (Max 100MB)</p>
                </div>
                <input
                  type="file"
                  id="file-input"
                  className="file-input"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) handleFilesSelection(e.target.files);
                  }}
                />
              </div>

              {isUploading && (
                <div className="upload-progress-container">
                  <div className="upload-progress-info">
                    <span>{uploadingFilename}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Lunar Hopper Engineering Deck & CAD 360 Portal */}
            <div className="glass-card">
              <div className="card-header">
                <h2 className="card-title">
                  <i className="fa-solid fa-cube header-icon"></i> LUNAR HOPPER CAD & ENGINEERING DECK
                </h2>
                <span className="badge">CAD 360 INTEGRATED</span>
              </div>
              
              {/* Tab Selector Headers */}
              <div className="hopper-tabs">
                {hopperDesigns.map(design => (
                  <button
                    key={design.id}
                    className={`hopper-tab-btn ${activeHopperTab === design.id ? 'active' : ''}`}
                    onClick={() => setActiveHopperTab(design.id)}
                  >
                    {design.id.toUpperCase()} DESIGN
                  </button>
                ))}
              </div>

              {/* Sliding Viewport panes */}
              <div className="sliding-outer">
                <div
                  className="sliding-inner"
                  style={{
                    transform: `translate3d(calc(-100% / 3 * ${
                      activeHopperTab === 'v1' ? 0 : activeHopperTab === 'v2' ? 1 : 2
                    }), 0, 0)`
                  }}
                >
                  {/* Slide Pane V1 */}
                  <div className="slide-pane">
                    {/* CAD Viewport Left */}
                    <div className="cad-viewport">
                      <div className="cad-grid-bg"></div>
                      <div className="cad-header-overlay">
                        <div className="cad-meta">
                          <span className="cad-title-text">{hopperDesigns[0].name}</span>
                          <span className="cad-sub-text">Dry: {hopperDesigns[0].dryMass} | Wet: {hopperDesigns[0].wetMass}</span>
                        </div>
                        <div className="cad-stats">
                          <div>VERTICES: 2,408</div>
                          <div>FPS: 60 (WebGL Canvas)</div>
                        </div>
                      </div>
                      <canvas
                        ref={canvasV1Ref}
                        className="cad-canvas"
                        onMouseDown={handleCadMouseDown}
                        onMouseMove={handleCadMouseMove}
                        onMouseUp={handleCadMouseUp}
                        onMouseLeave={handleCadMouseUp}
                      ></canvas>
                      <div className="cad-toolbar">
                        <div className="cad-tools-group">
                          <button className={`cad-tool-btn ${cadOrbit ? 'active' : ''}`} onClick={() => setCadOrbit(!cadOrbit)}>
                            <i className="fa-solid fa-rotate"></i> {cadOrbit ? 'ORBIT LOCK' : 'FREE ORBIT'}
                          </button>
                          <button className={`cad-tool-btn ${cadWireframe ? 'active' : ''}`} onClick={() => setCadWireframe(!cadWireframe)}>
                            <i className="fa-solid fa-circle-nodes"></i> {cadWireframe ? 'SOLID VIEW' : 'WIREFRAME'}
                          </button>
                          <button className={`cad-tool-btn ${cadExploded ? 'active' : ''}`} onClick={() => setCadExploded(!cadExploded)}>
                            <i className="fa-solid fa-cubes"></i> {cadExploded ? 'COLLAPSE' : 'EXPLODE'}
                          </button>
                        </div>
                        <a href="https://viewer.autodesk.com/" target="_blank" rel="noreferrer" className="cad-link-btn">
                          <i className="fa-solid fa-cube"></i> CAD 360 VIEW
                        </a>
                      </div>
                    </div>

                    {/* Component Stack Right */}
                    <div className="hopper-content" style={{ padding: 0 }}>
                      <p className="hopper-desc">{hopperDesigns[0].desc}</p>
                      <div className="hopper-spec-grid">
                        <div className="hopper-spec-item">
                          <span className="hopper-spec-label">PROPULSION THRUST</span>
                          <span className="hopper-spec-value">{hopperDesigns[0].thrust}</span>
                        </div>
                        <div className="hopper-spec-item">
                          <span className="hopper-spec-label">MAX RANGE (BALLISTIC)</span>
                          <span className="hopper-spec-value" style={{ color: 'var(--color-primary)' }}>{hopperDesigns[0].maxRange}</span>
                        </div>
                        <div className="hopper-spec-item">
                          <span className="hopper-spec-label">ISP SPECIFIC</span>
                          <span className="hopper-spec-value" style={{ color: 'var(--color-success)' }}>{hopperDesigns[0].isp}</span>
                        </div>
                      </div>
                      <div className="hopper-stack-title">
                        <i className="fa-solid fa-layer-group"></i> COMPONENT INTEGRATION STACK
                      </div>
                      <div className="hopper-stack">
                        {hopperDesigns[0].stack.map((comp, idx) => (
                          <div className="stack-component" key={idx}>
                            <div className="stack-comp-header">
                              <span className="stack-comp-name">{comp.name}</span>
                              <span className="stack-comp-status">{comp.status}</span>
                            </div>
                            <p className="stack-comp-desc">{comp.desc}</p>
                            <div className="stack-comp-health-bar">
                              <div className="stack-comp-health-fill" style={{ width: `${comp.health}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Slide Pane V2 */}
                  <div className="slide-pane">
                    {/* CAD Viewport Left */}
                    <div className="cad-viewport">
                      <div className="cad-grid-bg"></div>
                      <div className="cad-header-overlay">
                        <div className="cad-meta">
                          <span className="cad-title-text">{hopperDesigns[1].name}</span>
                          <span className="cad-sub-text">Dry: {hopperDesigns[1].dryMass} | Wet: {hopperDesigns[1].wetMass}</span>
                        </div>
                        <div className="cad-stats">
                          <div>VERTICES: 1,840</div>
                          <div>FPS: 60 (WebGL Canvas)</div>
                        </div>
                      </div>
                      <canvas
                        ref={canvasV2Ref}
                        className="cad-canvas"
                        onMouseDown={handleCadMouseDown}
                        onMouseMove={handleCadMouseMove}
                        onMouseUp={handleCadMouseUp}
                        onMouseLeave={handleCadMouseUp}
                      ></canvas>
                      <div className="cad-toolbar">
                        <div className="cad-tools-group">
                          <button className={`cad-tool-btn ${cadOrbit ? 'active' : ''}`} onClick={() => setCadOrbit(!cadOrbit)}>
                            <i className="fa-solid fa-rotate"></i> {cadOrbit ? 'ORBIT LOCK' : 'FREE ORBIT'}
                          </button>
                          <button className={`cad-tool-btn ${cadWireframe ? 'active' : ''}`} onClick={() => setCadWireframe(!cadWireframe)}>
                            <i className="fa-solid fa-circle-nodes"></i> {cadWireframe ? 'SOLID VIEW' : 'WIREFRAME'}
                          </button>
                          <button className={`cad-tool-btn ${cadExploded ? 'active' : ''}`} onClick={() => setCadExploded(!cadExploded)}>
                            <i className="fa-solid fa-cubes"></i> {cadExploded ? 'COLLAPSE' : 'EXPLODE'}
                          </button>
                        </div>
                        <a href="https://viewer.autodesk.com/" target="_blank" rel="noreferrer" className="cad-link-btn">
                          <i className="fa-solid fa-cube"></i> CAD 360 VIEW
                        </a>
                      </div>
                    </div>

                    {/* Component Stack Right */}
                    <div className="hopper-content" style={{ padding: 0 }}>
                      <p className="hopper-desc">{hopperDesigns[1].desc}</p>
                      <div className="hopper-spec-grid">
                        <div className="hopper-spec-item">
                          <span className="hopper-spec-label">PROPULSION THRUST</span>
                          <span className="hopper-spec-value">{hopperDesigns[1].thrust}</span>
                        </div>
                        <div className="hopper-spec-item">
                          <span className="hopper-spec-label">MAX RANGE (BALLISTIC)</span>
                          <span className="hopper-spec-value" style={{ color: 'var(--color-primary)' }}>{hopperDesigns[1].maxRange}</span>
                        </div>
                        <div className="hopper-spec-item">
                          <span className="hopper-spec-label">ISP SPECIFIC</span>
                          <span className="hopper-spec-value" style={{ color: 'var(--color-success)' }}>{hopperDesigns[1].isp}</span>
                        </div>
                      </div>
                      <div className="hopper-stack-title">
                        <i className="fa-solid fa-layer-group"></i> COMPONENT INTEGRATION STACK
                      </div>
                      <div className="hopper-stack">
                        {hopperDesigns[1].stack.map((comp, idx) => (
                          <div className="stack-component" key={idx}>
                            <div className="stack-comp-header">
                              <span className="stack-comp-name">{comp.name}</span>
                              <span className="stack-comp-status">{comp.status}</span>
                            </div>
                            <p className="stack-comp-desc">{comp.desc}</p>
                            <div className="stack-comp-health-bar">
                              <div className="stack-comp-health-fill" style={{ width: `${comp.health}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Slide Pane V3 */}
                  <div className="slide-pane">
                    {/* CAD Viewport Left */}
                    <div className="cad-viewport">
                      <div className="cad-grid-bg"></div>
                      <div className="cad-header-overlay">
                        <div className="cad-meta">
                          <span className="cad-title-text">{hopperDesigns[2].name}</span>
                          <span className="cad-sub-text">Dry: {hopperDesigns[2].dryMass} | Wet: {hopperDesigns[2].wetMass}</span>
                        </div>
                        <div className="cad-stats">
                          <div>VERTICES: 3,120</div>
                          <div>FPS: 60 (WebGL Canvas)</div>
                        </div>
                      </div>
                      <canvas
                        ref={canvasV3Ref}
                        className="cad-canvas"
                        onMouseDown={handleCadMouseDown}
                        onMouseMove={handleCadMouseMove}
                        onMouseUp={handleCadMouseUp}
                        onMouseLeave={handleCadMouseUp}
                      ></canvas>
                      <div className="cad-toolbar">
                        <div className="cad-tools-group">
                          <button className={`cad-tool-btn ${cadOrbit ? 'active' : ''}`} onClick={() => setCadOrbit(!cadOrbit)}>
                            <i className="fa-solid fa-rotate"></i> {cadOrbit ? 'ORBIT LOCK' : 'FREE ORBIT'}
                          </button>
                          <button className={`cad-tool-btn ${cadWireframe ? 'active' : ''}`} onClick={() => setCadWireframe(!cadWireframe)}>
                            <i className="fa-solid fa-circle-nodes"></i> {cadWireframe ? 'SOLID VIEW' : 'WIREFRAME'}
                          </button>
                          <button className={`cad-tool-btn ${cadExploded ? 'active' : ''}`} onClick={() => setCadExploded(!cadExploded)}>
                            <i className="fa-solid fa-cubes"></i> {cadExploded ? 'COLLAPSE' : 'EXPLODE'}
                          </button>
                        </div>
                        <a href="https://viewer.autodesk.com/" target="_blank" rel="noreferrer" className="cad-link-btn">
                          <i className="fa-solid fa-cube"></i> CAD 360 VIEW
                        </a>
                      </div>
                    </div>

                    {/* Component Stack Right */}
                    <div className="hopper-content" style={{ padding: 0 }}>
                      <p className="hopper-desc">{hopperDesigns[2].desc}</p>
                      <div className="hopper-spec-grid">
                        <div className="hopper-spec-item">
                          <span className="hopper-spec-label">PROPULSION THRUST</span>
                          <span className="hopper-spec-value">{hopperDesigns[2].thrust}</span>
                        </div>
                        <div className="hopper-spec-item">
                          <span className="hopper-spec-label">MAX RANGE (BALLISTIC)</span>
                          <span className="hopper-spec-value" style={{ color: 'var(--color-primary)' }}>{hopperDesigns[2].maxRange}</span>
                        </div>
                        <div className="hopper-spec-item">
                          <span className="hopper-spec-label">ISP SPECIFIC</span>
                          <span className="hopper-spec-value" style={{ color: 'var(--color-success)' }}>{hopperDesigns[2].isp}</span>
                        </div>
                      </div>
                      <div className="hopper-stack-title">
                        <i className="fa-solid fa-layer-group"></i> COMPONENT INTEGRATION STACK
                      </div>
                      <div className="hopper-stack">
                        {hopperDesigns[2].stack.map((comp, idx) => (
                          <div className="stack-component" key={idx}>
                            <div className="stack-comp-header">
                              <span className="stack-comp-name">{comp.name}</span>
                              <span className="stack-comp-status">{comp.status}</span>
                            </div>
                            <p className="stack-comp-desc">{comp.desc}</p>
                            <div className="stack-comp-health-bar">
                              <div className="stack-comp-health-fill" style={{ width: `${comp.health}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Secure Files Inventory */}
            <div className="glass-card files-card">
              <div className="card-header">
                <h2 className="card-title">
                  <i className="fa-solid fa-folder-open header-icon"></i> CHANDRAYAAN DATA ASSETS
                </h2>
                <div className="search-bar-container">
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="files-list">
                {isLoadingFiles ? (
                  <div className="loading-state">
                    <i className="fa-solid fa-circle-notch fa-spin loading-icon"></i>
                    <p>Syncing secure files with server...</p>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="empty-state">
                    <i className="fa-solid fa-folder-open empty-icon"></i>
                    <p>No secure files found</p>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Repository is empty or files filtered out.</span>
                  </div>
                ) : (
                  filteredFiles.map(file => {
                    const iconClass = getFileIconClass(file.name);
                    const cleanName = file.name.endsWith('.enc') ? file.name.slice(0, -4) : file.name;
                    return (
                      <div className="file-item" key={file.name}>
                        <div className="file-details">
                          <div className="file-icon-wrapper">
                            <i className={iconClass}></i>
                          </div>
                          <div className="file-meta">
                            <span className="file-name" title={cleanName}>{cleanName}</span>
                            <span className="file-size-date">
                              {formatBytes(file.size)}
                              <span style={{ color: 'var(--color-success)', fontSize: '0.6rem', marginLeft: '0.4rem' }}>
                                <i className="fa-solid fa-lock"></i> SECURE
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="file-actions">
                          <button className="btn-icon" onClick={() => previewFile(file)} title="Decrypt & Preview">
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button className="btn-icon" onClick={() => downloadFile(file)} title="Decrypt & Download">
                            <i className="fa-solid fa-download"></i>
                          </button>
                          <button className="btn-icon danger" onClick={() => deleteFile(file.name, file.sha)} title="Delete Secure Asset">
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="files-footer">
                <span>{filteredFiles.length} item(s) found</span>
                <button
                  className="btn btn-small"
                  onClick={() => loadFilesList(currentMode, settings.ghUsername, settings.ghRepo, settings.ghToken)}
                >
                  <i className="fa-solid fa-arrows-rotate"></i> REFRESH
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* System log footer */}
        <footer className="system-footer">
          <div className="system-logs">
            <i className="fa-solid fa-terminal console-icon"></i>
            <span className="log-text" style={{ color: logColor }}>{logText}</span>
          </div>
          <div className="system-time">{systemTime}</div>
        </footer>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fa-solid fa-gears"></i> SYSTEM INITIALIZATION OPTIONS</h2>
              <button className="btn-close" onClick={() => setIsSettingsOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">Configure your remote GitHub repository for persistent 24/7 cloud sync. Telemetry data and files will sync automatically using these parameters.</p>
              
              <form onSubmit={handleSettingsSubmit}>
                <div className="form-group">
                  <label htmlFor="input-gh-username">GitHub Username / Organization</label>
                  <input
                    type="text"
                    id="input-gh-username"
                    required
                    value={settings.ghUsername}
                    onChange={(e) => setSettings({ ...settings, ghUsername: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="input-gh-repo">Repository Name</label>
                  <input
                    type="text"
                    id="input-gh-repo"
                    required
                    value={settings.ghRepo}
                    onChange={(e) => setSettings({ ...settings, ghRepo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="input-gh-token">GitHub Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    id="input-gh-token"
                    placeholder="gho_************************************"
                    value={settings.ghToken}
                    onChange={(e) => setSettings({ ...settings, ghToken: e.target.value })}
                  />
                  <span className="form-help">Token will be stored securely inside your browser's LocalStorage and will never be committed to Git.</span>
                </div>
                <div className="form-group">
                  <label htmlFor="select-mode-preference">Server Mode Preference</label>
                  <select
                    id="select-mode-preference"
                    value={settings.modePreference}
                    onChange={(e) => setSettings({ ...settings, modePreference: e.target.value })}
                  >
                    <option value="auto">Auto-detect (Recommended)</option>
                    <option value="cloud">Cloud-Only Mode (GitHub API)</option>
                    <option value="local">Local-Only Mode (Express Server)</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={resetSettings}>RESET DEFAULT</button>
                  <button type="submit" className="btn btn-primary">SAVE CONFIGURATION</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="modal-overlay" onClick={() => setIsPreviewOpen(false)}>
          <div className="modal-content preview-content-card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{previewFileState ? (previewFileState.name.endsWith('.enc') ? previewFileState.name.slice(0, -4) : previewFileState.name) : 'Preview'}</h2>
              <button className="btn-close" onClick={() => setIsPreviewOpen(false)}>&times;</button>
            </div>
            <div className="modal-body preview-body" style={{ background: '#020408', display: 'flex', flex: 1, padding: 0 }}>
              {previewLoading ? (
                <div className="loading-state">
                  <i className="fa-solid fa-spinner fa-spin loading-icon"></i>
                  <p>Decrypting data stream...</p>
                </div>
              ) : previewError ? (
                <div className="empty-state">
                  <i className="fa-solid fa-triangle-exclamation empty-icon" style={{ color: 'var(--color-error)' }}></i>
                  <p>Decryption Failure</p>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{previewError}. Your passcode might be invalid.</span>
                </div>
              ) : previewText ? (
                <pre className="preview-text">{previewText}</pre>
              ) : (
                (() => {
                  const cleanName = previewFileState ? (previewFileState.name.endsWith('.enc') ? previewFileState.name.slice(0, -4) : previewFileState.name) : '';
                  const ext = cleanName.split('.').pop().toLowerCase();
                  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
                    return <img src={previewUrl} className="preview-img" alt="Lunar Decrypted Specimen" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', margin: 'auto' }} />;
                  } else if (ext === 'pdf') {
                    return <iframe src={previewUrl} className="preview-iframe" style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}></iframe>;
                  } else {
                    return (
                      <div className="empty-state">
                        <i className="fa-solid fa-file-circle-question empty-icon"></i>
                        <p>Preview unsupported</p>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>This format cannot be rendered in this view.</span>
                        <button className="btn btn-primary btn-small" onClick={() => downloadFile(previewFileState)}><i className="fa-solid fa-download"></i> Decrypt & Download</button>
                      </div>
                    );
                  }
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
