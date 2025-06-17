import { initializeApp } from './firebase-config.js';
import { listenAuthState, handleLogout } from './auth.js';
import { setupUI, toggleTheme, renderArticle, renderHomepage } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // 1. ইনিশিয়ালাইজেশন
    setupUI(); // Theme switcher, back-to-top button etc.
    listenAuthState(auth); // Check if user is logged in and update UI

    // 2. রাউটার: কোন পেজে আছি তা নির্ধারণ করে সেই অনুযায়ী ফাংশন চালানো
    const path = window.location.pathname;
    
    if (path === '/' || path.includes('index.html')) {
        renderHomepage(db);
    } else if (path.includes('single.html')) {
        const articleId = new URLSearchParams(window.location.search).get('id');
        renderArticle(db, auth, articleId);
    } else if (path.includes('profile.html')) {
        // renderProfilePage(db, auth.currentUser);
    }
    // ... other pages
    
    // --- গ্লোবাল ইভেন্ট লিসেনার ---
    // থিম সুইচার
    document.getElementById('theme-switcher').addEventListener('click', toggleTheme);

    // বুকমার্ক করার জন্য ইভেন্ট ডেলিগেশন
    document.body.addEventListener('click', async (e) => {
        if (e.target.matches('.bookmark-btn')) {
            const articleId = e.target.dataset.id;
            const user = auth.currentUser;
            if (!user) {
                alert('সংবাদ সংরক্ষণ করতে লগইন করুন।');
                window.location.href = 'auth.html';
                return;
            }
            // bookmarkArticle(db, user.uid, articleId);
        }
    });

});