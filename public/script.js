const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const suggestionsDiv = document.getElementById("suggestions");

const yearFilter = document.getElementById("yearFilter");
const typeFilter = document.getElementById("typeFilter");
const clearFiltersButton = document.getElementById("clearFiltersButton");

let typingTimer;
const typingDelay = 300;

let allMovies = [];

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

    yearFilter.addEventListener("input", applyFilters);
    typeFilter.addEventListener("change", applyFilters);

    clearFiltersButton.addEventListener("click", function () {
        yearFilter.value = "";
        typeFilter.value = "";
        displayMovies(allMovies);
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

        allMovies = data.Search;
        applyFilters();

    } catch (error) {
        resultsDiv.innerHTML = "<p>Something went wrong.</p>";
    }
}

function applyFilters() {
    const selectedYear = yearFilter.value.trim();
    const selectedType = typeFilter.value;

    let filteredMovies = allMovies.filter(movie => {
        const matchesYear = selectedYear === "" || movie.Year === selectedYear;
        const matchesType = selectedType === "" || movie.Type === selectedType;

        return matchesYear && matchesType;
    });

    displayMovies(filteredMovies);
}

function displayMovies(movies) {
    if (!movies || movies.length === 0) {
        resultsDiv.innerHTML = "<p>No movies match the selected filters.</p>";
        return;
    }

    let html = "";

    movies.forEach(movie => {
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
                <div class="suggestion-item" data-id="${movie.imdbID}">
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