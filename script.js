document.addEventListener('DOMContentLoaded', () => {
    loadDynamicContent();
});

function switchSiteTab(tabId, event) {
    if (event) event.preventDefault();
    const pages = document.querySelectorAll('.tab-page');
    pages.forEach(page => page.classList.add('hidden'));
    const targetPage = document.getElementById(tabId);
    if (targetPage) targetPage.classList.remove('hidden');
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    if (event && event.currentTarget.classList.contains('nav-link')) {
        event.currentTarget.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDevisSubmit(event) {
    event.preventDefault();
    alert("Merci ! Votre demande de devis a bien été transmise.");
    event.target.reset();
}

// Charger et afficher le contenu dynamique depuis l'Admin
function loadDynamicContent() {
    // 1. Accueil & Bio
    const accueilData = localStorage.getItem('voixoff_accueil');
    if (accueilData) {
        const acc = JSON.parse(accueilData);
        const heroTitle = document.querySelector('.hero-content h1');
        const heroSub = document.querySelector('.hero-content p');
        if (heroTitle && acc.title) heroTitle.innerText = acc.title;
        if (heroSub && acc.subtitle) heroSub.innerText = acc.subtitle;
        
        const aboutText = document.getElementById('site-about-text');
        if (aboutText && acc.about) aboutText.innerText = acc.about;
    }

    // 2. Articles dynamiques
    const articlesData = localStorage.getItem('voixoff_articles');
    if (articlesData) {
        const articles = JSON.parse(articlesData);
        const gridContainer = document.querySelector('#articles .grid-container');
        if (gridContainer) {
            gridContainer.innerHTML = '';
            articles.forEach((art) => {
                const articleCard = document.createElement('article');
                articleCard.className = 'content-card';
                articleCard.style.cssText = "background: var(--bg-card); padding: 30px; border-radius: 20px; border: 1px solid var(--border); display: flex; flex-direction: column; justify-content: space-between;";
                
                articleCard.innerHTML = `
                    <div>
                        <h3 style="margin-bottom: 10px; font-size: 1.2rem; color: var(--text-main);">${art.title}</h3>
                        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">${art.desc}</p>
                    </div>
                    <button type="button" onclick='openReadModal(${JSON.stringify(art.title).replace(/'/g, "&#39;")}, ${JSON.stringify(art.content || art.desc).replace(/'/g, "&#39;")})' style="background: var(--primary); color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; align-self: flex-start; font-size: 0.85rem;">
                        Lire la suite
                    </button>
                `;
                gridContainer.appendChild(articleCard);
            });
        }
    }

    // 3. Podcasts avec onglets et lecteur studio
    renderPodcastsSection('Toutes', '');

    // 4. Vidéos avec onglets et recherche
    renderVideosSection('Toutes', '');
}

// Fonction d'affichage des podcasts
function renderPodcastsSection(selectedSubcat = 'Toutes', searchQuery = '') {
    const subcats = JSON.parse(localStorage.getItem('voixoff_subcategories')) || [];
    const podcasts = JSON.parse(localStorage.getItem('voixoff_podcasts')) || [];
    const podcastSection = document.querySelector('#podcasts');

    if (!podcastSection) return;

    podcastSection.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; margin-bottom: 30px;">
            <div>
                <h2 class="section-title" style="margin-bottom: 5px;">REPLAYS & PODCASTS</h2>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">Réécoutables à tout moment en streaming haute qualité.</p>
            </div>
            <div>
                <input type="text" id="podcast-search-input" placeholder="Rechercher une émission..." value="${searchQuery}" oninput="filterPodcastsSearch(this.value)" style="padding: 12px 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 30px; color: var(--text-main); width: 280px; outline: none; font-size: 0.9rem;">
            </div>
        </div>

        <div id="podcast-tabs-bar" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 35px;"></div>
        <div id="podcast-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 25px;"></div>
    `;

    const tabsBar = document.getElementById('podcast-tabs-bar');
    
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.innerText = "Toutes les émissions";
    allBtn.style.cssText = `padding: 10px 20px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; ${selectedSubcat === 'Toutes' ? 'background: #8b5cf6; color: white; border-color: #8b5cf6;' : 'background: var(--bg-card); color: var(--text-main);'}`;
    allBtn.onclick = () => renderPodcastsSection('Toutes', document.getElementById('podcast-search-input').value);
    tabsBar.appendChild(allBtn);

    subcats.forEach(sub => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = sub;
        btn.style.cssText = `padding: 10px 20px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; ${selectedSubcat === sub ? 'background: #8b5cf6; color: white; border-color: #8b5cf6;' : 'background: var(--bg-card); color: var(--text-main);'}`;
        btn.onclick = () => renderPodcastsSection(sub, document.getElementById('podcast-search-input').value);
        tabsBar.appendChild(btn);
    });

    const gridContainer = document.getElementById('podcast-cards-grid');
    
    let filteredPodcasts = podcasts;
    if (selectedSubcat !== 'Toutes') {
        filteredPodcasts = filteredPodcasts.filter(p => p.subcat === selectedSubcat);
    }
    if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        filteredPodcasts = filteredPodcasts.filter(p => p.title.toLowerCase().includes(q) || p.subcat.toLowerCase().includes(q));
    }

    if (filteredPodcasts.length === 0) {
        gridContainer.innerHTML = `<p style="color: var(--text-muted); grid-column: 1 / -1; text-align: center; padding: 40px;">Aucun replay trouvé.</p>`;
        return;
    }

    filteredPodcasts.forEach((pod, index) => {
        const card = document.createElement('div');
        card.style.cssText = "background: var(--bg-card); padding: 25px; border-radius: 20px; border: 1px solid var(--border); display: flex; flex-direction: column; justify-content: space-between; gap: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);";
        
        const audioId = `audio-player-${index}`;
        const playBtnId = `play-btn-${index}`;
        const progressId = `progress-${index}`;
        const timeId = `time-${index}`;

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                <span style="background: rgba(139, 92, 246, 0.15); color: #a78bfa; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">${pod.subcat}</span>
                <span style="color: var(--text-muted); font-size: 0.85rem;">${pod.date}</span>
            </div>
            <div>
                <h4 style="font-size: 1.15rem; color: var(--text-main); font-weight: 700; margin: 0;">${pod.title}</h4>
            </div>

            <div style="background: linear-gradient(135deg, #070a12 0%, #0d1322 100%); border: 1px solid rgba(139, 92, 246, 0.25); padding: 16px; border-radius: 14px; display: flex; align-items: center; gap: 15px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.6);">
                <audio id="${audioId}" src="${pod.audio}" controlslist="nodownload" oncontextmenu="return false;"></audio>
                <button type="button" id="${playBtnId}" onclick="togglePlay('${audioId}', '${playBtnId}')" style="background: radial-gradient(circle, #8b5cf6 0%, #6d28d9 100%); color: white; border: 2px solid #a78bfa; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 0 12px rgba(139, 92, 246, 0.4); flex-shrink: 0; transition: transform 0.1s;">
                    <span class="play-icon" style="font-size: 14px; margin-left: 3px; line-height: 1;">▶</span>
                </button>
                <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #a78bfa; font-family: monospace;">
                        <span id="${timeId}-current">0:00</span>
                        <span>${pod.duration}</span>
                    </div>
                    <input type="range" id="${progressId}" value="0" min="0" max="100" step="0.1" oninput="seekAudio('${audioId}', this.value)" style="width: 100%; accent-color: #8b5cf6; cursor: pointer; height: 6px;">
                </div>
            </div>
        `;
        gridContainer.appendChild(card);

        setTimeout(() => {
            const audioElement = document.getElementById(audioId);
            const progressInput = document.getElementById(progressId);
            const currentTimeSpan = document.getElementById(`${timeId}-current`);
            const playButton = document.getElementById(playBtnId);

            if (audioElement) {
                audioElement.addEventListener('timeupdate', () => {
                    if (audioElement.duration) {
                        const percent = (audioElement.currentTime / audioElement.duration) * 100;
                        progressInput.value = percent;
                        currentTimeSpan.innerText = formatTime(audioElement.currentTime);
                    }
                });

                audioElement.addEventListener('ended', () => {
                    playButton.innerHTML = '<span class="play-icon" style="font-size: 14px; margin-left: 3px; line-height: 1;">▶</span>';
                });
            }
        }, 100);
    });
}

