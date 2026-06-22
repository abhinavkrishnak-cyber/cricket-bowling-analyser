import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve static files from the React frontend dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Path to data file
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data folder and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Helper to read sessions
const readSessions = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading sessions file:', err);
    return [];
  }
};

// Helper to write sessions
const writeSessions = (sessions) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing sessions file:', err);
    return false;
  }
};

// Pre-seeded coaching suggestions
const COACHING_TIPS = {
  fast: [
    "Keep your head aligned towards the target at release to maximize control and accuracy.",
    "A braced front knee (160°+) at landing transfers kinetic energy from your run-up into the ball.",
    "Focus on a vertical arm release. Any lateral angle deviation increases stress on your shoulder joints.",
    "Maintain a strong follow-through. Decreasing your speed abruptly after release increases lower back strain.",
    "A structured run-up acceleration is better than sprinting immediately. Build pace gradually."
  ],
  spin: [
    "Ensure your pivot foot is fully stable. A stable pivot maximizes hip rotation and spin generation.",
    "Maximize your wrist snap at release. A flexible, quick snap is critical for higher RPMs.",
    "Use flight control to your advantage: loop the ball to drop it shorter and deceive the batsman.",
    "Keep your shoulders aligned until release. Rotating too early leaks torque and reduces spin.",
    "Maintain high arm speed even when bowling slower deliveries to keep the batsman guessing."
  ]
};

// Seed default sessions if empty
const seedDefaultSessions = () => {
  const sessions = readSessions();
  if (sessions.length === 0) {
    const seedData = [
      {
        id: "session-1",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        bowlerName: "Guest Bowler",
        bowlingType: "fast",
        overallScore: 78,
        scores: { runUp: 82, action: 75, balance: 80, release: 76, technique: 77 },
        metrics: {
          speed: 132.5,
          stepCount: 8,
          bracedKneeAngle: 154,
          trunkLean: 18,
          releaseHeight: 2.15,
          releaseAngle: 85,
          powerTransfer: 78,
          runUpSpeed: 6.2
        },
        feedback: {
          strengths: ["Smooth run-up tempo", "Great head alignment at delivery"],
          weaknesses: ["Slightly collapsed front knee", "Short delivery stride"],
          recommendations: ["Increase final stride length by 10% to improve power transfer", "Focus on locking the front knee at landing"]
        },
        injuryRisk: "medium",
        riskMetrics: {
          hyperextendedKnee: false,
          excessiveTrunkLean: false,
          poorLanding: true
        }
      },
      {
        id: "session-2",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        bowlerName: "Guest Bowler",
        bowlingType: "fast",
        overallScore: 84,
        scores: { runUp: 85, action: 83, balance: 84, release: 82, technique: 86 },
        metrics: {
          speed: 136.8,
          stepCount: 9,
          bracedKneeAngle: 165,
          trunkLean: 12,
          releaseHeight: 2.22,
          releaseAngle: 88,
          powerTransfer: 85,
          runUpSpeed: 6.5
        },
        feedback: {
          strengths: ["Excellent front knee bracing", "High release point", "Outstanding recovery"],
          weaknesses: ["Minor trunk lean at side-bending"],
          recommendations: ["Maintain current bracing angle", "Slightly strengthen core to reduce side lateral lean"]
        },
        injuryRisk: "low",
        riskMetrics: {
          hyperextendedKnee: false,
          excessiveTrunkLean: false,
          poorLanding: false
        }
      },
      {
        id: "session-3",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        bowlerName: "Guest Bowler",
        bowlingType: "spin",
        overallScore: 81,
        scores: { runUp: 80, action: 82, balance: 78, release: 85, technique: 80 },
        metrics: {
          speed: 84.2, // km/h for spinner
          revs: 2150, // RPM
          stepCount: 5,
          bracedKneeAngle: 148,
          trunkLean: 8,
          releaseHeight: 2.10,
          releaseAngle: 76,
          pivotFootStability: 82,
          wristPositionScore: 88
        },
        feedback: {
          strengths: ["High revolutions on release", "Stable pivot foot alignment"],
          weaknesses: ["Low release height", "Stiff shoulder rotation"],
          recommendations: ["Work on higher release point to achieve more flight and bounce", "Loosen chest and shoulders for fluid rotation"]
        },
        injuryRisk: "low",
        riskMetrics: {
          hyperextendedKnee: false,
          excessiveTrunkLean: false,
          poorLanding: false
        }
      }
    ];
    writeSessions(seedData);
  }
};

seedDefaultSessions();

// GET all sessions
app.get('/api/sessions', (req, res) => {
  const sessions = readSessions();
  res.json(sessions);
});

// POST new session
app.post('/api/sessions', (req, res) => {
  const { bowlerName, bowlingType, overallScore, scores, metrics, feedback, injuryRisk, riskMetrics } = req.body;

  if (!bowlingType || !overallScore) {
    return res.status(400).json({ error: "Missing required session parameters." });
  }

  const newSession = {
    id: `session-${Date.now()}`,
    date: new Date().toISOString(),
    bowlerName: bowlerName || "Anonymous Bowler",
    bowlingType,
    overallScore,
    scores,
    metrics,
    feedback,
    injuryRisk,
    riskMetrics
  };

  const sessions = readSessions();
  sessions.unshift(newSession); // add to top (newest first)
  
  if (writeSessions(sessions)) {
    res.status(201).json(newSession);
  } else {
    res.status(500).json({ error: "Failed to save session to disk." });
  }
});

// GET coaching tips
app.get('/api/coaching-tips', (req, res) => {
  res.json(COACHING_TIPS);
});

// Wildcard route to serve React app fallback for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server backend config setup
app.listen(PORT, () => {
  console.log(`AI Cricket Bowling Coach backend listening on port ${PORT}`);
});
