import * as paths from './paths.js';

/**
 * DapperFoxes Wedding Website
 * Main JavaScript File
 */

let galleryPhotos = []; // Array to store fetched photo data for slideshow
let currentPhotoIndex = 0; // Index of the photo currently shown in lightbox

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
  
  // Only proceed if the container exists on the current page
  if (!pollResultsContainer) {
    // console.log('Poll results container not found on this page.'); // Optional: Log for debugging
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
  // Update this URL in paths.js if the deployment URL changes
  const WEB_APP_URL = paths.POLL_COMMENTS_APP_URL;

  try {
    // Add poll=true parameter to request poll results
    // Add cache-busting parameter to prevent caching
    const cacheBuster = new Date().getTime();
    console.log('Fetching poll results with URL:', `${WEB_APP_URL}?poll=true&_=${cacheBuster}`);
    const response = await fetch(`${WEB_APP_URL}?poll=true&_=${cacheBuster}`); // Use the constant

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
      const directResponse = await fetch(`${WEB_APP_URL}?poll=true&direct=true&_=${new Date().getTime()}`); // Use the constant
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
/**
 * Loads official photos from the project folder into the gallery.
 */
/**
 * Attempts to extract a date from a photo filename.
 * Handles YYYY-MM-DD, YYYYMMDD formats.
 * @param {string} filename - The filename (e.g., '2023-04-13.jpg', 'PXL_20240527_...jpg')
 * @returns {Date|null} - The extracted Date object or null if no valid date found.
 */
function extractDateFromFilename(filename) {
  if (!filename) return null;

  let match;

  // Try YYYY-MM-DD format
  match = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
    const day = parseInt(match[3], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const date = new Date(year, month, day);
      // Basic validation: check if the constructed date components match input
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
      }
    }
  }

  // Try YYYYMMDD format (common in PXL_, IMG_, IMG-YYYYMMDD-WA...)
  match = filename.match(/(\d{4})(\d{2})(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
    const day = parseInt(match[3], 10);
     if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const date = new Date(year, month, day);
      // Basic validation
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date;
      }
    }
  }

  return null; // No valid date pattern found
}


/**
 * Loads official photos from the generated official-photos.json file into the gallery.
 */
