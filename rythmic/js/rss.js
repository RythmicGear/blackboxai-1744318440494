// Mock data for development and rate limit fallback
const MOCK_NEWS = [
    {
        title: "Breaking: Major Tech Innovation Unveiled",
        description: "A revolutionary new technology promises to transform how we interact with digital devices. Industry experts are calling it a game-changer in the field of human-computer interaction.",
        link: "#",
        image: "assets/images/icon-base.svg",
        pubDate: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        source: "TechDaily",
        category: "technology",
        heat: 0.9
    },
    {
        title: "Global Climate Summit Reaches Historic Agreement",
        description: "World leaders have come together to sign a groundbreaking climate accord that sets ambitious targets for reducing carbon emissions over the next decade.",
        link: "#",
        image: "assets/images/icon-base.svg",
        pubDate: Date.now() - 1000 * 60 * 45, // 45 minutes ago
        source: "WorldNews",
        category: "world",
        heat: 0.85
    },
    {
        title: "Breakthrough in Quantum Computing Research",
        description: "Scientists have achieved a major milestone in quantum computing, successfully demonstrating a new method for reducing error rates in quantum calculations.",
        link: "#",
        image: "assets/images/icon-base.svg",
        pubDate: Date.now() - 1000 * 60 * 60, // 1 hour ago
        source: "ScienceToday",
        category: "science",
        heat: 0.8
    },
    {
        title: "Market Update: Tech Stocks Surge on AI News",
        description: "Technology sector sees significant gains as investors react to announcements of new artificial intelligence developments from major tech companies.",
        link: "#",
        image: "assets/images/icon-base.svg",
        pubDate: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
        source: "MarketWatch",
        category: "business",
        heat: 0.75
    },
    {
        title: "New Health Study Reveals Benefits of Mediterranean Diet",
        description: "Research confirms significant health benefits associated with Mediterranean eating patterns, including reduced risk of cardiovascular disease.",
        link: "#",
        image: "assets/images/icon-base.svg",
        pubDate: Date.now() - 1000 * 60 * 120, // 2 hours ago
        source: "HealthNews",
        category: "health",
        heat: 0.7
    },
    {
        title: "Exciting New Developments in Space Exploration",
        description: "NASA announces plans for a new mission to Mars, aiming to send humans to the red planet by the end of the decade.",
        link: "#",
        image: "assets/images/icon-base.svg",
        pubDate: Date.now() - 1000 * 60 * 150, // 2.5 hours ago
        source: "SpaceNews",
        category: "science",
        heat: 0.65
    },
    {
        title: "The Future of Renewable Energy: Innovations Ahead",
        description: "Experts discuss the latest advancements in solar and wind energy technologies that could reshape the energy landscape.",
        link: "#",
        image: "assets/images/icon-base.svg",
        pubDate: Date.now() - 1000 * 60 * 180, // 3 hours ago
        source: "EnergyToday",
        category: "business",
        heat: 0.6
    }
];

// RSS Feed configuration
const RSS_FEEDS = {
    world: [
        'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        'https://feeds.bbci.co.uk/news/world/rss.xml',
        'https://www.reuters.com/rssfeed/world',
        'https://feeds.aljazeera.net/articles/news',
        'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
        'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml',
    ],
    technology: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
        'https://feeds.bbci.co.uk/news/technology/rss.xml',
        'https://www.wired.com/feed/rss',
        'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms',
        'https://www.hindustantimes.com/feeds/rss/tech/rssfeed.xml',
    ],
    business: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
        'https://feeds.bbci.co.uk/news/business/rss.xml',
        'https://www.forbes.com/business/feed/',
        'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms',
        'https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml',
    ],
    science: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
        'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
        'https://www.sciencenews.org/feed/',
    ],
    health: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
        'https://feeds.bbci.co.uk/news/health/rss.xml',
        'https://www.webmd.com/rss',
    ],
    entertainment: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Movies.xml',
        'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
        'https://www.ew.com/feed/',
    ],
    sports: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
        'https://feeds.bbci.co.uk/news/sport/rss.xml',
        'https://www.espn.com/espn/rss/news',
    ],
    politics: [
        'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
        'https://feeds.bbci.co.uk/news/politics/rss.xml',
        'https://www.politico.com/rss/politics.xml',
    ]
};

// Cache keys
const CACHE_KEYS = {
    NEWS: 'rythmic_news',
    TIMESTAMP: 'rythmic_last_fetch'
};

