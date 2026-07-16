/* ==========================================================================
   CHANDRAYAAN 4.0 - APPLICATION CONTROLLER
   ========================================================================== */

// Default credentials pre-populated from system detection
const DEFAULTS = {
  ghUsername: 'sahasanchayan44-tech',
  ghRepo: 'chandrayaan-4.0',
  ghToken: '', // Cleared to prevent commit detection. Loaded dynamically via API or localStorage.
  mode: 'auto' // 'auto', 'local', 'cloud'
};

// Application State
const state = {
  currentMode: 'local', // 'local' or 'cloud'
  github: {
    username: localStorage.getItem('cy4_gh_username') || DEFAULTS.ghUsername,
    repo: localStorage.getItem('cy4_gh_repo') || DEFAULTS.ghRepo,
    token: localStorage.getItem('cy4_gh_token') || DEFAULTS.ghToken,
  },
  modePreference: localStorage.getItem('cy4_mode_pref') || DEFAULTS.mode,
  files: [],
  filteredFiles: [],
  telemetryInterval: null,
  mapAnimationId: null
};

// Initialize app-wide localStorage defaults on first run
if (!localStorage.getItem('cy4_gh_username')) localStorage.setItem('cy4_gh_username', DEFAULTS.ghUsername);
if (!localStorage.getItem('cy4_gh_repo')) localStorage.setItem('cy4_gh_repo', DEFAULTS.ghRepo);
if (!localStorage.getItem('cy4_gh_token')) localStorage.setItem('cy4_gh_token', DEFAULTS.ghToken);
if (!localStorage.getItem('cy4_mode_pref')) localStorage.setItem('cy4_mode_pref', DEFAULTS.mode);

// DOM Elements
const elements = {
  starfield: document.getElementById('starfield'),
  statusServerMode: document.getElementById('status-server-mode'),
  statusModeLabel: document.getElementById('status-mode-label'),
  statusSync: document.getElementById('status-sync'),
  linkGithubRepo: document.getElementById('link-github-repo'),
  
  // Passcode Lock elements
  lockScreen: document.getElementById('lock-screen'),
  lockCard: document.getElementById('lock-card'),
  lockForm: document.getElementById('lock-form'),
  inputPasscode: document.getElementById('input-passcode'),
  lockErrorMsg: document.getElementById('lock-error-msg'),

  // Telemetry
  valLatLong: document.getElementById('val-lat-long'),
  valBattery: document.getElementById('val-battery'),
  batteryLevelBar: document.getElementById('battery-level-bar'),
  valTemp: document.getElementById('val-temp'),
  valWater: document.getElementById('val-water'),
  telemetryConnBadge: document.getElementById('telemetry-conn-badge'),

  // Map
  lunarCanvas: document.getElementById('lunar-canvas'),
  btnMapReset: document.getElementById('btn-map-reset'),
  btnMapPlay: document.getElementById('btn-map-play'),
  mapPathStatus: document.getElementById('map-path-status'),

  // Uploader
  dropZone: document.getElementById('drop-zone'),
  fileInput: document.getElementById('file-input'),
  uploadProgressContainer: document.getElementById('upload-progress-container'),
  uploadingFilename: document.getElementById('uploading-filename'),
  uploadProgressBar: document.getElementById('upload-progress-bar'),
  uploadPercentage: document.getElementById('upload-percentage'),
  uploadIcon: document.getElementById('upload-icon-element'),

  // Files
  filesList: document.getElementById('files-list'),
  searchFiles: document.getElementById('search-files'),
  filesCount: document.getElementById('files-count'),
  btnRefreshFiles: document.getElementById('btn-refresh-files'),

  // Footer Logs
  logText: document.getElementById('log-text'),
  systemTime: document.getElementById('system-time'),

  // Modals
  settingsModal: document.getElementById('settings-modal'),
  btnOpenSettings: document.getElementById('btn-open-settings'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  settingsForm: document.getElementById('settings-form'),
  inputGhUsername: document.getElementById('input-gh-username'),
  inputGhRepo: document.getElementById('input-gh-repo'),
  inputGhToken: document.getElementById('input-gh-token'),
  btnToggleToken: document.getElementById('btn-toggle-token'),
  btnResetSettings: document.getElementById('btn-reset-settings'),
  selectModePreference: document.getElementById('select-mode-preference'),

  previewModal: document.getElementById('preview-modal'),
  previewTitle: document.getElementById('preview-title'),
  previewBody: document.getElementById('preview-body'),
  btnClosePreview: document.getElementById('btn-close-preview')
};

// ==========================================================================
// SYSTEM LOGGING
// ==========================================================================
function writeLog(message, isError = false) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
  elements.logText.textContent = message;
  
  if (isError) {
    elements.logText.style.color = 'var(--color-error)';
  } else {
    elements.logText.style.color = '';
  }
}

