// Scroll reveal
const ro = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("vis");
        ro.unobserve(e.target);
      }
    });
  },
  { threshold: 0.07 },
);

document.querySelectorAll(".reveal").forEach((el) => ro.observe(el));

// Nav state
const nav = document.getElementById("nav");
function setNav() {
  if (!nav) return;
  if (window.scrollY > 40) {
    nav.classList.remove("at-top");
    nav.classList.add("scrolled");
  } else {
    nav.classList.add("at-top");
    nav.classList.remove("scrolled");
  }
}
setNav();
window.addEventListener("scroll", setNav);

// Mobile nav
function toggleMobile() {
  document.getElementById("mobileNav")?.classList.toggle("open");
}
function closeMobile() {
  document.getElementById("mobileNav")?.classList.remove("open");
}
window.toggleMobile = toggleMobile;
window.closeMobile = closeMobile;

// Scroll helper (avoid clashing with window.scrollTo)
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
window.scrollToSection = scrollToSection;

// Who we support tabs
function switchSupport(btn, id) {
  document.querySelectorAll(".stab").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".support-panel").forEach((p) => p.classList.remove("active"));
  btn?.classList.add("active");
  document.getElementById(id)?.classList.add("active");
}
window.switchSupport = switchSupport;

// Service tabs
function showSvcTab(cat, btn) {
  const map = { org: "sp-org", leadership: "sp-leadership", individual: "sp-individual" };
  document.querySelectorAll(".svctab").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".svc-panel").forEach((p) => p.classList.remove("active"));

  const panelId = map[cat];
  document.getElementById(panelId)?.classList.add("active");

  if (btn) {
    btn.classList.add("active");
  } else {
    const idx = { org: 0, leadership: 1, individual: 2 }[cat];
    document.querySelectorAll(".svctab")[idx]?.classList.add("active");
  }

  // ensure newly shown content is visible if already in view
  document.querySelectorAll(`#${panelId} .reveal:not(.vis)`).forEach((el) => el.classList.add("vis"));
}
window.showSvcTab = showSvcTab;

// Booking form submit (Netlify Forms)
// Use native submission (most reliable on Netlify), then redirect back with ?submitted=1
const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  bookingForm.addEventListener("submit", () => {
    const btn = document.getElementById("formSubmit");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Submitting...";
    }
  });
}

// Show success state after Netlify redirect (?submitted=1)
try {
  const url = new URL(window.location.href);
  if (url.searchParams.get("submitted") === "1") {
    const form = document.getElementById("bookingForm");
    const success = document.getElementById("formSuccess");
    if (form) form.style.display = "none";
    if (success) success.style.display = "block";
    document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
  }
} catch {
  // ignore URL parsing errors
}

// Keep "Book This Service" buttons pre-filling the service dropdown
function openModal(service) {
  const sel = document.querySelector('select[name="service"]');
  if (sel) {
    for (const opt of sel.options) {
      if (opt.value === service || opt.text === service) {
        sel.value = opt.value;
        break;
      }
    }
  }
  document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
}
window.openModal = openModal;

// (footer newsletter removed)
