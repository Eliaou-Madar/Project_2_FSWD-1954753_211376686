var numSelected = null; // The currently selected number
var tileSelected = null; // The currently selected tile

var errors = 0; // Counter for errors made by the user

// Initial Sudoku board setup with some cells filled and others empty
var board = [
    "--74916-5",
    "2---6-3-9",
    "-----7-1-",
    "-586----4",
    "--3----9-",
    "--62--187",
    "9-4-7---2",
    "67-83----",
    "81--45---"
];

// Solution to the Sudoku puzzle
var solution = [
    "387491625",
    "241568379",
    "569327418",
    "758619234",
    "123784596",
    "496253187",
    "934176852",
    "675832941",
    "812945763"
];

// Called when the page is fully loaded, sets up the game
window.onload = function() {
    setGame();
};

function setGame() {
    // Create number tiles (1-9) for selection
    for (let i = 1; i <= 9; i++) {
        let number = document.createElement("div");
        number.id = i; // Set the id of the number tile
        number.innerText = i; // Display the number
        number.addEventListener("click", selectNumber); // Add event listener for selection
        number.classList.add("number"); // Add styling class
        document.getElementById("digits").appendChild(number); // Append to the digits container
    }

    // Create a 9x9 board grid for the Sudoku puzzle
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString(); // Set unique id for each tile
            if (board[r][c] != "-") {
                tile.innerText = board[r][c]; // Display pre-filled numbers
                tile.classList.add("tile-start"); // Add a special class for pre-filled tiles
            }
            if (r == 2 || r == 5) {
                tile.classList.add("horizontal-line"); // Add a horizontal line for better visual separation
            }
            if (c == 2 || c == 5) {
                tile.classList.add("vertical-line"); // Add a vertical line for better visual separation
            }
            tile.addEventListener("click", selectTile); // Add event listener for tile selection
            tile.classList.add("tile"); // Add styling class
            document.getElementById("board").append(tile); // Append to the board container
        }
    }
}

function selectNumber() {
    // Deselect the previously selected number, if any
    if (numSelected != null) {
        numSelected.classList.remove("number-selected");
    }
    numSelected = this; // Set the clicked number as the selected number
    numSelected.classList.add("number-selected"); // Add a selected style
}

function endGame() {
    // Check if the board is completely filled and matches the solution
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === "-" && document.getElementById(`${r}-${c}`).innerText !== solution[r][c]) {
                return; // If any cell is incorrect or empty, the game is not finished
            }
        }
    }

    // Game completed, display the score
    const finalScore = errors; // Use the error count as the final score
    alert(`Congratulations! Game finished with a score of ${finalScore}.`);

    // Retrieve user data from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null; // Get the currently logged-in user
    const gameKey = "Sudoku"; // Unique identifier for this game

    if (currentUser) {
        const userIndex = users.findIndex(user => user.username === currentUser.username);

        if (userIndex !== -1) { // same that >=0
            // Initialize scores if not already set
            users[userIndex].scores = users[userIndex].scores || {};

            // Update the best score for the current game
            users[userIndex].scores[gameKey] = Math.min(finalScore, users[userIndex].scores[gameKey] || 0);

            // Update the best score display
           
        } else {
            // Add a new user if they don't already exist
            users.push({
                username: currentUser.username,
                scores: { [gameKey]: finalScore },
            });
            
        }

        // Save updated user data back to localStorage
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Display the game over screen
    if (document.getElementById("gameOverScreen")) {
        document.getElementById("gameOverScreen").style.display = "block";
    }
}

function selectTile() {
    // Ensure a number is selected before clicking a tile
    if (numSelected) {
        // Prevent overwriting a pre-filled tile
        if (this.innerText != "") {
            return;
        }

        // Get the row and column of the clicked tile from its id
        let coords = this.id.split("-"); // Example: "0-0" becomes ["0", "0"]
        let r = parseInt(coords[0]); // Convert row to integer
        let c = parseInt(coords[1]); // Convert column to integer

        // Check if the selected number matches the solution
        if (solution[r][c] == numSelected.id) {
            this.innerText = numSelected.id; // Fill the tile with the correct number
        } else {
            errors += 1; // Increment error count if the number is incorrect
            document.getElementById("errors").innerText = errors; // Update the error display
        }

        // Check if the game is completed
        endGame();
    }
}
