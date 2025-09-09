(async function () {
  const searchInput = document.getElementById("searchInput");
  const suggestionsBox = document.getElementById("suggestions");
  const resultBox = document.getElementById("searchResult");
  let termsData = {};

  async function loadTerms() {
    try {
      const res = await fetch("../data/terms.json");
      if (!res.ok) throw new Error("Gagal memuat terms.json");
      return await res.json();
    } catch (err) {
      console.error("Error load terms:", err);
      return {};
    }
  }

  function findMatches(keyword) {
    const matches = [];
    for (const category in termsData) {
      termsData[category].forEach(({ term, definition }) => {
        if (term.toLowerCase().includes(keyword.toLowerCase())) {
          matches.push({ term, definition, category });
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
        <p>${found.definition}</p>
        <div class="search-actions">
          <a href="articles.html" class="btn">Belajar lebih lanjut</a>
        </div>
      `;
    } else {
      resultBox.innerHTML = `<p>Istilah tidak ditemukan.</p>`;
    }
  }

  // Init
  termsData = await loadTerms();

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
})();
