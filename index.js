const express = require('express');
const app = express();
const NodeCache = require('node-cache');
// const fetch = require('node-fetch');
const path = require('path');
const bodyParser = require('body-parser');

const nodeCache = new NodeCache();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/search', async (req, res) => {


    var apikey = "LIVDSRZULELA";
    var lmt = 15;

    // test search term
    var search = req.body.srch;

    // using default locale of en_US
    var searchUrl = "https://g.tenor.com/v1/search?q=" + search+ "&key=" +
            apikey + "&limit=" + lmt;

            var url = `https://newsapi.org/v2/everything?q=${search}&language=en&from=2024-05-29&sortBy=publishedAt&apiKey=f777da2e89e34172a5b5a618873b6235`
  
  console.log('Request URL:', url); // Log the request URL for debugging
  let ress
  try {
    let response = await fetch(url);
     ress = await response.json();
    console.log('Response Status:', response.status); // Log the response status
    console.log('Response Data:', ress); 
    if (ress.status === "error") {
        console.error('API Error:', ress.message); // Log API error messages
      } else if (ress.totalResults === 0) {
        console.log('No results found.');
      } else {
        console.log(ress); // Process and log the articles if results are found
      }
    } catch (error) {
      console.error('Fetch Error:', error); // Log any fetch errors
    }
      
    // const search = req.body.srch;

    if (!search) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    // let searchUrl = `https://api.giphy.com/v1/gifs/search?api_key=8UFqMAK151oEP1kjwQ33AL3FcuzcjhHE&q=${search}&limit=15&offset=0&rating=g&lang=en&bundle=messaging_non_clips`;

    try {
        let result;

        // const NewsArt = await fetch(News)
        // const News_res = await NewsArt.json()
        // res.json(News_res)
        

        if (nodeCache.has(search)) {
            result = JSON.parse(nodeCache.get(search));
            console.log("Retrieved from cache:");
            const [News , Gifs] = [ress,result];
            return res.json({
                News : ress,
                Gifs : result
            })
         
        } else {
            const fetchResult = await fetch(searchUrl);
            result = await fetchResult.json();
            nodeCache.set(search, JSON.stringify(result));
            console.log("New response:");
            return res.json(result + ress);
        }


        

        
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: 'Failed to fetch data from Giphy API' });
    }
});

const PORT = 8000 || process.env.PORT ;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

