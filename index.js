document.addEventListener('DOMContentLoaded', function () {
  const hamBtn = document.querySelector('.ham-btn');
  const navbar = document.querySelector('.navbar');
  const header = document.querySelector('.header');

  hamBtn.addEventListener('click', function (event) {
    // Prevent default action for the hamburger button click
    event.preventDefault();

    // Check if the menu is currently open
    const isOpen = navbar.classList.contains('active');

    // Toggle 'active' class for navbar and header
    navbar.classList.toggle('active');
    header.classList.toggle('active');

    // Toggle hamburger icons based on menu state
    hamBtn.querySelector('.ham-icon[name="menu-outline"]').style.display = isOpen ? 'block' : 'none';
    hamBtn.querySelector('.ham-icon[name="close-outline"]').style.display = isOpen ? 'none' : 'block';

    // Toggle body overflow to prevent scrolling when the menu is open
    document.body.style.overflow = isOpen ? 'auto' : 'hidden';
  });

  // Add event listener to close the navbar when clicking outside of it
  document.addEventListener('click', function (event) {
    // Check if the navbar or hamburger button is clicked
    if (!navbar.contains(event.target) && !hamBtn.contains(event.target)) {
      // Check if the menu is currently open
      const isOpen = navbar.classList.contains('active');

      // Close navbar and header if they are active
      if (isOpen) {
        navbar.classList.remove('active');
        header.classList.remove('active');

        // Toggle hamburger icons to the initial state
        hamBtn.querySelector('.ham-icon[name="menu-outline"]').style.display = 'block';
        hamBtn.querySelector('.ham-icon[name="close-outline"]').style.display = 'none';

        // Restore body overflow
        document.body.style.overflow = 'auto';
      }
    }
  });
});
