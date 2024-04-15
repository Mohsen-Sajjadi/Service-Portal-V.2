// Import necessary modules
require('dotenv').config(); // Load environment variables from .env file
const jsonServer = require('json-server');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser'); // Import body-parser to parse JSON body in requests

// Create a JSON Server instance
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // Adjust the path to your db.json
const middlewares = jsonServer.defaults();

// Apply JSON Server middlewares for default functionalities (logger, static, cors, and no-cache)
server.use(middlewares);

// Enable CORS for all routes
server.use(cors());

// Use body-parser middleware to parse JSON bodies
server.use(bodyParser.json());

// Enhanced Logging for debugging purposes
server.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Configure Nodemailer with SMTP settings from environment variables for Microsoft 365
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports like 587 for Microsoft 365 with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Intercept JSON Server's default routing and add custom route
server.use((req, res, next) => {
  if (req.path === '/send-email' && req.method === 'POST') {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send email:', error);
        res.status(500).send('Error sending email');
      } else {
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent successfully');
      }
    });
  } else {
    next();
  }
});

// Test endpoint for checking POST requests
server.post('/test-post', (req, res) => {
  console.log('Test POST request received with body:', req.body);
  res.status(200).json({ message: "Test POST request successful", receivedData: req.body });
});

// Use the JSON Server router
server.use(router);

// Specify the port to listen on
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