function togglePlay(audioId, btnId) {
    const audio = document.getElementById(audioId);
    const btn = document.getElementById(btnId);

    document.querySelectorAll('audio').forEach(a => {
        if (a.id !== audioId) a.pause();
    });
    document.querySelectorAll('[id^="play-btn-"]').forEach(b => {
        if (b.id !== btnId) b.innerHTML = '<span class="play-icon" style="font-size: 14px; margin-left: 3px; line-height: 1;">▶</span>';
    });

    if (audio.paused) {
        audio.play();
        btn.innerHTML = '<span class="pause-icon" style="font-size: 13px; line-height: 1; font-weight: bold;">❚❚</span>';
    } else {
        audio.pause();
        btn.innerHTML = '<span class="play-icon" style="font-size: 14px; margin-left: 3px; line-height: 1;">▶</span>';
    }
}

function seekAudio(audioId, value) {
    const audio = document.getElementById(audioId);
    if (audio.duration) {
        audio.currentTime = (value / 100) * audio.duration;
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function filterPodcastsSearch(query) {
    const activeBtn = document.querySelector('#podcast-tabs-bar button[style*="background: rgb(139, 92, 246)"]');
    const currentSubcat = activeBtn ? activeBtn.innerText : 'Toutes';
    const subcats = JSON.parse(localStorage.getItem('voixoff_subcategories')) || [];
    let selected = 'Toutes';
    subcats.forEach(sub => {
        if (currentSubcat === sub) selected = sub;
    });
    renderPodcastsSection(selected, query);
    
    const input = document.getElementById('podcast-search-input');
    if (input) {
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
    }
}


// ==========================================
// FONCTION D'AFFICHAGE DES VIDÉOS (AVEC ONGLETS)
// ==========================================
function renderVideosSection(selectedSubcat = 'Toutes', searchQuery = '') {
    const subcats = JSON.parse(localStorage.getItem('voixoff_video_subcategories')) || [];
    const videos = JSON.parse(localStorage.getItem('voixoff_videos')) || [];
    const videoSection = document.querySelector('#videos');

    if (!videoSection) return;

    videoSection.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; margin-bottom: 30px;">
            <div>
                <h2 class="section-title" style="margin-bottom: 5px;">VIDÉOS & DÉMOS</h2>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">Retrouvez toutes mes réalisations vidéo et spots publicitaires.</p>
            </div>
            <div>
                <input type="text" id="video-search-input" placeholder="Rechercher une vidéo..." value="${searchQuery}" oninput="filterVideosSearch(this.value)" style="padding: 12px 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 30px; color: var(--text-main); width: 280px; outline: none; font-size: 0.9rem;">
            </div>
        </div>

        <div id="video-tabs-bar" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 35px;"></div>
        <div id="video-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 25px;"></div>
    `;

    const tabsBar = document.getElementById('video-tabs-bar');
    
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.innerText = "Toutes les vidéos";
    allBtn.style.cssText = `padding: 10px 20px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; ${selectedSubcat === 'Toutes' ? 'background: #8b5cf6; color: white; border-color: #8b5cf6;' : 'background: var(--bg-card); color: var(--text-main);'}`;
    allBtn.onclick = () => renderVideosSection('Toutes', document.getElementById('video-search-input').value);
    tabsBar.appendChild(allBtn);

    subcats.forEach(sub => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = sub;
        btn.style.cssText = `padding: 10px 20px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; ${selectedSubcat === sub ? 'background: #8b5cf6; color: white; border-color: #8b5cf6;' : 'background: var(--bg-card); color: var(--text-main);'}`;
        btn.onclick = () => renderVideosSection(sub, document.getElementById('video-search-input').value);
        tabsBar.appendChild(btn);
    });

    const gridContainer = document.getElementById('video-cards-grid');
    
    let filteredVideos = videos;
    if (selectedSubcat !== 'Toutes') {
        filteredVideos = filteredVideos.filter(v => v.subcat === selectedSubcat);
    }
    if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        filteredVideos = filteredVideos.filter(v => v.title.toLowerCase().includes(q) || v.subcat.toLowerCase().includes(q));
    }

    if (filteredVideos.length === 0) {
        gridContainer.innerHTML = `<p style="color: var(--text-muted); grid-column: 1 / -1; text-align: center; padding: 40px;">Aucune vidéo trouvée.</p>`;
        return;
    }

    filteredVideos.forEach(vid => {
        const card = document.createElement('div');
        card.style.cssText = "background: var(--bg-card); padding: 25px; border-radius: 20px; border: 1px solid var(--border); display: flex; flex-direction: column; justify-content: space-between; gap: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);";
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                <span style="background: rgba(139, 92, 246, 0.15); color: #a78bfa; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">${vid.subcat}</span>
            </div>
            <div>
                <h4 style="font-size: 1.15rem; color: var(--text-main); font-weight: 700; margin-bottom: 12px;">${vid.title}</h4>
            </div>
            <div style="border-radius: 12px; overflow: hidden; border: 1px solid var(--border); background: #000;">
                <iframe width="100%" height="200" src="${vid.url}" title="${vid.title}" style="border:0;" allowfullscreen></iframe>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

function filterVideosSearch(query) {
    const activeBtn = document.querySelector('#video-tabs-bar button[style*="background: rgb(139, 92, 246)"]');
    const currentSubcat = activeBtn ? activeBtn.innerText : 'Toutes';
    const subcats = JSON.parse(localStorage.getItem('voixoff_video_subcategories')) || [];
    let selected = 'Toutes';
    subcats.forEach(sub => {
        if (currentSubcat === sub) selected = sub;
    });
    renderVideosSection(selected, query);
    
    const input = document.getElementById('video-search-input');
    if (input) {
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
    }
}

// Gestion de la modale de lecture d'article
function openReadModal(title, content) {
    document.getElementById('read-modal-title').innerText = title;
    document.getElementById('read-modal-content').innerHTML = content;
    document.getElementById('read-article-modal').style.display = 'flex';
}

function closeReadModal() {
    document.getElementById('read-article-modal').style.display = 'none';
}