"use strict";

const root = document.documentElement;
const body = document.body;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function focusSection(hash) {
  if (!hash || hash === "#") return;

  const target = document.querySelector(hash);
  if (!target) return;

  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  target.addEventListener(
    "blur",
    () => target.removeAttribute("tabindex"),
    { once: true }
  );
}

function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  const navigation = document.querySelector("#mobile-navigation");
  const backdrop = document.querySelector("[data-menu-close]");

  if (!toggle || !menu || !navigation) return;

  const links = [...navigation.querySelectorAll("a")];
  const sectionLinks = links.filter((link) => link.hash);
  let isOpen = false;
  let previousFocus = null;

  function updateLinkTabs(open) {
    links.forEach((link) => {
      if (open) link.removeAttribute("tabindex");
      else link.setAttribute("tabindex", "-1");
    });
  }

  function setMenu(open, restoreFocus = true) {
    if (isOpen === open) return;
    isOpen = open;

    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
    menu.inert = !open;
    body.classList.toggle("menu-open", open);
    updateLinkTabs(open);

    if (open) {
      previousFocus = document.activeElement;
      window.setTimeout(() => links[0]?.focus(), 100);
    } else if (restoreFocus) {
      const focusTarget =
        previousFocus instanceof HTMLElement && document.contains(previousFocus)
          ? previousFocus
          : toggle;
      focusTarget.focus();
    }
  }

  menu.inert = true;
  updateLinkTabs(false);

  toggle.addEventListener("click", () => setMenu(!isOpen));
  backdrop?.addEventListener("click", () => setMenu(false));

  sectionLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const hash = link.hash;
      setMenu(false, false);
      window.setTimeout(() => focusSection(hash), 450);
    });
  });

  links
    .filter((link) => !link.hash)
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));

  document.addEventListener("keydown", (event) => {
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = [toggle, ...links];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080 && isOpen) setMenu(false, false);
  });
}

function initRevealMotion() {
  const revealItems = [...document.querySelectorAll("[data-reveal]")];

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    body.classList.add("is-ready");
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -7% 0px" }
  );

  revealItems.forEach((item) => {
    const top = item.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.94) item.classList.add("is-visible");
    else observer.observe(item);
  });

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => body.classList.add("is-ready"));
  });
}

function initScrollUI() {
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector("[data-scroll-progress]");
  const sections = [...document.querySelectorAll("[data-section][id]")];
  const navLinks = [...document.querySelectorAll('[data-nav-link][href^="#"]')];
  let frame = 0;
  let currentSection = "";

  function updateNavigation(sectionId) {
    if (!sectionId || sectionId === currentSection) return;
    currentSection = sectionId;

    navLinks.forEach((link) => {
      const active = link.hash === `#${sectionId}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function update() {
    frame = 0;
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const activationPoint = scrollTop + window.innerHeight * 0.38;
    let activeId = sections[0]?.id || "";

    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top + scrollTop;
      if (top <= activationPoint) activeId = section.id;
    });

    if (scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      activeId = sections.at(-1)?.id || activeId;
    }

    header?.classList.toggle("is-scrolled", scrollTop > 10);
    if (progress) {
      const ratio = scrollable > 0 ? scrollTop / scrollable : 0;
      progress.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
    }
    updateNavigation(activeId);
  }

  function requestUpdate() {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  }

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate, { once: true });
}

function initLocalTime() {
  const time = document.querySelector("[data-local-time]");
  if (!time || !("Intl" in window)) return;

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const update = () => {
    time.textContent = `${formatter.format(new Date())} GMT+7`;
  };

  update();
  window.setInterval(update, 60_000);
}

function initCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
}

initMobileMenu();
initRevealMotion();
initScrollUI();
initLocalTime();
initCurrentYear();
