require('dotenv').config(); // Load environment variables from .env file
const jsonServer = require('json-server');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser'); // Import body-parser to parse JSON body in requests
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const multer = require('multer');
const path = require('path');
const express = require('express');

// Create an Express server instance
const app = express();
const router = jsonServer.router('db.json'); // Adjust the path to your db.json
const middlewares = jsonServer.defaults();

// Apply JSON Server middlewares for default functionalities (logger, static, cors, and no-cache)
app.use(middlewares);

// Enable CORS for all routes
app.use(cors());

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// JWT validation setup
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.REACT_APP_AUTH0_CLIENT_ID,
  issuer: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// Enhanced Logging for debugging purposes
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Configure Nodemailer with SMTP settings for Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for 587 for STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages:', success);
  }
});

// Custom route for sending emails
app.post('/send-email', (req, res) => {
  const { to, subject, text, project, issueDetails } = req.body;
  if (!to || !subject || !text || !project || !issueDetails) {
    res.status(400).send('Missing required fields: to, subject, text, project, and issueDetails are mandatory.');
    return;
  }

  console.log('Attempting to send email with the following details:', { to, subject, text, project, issueDetails });

  const issue = JSON.parse(issueDetails);
  const formattedDetails = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; font-size: 14px;">
      <h2 style="color: #343a40;">Issue Details</h2>
      <p><strong>Project:</strong> ${project}</p>
      <p><strong>Issue Description:</strong> ${issue.issueDescription}</p>
      <p><strong>Site/Building:</strong> ${issue.siteBuilding}</p>
      <p><strong>Requested By:</strong> ${issue.requestedBy}</p>
      <p><strong>Created Date:</strong> ${issue.createdDate}</p>
      <p><strong>Label:</strong> ${issue.label}</p>
      <p><strong>Priority:</strong> ${issue.priority}</p>
      <p><strong>Status:</strong> ${issue.status}</p>
      <p><strong>Schedule Date:</strong> ${issue.scheduleDate}</p>
      <p><strong>Date of Service:</strong> ${issue.dateOfService}</p>
      <p><strong>Engineer:</strong> ${issue.engineer}</p>
      <p><strong>Activities:</strong> ${issue.activities}</p>
      <p><strong>Service Type:</strong> ${issue.serviceType}</p>
      <p><strong>Hours:</strong> ${issue.hours}</p>
      <p><strong>Last Updated:</strong> ${new Date(issue.lastUpdated).toLocaleString()}</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px;">
        <p><strong>Project:</strong> ${project}</p>
        <p>${text}</p>
        ${formattedDetails}
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Failed to send email:', error);
      res.status(500).send('Error sending email. Please check server logs for more details.');
    } else {
      console.log('Email sent:', info.response);
      res.status(200).send('Email sent successfully');
    }
  });
});

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Adjust the destination as needed
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Define a route to handle file uploads
app.post('/upload', upload.single('attachedFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.json({ filePath: req.file.path });
});

// Apply JWT Auth and role check middleware to secure the routes
app.use('/api', checkJwt, (req, res, next) => {
  const roles = req.user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
  if (roles.includes('admin') || roles.includes('engineer')) {
    next();
  } else {
    res.status(401).send('Insufficient role');
  }
}, router);

// Test endpoint for checking POST requests
app.post('/test-post', (req, res) => {
  console.log('Test POST request received with body:', req.body);
  res.status(200).json({ message: "Test POST request successful", receivedData: req.body });
});

// Serve the build directory for the frontend
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

// Use the JSON Server router
app.use(router);

// Specify the port to listen on and bind to 0.0.0.0
const port = process.env.PORT || 3001;
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
