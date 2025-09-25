const express = require('express');
const { exec } = require('child_process');
const ytdlp = require('yt-dlp-exec');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Middleware
app.use(express.json());

app.get('/api/YouTubeDownloader', async (req, res) => {
    const { url, apikey } = req.query;

    // API key validation
    if (!apikey || apikey !== API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!url) {
        return res.status(400).json({ error: 'Missing YouTube URL' });
    }

    try {
        // Use yt-dlp to get video info
        const info = await ytdlp(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true
        });

        // Filter for mp4 progressive streams (video + audio)
        const mp4Formats = info.formats.filter(f => 
            f.ext === 'mp4' && f.vcodec !== 'none' && f.acodec !== 'none'
        );

        if (mp4Formats.length === 0) {
            return res.status(404).json({ error: 'No mp4 progressive format found' });
        }

        // Pick best quality mp4
        const bestFormat = mp4Formats.sort((a, b) => b.height - a.height)[0];

        res.json({
            title: info.title,
            duration: info.duration,
            direct_link: bestFormat.url,
            quality: `${bestFormat.height}p`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get video info. " + err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
