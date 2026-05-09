// ==========================================
// LOCAL STORAGE & TTS
// ==========================================
function getFavorites() { 
    try { return JSON.parse(localStorage.getItem("bikolFavs") || "[]"); } 
    catch(e) { return []; } 
}
function saveFavorites(favs) { localStorage.setItem("bikolFavs", JSON.stringify(favs)); }

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://ayvxqbxnrbcgbffrzbia.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnhxYnhucmJjZ2JmZnJ6YmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDkzMDAsImV4cCI6MjA5Mjc4NTMwMH0.pAHi-yBxb1GCEXT78xHQXiYcg7yJfoSpNCXi1Dvugdg';

// Initialize the Supabase client
var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// This will hold our database words
var dictionary = []; 
var currentLangMode = 'en'; // 'en', 'tl', or 'all'
// 'async' means this function takes time because it talks to the internet
async function fetchWords() {
    console.log("Fetching words from Supabase...");
    
    const { data: words, error } = await supabaseClient
        .from('words')
        .select('*');

    if (error) {
        console.error("Error fetching words:", error);
        return;
    }

    if (words && words.length > 0) {
        dictionary = words.map(function(word) {
            // Build examples
            var examples = [];
            if (word.example_bikol && word.example_bikol.trim() !== '') {
                examples.push({
                    bikol: word.example_bikol,
                    english: word.example_english || ''
                });
            }

            // BULLETPROOF Synonyms parsing
            var syns = [];
            try {
                if (word.synonyms) {
                    // Check if it's a string that needs parsing
                    var parsed = typeof word.synonyms === 'string' ? JSON.parse(word.synonyms) : word.synonyms;
                    if (Array.isArray(parsed)) {
                        syns = parsed;
                    } else if (typeof parsed === 'string' && parsed.trim() !== '') {
                        syns = [parsed]; // Wrap a single plain text word in an array
                    }
                }
            } catch (e) {
                // If JSON.parse fails, it's probably just plain text or comma separated
                if (typeof word.synonyms === 'string' && word.synonyms.trim() !== '') {
                    syns = word.synonyms.split(',').map(function(s) { return s.trim(); });
                }
            }

            return {
                bikol: word.bikol || '',
                english: word.english || '',
                tagalog: word.tagalog || '',
                pos: word.pos || '',
                category: word.category || '',
                dialect: word.dialect || '',
                pronunciation: word.pronunciation || '',
                examples: examples,
                synonyms: syns
            };
        });
        console.log("Loaded " + dictionary.length + " words from cloud!");
    }
}

function speakWord(text) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        var cleanText = text.replace(/\//g, ' or ');
        var utt = new SpeechSynthesisUtterance(cleanText);
        utt.rate = 0.9; utt.lang = 'en-US';
        window.speechSynthesis.speak(utt);
    }
}

// ==========================================
// DICTIONARY DATA (Full 120+ Words)
// ==========================================