// Update clock
function updateSystemTime() {
  const now = new Date();
  elements.systemTime.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}
setInterval(updateSystemTime, 1000);
updateSystemTime();

// ==========================================================================
// ENVIRONMENT / MODE CONTROLLER
// ==========================================================================
function determineMode() {
  const host = window.location.hostname;
  const pref = state.modePreference;

  if (pref === 'local') {
    state.currentMode = 'local';
  } else if (pref === 'cloud') {
    state.currentMode = 'cloud';
  } else {
    // Auto mode: If hosted on GitHub pages or another web hosting, default to cloud.
    // If running on localhost or local IP, default to local.
    if (host === 'localhost' || host === '127.0.0.1' || host === '' || host.startsWith('192.168.')) {
      state.currentMode = 'local';
    } else {
      state.currentMode = 'cloud';
    }
  }

  // Update UI indicators
  if (state.currentMode === 'local') {
    elements.statusServerMode.className = 'status-indicator online';
    elements.statusModeLabel.textContent = 'LOCAL EXPRESS MODE';
    elements.statusSync.innerHTML = '<span class="pulse-dot"></span>LOCAL STORAGE ACTIVE';
    writeLog('Switched to Local mode. Interfacing with local node server APIs.');
  } else {
    elements.statusServerMode.className = 'status-indicator online';
    elements.statusServerMode.style.borderColor = 'rgba(185, 39, 252, 0.2)';
    elements.statusServerMode.style.color = 'var(--color-accent)';
    elements.statusModeLabel.textContent = 'CLOUD SYNC ACTIVE';
    elements.statusSync.innerHTML = '<span class="pulse-dot"></span>CONNECTIVITY: CLOUD CDN';
    writeLog(`Switched to Cloud mode. Fetching repository data from GitHub: ${state.github.username}/${state.github.repo}`);
  }

  // Update navbar repo link URL
  elements.linkGithubRepo.href = `https://github.com/${state.github.username}/${state.github.repo}`;
}

// ==========================================================================
// TELEMETRY SIMULATOR
// ==========================================================================
function startTelemetrySimulation() {
  if (state.telemetryInterval) clearInterval(state.telemetryInterval);
  
  let battery = 98;
  let temp = -10;
  let water = 4.82;
  
  state.telemetryInterval = setInterval(() => {
    // Generate minor fluctuations
    battery = Math.max(20, Math.min(100, battery - (Math.random() > 0.85 ? 1 : 0)));
    temp = temp + Math.floor(Math.random() * 3) - 1;
    water = Math.max(0.1, Math.min(30, water + (Math.random() * 0.1 - 0.05)));
    
    // Update elements
    elements.valBattery.textContent = `${battery}%`;
    elements.batteryLevelBar.style.width = `${battery}%`;
    elements.valTemp.textContent = `${temp}°C`;
    elements.valWater.textContent = `${water.toFixed(2)}%`;
    
    // Random signal fluctuation
    const sig = (95 + Math.random() * 5).toFixed(1);
    elements.telemetryConnBadge.textContent = `CONNECTIVITY: ${sig}%`;
  }, 4000);
}

