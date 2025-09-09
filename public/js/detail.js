// Ambil parameter dari URL
function getQueryParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

async function loadArticleDetail() {
  try {
    // Fetch data artikel
    const response = await fetch("../data/articles.json");
    if (!response.ok) throw new Error("Gagal memuat articles.json");

    const articles = await response.json();

    // Ambil id dari query string (?id=0, ?id=1, dst)
    const id = parseInt(getQueryParam("id"), 10);

    // Validasi id
    if (isNaN(id) || !articles[id]) {
      document.getElementById("articleContent").innerHTML =
        "<p>Artikel tidak ditemukan.</p>";
      document.getElementById("articleTitle").textContent = "Artikel tidak ditemukan";
      document.getElementById("articleDate").textContent = "";
      return;
    }

    const article = articles[id];

    // Isi judul & tanggal (jika ada)
    document.getElementById("articleTitle").textContent = article.title;
    document.getElementById("articleDate").innerHTML = article.date
      ? `<em>Dipublikasikan: ${article.date}</em>`
      : "";

    // Isi konten + gambar (jika ada)
    document.getElementById("articleContent").innerHTML = `
      ${article.image ? `<img src="${article.image}" alt="${article.title}" class="detail-image">` : ""}
      ${article.content}
    `;
  } catch (err) {
    console.error("Error load detail:", err);
    document.getElementById("articleContent").innerHTML =
      "<p>Terjadi kesalahan saat memuat artikel. Coba lagi nanti.</p>";
  }
}

// Jalankan setelah DOM siap
document.addEventListener("DOMContentLoaded", loadArticleDetail);
