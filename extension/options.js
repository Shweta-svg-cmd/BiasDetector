document.addEventListener('DOMContentLoaded', () => {
  // Form elements
  const openaiKeyInput = document.getElementById('openaiKey');
  const newsapiKeyInput = document.getElementById('newsapiKey');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const successMessage = document.getElementById('successMessage');
  
  // Load saved API keys
  loadApiKeys();
  
  // Toggle password visibility buttons
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const inputId = button.getAttribute('data-for');
      const input = document.getElementById(inputId);
      
      if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'Hide';
      } else {
        input.type = 'password';
        button.textContent = 'Show';
      }
    });
  });
  
  // Save settings
  saveBtn.addEventListener('click', saveApiKeys);
  
  // Reset settings
  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings?')) {
      openaiKeyInput.value = '';
      newsapiKeyInput.value = '';
      saveApiKeys();
    }
  });
  
  /**
   * Load API keys from storage
   */
  function loadApiKeys() {
    chrome.storage.local.get(['apiKeys'], (result) => {
      const apiKeys = result.apiKeys || {};
      
      if (apiKeys.openai) {
        openaiKeyInput.value = apiKeys.openai;
      }
      
      if (apiKeys.newsapi) {
        newsapiKeyInput.value = apiKeys.newsapi;
      }
    });
  }
  
  /**
   * Save API keys to storage
   */
  function saveApiKeys() {
    const apiKeys = {
      openai: openaiKeyInput.value.trim(),
      newsapi: newsapiKeyInput.value.trim()
    };
    
    chrome.storage.local.set({ apiKeys }, () => {
      // Show success message
      successMessage.classList.add('visible');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        successMessage.classList.remove('visible');
      }, 3000);
    });
  }
});