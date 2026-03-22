document.addEventListener('DOMContentLoaded', function () {
  // --- Mobile Navigation Toggle ---
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('active');
      });
    });
  }

  // --- Navbar Scroll Effect ---
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // --- Scroll Reveal Animation ---
  var fadeElements = document.querySelectorAll('.fade-up');

  if (fadeElements.length > 0) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          // Stagger animation for sibling elements
          var siblings = entry.target.parentElement.querySelectorAll('.fade-up');
          var siblingIndex = Array.prototype.indexOf.call(siblings, entry.target);
          var delay = siblingIndex * 100;

          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Contact Form Handling ---
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('name').value;
      var email = document.getElementById('email').value;
      var phone = document.getElementById('phone').value;
      var subject = document.getElementById('subject').value;
      var message = document.getElementById('message').value;

      window.location.href = 'mailto:toother.dent@gmail.com?subject=' +
        encodeURIComponent('Website Enquiry: ' + subject) +
        '&body=' + encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + (phone || 'N/A') + '\nSubject: ' + subject + '\n\nMessage:\n' + message);

      alert('Opening your email client. If it does not open, please email us directly at toother.dent@gmail.com');
    });
  }
});
