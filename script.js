// --------------------------------
// keyboard shotcuts and nav
// ------------------------------
function toggleOverlay() {
    const overlay = document.getElementById('overlay');
    const settingsPanel = document.getElementById('settings-panel');
    if (!overlay) return;

    const isOpening = overlay.classList.contains('hidden');
    overlay.classList.toggle('hidden');

    // FIX: If closing the main inventory menu, force-hide settings panel 
    // so it never defaults open the next time the inventory layout loads.
    if (!isOpening && settingsPanel) {
        settingsPanel.classList.add('hidden');
    }
}

document.addEventListener('keydown', (event) => {
    // Prevent shortcuts from firing if typing inside any input fields or textareas
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
    }
    
    // Toggle the inventory overlay layout ('E' or 'Escape')
    if (event.key.toLowerCase() === 'e' || event.key === 'Escape') {
        toggleOverlay();
    }

    // Pressing '/' focuses the search bar instantly
    if (event.key === '/') {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            event.preventDefault(); // Prevents the actual '/' character from typing into the box
            searchInput.focus();
        }
    }
});

// Toggle overlay via book button click
document.getElementById('global-book-trigger').addEventListener('click', () => {
    toggleOverlay();
});


// ------------------
// widgets1
// --------------------------
function updateClock() {
    const timeElement = document.getElementById('clock-time');
    const dateElement = document.getElementById('clock-date');
    
    if (!timeElement || !dateElement) return;

    const now = new Date();
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    timeElement.textContent = `${hours}:${minutes} ${ampm}`;
    
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

document.getElementById('search-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query !== '') {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    }
});


// ---------------------------------------------
// settings and bookmarks
//--------------------------
const settingsPanel = document.getElementById('settings-panel');
const recipeBtn = document.querySelector('.recipe-book-btn');
const clockWidget = document.querySelector('.widgets-group');
const playerSkinEl = document.querySelector('.player-skin');

let userSettings = { clockPos: 'top-middle', clockColor: 'white' };
let userBookmarks = {}; 

if (recipeBtn && settingsPanel) {
    recipeBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });
}

const slotSelect = document.getElementById('bookmark-slot-select');
if (slotSelect) {
    const optgroupStorage = slotSelect.querySelector('optgroup[label="Main Storage (1-27)"]');
    const optgroupHotbar = slotSelect.querySelector('optgroup[label="Hotbar (h1-h9)"]');

    if (optgroupStorage && optgroupHotbar) {
        for (let i = 1; i <= 27; i++) {
            let opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `Slot ${i}`;
            optgroupStorage.appendChild(opt);
        }
        for (let i = 1; i <= 9; i++) {
            let opt = document.createElement('option');
            opt.value = `h${i}`;
            opt.textContent = `Hotbar ${i}`;
            optgroupHotbar.appendChild(opt);
        }
    }
}

// loading from localsto
function loadSavedData() {
    const savedSettings = localStorage.getItem('mc_settings');
    const savedBookmarks = localStorage.getItem('mc_bookmarks');
    const savedSkin = localStorage.getItem('mc_player_skin');

    if (savedSettings) userSettings = JSON.parse(savedSettings);
    if (savedBookmarks) userBookmarks = JSON.parse(savedBookmarks);
    
    if (savedSkin && playerSkinEl) {
        playerSkinEl.style.backgroundImage = `url('${savedSkin}')`;
    }

    applyClockSettings();
    renderAllBookmarks();

    const posSelect = document.getElementById('clock-pos-select');
    const colorSelect = document.getElementById('clock-color-select');
    if (posSelect) posSelect.value = userSettings.clockPos;
    if (colorSelect) colorSelect.value = userSettings.clockColor;
}

function applyClockSettings() {
    if (!clockWidget) return;
    clockWidget.classList.remove('pos-top-left', 'pos-top-right', 'color-black');
    if (userSettings.clockPos === 'top-left') clockWidget.classList.add('pos-top-left');
    if (userSettings.clockPos === 'top-right') clockWidget.classList.add('pos-top-right');
    if (userSettings.clockColor === 'black') clockWidget.classList.add('color-black');
}

