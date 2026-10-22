/* ── Page definitions ───────────────────────────────────── */
const PAGES = {
  overview: {
    title: "Halo Ridwan",
    sub: 'Ringkasan performa workspace <strong>Lumina Studio</strong> hari ini.',
    cta: "Pesanan baru",
  },
  analytics: {
    title: "Analytics",
    sub: "Perilaku pengunjung, kanal, dan konversi.",
    cta: "Buat laporan",
  },
  pelanggan: {
    title: "Pelanggan",
    sub: "8.412 pelanggan · <strong>412 baru</strong> bulan ini.",
    cta: "Tambah pelanggan",
  },
  inventori: {
    title: "Inventori",
    sub: "1.284 SKU · <strong>23 stok menipis</strong> perlu restock.",
    cta: "Tambah produk",
  },
  pesanan: {
    title: "Pesanan",
    sub: "1.204 pesanan bulan ini · <strong>37 perlu diproses</strong>.",
    cta: "Pesanan baru",
  },
  pengaturan: {
    title: "Pengaturan",
    sub: "Profil workspace, preferensi tampilan, dan keamanan akun.",
    cta: "Simpan perubahan",
  },
};

const pageEls = Array.from(document.querySelectorAll(".page"));
const navItems = Array.from(document.querySelectorAll(".nav-item"));
const head = document.getElementById("pageHead");
const primaryBtn = document.getElementById("primaryBtn");
const sidebar = document.getElementById("sidebar");
const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const routeName = () => {
  const raw = (location.hash || "").replace(/^#\/?/, "").split("?")[0];
  return PAGES[raw] ? raw : "overview";
};

let currentPage = null;

function render() {
  const name = routeName();
  if (name === currentPage) return;
  currentPage = name;

  pageEls.forEach((el) => {
    const on = el.id === "page-" + name;
    el.hidden = !on;
    el.classList.remove("is-in");
    if (on && !reduceQuery.matches) {
      void el.offsetWidth;
      el.classList.add("is-in");
    }
  });

  navItems.forEach((a) => {
    const on = a.getAttribute("href") === "#/" + name;
    a.classList.toggle("is-active", on);
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });

  const meta = PAGES[name];
  head.querySelector("h1").textContent = meta.title;
  head.querySelector(".sub").innerHTML = meta.sub;
  primaryBtn.innerHTML =
    '<svg aria-hidden="true"><use href="#' +
    (name === "pesanan" ? "i-bag" : name === "analytics" ? "i-chart" : name === "pengaturan" ? "i-check" : "i-plus") +
    '"/></svg> ' +
    meta.cta;

  document.title = "Lumina — " + meta.title;
  document.body.dataset.page = name;
  hydrate(name);
  closeDrawer();
  window.scrollTo({ top: 0, behavior: reduceQuery.matches ? "auto" : "smooth" });
}

/* ── Nav clicks (also works for keyboard: real anchors) ── */
navItems.forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = a.getAttribute("href");
    if (location.hash === target) render();
    else location.hash = target;
  });
});

window.addEventListener("hashchange", render);

/* ── Drawer ─────────────────────────────────────────────── */
const menuBtn = document.getElementById("menuBtn");
const scrim = document.getElementById("scrim");
function closeDrawer() {
  if (!sidebar.classList.contains("is-open")) return;
  sidebar.classList.remove("is-open");
  menuBtn.setAttribute("aria-expanded", "false");
  scrim.hidden = true;
  document.body.style.overflow = "";
}
menuBtn &&
  menuBtn.addEventListener("click", () => {
    const open = !sidebar.classList.contains("is-open");
    sidebar.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    scrim.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) sidebar.querySelector(".nav-item")?.focus();
  });
scrim && scrim.addEventListener("click", closeDrawer);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (sidebar.classList.contains("is-open")) {
      closeDrawer();
      menuBtn.focus();
    }
  }
});
window.matchMedia("(min-width:901px)").addEventListener("change", (e) => e.matches && closeDrawer());

/* ── Per-page behaviour, runs on every navigation ───────── */
const once = new WeakSet();
const bind = (el, fn) => {
  if (!el || once.has(el)) return;
  once.add(el);
  fn(el);
};

function hydrate(name) {
  document.dispatchEvent(new CustomEvent("lumina:page", { detail: { name } }));
  if (name === "pelanggan") bind(document.getElementById("page-pelanggan"), initCustomerFilter);
  if (name === "pesanan") bind(document.getElementById("page-pesanan"), initOrderFilter);
  if (name === "analytics") bind(document.getElementById("page-analytics"), initSortable);
  if (name === "pengaturan") bind(document.getElementById("page-pengaturan"), initSettings);
}

