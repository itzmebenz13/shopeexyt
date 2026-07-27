const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
    origin: '*' 
}));

// Changed from '/unshorten' to '/'
app.get('/', async (req, res) => {
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

        const finalUrl = response.request.res.responseUrl;
        res.json({ finalUrl: finalUrl });

    } catch (error) {
        console.error("Error unshortening URL:", error.message);
        
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
