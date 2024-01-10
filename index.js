document.addEventListener('DOMContentLoaded', function () {
  const hamBtn = document.querySelector('.ham-btn');
  const navbar = document.querySelector('.navbar');
  const header = document.querySelector('.header');

  hamBtn.addEventListener('click', function (event) {
    // Prevent default action for the hamburger button click
    event.preventDefault();

    // Toggle 'active' class for navbar and header
    navbar.classList.toggle('active');
    header.classList.toggle('active');

    // Toggle hamburger icons based on menu state
    hamBtn.querySelector('.ham-icon[name="menu-outline"]').style.display = navbar.classList.contains('active') ? 'none' : 'block';
    hamBtn.querySelector('.ham-icon[name="close-outline"]').style.display = navbar.classList.contains('active') ? 'block' : 'none';

    // Toggle body class to manage scroll behavior
    document.body.classList.toggle('menu-open');
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

        // Remove body class to restore scroll behavior
        document.body.classList.remove('menu-open');
      }
    }
  });
});
