// Simple test to verify multer is working
const multer = require('multer');
const express = require('express');
const app = express();

const upload = multer({ dest: 'uploads/' });

app.post('/test-upload', upload.array('images', 5), (req, res) => {
  console.log('Files:', req.files);
  console.log('Body:', req.body);
  res.json({ 
    success: true, 
    files: req.files ? req.files.length : 0 
  });
});

app.listen(3022, () => {
  console.log('Test server running on port 3022');
});