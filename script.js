document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Configuration ---
    // আপনার Firebase প্রজেক্টের কনফিগারেশন অবজেক্ট এখানে পেস্ট করুন।
    // এটি Firebase Console > Project Settings > General থেকে পাবেন।
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Firebase অ্যাপ ইনিশিয়ালাইজ করুন
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        fetchNews(db);
    } else {
        console.warn("Firebase কনফিগারেশন যোগ করা হয়নি। ডেমো ডেটা দেখানো হচ্ছে।");
        displayDummyData();
    }


    // --- DOM Element Selectors ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const body = document.body;
    const loginBtn = document.getElementById('login-btn');
    const modal = document.getElementById('login-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeBtn = document.querySelector('.close-btn');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navCloseBtn = document.getElementById('nav-close-btn');
    const copyrightYear = document.getElementById('copyright-year');
    const liveTimeEl = document.getElementById('live-time');
    
    // --- Live Time Update ---
    function updateLiveTime() {
        const now = new Date();
        const options = {
            weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        };
        const timeString = now.toLocaleTimeString('bn-BD', options);
        if (liveTimeEl) {
            liveTimeEl.textContent = timeString;
        }
    }
    setInterval(updateLiveTime, 1000);
    updateLiveTime();

    // --- Theme Switcher ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.classList.replace('light-theme', `${savedTheme}-theme`);
    
    themeSwitcher.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    });

    // --- Modal Logic ---
    function toggleModal(isActive) {
        if(isActive) {
            modal.classList.add('active');
            modalOverlay.classList.add('active');
        } else {
            modal.classList.remove('active');
            modalOverlay.classList.remove('active');
        }
    }
    
    if (loginBtn && modal && closeBtn && modalOverlay) {
        loginBtn.addEventListener('click', () => toggleModal(true));
        closeBtn.addEventListener('click', () => toggleModal(false));
        modalOverlay.addEventListener('click', () => toggleModal(false));
    }

    // --- Mobile Navigation ---
    if (mobileMenuToggle && mainNav && navCloseBtn) {
        mobileMenuToggle.addEventListener('click', () => mainNav.classList.add('active'));
        navCloseBtn.addEventListener('click', () => mainNav.classList.remove('active'));
    }

    // --- Dynamic Copyright Year ---
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }

    // --- Fetch and Render News from Firestore ---
    async function fetchNews(db) {
        const newsGrid = document.getElementById('news-grid');
        const breakingTicker = document.getElementById('breaking-news-ticker');
        const latestList = document.getElementById('latest-news-list');
        const popularList = document.getElementById('popular-news-list');

        try {
            const snapshot = await db.collection('news').orderBy('timestamp', 'desc').get();
            
            if (snapshot.empty) {
                newsGrid.innerHTML = '<p>কোনো খবর পাওয়া যায়নি।</p>';
                return;
            }

            let newsCardsHTML = '';
            let breakingNewsHTML = '';
            let latestNewsHTML = '';
            let popularNewsHTML = '';
            let count = 0;

            snapshot.forEach(doc => {
                const news = doc.data();
                
                // Main news cards
                newsCardsHTML += `
                    <article class="news-card">
                        <img src="${news.imageUrl}" alt="${news.title}" class="card-image">
                        <div class="card-content">
                            <h3 class="card-title">${news.title}</h3>
                            <p class="card-description">${news.description}</p>
                            <a href="news-details.html?id=${doc.id}" class="card-link">বিস্তারিত পড়ুন <i class="fa-solid fa-arrow-right"></i></a>
                        </div>
                    </article>
                `;

                // Breaking news
                if (news.isBreaking) {
                    breakingNewsHTML += `<p><a href="news-details.html?id=${doc.id}">${news.title}</a></p>`;
                }

                // Latest news list (first 5)
                if (count < 5) {
                    latestNewsHTML += `<li><a href="news-details.html?id=${doc.id}">${news.title}</a></li>`;
                    popularNewsHTML += `<li><a href="news-details.html?id=${doc.id}">${news.title}</a></li>`; // For demo, popular is same as latest
                }
                count++;
            });

            newsGrid.innerHTML = newsCardsHTML;
            breakingTicker.innerHTML = breakingNewsHTML || '<p>এই মুহূর্তে কোনো ব্রেকিং নিউজ নেই।</p>';
            latestList.innerHTML = latestNewsHTML;
            popularList.innerHTML = popularNewsHTML;

        } catch (error) {
            console.error("Error fetching news: ", error);
            newsGrid.innerHTML = '<p>খবর লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।</p>';
        }
    }

    // --- Function to display dummy data if Firebase is not configured ---
    function displayDummyData() {
        const newsGrid = document.getElementById('news-grid');
        const breakingTicker = document.getElementById('breaking-news-ticker');
        const latestList = document.getElementById('latest-news-list');
        const popularList = document.getElementById('popular-news-list');

        const dummyNews = [
            { id: 1, title: 'বিশ্বকাপ ফাইনাল নিয়ে উত্তেজনা', description: 'ক্রিকেট বিশ্বকাপের ফাইনালে আজ ভারত ও অস্ট্রেলিয়ার লড়াই...', imageUrl: 'https://i.ibb.co/Yd4w2t5/sports.jpg', isBreaking: true },
            { id: 2, title: 'প্রযুক্তির নতুন দিগন্ত উন্মোচন', description: 'কৃত্রিম বুদ্ধিমত্তার জগতে এলো নতুন চমক, যা বিশ্বকে বদলে দেবে...', imageUrl: 'https://i.ibb.co/D9WTVd3/tech.jpg', isBreaking: true },
            { id: 3, title: 'যানজট নিরসনে নতুন পদক্ষেপ', description: 'রাজধানীর যানজট কমাতে সরকার দীর্ঘমেয়াদী পরিকল্পনা গ্রহণ করেছে...', imageUrl: 'https://i.ibb.co/3kM4y5x/national.jpg', isBreaking: false }
        ];

        let newsCardsHTML = '';
        let breakingNewsHTML = '';
        let latestNewsHTML = '';

        dummyNews.forEach(news => {
             newsCardsHTML += `
                <article class="news-card">
                    <img src="${news.imageUrl}" alt="${news.title}" class="card-image">
                    <div class="card-content">
                        <h3 class="card-title">${news.title}</h3>
                        <p class="card-description">${news.description}</p>
                        <a href="#" class="card-link">বিস্তারিত পড়ুন <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </article>
            `;
            if (news.isBreaking) breakingNewsHTML += `<p><a href="#">${news.title}</a></p>`;
            latestNewsHTML += `<li><a href="#">${news.title}</a></li>`;
        });
        
        newsGrid.innerHTML = newsCardsHTML;
        breakingTicker.innerHTML = breakingNewsHTML;
        latestList.innerHTML = latestNewsHTML;
        popularList.innerHTML = latestNewsHTML; // Dummy data
    }
});