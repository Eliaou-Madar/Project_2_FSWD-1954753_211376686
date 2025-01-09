const currentUser = sessionStorage.getItem('currentUser');

if (!currentUser) {
    // Si aucun utilisateur connecté, rediriger vers la page d'accueil
    alert('You must log in to play.');
    window.location.href = 'index.html';
} else {
    const userObject = JSON.parse(currentUser); // Parse le JSON pour obtenir un objet
    console.log(`Logged in user: ${userObject.username}`);
    // Vous pouvez maintenant accéder à `userObject.bestScore`, `userObject.scores`, etc.
}