/* ── Pelanggan: cari + filter status ────────────────────── */
function initCustomerFilter(scope) {
  const rows = Array.from(scope.querySelectorAll("#custTable tbody tr"));
  const input = scope.querySelector("#custSearch");
  const chips = Array.from(scope.querySelectorAll(".filters .chip"));
  const empty = scope.querySelector("#custEmpty");
  const shown = scope.querySelector("#custShown");
  let status = "all";

  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    rows.forEach((tr) => {
      const text = tr.textContent.toLowerCase();
      const okStatus = status === "all" || tr.dataset.status === status;
      const okQuery = !q || text.includes(q);
      const on = okStatus && okQuery;
      tr.hidden = !on;
      if (on) visible++;
    });
    empty.hidden = visible > 0;
    shown.textContent = `Menampilkan ${visible} dari 8.412`;
  };

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      status = chip.dataset.filter;
      chips.forEach((c) => {
        c.classList.toggle("is-on", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      apply();
    })
  );

  input.addEventListener("input", apply);
  scope.querySelector("#custReset").addEventListener("click", () => {
    input.value = "";
    status = "all";
    chips.forEach((c, i) => {
      c.classList.toggle("is-on", i === 0);
      c.setAttribute("aria-pressed", String(i === 0));
    });
    apply();
    input.focus();
  });
  apply();
}

/* ── Pesanan: filter status ─────────────────────────────── */
function initOrderFilter(scope) {
  const rows = Array.from(scope.querySelectorAll("#ordTable tbody tr"));
  const chips = Array.from(scope.querySelectorAll("#ordFilters .chip"));
  const empty = scope.querySelector("#ordEmpty");
  const count = scope.querySelector("#ordCount");

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const status = chip.dataset.filter;
      let visible = 0;
      rows.forEach((tr) => {
        const on = status === "all" || tr.dataset.status === status;
        tr.hidden = !on;
        if (on) visible++;
      });
      chips.forEach((c) => {
        c.classList.toggle("is-on", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      empty.hidden = visible > 0;
      count.textContent = `${visible} pesanan ditampilkan`;
    })
  );
}

/* ── Analytics: urutkan tabel ───────────────────────────── */
function initSortable(scope) {
  scope.querySelectorAll("th.sortable").forEach((th) => {
    th.tabIndex = 0;
    th.setAttribute("role", "button");
    const run = () => {
      const table = th.closest("table");
      const body = table.tBodies[0];
      const col = Array.from(th.parentNode.children).indexOf(th);
      const dir = th.getAttribute("aria-sort") === "descending" ? "ascending" : "descending";
      th.parentNode.querySelectorAll("th").forEach((o) => o.removeAttribute("aria-sort"));
      th.setAttribute("aria-sort", dir);
      Array.from(body.rows)
        .sort((a, b) => {
          const num = (r) => Number(r.cells[col].textContent.replace(/[^\d]/g, "")) || 0;
          return dir === "ascending" ? num(a) - num(b) : num(b) - num(a);
        })
        .forEach((r) => body.appendChild(r));
    };
    th.addEventListener("click", run);
    th.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        run();
      }
    });
  });
}

/* ── Pengaturan ─────────────────────────────────────────── */
function initSettings(scope) {
  scope.querySelectorAll(".switch").forEach((sw) => {
    sw.addEventListener("click", () => {
      const on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", String(on));
      if (sw.id === "themeSwitch") setTheme(on ? "dark" : "light");
      if (sw.id === "motionSwitch") document.documentElement.toggleAttribute("data-no-motion", !on);
    });
  });

  scope.querySelectorAll(".radio").forEach((r) =>
    r.addEventListener("click", () => {
      scope.querySelectorAll(".radio").forEach((o) => o.setAttribute("aria-checked", String(o === r)));
      document.documentElement.setAttribute("data-density", r.dataset.density);
      if (r.dataset.density === "rapat") localStorage.setItem("lumina-density", "rapat");
      else localStorage.removeItem("lumina-density");
    })
  );

  const form = scope.querySelector("form");
  const note = scope.querySelector("#saveNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    note.hidden = false;
    clearTimeout(form._t);
    form._t = setTimeout(() => (note.hidden = true), 2600);
  });

  const danger = scope.querySelector("#dangerBtn");
  danger.addEventListener("click", () => {
    if (danger.dataset.armed === "1") {
      danger.textContent = "Workspace dihapus (simulasi)";
      danger.disabled = true;
      danger.style.opacity = ".6";
      return;
    }
    danger.dataset.armed = "1";
    danger.textContent = "Yakin? Klik sekali lagi";
    danger.style.background = "color-mix(in srgb, var(--bad) 26%, var(--card))";
    setTimeout(() => {
      if (danger.disabled) return;
      danger.dataset.armed = "0";
      danger.textContent = "Hapus workspace";
      danger.style.background = "";
    }, 4000);
  });
}
