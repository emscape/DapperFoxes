/**
 * DapperFoxes Wedding Website
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
  // Reset color indices to ensure fresh color rotation
  resetColorIndices();
  
  // Initialize components
  initNavigation();
  initPoll();
  initPhotoGallery();
  initPollResults();
  initComments();
});

/**
 * Reset color indices to ensure fresh color rotation
 */
function resetColorIndices() {
  console.log('Resetting color indices');
  // These variables are defined in renderPollResults
  if (typeof colorFamilyIndex !== 'undefined') {
    colorFamilyIndex = 0;
    console.log('Reset colorFamilyIndex to 0');
  }
  if (typeof colorIndex !== 'undefined') {
    colorIndex = 0;
    console.log('Reset colorIndex to 0');
  }
  if (typeof assignedColors !== 'undefined') {
    // Clear assignedColors but keep fixed colors
    const fixedLocations = ['England', 'Los Angeles', 'Minnesota'];
    const newAssignedColors = {};
    
    fixedLocations.forEach(location => {
      if (assignedColors[location]) {
        newAssignedColors[location] = assignedColors[location];
      }
    });
    
    assignedColors = newAssignedColors;
    console.log('Reset assignedColors, keeping fixed locations');
  }
  
  // Reset the custom locations counter
  if (typeof customLocationsCount !== 'undefined') {
    customLocationsCount.count = 0;
    console.log('Reset customLocationsCount to 0');
  }
}

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
async function renderPollResults(results, container) {
  if (!results || !results.locations || results.locations.length === 0) {
    container.innerHTML = '<p class="poll-results__error">No poll results available.</p>';
    return;
  }

  console.log('Rendering poll results:', results);
  
  // Reset color indices and assigned colors for a fresh start
  resetColorIndices();
  
  const colors = {
    "warm": [
      {
        "name": "Burnt Sienna",
        "hex": "#E97451"
      },
      {
        "name": "Coral",
        "hex": "#FF7F50"
      },
      {
        "name": "Amber",
        "hex": "#FFBF00"
      },
      {
        "name": "Terracotta",
        "hex": "#E2725B"
      },
      {
        "name": "Rosewood",
        "hex": "#65000B"
      },
      {
        "name": "Dusty Peach",
        "hex": "#E8C4B8"
      },
      {
        "name": "Persimmon",
        "hex": "#EC5800"
      }
    ],
    "cool": [
      {
        "name": "Seafoam Green",
        "hex": "#9FE2BF"
      },
      {
        "name": "Turquoise",
        "hex": "#40E0D0"
      },
      {
        "name": "Slate Blue",
        "hex": "#6A5ACD"
      },
      {
        "name": "Mint",
        "hex": "#98FF98"
      },
      {
        "name": "Deep Navy",
        "hex": "#000080"
      },
      {
        "name": "Sky Blue",
        "hex": "#87CEEB"
      }
    ],
    "neutral": [
      {
        "name": "Champagne Gold",
        "hex": "#F7E7CE"
      },
      {
        "name": "Clay Gray",
        "hex": "#B2A38B"
      },
      {
        "name": "Moss Green",
        "hex": "#8A9A5B"
      },
      {
        "name": "Plum",
        "hex": "#8E4585"
      },
      {
        "name": "Soft Lavender",
        "hex": "#D8BFD8"
      },
      {
        "name": "Charcoal",
        "hex": "#36454F"
      },
      {
        "name": "Dusty Rose",
        "hex": "#C08081"
      }
    ],
    "fixed": {
      "England": {
        "name": "Evergreen",
        "hex": "#2F4F4F"
      },
      "Minnesota": {
        "name": "Ice Blue",
        "hex": "#D6F6FF"
      },
      "Los Angeles": {
        "name": "Sunset Orange",
        "hex": "#FF6F3C"
      }
    }
  };

  const assignedColors = {};

  function getFixedColor(locationName, colors) {
    console.log(`getFixedColor called with locationName: ${locationName}`);
    
    // Directly assign colors based on location name
    if (locationName === "England") {
      console.log(`Fixed color found for England: #2F4F4F (Evergreen)`);
      return "#2F4F4F"; // Evergreen
    } else if (locationName === "Minnesota") {
      console.log(`Fixed color found for Minnesota: #D6F6FF (Ice Blue)`);
      return "#D6F6FF"; // Ice Blue
    } else if (locationName === "Los Angeles") {
      console.log(`Fixed color found for Los Angeles: #FF6F3C (Sunset Orange)`);
      return "#FF6F3C"; // Sunset Orange
    } else {
      console.log(`No fixed color found for ${locationName}`);
      return null;
    }
  }

  const colorFamilies = ['warm', 'cool', 'neutral'];
  let colorFamilyIndex = 0;
  let colorIndex = 0;

  // Keep track of which custom locations we've seen
  const customLocationsCount = { count: 0 };
  
  // List of fixed locations that should use their assigned colors
  const fixedLocationsList = ['England', 'Los Angeles', 'Minnesota'];
  
  function getColorForLocation(locationName, colors) {
    console.log(`Getting color for location: ${locationName}`);
    console.log(`Current colorFamilyIndex: ${colorFamilyIndex}, colorIndex: ${colorIndex}`);
    
    // Check if this is a fixed location (England, Minnesota, Los Angeles)
    let color = getFixedColor(locationName, colors);
    if (color) {
      console.log(`Using fixed color for ${locationName}: ${color}`);
      console.log(`HEX COLOR FOR ${locationName}: ${color}`);
      // For fixed locations, cache the color
      assignedColors[locationName] = color;
      return color;
    }
    
    // Special handling for custom locations - force different color families
    // Any location that's not in the fixedLocationsList is considered a custom location
    if (!fixedLocationsList.includes(locationName)) {
      console.log(`Special handling for custom location: ${locationName}`);
      
      // Increment the count of custom locations we've seen
      customLocationsCount.count++;
      console.log(`This is custom location #${customLocationsCount.count}`);
      
      // Force each custom location to use a different color family
      // Use modulo to cycle through the families
      const familyIndex = (customLocationsCount.count - 1) % colorFamilies.length;
      const familyName = colorFamilies[familyIndex];
      console.log(`Forcing "Other" location to use family: ${familyName} (index ${familyIndex})`);
      
      const family = colors[familyName];
      
      if (!family || family.length === 0) {
        const randomColor = stringToColor(Math.random().toString());
        console.log(`No family found, using random color: ${randomColor}`);
        return randomColor;
      }
      
      // Use a random color from the selected family
      const randomIndex = Math.floor(Math.random() * family.length);
      const color = family[randomIndex].hex;
      console.log(`Selected color: ${color} (${family[randomIndex].name}) from family ${familyName} at index ${randomIndex}`);
      console.log(`HEX COLOR FOR ${locationName}: ${color}`);
      
      return color;
    }
    
    // For non-fixed, non-"Other" locations, use cached colors if available
    if (assignedColors[locationName]) {
      return assignedColors[locationName];
    }
    
    // Get the next color from the rotation for other locations
    function getNextColor(colors) {
      if (!colors) return stringToColor(Math.random().toString());

      // Use the outer colorFamilies, colorFamilyIndex, and colorIndex variables
      const familyName = colorFamilies[colorFamilyIndex];
      const family = colors[familyName];

      if (!family || family.length === 0) return stringToColor(Math.random().toString());

      // Get the color at the current index
      const color = family[colorIndex].hex;
      
      // Increment colorIndex for next time
      colorIndex++;
      
      // If we've used all colors in this family, move to the next family
      if (colorIndex >= family.length) {
        colorIndex = 0;
        colorFamilyIndex = (colorFamilyIndex + 1) % colorFamilies.length;
      }
      
      return color;
    }
    
    // Get a color from the rotation
    color = getNextColor(colors);
    
    // Cache the color for this location
    assignedColors[locationName] = color;
    return color;
  }

  // Create HTML for the poll results
  let html = '<div class="poll-results__chart">';

  // Calculate percentages and create bars for each location
  results.locations.forEach(location => {
    const percentage = Math.round((location.votes / results.totalVotes) * 100);
    const color = getColorForLocation(location.name, colors);

    html += `
      <div class="poll-location" style="--location-color: ${color}">
        <div class="poll-location__header">
          <span class="poll-location__name">${location.name}</span>
          <span class="poll-location__percentage">${percentage}%</span>
        </div>
        <div class="poll-location__bar-container">
          <div class="poll-location__bar poll-location__bar--${location.id}" style="width: ${percentage}%"></div>
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
  
  // Convert HSL to HEX
  const h = hue / 360;
  const s = 0.7;
  const l = 0.45;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return `#${Math.round(f(0) * 255).toString(16).padStart(2, '0')}` +
         `${Math.round(f(8) * 255).toString(16).padStart(2, '0')}` +
         `${Math.round(f(4) * 255).toString(16).padStart(2, '0')}`;
}
