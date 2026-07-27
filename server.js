const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Allow Vercel to communicate with Railway
app.use(cors({
    origin: '*' 
}));

// Strictly listen on /api/unshorten
app.get('/api/unshorten', async (req, res) => {
    const shortUrl = req.query.url;

    if (!shortUrl) {
        return res.status(400).json({ error: 'Missing URL parameter.' });
    }

    try {
        const response = await axios.get(shortUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            maxRedirects: 10, // Ensure we follow deep redirects
        });

        res.json({ finalUrl: response.request.res.responseUrl });

    } catch (error) {
        console.error("Extraction error:", error.message);
        
        // Sometimes Shopee returns a 403 or 404 AFTER redirecting. 
        // The URL we need is usually still caught here!
        if (error.request && error.request.res && error.request.res.responseUrl) {
             return res.json({ finalUrl: error.request.res.responseUrl });
        }
        
        res.status(500).json({ error: 'Shopee blocked the extraction request from the server.' });
    }
});

// A simple check so if you visit the Railway link directly, it doesn't just error out.
app.get('/', (req, res) => {
    res.send("Shopee API Backend is Running. Use /api/unshorten?url=...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Shopee API running on port ${PORT}`);
});
