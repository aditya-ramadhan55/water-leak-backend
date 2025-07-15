const { db } = require('../services/firestore');
const { sendTelegramNotification } = require('../services/telegram');

const axios = require('axios');

// GET /
exports.getRootHandler = (req, res) => {
  res.status(200).send("Service Running");
};

// POST /sensor — dari ESP32
exports.addSensorData = async (req, res) => {
  try {
    const data = req.body;

    // 1. Simpan data awal ke Firestore (sensor_data)
    const docRef = await db.collection("sensor_data").add(data);

    // 2. Kirim ke Model 1: Leak Detection
    const model1Response = await axios.post(
      "https://leak-detection-api-64095320742.asia-southeast2.run.app/predict",
      data
    );
    const leak_detected = model1Response.data.leak_detected;

    // 3. Inisialisasi updateData dengan hasil dari Model 1
    const updateData = { leak_detected };

    // 4. Jika terdeteksi kebocoran, kirim ke Model 2: Leak Location
    if (leak_detected === 1) {
      const model2Payload = { ...data, leak_detected };
      const model2Response = await axios.post(
        "https://leak-location-api-64095320742.asia-southeast2.run.app/predict",
        model2Payload
      );
      updateData.leak_location = model2Response.data.leak_location;
    }

    // 5. Update dokumen Firestore dengan hasil model
    await docRef.update(updateData);

    // 6. Alert saat terjadi kebocoran ke telegram
    if (updateData.leak_detected === 1) {
      await sendTelegramNotification(updateData.leak_detected, updateData.leak_location);
    }


    res.status(201).json({
      id: docRef.id,
      status: "success",
      ...updateData,
      message: "Data berhasil disimpan dan diproses oleh model."
    });

  } catch (err) {
    console.error("[ERROR addSensorData]", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /api — untuk frontend
exports.getSensorData = async (req, res) => {
  try {
    const snapshot = await db
      .collection('sensor_data')
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
