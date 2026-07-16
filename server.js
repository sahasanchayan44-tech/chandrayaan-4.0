const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files from the root directory
app.use(express.static(__dirname));

// Helper: Parse the local .env file
function readEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          env[key] = value;
        }
      });
    } catch (e) {
      console.error('Error reading .env file:', e);
    }
  }
  return env;
}

// Ensure the 'chandrayaan' upload directory exists
const uploadDir = path.join(__dirname, 'chandrayaan');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve files inside 'chandrayaan' static folder for direct download/view
app.use('/chandrayaan', express.static(uploadDir));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname);
    cb(null, safeName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// API: Get config variables from .env
app.get('/api/config', (req, res) => {
  const env = readEnv();
  res.json({
    ghUsername: env.GITHUB_USERNAME || '',
    ghRepo: env.GITHUB_REPO || '',
    ghToken: env.GITHUB_TOKEN || ''
  });
});

// API: Get list of all files in the 'chandrayaan' directory
app.get('/api/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read directory' });
    }

    const fileList = files.map(file => {
      const filePath = path.join(uploadDir, file);
      let stats;
      try {
        stats = fs.statSync(filePath);
      } catch (e) {
        return null;
      }

      if (stats.isDirectory()) return null;

      return {
        name: file,
        size: stats.size,
        mtime: stats.mtime,
        url: `/chandrayaan/${encodeURIComponent(file)}`
      };
    }).filter(Boolean);

    res.json(fileList);
  });
});

// API: Upload a new file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    file: {
      name: req.file.filename,
      size: req.file.size,
      url: `/chandrayaan/${encodeURIComponent(req.file.filename)}`
    }
  });
});

// API: Delete a file
app.delete('/api/files/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete file' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

// Fallback to send index.html for any other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Chandrayaan 4.0 Server running locally at http://localhost:${PORT}`);
});
