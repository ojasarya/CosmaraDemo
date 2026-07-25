(function () {
    'use strict';

    const USERS_KEY = 'cosmara_users';
    const SESSION_KEY = 'currentUser';
    const ADMIN_ACCOUNT = {
        id: 0,
        username: 'admin',
        email: 'admin@cosmara.space',
        password: 'cosmara2024',
        role: 'admin',
        status: 'approved'
    };
    const DEFAULT_USERS = [
        { id: 1, username: 'cadet1', email: 'cadet1@cosmara.space', password: 'cadet123', status: 'approved', role: 'cadet', createdAt: '2024-01-15' },
        { id: 2, username: 'engineer2', email: 'engineer2@cosmara.space', password: 'engineer123', status: 'pending', role: 'engineer', createdAt: '2024-06-10' },
        { id: 3, username: 'commander3', email: 'commander3@cosmara.space', password: 'commander123', status: 'approved', role: 'commander', createdAt: '2024-05-20' }
    ];

    function readJson(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function normaliseEmail(email) {
        return String(email || '').trim().toLowerCase();
    }

    function publicUser(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt
        };
    }

    function getUsers() {
        const savedUsers = readJson(USERS_KEY, null);
        return Array.isArray(savedUsers) ? savedUsers : DEFAULT_USERS.map((user) => ({ ...user }));
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function getCurrentUser() {
        const session = readJson(SESSION_KEY, null);
        if (!session || !session.email || !session.role) {
            return null;
        }

        if (session.role === 'admin' && normaliseEmail(session.email) === ADMIN_ACCOUNT.email) {
            return publicUser(ADMIN_ACCOUNT);
        }

        const user = getUsers().find((candidate) => candidate.id === session.id && candidate.status === 'approved');
        return user ? publicUser(user) : null;
    }

    function setSession(user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser(user)));
    }

    function getSafeRedirect() {
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        return ['dashboard.html', 'admin.html'].includes(redirect) ? redirect : null;
    }

    function destinationFor(user) {
        if (user.role === 'admin') {
            return 'admin.html';
        }

        const requestedPage = getSafeRedirect();
        return requestedPage === 'dashboard.html' ? requestedPage : 'dashboard.html';
    }

    function signIn(email, password) {
        const normalisedEmail = normaliseEmail(email);

        if (!normalisedEmail || !password) {
            return { ok: false, message: 'Enter both your email address and password.' };
        }

        if (normalisedEmail === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
            setSession(ADMIN_ACCOUNT);
            return { ok: true, user: publicUser(ADMIN_ACCOUNT), destination: destinationFor(ADMIN_ACCOUNT) };
        }

        const user = getUsers().find((candidate) => normaliseEmail(candidate.email) === normalisedEmail && candidate.password === password);

        if (!user) {
            return { ok: false, message: 'We could not find an account with those details.' };
        }

        if (user.status !== 'approved') {
            return { ok: false, message: 'This account is not active yet. Please contact an administrator.' };
        }

        setSession(user);
        return { ok: true, user: publicUser(user), destination: destinationFor(user) };
    }

    function signUp({ username, email, password, confirmPassword }) {
        const cleanName = String(username || '').trim();
        const normalisedEmail = normaliseEmail(email);

        if (cleanName.length < 2 || cleanName.length > 60) {
            return { ok: false, message: 'Use a name between 2 and 60 characters.' };
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalisedEmail)) {
            return { ok: false, message: 'Enter a valid email address.' };
        }

        if (password.length < 8) {
            return { ok: false, message: 'Use a password with at least 8 characters.' };
        }

        if (password !== confirmPassword) {
            return { ok: false, message: 'Your passwords do not match.' };
        }

        if (normalisedEmail === ADMIN_ACCOUNT.email || getUsers().some((user) => normaliseEmail(user.email) === normalisedEmail)) {
            return { ok: false, message: 'An account already exists for this email address.' };
        }

        const users = getUsers();
        const nextId = users.reduce((highestId, user) => Math.max(highestId, Number(user.id) || 0), 0) + 1;
        const user = {
            id: nextId,
            username: cleanName,
            email: normalisedEmail,
            password,
            role: 'cadet',
            status: 'approved',
            createdAt: new Date().toISOString().slice(0, 10)
        };

        users.push(user);
        saveUsers(users);
        setSession(user);
        return { ok: true, user: publicUser(user), destination: destinationFor(user) };
    }

    function signOut(destination = 'index.html') {
        localStorage.removeItem(SESSION_KEY);
        window.location.replace(destination);
    }

    function requireUser({ role } = {}) {
        const user = getCurrentUser();

        if (!user) {
            const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
            const redirect = ['dashboard.html', 'admin.html'].includes(currentPage) ? `?redirect=${encodeURIComponent(currentPage)}` : '';
            window.location.replace(`login.html${redirect}`);
            return null;
        }

        if (role && user.role !== role) {
            window.location.replace('dashboard.html');
            return null;
        }

        return user;
    }

    window.COSMARA_AUTH = Object.freeze({
        getUsers,
        saveUsers,
        getCurrentUser,
        getSafeRedirect,
        signIn,
        signUp,
        signOut,
        requireUser
    });
})();
