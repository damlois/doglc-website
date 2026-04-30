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
const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("formSubmit");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Submitting...";
    }

    try {
      const data = new FormData(bookingForm);
      // Netlify expects application/x-www-form-urlencoded
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      });

      if (res.ok) {
        bookingForm.style.display = "none";
        document.getElementById("formSuccess").style.display = "block";
        return;
      }
    } catch {
      // fall through
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = "Submit Booking Request";
    }
    alert("Unable to submit right now. Please email info@damilolaolaniyi.com directly.");
  });
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
