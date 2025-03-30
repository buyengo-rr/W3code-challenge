const API_URL = "http://localhost:3000/films";

// Fetch and display the first movie
const fetchFirstMovie = () => {
    fetch(`${API_URL}/1`)
        .then(response => response.json())
        .then(data => displayMovieDetails(data))
        .catch(error => console.error("Error fetching first movie:", error));
};

// Display movie details
const displayMovieDetails = (movie) => {
    document.getElementById("poster").src = movie.poster;
    document.getElementById("title").textContent = movie.title;
    document.getElementById("runtime").textContent = `Runtime: ${movie.runtime} minutes`;
    document.getElementById("showtime").textContent = `Showtime: ${movie.showtime}`;

    const availableTickets = movie.capacity - movie.tickets_sold;
    document.getElementById("available-tickets").textContent = `Available Tickets: ${availableTickets}`;

    const buyButton = document.getElementById("buy-ticket");
    buyButton.disabled = availableTickets === 0;
    buyButton.textContent = availableTickets === 0 ? "Sold Out" : "🎟️ Buy Ticket";

    // Click event to purchase ticket
    buyButton.onclick = () => purchaseTicket(movie.id, availableTickets);
};

// Fetch and display all movies in the sidebar
const fetchAllMovies = () => {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => displayMovieMenu(data))
        .catch(error => console.error("Error fetching movies:", error));
};

// Display movie list in the sidebar
const displayMovieMenu = (movies) => {
    const filmsList = document.getElementById("films");
    filmsList.innerHTML = ""; // Clear previous list

    movies.forEach(movie => {
        const li = document.createElement("li");
        li.textContent = movie.title;
        li.classList.add("film", "item");

        // Check ticket availability
        if (movie.capacity - movie.tickets_sold === 0) {
            li.classList.add("sold-out");
            li.textContent += " (Sold Out)";
        }

        // Click event to display movie details
        li.addEventListener("click", () => fetchMovieById(movie.id));

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "DELETE";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteMovie(movie.id);
        });

        li.appendChild(deleteButton);
        filmsList.appendChild(li);
    });
};

// Fetch movie by ID when clicked from sidebar
const fetchMovieById = (movieId) => {
    fetch(`${API_URL}/${movieId}`)
        .then(response => response.json())
        .then(movie => displayMovieDetails(movie))
        .catch(error => console.error(`Error fetching movie ${movieId}:`, error));
};

// Purchase a ticket
const purchaseTicket = (movieId, availableTickets) => {
    if (availableTickets > 0) {
        fetch(`${API_URL}/${movieId}`)
            .then(response => response.json())
            .then(movie => {
                const updatedTicketsSold = movie.tickets_sold + 1;

                return fetch(`${API_URL}/${movieId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tickets_sold: updatedTicketsSold })
                });
            })
            .then(response => response.json())
            .then(updatedMovie => {
                displayMovieDetails(updatedMovie);
                fetchAllMovies(); // Update sidebar movie list
            })
            .catch(error => console.error("Error purchasing ticket:", error));
    }
};

// Delete a movie
const deleteMovie = (movieId) => {
    fetch(`${API_URL}/${movieId}`, { method: "DELETE" })
        .then(() => fetchAllMovies()) // Refresh movie list
        .catch(error => console.error(`Error deleting movie ${movieId}:`, error));
};

// Initialize the app
fetchFirstMovie();
fetchAllMovies();
