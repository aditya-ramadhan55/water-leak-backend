exports.addSensorData = async (req, res) => {
  try {
    const data = req.body;

    // Simpan data awal ke Firestore
    const docRef = await db.collection("water_leak_data").add(data);

    // Kirim ke model deteksi kebocoran
    const modelResponse = await axios.post(
      "https://leak-detection-api-64095320742.asia-southeast2.run.app/predict",
      data
    );

    const { leak_detected } = modelResponse.data;

    // Hanya update jika leak_detected tidak undefined
    if (typeof leak_detected !== "undefined") {
      await docRef.update({ leak_detected });
    }

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
