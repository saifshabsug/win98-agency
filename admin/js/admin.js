// admin/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item[data-target]');
  const viewSections = document.querySelectorAll('.view-section');
  const topbarTitle = document.getElementById('current-view-title');

  // Tab switching logic
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all
      navItems.forEach(nav => nav.classList.remove('active'));
      viewSections.forEach(section => section.classList.remove('active'));

      // Add to clicked
      item.classList.add('active');
      const targetId = item.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');

      // Update title
      topbarTitle.textContent = item.textContent.replace(/[^\u0600-\u06FF\sA-Za-z()]/g, '').trim(); 
      // Removes the emoji icons so the title is clean
    });
  });
});

// Helper for Blog form toggle
function showArticleForm() {
  document.getElementById('articles-list').style.display = 'none';
  document.getElementById('article-form').style.display = 'block';
}

function hideArticleForm() {
  document.getElementById('article-form').style.display = 'none';
  document.getElementById('articles-list').style.display = 'block';
}
