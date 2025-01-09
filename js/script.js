// Handle Login and Registration sections
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
        alert('Please fill out all fields.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log(users);
    if (users.some(user => user.username === username)) {
        alert('This username is already taken. Please choose another one.');
        return;
    }

    users.push({ username, email, password, failedAttempts: 0, blockedUntil: null });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Account successfully created! Log in now.');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
});

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username);

    if (!user) {
        alert('Incorrect username or password.');
        return;
    }

    const now = new Date(); //actuale day and time
    if (user.blockedUntil && new Date(user.blockedUntil) > now) {
        alert('Account is blocked. Please try again after 5 minutes ' + new Date(user.blockedUntil).toLocaleTimeString());
        return;
    }

    if (user.password === password) {
        alert(`Welcome ${username}!`);
        user.failedAttempts = 0;
        user.blockedUntil = null;
        localStorage.setItem('users', JSON.stringify(users));

        document.cookie = `session=${username}; expires=${new Date(now.getTime() +  30 * 60 * 1000).toUTCString()}; path=/`; // 30 minutes
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'games.html';
    } else {
        user.failedAttempts = (user.failedAttempts || 0) + 1;
        if (user.failedAttempts >= 3) {
            user.blockedUntil = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 minutes
            alert('Account blocked after multiple failed attempts.');
        } else {
            alert('Incorrect username or password.');
        }
        localStorage.setItem('users', JSON.stringify(users));
    }
});



/*localStorage.clear();

// Vérification
console.log("Toutes les données du localStorage ont été supprimées.");*/