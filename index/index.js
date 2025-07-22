const gnewsApiKey = 'b16c204210a7786b4d25affc4ea58b83';
const baseUrl = 'https://gnews.io/api/v4/top-headlines';
const loader = document.getElementById('loader');
const newsContainer = document.getElementById('news-container');

// Show loader
function toggleLoader(show) {
  loader.style.display = show ? 'block' : 'none';
}

// Show ad only once per session
let adLoaded = false;
function showAdOnClick() {
  if (adLoaded) return;
  adLoaded = true;

  const adScript = document.createElement('script');
  adScript.src = "https://propu.sh/pfe/current/tag.min.js?z=xxxxxxxxxx"; // Replace with actual zone ID
  adScript.async = true;
  adScript.setAttribute('data-cfasync', 'false');
  document.body.appendChild(adScript);
}

// Render news cards
function renderArticles(articles) {
  newsContainer.innerHTML = '';

  if (!articles || articles.length === 0) {
    newsContainer.innerHTML = `<p>No articles found.</p>`;
    return;
  }

  articles.forEach(article => {
    const newsCard = document.createElement('div');
    newsCard.classList.add('news-card');

    // Apply dark mode if enabled
    if (document.body.classList.contains('dark-mode')) {
      newsCard.classList.add('dark-mode');
    }

    newsCard.innerHTML = `
      <h3><a href="${article.url}" target="_blank" rel="noopener noreferrer" onclick="showAdOnClick()">
        ${article.title || 'Untitled Article'}
      </a></h3>
      <p>${article.description || 'No description available.'}</p>
      <img src="${article.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
           alt="News image" style="max-width:100%; border-radius: 10px;">
    `;
    newsContainer.appendChild(newsCard);
  });
}

// Display last cached articles if fetch fails
function displayLastCachedArticles() {
  const cachedData = localStorage.getItem('lastNewsData');
  if (cachedData) {
    const articles = JSON.parse(cachedData);
    renderArticles(articles);
    console.warn('Displayed cached news due to API error or limit.');
  } else {
    newsContainer.innerHTML = `<p style="color: red;">Could not load news and no cached data found.</p>`;
  }
}

// Fetch news by category
function fetchNewsByCategory(category) {
  toggleLoader(true);

  // Remove active class from all links
  document.querySelectorAll('.nav-links, .footerlink').forEach(link => link.classList.remove('active'));

  const clickedLink = Array.from(document.querySelectorAll('.nav-links, .footerlink'))
    .find(link => link.innerText.toLowerCase() === category.toLowerCase());
  if (clickedLink) clickedLink.classList.add('active');

  const url = `${baseUrl}?token=${gnewsApiKey}&lang=en&country=in&topic=${category}&max=6`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.articles && data.articles.length > 0) {
        localStorage.setItem('lastNewsData', JSON.stringify(data.articles));
        renderArticles(data.articles);
      } else {
        displayLastCachedArticles();
      }
    })
    .catch(err => {
      console.error('Error fetching news:', err);
      displayLastCachedArticles();
    })
    .finally(() => toggleLoader(false));
}

// Search news by keyword
function searchNews() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  toggleLoader(true);
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&token=${gnewsApiKey}&lang=en&country=in&max=6`;

  document.querySelectorAll('.nav-links').forEach(link => link.classList.remove('active'));

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.articles && data.articles.length > 0) {
        localStorage.setItem('lastNewsData', JSON.stringify(data.articles));
        renderArticles(data.articles);
      } else {
        displayLastCachedArticles();
      }
    })
    .catch(err => {
      console.error('Error searching news:', err);
      displayLastCachedArticles();
    })
    .finally(() => toggleLoader(false));
}

// Load general news on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchNewsByCategory('general');
  document.getElementById('year').textContent = new Date().getFullYear();
});
