// ============================================================
//  script.js — Portfolio Logic + Supabase Integration
// ============================================================

// Init Supabase client
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── 1. LOAD STATISTIK OTOMATIS DARI SUPABASE ─────────────────
async function loadStats() {
  try {
    const { count: projectCount } = await sb
      .from("portfolio_items")
      .select("*", { count: "exact", head: true })
      .eq("category", "project");

    const { count: certCount } = await sb
      .from("portfolio_items")
      .select("*", { count: "exact", head: true })
      .eq("category", "cert");

    const { data: settings } = await sb
      .from("site_settings")
      .select("stat_experience")
      .single();

    const projEl = document.getElementById("stat-projects");
    const certEl = document.getElementById("stat-certs");
    const expEl = document.getElementById("stat-exp");

    if (projEl) projEl.innerText = "0" + (projectCount || 0) + "+";
    if (certEl) certEl.innerText = "0" + (certCount || 0) + "+";
    if (expEl && settings) expEl.innerText = settings.stat_experience || "0+";
  } catch (err) {
    console.error("Error memuat statistik otomatis:", err);
  }
}

// ─── 2. LOAD PENGALAMAN KERJA ────────────────────────────────
async function loadExperiences() {
  const timeline = document.getElementById("experience-timeline");
  if (!timeline) return;

  try {
    // Mengubah ascending menjadi true agar urut dari atas ke bawah
    const { data, error } = await sb
      .from("experiences")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;

    if (!data || data.length === 0) {
      timeline.innerHTML = `<p style="color:var(--text-dim); font-size: 0.9rem;">Belum ada pengalaman yang ditambahkan.</p>`;
      return;
    }

    timeline.innerHTML = data
      .map(
        (exp) => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <span class="time">${exp.year_range}</span>
                    <h3>${exp.role}</h3>
                    <p class="company">${exp.company}</p>
                    <p>${exp.description}</p>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Error memuat pengalaman:", err);
    timeline.innerHTML = `<p style="color:var(--text-dim); font-size: 0.9rem;">Belum ada pengalaman yang ditambahkan.</p>`;
  }
}

// ─── 3. LOAD PORTFOLIO ITEMS ─────────────────────────────────
async function loadPortfolio() {
  const grid = document.getElementById("portfolio-grid");
  const loading = document.getElementById("portfolio-loading");

  try {
    const { data, error } = await sb
      .from("portfolio_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (loading) loading.style.display = "none";

    if (!data || data.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><p style="color:var(--text-dim);text-align:center;padding:60px 0;">Belum ada portofolio item.</p></div>`;
      return;
    }

    grid.innerHTML = data.map((item) => renderCard(item)).join("");
    initFilter();
  } catch (err) {
    console.error("Supabase error:", err);
    if (loading) loading.style.display = "none";
    grid.innerHTML = getStaticCards();
    initFilter();
  }
}

function renderCard(item) {
  const isProject = item.category === "project";
  const tagsHTML = item.meta
    ? item.meta
        .split(",")
        .map((tag) => `<span class="tag-badge">${tag.trim()}</span>`)
        .join("")
    : "";

  return `
    <div class="item-card" data-category="${item.category}">
        ${
          item.image_url
            ? `<div class="card-img" style="background-image: url('${item.image_url}'); background-size: cover; background-position: center;"></div>`
            : `<div class="card-img"></div>`
        }
        <div class="card-content">
            ${tagsHTML ? `<div class="card-tags">${tagsHTML}</div>` : ""}
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="card-btns">
                ${
                  isProject
                    ? `
                        ${item.link_primary ? `<a href="${item.link_primary}" target="_blank" class="link-live"><i class="fa-solid fa-link"></i> Live Demo</a>` : ""}
                        ${item.link_secondary ? `<a href="${item.link_secondary}" target="_blank" class="link-source"><i class="fa-brands fa-github"></i> Source Code</a>` : ""}
                      `
                    : `
                        ${item.link_primary ? `<a href="${item.link_primary}" target="_blank" class="link-live"><i class="fa-solid fa-file-pdf"></i> Lihat Sertifikat</a>` : ""}
                      `
                }
            </div>
        </div>
    </div>`;
}

function getStaticCards() {
  return `<div style="grid-column: 1/-1; text-align:center; color:var(--text-dim);">Gagal memuat dari Supabase. Cek koneksi kamu ya.</div>`;
}

// ─── 4. FILTER TABS ───────────────────────────────────────────
function initFilter() {
  const tabs = document.querySelectorAll(".tab-btn");
  const items = document.querySelectorAll(".item-card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-target");
      items.forEach((item) => {
        item.classList.toggle(
          "hidden",
          target !== "all" && item.getAttribute("data-category") !== target,
        );
      });
    });
  });
}

// ─── 5. CONTACT FORM (Formspree) ──────────────────────────────
const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Mengirim... <i class="fa fa-spinner fa-spin"></i>';

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        Swal.fire({
          title: "Packet Received!",
          text: "Pesan kamu udah sampai dengan aman via Formspree.",
          icon: "success",
          background: "var(--surface)",
          color: "var(--text-main)",
          confirmButtonColor: "var(--primary)",
        });
        form.reset();
      } else {
        throw new Error("Formspree menolak request.");
      }
    } catch (err) {
      console.warn("Error pengiriman pesan:", err);
      Swal.fire({
        title: "Packet Loss",
        text: "Gagal mengirim pesan nih. Pastikan adblocker kamu dimatikan ya.",
        icon: "error",
        background: "var(--surface)",
        color: "var(--text-main)",
      });
    }

    btn.disabled = false;
    btn.innerHTML = originalText;
  });
}

// ─── 6. FITUR TEMA GELAP / TERANG ─────────────────────────────
const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.documentElement;
const themeIcon = themeToggleBtn?.querySelector("i");

// Cek tema yang tersimpan di Local Storage
const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme) {
  body.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("portfolio-theme", newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  if (themeIcon) {
    if (theme === "light") {
      themeIcon.className = "fa-solid fa-moon";
    } else {
      themeIcon.className = "fa-solid fa-sun";
    }
  }
}

// ─── 7. FITUR TOMBOL KEMBALI KE ATAS ──────────────────────────
const backToTopBtn = document.getElementById("backToTop");

if (backToTopBtn) {
  window.addEventListener("scroll", () => {
    // Tampilkan tombol kalau scroll lebih dari 300px
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ─── 8. HAMBURGER MENU ────────────────────────────────────────
const hamburgerBtn = document.getElementById("hamburger-menu");
const navLinks = document.getElementById("nav-links");

if (hamburgerBtn && navLinks) {
  hamburgerBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const icon = hamburgerBtn.querySelector("i");
    if (navLinks.classList.contains("active")) {
      icon.className = "fa-solid fa-xmark";
    } else {
      icon.className = "fa-solid fa-bars";
    }
  });

  // Tutup menu saat link diklik untuk navigasi mobile
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      const icon = hamburgerBtn.querySelector("i");
      if (icon) icon.className = "fa-solid fa-bars";
    });
  });
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadExperiences();
  loadPortfolio();
});
