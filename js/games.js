const currentUser = sessionStorage.getItem('currentUser');

if (!currentUser) {
    // Si aucun utilisateur connecté, rediriger vers la page d'accueil
    alert('Vous devez vous connecter pour jouer.');
    window.location.href = 'index.html';
} else {
    const userObject = JSON.parse(currentUser); // Parse le JSON pour obtenir un objet
    console.log(`Utilisateur connecté : ${userObject.username}`);
    // Vous pouvez maintenant accéder à `userObject.bestScore`, `userObject.scores`, etc.
}