// ==========================================
// CATEGORY META (Icons & Colors)
// ==========================================
var categoryMeta = {
    "Greetings": { icon: "fa-handshake", color: "#D4572A" },
    "Basic": { icon: "fa-comment-dots", color: "#2D6A4F" },
    "People": { icon: "fa-users", color: "#6C5CE7" },
    "Family": { icon: "fa-people-roof", color: "#E17055" },
    "Body": { icon: "fa-hand", color: "#00B894" },
    "Food": { icon: "fa-utensils", color: "#FDCB6E" },
    "Nature": { icon: "fa-leaf", color: "#00B894" },
    "Animals": { icon: "fa-paw", color: "#E17055" },
    "Actions": { icon: "fa-person-running", color: "#0984E3" },
    "Descriptors": { icon: "fa-palette", color: "#6C5CE7" },
    "Numbers": { icon: "fa-hashtag", color: "#D4572A" },
    "Colors": { icon: "fa-droplet", color: "#FDCB6E" },
    "Time": { icon: "fa-clock", color: "#0984E3" },
    "Places": { icon: "fa-map-pin", color: "#2D6A4F" },
    "Health & Medicine": { icon: "fa-heart-pulse", color: "#EB4D4B" },
    "Daily Life": { icon: "fa-calendar-day", color: "#636E72" },
    "Relationships": { icon: "fa-people-group", color: "#A29BFE" },
    "Weather": { icon: "fa-cloud-sun", color: "#00CEC9" },
    "Clothing": { icon: "fa-shirt", color: "#FAB1A0" },
    "Education": { icon: "fa-graduation-cap", color: "#54A0FF" },
    "Technology": { icon: "fa-microchip", color: "#2D3436" },
    "Sports": { icon: "fa-volleyball", color: "#FF9F43" },
    "Music": { icon: "fa-music", color: "#B2BEC3" },
    "Travel": { icon: "fa-map-location-dot", color: "#74B9FF" },
    "Shopping": { icon: "fa-cart-shopping", color: "#FFEAA7" },
    "Emotions": { icon: "fa-face-smile", color: "#E84393" },
    "House": { icon: "fa-house-chimney", color: "#55E6C1" },
    "Work": { icon: "fa-briefcase", color: "#95A5A6" },
    "Culture": { icon: "fa-masks-theater", color: "#F0932B" },
    "Religion": { icon: "fa-place-of-worship", color: "#F1C40F" },
    "Tools": { icon: "fa-screwdriver-wrench", color: "#B33939" },
    "Transportation": { icon: "fa-car", color: "#227093" },
    "Kitchen": { icon: "fa-kitchen-set", color: "#6AB04C" },
    "Environment": { icon: "fa-earth-asia", color: "#40407A" },
    // NEW SCRAPER CATEGORIES (EXACT STRINGS)
    "Days & Time": { icon: "fa-calendar-days", color: "#0984E3" },
    "Home & Family": { icon: "fa-house-user", color: "#E17055" },
    "Travel & Transportation": { icon: "fa-plane-departure", color: "#74B9FF" },
    "Weather & Climate": { icon: "fa-cloud-showers-heavy", color: "#00CEC9" },
    "Work & School": { icon: "fa-briefcase", color: "#95A5A6" },
    "Numbers, Counting & Currency": { icon: "fa-money-bill-1-wave", color: "#2D6A4F" },
    "Food, Drinks & Dining": { icon: "fa-bowl-food", color: "#FDCB6E" },
    "Emotions & Personal Traits": { icon: "fa-face-grin-stars", color: "#E84393" },
    "Animals & Nature": { icon: "fa-dragon", color: "#00B894" },
    "Lima sentimos na sana.": { icon: "fa-circle-question", color: "#B2BEC3" },
    "Food & Cooking": { icon: "fa-fire-burner", color: "#F0932B" },
    "Greetings & Expressions": { icon: "fa-comment-dots", color: "#D4572A" },
    "Family & Relationships": { icon: "fa-people-group", color: "#A29BFE" },
    "Emotions & Feelings": { icon: "fa-heart", color: "#EB4D4B" }
};

// ==========================================
// RENDERING HELPERS
// ==========================================
function renderWordCard(word) {
    var isFav = getFavorites().indexOf(word.bikol) !== -1;
    
    var mainMeaning = "";
    var subMeaningHtml = "";

    if (currentLangMode === 'en') {
        mainMeaning = word.english;
    } else if (currentLangMode === 'tl') {
        mainMeaning = word.tagalog || word.english; 
    } else if (currentLangMode === 'all') {
        mainMeaning = word.english;
        if (word.tagalog) {
            subMeaningHtml = '<div class="mini-tagalog">TL: ' + word.tagalog + '</div>';
        }
    }
        
    return '<div class="mini-word-card" onclick="openDetail(\'' + word.bikol + '\')">' +
        '<div class="mini-info">' +
            '<div class="mini-bikol">' + word.bikol + '</div>' +
            '<div class="mini-english">' + mainMeaning + '</div>' +
            subMeaningHtml +
        '</div>' +
        '<div class="mini-actions">' +
            '<button class="action-btn ' + (isFav ? 'active' : '') + '" onclick="event.stopPropagation(); toggleFavorite(\'' + word.bikol + '\')"><i class="fas fa-heart"></i></button>' +
            '<button class="action-btn" onclick="event.stopPropagation(); speakWord(\'' + word.bikol + '\')"><i class="fas fa-volume-up"></i></button>' +
        '</div>' +
    '</div>';
}

