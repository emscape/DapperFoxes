/**
 * DapperFoxes Wedding Website
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initNavigation();
  initPoll();
  initPhotoGallery();
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
      
      // If we can't load comments from the API, fall back to mock data for now
      console.warn('Falling back to mock data:', error);
      
      const mockComments = [
        {
          name: "Sarah Johnson",
          timestamp: "2025-03-23T14:22:00",
          text: "England would be so romantic! I can picture you two in a beautiful countryside venue."
        },
        {
          name: "Michael Chen",
          timestamp: "2025-03-23T16:45:00",
          text: "Minnesota has the best venues! Plus, it's closer for most of your family, right?"
        },
        {
          name: "Jessica Williams",
          timestamp: "2025-03-23T18:10:00",
          text: "LA has perfect weather year-round. No rain to worry about on your special day!"
        },
        {
          name: "David Rodriguez",
          timestamp: "2025-03-24T09:30:00",
          text: "Have you considered a destination wedding in Hawaii? Just throwing it out there!"
        }
      ];
      
      // Use mock data as fallback
      setTimeout(() => {
        renderComments(mockComments, commentsContainer);
      }, 1000);
    });
}

/**
 * Fetch comments from the Google Apps Script web app
 * @return {Promise<Array>} Promise resolving to array of comments
 */
async function fetchComments() {
  // Google Apps Script web app URL for fetching comments
  const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxE-r-2jO4jgRaVcVWO7SSSJY9gwTDmsDnLsHkOndI0FqpTdMj2YT1odmtMg8pRVzWScA/exec';
  
  try {
    const response = await fetch(WEBAPP_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch comments');
    }
    
    return data.comments.map(comment => ({
      name: comment.name,
      timestamp: comment.timestamp,
      text: comment.text
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
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