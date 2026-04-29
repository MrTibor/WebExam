const topSeries2025 = [
    "The White Lotus",
    "The Last of Us",
    "Severance",
    "Wednesday",
    "Squid Game",
    "Dexter: Resurrection",
    "Monster",
    "Dept. Q",
    "The Pitt",
    "Adolescence"
];

loadTopTitles(topSeries2025, "series");

async function loadTopTitles(titles, type) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Loading top series...</p>";

    let html = "";

    for (const title of titles) {
        try {
            const response = await fetch(`/api/title?title=${encodeURIComponent(title)}&type=${type}`);
            const movie = await response.json();

            if (movie.Response === "False") {
                console.log("Could not find:", title);
                continue;
            }

            const poster = movie.Poster !== "N/A"
                ? movie.Poster
                : "https://via.placeholder.com/200x300?text=No+Image";

            html += `
                <div class="movie-card">
                    <img src="${poster}" alt="${movie.Title}">
                    <h3>${movie.Title}</h3>
                    <p>Year: ${movie.Year}</p>
                    <p>Type: ${movie.Type}</p>
                    <p>IMDb Rating: ${movie.imdbRating}</p>
                    <a class="more-info-btn" href="movie.html?id=${movie.imdbID}">More Info</a>
                </div>
            `;
        } catch (error) {
            console.log("Error loading:", title);
        }
    }

    resultsDiv.innerHTML = html || "<p>No series could be loaded.</p>";
}