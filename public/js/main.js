// === MAIN SCRIPT V11 (Dynamic Header/Footer Loading) ===
document.addEventListener("DOMContentLoaded", () => {
  if (window.isPageInitialized) return;

  const app = {
    config: {
      themeKey: "lk-theme",
      modeKey: "lk-mode",
      homepageUrl: "homepage.html",
      headerPath: "",
      footerPath: "",
      articlesDataPath: "",
      flashcardsDataPath: "",
      dictionaryDataPath: ""
    },

    // --- FUNGSI INIT UTAMA (SEKARANG ASYNC) ---
    async init() {
      // Tentukan path relatif berdasarkan lokasi file
      const path = window.location.pathname;
      const isSubPage = path.includes('/pages/');
      const prefix = isSubPage ? "../" : "";

      this.config.headerPath = `${prefix}components/header.html`;
      this.config.footerPath = `${prefix}components/footer.html`;
      this.config.articlesDataPath = `${prefix}data/articles.json`;
      this.config.flashcardsDataPath = `${prefix}data/flashcards.json`;
      this.config.dictionaryDataPath = `${prefix}data/terms.json`;
      
      // Muat komponen HTML terlebih dahulu
      await this.loadComponent('header', this.config.headerPath, isSubPage);
      await this.loadComponent('footer', this.config.footerPath);
      
      // Jalankan fungsionalitas lainnya SETELAH komponen dimuat
      this.initDarkModeToggle();
      this.initModeSelection();
      this.applyModeContent();
      this.initHomepageScripts();
      this.initHomepageArticles();
      this.initArticlesPage();
      this.initArticleDetailPage();
      this.initFlashcards();
      this.initDictionary();
      this.updateFooterYear();

      window.isPageInitialized = true;
    },

 // --- FUNGSI BARU (DIPERBAIKI): Memuat Komponen (Header/Footer) ---
    async loadComponent(elementId, path, isSubPage = false) {
        const placeholder = document.getElementById(`${elementId}-placeholder`);
        if (!placeholder) return;

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Gagal memuat ${path}`);
            let content = await response.text();

            // Jika ini adalah halaman di dalam folder 'pages/',
            // tambahkan '../' ke semua link yang relevan.
            if (isSubPage) {
                content = content.replace(/href="([^"]*)"/g, (match, url) => {
                    // Jangan ubah link eksternal atau link yang sudah benar
                    if (url.startsWith('http') || url.startsWith('#') || url.startsWith('../')) {
                        return match;
                    }
                    // Tambahkan '../' ke link lokal
                    return `href="../${url}"`;
                }).replace(/src="([^"]*)"/g, (match, url) => { // Lakukan juga untuk 'src' jika ada gambar
                    if (url.startsWith('http') || url.startsWith('#') || url.startsWith('../')) {
                        return match;
                    }
                    return `src="../${url}"`;
                });
            }
            
            placeholder.outerHTML = content;

        } catch (error) {
            console.error(error);
            placeholder.innerHTML = `<p style="color:red; text-align:center;">Gagal memuat bagian ${elementId}. Periksa nama folder (components) dan jalankan via Live Server.</p>`;
        }
    },
    
    // --- THEME ---
    initDarkModeToggle() {
      const toggleButton = document.getElementById("darkModeToggle");
      if (!toggleButton) return;
      const applyTheme = (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        toggleButton.textContent = theme === "dark" ? "☀️" : "🌙";
      };
      toggleButton.addEventListener("click", () => {
        const newTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
        applyTheme(newTheme);
        localStorage.setItem(this.config.themeKey, newTheme);
      });
      const savedTheme = localStorage.getItem(this.config.themeKey);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(savedTheme || (prefersDark ? "dark" : "light"));
    },

    // --- MODE ---
    initModeSelection() {
      const friendlyBtn = document.getElementById("choose-friendly");
      if (!friendlyBtn) return;

      const moderateBtn = document.getElementById("choose-moderate");
      const setMode = (mode) => localStorage.setItem(this.config.modeKey, mode);
      const getSavedMode = () => localStorage.getItem(this.config.modeKey);
      const goToHomepage = () => (window.location.href = this.config.homepageUrl);

      friendlyBtn.addEventListener("click", () => { setMode("friendly"); goToHomepage(); });
      moderateBtn.addEventListener("click", () => { setMode("moderate"); goToHomepage(); });
      
      const savedMode = getSavedMode();
      const banner = document.getElementById("remember-banner");
      const label = document.getElementById("remember-mode-label");
      if (savedMode && banner && label) {
          label.textContent = savedMode.charAt(0).toUpperCase() + savedMode.slice(1);
          banner.hidden = false;
          document.getElementById("continue-with-saved")?.addEventListener("click", goToHomepage);
          document.getElementById("choose-another")?.addEventListener("click", () => (banner.hidden = true));
      }
    },
    
    // --- Apply Mode ---
    applyModeContent() {
      const savedMode = localStorage.getItem(this.config.modeKey) || "friendly";
      const friendlyEls = document.querySelectorAll("[data-mode='friendly']");
      const moderateEls = document.querySelectorAll("[data-mode='moderate']");
      
      if (savedMode === "moderate") {
        friendlyEls.forEach(el => el.hidden = true);
        moderateEls.forEach(el => el.hidden = false);
      } else {
        friendlyEls.forEach(el => el.hidden = false);
        moderateEls.forEach(el => el.hidden = true);
      }
    },

    // --- FOOTER ---
    updateFooterYear() {
      const yearSpan = document.querySelector("#year");
      if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    },

    // --- HOMEPAGE ---
    initHomepageScripts() {
      const startBtn = document.getElementById('start-btn');
      if (!startBtn) return;
      startBtn.addEventListener('click', () => {
        document.getElementById('main-options')?.scrollIntoView({ behavior: 'smooth' });
      });
    },

    // --- HOMEPAGE ARTICLES (Latest & Popular) ---
    async initHomepageArticles() {
      const latestContainer = document.getElementById("latestArticlesContainer");
      const popularContainer = document.getElementById("popularArticlesContainer");
      if (!latestContainer && !popularContainer) return;

      try {
        const res = await fetch(this.config.articlesDataPath);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const articles = await res.json();
        
        const latest = [...articles].sort((a,b) => new Date(b.dateISO) - new Date(a.dateISO)).slice(0,3);
        const popular = [...articles].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0,3);

        if (latestContainer) {
          latestContainer.innerHTML = latest.map(a => `
            <article class="article-card">
              <h3><a href="pages/article-detail.html?slug=${a.slug}">${a.title}</a></h3>
              <p class="muted">${a.summary}</p>
              <small class="muted">📅 ${a.date}</small>
            </article>
          `).join("");
        }
        if (popularContainer) {
          popularContainer.innerHTML = popular.map(a => `
            <article class="article-card">
              <h3><a href="pages/article-detail.html?slug=${a.slug}">${a.title}</a></h3>
              <p class="muted">${a.summary}</p>
              <small class="muted">👁️ ${a.views || 0} views</small>
            </article>
          `).join("");
        }

      } catch (err) {
        console.error("Gagal load artikel:", err);
        if (latestContainer) latestContainer.innerHTML = "<p>Gagal memuat artikel terbaru.</p>";
        if (popularContainer) popularContainer.innerHTML = "<p>Gagal memuat artikel populer.</p>";
      }
    },

    // ... (Sisa fungsi lainnya seperti initArticlesPage, initFlashcards, dll. tetap sama) ...
    // --- ARTICLES PAGE ---
    async initArticlesPage() {
      const container = document.getElementById("articlesContainer");
      if (!container) return;
      try {
        const response = await fetch(this.config.articlesDataPath);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const articles = await response.json();
        container.innerHTML = articles.map(article => `
          <article class="article-card">
            <h3><a href="article-detail.html?slug=${article.slug}">${article.title}</a></h3>
            <p class="muted">${article.summary}</p>
            <div class="card-actions">
              <a href="article-detail.html?slug=${article.slug}" class="btn btn-ghost">Baca Selengkapnya</a>
            </div>
          </article>
        `).join('');
      } catch (error) {
        console.error("Gagal memuat daftar artikel:", error);
        container.innerHTML = "<p style='text-align: center;'>Gagal memuat daftar artikel.</p>";
      }
    },

    // --- ARTICLE DETAIL PAGE ---
async initArticleDetailPage() {
  const contentEl = document.getElementById("articleContent");
  if (!contentEl) return;

  const titleEl = document.getElementById("articleTitle");
  const dateEl = document.getElementById("articleDate");

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    document.title = "Artikel Tidak Valid - Yuk Literasi Keuangan";
    titleEl.textContent = "Artikel Tidak Valid";
    contentEl.innerHTML = `<p class="muted">Slug artikel tidak ditemukan di URL.</p>`;
    return;
  }

  try {
    const response = await fetch(this.config.articlesDataPath);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const articles = await response.json();

    const article = articles.find(a => a.slug === slug);

    if (article) {
      // Ambil mode
      const savedMode = localStorage.getItem(this.config.modeKey) || "friendly";
      let content = savedMode === "moderate" 
        ? article.contentModerate || article.contentFriendly 
        : article.contentFriendly || article.contentModerate;

      // Update Title & Content
      document.title = `${article.title} - Yuk Literasi Keuangan`;
      titleEl.textContent = article.title;
      dateEl.textContent = `📅 Dipublikasikan pada ${article.date}`;
      contentEl.innerHTML = content;

      // Update Meta Tags (SEO + Share)
      const desc = article.summary || "Artikel literasi keuangan.";
      this.updateMeta("description", desc);
      this.updateMeta("og:title", article.title);
      this.updateMeta("og:description", desc);
      this.updateMeta("og:url", window.location.href);

    } else {
      document.title = "Artikel Tidak Ditemukan - Yuk Literasi Keuangan";
      titleEl.textContent = "Artikel Tidak Ditemukan";
      contentEl.innerHTML = `<p class="muted">Maaf, artikel dengan slug "<strong>${slug}</strong>" tidak tersedia.</p>`;
    }
  } catch (error) {
    console.error("Kesalahan saat memuat detail artikel:", error);
    document.title = "Gagal Memuat Artikel - Yuk Literasi Keuangan";
    titleEl.textContent = "Gagal Memuat Artikel";
    contentEl.innerHTML = "<p style='color:red;'>Terjadi kesalahan saat mengambil data artikel.</p>";
  }
},

// --- HELPER: Update Meta ---
updateMeta(property, content) {
  let tag = document.querySelector(`meta[name="${property}"], meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    if (property.startsWith("og:")) {
      tag.setAttribute("property", property);
    } else {
      tag.setAttribute("name", property);
    }
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
},

// --- ARTICLES PAGE ---
async initArticlesPage() {
  const container = document.getElementById("articlesContainer");
  const searchInput = document.getElementById("articleSearchInput");
  if (!container) return;

  try {
    const response = await fetch(this.config.articlesDataPath);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const articles = await response.json();

    // fungsi render artikel
    const renderArticles = (list) => {
      if (list.length === 0) {
        container.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>Tidak ada artikel ditemukan.</p>";
        return;
      }
      container.innerHTML = list.map(article => `
        <article class="article-card">
          <h3><a href="article-detail.html?slug=${article.slug}">${article.title}</a></h3>
          <p class="muted">${article.summary}</p>
          <div class="card-actions">
            <a href="article-detail.html?slug=${article.slug}" class="btn btn-ghost">Baca Selengkapnya</a>
          </div>
        </article>
      `).join('');
    };

    // render semua artikel saat pertama
    renderArticles(articles);

    // event untuk search
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = articles.filter(article =>
          article.title.toLowerCase().includes(keyword) ||
          article.summary.toLowerCase().includes(keyword)
        );
        renderArticles(filtered);
      });
    }

  } catch (error) {
    console.error("Gagal memuat daftar artikel:", error);
    container.innerHTML = "<p style='text-align: center;'>Gagal memuat daftar artikel.</p>";
  }
},

    // --- FLASHCARDS ---
    // Fungsi ini sekarang hanya bertugas untuk me-render (menampilkan) kartu
    renderFlashcards(list, container, savedMode) {
      if (!container) return;
      if (list.length === 0) {
        container.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>Tidak ada flashcard ditemukan.</p>";
        return;
      }

      const defKey = savedMode === "moderate" ? "definitionModerate" : "definitionFriendly";
      container.innerHTML = list.map(card => `
        <div class="flashcard" tabindex="0" aria-label="Flashcard: ${card.term}. Klik atau tekan Enter untuk membalik.">
          <div class="flashcard-inner">
            <div class="flashcard-front"><h3>${card.term}</h3></div>
            <div class="flashcard-back"><p>${card[defKey] || "Belum ada definisi"}</p></div>
          </div>
        </div>
      `).join('');

      // Tambahkan kembali event listener untuk membalik kartu
      container.querySelectorAll('.flashcard').forEach(card => {
        const flipCard = () => card.classList.toggle('flipped');
        card.addEventListener('click', flipCard);
        card.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            flipCard();
          }
        });
      });
    },

    // Fungsi baru untuk menginisialisasi halaman flashcard, termasuk search
    async initFlashcards() {
      const container = document.getElementById("flashcards-container");
      const searchInput = document.getElementById("flashcardSearchInput");
      if (!container) return;

      try {
        const response = await fetch(this.config.flashcardsDataPath);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const allFlashcards = await response.json();
        
        const savedMode = localStorage.getItem(this.config.modeKey) || "friendly";

        // Tampilkan semua flashcard saat halaman pertama kali dimuat
        this.renderFlashcards(allFlashcards, container, savedMode);

        // Tambahkan event listener untuk search bar
        if (searchInput) {
          searchInput.addEventListener("input", (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            const filteredFlashcards = allFlashcards.filter(card => 
              card.term.toLowerCase().includes(keyword)
            );
            this.renderFlashcards(filteredFlashcards, container, savedMode);
          });
        }

      } catch (error) {
        console.error("Gagal memuat flashcards:", error);
        container.innerHTML = "<p style='text-align:center; grid-column:1/-1;'>Gagal memuat flashcards.</p>";
      }
    },

    // --- DICTIONARY ---
    async initDictionary() {
      const searchInput = document.getElementById("searchInput");
      const suggestionsBox = document.getElementById("suggestions");
      const resultBox = document.getElementById("searchResult");
      if (!searchInput || !suggestionsBox || !resultBox) return;

      let termsData = {};
      try {
        const res = await fetch(this.config.dictionaryDataPath);
        if (!res.ok) throw new Error("Gagal memuat terms.json");
        termsData = await res.json();
      } catch (err) {
        console.error("Error load terms:", err);
        resultBox.innerHTML = "<p>Gagal memuat kamus istilah.</p>";
        return;
      }

      const savedMode = localStorage.getItem(this.config.modeKey) || "friendly";
      const defKey = savedMode === "moderate" ? "definitionModerate" : "definitionFriendly";

      function findMatches(keyword) {
        const matches = [];
        for (const category in termsData) {
          termsData[category].forEach((item) => {
            if (item.term.toLowerCase().includes(keyword.toLowerCase())) {
              matches.push({ 
                term: item.term, 
                definition: item[defKey], 
                category 
              });
            }
          });
        }
        return matches;
      }

      function showSuggestions(keyword) {
        suggestionsBox.innerHTML = "";
        if (!keyword) return;
        const matches = findMatches(keyword);
        matches.slice(0, 5).forEach(({ term, category }) => {
          const item = document.createElement("div");
          item.className = "suggestion-item";
          item.innerHTML = `<strong>${term}</strong> <small>(${category})</small>`;
          item.addEventListener("click", () => {
            searchInput.value = term;
            showResult(term);
            suggestionsBox.innerHTML = "";
          });
          suggestionsBox.appendChild(item);
        });
      }

      function showResult(term) {
        let found = null;
        for (const category in termsData) {
          for (const item of termsData[category]) {
            if (item.term.toLowerCase() === term.toLowerCase()) {
              found = { ...item, category };
              break;
            }
          }
          if (found) break;
        }
        if (found) {
          resultBox.innerHTML = `
            <h4>${found.term}</h4>
            <p><em>Kategori: ${found.category}</em></p>
            <p>${found[defKey]}</p>
          `;
        } else {
          resultBox.innerHTML = "<p>Istilah tidak ditemukan.</p>";
        }
      }

      searchInput.addEventListener("input", (e) => {
        const keyword = e.target.value.trim();
        showSuggestions(keyword);
      });
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          showResult(searchInput.value.trim());
          suggestionsBox.innerHTML = "";
        }
      });
    }
  };

  app.init();
});