// ==========================================
// HOME PAGE
// ==========================================
function renderCategories() {
    var grid = document.getElementById("categoriesGrid");
    var counts = {};
    for (var i = 0; i < dictionary.length; i++) {
        var cat = dictionary[i].category;
        counts[cat] = (counts[cat] || 0) + 1;
    }
    var html = "";
    for (var category in counts) {
        var meta = categoryMeta[category] || { icon: "fa-book", color: "#6B6259" };
        html += '<div class="category-card" style="border-top-color: ' + meta.color + '" onclick="goToCategory(\'' + category + '\')">' +
            '<div class="category-icon" style="color: ' + meta.color + '"><i class="fas ' + meta.icon + '"></i></div>' +
            '<div class="category-name">' + category + '</div>' +
            '<div class="category-count">' + counts[category] + ' words</div>' +
        '</div>';
    }
    grid.innerHTML = html;
}

function goToCategory(cat) {
    switchPage('browse');
    setTimeout(function() { filterBrowseCategory(cat); }, 150);
}

function renderPopularWords() {
    var container = document.getElementById("popularWords");
    var popular = ["Magayon", "Kumusta", "Marhay", "Dakol", "Kakanon", "Harong", "Tawo", "Aldaw", "Salamat", "Aram"];
    var words = [];
    for (var i = 0; i < popular.length; i++) {
        var found = dictionary.find(function(w) { return w.bikol === popular[i]; });
        if (found) words.push(found);
    }
    container.innerHTML = words.map(renderWordCard).join("");
}

function updateHeroStats() {
    var wordCount = dictionary.length;
    var categories = [];
    var dialects = [];

    for (var i = 0; i < dictionary.length; i++) {
        var word = dictionary[i];
        if (word.category && categories.indexOf(word.category) === -1) {
            categories.push(word.category);
        }
        if (word.dialect && dialects.indexOf(word.dialect) === -1) {
            dialects.push(word.dialect);
        }
    }

    document.getElementById("heroWordCount").textContent = wordCount;
    document.getElementById("heroCatCount").textContent = categories.length;
    document.getElementById("heroDialectCount").textContent = dialects.length;
}

// ==========================================
// BROWSE PAGE
// ==========================================
var currentBrowseFilter = "All";
function initBrowse() {
    var alphaBar = document.getElementById("alphaBar");
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    alphaBar.innerHTML = '<button class="alpha-letter active" onclick="setAlpha(\'All\')">All</button>' + letters.map(function(l) { return '<button class="alpha-letter" onclick="setAlpha(\'' + l + '\')">' + l + '</button>'; }).join("");
    
    var filters = document.getElementById("browseFilters");
    var filterHtml = '<button class="filter-chip active" onclick="filterBrowseCategory(\'All\')">All</button>';
    for (var cat in categoryMeta) {
        filterHtml += '<button class="filter-chip" onclick="filterBrowseCategory(\'' + cat + '\')">' + cat + '</button>';
    }
    filters.innerHTML = filterHtml;
    renderBrowseResults();
}

function setAlpha(letter) {
    var btns = document.querySelectorAll(".alpha-letter");
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
    event.currentTarget.classList.add("active");
    renderBrowseResults();
}

function filterBrowseCategory(cat) {
    currentBrowseFilter = cat;
    var btns = document.querySelectorAll(".filter-chip");
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
    if (event && event.currentTarget) event.currentTarget.classList.add("active");
    renderBrowseResults();
}

function renderBrowseResults() {
    var activeLetterBtn = document.querySelector(".alpha-letter.active");
    var activeLetter = activeLetterBtn ? activeLetterBtn.textContent : "All";
    var filtered = [];
    for (var i = 0; i < dictionary.length; i++) {
        var w = dictionary[i];
        var catMatch = currentBrowseFilter === "All" || w.category === currentBrowseFilter;
        var letterMatch = activeLetter === "All" || w.bikol[0].toUpperCase() === activeLetter;
        if (catMatch && letterMatch) filtered.push(w);
    }
    
    var container = document.getElementById("browseResults");
    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-msg">No words found.</p>';
    } else {
        container.innerHTML = filtered.map(renderWordCard).join("");
    }
}

