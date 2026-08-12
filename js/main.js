/**
 * CẬP NHẬT THÔNG TIN LIÊN HỆ TẠI ĐÂY.
 * Giữ value/url rỗng nếu chưa muốn kích hoạt kênh liên hệ tương ứng.
 */
const CONTACT = {
  email: {
    label: "hello@example.com",
    value: ""
  },
  zalo: {
    label: "Thêm số Zalo",
    url: ""
  },
  phone: {
    label: "Thêm số điện thoại",
    value: ""
  }
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-toggle]");
const mobileNavigation = document.querySelector("[data-mobile-navigation]");
const navigationLinks = [...document.querySelectorAll('nav a[href^="#"]')];

function setMenu(open) {
  if (!menuButton || !mobileNavigation) return;

  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
  mobileNavigation.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navigationLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) setMenu(false);
});

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 10);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

// Reveal nhẹ khi panel đi vào viewport.
const revealItems = document.querySelectorAll(".reveal:not(.is-visible)");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -36px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// Đồng bộ mục đang xem trên floating dock và mobile menu.
const trackedSections = [...document.querySelectorAll("main > section[id]")];

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navigationLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isCurrent);
          if (isCurrent) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-32% 0px -62%", threshold: 0 }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

function makePlaceholder(link) {
  link.href = "#contact";
  link.setAttribute("aria-disabled", "true");
  link.addEventListener("click", (event) => event.preventDefault());
}

function setContactLink(selector, label, href) {
  const link = document.querySelector(selector);
  if (!link) return;

  const text = link.querySelector("strong");
  if (text) text.textContent = label;

  if (href) link.href = href;
  else makePlaceholder(link);
}

function applyContactDetails() {
  const cleanPhone = CONTACT.phone.value.replace(/\s/g, "");

  setContactLink(
    '[data-contact="email"]',
    CONTACT.email.label,
    CONTACT.email.value ? `mailto:${CONTACT.email.value}` : ""
  );
  setContactLink('[data-contact="zalo"]', CONTACT.zalo.label, CONTACT.zalo.url);
  setContactLink(
    '[data-contact="phone"]',
    CONTACT.phone.label,
    cleanPhone ? `tel:${cleanPhone}` : ""
  );

  const emailCta = document.querySelector('[data-contact="email-cta"]');
  if (!emailCta) return;

  if (CONTACT.email.value) emailCta.href = `mailto:${CONTACT.email.value}`;
  else makePlaceholder(emailCta);
}

applyContactDetails();