async function loadOfficialPhotos() { // Make the function async
  const officialGalleryGrid = document.getElementById('official-photo-gallery');
  if (!officialGalleryGrid) {
    console.error('Official photo gallery container (#official-photo-gallery) not found.');
    return;
  }

  // Clear any existing content (e.g., loading message)
  officialGalleryGrid.innerHTML = '<p class="gallery-loading">Loading Center Stage photos...</p>'; // Add loading message

  try {
    // Fetch the sorted photo list from the JSON file (path defined in paths.js)
    // Add cache-busting parameter
    const cacheBuster = new Date().getTime();
    const response = await fetch(`${paths.OFFICIAL_PHOTOS_JSON_PATH}?_=${cacheBuster}`); // Use the constant
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} fetching ${paths.OFFICIAL_PHOTOS_JSON_PATH}`);
    }
    const officialPhotosData = await response.json(); // This is already sorted by the build script

    // Clear loading message
    officialGalleryGrid.innerHTML = '';

    // Append official photos to the global galleryPhotos array
    const guestPhotoCount = galleryPhotos.length;
    galleryPhotos = galleryPhotos.concat(officialPhotosData); // JSON data already has {url, caption}

    // Generate HTML from the fetched (and sorted) data
    officialPhotosData.forEach((photoData, index) => {
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';

      const img = document.createElement('img');
      img.src = photoData.url;
      img.alt = photoData.caption || photoData.url.split('/').pop(); // Use caption if available, else filename
      img.loading = 'lazy';

      galleryItem.appendChild(img);

      // Add click listener for lightbox using the overall index
      const overallIndex = guestPhotoCount + index;
      galleryItem.addEventListener('click', () => openLightbox(overallIndex));

      officialGalleryGrid.appendChild(galleryItem);
    });

    console.log('Official photos loaded from JSON and rendered.');

  } catch (error) {
    console.error('Error loading or processing official photos:', error);
    officialGalleryGrid.innerHTML = '<p class="gallery-error">Could not load Center Stage photos.</p>';
  }
}


async function initPhotoGallery() { // Make function async to use await
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) {
    // Only run this code on the photos page where the grid exists
    return;
  }

  // URL of the deployed Google Apps Script Web App for GUEST photos (defined in paths.js)
  const PHOTO_APP_URL = paths.GUEST_PHOTOS_APP_URL;

  // Display loading message for GUEST photos
  galleryGrid.innerHTML = '<p class="gallery-loading">Loading Crowd View photos...</p>';

  try {
    // Fetch GUEST photos
    // Add cache-busting parameter
    const guestCacheBuster = new Date().getTime();
    const response = await fetch(`${PHOTO_APP_URL}?_=${guestCacheBuster}`); // Use the constant

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
const guestData = await response.json(); // Renamed variable

// Clear loading message for GUEST photos
galleryGrid.innerHTML = '';

    // Populate the global galleryPhotos array with GUEST photos first
    // Ensure it's reset before populating
    galleryPhotos = [];
    // Check the structure: guestData.success and guestData.photos array
    if (guestData && guestData.success && Array.isArray(guestData.photos) && guestData.photos.length > 0) {
       galleryPhotos = guestData.photos.map(photo => ({ // Access guestData.photos
         url: photo.url, // Assuming the API returns objects with a 'url' property
         caption: photo.caption || '' // Assuming an optional 'caption' property
       }));

       // Render GUEST photos
       galleryPhotos.forEach((photo, index) => {
         const galleryItem = document.createElement('div');
         galleryItem.className = 'gallery-item';

         const img = document.createElement('img');
         img.src = photo.url;
         img.alt = photo.caption || 'Guest Photo'; // Use caption or default alt text
         img.loading = 'lazy'; // Add lazy loading

         galleryItem.appendChild(img);

         // Add click listener for lightbox, passing the index
         galleryItem.addEventListener('click', () => openLightbox(index));

         galleryGrid.appendChild(galleryItem);
       }); // End of processing fetched GUEST photos
    } else {
       galleryGrid.innerHTML = '<p>No guest photos shared yet!</p>'; // Message if no guest photos
    }

      // Now load the official photos from the JSON file
      // This function will append its photos to the galleryPhotos array
      await loadOfficialPhotos(); // Make sure to await this if it's async


      // --- Lightbox Functionality ---
      // (Defined within initPhotoGallery scope to access galleryPhotos easily)
      // Ensure lightbox elements exist before adding listeners
      const lightbox = document.createElement('div');
      lightbox.id = 'lightbox';
      lightbox.className = 'lightbox';
      lightbox.style.display = 'none'; // Initially hidden
      document.body.appendChild(lightbox);

      const lightboxContent = document.createElement('div');
      lightboxContent.className = 'lightbox__content';
      lightbox.appendChild(lightboxContent);

      const lightboxImg = document.createElement('img');
      lightboxImg.className = 'lightbox__img';
      lightboxContent.appendChild(lightboxImg);

      const lightboxCaption = document.createElement('p');
      lightboxCaption.className = 'lightbox__caption';
      lightboxContent.appendChild(lightboxCaption);

      const closeButton = document.createElement('span');
      closeButton.className = 'lightbox__close';
      closeButton.innerHTML = '&times;';
      lightbox.appendChild(closeButton);

      const prevButton = document.createElement('span');
      prevButton.className = 'lightbox__prev';
      prevButton.innerHTML = '&#10094;'; // Left arrow
      lightbox.appendChild(prevButton);

      const nextButton = document.createElement('span');
      nextButton.className = 'lightbox__next';
      nextButton.innerHTML = '&#10095;'; // Right arrow
      lightbox.appendChild(nextButton);


      // Function to open the lightbox
      window.openLightbox = function(startIndex) { // Attach to window to make it accessible
        if (!Array.isArray(galleryPhotos) || galleryPhotos.length === 0) {
            console.error("Gallery photos array is empty or not initialized.");
            return;
        }
        currentPhotoIndex = startIndex;
        updateLightboxContent();
        lightbox.style.display = 'flex'; // Show lightbox
      }

      // Function to update lightbox content
      function updateLightboxContent() {
          if (currentPhotoIndex < 0 || currentPhotoIndex >= galleryPhotos.length) {
              console.error("Invalid photo index:", currentPhotoIndex);
              return; // Avoid errors if index is out of bounds
          }
          const photo = galleryPhotos[currentPhotoIndex];
          if (!photo || !photo.url) {
              console.error("Invalid photo data at index:", currentPhotoIndex, photo);
              // Optionally close lightbox or show error
              closeLightbox();
              return;
          }
          lightboxImg.src = photo.url;
          lightboxCaption.textContent = photo.caption || ''; // Use caption or empty string
      }


      // Function to show the next photo
      function showNextPhoto() {
        currentPhotoIndex = (currentPhotoIndex + 1) % galleryPhotos.length; // Loop back to start
        updateLightboxContent();
      }

      // Function to show the previous photo
      function showPreviousPhoto() {
        currentPhotoIndex = (currentPhotoIndex - 1 + galleryPhotos.length) % galleryPhotos.length; // Loop back to end
        updateLightboxContent();
      }


      // Function to close the lightbox
      function closeLightbox() {
        lightbox.style.display = 'none';
      }

      // Event listeners for lightbox controls
      closeButton.addEventListener('click', closeLightbox);
      nextButton.addEventListener('click', showNextPhoto);
      prevButton.addEventListener('click', showPreviousPhoto);

      // Close lightbox if clicking outside the image content
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });

      // Keyboard navigation
      document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'flex') {
          if (e.key === 'ArrowRight') {
            showNextPhoto();
          } else if (e.key === 'ArrowLeft') {
            showPreviousPhoto();
          } else if (e.key === 'Escape') {
            closeLightbox();
          }
        }
      });


  } catch (error) {
    console.error('Error initializing photo gallery (Guest Photos Fetch):', error); // Added context to log
    galleryGrid.innerHTML = `<p class="gallery-error">Could not load Crowd View photos: ${error.message}</p>`; // Added error message detail
    // Attempt to load official photos even if guest photos fail
    try {
        await loadOfficialPhotos();
    } catch (officialError) {
        console.error('Also failed to load official photos:', officialError);
        // Optionally display a combined error message
    }
  }
}


/**
 * Format date string
 * @param {string} date - Date string
 * @return {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}

/**
 * Validate email address
 * @param {string} email - Email address
 * @return {boolean} True if valid email, false otherwise
 */
function isValidEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Comments Functionality
 */
function initComments() {
  const commentsContainer = document.getElementById('comments-list');
  if (!commentsContainer) {
    // Only run this code on the poll page where the comments list exists
    return;
  }

  // Show loading message
  commentsContainer.innerHTML = '<p class="comments-loading">Loading comments...</p>';

  // Fetch comments
  fetchComments()
    .then(comments => {
      renderComments(comments, commentsContainer);
    })
    .catch(error => {
      console.error('Error fetching comments:', error);
      commentsContainer.innerHTML = `<p class="comments-error">Unable to load comments. ${error.message}</p>`;
    });
}

/**
 * Fetch comments from Google Apps Script Web App
 * @return {Promise<Array>} Promise resolving to array of comment objects
 */
async function fetchComments() {
  // Google Apps Script Web App URL (defined in paths.js)
  // Update this URL in paths.js if the deployment URL changes
  const WEB_APP_URL = paths.POLL_COMMENTS_APP_URL;

  try {
    // Add cache-busting parameter
    const cacheBuster = new Date().getTime();
    const response = await fetch(`${WEB_APP_URL}?_=${cacheBuster}`); // Use the constant, fetch approved comments by default

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch comments');
    }

    // Check if comments array exists and is an array
    if (Array.isArray(data.comments)) {
        return data.comments;
    } else {
        console.warn('Comments data is not an array or is missing, returning empty array.');
        return []; // Return empty array if comments are not in the expected format
    }

  } catch (error) {
    console.error('Error fetching comments:', error);
    // Fallback to mock data if API fetch fails
    console.log('Using fallback mock data for comments');
    return [
      { author: 'Sample User 1', date: '2025-03-25', body: 'This is a sample comment.' },
      { author: 'Sample User 2', date: '2025-03-24', body: 'Another example comment here!' }
    ];
  }
}


/**
 * Render comments in the container
 * @param {Array} comments - Array of comment objects
 * @param {HTMLElement} container - The container element
 */
function renderComments(comments, container) {
  if (!comments || comments.length === 0) {
    container.innerHTML = '<p class="comments-empty">No comments yet. Be the first!</p>';
    return;
  }

  // Clear loading message
  container.innerHTML = '';

  // Create HTML for each comment
  comments.forEach(comment => {
    const commentCard = document.createElement('div');
    commentCard.className = 'comment-card';

    commentCard.innerHTML = `
      <div class="comment-header">
        <h4 class="comment-author">${comment.author || 'Anonymous'}</h4>
        <span class="comment-date">${formatDate(comment.date)}</span>
      </div>
      <div class="comment-body">
        <p>${comment.body || ''}</p>
      </div>
    `;
    container.appendChild(commentCard);
  });
}


/**
 * Simple hash function to generate a color from a string
 * @param {string} str - Input string
 * @return {string} Hex color code
 */
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  // Ensure bright enough colors by setting minimum values for RGB components
  const minComponentValue = 100; // Adjust this value (0-255) as needed
  const f = n => Math.max(minComponentValue, (hash >> (n * 8)) & 0xFF);
  for (let i = 0; i < 3; i++) {
    color += ('00' + f(i).toString(16)).substr(-2);
  }
  return color;
}
