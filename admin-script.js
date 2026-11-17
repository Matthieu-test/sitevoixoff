document.addEventListener('DOMContentLoaded', () => {
    loadAdminArticles();
    loadAdminPodcasts();
    loadAdminVideos();

    // Écouteur pour l'ajout par la touche Entrée (Podcasts)
    const subcatInput = document.getElementById('new-subcat-input');
    if (subcatInput) {
        subcatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSubCategory();
            }
        });
    }

    // Écouteur pour l'ajout par la touche Entrée (Vidéos)
    const vidSubcatInput = document.getElementById('new-video-subcat-input');
    if (vidSubcatInput) {
        vidSubcatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addVideoSubCategory();
            }
        });
    }
});

function switchTab(targetId, event) {
    if (event) event.preventDefault();
    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(sec => sec.classList.add('hidden'));
    const target = document.getElementById(targetId);
    if (target) target.classList.remove('hidden');
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => link.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-msg');
    msg.innerText = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ==========================================
// GESTION DES ARTICLES
// ==========================================
function formatText(command) {
    document.execCommand(command, false, null);
}

function loadAdminArticles() {
    const listContainer = document.getElementById('admin-articles-list');
    if (!listContainer) return;

    let articles = JSON.parse(localStorage.getItem('voixoff_articles')) || [
        { title: "L'art de la voix-off", desc: "Découvrez les secrets d'un enregistrement studio.", content: "<p>Contenu complet...</p>" }
    ];
    renderArticlesList(articles);
}

function renderArticlesList(articles) {
    const listContainer = document.getElementById('admin-articles-list');
    listContainer.innerHTML = '';
    if (articles.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--admin-muted); text-align: center; padding: 20px;">Aucun article.</p>`;
        return;
    }
    articles.forEach((art, index) => {
        const card = document.createElement('div');
        card.style.cssText = "background: #0d1322; border: 1px solid var(--admin-border); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center;";
        card.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px; max-width: 80%;">
                <h4 style="font-size: 1rem; color: var(--admin-text); font-weight: 600; margin: 0;">${art.title}</h4>
                <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 0;">${art.desc}</p>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" onclick="editArticle(${index})" style="background: rgba(99, 102, 241, 0.15); color: #6366f1; border: none; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" onclick="deleteArticle(${index})" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: none; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function openArticleModal(index = -1) {
    const modal = document.getElementById('article-modal');
    document.getElementById('art-edit-index').value = index;
    if (index === -1) {
        document.getElementById('modal-title').innerText = "Créer un nouvel article";
        document.getElementById('modal-art-title').value = "";
        document.getElementById('modal-art-desc').value = "";
        document.getElementById('modal-art-content').innerHTML = "";
    } else {
        document.getElementById('modal-title').innerText = "Modifier l'article";
        let articles = JSON.parse(localStorage.getItem('voixoff_articles')) || [];
        const art = articles[index];
        document.getElementById('modal-art-title').value = art.title || "";
        document.getElementById('modal-art-desc').value = art.desc || "";
        document.getElementById('modal-art-content').innerHTML = art.content || "";
    }
    modal.style.display = 'flex';
}

function closeArticleModal() {
    document.getElementById('article-modal').style.display = 'none';
}

function editArticle(index) { openArticleModal(index); }

function saveArticleModal(e) {
    e.preventDefault();
    const index = parseInt(document.getElementById('art-edit-index').value);
    const newArt = {
        title: document.getElementById('modal-art-title').value,
        desc: document.getElementById('modal-art-desc').value,
        content: document.getElementById('modal-art-content').innerHTML
    };
    let articles = JSON.parse(localStorage.getItem('voixoff_articles')) || [];
    if (index === -1) articles.push(newArt);
    else articles[index] = newArt;
    localStorage.setItem('voixoff_articles', JSON.stringify(articles));
    closeArticleModal();
    loadAdminArticles();
    showToast("Article enregistré !");
}

function deleteArticle(index) {
    if (confirm("Supprimer cet article ?")) {
        let articles = JSON.parse(localStorage.getItem('voixoff_articles')) || [];
        articles.splice(index, 1);
        localStorage.setItem('voixoff_articles', JSON.stringify(articles));
        loadAdminArticles();
        showToast("Article supprimé !");
    }
}


// ==========================================
// GESTION DES PODCASTS & SOUS-CATÉGORIES
// ==========================================
function getSubCategories() {
    let subcats = JSON.parse(localStorage.getItem('voixoff_subcategories'));
    if (subcats === null) {
        subcats = ["Les barastoles du morning", "Les Matinales", "La Radio d'Ici", "Interview Spéciale", "Chansons Françaises"];
        localStorage.setItem('voixoff_subcategories', JSON.stringify(subcats));
    }
    return subcats;
}

function loadAdminPodcasts() {
    const subcatsContainer = document.getElementById('admin-subcategories-badges');
    const listContainer = document.getElementById('admin-podcasts-list');
    if (!subcatsContainer || !listContainer) return;

    let subcats = getSubCategories();

    subcatsContainer.innerHTML = '';
    if (subcats.length === 0) {
        subcatsContainer.innerHTML = `<span style="color: var(--admin-muted); font-size: 0.85rem;">Aucune sous-catégorie configurée.</span>`;
    } else {
        subcats.forEach(sub => {
            const badge = document.createElement('span');
            badge.style.cssText = "background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;";
            badge.innerText = sub;
            subcatsContainer.appendChild(badge);
        });
    }

    let podcasts = JSON.parse(localStorage.getItem('voixoff_podcasts')) || [];

    listContainer.innerHTML = '';
    if (podcasts.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--admin-muted); text-align: center; padding: 20px;">Aucun replay configuré.</p>`;
        return;
    }

    podcasts.forEach((pod, index) => {
        const card = document.createElement('div');
        card.style.cssText = "background: #0d1322; border: 1px solid var(--admin-border); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center;";
        card.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px; max-width: 80%;">
                <h4 style="font-size: 1rem; color: var(--admin-text); font-weight: 600; margin: 0;">${pod.title} <span style="color: #a78bfa; font-size: 0.85rem; font-weight: normal;">[${pod.subcat}]</span></h4>
                <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 0;">${pod.date} — ${pod.duration}</p>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" onclick="editPodcast(${index})" style="background: rgba(99, 102, 241, 0.15); color: #6366f1; border: none; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" onclick="deletePodcast(${index})" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: none; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function openSubCategoryModal() {
    const modal = document.getElementById('subcat-modal');
    renderSubCategoryModalList();
    modal.style.display = 'flex';
}

function closeSubCategoryModal() {
    document.getElementById('subcat-modal').style.display = 'none';
    loadAdminPodcasts();
}

function renderSubCategoryModalList() {
    const list = document.getElementById('subcat-list-modal');
    let subcats = getSubCategories();
    list.innerHTML = '';
    
    if (subcats.length === 0) {
        list.innerHTML = `<p style="color: var(--admin-muted); text-align: center; font-size: 0.85rem; padding: 10px;">Aucune sous-catégorie.</p>`;
        return;
    }

    subcats.forEach((sub, idx) => {
        const item = document.createElement('div');
        item.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #070a12; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--admin-border); gap: 10px;";
        item.innerHTML = `
            <input type="text" value="${sub}" onchange="updateSubCategory(${idx}, this.value)" style="flex-grow: 1; background: #0d1322; border: 1px solid var(--admin-border); border-radius: 6px; color: white; padding: 6px 10px; font-size: 0.9rem; outline: none;">
            <button type="button" onclick="removeSubCategory(${idx})" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(item);
    });
}

function addSubCategory() {
    const input = document.getElementById('new-subcat-input');
    if (!input) return;
    const val = input.value.trim();
    if (val !== "") {
        let subcats = getSubCategories();
        if (!subcats.includes(val)) {
            subcats.push(val);
            localStorage.setItem('voixoff_subcategories', JSON.stringify(subcats));
            input.value = "";
            renderSubCategoryModalList();
            showToast("Sous-catégorie ajoutée !");
        } else {
            alert("Cette sous-catégorie existe déjà.");
        }
    }
}

function updateSubCategory(index, newValue) {
    const val = newValue.trim();
    if (val !== "") {
        let subcats = getSubCategories();
        subcats[index] = val;
        localStorage.setItem('voixoff_subcategories', JSON.stringify(subcats));
        showToast("Sous-catégorie modifiée !");
    }
}

function removeSubCategory(index) {
    let subcats = getSubCategories();
    subcats.splice(index, 1);
    localStorage.setItem('voixoff_subcategories', JSON.stringify(subcats));
    renderSubCategoryModalList();
    showToast("Sous-catégorie supprimée !");
}

function openPodcastModal(index = -1) {
    const modal = document.getElementById('podcast-modal');
    const select = document.getElementById('pod-modal-subcat');
    
    let subcats = getSubCategories();
    select.innerHTML = '';
    if (subcats.length === 0) {
        const opt = document.createElement('option');
        opt.value = "";
        opt.innerText = "Veuillez créer une sous-catégorie d'abord";
        select.appendChild(opt);
    } else {
        subcats.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.innerText = sub;
            select.appendChild(opt);
        });
    }

    document.getElementById('pod-edit-index').value = index;
    document.getElementById('pod-file-name').innerText = "Aucun fichier choisi";
    document.getElementById('pod-modal-file').value = "";

    if (index === -1) {
        document.getElementById('podcast-modal-title').innerText = "Ajouter un Replay";
        document.getElementById('pod-modal-title').value = "";
        document.getElementById('pod-modal-date').value = "";
        document.getElementById('pod-modal-duration').value = "";
        document.getElementById('pod-modal-url').value = "";
    } else {
        document.getElementById('podcast-modal-title').innerText = "Modifier le Replay";
        let podcasts = JSON.parse(localStorage.getItem('voixoff_podcasts')) || [];
        const pod = podcasts[index];
        document.getElementById('pod-modal-title').value = pod.title || "";
        select.value = pod.subcat || subcats[0];
        document.getElementById('pod-modal-date').value = pod.date || "";
        document.getElementById('pod-modal-duration').value = pod.duration || "";
        document.getElementById('pod-modal-url').value = pod.audio || "";
    }

    modal.style.display = 'flex';
}

function closePodcastModal() {
    document.getElementById('podcast-modal').style.display = 'none';
}

function editPodcast(index) { openPodcastModal(index); }

let uploadedAudioPath = "";
function handleAudioFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('pod-file-name').innerText = file.name;
        uploadedAudioPath = "audio/" + file.name;
        document.getElementById('pod-modal-url').value = uploadedAudioPath;
    }
}

function savePodcastModal(e) {
    e.preventDefault();
    const index = parseInt(document.getElementById('pod-edit-index').value);
    const audioUrl = document.getElementById('pod-modal-url').value || uploadedAudioPath || "audio/demo_personnages.mp3";

    const newPod = {
        title: document.getElementById('pod-modal-title').value,
        subcat: document.getElementById('pod-modal-subcat').value,
        date: document.getElementById('pod-modal-date').value,
        duration: document.getElementById('pod-modal-duration').value,
        audio: audioUrl
    };

    let podcasts = JSON.parse(localStorage.getItem('voixoff_podcasts')) || [];
    if (index === -1) podcasts.push(newPod);
    else podcasts[index] = newPod;

    localStorage.setItem('voixoff_podcasts', JSON.stringify(podcasts));
    closePodcastModal();
    loadAdminPodcasts();
    showToast("Replay enregistré avec succès !");
}

function deletePodcast(index) {
    if (confirm("Supprimer ce replay ?")) {
        let podcasts = JSON.parse(localStorage.getItem('voixoff_podcasts')) || [];
        podcasts.splice(index, 1);
        localStorage.setItem('voixoff_podcasts', JSON.stringify(podcasts));
        loadAdminPodcasts();
        showToast("Replay supprimé !");
    }
}


// ==========================================
// GESTION DES VIDÉOS & SOUS-CATÉGORIES
// ==========================================
function getVideoSubCategories() {
    let subcats = JSON.parse(localStorage.getItem('voixoff_video_subcategories'));
    if (subcats === null) {
        subcats = ["Publicités TV", "Institutionnel", "Fictions & Voix"];
        localStorage.setItem('voixoff_video_subcategories', JSON.stringify(subcats));
    }
    return subcats;
}

function loadAdminVideos() {
    const subcatsContainer = document.getElementById('admin-video-subcategories-badges');
    const listContainer = document.getElementById('admin-videos-list');
    if (!subcatsContainer || !listContainer) return;

    let subcats = getVideoSubCategories();

    subcatsContainer.innerHTML = '';
    if (subcats.length === 0) {
        subcatsContainer.innerHTML = `<span style="color: var(--admin-muted); font-size: 0.85rem;">Aucune sous-catégorie vidéo configurée.</span>`;
    } else {
        subcats.forEach(sub => {
            const badge = document.createElement('span');
            badge.style.cssText = "background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;";
            badge.innerText = sub;
            subcatsContainer.appendChild(badge);
        });
    }

    let videos = JSON.parse(localStorage.getItem('voixoff_videos')) || [];

    listContainer.innerHTML = '';
    if (videos.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--admin-muted); text-align: center; padding: 20px;">Aucune vidéo configurée.</p>`;
        return;
    }

    videos.forEach((vid, index) => {
        const card = document.createElement('div');
        card.style.cssText = "background: #0d1322; border: 1px solid var(--admin-border); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center;";
        card.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px; max-width: 80%;">
                <h4 style="font-size: 1rem; color: var(--admin-text); font-weight: 600; margin: 0;">${vid.title} <span style="color: #a78bfa; font-size: 0.85rem; font-weight: normal;">[${vid.subcat}]</span></h4>
                <p style="font-size: 0.80rem; color: var(--admin-muted); margin: 0; word-break: break-all;">${vid.url}</p>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" onclick="editVideo(${index})" style="background: rgba(99, 102, 241, 0.15); color: #6366f1; border: none; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" onclick="deleteVideo(${index})" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: none; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function openVideoSubCategoryModal() {
    const modal = document.getElementById('video-subcat-modal');
    renderVideoSubCategoryModalList();
    modal.style.display = 'flex';
}

function closeVideoSubCategoryModal() {
    document.getElementById('video-subcat-modal').style.display = 'none';
    loadAdminVideos();
}

function renderVideoSubCategoryModalList() {
    const list = document.getElementById('video-subcat-list-modal');
    let subcats = getVideoSubCategories();
    list.innerHTML = '';
    
    if (subcats.length === 0) {
        list.innerHTML = `<p style="color: var(--admin-muted); text-align: center; font-size: 0.85rem; padding: 10px;">Aucune sous-catégorie.</p>`;
        return;
    }

    subcats.forEach((sub, idx) => {
        const item = document.createElement('div');
        item.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #070a12; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--admin-border); gap: 10px;";
        item.innerHTML = `
            <input type="text" value="${sub}" onchange="updateVideoSubCategory(${idx}, this.value)" style="flex-grow: 1; background: #0d1322; border: 1px solid var(--admin-border); border-radius: 6px; color: white; padding: 6px 10px; font-size: 0.9rem; outline: none;">
            <button type="button" onclick="removeVideoSubCategory(${idx})" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(item);
    });
}

function addVideoSubCategory() {
    const input = document.getElementById('new-video-subcat-input');
    if (!input) return;
    const val = input.value.trim();
    if (val !== "") {
        let subcats = getVideoSubCategories();
        if (!subcats.includes(val)) {
            subcats.push(val);
            localStorage.setItem('voixoff_video_subcategories', JSON.stringify(subcats));
            input.value = "";
            renderVideoSubCategoryModalList();
            showToast("Sous-catégorie vidéo ajoutée !");
        } else {
            alert("Cette sous-catégorie existe déjà.");
        }
    }
}

function updateVideoSubCategory(index, newValue) {
    const val = newValue.trim();
    if (val !== "") {
        let subcats = getVideoSubCategories();
        subcats[index] = val;
        localStorage.setItem('voixoff_video_subcategories', JSON.stringify(subcats));
        showToast("Sous-catégorie modifiée !");
    }
}

function removeVideoSubCategory(index) {
    let subcats = getVideoSubCategories();
    subcats.splice(index, 1);
    localStorage.setItem('voixoff_video_subcategories', JSON.stringify(subcats));
    renderVideoSubCategoryModalList();
    showToast("Sous-catégorie supprimée !");
}

function openVideoModal(index = -1) {
    const modal = document.getElementById('video-modal');
    const select = document.getElementById('vid-modal-subcat');
    
    let subcats = getVideoSubCategories();
    select.innerHTML = '';
    if (subcats.length === 0) {
        const opt = document.createElement('option');
        opt.value = "";
        opt.innerText = "Veuillez créer une sous-catégorie d'abord";
        select.appendChild(opt);
    } else {
        subcats.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.innerText = sub;
            select.appendChild(opt);
        });
    }

    document.getElementById('vid-edit-index').value = index;

    if (index === -1) {
        document.getElementById('video-modal-title').innerText = "Ajouter une Vidéo";
        document.getElementById('vid-modal-title').value = "";
        document.getElementById('vid-modal-url').value = "";
    } else {
        document.getElementById('video-modal-title').innerText = "Modifier la Vidéo";
        let videos = JSON.parse(localStorage.getItem('voixoff_videos')) || [];
        const vid = videos[index];
        document.getElementById('vid-modal-title').value = vid.title || "";
        select.value = vid.subcat || subcats[0];
        document.getElementById('vid-modal-url').value = vid.url || "";
    }

    modal.style.display = 'flex';
}

function closeVideoModal() {
    document.getElementById('video-modal').style.display = 'none';
}

function editVideo(index) { openVideoModal(index); }

function saveVideoModal(e) {
    e.preventDefault();
    const index = parseInt(document.getElementById('vid-edit-index').value);

    const newVid = {
        title: document.getElementById('vid-modal-title').value,
        subcat: document.getElementById('vid-modal-subcat').value,
        url: document.getElementById('vid-modal-url').value
    };

    let videos = JSON.parse(localStorage.getItem('voixoff_videos')) || [];
    if (index === -1) videos.push(newVid);
    else videos[index] = newVid;

    localStorage.setItem('voixoff_videos', JSON.stringify(videos));
    closeVideoModal();
    loadAdminVideos();
    showToast("Vidéo enregistrée avec succès !");
}

function deleteVideo(index) {
    if (confirm("Supprimer cette vidéo ?")) {
        let videos = JSON.parse(localStorage.getItem('voixoff_videos')) || [];
        videos.splice(index, 1);
        localStorage.setItem('voixoff_videos', JSON.stringify(videos));
        loadAdminVideos();
        showToast("Vidéo supprimée !");
    }
}

// Enregistrement des autres sections
function saveAccueil(e) {
    e.preventDefault();
    const data = {
        title: document.getElementById('adm-hero-title').value,
        subtitle: document.getElementById('adm-hero-subtitle').value,
        about: document.getElementById('adm-about-text').value
    };
    localStorage.setItem('voixoff_accueil', JSON.stringify(data));
    showToast("Accueil et Bio enregistrés !");
}

function savePodcasts(e) { e.preventDefault(); showToast("Podcasts enregistrés !"); }
function saveVideos(e) { e.preventDefault(); showToast("Vidéos enregistrées !"); }
function saveDevis(e) { e.preventDefault(); showToast("Devis enregistrés !"); }
function saveContact(e) { e.preventDefault(); showToast("Contact enregistré !"); }