// Add delay between requests to avoid rate limiting
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch and parse RSS feeds
async function fetchRSSFeed(url) {
    try {
        // Add a delay before each request to avoid rate limiting
        await delay(1000);
        
        // Using RSS2JSON API to convert RSS to JSON
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
        
        if (response.status === 429) {
            console.log('Rate limit hit, using mock data...');
            return MOCK_NEWS;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error(`Error fetching RSS feed from ${url}:`, error);
        return MOCK_NEWS;
    }
}

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

// Process news items and remove duplicates
function processNewsItems(items) {
    const processedItems = items.map(item => ({
        title: item.title,
        description: item.description,
        content: item.content || item.description,
        link: item.link,
        image: item.enclosure?.link || item.thumbnail || findImageInContent(item.content) || null,
        pubDate: new Date(item.pubDate).getTime(),
        source: item.author || extractSourceFromLink(item.link),
        heat: calculateHeat(item),
        category: detectCategory(item)
    }));

    // Remove duplicate news based on title similarity
    const uniqueNews = [];
    const seenTitles = new Set();

    processedItems.forEach(item => {
        // Normalize title for comparison
        const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Check if we've seen a similar title
        let isDuplicate = false;
        for (const seenTitle of seenTitles) {
            const similarity = calculateSimilarity(normalizedTitle, seenTitle);
            if (similarity > 0.8) { // 80% similarity threshold
                isDuplicate = true;
                break;
            }
        }
        
        if (!isDuplicate) {
            seenTitles.add(normalizedTitle);
            uniqueNews.push(item);
        }
    });

    return uniqueNews;
}

// Find image in content
function findImageInContent(content) {
    if (!content) return null;
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : null;
}

// Extract source from link
function extractSourceFromLink(link) {
    try {
        const url = new URL(link);
        return url.hostname.replace(/^www\./, '').split('.')[0];
    } catch {
        return 'Unknown Source';
    }
}

// Calculate heat (trending score)
function calculateHeat(item) {
    const now = Date.now();
    const age = now - new Date(item.pubDate).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    // Base heat on age (newer = hotter)
    let heat = Math.max(0, 1 - age / maxAge);
    
    // Bonus for having an image
    if (item.enclosure?.link || item.thumbnail) heat += 0.1;
    
    // Bonus for longer description
    if (item.description?.length > 200) heat += 0.1;
    
    return Math.min(1, heat);
}

// Detect category based on content
function detectCategory(item) {
    const content = `${item.title} ${item.description}`.toLowerCase();
    
    const categoryPatterns = {
        technology: /tech|software|ai|robot|cyber|digital|computer|smartphone|internet/,
        business: /business|economy|market|stock|trade|finance|company/,
        science: /science|research|study|discovery|space|physics|biology|chemistry/,
        health: /health|medical|covid|disease|vaccine|doctor|medicine|wellness/,
        entertainment: /movie|film|music|celebrity|entertainment|hollywood|tv|show/,
        sports: /sport|football|soccer|basketball|tennis|athlete|game|match|tournament/,
        politics: /politic|government|election|president|congress|senate|vote|law/,
        world: /world|global|international|country|nation|foreign/
    };
    
    for (const [category, pattern] of Object.entries(categoryPatterns)) {
        if (pattern.test(content)) return category;
    }
    
    return 'general';
}

// Process feeds in batches to avoid rate limiting
async function processFeedBatch(feeds, category) {
    let batchNews = [];
    for (const feed of feeds) {
        const items = await fetchRSSFeed(feed);
        const processedItems = processNewsItems(items).map(item => ({
            ...item,
            category: category
        }));
        batchNews = [...batchNews, ...processedItems];
        // Add a small delay between feeds in the same batch
        await delay(500);
    }
    return batchNews;
}

// Main function to fetch all news
async function fetchAllNews() {
    const lastFetch = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
    const now = new Date().getTime();

    // Check if cache is still valid (less than 1 hour old)
    if (lastFetch && (now - parseInt(lastFetch)) < 3600000) {
        const cachedNews = localStorage.getItem(CACHE_KEYS.NEWS);
        if (cachedNews) {
            return JSON.parse(cachedNews);
        }
    }

    let allNews = [];
    let rateLimited = false;
    
    try {
        // Process each category's feeds in sequence
        for (const [category, feeds] of Object.entries(RSS_FEEDS)) {
            console.log(`Fetching ${category} news...`);
            const categoryNews = await processFeedBatch(feeds, category);
            if (categoryNews.length === 0) {
                rateLimited = true;
                break;
            }
            allNews = [...allNews, ...categoryNews];
        }

        // If rate limited, use mock data
        if (rateLimited || allNews.length === 0) {
            console.log('Using mock data due to rate limiting...');
            allNews = MOCK_NEWS;
        }

        // Sort by heat and date
        allNews.sort((a, b) => b.heat - a.heat || b.pubDate - a.pubDate);

        // Cache the results
        localStorage.setItem(CACHE_KEYS.NEWS, JSON.stringify(allNews));
        localStorage.setItem(CACHE_KEYS.TIMESTAMP, now.toString());

        return allNews;
    } catch (error) {
        console.error('Error fetching news:', error);
        // Return mock data if error occurs
        return MOCK_NEWS;
    }
}

// Filter news based on criteria
function filterNews(news, { category = 'all', country = 'all', searchQuery = '' }) {
    return news.filter(item => {
        // Category filter
        if (category !== 'all' && item.category !== category) return false;
        
        // Country filter (basic implementation)
        if (country !== 'all') {
            const source = item.source.toLowerCase();
            if (country === 'us' && !source.includes('us')) return false;
            if (country === 'uk' && !source.includes('uk')) return false;
            if (country === 'india' && !source.includes('india') && !source.includes('hindustan')) return false;
        }
        
        // Search query
        if (searchQuery) {
            const searchContent = `${item.title} ${item.description}`.toLowerCase();
            const terms = searchQuery.toLowerCase().split(' ');
            return terms.every(term => searchContent.includes(term));
        }
        
        return true;
    });
}

// Export the module
export const newsModule = {
    fetchAllNews,
    filterNews
};