// ==========================================
// FAVORITES
// ==========================================
function displayFavorites() {
    var favs = getFavorites();
    var container = document.getElementById("favoritesContainer");
    if (favs.length === 0) { container.innerHTML = '<p class="empty-msg">No favorites yet. Tap the heart icon to save words!</p>'; return; }
    var favWords = dictionary.filter(function(w) { return favs.indexOf(w.bikol) !== -1; });
    container.innerHTML = favWords.map(renderWordCard).join("");
}

function toggleFavorite(bikol) {
    var favs = getFavorites();
    var index = favs.indexOf(bikol);
    if (index !== -1) {
        favs.splice(index, 1);
    } else {
        favs.push(bikol);
    }
    saveFavorites(favs);
    renderPopularWords(); displayFavorites(); renderBrowseResults(); updateModalFavBtn();
}

// ==========================================
// DETAIL MODAL
// ==========================================
var currentModalWord = null;
function openDetail(bikol) {
    currentModalWord = dictionary.find(function(w) { return w.bikol === bikol; });
    if (!currentModalWord) return;
    
    document.getElementById("modalWord").textContent = currentModalWord.bikol;
    document.getElementById("modalPronunciation").textContent = currentModalWord.pronunciation ? "[ " + currentModalWord.pronunciation + " ]" : "";
    document.getElementById("modalPos").textContent = currentModalWord.pos;
    document.getElementById("modalDialect").textContent = currentModalWord.dialect; 
    
    // Primary and Secondary Translation Logic
    var primaryText = "";
    var secondaryHtml = "";

    if (currentLangMode === 'en') {
        primaryText = currentModalWord.english;
        if (currentModalWord.tagalog) {
            secondaryHtml = '<div class="modal-section modal-dynamic-section"><h4 class="modal-section-title">Tagalog Translation</h4>' +
                '<div style="font-size: 18px; font-weight: 700; color: #4338CA;">' + 
                currentModalWord.tagalog + 
                '</div></div>';
        }
    } else if (currentLangMode === 'tl') {
        primaryText = currentModalWord.tagalog || currentModalWord.english;
        if (currentModalWord.tagalog && currentModalWord.english) {
            secondaryHtml = '<div class="modal-section modal-dynamic-section"><h4 class="modal-section-title">English Translation</h4>' +
                '<div style="font-size: 18px; font-weight: 700; color: var(--text);">' + currentModalWord.english + '</div></div>';
        }
    } else { // 'all'
        primaryText = currentModalWord.english;
        if (currentModalWord.tagalog) {
            secondaryHtml = '<div class="modal-section modal-dynamic-section"><h4 class="modal-section-title">Tagalog Translation</h4>' +
                '<div style="font-size: 18px; font-weight: 700; color: #4338CA;">' + currentModalWord.tagalog + '</div></div>';
        }
    }

    document.getElementById("modalEnglish").textContent = primaryText;
    document.getElementById("modalCategory").textContent = currentModalWord.category;
    
    // Clear old dynamic sections
    var oldTagalogSec = document.getElementById("modalTagalogSection");
    if (oldTagalogSec) oldTagalogSec.remove();
    var dynamicSecs = document.querySelectorAll(".modal-dynamic-section");
    dynamicSecs.forEach(function(s) { s.remove(); });

    // Inject secondary translation
    if (secondaryHtml) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = secondaryHtml;
        var newSec = tempDiv.firstChild;
        var exSec = document.getElementById("modalExamplesSection");
        exSec.parentNode.insertBefore(newSec, exSec);
    }
    
    var exSec = document.getElementById("modalExamplesSection");
    if (currentModalWord.examples && currentModalWord.examples.length > 0) {
        exSec.style.display = "block";
        var exHtml = "";
        for (var i = 0; i < currentModalWord.examples.length; i++) {
            var ex = currentModalWord.examples[i];
            exHtml += '<div class="example-box"><div class="example-bikol">' + ex.bikol + '</div><div class="example-eng">' + ex.english + '</div></div>';
        }
        document.getElementById("modalExamples").innerHTML = exHtml;
    } else {
        exSec.style.display = "none";
    }

    var synSec = document.getElementById("modalSynonymsSection");
    if (currentModalWord.synonyms && currentModalWord.synonyms.length > 0) {
        synSec.style.display = "block";
        var synHtml = "";
        for (var j = 0; j < currentModalWord.synonyms.length; j++) {
            synHtml += '<span class="synonym-tag">' + currentModalWord.synonyms[j] + '</span>';
        }
        document.getElementById("modalSynonyms").innerHTML = synHtml;
    } else {
        synSec.style.display = "none";
    }

    updateModalFavBtn();
    document.getElementById("modal").classList.add("active");
}

