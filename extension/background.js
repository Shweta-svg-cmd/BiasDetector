// Base API URL - update this to your deployed API endpoint
const API_BASE_URL = 'https://rest-express.username.repl.co/api';

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'analyzeUrl':
      analyzeArticleFromUrl(request.url, request.options, sendResponse);
      break;
    case 'analyzeText':
      analyzeArticleFromText(request.text, request.options, sendResponse);
      break;
    case 'extractArticle':
      extractArticleFromPage(sender.tab.id, sendResponse);
      break;
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  // Return true to indicate we will send a response asynchronously
  return true;
});

/**
 * Analyze article from URL
 */
async function analyzeArticleFromUrl(url, options, sendResponse) {
  try {
    // Get API keys from storage
    const apiKeys = await getApiKeys();
    
    // Prepare request data
    const requestData = {
      url: url,
      findRelatedSources: options.findRelatedSources,
      generateNeutral: options.generateNeutral
    };
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include API keys as headers if configured
        ...(apiKeys.openai && { 'X-OpenAI-Key': apiKeys.openai }),
        ...(apiKeys.newsapi && { 'X-NewsAPI-Key': apiKeys.newsapi })
      },
      body: JSON.stringify(requestData)
    });
    
    // Check for errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze article');
    }
    
    // Send the analysis result back to popup
    const result = await response.json();
    sendResponse({ result });
  } catch (error) {
    console.error('Error analyzing URL:', error);
    sendResponse({ error: error.message || 'Failed to analyze article. Please try again.' });
  }
}

/**
 * Analyze article from text content
 */
async function analyzeArticleFromText(text, options, sendResponse) {
  try {
    // Get API keys from storage
    const apiKeys = await getApiKeys();
    
    // Try to extract a title from the first line or first sentence
    let title = '';
    const firstLine = text.split('\n')[0].trim();
    if (firstLine && firstLine.length < 200) {
      title = firstLine;
      // Remove the title from the text to avoid duplication
      text = text.substring(firstLine.length).trim();
    } else {
      // Use the first sentence as title
      const firstSentence = text.split(/[.!?]/)[0].trim();
      if (firstSentence && firstSentence.length < 200) {
        title = firstSentence;
      } else {
        title = 'Untitled Article';
      }
    }
    
    // Prepare request data
    const requestData = {
      text: text,
      title: title,
      findRelatedSources: options.findRelatedSources,
      generateNeutral: options.generateNeutral
    };
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include API keys as headers if configured
        ...(apiKeys.openai && { 'X-OpenAI-Key': apiKeys.openai }),
        ...(apiKeys.newsapi && { 'X-NewsAPI-Key': apiKeys.newsapi })
      },
      body: JSON.stringify(requestData)
    });
    
    // Check for errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze article');
    }
    
    // Send the analysis result back to popup
    const result = await response.json();
    sendResponse({ result });
  } catch (error) {
    console.error('Error analyzing text:', error);
    sendResponse({ error: error.message || 'Failed to analyze article. Please try again.' });
  }
}

/**
 * Extract article content from the current page
 */
async function extractArticleFromPage(tabId, sendResponse) {
  try {
    // Execute content script to extract article
    chrome.scripting.executeScript({
      target: { tabId },
      function: () => {
        // Simple article extraction logic
        function extractArticle() {
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
        
        return extractArticle();
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }
      
      if (results && results[0] && results[0].result) {
        sendResponse({ article: results[0].result });
      } else {
        sendResponse({ error: 'Could not extract article from page' });
      }
    });
  } catch (error) {
    console.error('Error extracting article:', error);
    sendResponse({ error: error.message || 'Failed to extract article from page' });
  }
}

/**
 * Get API keys from storage
 */
async function getApiKeys() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKeys'], (result) => {
      resolve(result.apiKeys || {});
    });
  });
}