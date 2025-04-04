document.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  const analyzeTabBtn = document.getElementById('analyzeTabBtn');
  const historyTabBtn = document.getElementById('historyTabBtn');
  const analyzeTab = document.getElementById('analyzeTab');
  const historyTab = document.getElementById('historyTab');
  
  analyzeTabBtn.addEventListener('click', () => {
    analyzeTabBtn.classList.add('active');
    historyTabBtn.classList.remove('active');
    analyzeTab.classList.add('active');
    historyTab.classList.remove('active');
  });
  
  historyTabBtn.addEventListener('click', () => {
    historyTabBtn.classList.add('active');
    analyzeTabBtn.classList.remove('active');
    historyTab.classList.add('active');
    analyzeTab.classList.remove('active');
    loadHistory();
  });
  
  // Analyze current page
  const analyzePageBtn = document.getElementById('analyzePage');
  analyzePageBtn.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        analyzeUrl(currentTab.url);
      }
    });
  });
  
  // Analyze input
  const analyzeInputBtn = document.getElementById('analyzeInput');
  const articleInput = document.getElementById('articleInput');
  
  analyzeInputBtn.addEventListener('click', () => {
    const input = articleInput.value.trim();
    if (!input) {
      return;
    }
    
    if (isValidUrl(input)) {
      analyzeUrl(input);
    } else {
      analyzeText(input);
    }
  });
  
  // Open full app
  const openFullAppBtn = document.getElementById('openFullApp');
  openFullAppBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://your-deployed-app-url.com' });
  });
  
  // Settings button
  const openSettingsBtn = document.getElementById('openSettings');
  openSettingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Load history on startup
  loadHistory();
});

// Check if string is a valid URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Analyze URL
function analyzeUrl(url) {
  const findRelatedSources = document.getElementById('findRelatedSources').checked;
  const generateNeutral = document.getElementById('generateNeutral').checked;
  
  // Show loading state
  setLoading(true);
  
  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'analyzeUrl',
    url: url,
    options: {
      findRelatedSources,
      generateNeutral
    }
  }, (response) => {
    setLoading(false);
    
    if (response.error) {
      showError(response.error);
      return;
    }
    
    // Store in history and open results page
    storeInHistory(response.result);
    openResultsPage(response.result.article.id);
  });
}

// Analyze text
function analyzeText(text) {
  const findRelatedSources = document.getElementById('findRelatedSources').checked;
  const generateNeutral = document.getElementById('generateNeutral').checked;
  
  // Show loading state
  setLoading(true);
  
  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'analyzeText',
    text: text,
    options: {
      findRelatedSources,
      generateNeutral
    }
  }, (response) => {
    setLoading(false);
    
    if (response.error) {
      showError(response.error);
      return;
    }
    
    // Store in history and open results page
    storeInHistory(response.result);
    openResultsPage(response.result.article.id);
  });
}

// Set loading state
function setLoading(isLoading) {
  const analyzePageBtn = document.getElementById('analyzePage');
  const analyzeInputBtn = document.getElementById('analyzeInput');
  
  if (isLoading) {
    analyzePageBtn.disabled = true;
    analyzePageBtn.textContent = 'Analyzing...';
    analyzeInputBtn.disabled = true;
    analyzeInputBtn.textContent = '...';
  } else {
    analyzePageBtn.disabled = false;
    analyzePageBtn.textContent = 'Analyze Current Page';
    analyzeInputBtn.disabled = false;
    analyzeInputBtn.textContent = 'Analyze';
  }
}

// Show error message
function showError(message) {
  // Create and show error toast
  alert(message);
}

// Store analysis in history
function storeInHistory(result) {
  chrome.storage.local.get(['history'], (data) => {
    const history = data.history || [];
    
    // Add new item at the beginning
    history.unshift({
      id: result.article.id,
      title: result.article.title,
      source: result.article.source || 'Unknown Source',
      biasScore: result.article.biasScore || 0,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the last 20 items
    const trimmedHistory = history.slice(0, 20);
    
    // Save back to storage
    chrome.storage.local.set({ history: trimmedHistory });
  });
}

// Load history items
function loadHistory() {
  const historyList = document.getElementById('historyList');
  
  chrome.storage.local.get(['history'], (data) => {
    const history = data.history || [];
    
    if (history.length === 0) {
      historyList.innerHTML = '<div class="empty-history">No analysis history yet</div>';
      return;
    }
    
    historyList.innerHTML = '';
    
    history.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'history-item';
      itemElement.style.borderLeftColor = getBiasColor(item.biasScore);
      
      itemElement.innerHTML = `
        <div class="history-item-title">${escapeHtml(item.title)}</div>
        <div class="history-item-meta">
          <div class="history-item-source">${escapeHtml(item.source)}</div>
          <div class="bias-indicator">
            <div class="bias-indicator-dot" style="background-color: ${getBiasColor(item.biasScore)}"></div>
            ${getBiasLabel(item.biasScore)}
          </div>
        </div>
      `;
      
      itemElement.addEventListener('click', () => {
        openResultsPage(item.id);
      });
      
      historyList.appendChild(itemElement);
    });
  });
}

// Get color based on bias score
function getBiasColor(score) {
  if (score <= 20) return '#10B981'; // Low bias - green
  if (score <= 40) return '#34D399'; // Slightly biased - light green
  if (score <= 60) return '#FBBF24'; // Moderately biased - yellow
  if (score <= 80) return '#F59E0B'; // Biased - orange
  return '#EF4444';                  // Highly biased - red
}

// Get bias label based on score
function getBiasLabel(score) {
  if (score <= 20) return 'Low bias';
  if (score <= 40) return 'Slight';
  if (score <= 60) return 'Moderate';
  if (score <= 80) return 'Biased';
  return 'High bias';
}

// Open results page
function openResultsPage(articleId) {
  chrome.tabs.create({ url: `https://your-deployed-app-url.com/analysis/${articleId}` });
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}