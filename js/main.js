/**
 * CẬP NHẬT THÔNG TIN LIÊN HỆ TẠI ĐÂY
 * Giữ chuỗi rỗng nếu bạn chưa muốn hiển thị một kênh liên hệ.
 */
const CONTACT = {
  zalo: {
    label: "Thêm số Zalo",
    url: ""
  },
  phone: {
    label: "Thêm số điện thoại",
    value: ""
  },
  email: {
    label: "hello@example.com",
    value: ""
  }
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");
const navigationLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];

function setMenu(open) {
  if (!menuToggle || !navigation) return;

  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
  navigation.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  setMenu(!isOpen);
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 992) setMenu(false);
});

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

// Reveal nhẹ khi nội dung đi vào viewport.
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
    { threshold: 0.12, rootMargin: "0px 0px -40px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// Đánh dấu mục điều hướng tương ứng với section đang xem.
const trackedSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

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
    { rootMargin: "-30% 0px -60%", threshold: 0 }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

// FAQ accordion: chỉ mở một câu trả lời tại một thời điểm.
const faqButtons = document.querySelectorAll(".faq-item button");

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const willOpen = button.getAttribute("aria-expanded") !== "true";

    faqButtons.forEach((otherButton) => {
      const answerId = otherButton.getAttribute("aria-controls");
      const answer = document.getElementById(answerId);
      const isTarget = otherButton === button;
      const shouldOpen = isTarget && willOpen;

      otherButton.setAttribute("aria-expanded", String(shouldOpen));
      if (answer) answer.hidden = !shouldOpen;
    });
  });
});

// Liên kết dữ liệu cấu hình với phần contact.
function disablePlaceholderLink(link) {
  link.setAttribute("href", "#contact");
  link.setAttribute("aria-disabled", "true");
  link.addEventListener("click", (event) => event.preventDefault());
}

function applyContactDetails() {
  const zaloLink = document.querySelector('[data-contact="zalo"]');
  const phoneLink = document.querySelector('[data-contact="phone"]');
  const emailLink = document.querySelector('[data-contact="email"]');
  const emailCta = document.querySelector('[data-contact="email-cta"]');

  if (zaloLink) {
    zaloLink.querySelector("strong").textContent = CONTACT.zalo.label;
    if (CONTACT.zalo.url) zaloLink.href = CONTACT.zalo.url;
    else disablePlaceholderLink(zaloLink);
  }

  if (phoneLink) {
    phoneLink.querySelector("strong").textContent = CONTACT.phone.label;
    if (CONTACT.phone.value) phoneLink.href = `tel:${CONTACT.phone.value.replace(/\s/g, "")}`;
    else disablePlaceholderLink(phoneLink);
  }

  if (emailLink) {
    emailLink.querySelector("strong").textContent = CONTACT.email.label;
    if (CONTACT.email.value) emailLink.href = `mailto:${CONTACT.email.value}`;
    else disablePlaceholderLink(emailLink);
  }

  if (emailCta) {
    if (CONTACT.email.value) emailCta.href = `mailto:${CONTACT.email.value}`;
    else disablePlaceholderLink(emailCta);
  }
}

applyContactDetails();
