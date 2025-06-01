(function () {
  ("use strict");

  /**
   * This function is created with aim to inject the html elements on given placeholder
   * @param {url} // source url of components
   * @param {id} // elements id
   */
  function fetchAndFill(url, id, ...callbacks) {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        if (document.getElementById(id)) {
          document.getElementById(id).innerHTML = data;
          callbacks?.forEach((fn) => fn());
        }
      });
  }
  // Common Header
  function fetchHeader() {
    fetch("/components/header.html")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("com-header").innerHTML = data;

        const currentPath = window.location.pathname;

        document.querySelectorAll("#navmenu a").forEach((navLink) => {
          // Store the original href if not already stored
          if (!navLink.hasAttribute("data-original-href")) {
            navLink.setAttribute(
              "data-original-href",
              navLink.getAttribute("href")
            );
          }

          // Compare the current path with the link's href
          if (
            navLink.getAttribute("href") === currentPath ||
            navLink.href === window.location.href
          ) {
            navLink.classList.add("active"); // Add active class for styling
            navLink.setAttribute("href", "#"); // Set href to # for the current page
          } else {
            navLink.classList.remove("active"); // Ensure no stale active class
            navLink.setAttribute(
              "href",
              navLink.getAttribute("data-original-href")
            ); // Restore the original href
          }
        });

        function toggleScrolled() {
          const selectBody = document.querySelector("body");
          const selectHeader = document.querySelector("#header");
          if (
            !selectHeader.classList.contains("scroll-up-sticky") &&
            !selectHeader.classList.contains("sticky-top") &&
            !selectHeader.classList.contains("fixed-top")
          )
            return;
          window.scrollY > 100
            ? selectBody.classList.add("scrolled")
            : selectBody.classList.remove("scrolled");
        }

        document.addEventListener("scroll", toggleScrolled);
        window.addEventListener("load", toggleScrolled);

        /**
         * Mobile nav toggle
         */
        const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle");

        function mobileNavToogle() {
          document.querySelector("body").classList.toggle("mobile-nav-active");
          mobileNavToggleBtn.classList.toggle("bi-list");
          mobileNavToggleBtn.classList.toggle("bi-x");
        }
        mobileNavToggleBtn.addEventListener("click", mobileNavToogle);

        /**
         * Hide mobile nav on same-page/hash links
         */
        document.querySelectorAll("#navmenu a").forEach((navmenu) => {
          navmenu.addEventListener("click", () => {
            if (
              document.querySelector(".mobile-nav-active") &&
              !navmenu.classList.contains("dd-holder")
            ) {
              mobileNavToogle();
            }
          });
        });
        /**
         * Toggle mobile nav dropdowns
         */
        document.querySelectorAll(".navmenu .dd-holder").forEach((navmenu) => {
          navmenu.addEventListener("click", function (e) {
            e.preventDefault();
            this.classList.toggle("active");
            this.nextElementSibling.classList.toggle("dropdown-active");
            e.stopImmediatePropagation();
          });
        });
      });
  }
  document.addEventListener("DOMContentLoaded", fetchHeader);
  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  // function toggleScrolled() {
  //   const selectBody = document.querySelector("body");
  //   const selectHeader = document.querySelector("#header");
  //   if (
  //     !selectHeader.classList.contains("scroll-up-sticky") &&
  //     !selectHeader.classList.contains("sticky-top") &&
  //     !selectHeader.classList.contains("fixed-top")
  //   )
  //     return;
  //   window.scrollY > 100
  //     ? selectBody.classList.add("scrolled")
  //     : selectBody.classList.remove("scrolled");
  // }

  // document.addEventListener("scroll", toggleScrolled);
  // window.addEventListener("load", toggleScrolled);

  /**
   * Preloader
   */
  const preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  // common footer
  function fetchFooter() {
    fetch("/components/footer.html")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("com-footer").innerHTML = data;
        /**
         * Scroll top button
         */
        let scrollTop = document.querySelector(".scroll-top");

        function toggleScrollTop() {
          if (scrollTop) {
            window.scrollY > 100
              ? scrollTop.classList.add("active")
              : scrollTop.classList.remove("active");
          }
        }
        scrollTop.addEventListener("click", (e) => {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        });

        window.addEventListener("load", toggleScrollTop);
        document.addEventListener("scroll", toggleScrollTop);
      });
  }
  window.addEventListener("DOMContentLoaded", fetchFooter);

  /**
   * For dynamically identify sidebar activation on large screens
   */
  function markActiveSidebarLink(id) {
    const sidebarLinks = document.querySelectorAll(`#${id} a`);
    const currentPath = window.location.pathname;

    sidebarLinks.forEach((link) => {
      // Store original href if not stored
      if (!link.hasAttribute("data-original-href")) {
        link.setAttribute("data-original-href", link.getAttribute("href"));
      }

      // Normalize the href for comparison:
      // Because link.href gives absolute URL, compare using pathname for relative URLs
      const linkPath = new URL(link.href).pathname;
      if (linkPath === currentPath) {
        link.classList.add("active");
        link.setAttribute("href", "#"); // Disable link on current page
      } else {
        link.classList.remove("active");
        link.setAttribute("href", link.getAttribute("data-original-href")); // Restore original href
      }
    });
  }

  /**
   * Common sidebar for services
   */
  fetchAndFill("/components/services-sidebar.html", "srv-sidebar", () =>
    markActiveSidebarLink("srv-sidebar")
  );
  fetchAndFill("/components/solutions-sidebar.html", "sol-sidebar", () =>
    markActiveSidebarLink("sol-sidebar")
  );

  fetchAndFill("/components/haveQuestion.html", "have-question");
  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
  window.addEventListener("load", aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: ".glightbox",
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll(".isotope-layout").forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute("data-layout") ?? "masonry";
    let filter = isotopeItem.getAttribute("data-default-filter") ?? "*";
    let sort = isotopeItem.getAttribute("data-sort") ?? "original-order";

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector(".isotope-container"), function () {
      initIsotope = new Isotope(
        isotopeItem.querySelector(".isotope-container"),
        {
          itemSelector: ".isotope-item",
          layoutMode: layout,
          filter: filter,
          sortBy: sort,
        }
      );
    });

    isotopeItem
      .querySelectorAll(".isotope-filters li")
      .forEach(function (filters) {
        filters.addEventListener(
          "click",
          function () {
            isotopeItem
              .querySelector(".isotope-filters .filter-active")
              .classList.remove("filter-active");
            this.classList.add("filter-active");
            initIsotope.arrange({
              filter: this.getAttribute("data-filter"),
            });
            if (typeof aosInit === "function") {
              aosInit();
            }
          },
          false
        );
      });
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener("load", function (e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: "smooth",
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll(".navmenu a");

  function navmenuScrollspy() {
    navmenulinks.forEach((navmenulink) => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        document
          .querySelectorAll(".navmenu a.active")
          .forEach((link) => link.classList.remove("active"));
        navmenulink.classList.add("active");
      } else {
        navmenulink.classList.remove("active");
      }
    });
  }
  window.addEventListener("load", navmenuScrollspy);
  document.addEventListener("scroll", navmenuScrollspy);
})();
