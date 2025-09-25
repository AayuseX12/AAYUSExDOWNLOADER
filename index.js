const express = require('express');
const play = require('play-dl');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Middleware to parse JSON
app.use(express.json());

// API route
app.get('/api/YouTubeDownloader', async (req, res) => {
    const { url, apikey } = req.query;

    // Check API key
    if (!apikey || apikey !== API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check URL
    if (!url) {
        return res.status(400).json({ error: 'Missing YouTube URL' });
    }

    try {
        const info = await play.video_info(url);

        // Pick 360p MP4 progressive stream
        const format = info.streams.find(f => f.container === 'mp4' && f.quality_label === '360p');

        if (!format) {
            return res.status(404).json({ error: 'Suitable format not found' });
        }

        res.json({
            title: info.video_details.title,
            direct_link: format.url,
            duration: info.video_details.durationInSec
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