// ==========================================================================
// FILE TYPE FORMATTING HELPERS
// ==========================================================================
function getFileIconClass(filename) {
  const ext = filename.split('.').pop().toLowerCase();
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

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ==========================================================================
// API INTEGRATION (GET, UPLOAD, DELETE)
// ==========================================================================

// Fetch files from whichever storage is currently active
async function loadFilesList() {
  renderLoadingState();
  writeLog('Refreshing file inventory from server...');
  
  try {
    if (state.currentMode === 'local') {
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      state.files = await response.json();
    } else {
      // Fetch via GitHub Contents API
      const url = `https://api.github.com/repos/${state.github.username}/${state.github.repo}/contents/chandrayaan`;
      const headers = {};
      if (state.github.token) {
        headers['Authorization'] = `token ${state.github.token}`;
      }
      
      const response = await fetch(url, { headers });
      if (response.status === 404) {
        // Folder or repo not initialized
        writeLog('GitHub directory "chandrayaan" not found. Ready for first file commit.', true);
        state.files = [];
      } else if (!response.ok) {
        throw new Error(`GitHub API error! status: ${response.status}`);
      } else {
        const githubContents = await response.json();
        // Standardize output format
        state.files = githubContents
          .filter(item => item.type === 'file')
          .map(item => ({
            name: item.name,
            size: item.size,
            mtime: new Date(), // GitHub API contents doesn't return mtime in directory list, default to now
            url: item.download_url,
            sha: item.sha,
            gitUrl: item.url // raw contents API URL
          }));
      }
    }
    
    applyFilterAndRender();
    writeLog(`Successfully loaded ${state.files.length} data files.`);
  } catch (error) {
    writeLog(`Failed to fetch file inventory: ${error.message}`, true);
    renderErrorState(error.message);
  }
}

// Upload file
async function uploadFile(file) {
  elements.uploadProgressContainer.style.display = 'block';
  elements.uploadingFilename.textContent = `Transmitting: ${file.name}`;
  elements.uploadProgressBar.style.width = '0%';
  elements.uploadPercentage.textContent = '0%';
  elements.uploadIcon.className = 'fa-solid fa-satellite-dish upload-icon fa-pulse';
  
  writeLog(`Starting secure transmission of: ${file.name}`);

  try {
    if (state.currentMode === 'local') {
      // Local Mode: Standard form-data upload to local endpoint
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          elements.uploadProgressBar.style.width = `${percent}%`;
          elements.uploadPercentage.textContent = `${percent}%`;
        }
      };
      
      xhr.onload = async () => {
        elements.uploadIcon.className = 'fa-solid fa-satellite-dish upload-icon';
        if (xhr.status >= 200 && xhr.status < 300) {
          writeLog(`Successfully stored ${file.name} locally.`);
          elements.uploadProgressContainer.style.display = 'none';
          await loadFilesList();
        } else {
          const response = JSON.parse(xhr.responseText || '{}');
          throw new Error(response.error || 'Server rejected file upload');
        }
      };
      
      xhr.onerror = () => {
        elements.uploadIcon.className = 'fa-solid fa-satellite-dish upload-icon';
        throw new Error('Network error during upload');
      };
      
      xhr.send(formData);
      
    } else {
      // Cloud Mode: GitHub API Base64 file upload
      if (!state.github.token) {
        throw new Error('GitHub API token required for cloud uploads. Click CONFIG to set one.');
      }
      
      // Read file as Base64
      const reader = new FileReader();
      
      // Mock progress since FileReader isn't async chunked natively in a single call, 
      // but we can animate the progress bar
      let progress = 0;
      const progressTimer = setInterval(() => {
        progress = Math.min(90, progress + 15);
        elements.uploadProgressBar.style.width = `${progress}%`;
        elements.uploadPercentage.textContent = `${progress}%`;
      }, 150);

      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const url = `https://api.github.com/repos/${state.github.username}/${state.github.repo}/contents/chandrayaan/${encodeURIComponent(file.name)}`;
          
          // Check if file exists to get its SHA for update
          let sha = null;
          const existingFile = state.files.find(f => f.name === file.name);
          if (existingFile) {
            sha = existingFile.sha;
          }
          
          const payload = {
            message: `Upload ${file.name} via Chandrayaan 4.0 Control Dashboard`,
            content: base64Data
          };
          if (sha) payload.sha = sha;
          
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${state.github.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          
          clearInterval(progressTimer);
          
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'GitHub API upload failed');
          }
          
          elements.uploadProgressBar.style.width = '100%';
          elements.uploadPercentage.textContent = '100%';
          writeLog(`Successfully uploaded ${file.name} to GitHub cloud repository.`);
          
          setTimeout(async () => {
            elements.uploadIcon.className = 'fa-solid fa-satellite-dish upload-icon';
            elements.uploadProgressContainer.style.display = 'none';
            await loadFilesList();
          }, 800);
          
        } catch (err) {
          clearInterval(progressTimer);
          elements.uploadIcon.className = 'fa-solid fa-satellite-dish upload-icon';
          elements.uploadProgressContainer.style.display = 'none';
          writeLog(`Upload failed: ${err.message}`, true);
          alert(`Upload error: ${err.message}`);
        }
      };
      
      reader.onerror = () => {
        clearInterval(progressTimer);
        elements.uploadIcon.className = 'fa-solid fa-satellite-dish upload-icon';
        elements.uploadProgressContainer.style.display = 'none';
        writeLog('Error reading local file contents.', true);
      };
      
      reader.readAsDataURL(file);
    }
  } catch (error) {
    elements.uploadIcon.className = 'fa-solid fa-satellite-dish upload-icon';
    elements.uploadProgressContainer.style.display = 'none';
    writeLog(`Upload failed: ${error.message}`, true);
    alert(`Upload error: ${error.message}`);
  }
}

