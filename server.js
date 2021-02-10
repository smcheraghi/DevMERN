const express = require('express');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect DB
connectDB();

app.get('/', (req, res) => {
  res.send('hi');
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
