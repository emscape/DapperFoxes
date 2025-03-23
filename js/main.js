/**
 * DapperFoxes Wedding Website
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initNavigation();
  initPoll();
  initPhotoGallery();
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
  const pollOptions = document.querySelectorAll('.poll__option');
  const pollSubmit = document.querySelector('.poll__submit');
  const pollResults = document.querySelector('.poll__results');
  
  if (!pollOptions.length) return;
  
  // Handle option selection
  pollOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove selected class from all options
      pollOptions.forEach(opt => opt.classList.remove('poll__option--selected'));
      
      // Add selected class to clicked option
      this.classList.add('poll__option--selected');
    });
  });
  
  // Handle poll submission
  if (pollSubmit) {
    pollSubmit.addEventListener('click', function() {
      const selectedOption = document.querySelector('.poll__option--selected');
      
      if (!selectedOption) {
        alert('Please select an option before submitting.');
        return;
      }
      
      // In a real implementation, this would send data to a server
      // For now, we'll just show mock results
      
      // Hide poll options and show results
      document.querySelector('.poll__options').style.display = 'none';
      pollSubmit.style.display = 'none';
      
      if (pollResults) {
        // Mock results data (would come from server in real implementation)
        const mockResults = {
          'England': 35,
          'LA': 25,
          'Minnesota': 30,
          'Other': 10
        };
        
        // Create results HTML
        let resultsHTML = '<h3>Poll Results</h3>';
        resultsHTML += '<div class="poll__results-chart">';
        
        for (const [location, votes] of Object.entries(mockResults)) {
          resultsHTML += `
            <div class="poll__result">
              <div class="poll__result-label">${location}</div>
              <div class="poll__result-bar-container">
                <div class="poll__result-bar" style="width: ${votes}%"></div>
              </div>
              <div class="poll__result-value">${votes}%</div>
            </div>
          `;
        }
        
        resultsHTML += '</div>';
        resultsHTML += '<p>Thank you for your vote!</p>';
        
        // Display results
        pollResults.innerHTML = resultsHTML;
        pollResults.style.display = 'block';
        
        // Store in localStorage that user has voted
        localStorage.setItem('dapperFoxes_hasVoted', 'true');
      }
    });
  }
  
  // Check if user has already voted
  if (localStorage.getItem('dapperFoxes_hasVoted') === 'true' && pollResults) {
    // In a real implementation, we would fetch actual results from server
    // For now, just show the mock results directly
    document.querySelector('.poll__options').style.display = 'none';
    if (pollSubmit) pollSubmit.style.display = 'none';
    
    // Same mock results as above
    const mockResults = {
      'England': 35,
      'LA': 25,
      'Minnesota': 30,
      'Other': 10
    };
    
    // Create results HTML
    let resultsHTML = '<h3>Poll Results</h3>';
    resultsHTML += '<div class="poll__results-chart">';
    
    for (const [location, votes] of Object.entries(mockResults)) {
      resultsHTML += `
        <div class="poll__result">
          <div class="poll__result-label">${location}</div>
          <div class="poll__result-bar-container">
            <div class="poll__result-bar" style="width: ${votes}%"></div>
          </div>
          <div class="poll__result-value">${votes}%</div>
        </div>
      `;
    }
    
    resultsHTML += '</div>';
    resultsHTML += '<p>You have already voted. Thank you!</p>';
    
    // Display results
    pollResults.innerHTML = resultsHTML;
    pollResults.style.display = 'block';
  }
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