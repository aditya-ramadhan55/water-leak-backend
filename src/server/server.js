require('dotenv').config();

const express = require('express');
const cors = require("cors");
const router = require('./routes');
const app = express();

const PORT = 8080;

app.use(cors()); // Untuk akses dari frontend mana saja
app.use(express.json());

// Hanya satu base route
app.use('/api', router);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
