const users = JSON.parse(localStorage.getItem('users')) || [];
const statsContainer = document.getElementById('stats-container');

// Récupérer l'utilisateur actuel depuis une variable ou une session
const currentUsername = JSON.parse(sessionStorage.getItem('currentUser')) || {}; // Stockez l'utilisateur connecté dans sessionStorage

// Fonction pour afficher les statistiques de l'utilisateur actuel
function displayCurrentUserStats() {
    // Vérifiez si currentUser est défini dans sessionStorage
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

    if (!currentUser) {
        console.error("Aucun utilisateur connecté !");
        return;
    }

    const currentUsername = currentUser; // Renommage pour plus de clarté
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userData = users.find(user => user.username === currentUsername.username);

    if (!userData) {
        console.error("Utilisateur non trouvé dans la base locale !");
        return;
    }

    // Création de la carte des statistiques
    const currentUserCard = document.createElement('div');
    currentUserCard.className = 'user-card';

    const userTitle = document.createElement('h2');
    userTitle.textContent = `Vos statistiques : ${userData.username}`;
    currentUserCard.appendChild(userTitle);

    const scoresTable = document.createElement('table');
    scoresTable.innerHTML = `
        <tr>
            <th>Jeu</th>
            <th>Meilleur Score</th>
        </tr>
    `;

    const scores = userData.scores || {}; // Récupération des scores de l'utilisateur
    if (Object.keys(scores).length > 0) {
        for (const [game, bestScore] of Object.entries(scores)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${game}</td>
                <td>${bestScore}</td>
            `;
            scoresTable.appendChild(row);
        }
    } else {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="2">Aucun score enregistré.</td>
        `;
        scoresTable.appendChild(row);
    }

    currentUserCard.appendChild(scoresTable);
    statsContainer.appendChild(currentUserCard);
}


// Fonction pour afficher les classements globaux par jeu
function displayGlobalStats() {
    const allScores = {};

    // Construire une liste des scores pour chaque jeu
    users.forEach(user => {
        const scores = user.scores || {}; // Assurer la cohérence des scores
        for (const [game, score] of Object.entries(scores)) {
            if (!allScores[game]) {
                allScores[game] = [];
            }
            allScores[game].push({ username: user.username, score });
        }
    });

    // Afficher les scores pour chaque jeu
    for (const [game, scores] of Object.entries(allScores)) {
        // Trier les scores en ordre décroissant
        scores.sort((a, b) => b.score - a.score);

        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';

        const gameTitle = document.createElement('h2');
        gameTitle.textContent = `Classement pour ${game}`;
        gameCard.appendChild(gameTitle);

        const scoresTable = document.createElement('table');
        scoresTable.innerHTML = `
            <tr>
                <th>Utilisateur</th>
                <th>Score</th>
            </tr>
        `;

        scores.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.username}</td>
                <td>${entry.score}</td>
            `;
            scoresTable.appendChild(row);
        });

        gameCard.appendChild(scoresTable);
        statsContainer.appendChild(gameCard);
    }
}

// Afficher les statistiques
if (currentUsername.username) {
    displayCurrentUserStats();
} else {
    statsContainer.innerHTML = "<p>Aucun utilisateur connecté.</p>";
}

displayGlobalStats();
