/**
 * DapperFoxes Wedding Website
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initNavigation();
  initPoll();
  initPhotoGallery();
  initPollResults();
  initComments();
});

/**
 * Mobile Navigation Toggle
 */
function initNavigation() {
  const navToggle = document.querySelector('.nav__toggle');
  const navList = document.querySelector('.nav__list');
  
  if (navToggle) {
    navToggle.addEventListener('click', function() {
      navList.classList.toggle('nav__list--open');
    });
  }
  
  // Add active class to current page in navigation
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.nav__link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });
}

/**
 * Poll Functionality
 */
function initPoll() {
  // The poll now uses Google Forms embedded in an iframe
  // This function is kept as a placeholder for potential future enhancements
  
  // Adjust iframe height based on content if needed
  const googleFormIframe = document.querySelector('.google-form-container iframe');
  if (googleFormIframe) {
    // Add any iframe-specific functionality here if needed in the future
    console.log('Google Form iframe loaded');
  }
}

/**
 * Poll Results Functionality
 */
function initPollResults() {
  const pollResultsContainer = document.getElementById('poll-results');
  
  if (!pollResultsContainer) {
    console.error('Poll results container not found!');
    return;
  }
  
  // Show loading message
  pollResultsContainer.innerHTML = '<p class="poll-results__loading">Loading poll results...</p>';
  
  // Fetch poll results
  fetchPollResults()
    .then(results => {
      renderPollResults(results, pollResultsContainer);
    })
    .catch(error => {
      console.error('Error fetching poll results:', error);
      pollResultsContainer.innerHTML = `<p class="poll-results__error">Unable to load poll results. ${error.message}</p>`;
    });
}

/**
 * Fetch poll results
 * @return {Promise<Object>} Promise resolving to poll results data
 */
async function fetchPollResults() {
  console.log('fetchPollResults called');
  
  // Google Apps Script Web App URL - same as used for comments
  // Update this URL with the new deployment URL after updating the Google Apps Script
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxE-r-2jO4jgRaVcVWO7SSSJY9gwTDmsDnLsHkOndI0FqpTdMj2YT1odmtMg8pRVzWScA/exec';
  
  try {
    // Add poll=true parameter to request poll results
    // Add cache-busting parameter to prevent caching
    const cacheBuster = new Date().getTime();
    console.log('Fetching poll results with URL:', `${WEB_APP_URL}?poll=true&_=${cacheBuster}`);
    const response = await fetch(`${WEB_APP_URL}?poll=true&_=${cacheBuster}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch poll results');
    }
    
    console.log('Response received:', data);
    
    // Check if pollResults exists in the response
    if (data.locations) {
      console.log('Poll results found:', data.locations);
      return { locations: data.locations, totalVotes: data.totalVotes };
    } else {
      console.warn('Poll results not found in response, using fallback data');
      console.log('Response data keys:', Object.keys(data));
      
      // Try to make a direct request to the server for poll results
      console.log('Attempting direct request for poll results...');
      const directResponse = await fetch(`${WEB_APP_URL}?poll=true&direct=true&_=${new Date().getTime()}`);
      const directData = await directResponse.json();
      console.log('Direct response received:', directData);
      
      if (directData.locations) {
        console.log('Poll results found in direct response:', directData.locations);
        return { locations: directData.locations, totalVotes: directData.totalVotes };
      }
      // Fallback to mock data if the structure is unexpected
      return {
        locations: [
          { name: 'England', votes: 12, id: 'england' },
          { name: 'Los Angeles', votes: 8, id: 'la' },
          { name: 'Minnesota', votes: 15, id: 'minnesota' },
          { name: 'Other', votes: 5, id: 'other' }
        ],
        totalVotes: 40
      };
    }
  } catch (error) {
    console.error('Error fetching poll results:', error);
    
    // Fallback to mock data if API fetch fails
    console.log('Using fallback mock data for poll results');
    return {
      locations: [
        { name: 'England', votes: 12, id: 'england' },
        { name: 'Los Angeles', votes: 8, id: 'la' },
        { name: 'Minnesota', votes: 15, id: 'minnesota' },
        { name: 'Other', votes: 5, id: 'other' }
      ],
      totalVotes: 40
    };
  }
}

/**
 * Render poll results in the container
 * @param {Object} results - The poll results data
 * @param {HTMLElement} container - The container element
 */
function renderPollResults(results, container) {
  if (!results || !results.locations || results.locations.length === 0) {
    container.innerHTML = '<p class="poll-results__error">No poll results available.</p>';
    return;
  }
  
  // Create HTML for the poll results
  let html = '<div class="poll-results__chart">';
  
  // Calculate percentages and create bars for each location
  results.locations.forEach(location => {
    const percentage = Math.round((location.votes / results.totalVotes) * 100);
    
    // Set explicit colors with cache-busting
    const color = location.id === 'england' ? '#FF3366' :
                  location.id === 'la' ? '#FF6B35' :
                  location.id === 'minnesota' ? '#3A5FCD' :
                  stringToColor(location.name + new Date().getTime());
    
    html += `
      <div class="poll-location" style="--location-color: ${color}">
        <div class="poll-location__header">
          <span class="poll-location__name">${location.name}</span>
          <span class="poll-location__percentage">${percentage}%</span>
        </div>
        <div class="poll-location__bar-container">
          <div class="poll-location__bar poll-location__bar--${location.id}" style="width: ${percentage}%; background-color: ${location.id === 'other' ? stringToColor(location.name) : ''}"></div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Add total votes
  html += `<div class="poll-results__total">Total votes: ${results.totalVotes}</div>`;
  
  // Set the HTML
  container.innerHTML = html;
  
  // Add animation effect - bars start at 0 width and animate to full width
  setTimeout(() => {
    const bars = container.querySelectorAll('.poll-location__bar');
    
    bars.forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0%';
      
      setTimeout(() => {
        bar.style.width = width;
      }, 100);
    });
  }, 100);
}