function openWotdDetail() {
    var wotdText = document.getElementById("wotdWord").textContent;
    if(wotdText && wotdText !== "Loading...") openDetail(wotdText);
}

function closeModal() { document.getElementById("modal").classList.remove("active"); }
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", function(e) { if (e.target.id === "modal") closeModal(); });
document.getElementById("modalSpeakBtn").addEventListener("click", function() { if(currentModalWord) speakWord(currentModalWord.bikol); });

function toggleModalFav() { if(currentModalWord) toggleFavorite(currentModalWord.bikol); }
function updateModalFavBtn() {
    var btn = document.getElementById("modalFavBtn");
    if (!btn) return;
    if (currentModalWord && getFavorites().indexOf(currentModalWord.bikol) !== -1) {
        btn.innerHTML = '<i class="fas fa-heart"></i>'; 
        btn.classList.add("active");
    } else {
        btn.innerHTML = '<i class="far fa-heart"></i>'; 
        btn.classList.remove("active");
    }
}

// ==========================================
// LEARN PAGE
// ==========================================
var quizState = { questions: [], current: 0, correct: 0, wrong: 0, answered: false, type: 'bikol' };

function startQuiz(type) {
    quizState = { questions: getRandomQuestions(10), current: 0, correct: 0, wrong: 0, answered: false, type: type };
    document.getElementById("learnMenu").style.display = "none";
    renderQuiz();
}

function getRandomQuestions(count) {
    var shuffled = dictionary.slice().sort(function() { return Math.random() - 0.5; });
    var selected = shuffled.slice(0, count);
    var questions = [];
    for (var i = 0; i < selected.length; i++) {
        var word = selected[i];
        var wrong = dictionary.filter(function(w) { return w.bikol !== word.bikol; }).sort(function() { return Math.random() - 0.5; }).slice(0, 3);
        var options = wrong.concat([word]).sort(function() { return Math.random() - 0.5; });
        questions.push({ word: word, options: options, correct: word.bikol });
    }
    return questions;
}

function renderQuiz() {
    var act = document.getElementById("learnActivity");
    if (quizState.current >= quizState.questions.length) {
        var pct = Math.round((quizState.correct / quizState.questions.length) * 100);
        act.innerHTML = '<div class="quiz-container" style="text-align:center">' +
            '<h2 style="margin-bottom:10px;">Quiz Complete!</h2>' +
            '<div style="font-size:48px; font-weight:900; color: ' + (pct >= 70 ? 'var(--green)' : 'var(--accent)') + '; margin:20px 0;">' + pct + '%</div>' +
            '<p style="margin-bottom:24px;">' + quizState.correct + ' out of ' + quizState.questions.length + ' correct</p>' +
            '<button class="control-btn" style="background: var(--muted);" onclick="resetLearnMenu()">Back to Menu</button>' +
        '</div>';
        return;
    }
    var q = quizState.questions[quizState.current];
    var progress = ((quizState.current) / quizState.questions.length) * 100;
    var isBikolQuiz = quizState.type === 'bikol';
    var promptWord = isBikolQuiz ? q.word.bikol : q.word.english;
    var optionsHtml = q.options.map(function(opt) {
        var val = isBikolQuiz ? opt.english : opt.bikol;
        return '<button class="quiz-option" data-val="' + opt.bikol + '" onclick="answerQuiz(this, \'' + opt.bikol + '\')">' + val + '</button>';
    }).join("");

    act.innerHTML = '<div class="quiz-container">' +
        '<div class="quiz-progress"><div class="quiz-progress-fill" style="width:' + progress + '%"></div></div>' +
        '<div class="quiz-score"><span class="score-item score-correct"><i class="fas fa-check"></i> ' + quizState.correct + '</span><span class="score-item score-wrong"><i class="fas fa-times"></i> ' + quizState.wrong + '</span></div>' +
        '<div class="quiz-question"><div class="quiz-prompt">What does this mean?</div><div class="quiz-word">' + promptWord + '</div></div>' +
        '<div class="quiz-options">' + optionsHtml + '</div>' +
    '</div>';
}

