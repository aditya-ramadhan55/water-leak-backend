const { db } = require('../services/firestore');
const axios = require('axios');

// Cek server
exports.getRootHandler = (req, res) => {
  res.status(200).send("Service Running");
};

// POST /api/sensor — data dari ESP32, simpan ke Firestore dan kirim ke model
exports.addSensorData = async (req, res) => {
  try {
    const data = req.body;

    // Simpan data awal ke Firestore
    const docRef = await db.collection("sensor_data").add(data);

    // Kirim ke model deteksi kebocoran (Model 1)
    const modelResponse = await axios.post("https://leak-detection-api-64095320742.asia-southeast2.run.app/predict", data);
    const { leak_detected } = modelResponse.data;

    // Update dokumen dengan hasil prediksi
    await docRef.update({ leak_detected });

    res.status(201).json({
      id: docRef.id,
      status: "success",
      leak_detected,
      message: "Data berhasil disimpan dan diproses oleh model.",
    });
  } catch (err) {
    console.error("[ERROR addSensorData]", err.message);
    res.status(500).json({ status: "error", message: err.message });
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
