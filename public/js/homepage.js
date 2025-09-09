// js/homepage.js

// Scroll ke section pilihan konten
const btnScroll = document.getElementById("btnScroll");
if (btnScroll) {
  btnScroll.addEventListener("click", () => {
    const target = document.getElementById("pilihanKonten");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
}

// Search istilah sederhana
const searchBar = document.getElementById("searchBar");
const searchBtn = document.getElementById("searchBtn");
const searchResult = document.getElementById("searchResult");

async function loadTerms() {
  try {
    const response = await fetch("../data/terms.json");
    if (!response.ok) throw new Error("Gagal memuat terms.json");
    return await response.json();
  } catch (error) {
    console.error("Error load terms:", error);
    return {};
  }
}

if (searchBtn) {
  searchBtn.addEventListener("click", async () => {
    const keyword = searchBar.value.trim().toLowerCase();
    if (!keyword) return;

    const terms = await loadTerms();
    const meaning = terms[keyword];

    if (meaning) {
      searchResult.innerHTML = `
        <h4>Hasil:</h4>
        <p>${meaning}</p>
        <a href="pages/articles.html">Belajar lebih lanjut</a>
      `;
    } else {
      searchResult.innerHTML = `<p>Istilah tidak ditemukan.</p>`;
    }
  });
}

// === Konten Utama Dinamis ===
async function loadArticles() {
  try {
    const response = await fetch("../data/articles.json");
    if (!response.ok) throw new Error("Gagal memuat articles.json");
    const articles = await response.json();

    const container = document.getElementById("pilihanKonten");
    if (!container) return;

    container.innerHTML = articles
      .map(
        (article) => `
        <div class="card">
          <img src="${article.image}" alt="${article.title}">
          <div class="card-body">
            <h3>${article.title}</h3>
            <p>${article.summary}</p>
            <a href="${article.link}" class="btn">Baca Selengkapnya</a>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error load articles:", error);
  }
}

// jalankan loadArticles saat halaman siap
document.addEventListener("DOMContentLoaded", loadArticles);

// Navbar sticky effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;
  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});
