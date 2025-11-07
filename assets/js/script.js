'use strict';

/* ========== small helpers ========== */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const safeToggle = (el, cls = 'active') => { if (!el) return false; el.classList.toggle(cls); return el.classList.contains(cls); };

/* ========== SIDEBAR toggle ========== */
const sidebar = qs('[data-sidebar]');
const sidebarBtn = qs('[data-sidebar-btn]');
const sidebarMore = qs('[data-sidebar-more]') || qs('#sidebar-more');

if (sidebarBtn && sidebar) {
  sidebarBtn.addEventListener('click', () => {
    const active = safeToggle(sidebar, 'active');
    // aria-expanded on button
    sidebarBtn.setAttribute('aria-expanded', active ? 'true' : 'false');
    if (sidebarMore) {
      // mirror visibility
      if (active) sidebarMore.style.display = '';
      else sidebarMore.style.display = 'none';
    }
  });
  // initialize collapsed
  if (sidebar && !sidebar.classList.contains('active')) {
    if (sidebarMore) sidebarMore.style.display = 'none';
    sidebarBtn.setAttribute('aria-expanded', 'false');
  }
}

/* ========== NAVIGATION (About / Resume / Portfolio / Contact) ========== */
const navLinks = qsa('[data-nav-link]');
const pages = qsa('[data-page]');

function showPageByName(name) {
  const target = (name || '').trim().toLowerCase();
  pages.forEach(p => {
    const pageName = (p.dataset.page || '').trim().toLowerCase();
    if (pageName === target) {
      p.hidden = false;
      p.classList.add('active');
      // ensure visible for small-screen
      p.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      p.hidden = true;
      p.classList.remove('active');
    }
  });
  navLinks.forEach(n => {
    if ((n.textContent || '').trim().toLowerCase() === target) n.classList.add('active');
    else n.classList.remove('active');
  });
}

// init: show first nav by default if pages exist
if (pages.length && navLinks.length) {
  // show the page corresponding to the active nav if present
  const activeNav = navLinks.find(n => n.classList.contains('active'));
  if (activeNav) showPageByName(activeNav.textContent);
  else showPageByName(navLinks[0].textContent);

  navLinks.forEach(btn => {
    btn.addEventListener('click', () => showPageByName(btn.textContent));
  });
}

/* ========== PORTFOLIO FILTER & SELECT ========== */
const select = qs('[data-select]');
const selectBtn = select;
const selectList = qs('.select-list');
const selectValueSpan = qs('[data-select-value]');
const selectItems = qsa('[data-select-item]');
const filterBtns = qsa('[data-filter-btn]');
const projects = qsa('[data-filter-item]');

if (selectBtn) {
  selectBtn.addEventListener('click', () => {
    const isActive = safeToggle(selectBtn, 'active');
    selectBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    if (selectList) selectList.style.display = isActive ? 'block' : 'none';
  });
}

const applyFilter = (value) => {
  const val = (value || 'all').toLowerCase().trim();
  projects.forEach(p => {
    const cat = (p.dataset.category || '').toLowerCase();
    if (val === 'all' || cat.includes(val)) {
      p.classList.add('active');
      p.style.display = '';
    } else {
      p.classList.remove('active');
      p.style.display = 'none';
    }
  });
};

// select list items
selectItems.forEach(item => {
  item.addEventListener('click', () => {
    const text = item.textContent.trim();
    if (selectValueSpan) selectValueSpan.textContent = text;
    if (selectBtn) { selectBtn.classList.remove('active'); selectBtn.setAttribute('aria-expanded', 'false'); }
    if (selectList) selectList.style.display = 'none';
    applyFilter(text);
  });
});

// filter buttons (desktop)
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.textContent.trim();
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (selectValueSpan) selectValueSpan.textContent = text;
    applyFilter(text);
  });
});

// initialize
applyFilter('all');

/* ========== TESTIMONIALS / GENERIC MODAL ========== */
const testimonialItems = qsa('[data-testimonials-item]'); // optional
const modalContainer = qs('[data-modal-container]');
const overlay = qs('[data-overlay]');
const modalCloseBtn = qs('[data-modal-close-btn]');
const modalImg = qs('[data-modal-img]');
const modalTitle = qs('[data-modal-title]');
const modalText = qs('[data-modal-text]');

const toggleModal = (show) => {
  if (!modalContainer) return;
  const active = typeof show === 'boolean' ? show : !modalContainer.classList.contains('active');
  modalContainer.classList.toggle('active', active);
  if (overlay) overlay.style.display = active ? 'block' : 'none';
  modalContainer.hidden = !active;
  if (modalContainer.classList.contains('active')) {
    modalContainer.querySelector('.testimonials-modal')?.setAttribute('aria-hidden', 'false');
  } else {
    modalContainer.querySelector('.testimonials-modal')?.setAttribute('aria-hidden', 'true');
  }
};

if (testimonialItems.length && modalContainer && overlay) {
  testimonialItems.forEach(item => {
    item.addEventListener('click', () => {
      const avatar = item.querySelector('[data-testimonials-avatar]');
      const title = item.querySelector('[data-testimonials-title]');
      const text = item.querySelector('[data-testimonials-text]');
      if (avatar && modalImg) {
        modalImg.src = avatar.src;
        modalImg.alt = avatar.alt || '';
      }
      if (title && modalTitle) modalTitle.innerHTML = title.innerHTML;
      if (text && modalText) modalText.innerHTML = text.innerHTML;
      toggleModal(true);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => toggleModal(false));
  overlay.addEventListener('click', () => toggleModal(false));
}

/* ========== CONTACT FORM (demo) ========== */
const form = qs('[data-form]');
const formInputs = qsa('[data-form-input]');
const formBtn = qs('[data-form-btn]');

const updateFormState = () => {
  if (!form || !formBtn) return;
  try {
    formBtn.disabled = !form.checkValidity();
  } catch (e) {
    // if checkValidity unavailable, do a basic check
    formBtn.disabled = ![...formInputs].every(i => i.value && i.value.trim());
  }
};

formInputs.forEach(i => i.addEventListener('input', updateFormState));
updateFormState();

if (form) {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    // demo — replace with server or forms provider integration
    alert('Thanks — message captured (demo).');
    form.reset();
    updateFormState();
  });
}

/* ========== accessibility: close open dropdowns when escape pressed ========== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // close select
    if (selectBtn && selectBtn.classList.contains('active')) {
      selectBtn.classList.remove('active');
      selectBtn.setAttribute('aria-expanded', 'false');
      if (selectList) selectList.style.display = 'none';
    }
    // close modal
    if (modalContainer && modalContainer.classList.contains('active')) toggleModal(false);
    // close sidebar (mobile)
    if (sidebar && sidebar.classList.contains('active') && sidebarBtn) {
      sidebar.classList.remove('active');
      sidebarBtn.setAttribute('aria-expanded', 'false');
      if (sidebarMore) sidebarMore.style.display = 'none';
    }
  }
});
