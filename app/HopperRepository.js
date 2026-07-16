import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  writeBatch, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// Default seed data for all collections
const SEED_DATA = {
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

// Seeding engine: Batch writes fallback datasets into Firestore collections
export async function seedFirebaseCollections() {
  try {
    const batch = writeBatch(db);
    let totalItems = 0;

    for (const [colName, items] of Object.entries(SEED_DATA)) {
      // Check if collection documents already exist
      const snap = await getDocs(collection(db, colName));
      if (snap.empty) {
        console.log(`Seeding dynamic collection: ${colName} (${items.length} items)...`);
        items.forEach(item => {
          const docRef = doc(db, colName, item.id);
          batch.set(docRef, item);
          totalItems++;
        });
      }
    }

    if (totalItems > 0) {
      await batch.commit();
      console.log(`Successfully completed seeding ${totalItems} engineering elements into Firestore.`);
    }
  } catch (err) {
    console.warn("Firestore database seeding deferred:", err.message);
  }
}

// Repository Subscriptions Pattern
export const HopperRepository = {
  // 1. Subscribe to Component Tree
  subscribeComponents(onUpdate, onError) {
    const colRef = collection(db, 'hopper_components');
    return onSnapshot(colRef, (snapshot) => {
      const components = [];
      snapshot.forEach(doc => {
        components.push(doc.data());
      });
      if (components.length > 0) {
        onUpdate(components);
      } else {
        // Fallback to local seeds
        onUpdate(SEED_DATA.hopper_components);
      }
    }, (err) => {
      console.warn("Component listener offline. Loading local cache:", err.message);
      if (onError) onError(SEED_DATA.hopper_components);
    });
  },

  // Update Component Node with Optimistic Updates UI support
  async updateComponent(id, updates) {
    try {
      const docRef = doc(db, 'hopper_components', id);
      await setDoc(docRef, updates, { merge: true });
      return true;
    } catch (err) {
      console.error(`Failed to sync updates for node ${id}:`, err);
      throw err;
    }
  },

  // 2. Subscribe to Materials
  subscribeMaterials(onUpdate) {
    return onSnapshot(collection(db, 'hopper_materials'), (snapshot) => {
      const materials = [];
      snapshot.forEach(doc => materials.push(doc.data()));
      onUpdate(materials.length > 0 ? materials : SEED_DATA.hopper_materials);
    }, () => onUpdate(SEED_DATA.hopper_materials));
  },

  // 3. Subscribe to Simulations
  subscribeSimulations(onUpdate) {
    return onSnapshot(collection(db, 'hopper_simulations'), (snapshot) => {
      const simulations = [];
      snapshot.forEach(doc => simulations.push(doc.data()));
      onUpdate(simulations.length > 0 ? simulations : SEED_DATA.hopper_simulations);
    }, () => onUpdate(SEED_DATA.hopper_simulations));
  },

  // 4. Subscribe to Design Models
  subscribeModels(onUpdate) {
    return onSnapshot(collection(db, 'hopper_models'), (snapshot) => {
      const models = [];
      snapshot.forEach(doc => models.push(doc.data()));
      onUpdate(models.length > 0 ? models : SEED_DATA.hopper_models);
    }, () => onUpdate(SEED_DATA.hopper_models));
  },

  // 5. Subscribe to Versions
  subscribeVersions(onUpdate) {
    return onSnapshot(collection(db, 'hopper_versions'), (snapshot) => {
      const versions = [];
      snapshot.forEach(doc => versions.push(doc.data()));
      onUpdate(versions.length > 0 ? versions : SEED_DATA.hopper_versions);
    }, () => onUpdate(SEED_DATA.hopper_versions));
  },

  // 6. Subscribe to Logs
  subscribeLogs(onUpdate) {
    return onSnapshot(collection(db, 'hopper_logs'), (snapshot) => {
      const logs = [];
      snapshot.forEach(doc => logs.push(doc.data()));
      onUpdate(logs.length > 0 ? logs : SEED_DATA.hopper_logs);
    }, () => onUpdate(SEED_DATA.hopper_logs));
  },

  // 7. Subscribe to Briefing Documents
  subscribeDocuments(onUpdate) {
    return onSnapshot(collection(db, 'hopper_documents'), (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push(doc.data()));
      onUpdate(docs.length > 0 ? docs : SEED_DATA.hopper_documents);
    }, () => onUpdate(SEED_DATA.hopper_documents));
  },

  // 8. Subscribe to Images Mapping
  subscribeImages(onUpdate) {
    return onSnapshot(collection(db, 'hopper_images'), (snapshot) => {
      const imgs = [];
      snapshot.forEach(doc => imgs.push(doc.data()));
      onUpdate(imgs.length > 0 ? imgs : SEED_DATA.hopper_images);
    }, () => onUpdate(SEED_DATA.hopper_images));
  }
};
