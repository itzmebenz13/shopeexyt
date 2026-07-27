javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS so your frontend can communicate with this backend
app.use(cors({
    origin: '*' // In production, replace '*' with your frontend URL for better security
}));

// Endpoint to handle unshortening
app.get('/unshorten', async (req, res) => {
    const shortUrl = req.query.url;

    if (!shortUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        // We use Axios to fetch the short link. 
        // Axios automatically follows 301/302 redirects by default.
        const response = await axios.get(shortUrl, {
            // Spoof a user agent so Shopee doesn't block the request
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            },
            // Max number of redirects to follow
            maxRedirects: 5,
        });

        // The final destination URL after all redirects is stored here
        const finalUrl = response.request.res.responseUrl;
        
        res.json({ finalUrl: finalUrl });

    } catch (error) {
        console.error("Error unshortening URL:", error.message);
        
        // Sometimes sites throw a 403 (Forbidden) on the final page, but we STILL get the redirected URL
        if (error.request && error.request.res && error.request.res.responseUrl) {
             return res.json({ finalUrl: error.request.res.responseUrl });
        }
        
        res.status(500).json({ error: 'Failed to extract the final URL.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Unshortener API running on port ${PORT}`);
});
