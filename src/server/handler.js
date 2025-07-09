const { db } = require('../services/firestore');
const axios = require('axios');

// Cek server
exports.getRootHandler = (req, res) => {
  res.status(200).send("Service Running");
};

// POST /sensor
exports.addSensorData = async (req, res) => {
  try {
    const data = req.body;

    // Simpan data awal ke Firestore
    const docRef = await db.collection('sensor_data').add(data);

    // Kirim ke Model 1: Leak Detection
    const model1Response = await axios.post(
      "https://leak-detection-api-64095320742.asia-southeast2.run.app/predict",
      data
    );
    const leak_detected = model1Response.data.leak_detected;

    // Inisialisasi updateData
    const updateData = { leak_detected };

    // Jika terdeteksi kebocoran, kirim ke Model 2: Leak Location
    if (leak_detected === 1) {
      const model2Response = await axios.post(
        "https://leak-location-api-64095320742.asia-southeast2.run.app/predict",
        data
      );
      updateData.leak_location = model2Response.data.leak_location;
    }

    // Update dokumen Firestore yang sama
    await docRef.update(updateData);

    res.status(201).json({
      id: docRef.id,
      status: 'success',
      leak_detected,
      ...(updateData.leak_location !== undefined && {
        leak_location: updateData.leak_location,
      }),
      message: 'Data berhasil disimpan dan diproses oleh model.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/sensor — ambil data untuk frontend
exports.getSensorData = async (req, res) => {
  try {
    const snapshot = await db
      .collection('water_leak_data')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const result = [];
    snapshot.forEach(doc => {
      result.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("[ERROR getSensorData]", err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
};
