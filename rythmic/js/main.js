// Import the news module
import { newsModule } from './rss.js';

// Main application functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    startCountdownTimer();
    updateCurrentDate();
});

// Initialize the application
async function initializeApp() {
    setupTheme();
    setupGenres();
    setupCountries();
    await loadInitialNews();
}

// Set dark theme by default
function setupTheme() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
}

// Share news function
async function shareNews(url) {
    try {
        if (navigator.share) {
            await navigator.share({
                url: decodeURIComponent(url)
            });
        } else {
            // Fallback to clipboard copy
            await navigator.clipboard.writeText(decodeURIComponent(url));
            showNotification('Link copied to clipboard!');
        }
    } catch (error) {
        console.error('Error sharing:', error);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-sm shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Setup genres dropdown
function setupGenres() {
    const genreSelect = document.getElementById('genre');
    const genres = [
        { value: 'world', label: '🌍 World' },
        { value: 'technology', label: '💻 Technology' },
        { value: 'business', label: '💼 Business' },
        { value: 'science', label: '🔬 Science' },
        { value: 'health', label: '🏥 Health' },
        { value: 'entertainment', label: '🎭 Entertainment' },
        { value: 'sports', label: '⚽ Sports' },
        { value: 'politics', label: '🏛️ Politics' }
    ];
    
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.value;
        option.innerHTML = genre.label;
        genreSelect.appendChild(option);
    });
}

// Setup countries dropdown
function setupCountries() {
    const countrySelect = document.getElementById('country');
    const countries = [
        { value: 'global', label: '🌐 Global' },
        { value: 'india', label: '🇮🇳 India' },
        { value: 'us', label: '🇺🇸 United States' },
        { value: 'uk', label: '🇬🇧 United Kingdom' },
        { value: 'eu', label: '🇪🇺 European Union' },
        { value: 'asia', label: '🌏 Asia' },
        { value: 'africa', label: '🌍 Africa' },
        { value: 'australia', label: '🇦🇺 Australia' }
    ];
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.value;
        option.innerHTML = country.label;
        countrySelect.appendChild(option);
    });
}

// News rendering
let currentPage = 1;
const newsPerPage = 12;
let currentNews = [];

function showLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.remove('hidden');
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.add('hidden');
}

async function loadInitialNews() {
    try {
        const newsGrid = document.getElementById('newsGrid');
        newsGrid.innerHTML = '<div class="text-center text-gray-600">Loading news...</div>';
        showLoadingSpinner();

        const news = await newsModule.fetchAllNews();
        currentNews = news;
        renderNewsPage(1);
    } catch (error) {
        console.error('Error loading initial news:', error);
        showError('Failed to load news. Please try again later.');
    } finally {
        hideLoadingSpinner();
    }
}

function getRandomCardSize() {
    const sizes = ['card-sm', 'card-md', 'card-lg'];
    const weights = [0.6, 0.3, 0.1]; // 60% small, 30% medium, 10% large
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (random < sum) return sizes[i];
    }
    return sizes[0];
}

function getCategoryName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function createNewsCard(news) {
    const card = document.createElement('div');
    const cardSize = getRandomCardSize();
    card.className = `news-card ${cardSize} relative overflow-hidden group transition-transform duration-300 hover:scale-102`;
    
    if (news.image) {
        // Card with image
        card.innerHTML = `
            <div class="relative h-full">
                <img 
                    src="${news.image}" 
                    alt="${news.title}"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    onerror="this.parentElement.parentElement.className = 'news-card ${cardSize} no-image-card relative'"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
                <div class="absolute bottom-0 left-0 right-0 p-3">
                    <div class="flex items-center gap-1 mb-1">
                        <span class="text-white text-xs uppercase tracking-wider">${getCategoryName(news.category)}</span>
                        ${news.heat > 0.8 ? '<span class="text-yellow-400 text-xs">TRENDING</span>' : ''}
                    </div>
                    <h3 class="text-white font-norwester text-sm mb-1 line-clamp-2">${news.title}</h3>
                    <div class="flex justify-between items-center text-xs text-gray-200">
                        <span class="flex items-center gap-1">
                            ${news.source}
                        </span>
                        <span class="flex items-center gap-1">
                            ${formatDate(news.pubDate)}
                        </span>
                    </div>
                </div>
                <div class="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-center">
                    <p class="text-white text-xs mb-2">${truncateText(news.description, cardSize === 'card-lg' ? 150 : 100)}</p>
                    <button class="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors w-full">
                        Read More
                    </button>
                </div>
            </div>
        `;
    } else {
        // Card without image (gradient background)
        const gradients = [
            'bg-gradient-to-br from-blue-500 to-purple-600',
            'bg-gradient-to-br from-green-500 to-teal-600',
            'bg-gradient-to-br from-red-500 to-pink-600',
            'bg-gradient-to-br from-yellow-500 to-orange-600'
        ];
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        
        card.className = `news-card ${cardSize} ${randomGradient} relative p-3 text-white`;
        card.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="flex items-center gap-1 mb-1">
                    <span class="text-lg">${getNewsEmoji(news.category)}</span>
                    ${news.heat > 0.8 ? '<span class="text-yellow-400 text-sm">🔥</span>' : ''}
                </div>
                <h3 class="font-bold text-sm mb-1 line-clamp-2">${news.title}</h3>
                <p class="text-xs text-white/80 line-clamp-2 mb-1">${truncateText(news.description, cardSize === 'card-lg' ? 100 : 75)}</p>
                <div class="flex justify-between items-center text-xs text-white/70 mt-auto">
                    <span class="flex items-center gap-1">${news.source}</span>
                    <span class="flex items-center gap-1">${formatDate(news.pubDate)}</span>
                </div>
            </div>
            <div class="absolute bottom-2 right-2 text-6xl opacity-10 pointer-events-none">
                ${getNewsEmoji(news.category)}
            </div>
        `;
    }

    // Add ad space after every 6th card
    if ((currentNews.indexOf(news) + 1) % 6 === 0) {
        const adSpace = document.createElement('div');
        adSpace.className = `news-card ${getRandomCardSize()} ad-space bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900`;
        adSpace.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center p-3 text-center">
                <span class="text-2xl mb-1">📢</span>
                <p class="text-sm font-semibold">Ad Space</p>
                <button class="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors">
                    Place Ad
                </button>
            </div>
        `;
        card.parentElement?.insertBefore(adSpace, card.nextSibling);
    }

    card.addEventListener('click', () => showNewsDetail(news));
    return card;
}

