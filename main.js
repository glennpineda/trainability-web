// Mobile navigation toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

// Locations and Services menus: open on click (and on hover, in the CSS)
const groups = [...document.querySelectorAll('.nav-group')];
for (const group of groups) {
  const button = group.querySelector('.nav-group-toggle');
  button.addEventListener('click', () => {
    const open = !group.classList.contains('open');
    groups.forEach((g) => { g.classList.remove('open'); g.querySelector('.nav-group-toggle').setAttribute('aria-expanded', 'false'); });
    group.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
  });
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-group')) groups.forEach((g) => { g.classList.remove('open'); g.querySelector('.nav-group-toggle').setAttribute('aria-expanded', 'false'); });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') groups.forEach((g) => g.classList.remove('open'));
});

// Close the mobile menu after choosing a link
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  }
});

// Mark the current page in the menu
const page = document.body.dataset.page;
document.querySelectorAll(`[data-nav="${page}"]`).forEach((a) => a.setAttribute('aria-current', 'page'));

document.getElementById('year').textContent = new Date().getFullYear();

// Studio's embedded forms say how tall they are, so the frame fits with no second scrollbar
addEventListener('message', (e) => {
  if (e.origin !== 'https://trainabilitystudio.com' || e.data?.source !== 'trainability-form') return;
  const frame = document.getElementById('pt-form');
  if (frame && e.data.type === 'height') frame.style.height = e.data.height + 'px';
});