const clockPosSelect = document.getElementById('clock-pos-select');
if (clockPosSelect) {
    clockPosSelect.addEventListener('change', (e) => {
        userSettings.clockPos = e.target.value;
        localStorage.setItem('mc_settings', JSON.stringify(userSettings));
        applyClockSettings();
    });
}

const clockColorSelect = document.getElementById('clock-color-select');
if (clockColorSelect) {
    clockColorSelect.addEventListener('change', (e) => {
        userSettings.clockColor = e.target.value;
        localStorage.setItem('mc_settings', JSON.stringify(userSettings));
        applyClockSettings();
    });
}

function renderAllBookmarks() {
    document.querySelectorAll('.slot-item').forEach(img => img.remove());
    
    for (const [slotId, data] of Object.entries(userBookmarks)) {
        const slotEl = document.querySelector(`.slot[data-slot="${slotId}"]`);
        if (slotEl && data.img) {
            const img = document.createElement('img');
            img.src = data.img;
            img.className = 'slot-item';
            slotEl.appendChild(img);
        }
    }
}

document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('click', () => {
        if (slot.classList.contains('edit-mode-btn')) return;
        const slotId = slot.getAttribute('data-slot');
        if (userBookmarks[slotId] && userBookmarks[slotId].url) {
            window.location.href = userBookmarks[slotId].url;
        }
    });
});

const saveBookmarkBtn = document.getElementById('save-bookmark-btn');
if (saveBookmarkBtn) {
    saveBookmarkBtn.addEventListener('click', () => {
        const slotId = document.getElementById('bookmark-slot-select').value;
        let url = document.getElementById('bookmark-url').value.trim();
        let img = document.getElementById('bookmark-img').value.trim();

        if (!url && !img) {
            if (userBookmarks[slotId]) {
                delete userBookmarks[slotId];
                localStorage.setItem('mc_bookmarks', JSON.stringify(userBookmarks));
                renderAllBookmarks();
            }
            saveBookmarkBtn.textContent = "Slot Cleared!";
            setTimeout(() => saveBookmarkBtn.textContent = "Save to Slot", 1500);
            return;
        }

        if (url && !img) {
            let targetUrl = url;
            if (!/^https?:\/\//i.test(targetUrl)) {
                targetUrl = 'https://' + targetUrl;
                url = targetUrl;
            }
            img = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(targetUrl)}`;
        }

        userBookmarks[slotId] = { url: url || "", img: img || "" };
        localStorage.setItem('mc_bookmarks', JSON.stringify(userBookmarks));
        renderAllBookmarks();
        
        document.getElementById('bookmark-url').value = '';
        document.getElementById('bookmark-img').value = '';
        saveBookmarkBtn.textContent = "Saved!";
        setTimeout(() => saveBookmarkBtn.textContent = "Save to Slot", 1500);
    });
}

const clearBookmarksBtn = document.getElementById('clear-bookmarks-btn');
if (clearBookmarksBtn) {
    clearBookmarksBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all your saved bookmarks?")) {
            userBookmarks = {};
            localStorage.removeItem('mc_bookmarks');
            renderAllBookmarks();
        }
    });
}

//skin stuff
const skinUploadBtn = document.getElementById('skin-upload-btn');
const skinUploadInput = document.getElementById('skin-upload-input');
const clearSkinBtn = document.getElementById('clear-skin-btn');

if (skinUploadBtn && skinUploadInput) {
    skinUploadBtn.addEventListener('click', () => skinUploadInput.click());

    skinUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const base64Data = event.target.result;
            
            localStorage.setItem('mc_player_skin', base64Data);
            if (playerSkinEl) {
                playerSkinEl.style.backgroundImage = `url('${base64Data}')`;
            }
            skinUploadBtn.textContent = "Skin Loaded!";
            setTimeout(() => skinUploadBtn.textContent = "Upload Custom Skin", 1500);
        };
        reader.readAsDataURL(file);
    });
}

if (clearSkinBtn) {
    clearSkinBtn.addEventListener('click', () => {
        localStorage.removeItem('mc_player_skin');
        if (playerSkinEl) {
            playerSkinEl.style.backgroundImage = '';
        }
        clearSkinBtn.textContent = "Skin Reset!";
        setTimeout(() => clearSkinBtn.textContent = "Reset Skin", 1500);
    });
}


updateClock();
setInterval(updateClock, 1000);
loadSavedData();