function answerQuiz(btn, selectedBikol) {
    if (quizState.answered) return;
    quizState.answered = true;
    var q = quizState.questions[quizState.current];
    var isCorrect = selectedBikol === q.correct;
    if (isCorrect) quizState.correct++; else quizState.wrong++;
    var allBtns = document.querySelectorAll(".quiz-option");
    for (var i = 0; i < allBtns.length; i++) {
        var b = allBtns[i];
        if (b.getAttribute("data-val") === q.correct) b.classList.add("correct");
        else if (b === btn && !isCorrect) b.classList.add("wrong");
        b.classList.add("disabled");
    }
    setTimeout(function() { quizState.current++; quizState.answered = false; renderQuiz(); }, 1200);
}

function startFlashcards() {
    document.getElementById("learnMenu").style.display = "none";
    nextFlashcard();
}

function nextFlashcard() {
    var word = dictionary[Math.floor(Math.random() * dictionary.length)];
    var act = document.getElementById("learnActivity");
    var exHtml = (word.examples && word.examples.length > 0) ? '<div class="flashcard-sub">"' + word.examples[0].bikol + '"</div>' : '';
    
    var mainMeaning = "";
    var subMeaningHtml = "";

    if (currentLangMode === 'en') {
        mainMeaning = word.english;
    } else if (currentLangMode === 'tl') {
        mainMeaning = word.tagalog || word.english;
    } else { // all
        mainMeaning = word.english;
        if (word.tagalog) {
            subMeaningHtml = '<div style="font-size: 18px; color: #E0E0E0; margin-top: -5px; margin-bottom: 10px;">' + word.tagalog + '</div>';
        }
    }

    act.innerHTML = '<div style="text-align:center">' +
        '<p style="color:var(--muted); margin-bottom:20px;">Tap the card to flip it!</p>' +
        '<div class="flashcard-scene"><div class="flashcard" onclick="this.classList.toggle(\'flipped\')">' +
            '<div class="flashcard-face flashcard-front">' +
                '<div class="flashcard-label">Bikol</div>' +
                '<div class="flashcard-word">' + word.bikol + '</div>' +
                '<div class="flashcard-sub">' + word.pos + ' &bull; ' + word.category + '</div>' +
            '</div>' +
            '<div class="flashcard-face flashcard-back">' +
                '<div class="flashcard-label">' + (currentLangMode === 'tl' ? 'Tagalog' : (currentLangMode === 'all' ? 'English & Tagalog' : 'English')) + '</div>' +
                '<div class="flashcard-word">' + mainMeaning + '</div>' +
                subMeaningHtml +
                exHtml +
            '</div>' +
        '</div></div>' +
        '<div class="fc-btns">' +
            '<button class="control-btn" style="background: var(--accent);" onclick="nextFlashcard()"><i class="fas fa-times"></i> Don\'t Know</button>' +
            '<button class="control-btn" style="background: var(--green);" onclick="nextFlashcard()"><i class="fas fa-check"></i> Know It</button>' +
        '</div>' +
        '<button class="control-btn" onclick="resetLearnMenu()" style="margin-top:15px; background: var(--muted);">Back to Menu</button>' +
    '</div>';
}

function resetLearnMenu() {
    document.getElementById("learnMenu").style.display = "grid";
    document.getElementById("learnActivity").innerHTML = "";
}

// ==========================================
// NAVIGATION & SEARCH
// ==========================================
var searchInput = document.getElementById("searchInput");

