document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.getElementById("scroll-container");
  const verticalSections = document.getElementById("vertical-sections");
  const bottomScroll = document.getElementById("bottom-scroll");
  const progressBar = document.getElementById("progress-bar");

  // --- Phase tracking ---
  // Phase 1: Horizontal scroll right (title → about)
  // Phase 2: Vertical scroll down (projects 01, 02)
  // Phase 3: Horizontal scroll right (project 03 → contact)
  let phase = 1;

  // --- Phase 1: Top horizontal scroll ---
  let scrollWidth = scrollContainer.scrollWidth - window.innerWidth;
  let currentScroll = 0;
  let targetScroll = 0;

  // --- Phase 3: Bottom horizontal scroll (same mechanism as Phase 1) ---
  let bottomScrollWidth = 0;
  let bottomCurrentScroll = 0;
  let bottomTargetScroll = 0;

  function recalcBottomWidth() {
    bottomScrollWidth = bottomScroll.scrollWidth - window.innerWidth;
    if (bottomScrollWidth < 0) bottomScrollWidth = 0;
  }

  function enterPhase2() {
    if (phase !== 2) {
      phase = 2;
      document.documentElement.style.overflowY = "auto";
      document.body.style.overflowY = "auto";
      verticalSections.classList.add("active");
    }
  }

  function exitPhase2ToPhase1() {
    phase = 1;
    document.documentElement.style.overflowY = "hidden";
    document.body.style.overflowY = "hidden";
    window.scrollTo(0, 0);
    targetScroll = scrollWidth - 1;
  }

  function enterPhase3() {
    if (phase !== 3) {
      phase = 3;
      document.documentElement.style.overflowY = "hidden";
      document.body.style.overflowY = "hidden";
      bottomTargetScroll = 0;
      bottomCurrentScroll = 0;
      recalcBottomWidth();
    }
  }

  function exitPhase3ToPhase2() {
    phase = 2;
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    // Scroll back to where the bottom-scroll container is
    requestAnimationFrame(() => {
      const rect = bottomScroll.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top;
      window.scrollTo(0, scrollTop - 10);
    });
  }

  function isAtVerticalBottom() {
    // Check if the bottom-scroll container is fully in view (sticky at top)
    const rect = bottomScroll.getBoundingClientRect();
    return rect.top <= 0;
  }

  // --- Wheel listener ---
  window.addEventListener(
    "wheel",
    (e) => {
      if (window.innerWidth <= 768) return;

      if (phase === 1) {
        // Horizontal scroll right
        targetScroll += e.deltaY * 0.8;
        targetScroll += e.deltaX * 0.8;

        if (targetScroll < 0) targetScroll = 0;
        if (targetScroll >= scrollWidth) {
          targetScroll = scrollWidth;
          enterPhase2();
        }
      } else if (phase === 2) {
        // Vertical scroll — mostly native, but detect edges

        // At top scrolling up → go back to horizontal
        if (window.scrollY === 0 && e.deltaY < 0) {
          exitPhase2ToPhase1();
          e.preventDefault();
          return;
        }

        // Bottom-scroll container is sticky at top → enter phase 3
        if (isAtVerticalBottom() && e.deltaY > 0) {
          enterPhase3();
          e.preventDefault();
          return;
        }

        // Otherwise let native scroll handle it
      } else if (phase === 3) {
        // Horizontal scroll right (same as phase 1)
        e.preventDefault();

        bottomTargetScroll += e.deltaY * 0.8;
        bottomTargetScroll += e.deltaX * 0.8;

        // Scrolling back → return to phase 2
        if (bottomTargetScroll < 0) {
          bottomTargetScroll = 0;
          exitPhase3ToPhase2();
          return;
        }

        if (bottomTargetScroll > bottomScrollWidth) {
          bottomTargetScroll = bottomScrollWidth;
        }
      }
    },
    { passive: false },
  );

  // --- Animation loop ---
  function animateScroll() {
    if (window.innerWidth > 768) {
      // Phase 1: top horizontal scroll
      currentScroll += (targetScroll - currentScroll) * 0.08;
      scrollContainer.style.transform = `translate3d(-${currentScroll}px, 0, 0)`;

      // Phase 3: bottom horizontal scroll (same translate3d)
      bottomCurrentScroll += (bottomTargetScroll - bottomCurrentScroll) * 0.08;
      bottomScroll.style.transform = `translate3d(-${bottomCurrentScroll}px, 0, 0)`;

      // Progress bar covers all phases
      const totalProgress =
        phase === 1
          ? (currentScroll / scrollWidth) * 0.33
          : phase === 2
            ? 0.33 +
              (window.scrollY /
                Math.max(1, document.body.scrollHeight - window.innerHeight)) *
                0.34
            : 0.67 +
              (bottomCurrentScroll / Math.max(1, bottomScrollWidth)) * 0.33;
      progressBar.style.width = `${totalProgress * 100}%`;
    } else {
      scrollContainer.style.transform = `translate3d(0, 0, 0)`;
      bottomScroll.style.transform = `none`;
    }

    requestAnimationFrame(animateScroll);
  }

  // --- Resize ---
  window.addEventListener("resize", () => {
    scrollWidth = scrollContainer.scrollWidth - window.innerWidth;
    if (targetScroll > scrollWidth) targetScroll = scrollWidth;
    recalcBottomWidth();

    if (window.innerWidth <= 768) {
      verticalSections.classList.add("active");
      document.documentElement.style.overflowY = "auto";
      document.body.style.overflowY = "auto";
    }
  });

  // --- Mobile: all sections visible by default ---
  if (window.innerWidth <= 768) {
    verticalSections.classList.add("active");
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
  }

  animateScroll();

  // --- Touch support (non-mobile) ---
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      if (window.innerWidth <= 768) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (window.innerWidth <= 768) return;

      const touchDeltaX = touchStartX - e.touches[0].clientX;

      if (phase === 1) {
        targetScroll += touchDeltaX * 1.5;
        if (targetScroll < 0) targetScroll = 0;
        if (targetScroll >= scrollWidth) {
          targetScroll = scrollWidth;
          enterPhase2();
        }
      } else if (phase === 3) {
        bottomTargetScroll += touchDeltaX * 1.5;
        if (bottomTargetScroll < 0) {
          bottomTargetScroll = 0;
          exitPhase3ToPhase2();
        }
        if (bottomTargetScroll > bottomScrollWidth) {
          bottomTargetScroll = bottomScrollWidth;
        }
      }

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );
});
