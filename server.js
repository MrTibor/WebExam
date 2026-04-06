const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const visitorFilePath = path.join(__dirname, 'visitorData.json');

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read visitor data
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

// Helper function to save visitor data
function saveVisitorData(data) {
    fs.writeFileSync(visitorFilePath, JSON.stringify(data, null, 2));
}

// API route to count a visit
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

// Movie details
app.get('/api/movie', async (req, res) => {
    const imdbID = req.query.id;

    if (!imdbID) {
        return res.status(400).json({ error: 'Missing IMDb ID' });
    }

    try {
        const url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong while fetching movie details' });
    }
});

// Visitor info
app.get('/api/visitors', (req, res) => {
    try {
        const visitorData = readVisitorData();

        const startDate = new Date(visitorData.startDate);
        const today = new Date();

        const differenceInTime = today - startDate;
        const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

        res.json({
            totalVisitors: visitorData.totalVisitors,
            startDate: visitorData.startDate,
            lifetimeDays: differenceInDays
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not read visitor data' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});