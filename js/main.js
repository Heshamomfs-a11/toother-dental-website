// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('active');
      });
    });
  }

  // Contact form handling (basic mailto fallback since GitHub Pages is static)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      const body = 'Name: ' + name + '%0D%0A' +
                   'Email: ' + email + '%0D%0A' +
                   'Phone: ' + (phone || 'N/A') + '%0D%0A' +
                   'Subject: ' + subject + '%0D%0A%0D%0A' +
                   'Message:%0D%0A' + message;

      window.location.href = 'mailto:toother.dent@gmail.com?subject=' +
        encodeURIComponent('Website Enquiry: ' + subject) +
        '&body=' + encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + (phone || 'N/A') + '\nSubject: ' + subject + '\n\nMessage:\n' + message);

      alert('Opening your email client. If it does not open, please email us directly at toother.dent@gmail.com');
    });
  }
});
