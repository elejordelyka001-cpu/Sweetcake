// Highlight active nav link
document.querySelectorAll('.nav-link').forEach(link => {
  if (window.location.pathname.startsWith(new URL(link.href).pathname) && link.href !== window.location.origin + '/') {
    link.classList.add('active');
  }
});

// Auto-dismiss flash messages after 4 seconds
const flash = document.querySelector('.flash');
if (flash) setTimeout(() => flash.style.opacity = '0', 4000);
