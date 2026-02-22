document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.getElementById("scroll-container");
  const progressBar = document.getElementById("progress-bar");

  // Calculate total scrollable width
  let scrollWidth = scrollContainer.scrollWidth - window.innerWidth;

  let currentScroll = 0;
  let targetScroll = 0;

  // Listen for wheel events (mouse scrolling or trackpad)
  window.addEventListener(
    "wheel",
    (e) => {
      // Ignore custom scroll on mobile
      if (window.innerWidth <= 768) return;

      // DeltaY is vertical scroll, but we'll use it to shift horizontally
      targetScroll += e.deltaY * 0.8; // Added friction factor
      targetScroll += e.deltaX * 0.8; // Also capture horizontal trackpad swipes

      // Constrain scroll bounds
      if (targetScroll < 0) targetScroll = 0;
      if (targetScroll > scrollWidth) targetScroll = scrollWidth;
    },
    { passive: false },
  );

  // Smooth animation loop using requestAnimationFrame
  function animateScroll() {
    if (window.innerWidth > 768) {
      // LERP for smooth interpolation
      currentScroll += (targetScroll - currentScroll) * 0.08;

      // Apply transform
      scrollContainer.style.transform = `translate3d(-${currentScroll}px, 0, 0)`;

      // Update progress bar
      progressBar.style.width = `${(currentScroll / scrollWidth) * 100}%`;
    } else {
      // Clear transform if resized back to mobile
      scrollContainer.style.transform = `translate3d(0, 0, 0)`;
    }

    requestAnimationFrame(animateScroll);
  }

  // Recalculate Widths on Window Resize
  window.addEventListener("resize", () => {
    scrollWidth = scrollContainer.scrollWidth - window.innerWidth;
    if (targetScroll > scrollWidth) targetScroll = scrollWidth;
  });

  animateScroll();

  // Mobile swipe support (basic implementation)
  let touchStartX = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      if (window.innerWidth <= 768) return;
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (window.innerWidth <= 768) return;
      const touchDeltaX = touchStartX - e.touches[0].clientX;
      targetScroll += touchDeltaX * 1.5;

      if (targetScroll < 0) targetScroll = 0;
      if (targetScroll > scrollWidth) targetScroll = scrollWidth;

      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
});
