const express = require('express');

const router = express.Router();

// @route  Get api/posts
// @des    Test route
// @access Public
router.get('/', (req, res) => {
  res.send('Posts route');
});

module.exports = router;
