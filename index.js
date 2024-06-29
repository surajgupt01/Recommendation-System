import express from 'express';
import NodeCache from 'node-cache';
import fetch from 'node-fetch';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const nodeCache = new NodeCache();
const __dirname = path.resolve();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/search', async (req, res) => {
    const apikey = "LIVDSRZULELA";
    const lmt = 15;
    const search = req.body.srch;

    if (!search) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    const tenorUrl = `https://g.tenor.com/v1/search?q=${search}&key=${apikey}&limit=${lmt}`;
    const newsUrl = `https://newsapi.org/v2/everything?q=${search}&language=en&from=2024-05-29&sortBy=publishedAt&apiKey=f777da2e89e34172a5b5a618873b6235`;

    try {
        let gifsResponse = {};
        let newsResponse = {};

        // Check cache for existing results
        if (nodeCache.has(search)) {
            const cachedData = JSON.parse(nodeCache.get(search));
            gifsResponse = cachedData.Gifs;
            newsResponse = cachedData.News;
            console.log("Retrieved from cache:", gifsResponse, newsResponse);
        } else {
            // Fetch GIFs from Tenor API
            const gifsResult = await fetch(tenorUrl);
            gifsResponse = await gifsResult.json();

            // Fetch news articles from News API
            const newsResult = await fetch(newsUrl);
            newsResponse = await newsResult.json();

            // Cache the combined result for future requests
            nodeCache.set(search, JSON.stringify({ Gifs: gifsResponse, News: newsResponse }));
            console.log("New response:", gifsResponse, newsResponse);
        }

        // Return combined response to client
        return res.json({ Gifs: gifsResponse, News: newsResponse });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
