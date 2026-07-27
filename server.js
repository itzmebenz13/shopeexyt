const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS so your frontend can communicate with this API
app.use(cors({
    origin: '*' // Allow all origins
}));

// The main endpoint at the root URL ("/")
app.get('/', async (req, res) => {
    const shortUrl = req.query.url;

    if (!shortUrl) {
        return res.status(400).json({ error: 'Missing url parameter. Example usage: /?url=https://s.shopee.ph/...' });
    }

    try {
        // Axios automatically follows redirects (HTTP 301/302)
        const response = await axios.get(shortUrl, {
            // Spoof user-agent to look like a real browser to avoid being blocked
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            },
            maxRedirects: 5,
        });

        // Get the final URL after all redirects are resolved
        const finalUrl = response.request.res.responseUrl;
        res.json({ finalUrl: finalUrl });

    } catch (error) {
        console.error("Error unshortening URL:", error.message);
        
        // Sometimes the final redirect returns a 403 or 404 on the HTML side, 
        // but we still successfully caught the redirected URL string!
        if (error.request && error.request.res && error.request.res.responseUrl) {
             return res.json({ finalUrl: error.request.res.responseUrl });
        }
        
        res.status(500).json({ error: 'Failed to extract the final URL.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Unshortener API running on port ${PORT}`);
});
