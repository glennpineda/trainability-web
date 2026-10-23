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

// Studio's embedded forms (personal training, reserve a studio) say how tall they
// are, so each frame fits with no second scrollbar
addEventListener('message', (e) => {
  if (e.origin !== 'https://trainabilitystudio.com' || e.data?.source !== 'trainability-form') return;
  const frame = document.querySelector(`iframe[data-form="${e.data.form}"]`);
  if (frame && e.data.type === 'height') frame.style.height = e.data.height + 'px';
});

// The team page's filter: everyone, or only those at one location. The choice
// is kept in the address (?location=mission) so it can be linked to.
const filter = document.querySelector('.team-filter');
if (filter) {
  const buttons = [...filter.querySelectorAll('button')];
  const sections = [...document.querySelectorAll('#trainers, #staff')];
  const empty = document.querySelector('.team-empty');
  const show = (place) => {
    if (!buttons.some((b) => b.dataset.filter === place)) place = 'all';
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === place)));
    let any = false;
    for (const section of sections) {
      let shown = 0;
      for (const card of section.querySelectorAll('.person')) {
        const here = place === 'all' || card.dataset.places.split(' ').includes(place);
        card.hidden = !here;
        if (here) shown++;
      }
      // The section the buttons are in stays, so they can't hide themselves
      section.hidden = shown === 0 && !section.contains(filter);
      document.querySelectorAll(`a[href="#${section.id}"]`).forEach((a) => { a.hidden = shown === 0; });
      any ||= shown > 0;
    }
    empty.hidden = any;
  };
  filter.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    show(b.dataset.filter);
    const url = new URL(location.href);
    if (b.dataset.filter === 'all') url.searchParams.delete('location'); else url.searchParams.set('location', b.dataset.filter);
    history.replaceState(null, '', url);
  });
  filter.hidden = false;
  show(new URL(location.href).searchParams.get('location') || 'all');
}

// "Free day pass" buttons open a dialog explaining it, instead of going to the
// membership page (where they still go when script is off)
const dayPass = document.querySelector('dialog.day-pass');
document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-day-pass]');
  if (!button || !dayPass?.showModal) return;
  e.preventDefault();
  dayPass.showModal();
});
// A click on the dimmed area around it closes it too
dayPass?.addEventListener('click', (e) => { if (e.target === dayPass) dayPass.close(); });

// "Member login" links open a dialog that asks for the email, then hands it
// to Studio's sign-in (where they still go straight when script is off). The
// sign-in has to finish on Studio's own site: that's where its session lives.
const login = document.querySelector('dialog.member-login');
if (login?.showModal) {
  const form = login.querySelector('form.member-login-form');
  const email = form.elements.email;
  const problem = login.querySelector('.member-login-problem');
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-member-login]');
    if (!link) return;
    e.preventDefault();
    dayPass?.close();
    login.showModal();
  });
  login.addEventListener('click', (e) => { if (e.target === login) login.close(); });
  // Its "try a free day pass" link swaps one dialog for the other
  login.querySelector('[data-day-pass]')?.addEventListener('click', () => login.close());
  email.addEventListener('input', () => { problem.hidden = true; email.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const address = email.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(address)) {
      problem.hidden = false;
      email.setAttribute('aria-invalid', 'true');
      email.focus();
      return;
    }
    // In the # so the address never reaches a server log
    const hand = new URLSearchParams({ email: address, send: e.submitter?.value === 'text' ? 'text' : 'email' });
    location.href = form.action + '#' + hand;
  });
}

/* Addresses open in the phone's own maps: Apple Maps on iPhone and iPad,
   Google Maps (which hands off to the app) everywhere else. */
if (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
  document.querySelectorAll('a[data-maps-link]').forEach((a) => {
    a.href = 'https://maps.apple.com/?q=' + encodeURIComponent(a.textContent.trim());
  });
}

/* Holiday hours, from Studio: the days coming up when a place is closed or
   keeps other hours (Studio's team list, `specialHours`, the next 60 days).
   Read here in the browser on every visit, not at build time, so they appear
   as soon as they're saved in Studio and go once the day is past. Within the
   next 14 days they show in a bar under the header, next to the opening hours
   ([data-special-for]) and, on the day, in the day pass dialog. When Studio
   can't be reached the page just keeps its usual hours. */
(async () => {
  let api = document.body.dataset.teamApi;
  if (!api) return;
  /* For trying it out locally: ?team-api=/a-file.json, only on this machine. */
  const test = new URL(location.href).searchParams.get('team-api');
  if (test?.startsWith('/') && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) api = test;
  let places;
  try {
    const r = await fetch(api, { credentials: 'omit' });
    if (!r.ok) return;
    places = (await r.json()).places;
  } catch { return; }
  if (!Array.isArray(places)) return;

  const AHEAD = 14;
  const zone = 'America/Los_Angeles';
  const ymd = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const today = ymd(new Date());
  const last = ymd(new Date(Date.now() + AHEAD * 864e5));
  const clock = (m) => {
    const h = Math.floor(m / 60) % 24, min = m % 60;
    return `${h % 12 || 12}${min ? `:${String(min).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
  };
  const dayName = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
  const hours = (d) => (d.open == null || d.close == null ? 'closed' : `${clock(d.open)} – ${clock(d.close)}`);
  const line = (d) => `${dayName(d.date)}${d.label ? ` (${d.label})` : ''} ${hours(d)}`;

  const soon = places
    .map((p) => ({ name: p.name, days: (Array.isArray(p.specialHours) ? p.specialHours : [])
      .filter((d) => typeof d?.date === 'string' && d.date >= today && d.date <= last)
      .sort((a, b) => a.date.localeCompare(b.date)) }))
    .filter((p) => p.days.length);
  if (!soon.length) return;

  // The bar under the header
  const bar = document.createElement('div');
  bar.className = 'holiday-bar';
  bar.setAttribute('role', 'status');
  const inner = document.createElement('div');
  inner.className = 'container';
  soon.forEach((p) => {
    const row = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `Holiday hours${places.length > 1 ? ` at ${p.name}` : ''}: `;
    row.append(strong, p.days.map(line).join(' · '));
    inner.append(row);
  });
  bar.append(inner);
  document.querySelector('.site-header')?.after(bar);

  // Next to the opening hours
  document.querySelectorAll('[data-special-for]').forEach((el) => {
    const p = soon.find((s) => s.name === el.dataset.specialFor);
    if (!p) return;
    el.textContent = `Holiday hours: ${p.days.map(line).join(' · ')}`;
    el.hidden = false;
  });

  // On the day itself, in the day pass dialog
  document.querySelectorAll('[data-special-today]').forEach((el) => {
    const d = soon.find((s) => s.name === el.dataset.specialToday)?.days.find((x) => x.date === today);
    if (!d) return;
    const what = d.label ? ` for ${d.label}` : '';
    el.textContent = d.open == null || d.close == null
      ? `Today we're closed${what}. Come in another day and your first day is still free.`
      : `Today we're open ${hours(d)}${what}.`;
    el.hidden = false;
  });
})();
