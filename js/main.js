"use strict";

/**
 * Cấu hình thông tin liên hệ tại một nơi duy nhất.
 * Các phần tử có data-contact-link / data-contact-label sẽ được đồng bộ tự động.
 */
const CONTACT = Object.freeze({
  email: {
    label: "haonqptit@gmail.com",
    href: "mailto:haonqptit@gmail.com"
  },
  phone: {
    label: "0394 760 406",
    href: "tel:+84394760406"
  },
  instagram: {
    label: "@ngqhao04",
    href: "https://www.instagram.com/ngqhao04/",
    external: true
  }
});

const root = document.documentElement;
const body = document.body;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyContactDetails() {
  Object.entries(CONTACT).forEach(([channel, details]) => {
    document.querySelectorAll(`[data-contact-link="${channel}"]`).forEach((link) => {
      link.href = details.href;

      if (details.external) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    });

    document.querySelectorAll(`[data-contact-label="${channel}"]`).forEach((label) => {
      label.textContent = details.label;
    });
  });
}

function initMobileMenu() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const mobileNavigation = document.querySelector("#mobile-navigation");
  const closeButton = document.querySelector("[data-menu-close]");

  if (!menuButton || !mobileMenu || !mobileNavigation) return;

  const menuLinks = [...mobileNavigation.querySelectorAll('a[href^="#"]')];
  let menuOpen = false;
  let lastFocusedElement = null;

  function setMenuTabState(open) {
    menuLinks.forEach((link) => {
      if (open) link.removeAttribute("tabindex");
      else link.setAttribute("tabindex", "-1");
    });
  }

  function focusSectionFromLink(link) {
    const target = document.querySelector(link.hash);
    if (!target) return;

    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    target.addEventListener(
      "blur",
      () => {
        target.removeAttribute("tabindex");
      },
      { once: true }
    );
  }

  function setMenu(open, options = {}) {
    const { restoreFocus = true } = options;
    if (menuOpen === open) return;

    menuOpen = open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.inert = !open;
    setMenuTabState(open);
    body.classList.toggle("menu-open", open);

    if (open) {
      lastFocusedElement = document.activeElement;
      window.setTimeout(() => menuLinks[0]?.focus(), 80);
    } else if (restoreFocus) {
      const focusTarget =
        lastFocusedElement instanceof HTMLElement && document.contains(lastFocusedElement)
          ? lastFocusedElement
          : menuButton;
      focusTarget.focus();
    }
  }

  mobileMenu.inert = true;
  setMenuTabState(false);

  menuButton.addEventListener("click", () => setMenu(!menuOpen));
  closeButton?.addEventListener("click", () => setMenu(false));

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenu(false, { restoreFocus: false });
      window.setTimeout(() => focusSectionFromLink(link), 0);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(false);
      return;
    }

    if (event.key !== "Tab" || menuLinks.length === 0) return;

    const firstLink = menuLinks[0];
    const lastLink = menuLinks[menuLinks.length - 1];

    if (event.shiftKey && document.activeElement === firstLink) {
      event.preventDefault();
      lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      firstLink.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && menuOpen) {
      setMenu(false, { restoreFocus: false });
    }
  });
}

function initMotion() {
  const revealItems = [
    ...document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale")
  ];
  const heroStaggers = document.querySelectorAll("[data-hero].stagger");
  const canObserve = "IntersectionObserver" in window;

  if (reducedMotionQuery.matches || !canObserve) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    heroStaggers.forEach((item) => item.classList.add("is-visible"));
    body.classList.add("is-ready");
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) item.classList.add("is-visible");
    else revealObserver.observe(item);
  });

  root.classList.add("motion-ready");

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      body.classList.add("is-ready");
      heroStaggers.forEach((item) => item.classList.add("is-visible"));
    });
  });
}

function initScrollUI() {
  const header = document.querySelector("[data-header]");
  const progressBar = document.querySelector("[data-scroll-progress]");
  const sections = [...document.querySelectorAll("[data-section][id]")];
  const navigationLinks = [...document.querySelectorAll("[data-nav-link][href^='#']")];
  const processTrack = document.querySelector("[data-process-track]");
  const processSteps = processTrack
    ? [...processTrack.querySelectorAll("[data-process-step]")]
    : [];

  let sectionPositions = [];
  let processCenters = [];
  let scheduledFrame = 0;
  let currentSectionId = "";

  function measurePage() {
    const scrollTop = window.scrollY;
    sectionPositions = sections.map((section) => ({
      id: section.id,
      top: section.getBoundingClientRect().top + scrollTop
    }));

    if (processTrack) {
      const trackTop = processTrack.getBoundingClientRect().top + scrollTop;
      processCenters = processSteps.map((step) => trackTop + step.offsetTop + 30);
    }
  }

  function setActiveSection(sectionId) {
    if (!sectionId || sectionId === currentSectionId) return;
    currentSectionId = sectionId;

    navigationLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function updateProcess(markerPosition) {
    if (!processTrack || processCenters.length === 0) return;

    const firstCenter = processCenters[0];
    const lastCenter = processCenters[processCenters.length - 1];
    const distance = Math.max(lastCenter - firstCenter, 1);
    const progress = Math.min(Math.max((markerPosition - firstCenter) / distance, 0), 1);
    processTrack.style.setProperty("--process-progress", progress.toFixed(4));

    let activeIndex = 0;
    processCenters.forEach((center, index) => {
      if (markerPosition >= center - 24) activeIndex = index;
    });

    processSteps.forEach((step, index) => {
      const isActive = index === activeIndex;
      step.classList.toggle("is-active", isActive);
      if (isActive) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
  }

  function updateScrollUI() {
    scheduledFrame = 0;
    const scrollTop = window.scrollY;
    const activationPoint = scrollTop + window.innerHeight * 0.42;
    const processMarker = scrollTop + window.innerHeight * 0.56;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = scrollableHeight > 0 ? scrollTop / scrollableHeight : 0;

    header?.classList.toggle("is-scrolled", scrollTop > 12);
    if (progressBar) {
      progressBar.style.transform = `scaleX(${Math.min(Math.max(pageProgress, 0), 1)})`;
    }

    let activeSection = sectionPositions[0]?.id || "";
    sectionPositions.forEach((section) => {
      if (section.top <= activationPoint) activeSection = section.id;
    });

    setActiveSection(activeSection);
    updateProcess(processMarker);
  }

  function requestScrollUpdate() {
    if (scheduledFrame) return;
    scheduledFrame = window.requestAnimationFrame(updateScrollUI);
  }

  function remeasure() {
    measurePage();
    requestScrollUpdate();
  }

  measurePage();
  updateScrollUI();

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", remeasure);
  window.addEventListener("load", remeasure, { once: true });

  if ("ResizeObserver" in window) {
    const pageResizeObserver = new ResizeObserver(remeasure);
    pageResizeObserver.observe(document.body);
  }
}

function initCardGlow() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!finePointer.matches) return;

  document.querySelectorAll(".capability-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    });
  });
}

function initLocalTime() {
  const timeElement = document.querySelector("[data-local-time]");
  if (!timeElement || !("Intl" in window)) return;

  const formatter = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const updateTime = () => {
    timeElement.textContent = `${formatter.format(new Date())} · GMT+7`;
  };

  updateTime();
  window.setInterval(updateTime, 60_000);
}

applyContactDetails();
initMobileMenu();
initScrollUI();
initCardGlow();
initLocalTime();
initMotion();
