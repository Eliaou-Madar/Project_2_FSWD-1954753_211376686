// Gestion des sections Connexion et Inscription
document.getElementById('register-link').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.remove('hidden');
});

document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('new-username').value.trim();
    const email = document.getElementById('new-email').value.trim();
    const password = document.getElementById('new-password').value;

    if (!username || !email || !password) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    // Enregistrement dans le Local Storage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Vérifier si le nom d'utilisateur existe déjà
    if (users.some(user => user.username === username)) {
        alert('Ce nom d’utilisateur est déjà pris. Veuillez en choisir un autre.');
        return;
    }

    users.push({ username, email, password, scores: {} });
    localStorage.setItem('users', JSON.stringify(users)); // Ajout de 'scores' pour chaque utilisateur

    alert('Compte créé avec succès ! Connectez-vous maintenant.');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
});

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Vérification dans le Local Storage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        alert(`Bienvenue ${username} !`);
        // Stocker l'utilisateur actif dans sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(user)); // Stockage en tant qu'objet JSON
        // Redirection vers la page de jeux
        window.location.href = 'games.html';
    } else {
        alert('Nom d’utilisateur ou mot de passe incorrect.');
    }
});


/*localStorage.clear();

// Vérification
console.log("Toutes les données du localStorage ont été supprimées.");*/