const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, writeBatch } = require('firebase/firestore');

function parseEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
      }
    }
  });
  return env;
}

const SEED_DATA = {
  component_properties: [
    { id: 'lunar-hopper', uuid: 'CY4-LUNAR-HOPPER-8731', material: 'Al-Li & Carbon Composite', mass: '450.0 kg', density: '3.15 g/cm³', volume: '142.8 L', dimensions: '1500 x 1500 x 1200 mm', temperature: '-180°C / +120°C', power: '120W (Gen)', manufacturer: 'ISRO VSSC Division', revision: 'v1.2.0', status: 'Nominal', health: 100, notes: 'Integrated Vikram hopper assembly unit.' },
    { id: 'main-chassis', uuid: 'CY4-MAIN-CHASSIS-4912', material: 'Carbon-Composite Core', mass: '42.5 kg', density: '1.60 g/cm³', volume: '26.5 L', dimensions: '1200 x 1200 x 850 mm', temperature: '-180°C / +150°C', power: 'N/A', manufacturer: 'ISRO Structures Division', revision: 'v1.0.4', status: 'Nominal', health: 99, notes: 'Load-bearing composite structural panel.' },
    { id: 'landing-legs', uuid: 'CY4-LANDING-LEGS-3911', material: 'Titanium Gr.5 (Ti-6Al-4V)', mass: '14.8 kg', density: '4.43 g/cm³', volume: '3.34 L', dimensions: '950 x 240 x 120 mm', temperature: '-200°C / +120°C', power: 'N/A', manufacturer: 'ISRO Structures Division', revision: 'v1.0.2', status: 'Nominal', health: 100, notes: 'Quadruple shock-absorbing landing struts.' },
    { id: 'engine-assembly', uuid: 'CY4-ENGINE-ASSEMBLY-8291', material: 'Niobium Alloy C-103', mass: '24.2 kg', density: '8.57 g/cm³', volume: '2.82 L', dimensions: '450 x 450 x 650 mm', temperature: '-180°C / +450°C', power: '15W', manufacturer: 'ISRO LPSC Propulsion Division', revision: 'v1.1.0', status: 'Active', health: 98, notes: 'Central bipropellant acceleration engine.' },
    { id: 'thruster-1', uuid: 'CY4-THRUSTER-1-1029', material: 'Platinum-Rhodium Alloy', mass: '2.4 kg', density: '21.4 g/cm³', volume: '0.11 L', dimensions: '150 x 80 x 80 mm', temperature: '-180°C / +450°C', power: '5W', manufacturer: 'ISRO LPSC Division', revision: 'v1.0.1', status: 'Nominal', health: 98, notes: 'Attitude control thruster nozzle 1.' },
    { id: 'thruster-2', uuid: 'CY4-THRUSTER-2-1030', material: 'Platinum-Rhodium Alloy', mass: '2.4 kg', density: '21.4 g/cm³', volume: '0.11 L', dimensions: '150 x 80 x 80 mm', temperature: '-180°C / +450°C', power: '5W', manufacturer: 'ISRO LPSC Division', revision: 'v1.0.1', status: 'Nominal', health: 98, notes: 'Attitude control thruster nozzle 2.' },
    { id: 'fuel-valve', uuid: 'CY4-FUEL-VALVE-2910', material: 'Inconel 718 Superalloy', mass: '1.2 kg', density: '8.19 g/cm³', volume: '0.15 L', dimensions: '120 x 60 x 60 mm', temperature: '-120°C / +85°C', power: '8W', manufacturer: 'ISRO LPSC Division', revision: 'v1.0.3', status: 'Nominal', health: 100, notes: 'High-speed propellant governance valve.' },
    { id: 'nozzle', uuid: 'CY4-NOZZLE-8292', material: 'Silicon Carbide Matrix', mass: '3.8 kg', density: '3.21 g/cm³', volume: '1.18 L', dimensions: '300 x 300 x 400 mm', temperature: '-180°C / +600°C', power: 'N/A', manufacturer: 'ISRO LPSC Division', revision: 'v1.0.5', status: 'Nominal', health: 99, notes: 'Radiation cooled expansion nozzle.' },
    { id: 'fuel-tank', uuid: 'CY4-FUEL-TANK-9381', material: 'Titanium Gr.5 / Kevlar Overwrap', mass: '18.2 kg', density: '4.43 g/cm³', volume: '85.4 L', dimensions: '650 x 650 x 800 mm', temperature: '-15°C / +35°C', power: '2W (Heater)', manufacturer: 'ISRO LPSC Division', revision: 'v1.0.4', status: '85% Fill', health: 98, notes: 'Propellant fuel tank with multi-layer insulation.' },
    { id: 'battery-pack', uuid: 'CY4-BATTERY-PACK-8812', material: 'Solid-State Lithium-Sulfur', mass: '15.6 kg', density: '2.10 g/cm³', volume: '7.42 L', dimensions: '350 x 250 x 120 mm', temperature: '-20°C / +60°C', power: '28V output', manufacturer: 'ISRO URSC Division', revision: 'v1.2.2', status: '94% Charge', health: 100, notes: 'Primary high-density power storage bank.' },
    { id: 'solar-panels', uuid: 'CY4-SOLAR-PANELS-3819', material: 'GaAs Multi-junction Cells', mass: '8.4 kg', density: '5.32 g/cm³', volume: '1.58 L', dimensions: '1450 x 320 x 15 mm', temperature: '-120°C / +120°C', power: '120W (Gen)', manufacturer: 'ISRO URSC Division', revision: 'v1.1.2', status: 'Nominal', health: 100, notes: 'Deployable rigid solar panels.' },
    { id: 'camera', uuid: 'CY4-CAMERA-2918', material: 'Aluminum-Lithium / Optics Glass', mass: '1.8 kg', density: '2.70 g/cm³', volume: '0.67 L', dimensions: '110 x 90 x 80 mm', temperature: '-100°C / +80°C', power: '4W', manufacturer: 'ISRO LEOS Division', revision: 'v1.0.2', status: 'Nominal', health: 100, notes: 'Optical hazard avoidance landing camera.' },
    { id: 'imu', uuid: 'CY4-IMU-8391', material: 'Silicon MEMS / Aluminum', mass: '0.8 kg', density: '2.33 g/cm³', volume: '0.34 L', dimensions: '80 x 80 x 50 mm', temperature: '-40°C / +85°C', power: '3W', manufacturer: 'ISRO LEOS Division', revision: 'v1.0.1', status: 'Nominal', health: 99, notes: 'Central navigation inertial measurement unit.' },
    { id: 'star-tracker', uuid: 'CY4-STAR-TRACKER-3829', material: 'Titanium Shell / Baffled Optics', mass: '2.9 kg', density: '4.43 g/cm³', volume: '1.20 L', dimensions: '220 x 140 x 140 mm', temperature: '-80°C / +60°C', power: '6W', manufacturer: 'ISRO LEOS Division', revision: 'v1.0.4', status: 'Nominal', health: 100, notes: 'Stellar coordinates tracking camera.' },
    { id: 'radar', uuid: 'CY4-RADAR-2919', material: 'GaAs Transceiver / Aluminum', mass: '4.2 kg', density: '2.70 g/cm³', volume: '1.55 L', dimensions: '280 x 200 x 80 mm', temperature: '-100°C / +80°C', power: '18W', manufacturer: 'ISRO SAC Division', revision: 'v1.0.2', status: 'Nominal', health: 100, notes: 'Descent radar altitude terrain tracker.' },
    { id: 'lidar', uuid: 'CY4-LIDAR-8821', material: 'InGaAs Diode Laser / Titanium', mass: '5.4 kg', density: '4.43 g/cm³', volume: '2.14 L', dimensions: '300 x 180 x 120 mm', temperature: '-80°C / +70°C', power: '22W', manufacturer: 'ISRO SAC Division', revision: 'v1.1.0', status: 'Nominal', health: 99, notes: '3D topographic surface scanner.' },
    { id: 'thermal-shield', uuid: 'CY4-THERMAL-SHIELD-2917', material: 'Multi-layer Kapton & Mylar', mass: '6.8 kg', density: '1.42 g/cm³', volume: '4.78 L', dimensions: '1600 x 1600 x 25 mm', temperature: '-200°C / +250°C', power: 'N/A', manufacturer: 'ISRO VSSC Division', revision: 'v1.0.1', status: 'Nominal', health: 100, notes: 'Reflective insulation thermal barrier.' },
    { id: 'antenna', uuid: 'CY4-ANTENNA-3818', material: 'Carbon Composite Reflector', mass: '2.1 kg', density: '1.60 g/cm³', volume: '0.88 L', dimensions: '400 x 400 x 150 mm', temperature: '-180°C / +120°C', power: '5W (Transmit)', manufacturer: 'ISRO SAC Division', revision: 'v1.0.3', status: 'Nominal', health: 100, notes: 'High-gain S-band communication assembly.' },
    { id: 'avionics', uuid: 'CY4-AVIONICS-8811', material: 'Silicon / Polyimide Board', mass: '3.2 kg', density: '2.33 g/cm³', volume: '1.37 L', dimensions: '250 x 200 x 60 mm', temperature: '-40°C / +85°C', power: '25W', manufacturer: 'ISRO IISU Division', revision: 'v1.0.8', status: 'Nominal', health: 100, notes: 'Core flight computer running control loop.' },
    { id: 'payload-bay', uuid: 'CY4-PAYLOAD-BAY-9182', material: 'Aluminum-Lithium Truss', mass: '12.5 kg', density: '2.70 g/cm³', volume: '125.0 L', dimensions: '500 x 500 x 500 mm', temperature: '-100°C / +85°C', power: 'N/A', manufacturer: 'ISRO Structures Division', revision: 'v1.0.2', status: 'Nominal', health: 100, notes: 'Payload envelope housing scientific instruments.' }
  ],
  hopper_components: [
    { id: 'lunar-hopper', name: 'Lunar Hopper', icon: 'fa-solid fa-space-shuttle', level: 0, hasChildren: true, isExpanded: true, desc: 'Central Vikram lander integrated lunar hopping assembly unit.' },
    { id: 'main-chassis', name: 'Main Chassis', icon: 'fa-solid fa-square', level: 1, hasChildren: false, isExpanded: false, desc: 'Primary load-bearing carbon composite structural skeleton supporting payload bays and guidance mounting plates.' },
    { id: 'landing-legs', name: 'Landing Legs', icon: 'fa-solid fa-arrows-down-to-line', level: 1, hasChildren: false, isExpanded: false, desc: 'Quadruple shock-absorbing articulated legs designed with honeycomb landing pads for stable touching on soft lunar regolith.' },
    { id: 'engine-assembly', name: 'Engine Assembly', icon: 'fa-solid fa-dharmachakra', level: 1, hasChildren: true, isExpanded: true, desc: 'Central bipropellant propulsion system providing main acceleration vector and fine attitude vector controls.' },
    { id: 'thruster-1', name: 'Thruster 1', icon: 'fa-solid fa-fire', level: 2, parentId: 'engine-assembly', hasChildren: false, isExpanded: false, desc: 'High-impulse thruster node 1 configured for horizontal offset adjustments.' },
    { id: 'thruster-2', name: 'Thruster 2', icon: 'fa-solid fa-fire', level: 2, parentId: 'engine-assembly', hasChildren: false, isExpanded: false, desc: 'High-impulse thruster node 2 configured for pitch and roll adjustments.' },
    { id: 'fuel-valve', name: 'Fuel Valve', icon: 'fa-solid fa-toggle-on', level: 2, parentId: 'engine-assembly', hasChildren: false, isExpanded: false, desc: 'Micro-second control valve governing fluid input rates into combustion chambers.' },
    { id: 'nozzle', name: 'Nozzle', icon: 'fa-solid fa-wind', level: 2, parentId: 'engine-assembly', hasChildren: false, isExpanded: false, desc: 'High-expansion nozzle designed for vacuum thruster efficiency.' },
    { id: 'fuel-tank', name: 'Fuel Tank', icon: 'fa-solid fa-oil-can', level: 1, hasChildren: false, isExpanded: false, desc: 'Pressurised propellant cell insulated with multi-layer Mylar sheets.' },
    { id: 'battery-pack', name: 'Battery Pack', icon: 'fa-solid fa-battery-three-quarters', level: 1, hasChildren: false, isExpanded: false, desc: 'Solid-state Lithium-Sulfur high-density battery bank powering all telemetry.' },
    { id: 'solar-panels', name: 'Solar Panels', icon: 'fa-solid fa-solar-panel', level: 1, hasChildren: false, isExpanded: false, desc: 'Rigid deploying panels tracking solar elevation coordinates.' },
    { id: 'camera', name: 'Camera', icon: 'fa-solid fa-camera', level: 1, hasChildren: false, isExpanded: false, desc: 'Optical descent hazard camera generating height maps.' },
    { id: 'imu', name: 'IMU', icon: 'fa-solid fa-compass', level: 1, hasChildren: false, isExpanded: false, desc: 'Inertial Measurement Unit tracking pitch, yaw, and roll vectors.' },
    { id: 'star-tracker', name: 'Star Tracker', icon: 'fa-solid fa-star', level: 1, hasChildren: false, isExpanded: false, desc: 'Precision celestial tracking camera referencing stellar coordinates.' },
    { id: 'radar', name: 'Radar', icon: 'fa-solid fa-radio', level: 1, hasChildren: false, isExpanded: false, desc: 'Descent radar monitoring altitude terrain elevation.' },
    { id: 'lidar', name: 'LiDAR', icon: 'fa-solid fa-line-chart', level: 1, hasChildren: false, isExpanded: false, desc: 'Laser scanning altimeter building local 3D topographic slope models.' },
    { id: 'thermal-shield', name: 'Thermal Shield', icon: 'fa-solid fa-shield-halved', level: 1, hasChildren: false, isExpanded: false, desc: 'Reflective barrier protecting fuel cells from direct solar radiation.' },
    { id: 'antenna', name: 'Antenna', icon: 'fa-solid fa-tower-broadcast', level: 1, hasChildren: false, isExpanded: false, desc: 'High-gain S-band antenna communicating directly with Vikram Lander.' },
    { id: 'avionics', name: 'Avionics', icon: 'fa-solid fa-microchip', level: 1, hasChildren: false, isExpanded: false, desc: 'Central mission computer running AutoNav path planning algorithms.' },
    { id: 'payload-bay', name: 'Payload Bay', icon: 'fa-solid fa-box', level: 1, hasChildren: false, isExpanded: false, desc: 'Integrated payload section housing water ice core drill and spectrometers.' }
  ],
  hopper_materials: [
    { id: 'titanium-gr5', name: 'Titanium Gr.5 (Ti-6Al-4V)', density: '4.43 g/cm³', yieldStrength: '880 MPa', thermalLimit: '-196°C / +400°C', usage: 'Propellant tank cylinders and landing leg frames.' },
    { id: 'al-li-2195', name: 'Aluminum-Lithium 2195', density: '2.70 g/cm³', yieldStrength: '550 MPa', thermalLimit: '-253°C / +120°C', usage: 'Avionics housing chassis and secondary load bearing brackets.' },
    { id: 'carbon-composite', name: 'Carbon-Composite Core', density: '1.60 g/cm³', yieldStrength: '1200 MPa', thermalLimit: '-180°C / +150°C', usage: 'Main chassis structural panels and payload bay doors.' }
  ],
  hopper_simulations: [
    { id: 'low-hop', name: 'Low Altitude Hopper Hop', heightLimit: '50 m', duration: '45 sec', fuelFlowRate: '0.38 kg/sec', maxRange: '120 m' },
    { id: 'nominal-hop', name: 'Nominal Ballistic Jump', heightLimit: '150 m', duration: '90 sec', fuelFlowRate: '0.42 kg/sec', maxRange: '350 m' },
    { id: 'high-range-jump', name: 'Max Performance Escape', heightLimit: '300 m', duration: '145 sec', fuelFlowRate: '0.49 kg/sec', maxRange: '800 m' }
  ],
  hopper_models: [
    { id: 'v1', name: 'CY-HP-V1 Prototype Design', dryMass: '180 kg', wetMass: '320 kg', thrust: '400 N Mono-fuel', maxAltitude: '120 m', maxRange: '250 m', isp: '235s' },
    { id: 'v2', name: 'CY-HP-V2 Cold-Gas Auxiliary Design', dryMass: '210 kg', wetMass: '380 kg', thrust: '600 N Cold-Gas', maxAltitude: '80 m', maxRange: '180 m', isp: '120s' },
    { id: 'v3', name: 'CY-HP-V3 Bipropellant Heavy Design', dryMass: '250 kg', wetMass: '450 kg', thrust: '800 N Bipropellant', maxAltitude: '300 m', maxRange: '800 m', isp: '290s' }
  ],
  hopper_versions: [
    { id: 'V1', author: 'Dr. R. Keshav (Lead Propulsion)', date: '2026-04-12 09:15:32 UTC', message: 'Initial Vikram lander integrated CAD schema draft.', changeLog: 'Initialized Vikram lander interface geometry; Positioned fuel valve manifolds and structural composite brackets.', thrust: '400 N Mono-fuel', dryMass: '180 kg', wetMass: '320 kg', isp: '235s', maxAltitude: '120 m' },
    { id: 'V2', author: 'Sanchayan S. (Avionics Engineer)', date: '2026-07-16 14:22:10 UTC', message: 'Optimize landing legs joint tolerances.', changeLog: 'Adjusted leg hinge offset angles for lunar regolith impact; Upgraded battery core interface telemetry.', thrust: '600 N Cold-Gas', dryMass: '210 kg', wetMass: '380 kg', isp: '120s', maxAltitude: '80 m' },
    { id: 'V3', author: 'ISRO VSSC Team (Propulsion)', date: '2026-07-16 22:15:02 UTC', message: 'Configure dual bipropellant thruster limits.', changeLog: 'Upgraded Isp threshold to 290s; Re-calibrated fuel valve flow rate parameters.', thrust: '800 N Bipropellant', dryMass: '250 kg', wetMass: '450 kg', isp: '290s', maxAltitude: '300 m' },
    { id: 'V4', author: 'Sanchayan S. (Avionics Engineer)', date: '2026-07-17 00:53:10 UTC', message: 'Integrate real-time telemetry line charts.', changeLog: 'Added dynamic LineChart SVG visualization for all analysis tabs; Connected ComponentTree real-time Firestore listeners.', thrust: '600 N Hybrid', dryMass: '220 kg', wetMass: '410 kg', isp: '270s', maxAltitude: '200 m' }
  ],
  hopper_logs: [
    { id: 'log-1', timestamp: '22:15:02', system: 'AVIONICS', message: 'System diagnostic checklist initialized... OK.' },
    { id: 'log-2', timestamp: '22:15:10', system: 'PROPULSION', message: 'Engine fuel valves pressure calibration set to 320 bar.' },
    { id: 'log-3', timestamp: '22:15:15', system: 'POWER', message: 'Li-Sulfur thermal battery bank operational buffers stable.' }
  ],
  hopper_documents: [
    { id: 'doc-1', title: 'Hopper Design Deck v1.2', category: 'CAD Blueprint', filename: 'CY4_HOPPER_CAD_BLUEPRINT.pdf' },
    { id: 'doc-2', title: 'Vikram Telemetry Interface API', category: 'Software Specs', filename: 'CY4_VIKRAM_IFACE_API.pdf' }
  ],
  hopper_images: [
    { id: 'img-1', title: 'Landing Site Topography Map', path: 'crater_water_map.jpg.enc' },
    { id: 'img-2', title: 'Rover Structural Assembly', path: 'rover_schematic.jpg.enc' }
  ]
};

async function main() {
  const env = parseEnv();
  
  const firebaseConfig = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };
  
  console.log('Initializing Firebase Core SDK...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('Executing Firestore dynamic updates seeding...');
  
  for (const [colName, items] of Object.entries(SEED_DATA)) {
    console.log(`Writing collection: ${colName} (${items.length} items)...`);
    const batch = writeBatch(db);
    
    items.forEach(item => {
      const docRef = doc(db, colName, item.id);
      batch.set(docRef, item);
    });
    
    await batch.commit();
    console.log(`Successfully batch-committed: ${colName}`);
  }
  
  console.log('Firestore Sync Sequence Complete.');
}

main().catch(console.error);