/**
 * Photo Gallery Functionality
 */
function initPhotoGallery() {
  // This would integrate with Google Albums API in the full implementation
  // For the MVP, we'll just set up the structure and basic interaction
  
  const galleryItems = document.querySelectorAll('.gallery__item');
  
  if (!galleryItems.length) return;
  
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const imgSrc = this.querySelector('img').getAttribute('src');
      const imgAlt = this.querySelector('img').getAttribute('alt');
      
      // Create lightbox (simple implementation for MVP)
      const lightbox = document.createElement('div');
      lightbox.classList.add('lightbox');
      
      lightbox.innerHTML = `
        <div class="lightbox__content">
          <button class="lightbox__close">&times;</button>
          <img src="${imgSrc}" alt="${imgAlt}" class="lightbox__img">
          <div class="lightbox__caption">${imgAlt}</div>
        </div>
      `;
      
      // Add to body
      document.body.appendChild(lightbox);
      
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
      
      // Close lightbox when clicking close button or outside the image
      lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });
      
      function closeLightbox() {
        document.body.removeChild(lightbox);
        document.body.style.overflow = '';
      }
    });
  });
}

/**
 * Helper function to format date
 * @param {Date} date - Date object to format
 * @return {string} Formatted date string
 */
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Helper function to validate email
 * @param {string} email - Email to validate
 * @return {boolean} Whether email is valid
 */
function isValidEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Comments Functionality
 */
function initComments() {
  const commentsContainer = document.getElementById('comments-list');
  
  if (!commentsContainer) return;
  
  // Show loading message
  commentsContainer.innerHTML = '<p class="comments-loading">Loading comments...</p>';
  
  // Fetch comments from the Google Apps Script web app
  fetchComments()
    .then(comments => {
      renderComments(comments, commentsContainer);
    })
    .catch(error => {
      commentsContainer.innerHTML = `<p class="comments-error">Unable to load comments. ${error.message}</p>`;
    });
}

/**
 * Fetch comments from the Google Apps Script web app
 * @return {Promise<Array>} Promise resolving to array of comments
 */
async function fetchComments() {
  // Google Apps Script Web App URL
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxE-r-2jO4jgRaVcVWO7SSSJY9gwTDmsDnLsHkOndI0FqpTdMj2YT1odmtMg8pRVzWScA/exec';
  
  try {
    const response = await fetch(WEB_APP_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch comments');
    }
    
    return data.comments || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    
    // Fallback to mock data if API fetch fails
    console.log('Using fallback mock data');
    return [
      {
        name: 'Emily (Mock Data)',
        timestamp: new Date().toISOString(),
        text: 'This is mock data because we could not fetch the real comments. Please make sure the Google Apps Script web app is deployed correctly.'
      }
    ];
  }
}


/**
 * Render comments in the container
 */
function renderComments(comments, container) {
  if (!comments || comments.length === 0) {
    container.innerHTML = '<p class="comments-empty">No comments yet. Be the first to share your thoughts!</p>';
    return;
  }
  
  const commentsHTML = comments.map(comment => `
    <div class="comment-card">
      <div class="comment-header">
        <h3 class="comment-author">${comment.name}</h3>
        <span class="comment-date">${formatDate(new Date(comment.timestamp))}</span>
      </div>
      <div class="comment-body">
        <p>${comment.text}</p>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = commentsHTML;
}
// Diagnostic function removed as we're now using the Google Apps Script web app for poll results

/**
 * Generate consistent color from string
 * @param {string} str - Input string
 * @return {string} HSL color string
 */
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 45%)`;
}
