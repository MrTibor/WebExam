const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const visitorFilePath = path.join(__dirname, 'visitorData.json');


app.use(express.static(path.join(__dirname, 'public')));


function readVisitorData() {
    try {
        const rawData = fs.readFileSync(visitorFilePath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        return {
            totalVisitors: 0,
            startDate: new Date().toISOString().split('T')[0]
        };
    }
}


function saveVisitorData(data) {
    fs.writeFileSync(visitorFilePath, JSON.stringify(data, null, 2));
}

// API 
app.get('/api/count-visit', (req, res) => {
    try {
        const visitorData = readVisitorData();
        visitorData.totalVisitors += 1;
        saveVisitorData(visitorData);

        res.json({
            message: 'Visit counted',
            totalVisitors: visitorData.totalVisitors
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not count visit' });
    }
});

// Search movies
app.get('/api/search', async (req, res) => {
    const searchText = req.query.q;

    if (!searchText) {
        return res.status(400).json({ error: 'Missing search text' });
    }

    try {
        const url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${encodeURIComponent(searchText)}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong while fetching movie data' });
    }
});



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});