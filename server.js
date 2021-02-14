const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors'); // must be deleted

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

app.use(cors()); // must be deleted

// Init middleware
app.use(express.json({ extended: false })); // let to use body

app.get('/', (req, res) => {
  res.send('Api is running');
});

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