// Language Toggle Setup
document.addEventListener("click", function(e) {
    if (e.target && e.target.classList.contains("lang-btn")) {
        var btn = e.target;
        document.querySelectorAll(".lang-btn").forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentLangMode = btn.getAttribute("data-lang");
        
        // Refresh Current View
        var activePage = document.querySelector('.page-view.active');
        if (activePage) {
            if (activePage.id === 'page-home') {
                renderPopularWords();
            } else if (activePage.id === 'page-browse') {
                renderBrowseResults();
            } else if (activePage.id === 'page-favorites') {
                displayFavorites();
            }
        }
    }
});

function switchPage(pageName, btnElement) {
    var pages = document.querySelectorAll('.page-view');
    for (var i = 0; i < pages.length; i++) pages[i].classList.remove('active');
    document.getElementById('page-' + pageName).classList.add('active');
    
    var navBtns = document.querySelectorAll('.nav-btn');
    for (var j = 0; j < navBtns.length; j++) navBtns[j].classList.remove('active');
    if (btnElement) btnElement.classList.add('active');
    else {
        var target = document.querySelector('.nav-btn[onclick*="' + pageName + '"]');
        if (target) target.classList.add('active');
    }
    
    if (searchInput) searchInput.value = '';
    if (pageName === 'browse') initBrowse();
    if (pageName === 'favorites') displayFavorites();
    if (pageName === 'learn') resetLearnMenu();
    window.scrollTo(0, 0);
}

searchInput.addEventListener("input", function() {
    var query = searchInput.value.toLowerCase();
    var activePage = document.querySelector('.page-view.active');
    var pageId = activePage ? activePage.id : 'page-home';

    if (query.length === 0) {
        if (pageId === 'page-home') renderPopularWords();
        else if (pageId === 'page-browse') renderBrowseResults();
        else if (pageId === 'page-favorites') displayFavorites();
        return;
    }

    var searchPool = dictionary;
    if (pageId === 'page-favorites') {
        var favs = getFavorites();
        searchPool = dictionary.filter(function(w) { return favs.indexOf(w.bikol) !== -1; });
    }

    var results = searchPool.filter(function(w) {
        return w.bikol.toLowerCase().indexOf(query) !== -1 || 
               w.english.toLowerCase().indexOf(query) !== -1 ||
               (w.tagalog && w.tagalog.toLowerCase().indexOf(query) !== -1) ||
               w.pos.toLowerCase().indexOf(query) !== -1;
    });

    var containerId = "popularWords";
    if (pageId === 'page-browse') containerId = "browseResults";
    else if (pageId === 'page-favorites') containerId = "favoritesContainer";

    var container = document.getElementById(containerId);
    if (results.length === 0) {
        container.innerHTML = '<p class="empty-msg">No words found.</p>';
    } else {
        container.innerHTML = results.map(renderWordCard).join("");
    }
});

// ==========================================
// INIT
// ==========================================
async function init() {
    // Show a loading state
    document.getElementById("wotdWord").textContent = "Connecting to cloud...";
    
    // 1. Fetch the data first!
    await fetchWords();
    
    // 2. If the database is empty, fallback gracefully
    if (dictionary.length === 0) {
        document.getElementById("wotdWord").textContent = "No words found";
        document.getElementById("wotdMeaning").textContent = "Add words in Supabase";
        return;
    }

    // 3. Safe check for Speech API
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
    }
    
    // 4. Setup Word of the Day
    var today = new Date();
    var dayIndex = today.getDate() % dictionary.length;
    var wotd = dictionary[dayIndex];
    
    document.getElementById("wotdWord").textContent = wotd.bikol;
    document.getElementById("wotdPos").textContent = wotd.pos;
    
    var wotdMeaning = currentLangMode === 'tl' ? (wotd.tagalog || wotd.english) : wotd.english;
    var tagalogSuffix = (currentLangMode === 'all' && wotd.tagalog) ? " (TL: " + wotd.tagalog + ")" : "";
    document.getElementById("wotdMeaning").textContent = wotdMeaning + tagalogSuffix;
    
    // 5. Render the UI
    renderCategories();
    renderPopularWords();
    updateHeroStats();
}

init();