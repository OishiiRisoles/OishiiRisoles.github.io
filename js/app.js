(function () {
  "use strict";

  var WA_NUMBER = "6282232187125";

  var PRODUCTS = [
    { id: "sosis", name: "Risol sosis", priceLabel: "3k", priceIdr: 3000, image: "images/RISOL-SOSIS.jpeg" },
    { id: "ayam", name: "Risol ayam", priceLabel: "4k", priceIdr: 4000, image: "images/RISOL-AYAM.jpeg" },
    { id: "dimsum", name: "Risol dimsum", priceLabel: "4k", priceIdr: 4000, image: "images/RISOL-DIMSUM.jpeg" },
    { id: "chocrella", name: "Risol chocrella", priceLabel: "4k", priceIdr: 4000, image: "images/RISOL-COCHORELLA.jpeg" },
    { id: "matcha", name: "Risol matcha", priceLabel: "4k", priceIdr: 4000, image: "images/RISOL-MATCHA.jpeg" },
    { id: "pizzarella", name: "Risol pizzarella", priceLabel: "4k", priceIdr: 4000, image: "images/RISOL-PIZZARELLA.jpeg" },
    { id: "dimsum-mentai", name: "Risol Dimsum Mentai", priceLabel: "5k", priceIdr: 5000, image: "images/RISOL-DIMSUM-MENTAI.jpeg" },
    { id: "paket-hemat", name: "Risol Paket Hemat", priceLabel: "30k", priceIdr: 30000, image: "images/RISOL-PAKET-HEMAT.jpeg" },
  ];

  var quantities = {};
  PRODUCTS.forEach(function (p) {
    quantities[p.id] = 0;
  });

  function formatIdr(n) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  }

  function getCartLines() {
    var lines = [];
    PRODUCTS.forEach(function (p) {
      var q = quantities[p.id];
      if (q > 0) {
        lines.push({ product: p, qty: q, lineTotal: q * p.priceIdr });
      }
    });
    return lines;
  }

  function getCartTotal() {
    var total = 0;
    getCartLines().forEach(function (l) {
      total += l.lineTotal;
    });
    return total;
  }

  function getDistinctCount() {
    return getCartLines().length;
  }

  function renderProductGrid() {
    var grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = PRODUCTS.map(function (p) {
      return (
        '<article class="product-card" data-id="' +
        escapeHtml(p.id) +
        '">' +
        '<div class="product-card__media">' +
        '<img src="' +
        escapeHtml(p.image) +
        '" alt="' +
        escapeHtml(p.name) +
        '" loading="lazy" width="400" height="300" />' +
        "</div>" +
        '<div class="product-card__body">' +
        "<h3 class=\"product-card__name\">" +
        escapeHtml(p.name) +
        "</h3>" +
        '<p class="product-card__price">Rp ' +
        escapeHtml(p.priceLabel) +
        "</p>" +
        '<div class="product-card__qty">' +
        '<div class="qty-control">' +
        '<button type="button" class="qty-control__btn" data-action="dec" data-id="' +
        escapeHtml(p.id) +
        '" aria-label="Kurangi">−</button>' +
        '<span class="qty-control__value" data-qty-display="' +
        escapeHtml(p.id) +
        '">' +
        quantities[p.id] +
        "</span>" +
        '<button type="button" class="qty-control__btn" data-action="inc" data-id="' +
        escapeHtml(p.id) +
        '" aria-label="Tambah">+</button>' +
        "</div>" +
        "</div>" +
        "</div>" +
        "</article>"
      );
    }).join("");

    grid.querySelectorAll(".qty-control__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var action = btn.getAttribute("data-action");
        if (!id || !action) return;
        var cur = quantities[id] || 0;
        if (action === "inc") {
          quantities[id] = cur + 1;
        } else if (action === "dec" && cur > 0) {
          quantities[id] = cur - 1;
        }
        updateQtyDisplay(id);
        updateOrderUI();
      });
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function updateQtyDisplay(id) {
    var el = document.querySelector('[data-qty-display="' + id + '"]');
    if (el) el.textContent = String(quantities[id] || 0);
  }

  function updateOrderUI() {
    var lines = getCartLines();
    var summary = document.getElementById("order-summary");
    var btnModal = document.getElementById("btn-open-modal");
    var btnSticky = document.getElementById("btn-sticky-order");
    var stickyCount = document.getElementById("sticky-count");

    var hasItems = lines.length > 0;

    if (summary) {
      if (!hasItems) {
        summary.textContent = "Belum ada item dipilih.";
      } else {
        var parts = lines.map(function (l) {
          return l.product.name + " × " + l.qty + " (" + formatIdr(l.lineTotal) + ")";
        });
        summary.textContent = "Ringkasan: " + parts.join("; ") + " — Total " + formatIdr(getCartTotal());
      }
    }

    if (btnModal) btnModal.disabled = !hasItems;
    if (btnSticky) btnSticky.disabled = !hasItems;
    if (stickyCount) stickyCount.textContent = String(getDistinctCount());
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add("toast--show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () {
      toast.classList.remove("toast--show");
      toast.hidden = true;
    }, 2800);
  }

  function openModal() {
    var lines = getCartLines();
    if (lines.length === 0) {
      showToast("Pilih minimal satu produk terlebih dahulu.");
      return;
    }
    var overlay = document.getElementById("modal-overlay");
    var preview = document.getElementById("modal-preview");
    if (preview) {
      preview.textContent = buildOrderSummaryText(lines, getCartTotal());
    }
    if (overlay) {
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      var nameField = document.getElementById("field-name");
      if (nameField) nameField.focus();
    }
  }

  function closeModal() {
    var overlay = document.getElementById("modal-overlay");
    if (overlay) {
      overlay.hidden = true;
      document.body.style.overflow = "";
    }
  }

  function buildOrderSummaryText(lines, total) {
    var rows = lines.map(function (l) {
      return "• " + l.product.name + " × " + l.qty + " @ Rp " + l.product.priceLabel + " = " + formatIdr(l.lineTotal);
    });
    return rows.join("\n") + "\nTotal: " + formatIdr(total);
  }

  function buildWhatsAppMessage(name, phone, timeStr) {
    var lines = getCartLines();
    var total = getCartTotal();
    var items = lines.map(function (l) {
      return l.product.name + " × " + l.qty + " (Rp " + l.product.priceLabel + "/pcs)";
    });
    var pickupLine = timeStr ? "Jam ambil: " + timeStr + "\n\n" : "\n";
    var msg =
      "Halo OISHII RISOLES,\n\n" +
      "Saya *" +
      name.trim() +
      "* (HP: " +
      phone.trim() +
      ").\n\n" +
      "Ingin memesan:\n" +
      items.join("\n") +
      "\n\n" +
      "Subtotal: " +
      formatIdr(total) +
      "\n" +
      pickupLine +
      "Terima kasih.";
    return msg;
  }

  function initForm() {
    var form = document.getElementById("order-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("field-name");
      var phone = document.getElementById("field-phone");
      var timeEl = document.getElementById("field-time");
      if (!name || !phone || !timeEl) return;

      var n = name.value.trim();
      var ph = phone.value.trim();
      var t = timeEl.value;

      if (!n) {
        showToast("Mohon isi nama.");
        name.focus();
        return;
      }
      if (!ph) {
        showToast("Mohon isi nomor HP.");
        phone.focus();
        return;
      }
      if (!t) {
        showToast("Mohon pilih jam ambil.");
        return;
      }

      var timeFormatted = t.length >= 5 ? t.slice(0, 5) : t;
      var msg = buildWhatsAppMessage(n, ph, timeFormatted);
      var encoded = encodeURIComponent(msg);
      if (encoded.length > 8000) {
        showToast("Pesan terlalu panjang. Kurangi jumlah item.");
        return;
      }

      var url = "https://wa.me/" + WA_NUMBER + "?text=" + encoded;
      window.open(url, "_blank", "noopener,noreferrer");
      closeModal();
    });
  }

  function bindModalButtons() {
    var openBtn = document.getElementById("btn-open-modal");
    var stickyBtn = document.getElementById("btn-sticky-order");
    var closeBtn = document.getElementById("btn-close-modal");
    var cancelBtn = document.getElementById("btn-cancel-modal");
    var overlay = document.getElementById("modal-overlay");
    if (openBtn) openBtn.addEventListener("click", openModal);
    if (stickyBtn) stickyBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target.id === "modal-overlay") closeModal();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  function bindScrollButtons() {
    document.querySelectorAll("[data-scroll-to]").forEach(function (el) {
      el.addEventListener("click", function () {
        var sel = el.getAttribute("data-scroll-to");
        if (!sel) return;
        var target = document.querySelector(sel);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (sel.indexOf("#") === 0) setNavActiveLink(sel);
      });
    });
  }

  /* Urutan section di halaman (atas → bawah), BUKAN urutan link di menu */
  var NAV_SCROLL_SECTION_ORDER = ["beranda", "tentang", "testimoni", "produk", "kontak"];

  function getHeaderScrollOffset() {
    var header = document.querySelector(".site-header");
    return header ? header.offsetHeight + 10 : 90;
  }

  function setNavActiveLink(hash) {
    if (!hash || hash === "#") hash = "#beranda";
    var links = document.querySelectorAll(".nav .nav__link");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.getAttribute("href") === hash) {
        link.classList.add("nav__link--active");
      } else {
        link.classList.remove("nav__link--active");
      }
    }
  }

  function updateNavFromScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var offset = getHeaderScrollOffset();
    var doc = document.documentElement;
    var nearBottom = y + window.innerHeight >= doc.scrollHeight - 48;
    var activeId = NAV_SCROLL_SECTION_ORDER[0];

    if (nearBottom) {
      activeId = "kontak";
    } else {
      for (var i = 0; i < NAV_SCROLL_SECTION_ORDER.length; i++) {
        var id = NAV_SCROLL_SECTION_ORDER[i];
        var el = document.getElementById(id);
        if (!el) continue;
        var rect = el.getBoundingClientRect();
        var sectionTop = y + rect.top;
        if (y + offset >= sectionTop - 20) {
          activeId = id;
        }
      }
    }
    setNavActiveLink("#" + activeId);
  }

  function bindNavScrollSpy() {
    var nav = document.querySelector(".nav");
    if (!nav) return;

    nav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        var href = link.getAttribute("href");
        if (href) setNavActiveLink(href);
      });
    });

    document.querySelectorAll('.logo--header[href^="#"]').forEach(function (logo) {
      logo.addEventListener("click", function () {
        var href = logo.getAttribute("href");
        if (href) setNavActiveLink(href);
      });
    });

    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(function () {
            updateNavFromScroll();
            ticking = false;
          });
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", function () {
      updateNavFromScroll();
    });
    updateNavFromScroll();
  }

  function setYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initPageLoader() {
    var loader = document.getElementById("page-loader");
    var root = document.documentElement;
    root.classList.add("is-loading");
    var start = Date.now();
    var minVisibleMs = 1100;

    function hideLoader() {
      var elapsed = Date.now() - start;
      var remaining = Math.max(0, minVisibleMs - elapsed);
      window.setTimeout(function () {
        root.classList.remove("is-loading");
        root.classList.add("is-loaded");
        if (loader) {
          loader.classList.add("page-loader--hide");
          loader.setAttribute("aria-busy", "false");
          loader.setAttribute("aria-hidden", "true");
        }
        window.setTimeout(function () {
          if (loader) loader.hidden = true;
          initChibiPeek();
        }, 520);
      }, remaining);
    }

    if (document.readyState === "complete") {
      hideLoader();
    } else {
      window.addEventListener("load", hideLoader);
    }
  }

  function initChibiPeek() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var el = document.getElementById("chibi-peek");
    if (!el) return;

    var busy = false;

    function nextDelay() {
      return 18000 + Math.random() * 22000;
    }

    function hidePeek(done) {
      el.classList.remove("chibi-peek--visible");
      window.setTimeout(function () {
        el.hidden = true;
        el.classList.remove("chibi-peek--left", "chibi-peek--right");
        el.setAttribute("aria-hidden", "true");
        busy = false;
        if (typeof done === "function") done();
      }, 520);
    }

    function showPeek() {
      if (busy) return;
      busy = true;
      var fromLeft = Math.random() < 0.5;
      el.classList.remove("chibi-peek--left", "chibi-peek--right", "chibi-peek--visible");
      el.hidden = false;
      el.setAttribute("aria-hidden", "false");
      el.classList.add(fromLeft ? "chibi-peek--left" : "chibi-peek--right");
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          el.classList.add("chibi-peek--visible");
        });
      });
      var stayMs = 4200 + Math.random() * 2200;
      window.setTimeout(function () {
        hidePeek(schedulePeek);
      }, stayMs);
    }

    function schedulePeek() {
      window.setTimeout(showPeek, nextDelay());
    }

    schedulePeek();
  }

  function init() {
    renderProductGrid();
    updateOrderUI();
    initForm();
    bindModalButtons();
    bindScrollButtons();
    bindNavScrollSpy();
    setYear();
  }

  initPageLoader();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
