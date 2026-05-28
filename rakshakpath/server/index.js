import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Helper function to fetch hospitals via Overpass API
const fetchHospitalsOverpass = async (lat, lon, radius) => {
  const overpassQuery = `
    [out:json];
    node(around:${radius},${lat},${lon})[amenity=hospital];
    out 10;
  `;
  try {
    const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
    if (response.data && response.data.elements) {
      return response.data.elements.filter(h => h.tags && h.tags.name);
    }
  } catch (error) {
    console.error(`Overpass API error at radius ${radius}:`, error.message);
  }
  return [];
};

app.post('/api/nearest-hospitals', async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  const radiuses = [5000, 10000, 20000]; // 5km, 10km, 20km
  let hospitals = [];
  let foundRadius = 0;

  for (const radius of radiuses) {
    hospitals = await fetchHospitalsOverpass(lat, lon, radius);
    if (hospitals.length > 0) {
      foundRadius = radius;
      break;
    }
  }

  res.json({
    hospitals,
    searchRadiusExpandedTo: foundRadius
  });
});

app.post('/api/dispatch-ems', (req, res) => {
  const { hospital, location } = req.body;
  if (!hospital || !location) {
    return res.status(400).json({ error: 'Hospital and location are required' });
  }

  // Generate a mock ambulance assignment
  const ambulanceId = `AMB-${Math.floor(1000 + Math.random() * 9000)}`;

  // Send an immediate 200 OK so the frontend knows the request was received
  res.json({
    message: 'Dispatch initiated',
    ambulanceId,
    status: 'Searching'
  });

  // Start the dispatch sequence over WebSocket
  // Note: we emit globally here for simplicity. 
  // In a real app, we'd use a room for the user/session.
  setTimeout(() => {
    io.emit('dispatch-status', { ambulanceId, status: 'Assigned' });
  }, 2000);

  setTimeout(() => {
    io.emit('dispatch-status', { ambulanceId, status: 'En Route' });
  }, 5000);

  setTimeout(() => {
    io.emit('dispatch-status', { ambulanceId, status: 'Arrived' });
  }, 10000);
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`RakshakPath Backend running on port ${PORT}`);
});
