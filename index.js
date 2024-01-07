document.addEventListener('DOMContentLoaded', function () {
    const hamBtn = document.querySelector('.ham-btn');
    const navbar = document.querySelector('.navbar');
    const header = document.querySelector('.header');
  
    hamBtn.addEventListener('click', function () {
      navbar.classList.toggle('active');
      header.classList.toggle('active');
  
      const isOpen = navbar.classList.contains('active');
      hamBtn.querySelector('.ham-icon[name="menu-outline"]').style.display = isOpen ? 'none' : 'block';
      hamBtn.querySelector('.ham-icon[name="close-outline"]').style.display = isOpen ? 'block' : 'none';
  
      // Toggle body overflow to prevent scrolling when the menu is open
      document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    });
  
    // Add this event listener to close the navbar when clicking outside of it
    document.addEventListener('click', function (event) {
      if (!navbar.contains(event.target) && !hamBtn.contains(event.target)) {
        navbar.classList.remove('active');
        header.classList.remove('active');
        hamBtn.querySelector('.ham-icon[name="menu-outline"]').style.display = 'block';
        hamBtn.querySelector('.ham-icon[name="close-outline"]').style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore body overflow
      }
    });
  });
  