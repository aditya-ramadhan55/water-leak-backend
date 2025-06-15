// src/server/handler.js
const { db } = require('../services/firestore');

// Tes Server
exports.getRootHandler = (req, res) => {
    res.status(200).send("Service Running");
};

// POST /sensor
exports.addSensorData = async (req, res) => {
    try {
        const data = req.body;
        // Simpan ke koleksi "water_leak_data"
        const ref = await db.collection('water_leak_data').add(data);
        res.status(201).json({ id: ref.id, status: 'success', message: 'Data berhasil disimpan.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /sensor
exports.getSensorData = async (req, res) => {
    try {
        const snapshot = await db.collection('water_leak_data').orderBy('timestamp', 'desc').limit(100).get();
        const result = [];
        snapshot.forEach(doc => {
            result.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};