// Delete file
async function deleteFile(filename, sha) {
  if (!confirm(`Are you sure you want to delete "${filename}" from the mission repository?`)) return;
  
  writeLog(`Initiating delete request for: ${filename}`);
  
  try {
    if (state.currentMode === 'local') {
      const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Server error deleting file');
      }
    } else {
      if (!state.github.token) {
        throw new Error('GitHub API token is required. Click CONFIG to set one.');
      }
      
      const url = `https://api.github.com/repos/${state.github.username}/${state.github.repo}/contents/chandrayaan/${encodeURIComponent(filename)}`;
      const payload = {
        message: `Delete ${filename} via Chandrayaan 4.0 Control Dashboard`,
        sha: sha
      };
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${state.github.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'GitHub API deletion failed');
      }
    }
    
    writeLog(`Successfully deleted: ${filename}`);
    await loadFilesList();
  } catch (error) {
    writeLog(`Deletion failed: ${error.message}`, true);
    alert(`Error deleting file: ${error.message}`);
  }
}

// ==========================================================================
// RENDER & FILTER FUNCTIONS
// ==========================================================================

function renderLoadingState() {
  elements.filesList.innerHTML = `
    <div class="loading-state">
      <i class="fa-solid fa-circle-notch fa-spin loading-icon"></i>
      <p>Syncing files with ${state.currentMode === 'local' ? 'local host' : 'GitHub remote'}...</p>
    </div>
  `;
}