function renderNewsPage(page) {
    const start = (page - 1) * newsPerPage;
    const end = start + newsPerPage;
    const newsToRender = currentNews.slice(start, end);
    
    const newsGrid = document.getElementById('newsGrid');
    
    if (page === 1) {
        newsGrid.innerHTML = '';
    }

    newsToRender.forEach(news => {
        const card = createNewsCard(news);
        newsGrid.appendChild(card);
    });
}

// News detail popup
// Calculate string similarity using Levenshtein distance
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longerLength - distance) / longerLength;
}

// Levenshtein distance implementation
function levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }

    return matrix[str2.length][str1.length];
}

function showNewsDetail(news) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50';
    
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-90vh overflow-y-auto relative">
            ${news.image ? `
                <div class="relative h-64 md:h-96">
                    <img src="${news.image}" alt="${news.title}" class="w-full h-full object-cover rounded-t-lg">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-6">
                        <span class="text-white text-sm uppercase tracking-wider mb-2">${getCategoryName(news.category)}</span>
                        <h2 class="text-white text-2xl md:text-3xl font-norwester">${news.title}</h2>
                    </div>
                </div>
            ` : `
                <div class="bg-black dark:bg-white text-white dark:text-black p-6 rounded-t-lg">
                    <span class="text-sm uppercase tracking-wider mb-2">${getCategoryName(news.category)}</span>
                    <h2 class="text-2xl md:text-3xl font-norwester">${news.title}</h2>
                </div>
            `}
            <div class="p-4">
                <!-- Full content with proper styling -->
                <div class="prose dark:prose-invert max-w-none">
                    ${news.content ? `
                        <div class="text-gray-800 dark:text-gray-200">${news.content}</div>
                    ` : `
                        <p class="text-gray-600 dark:text-gray-300">${news.description}</p>
                    `}
                </div>

                <div class="mt-6 flex flex-wrap gap-2 items-center justify-between border-t dark:border-gray-700 pt-4">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400">${news.source}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">${formatDate(news.pubDate)}</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.open('${news.link}', '_blank')" 
                            class="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded text-sm hover:opacity-80 transition-opacity flex items-center gap-1">
                            Read Original
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button onclick="shareNews('${encodeURIComponent(news.link)}')"
                            class="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded text-sm hover:opacity-80 transition-opacity">
                            Share
                        </button>
                    </div>
                </div>
            </div>
            <button class="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Close modal when clicking outside or on close button
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('button')) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Utility functions
function formatDate(date) {
    const now = Date.now();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function truncateText(text, length) {
    const stripped = text.replace(/<[^>]*>/g, '');
    return stripped.length > length ? stripped.slice(0, length) + '...' : stripped;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Filters handling
async function handleFilters() {
    const genre = document.getElementById('genre').value;
    const country = document.getElementById('country').value;
    const searchQuery = document.getElementById('search').value;

    showLoadingSpinner();
    try {
        const filteredNews = newsModule.filterNews(currentNews, {
            category: genre,
            country: country,
            searchQuery: searchQuery
        });

        currentNews = filteredNews;
        currentPage = 1;
        renderNewsPage(1);
    } finally {
        hideLoadingSpinner();
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Filters
    document.getElementById('genre').addEventListener('change', handleFilters);
    document.getElementById('country').addEventListener('change', handleFilters);
    document.getElementById('search').addEventListener('input', debounce(handleFilters, 300));

    // Infinite scroll
    window.addEventListener('scroll', debounce(handleInfiniteScroll, 100));
}

// Infinite scroll
function handleInfiniteScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        currentPage++;
        renderNewsPage(currentPage);
    }
}

// Date and countdown
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    dateElement.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function startCountdownTimer() {
    const timerElement = document.getElementById('nextUpdate');
    
    function updateTimer() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        
        const diff = midnight - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// Error handling
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg z-50 animate-fade-in';
    errorDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => {
        errorDiv.classList.add('animate-fade-out');
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}
