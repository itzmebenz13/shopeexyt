const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());

// 1. SERVE THE FRONTEND: This tells the server to display your index.html file 
// to anyone who visits https://shopeexyt.up.railway.app
app.use(express.static(path.join(__dirname)));

// 2. THE API: We moved the unshortener to a specific, protected path: "/api/unshorten"
app.get('/api/unshorten', async (req, res) => {
    const shortUrl = req.query.url;

    if (!shortUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        const response = await axios.get(shortUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            },
            maxRedirects: 5,
        });

        res.json({ finalUrl: response.request.res.responseUrl });

    } catch (error) {
        console.error("Error unshortening URL:", error.message);
        
        if (error.request && error.request.res && error.request.res.responseUrl) {
             return res.json({ finalUrl: error.request.res.responseUrl });
        }
        
        res.status(500).json({ error: 'Failed to extract the final URL.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Shopee All-In-One Server running on port ${PORT}`);
});
