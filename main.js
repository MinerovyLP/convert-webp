const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');

const app = express();
const PORT = 10000;

// Endpoint to process and convert the image
app.get('/convert-webp', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).send('Image URL is required. Pass it as a query parameter: ?url=<image_url>');
    }

    try {
        // Fetch the image from the URL
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
        });

        const webpImageBuffer = Buffer.from(response.data);

        // Spawn ImageMagick process to convert the image
        const convert = spawn('magick', ['webp:-', 'png:-']);

        // Write the buffer into ImageMagick's stdin
        convert.stdin.write(webpImageBuffer);
        convert.stdin.end();

        // Set response headers for the output
        res.setHeader('Content-Type', 'image/png');

        // Pipe ImageMagick's stdout (converted image) to the response stream
        convert.stdout.pipe(res);

        // Handle errors
        convert.stderr.on('data', (err) => {
            console.error(`ImageMagick error: ${err.toString()}`);
        });

        convert.on('error', (err) => {
            console.error(`Failed to start ImageMagick: ${err.message}`);
            res.status(500).send('Error processing image.');
        });
    } catch (err) {
        console.error(`Error fetching or processing image: ${err.message}`);
        res.status(500).send('Error fetching or processing image.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

function startCyclicFunc() {
    setInterval(() => {
      try { axios.get("https://convert-webp.onrender.com"); } catch (e) {}
    }, 600000); // 10 minutes
  }
  startCyclicFunc();
