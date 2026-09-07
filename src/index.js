const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'RESTful API is running successfully'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
