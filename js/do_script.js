// Require necessary modules
const express = require('express');
const aws = require('aws-sdk');
const multer = require('multer');
const path = require('path');

// Configure multer for file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Express app
const app = express();
const port = 3000;

// DigitalOcean Spaces configuration
const spacesEndpoint = new aws.Endpoint('ams3.digitaloceanspaces.com'); // Change 'ams3' to your region if different
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'XXXXXXXXXX', // Use your access key
    secretAccessKey: 'XXXXXXXXXXXXXX', // Use your secret key
    region: 'ams3' // Change 'ams3' to your region if different
});

// Serve HTML form for file upload
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

// Handle file upload
app.post('/upload', upload.single('fileToUpload'), (req, res) => {
    const file = req.file;
    const fileName = req.file.originalname;

    // Upload file to DigitalOcean Spaces
    s3.putObject({
        Bucket: 'prayer-weaver-files', // Your bucket name
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read' // or 'private'
    }, (err, data) => {
        if (err) {
            console.log('Error uploading file:', err);
            res.status(500).send('Error uploading file.');
        } else {
            console.log('Successfully uploaded file.');
            res.send('File uploaded successfully. File URL: https://' + spacesEndpoint.host + '/' + fileName);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
