// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getArticleContent') {
    // Extract article content from the current page
    const articleData = extractArticleContent();
    sendResponse({ article: articleData });
  }
  return true;
});

// Extract article content from the current page
function extractArticleContent() {
  // Try to find the article content
  const articleSelectors = [
    'article',
    '[role="article"]',
    '.article',
    '.post-content',
    '.entry-content',
    '.content',
    'main'
  ];
  
  let articleElement = null;
  
  // Try each selector until we find something
  for (const selector of articleSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      // Find the element with the most text content
      let maxLength = 0;
      let maxElement = null;
      
      elements.forEach(el => {
        const text = el.textContent.trim();
        if (text.length > maxLength) {
          maxLength = text.length;
          maxElement = el;
        }
      });
      
      if (maxElement && maxLength > 500) {
        articleElement = maxElement;
        break;
      }
    }
  }
  
  // If we didn't find a good article element, use the body
  if (!articleElement) {
    articleElement = document.body;
  }
  
  // Get title from meta tags or page title
  let title = '';
  const metaTitle = document.querySelector('meta[property="og:title"]');
  if (metaTitle) {
    title = metaTitle.getAttribute('content');
  } else {
    title = document.title;
  }
  
  // Clean the title
  title = title.replace(/[-|].*$/, '').trim();
  
  // Get source from meta tags or domain
  let source = '';
  const metaPublisher = document.querySelector('meta[property="og:site_name"]');
  if (metaPublisher) {
    source = metaPublisher.getAttribute('content');
  } else {
    source = window.location.hostname.replace('www.', '');
  }
  
  // Clean up the article text
  const paragraphs = articleElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
  const textParts = [];
  
  paragraphs.forEach(p => {
    const text = p.textContent.trim();
    if (text.length > 20) {
      textParts.push(text);
    }
  });
  
  // If we couldn't find paragraphs, use the whole text
  let articleText = textParts.join('\n\n');
  if (articleText.length < 200) {
    articleText = articleElement.textContent
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  return {
    title,
    source,
    content: articleText,
    url: window.location.href
  };
}

// Create float button
function createFloatButton() {
  // Only create the button on news sites
  const isNewsSite = checkIfNewsSite();
  if (!isNewsSite) {
    return;
  }
  
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'news-lens-float-button';
  buttonContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    align-items: center;
    padding: 12px;
    background: linear-gradient(90deg, #4F46E5 0%, #2563EB 100%);
    border-radius: 50px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: 0.9;
  `;
  
  // Add icon and text
  buttonContainer.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
      <g fill="#FFFFFF">
        <path d="M32 36h48v8H32zM32 52h64v4H32zM32 60h64v4H32zM32 68h64v4H32zM32 76h32v4H32z" />
        <path d="M84 80c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20z" fill="none" stroke="#FFFFFF" stroke-width="4"/>
        <path d="M64 80l-8-12" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
        <circle cx="64" cy="80" r="4" />
      </g>
    </svg>
    <span style="color: white; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Analyze Bias
    </span>
  `;
  
  // Add hover effect
  buttonContainer.onmouseover = () => {
    buttonContainer.style.transform = 'translateY(-2px)';
    buttonContainer.style.opacity = '1';
  };
  
  buttonContainer.onmouseout = () => {
    buttonContainer.style.transform = 'translateY(0)';
    buttonContainer.style.opacity = '0.9';
  };
  
  // Add click handler
  buttonContainer.onclick = () => {
    const articleData = extractArticleContent();
    
    chrome.runtime.sendMessage({
      action: 'analyzeText',
      text: articleData.content,
      title: articleData.title,
      source: articleData.source,
      url: articleData.url,
      options: {
        findRelatedSources: true,
        generateNeutral: true
      }
    });
  };
  
  // Add to page
  document.body.appendChild(buttonContainer);
}

// Check if the current site is likely a news site
function checkIfNewsSite() {
  const domain = window.location.hostname.toLowerCase();
  
  // Common news domains
  const newsDomains = [
    'nytimes.com',
    'washingtonpost.com',
    'wsj.com',
    'cnn.com',
    'foxnews.com',
    'bbc.com',
    'bbc.co.uk',
    'reuters.com',
    'apnews.com',
    'bloomberg.com',
    'nbcnews.com',
    'cbsnews.com',
    'abcnews.go.com',
    'politico.com',
    'thehill.com',
    'npr.org',
    'usatoday.com',
    'latimes.com',
    'chicagotribune.com',
    'newsweek.com',
    'time.com',
    'vox.com',
    'huffpost.com',
    'guardian.co.uk',
    'theguardian.com',
    'aljazeera.com',
    'economist.com',
    'ft.com',
    'breitbart.com',
    'nypost.com',
    'dailymail.co.uk',
    'cnbc.com',
    'msnbc.com',
    'buzzfeednews.com'
  ];
  
  // Check if domain matches any known news domains
  for (const newsDomain of newsDomains) {
    if (domain.includes(newsDomain)) {
      return true;
    }
  }
  
  // Check for common news keywords in the URL
  const newsKeywords = ['news', 'article', 'politics', 'opinion', 'world', 'national', 'business', 'sport'];
  for (const keyword of newsKeywords) {
    if (window.location.href.toLowerCase().includes(keyword)) {
      return true;
    }
  }
  
  // Check page content for article indicators
  const hasArticleElement = document.querySelector('article, [role="article"], .article');
  const hasHeadline = document.querySelector('h1');
  const hasDataPublished = document.querySelector('[data-publish-date], [datetime], time');
  
  if (hasArticleElement && hasHeadline && hasDataPublished) {
    return true;
  }
  
  return false;
}

// Initialize the content script
function initialize() {
  // Create float button after a short delay to ensure page is loaded
  setTimeout(createFloatButton, 1500);
}

// Run initialization
initialize();