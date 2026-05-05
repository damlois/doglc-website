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

// Booking form: POST to Vercel serverless /api/booking (see api/booking.js)
const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("formSubmit");
    const formError = document.getElementById("formError");
    const success = document.getElementById("formSuccess");
    const label = btn ? btn.textContent : "";

    if (formError) {
      formError.hidden = true;
      formError.textContent = "";
    }

    const fd = new FormData(bookingForm);
    if (String(fd.get("website") || "").trim() !== "") {
      return;
    }

    const payload = {
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      organisation: fd.get("organisation"),
      service: fd.get("service"),
      role: fd.get("role"),
      message: fd.get("message"),
    };

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Submitting...";
    }

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again or email info@damilolaolaniyi.com.";
        throw new Error(msg);
      }

      bookingForm.style.display = "none";
      if (success) success.style.display = "block";
      document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? "Could not reach the server. If you are testing locally, run `vercel dev` so /api/booking is available."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again or email info@damilolaolaniyi.com.";
      if (formError) {
        formError.textContent = msg;
        formError.hidden = false;
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = label || "Submit Booking Request";
      }
    }
  });
}

// Legacy: success after old Netlify redirect (?submitted=1)
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