function renderErrorState(message) {
  elements.filesList.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-triangle-exclamation empty-icon" style="color: var(--color-error);"></i>
      <p>Telemetry sync failure</p>
      <span style="font-size:0.75rem; color:#64748b;">${message}</span>
      <button class="btn btn-secondary btn-small" onclick="loadFilesList()" style="margin-top: 1rem;">
        <i class="fa-solid fa-rotate"></i> Retry Connection
      </button>
    </div>
  `;
}

function applyFilterAndRender() {
  const query = elements.searchFiles.value.trim().toLowerCase();
  
  if (query) {
    state.filteredFiles = state.files.filter(file => file.name.toLowerCase().includes(query));
  } else {
    state.filteredFiles = [...state.files];
  }
  
  renderFiles();
}

function renderFiles() {
  elements.filesCount.textContent = `${state.filteredFiles.length} item(s) found`;
  
  if (state.filteredFiles.length === 0) {
    elements.filesList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-folder-open empty-icon"></i>
        <p>No mission files found</p>
        <span style="font-size:0.75rem; color:#64748b;">Repository is empty or files were filtered out.</span>
      </div>
    `;
    return;
  }
  
  elements.filesList.innerHTML = '';
  
  state.filteredFiles.forEach(file => {
    const row = document.createElement('div');
    row.className = 'file-item';
    
    const iconClass = getFileIconClass(file.name);
    const displaySize = formatBytes(file.size);
    
    row.innerHTML = `
      <div class="file-details">
        <div class="file-icon-wrapper">
          <i class="${iconClass}"></i>
        </div>
        <div class="file-meta">
          <span class="file-name" title="${file.name}">${file.name}</span>
          <span class="file-size-date">${displaySize}</span>
        </div>
      </div>
      <div class="file-actions">
        <button class="btn-icon btn-view" title="Preview File"><i class="fa-solid fa-eye"></i></button>
        <a href="${file.url}" download="${file.name}" class="btn-icon btn-download" title="Download File" target="_blank"><i class="fa-solid fa-download"></i></a>
        <button class="btn-icon danger btn-delete" title="Delete File"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `;
    
    // Bind Event Listeners
    row.querySelector('.btn-view').addEventListener('click', () => previewFile(file));
    row.querySelector('.btn-delete').addEventListener('click', () => deleteFile(file.name, file.sha));
    
    elements.filesList.appendChild(row);
  });
}

// Preview File
function previewFile(file) {
  elements.previewTitle.textContent = file.name;
  elements.previewBody.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin loading-icon"></i><p>Loading document stream...</p></div>';
  elements.previewModal.style.display = 'flex';
  
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (state.currentMode === 'local') {
    // Local endpoints serve files directly
    const localUrl = `/chandrayaan/${encodeURIComponent(file.name)}`;
    displayPreviewContent(localUrl, ext);
  } else {
    // Cloud endpoints serve from raw URL (already provided in file.url)
    displayPreviewContent(file.url, ext);
  }
}

