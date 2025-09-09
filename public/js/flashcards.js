(async function () {
  const container = document.getElementById("flashcards-container");
  const categorySelect = document.getElementById("categorySelect");
  let flashcardsData = [];

  async function loadFlashcards() {
    try {
      const res = await fetch("../data/flashcards.json");
      if (!res.ok) throw new Error("Gagal memuat flashcards.json");
      return await res.json();
    } catch (err) {
      console.error("Error load flashcards:", err);
      return [];
    }
  }

  function createFlashcard(term, definition) {
    const card = document.createElement("div");
    card.className = "flashcard";
    card.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-front"><h3>${term}</h3></div>
        <div class="flashcard-back"><p>${definition}</p></div>
      </div>
    `;
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    return card;
  }

  function renderFlashcards(category = "all") {
    container.innerHTML = "";
    const filtered = category === "all"
      ? flashcardsData
      : flashcardsData.filter(fc => fc.category === category);

    filtered.forEach(({ term, definition }) => {
      container.appendChild(createFlashcard(term, definition));
    });
  }

  function renderCategories() {
    const categories = [...new Set(flashcardsData.map(fc => fc.category))];
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  }

  // Init
  flashcardsData = await loadFlashcards();
  renderCategories();
  renderFlashcards();

  categorySelect.addEventListener("change", (e) => {
    renderFlashcards(e.target.value);
  });
})();
