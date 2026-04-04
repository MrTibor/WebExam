const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const suggestionsDiv = document.getElementById("suggestions");

let typingTimer;
const typingDelay = 300;

if (searchButton && searchInput && resultsDiv) {
    searchButton.addEventListener("click", searchMovies);

    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            suggestionsDiv.innerHTML = "";
            searchMovies();
        }
    });

    searchInput.addEventListener("input", function () {
        clearTimeout(typingTimer);

        const value = searchInput.value.trim();

        if (value.length < 2) {
            suggestionsDiv.innerHTML = "";
            return;
        }

        typingTimer = setTimeout(() => {
            loadSuggestions(value);
        }, typingDelay);
    });
}

async function searchMovies() {
    const searchValue = searchInput.value.trim();

    if (searchValue === "") {
        resultsDiv.innerHTML = "<p>Please type a movie name.</p>";
        return;
    }

    suggestionsDiv.innerHTML = "";

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchValue)}`);
        const data = await response.json();

        if (data.Response === "False") {
            resultsDiv.innerHTML = `<p>${data.Error}</p>`;
            return;
        }

        let html = "";

        data.Search.forEach(movie => {
            html += `
                <div class="movie-card">
                    <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200x300?text=No+Image"}" alt="${movie.Title}">
                    <h3>${movie.Title}</h3>
                    <p>Year: ${movie.Year}</p>
                    <p>Type: ${movie.Type}</p>
                    <a class="more-info-btn" href="movie.html?id=${movie.imdbID}">More Info</a>
                </div>
            `;
        });

        resultsDiv.innerHTML = html;
    } catch (error) {
        resultsDiv.innerHTML = "<p>Something went wrong.</p>";
    }
}

async function loadSuggestions(searchText) {
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchText)}`);
        const data = await response.json();

        if (data.Response === "False" || !data.Search) {
            suggestionsDiv.innerHTML = "";
            return;
        }

        let html = "";

        data.Search.slice(0, 5).forEach(movie => {
            html += `
                <div class="suggestion-item" data-id="${movie.imdbID}" data-title="${movie.Title}">
                    ${movie.Title} (${movie.Year})
                </div>
            `;
        });

        suggestionsDiv.innerHTML = html;

        document.querySelectorAll(".suggestion-item").forEach(item => {
            item.addEventListener("click", function () {
                const movieId = this.getAttribute("data-id");
                window.location.href = `movie.html?id=${movieId}`;
            });
        });
    } catch (error) {
        suggestionsDiv.innerHTML = "";
    }
}

document.addEventListener("click", function (event) {
    if (!searchInput.contains(event.target) && !suggestionsDiv.contains(event.target)) {
        suggestionsDiv.innerHTML = "";
    }
});

async function countVisit() {
    try {
        await fetch('/api/count-visit');
    } catch (error) {
        console.log('Could not count visit');
    }
}

countVisit();