function displayPreviewContent(url, ext) {
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
    elements.previewBody.innerHTML = `<img src="${url}" class="preview-img" alt="Lunar Specimen Image">`;
  } else if (ext === 'pdf') {
    // For PDFs, render inside iframe if supported, else link
    elements.previewBody.innerHTML = `<iframe src="${url}" class="preview-iframe"></iframe>`;
  } else if (['txt', 'json', 'js', 'css', 'html', 'md', 'csv'].includes(ext)) {
    // Fetch content to show as raw text
    fetch(url)
      .then(res => res.text())
      .then(text => {
        elements.previewBody.innerHTML = `<pre class="preview-text">${escapeHtml(text)}</pre>`;
      })
      .catch(err => {
        elements.previewBody.innerHTML = `<div class="empty-state"><i class="fa-solid fa-exclamation-triangle" style="color:var(--color-error);"></i><p>Failed to stream text: ${err.message}</p></div>`;
      });
  } else {
    elements.previewBody.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-file-circle-question empty-icon"></i>
        <p>Preview unsupported</p>
        <span style="font-size:0.75rem; color:#64748b; margin-bottom:1rem;">This file format cannot be rendered inside the console.</span>
        <a href="${url}" download class="btn btn-primary btn-small"><i class="fa-solid fa-download"></i> Download to View</a>
      </div>
    `;
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================================================
// INTERACTIVE LUNAR CANVAS MAP
// ==========================================================================
const checkpoints = [
  { name: 'Lander Zone (Shackleton)', x: 100, y: 150, color: 'var(--color-primary)' },
  { name: 'Ridge Alpha (Slope Sensor)', x: 220, y: 80, color: 'var(--color-secondary)' },
  { name: 'Water Ice Site (Shadowed Rim)', x: 380, y: 220, color: '#00ff87' },
  { name: 'Lunar Hopper (Deploy Zone)', x: 500, y: 110, color: 'var(--color-accent)' },
];

let roverPos = { ...checkpoints[0] };
let pathProgress = 0;
let isSimulating = false;
let mapScale = 1;

function initMapCanvas() {
  const canvas = elements.lunarCanvas;
  const ctx = canvas.getContext('2d');
  
  // Set resolution based on bounds
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width || 600;
  canvas.height = rect.height || 300;
  
  drawMap();
}

function drawMap() {
  const canvas = elements.lunarCanvas;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const w = canvas.width;
  const h = canvas.height;
  
  // Clear
  ctx.fillStyle = '#02040a';
  ctx.fillRect(0, 0, w, h);
  
  // Draw Coordinate Grid Lines (Space theme)
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  
  // Draw simulated topographic crater contour lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1.5;
  
  // Crater 1
  ctx.beginPath();
  ctx.arc(w * 0.35, h * 0.4, 80, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w * 0.35, h * 0.4, 45, 0, Math.PI * 2);
  ctx.stroke();

  // Crater 2 (Shadowed Water Crater)
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
  ctx.fillStyle = 'rgba(0, 242, 254, 0.015)';
  ctx.beginPath();
  ctx.arc(w * 0.7, h * 0.65, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w * 0.7, h * 0.65, 70, 0, Math.PI * 2);
  ctx.stroke();

  // Scale positions according to canvas sizes
  const scaleX = w / 600;
  const scaleY = h / 300;
  
  // Draw Planned Mission Path (Dashed glowing line)
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(checkpoints[0].x * scaleX, checkpoints[0].y * scaleY);
  for (let i = 1; i < checkpoints.length; i++) {
    ctx.lineTo(checkpoints[i].x * scaleX, checkpoints[i].y * scaleY);
  }
  ctx.stroke();
  ctx.setLineDash([]); // Reset
  
  // Draw Checkpoints
  checkpoints.forEach(cp => {
    const cx = cp.x * scaleX;
    const cy = cp.y * scaleY;
    
    // Glow ring
    ctx.fillStyle = 'rgba(0, 242, 254, 0.05)';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Core dot
    ctx.fillStyle = cp.color;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Text label
    ctx.fillStyle = '#64748b';
    ctx.font = '9px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(cp.name.split(' (')[0], cx, cy - 14);
  });
  
  // Draw Rover Position
  const rx = roverPos.x * scaleX;
  const ry = roverPos.y * scaleY;
  
  // Pulse animation ring around Rover
  const pulseRadius = 12 + Math.sin(Date.now() / 200) * 3;
  ctx.strokeStyle = 'rgba(0, 255, 135, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(rx, ry, pulseRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Rover Core Icon
  ctx.fillStyle = '#00ff87';
  ctx.beginPath();
  ctx.arc(rx, ry, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Crosshair
  ctx.strokeStyle = '#00ff87';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rx - 12, ry); ctx.lineTo(rx + 12, ry);
  ctx.moveTo(rx, ry - 12); ctx.lineTo(rx, ry + 12);
  ctx.stroke();
  
  if (isSimulating) {
    requestAnimationFrame(drawMap);
  }
}

// Simulate Rover moving along path
function runRoverSimulation() {
  if (isSimulating) return;
  isSimulating = true;
  pathProgress = 0;
  elements.btnMapPlay.disabled = true;
  elements.btnMapPlay.style.opacity = '0.5';
  elements.mapPathStatus.textContent = 'Simulating traverse...';
  
  writeLog('Rover motor drivers engaged. Dynamic Path Simulation initiated.');
  
  let segment = 0;
  const speed = 0.008; // speed coefficient
  
  function step() {
    if (!isSimulating) return;
    
    pathProgress += speed;
    
    if (pathProgress >= 1) {
      pathProgress = 0;
      segment++;
    }
    
    if (segment >= checkpoints.length - 1) {
      // Completed path
      roverPos = { ...checkpoints[checkpoints.length - 1] };
      isSimulating = false;
      elements.btnMapPlay.disabled = false;
      elements.btnMapPlay.style.opacity = '';
      elements.mapPathStatus.textContent = 'Completed Traverse';
      writeLog('Rover reached terminal checkpoint: Deploy Zone. Ice spectrometer scan locked.');
      drawMap(); // Draw one final static frame
      return;
    }
    
    const start = checkpoints[segment];
    const end = checkpoints[segment + 1];
    
    // Interpolate coordinates
    roverPos.x = start.x + (end.x - start.x) * pathProgress;
    roverPos.y = start.y + (end.y - start.y) * pathProgress;
    
    // Update live coordinates in telemetry
    const simulatedLat = (89.9 - (roverPos.y / 2000)).toFixed(4);
    const simulatedLong = (roverPos.x / 10).toFixed(4);
    elements.valLatLong.textContent = `${simulatedLat}°S, ${simulatedLong}°E`;
    
    requestAnimationFrame(step);
  }
  
  // Start animation loop
  drawMap();
  step();
}

function resetRoverPosition() {
  isSimulating = false;
  roverPos = { ...checkpoints[0] };
  elements.btnMapPlay.disabled = false;
  elements.btnMapPlay.style.opacity = '';
  elements.mapPathStatus.textContent = 'Ready for simulation';
  elements.valLatLong.textContent = '89.9°S, 0.0°E';
  writeLog('Rover coordinates reset to default Lander Zone (Shackleton).');
  drawMap();
}

// ==========================================================================
// DRAG & DROP / FILE EVENTS
// ==========================================================================
function setupFileEvents() {
  const dropZone = elements.dropZone;
  
  // Prevent browser default file open behavior
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });
  
  // Visual dropzone state changes
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
  });
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
  });
  
  // Handle dropped files
  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFilesSelection(files);
  });
  
  // Browse button click triggers input
  dropZone.addEventListener('click', () => {
    elements.fileInput.click();
  });
  
  elements.fileInput.addEventListener('change', (e) => {
    handleFilesSelection(e.target.files);
  });
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleFilesSelection(filesList) {
  if (filesList.length === 0) return;
  
  // Sequentially upload each file (or select first one)
  // For simplicity, we loop and upload
  Array.from(filesList).forEach(file => {
    uploadFile(file);
  });
}

// ==========================================================================
// CONFIGURATION MODAL CONTROLLER
// ==========================================================================
function setupSettingsEvents() {
  elements.btnOpenSettings.addEventListener('click', () => {
    // Fill settings inputs with current state
    elements.inputGhUsername.value = state.github.username;
    elements.inputGhRepo.value = state.github.repo;
    elements.inputGhToken.value = state.github.token;
    elements.selectModePreference.value = state.modePreference;
    elements.settingsModal.style.display = 'flex';
  });

  elements.btnCloseSettings.addEventListener('click', () => {
    elements.settingsModal.style.display = 'none';
  });

  // Toggle visible token characters
  elements.btnToggleToken.addEventListener('click', () => {
    const type = elements.inputGhToken.type === 'password' ? 'text' : 'password';
    elements.inputGhToken.type = type;
    const icon = elements.btnToggleToken.querySelector('i');
    if (type === 'text') {
      icon.className = 'fa-solid fa-eye-slash';
    } else {
      icon.className = 'fa-solid fa-eye';
    }
  });

  elements.btnResetSettings.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset configuration values to system defaults?')) {
      elements.inputGhUsername.value = DEFAULTS.ghUsername;
      elements.inputGhRepo.value = DEFAULTS.ghRepo;
      elements.inputGhToken.value = DEFAULTS.ghToken;
      elements.selectModePreference.value = DEFAULTS.mode;
    }
  });

  elements.settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Save to local storage
    const newUsername = elements.inputGhUsername.value.trim();
    const newRepo = elements.inputGhRepo.value.trim();
    const newToken = elements.inputGhToken.value.trim();
    const newPref = elements.selectModePreference.value;

    localStorage.setItem('cy4_gh_username', newUsername);
    localStorage.setItem('cy4_gh_repo', newRepo);
    localStorage.setItem('cy4_gh_token', newToken);
    localStorage.setItem('cy4_mode_pref', newPref);

    // Update state
    state.github.username = newUsername;
    state.github.repo = newRepo;
    state.github.token = newToken;
    state.modePreference = newPref;

    elements.settingsModal.style.display = 'none';
    writeLog('Configuration settings updated and saved.');
    
    // Re-determine mode and reload files
    determineMode();
    loadFilesList();
  });
}

// Close preview modal
elements.btnClosePreview.addEventListener('click', () => {
  elements.previewModal.style.display = 'none';
  elements.previewBody.innerHTML = '';
});

// Search filter binding
elements.searchFiles.addEventListener('input', applyFilterAndRender);

// Refresh button binding
elements.btnRefreshFiles.addEventListener('click', loadFilesList);

// Map simulation controls
elements.btnMapPlay.addEventListener('click', runRoverSimulation);
elements.btnMapReset.addEventListener('click', resetRoverPosition);

// Canvas resize listener
window.addEventListener('resize', () => {
  initMapCanvas();
});

// Close modals when clicking overlay
window.addEventListener('click', (e) => {
  if (e.target === elements.settingsModal) {
    elements.settingsModal.style.display = 'none';
  }
  if (e.target === elements.previewModal) {
    elements.previewModal.style.display = 'none';
    elements.previewBody.innerHTML = '';
  }
});

// ==========================================================================
// SECURITY & PASSCODE PROTECTION
// ==========================================================================
const PASSCODE_HASH = 'a7a6fa669b0521b31f653dcb345091a123132025d1e2ae651b5fdec459478fe0'; // SHA-256 of 'ISRO-2026'

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Fetch local config if running on localhost
async function fetchLocalConfig() {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '') {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const config = await response.json();
        if (config.ghToken) {
          localStorage.setItem('cy4_gh_token', config.ghToken);
          state.github.token = config.ghToken;
        }
        if (config.ghUsername) {
          localStorage.setItem('cy4_gh_username', config.ghUsername);
          state.github.username = config.ghUsername;
        }
        if (config.ghRepo) {
          localStorage.setItem('cy4_gh_repo', config.ghRepo);
          state.github.repo = config.ghRepo;
        }
        writeLog('Auto-loaded cloud configuration credentials from local server.');
      }
    } catch (e) {
      console.warn('Local config server not responding:', e);
    }
  }
}

// Setup lock screen logic
function setupLockScreen() {
  // Check if session is already authorized
  if (sessionStorage.getItem('cy4_authorized') === 'true') {
    elements.lockScreen.style.display = 'none';
    bootstrapApp();
    return;
  }

  // Display Lock Screen
  elements.lockScreen.style.display = 'flex';
  
  elements.lockForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const enteredPasscode = elements.inputPasscode.value;
    const hashedInput = await sha256(enteredPasscode);
    
    if (hashedInput === PASSCODE_HASH) {
      // Success
      sessionStorage.setItem('cy4_authorized', 'true');
      elements.lockScreen.style.display = 'none';
      writeLog('Security authorization accepted. Access granted.');
      bootstrapApp();
    } else {
      // Failure
      elements.lockErrorMsg.style.display = 'flex';
      elements.lockCard.classList.add('lock-card-shake');
      elements.inputPasscode.value = '';
      elements.inputPasscode.focus();
      
      setTimeout(() => {
        elements.lockCard.classList.remove('lock-card-shake');
      }, 500);
      
      writeLog('Failed login attempt. Intrusion alert triggered.', true);
    }
  });
}

async function bootstrapApp() {
  await fetchLocalConfig();
  determineMode();
  startTelemetrySimulation();
  initMapCanvas();
  loadFilesList();
  setupFileEvents();
  setupSettingsEvents();
  writeLog('System online. Dashboard fully connected.');
}

// ==========================================================================
// BOOTSTRAP INITIALIZATION
// ==========================================================================
function init() {
  setupLockScreen();
}

// Kickstart
document.addEventListener('DOMContentLoaded', init);

