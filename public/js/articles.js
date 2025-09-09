async function loadArticles() {
  try {
    const response = await fetch("../data/articles.json");
    if (!response.ok) throw new Error("Gagal memuat articles.json");

    const articles = await response.json();
    const container = document.getElementById("articlesContainer");

    container.innerHTML = articles
      .map(
        (article, index) => `
        <article class="card">
          <img src="${article.image}" alt="${article.title}">
          <div class="card-body">
            <h3 class="card-title">${article.title}</h3>
            <p class="card-text">${article.summary}</p>
            <a href="article-detail.html?id=${index}" class="card-link">Baca Selengkapnya →</a>
          </div>
        </article>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error load articles:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadArticles);
