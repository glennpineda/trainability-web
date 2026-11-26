// Mobile navigation toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

// Locations, Services and Apps menus. Hovering opens one, and it stays open
// for a moment after the pointer leaves, so it can travel down to the items.
// A click pins it open until another click, a click elsewhere or Esc. On
// phones (the ☰ menu) they're always open, so none of this applies.
const groups = [...document.querySelectorAll('.nav-group')];
const wide = window.matchMedia('(min-width: 768px)');
const setOpen = (group, open) => {
  group.classList.toggle('open', open);
  group.querySelector('.nav-group-toggle').setAttribute('aria-expanded', String(open));
  if (!open) delete group.dataset.pinned;
};
const closeAll = (except) => groups.forEach((g) => { if (g !== except) setOpen(g, false); });
for (const group of groups) {
  const button = group.querySelector('.nav-group-toggle');
  let timer;
  group.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse' || !wide.matches) return;
    clearTimeout(timer);
    closeAll(group);
    setOpen(group, true);
  });
  group.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse' || group.dataset.pinned) return;
    timer = setTimeout(() => setOpen(group, false), 300);
  });
  button.addEventListener('click', () => {
    clearTimeout(timer);
    if (group.dataset.pinned) { setOpen(group, false); return; }
    closeAll(group);
    setOpen(group, true);
    group.dataset.pinned = 'yes';
  });
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-group')) closeAll();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = groups.find((g) => g.classList.contains('open'));
  closeAll();
  open?.querySelector('.nav-group-toggle').focus();
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

// This year, wherever a page shows it (the footer, Our story's "Beyond 2026"),
// so it rolls over on 1 January without a new build
document.getElementById('year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

// Analytics (Umami, cookie-free): the clicks that matter, by name. Nothing
// happens where its script isn't loaded (no website ID yet, the preview, an
// ad blocker). Never anything a person typed.
const track = (name, data) => window.umami?.track(name, data);
const clicks = [
  ['[data-day-pass]', 'Free day pass'],
  ['[data-member-login]', 'Member login'],
  ['[data-cancel-membership]', 'Cancel membership opened'],
  ['[data-book-stretch]', 'Book stretching opened'],
  ['a[href^="tel:"]', 'Call'],
  ['a[href*="maps.google."], a[href*="maps.apple."]', 'Directions'],
  ['a[href^="https://trainabilitystudio.com/forms/join"]', 'Buy online'],
  ['a[href^="https://trainabilitystudio.com/forms/giftcard"]', 'Buy a gift card'],
  ['a[href^="https://trainabilitystudio.com/install"]', 'Install Studio on your phone'],
  ['a[href*="team/?location="]', 'Meet the team here'],
];
document.addEventListener('click', (e) => {
  for (const [selector, name] of clicks) {
    const el = e.target.closest(selector);
    if (el) return track(name, { page: document.body.dataset.page });
  }
  // Any other link off the site: which site it goes to
  const out = e.target.closest('a[href^="http"]');
  if (out && out.host !== location.host) track('Outbound', { to: out.host });
});
// Read to the end: the visitor got near the bottom of the page, once
addEventListener('scroll', function end() {
  if (scrollY + innerHeight < document.documentElement.scrollHeight * 0.9) return;
  removeEventListener('scroll', end);
  track('Read to the end', { page: document.body.dataset.page });
}, { passive: true });
if (document.body.dataset.page === '404') track('Not found', { path: location.pathname });
// Video played: once per video per page view
document.querySelectorAll('video[data-video]').forEach(v => v.addEventListener('play', () => track('Video played', { video: v.dataset.video }), { once: true }));

// Billy's tip (contact page, dialog.billy-tip): the first time Studio's cancel
// or pause page shows, in the contact form's frame or the Cancel membership
// dialog, Billy pops up in the middle to say the easy way is the member
// portal, and how it goes. Once per topic per visit; "Do it here instead"
// or × goes back to the form.
const tipped = new Set();
function billyTip(topic) {
  const tip = document.querySelector('dialog.billy-tip');
  if (!tip?.showModal || tipped.has(topic) || tip.open) return;
  tipped.add(topic);
  tip.querySelectorAll('[data-tip]').forEach((el) => { el.hidden = el.dataset.tip !== topic; });
  tip.showModal();
  track('Billy tip shown', { topic });
}
// Member login from the tip closes it (and the cancel dialog) before the login opens
document.querySelector('dialog.billy-tip [data-member-login]')?.addEventListener('click', () => {
  document.querySelectorAll('dialog.billy-tip, dialog.membership-form').forEach((d) => d.open && d.close());
}, true);
document.querySelector('dialog.billy-tip')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

// Studio's embedded forms (personal training, reserve a studio, contact) say how tall they
// are, so each frame fits with no second scrollbar, and say when one is sent
addEventListener('message', (e) => {
  if (e.origin !== 'https://trainabilitystudio.com' || e.data?.source !== 'trainability-form') return;
  /* The frame the message came from: Contact's frame can move on to another
     form (cancel, pause) that names itself, not "contact". */
  const frame = [...document.querySelectorAll('iframe[data-form]')].find((f) => f.contentWindow === e.source)
    || document.querySelector(`iframe[data-form="${e.data.form}"]`);
  /* Contact's Membership (cancel) and (pause) open Studio's cancel or pause
     page in the contact form's own frame. Instead: the contact form comes
     back, and the page opens in its own pop-up, as the Canceling card's. */
  const topic = e.data.form === 'cancel' || e.data.form === 'pause' ? e.data.form : null;
  if (frame?.dataset.form === 'contact' && topic && openMembershipForm(topic)) {
    frame.src = frame.dataset.home || frame.src;
    formAway(frame, topic);
    return;
  }
  if (frame && e.data.type === 'height') frame.style.height = e.data.height + 'px';
  if (frame && topic) billyTip(topic);
  if (e.data.type === 'sent') track('Form sent', { form: String(e.data.form), ...(e.data.topic ? { topic: String(e.data.topic) } : {}) });
});
// When a form moves on to a page of its own inside the frame (Contact's
// "Membership (cancel)" opens Studio's cancel page), bring the frame's top
// back into view if the visitor had scrolled down past it, so the new page's
// title shows. The frame's first load doesn't count.
document.querySelectorAll('iframe[data-form]').forEach((frame) => {
  let loads = 0;
  frame.addEventListener('load', () => {
    if (frame.src === 'about:blank' || !frame.src || frame.hidden) return;
    if (loads++ === 0) return;
    const top = frame.getBoundingClientRect().top;
    if (top < 72) frame.scrollIntoView({ block: 'start' });
  });
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
    track('Team filter', { location: b.dataset.filter });
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
    track('Member login code', { by: hand.get('send') });
    location.href = form.action + '#' + hand;
  });
}

// Contact page: a link with ?topic=pause (or any topic) and ?place= starts
// Studio's form on it, and #cancel opens Cancel membership straight away
// (both from the membership page's pause and cancel links).
const contactFrame = document.querySelector('iframe[data-form="contact"]');
if (contactFrame) {
  const asked = new URLSearchParams(location.search);
  const [base, query] = contactFrame.src.split('?');
  const pass = new URLSearchParams(query);   // keeps the frame's own, such as theme=dark
  let more = false;
  for (const key of ['topic', 'place']) if (asked.get(key)) { pass.set(key, asked.get(key)); more = true; }
  if (more) contactFrame.src = base + '?' + pass;
}

// Cloudflare Turnstile ("Verify you are human"), loaded only when a form that
// has the box is opened, with the site key Studio gives in the form's
// description (turnstileSiteKey; none while Studio's check is off). If it
// can't load, the form is sent without it and Studio decides.
let turnstileLoad;
const loadTurnstile = () => turnstileLoad ||= new Promise((resolve) => {
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  s.async = true;
  s.onload = () => resolve(window.turnstile);
  s.onerror = () => resolve(null);
  document.head.append(s);
});

// Request dialogs: a button opens a short form that's sent to Studio's contact
// form, where the front desk answers it in Concierge › Messages. Each says
// which buttons open it, what to check and what to send; the rest (Studio's
// spam checks, its errors beside the right field, the thank-you) is shared.
const studioRequest = (dialog, { opener, check, body }) => {
  if (!dialog?.showModal) return;
  const form = dialog.querySelector('form.panel-form');
  const problem = dialog.querySelector('.panel-problem');
  const send = form.querySelector('button[type="submit"]');
  let openedAt = 0;
  // The human check: its widget once drawn, and whether it could be
  const human = dialog.querySelector('[data-turnstile]');
  let humanId = null;
  let humanReady = false;
  const drawHuman = () => {
    if (!human || humanId !== null) return;
    humanId = false;
    fetch(dialog.dataset.api, { credentials: 'omit' }).then((r) => r.json()).then(async ({ turnstileSiteKey: sitekey }) => {
      const t = sitekey && await loadTurnstile();
      if (!t) return;
      humanId = t.render(human, { sitekey, theme: 'dark', size: 'flexible', action: 'website-request' });
      humanReady = true;
    }).catch(() => { humanId = null; });
  };
  const humanToken = () => (humanReady ? window.turnstile.getResponse(humanId) || '' : '');
  const resetHuman = () => { if (humanReady) window.turnstile.reset(humanId); };
  const say = (text, field) => {
    // a group of choices comes as a list: point at its first one
    const el = field && (field.setAttribute ? field : field[0]);
    const own = el?.name && dialog.querySelector(`[data-problem-for~="${el.name}"]`);
    const where = own || problem;
    where.textContent = text;
    where.hidden = false;
    if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
  };
  // "N / 500" under a text box with a limit
  dialog.querySelectorAll('[data-count]').forEach((box) => {
    const shown = box.nextElementSibling?.querySelector('span');
    box.addEventListener('input', () => { if (shown) shown.textContent = box.value.length; });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest(opener)) return;
    e.preventDefault();
    dayPass?.close();
    openedAt = Date.now();
    dialog.showModal();
    drawHuman();
    dialog.dispatchEvent(new Event('studio-request-open'));
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
    // A link to somewhere on this same page (the contact form) closes the dialog first
    if (e.target.closest('[data-close-dialog]')) dialog.close();
  });
  form.addEventListener('input', (e) => {
    problem.hidden = true;
    dialog.querySelectorAll('[data-problem-for]').forEach((p) => { p.hidden = true; });
    e.target.removeAttribute('aria-invalid');
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements;
    const value = (name) => f[name].value.trim();
    if (!value('firstName')) return say('Enter your first name.', f.firstName);
    if (!value('lastName')) return say('Enter your last name.', f.lastName);
    const wrong = check(f, value);
    if (wrong) return say(...wrong);
    const turnstileToken = humanToken();
    if (humanReady && !turnstileToken) return say('Please tick “Verify you are human” and send it again.');
    send.disabled = true;
    try {
      const res = await fetch(dialog.dataset.api, {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: value('firstName'), lastName: value('lastName'),
          ...body(f, value), openedAt, website: f.website.value,
          ...(turnstileToken && { turnstileToken }),
        }),
      });
      const answer = await res.json().catch(() => ({}));
      if (res.ok) {
        dialog.querySelector('[data-ask]').hidden = true;
        dialog.querySelector('[data-done]').hidden = false;
        track('Request sent', { topic: body(f, value).topic });
        return;
      }
      // A check is used once: a new one for the next try
      resetHuman();
      if (res.status === 400 && answer.error) return say(answer.error, f[answer.field]);
      if (res.status === 429) return say('Too many requests from here just now. Please try again in a few minutes, or call us.');
      say('We couldn\'t send your request. Please try again, or call us at the front desk.');
    } catch {
      resetHuman();
      say('We couldn\'t send your request. Please check your connection and try again, or call us.');
    } finally {
      send.disabled = false;
    }
  });
  return { opened: (fn) => dialog.addEventListener('studio-request-open', fn, { once: true }) };
};

// Contact page: "Cancel membership" (and the contact form's Membership
// (cancel) and (pause), above) open Studio's own cancel or pause page in a
// dialog. Each frame loads only when it's first opened; its height and its
// "sent" come through the embedded forms' messages above.
function openMembershipForm(topic) {
  const dialog = document.querySelector(`dialog.membership-form[data-topic="${topic}"]`);
  if (!dialog?.showModal) return false;
  const frame = dialog.querySelector('iframe[data-src]');
  dayPass?.close();
  document.querySelectorAll('dialog.membership-form').forEach((d) => d !== dialog && d.open && d.close());
  if (!frame.src) frame.src = frame.dataset.src;
  if (!dialog.open) dialog.showModal();
  return true;
}
document.querySelectorAll('dialog.membership-form').forEach((dialog) => {
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-cancel-membership]')) return;
  if (openMembershipForm('cancel')) e.preventDefault();
});
// While it's open in the pop-up, the contact form's frame makes way for a
// note: Open it again, or Back to the contact form (put back already, behind).
function formAway(frame, topic) {
  const away = frame.parentElement.querySelector('.form-away');
  if (!away) return;
  const verb = topic === 'pause' ? 'Pausing' : 'Canceling';
  away.querySelector('.form-away-title').textContent = `${verb} your membership`;
  away.querySelector('.form-away-text').textContent = `It’s open in its own window. Closed it by mistake? Open it again. Need something else? Go back to the contact form.`;
  away.dataset.topic = topic;
  frame.hidden = true;
  away.hidden = false;
}
document.querySelectorAll('.form-away').forEach((away) => away.addEventListener('click', (e) => {
  const button = e.target.closest('[data-away]');
  if (!button) return;
  if (button.dataset.away === 'again') { openMembershipForm(away.dataset.topic); return; }
  away.hidden = true;
  const frame = away.parentElement.querySelector('iframe[data-form="contact"]');
  frame.hidden = false;
  frame.scrollIntoView({ block: 'start' });
}));
// The contact form's own address, to put it back after it opens cancel or pause
document.querySelectorAll('iframe[data-form="contact"]').forEach((f) => { f.dataset.home = f.getAttribute('src'); });

if (location.hash === '#cancel') openMembershipForm('cancel');
if (location.hash === '#pause') openMembershipForm('pause');

// Assisted stretching: "Book a session" (topic "stretch": Messages lists it
// under Stretching, where the front desk assigns it to a specialist)
studioRequest(document.querySelector('dialog.book-stretch'), {
  opener: '[data-book-stretch]',
  check: (f, value) => {
    if (!/^\S+@\S+\.\S+$/.test(value('email'))) return ['Enter your email address.', f.email];
    if (value('phone').replace(/\D/g, '').length < 10) return ['Enter your phone number.', f.phone];
    if (![...f.times].some((t) => t.checked)) return ['Tick at least one time of day that works for you.', f.times[0]];
  },
  body: (f, value) => ({
    email: value('email'), phone: value('phone'), topic: 'stretch',
    times: [...f.times].filter((t) => t.checked).map((t) => t.value), message: value('message'),
  }),
});

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
/* Studio's public JSON, read once per page: the team list here, and How busy
   below. ?team-api=/a-file.json or ?busy-api=… swap in a local file for
   trying it out, only on this machine. */
const studioPlaces = (name) => {
  let api = document.body.dataset[`${name}Api`];
  const test = new URL(location.href).searchParams.get(`${name}-api`);
  if (test?.startsWith('/') && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) api = test;
  if (!api) return Promise.resolve(null);
  return fetch(api, { credentials: 'omit' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (Array.isArray(d?.places) ? d.places : null))
    .catch(() => null);
};
const teamPlaces = studioPlaces('team');

(async () => {
  const places = await teamPlaces;
  if (!places) return;

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

  // The full list on a location page: every special day Studio has coming up
  document.querySelectorAll('[data-holiday-list]').forEach((el) => {
    const p = places.find((x) => x?.name === el.dataset.holidayList);
    const days = (Array.isArray(p?.specialHours) ? p.specialHours : [])
      .filter((d) => typeof d?.date === 'string' && d.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!days.length) return;
    const list = el.querySelector('dl');
    days.forEach((d) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = `${dayName(d.date)}${d.label ? ` · ${d.label}` : ''}`;
      dd.textContent = hours(d) === 'closed' ? 'Closed' : hours(d);
      if (hours(d) === 'closed') dd.className = 'is-closed';
      row.append(dt, dd);
      list.append(row);
    });
    el.hidden = false;
  });

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

/* How busy is it?, on the location pages (section[data-busy-for]), from
   Studio's /api/forms/busy: a level for each hour (quiet, steady, busy),
   never a head count. Today and the six days after it, as a forecast from
   past visits and what's booked; "right now" is the real count's level.
   Only the hours the place is open show, from the team list (holiday hours
   included). A place Studio has no levels for keeps the section hidden, as
   does Studio not answering. */
(async () => {
  const section = document.querySelector('section[data-busy-for]');
  if (!section) return;
  const [busy, team] = await Promise.all([studioPlaces('busy'), teamPlaces]);
  const name = section.dataset.busyFor;
  const place = busy?.find((p) => p?.name === name);
  const days = (Array.isArray(place?.days) ? place.days : [])
    .filter((d) => typeof d?.date === 'string')
    .map((d) => ({ date: d.date, levels: Array.isArray(d.levels) && d.levels.length === 24 ? d.levels : null }))
    .slice(0, 7);
  if (!days.some((d) => d.levels)) return;

  const LEVELS = { quiet: 1, steady: 2, busy: 3 };
  const WORD = { quiet: 'Quiet', steady: 'Steady', busy: 'Busy' };
  const info = team?.find((p) => p?.name === name);
  const openOn = (date) => {
    const special = (info?.specialHours || []).find((d) => d?.date === date);
    if (special) return special.open == null || special.close == null ? null : special;
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    return (info?.hours || []).find((h) => h?.weekday === weekday) || { open: 360, close: 1320 };
  };
  const hourLabel = (h) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
  const short = (h) => `${h % 12 || 12}${h < 12 ? 'a' : 'p'}`;
  const dayTab = (d, i) => (i === 0 ? 'Today' : i === 1 ? 'Tomorrow'
    : new Date(`${d.date}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' }));
  const dayLong = (d, i) => (i === 0 ? 'today' : i === 1 ? 'tomorrow'
    : new Date(`${d.date}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long' }));
  const isToday = (d) => d.date === place.today;
  const hourNow = Number.isInteger(place.hourNow) ? place.hourNow : -1;

  const now = section.querySelector('.busy-now');
  const todayHours = openOn(days[0].date);
  const openNow = isToday(days[0]) && todayHours && hourNow * 60 >= todayHours.open && hourNow * 60 < todayHours.close;
  if (openNow && LEVELS[place.now]) {
    now.innerHTML = '';
    const tag = document.createElement('span');
    tag.className = 'busy-tag';
    tag.dataset.level = place.now;
    tag.textContent = WORD[place.now];
    now.append('Right now: ', tag);
  } else if (isToday(days[0]) && !openNow) {
    now.textContent = 'Closed right now.';
  } else now.remove();

  const tabs = section.querySelector('.busy-days');
  const chart = section.querySelector('.busy-chart');
  const show = (i) => {
    const d = days[i];
    tabs.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
    chart.innerHTML = '';
    const hours = openOn(d.date);
    if (hours && !d.levels) {
      chart.innerHTML = '<p class="busy-closed">No estimate for that day yet.</p>';
      chart.setAttribute('aria-label', `No estimate ${dayLong(d, i)}`);
      return;
    }
    if (!hours) {
      chart.innerHTML = '<p class="busy-closed">Closed that day.</p>';
      chart.setAttribute('aria-label', `Closed ${dayLong(d, i)}`);
      return;
    }
    const first = Math.floor(hours.open / 60), last = Math.ceil(hours.close / 60) - 1;
    const said = [];
    for (let h = first; h <= last; h++) {
      const level = LEVELS[d.levels[h]] ? d.levels[h] : null;
      const bar = document.createElement('div');
      bar.className = 'busy-bar';
      if (level) { bar.dataset.level = level; said.push(`${hourLabel(h)} ${WORD[level].toLowerCase()}`); }
      if (isToday(d) && h === hourNow) bar.classList.add('is-now');
      if (isToday(d) && h < hourNow) bar.classList.add('is-past');
      bar.style.setProperty('--h', String(LEVELS[level] || 0));
      bar.title = `${hourLabel(h)}: ${level ? WORD[level] : 'no estimate'}`;
      const label = document.createElement('span');
      label.textContent = (h - first) % 3 === 0 ? short(h) : '';
      bar.append(document.createElement('i'), label);
      chart.append(bar);
    }
    chart.setAttribute('aria-label', `How busy it usually is ${dayLong(d, i)}: ${said.join(', ')}`);
  };
  days.forEach((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.textContent = dayTab(d, i);
    b.addEventListener('click', () => show(i));
    tabs.append(b);
  });
  show(0);
  section.hidden = false;
})();

/* Google reviews on the location pages (section.reviews, built when site.json
   has the key and the place's Google id): the rating, how many reviews, and
   Google's own pick of up to five, loaded from Google's Places API on each
   visit, as its terms ask (no copies kept here). The key only works from the
   website's own addresses. Nothing shows if Google can't be reached. */
(async () => {
  const section = document.querySelector('section.reviews[data-google-place]');
  const key = document.body.dataset.googleKey;
  if (!section || !key) return;
  let place;
  /* For trying it out locally: ?reviews-api=/a-file.json, only on this machine. */
  const test = new URL(location.href).searchParams.get('reviews-api');
  const local = test?.startsWith('/') && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  try {
    const r = await fetch(local ? test : `https://places.googleapis.com/v1/places/${encodeURIComponent(section.dataset.googlePlace)}?languageCode=en&key=${encodeURIComponent(key)}`, {
      headers: { 'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsLinks' },
    });
    if (!r.ok) return;
    place = await r.json();
  } catch { return; }
  const reviews = (place.reviews || []).filter((v) => v.text?.text || v.originalText?.text);
  if (!place.rating || !reviews.length) return;

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const stars = (n) => {
    const s = el('span', 'stars');
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', `${n} out of 5 stars`);
    s.style.setProperty('--rating', String(n));
    s.textContent = '★★★★★';
    return s;
  };

  const summary = section.querySelector('.reviews-summary');
  summary.append(stars(place.rating), el('strong', null, place.rating.toFixed(1)),
    ` · ${place.userRatingCount?.toLocaleString('en-US') || ''} Google reviews`);

  const list = section.querySelector('.reviews-list');
  reviews.slice(0, 5).forEach((v) => {
    const card = el('figure', 'review');
    const quote = el('blockquote', null, (v.text?.text || v.originalText.text).trim());
    const by = el('figcaption');
    const a = v.authorAttribution || {};
    if (a.photoUri) {
      const img = el('img');
      img.src = a.photoUri; img.alt = ''; img.width = 40; img.height = 40; img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      by.append(img);
    }
    const who = el('span', 'review-who');
    const name = a.uri ? el('a', null, a.displayName || 'A Google user') : el('span', null, a.displayName || 'A Google user');
    if (a.uri) { name.href = a.uri; name.rel = 'noopener'; name.target = '_blank'; }
    who.append(name, el('span', 'review-when', v.relativePublishTimeDescription || ''));
    by.append(who);
    card.append(stars(v.rating || 5), quote, by);
    list.append(card);
  });

  // Google's own links, where it gives them
  const links = place.googleMapsLinks || {};
  if (links.reviewsUri) section.querySelector('.reviews-all').href = links.reviewsUri;
  if (links.writeAReviewUri) section.querySelector('.reviews-write').href = links.writeAReviewUri;
  section.hidden = false;
  // Arrived from the home page's "Read … reviews": they're here now
  if (location.hash === '#reviews') section.scrollIntoView();
})();

/* Home: each location's Google rating and how many reviews, live from Google
   (the same request as the location pages, rating and count only), into the
   chips under "What people say". The chips keep their "Reviews on Google"
   wording, and their link, if Google can't be reached. */
document.querySelectorAll('.rating-chip[data-rating-place]').forEach(async (chip) => {
  const key = document.body.dataset.googleKey;
  if (!key) return;
  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(chip.dataset.ratingPlace)}?languageCode=en&key=${encodeURIComponent(key)}`, {
      headers: { 'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsLinks' },
    });
    if (!r.ok) return;
    const place = await r.json();
    if (!place.rating) return;
    const stars = chip.querySelector('.stars');
    stars.style.setProperty('--rating', String(place.rating));
    stars.setAttribute('aria-label', `${place.rating.toFixed(1)} out of 5 stars`);
    stars.hidden = false;
    const figures = chip.querySelector('.rating-chip-figures');
    const count = place.userRatingCount || 0;
    figures.textContent = '';
    figures.append(Object.assign(document.createElement('strong'), { textContent: place.rating.toFixed(1) }),
      ` · ${count.toLocaleString('en-US')} review${count === 1 ? '' : 's'}`);
    if (place.googleMapsLinks?.reviewsUri) chip.href = place.googleMapsLinks.reviewsUri;
  } catch { /* stays "Reviews on Google" */ }
});

// Home: hide the "more below" chevron once the visitor starts scrolling.
(() => {
  const cue = document.querySelector('.scroll-cue');
  if (!cue) return;
  const check = () => {
    if (window.scrollY > 40) { cue.classList.add('gone'); window.removeEventListener('scroll', check); }
  };
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

// Our story: each chapter of the timeline rises in as it comes into view
(() => {
  const line = document.querySelector('.timeline');
  if (!line || !('IntersectionObserver' in window)) return;
  const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('tl-in'); seen.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  line.classList.add('tl-ready');
  line.querySelectorAll('.tl-item').forEach((item) => seen.observe(item));
})();

// Pick your gym: each card's photos take turns, a few seconds each. The cards
// change at different moments, and only while they're on screen.
(() => {
  const shows = [...document.querySelectorAll('[data-slideshow]')];
  if (!shows.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const every = 5000;
  shows.forEach((show, n) => {
    const shots = [...show.querySelectorAll('img')];
    if (shots.length < 2) return;
    let at = 0, timer = null;
    const next = () => {
      shots[at].classList.remove('on');
      at = (at + 1) % shots.length;
      const img = shots[at];
      img.loading = 'eager';
      shots[(at + 1) % shots.length].loading = 'eager'; // the one after, ready in time
      img.classList.add('on');
    };
    const start = () => {
      if (timer) return;
      timer = setTimeout(function tick() { next(); timer = setTimeout(tick, every); }, every / 2 + n * (every / 2));
    };
    const stop = () => { clearTimeout(timer); timer = null; };
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(show);
  });
})();

/* Ask Billy: a chat with the app's assistant, through Studio's
   /api/forms/billy (it answers from what the app knows, never by reading
   this site). The conversation lives in sessionStorage, so it follows the
   visitor from page to page until the tab closes or they start over. */
const billy = document.querySelector('.billy');
if (billy) {
  const api = billy.dataset.billyApi;
  const button = billy.querySelector('.billy-button');
  const panel = billy.querySelector('.billy-panel');
  const list = panel.querySelector('.billy-messages');
  const typing = panel.querySelector('.billy-typing');
  const form = panel.querySelector('.billy-form');
  const box = form.querySelector('textarea');
  const send = form.querySelector('button[type="submit"]');
  // His face in the panel's corner, in the mood of the moment: waving hello,
  // listening while they type, thinking while he waits, talking as an answer
  // arrives, sad when something went wrong (the drawings are Studio's)
  const face = panel.querySelector('.billy-face');
  const faces = face.src.replace(/[^/]+$/, '');
  const MOODS = ['normal', 'waving', 'listening', 'thinking', 'talking', 'happy', 'sad'];
  let moodTimer;
  const mood = (name, ms) => {
    clearTimeout(moodTimer);
    if (face.dataset.mood !== name) { face.src = `${faces}${name}.svg`; face.dataset.mood = name; }
    if (ms) moodTimer = setTimeout(() => mood(box.value.trim() && document.activeElement === box ? 'listening' : 'normal'), ms);
  };
  let preloaded = false;
  const GREETING = "Hi, I'm Billy. Ask me about memberships, day passes, hours, our services or how things work.";
  const HUMAN = 'Please tick “Verify you are human” below, then send your question again.';
  const UNREACHABLE = "Billy can't be reached just now. Please use our contact page or call the front desk.";
  const stored = (key) => { try { return sessionStorage.getItem(key); } catch { return null; } };
  const store = (key, value) => { try { value == null ? sessionStorage.removeItem(key) : sessionStorage.setItem(key, value); } catch { /* private mode */ } };
  // [{ role: "user" | "assistant", text }], plus { role: "notice" } for his
  // error messages, which show as his but are never sent back as history
  let chat = [];
  try { chat = JSON.parse(stored('billy-chat') || '[]'); } catch { chat = []; }
  const save = () => store('billy-chat', chat.length ? JSON.stringify(chat) : null);
  let busy = false;
  let waitUntil = 0;

  // The human check, once per conversation: Studio's pass after the first
  // answer (humanPass, kept for the tab), or until then a Turnstile token.
  // The box is drawn when the chat opens, in Cloudflare's "only when needed"
  // mode, with the forms' site key; none while Studio's check is off.
  const human = panel.querySelector('.billy-human');
  let humanId = null;
  let humanReady = false;
  const drawHuman = () => {
    if (humanId !== null || stored('billy-pass')) return;
    humanId = false;
    fetch(api.replace(/billy$/, 'contact'), { credentials: 'omit' }).then((r) => r.json()).then(async ({ turnstileSiteKey: sitekey }) => {
      const t = sitekey && await loadTurnstile();
      if (!t) return;
      humanId = t.render(human, { sitekey, theme: 'dark', size: 'flexible', appearance: 'interaction-only', action: 'billy' });
      humanReady = true;
    }).catch(() => { humanId = null; });
  };

  // His answers are plain text: web addresses become links, the rest stays text
  const ADDRESS = /\b(?:https?:\/\/|www\.)[^\s<>"]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|io|app)(?:\/[^\s<>"]*)?/gi;
  const linked = (text) => {
    const out = document.createDocumentFragment();
    let at = 0;
    for (const m of text.matchAll(ADDRESS)) {
      let address = m[0].replace(/[.,;:!?)\]'"]+$/, '');
      if (text[m.index - 1] === '@') continue;   // part of an email address
      out.append(text.slice(at, m.index));
      const a = document.createElement('a');
      a.href = /^https?:/i.test(address) ? address : 'https://' + address;
      a.target = '_blank'; a.rel = 'noopener';
      a.textContent = address;
      out.append(a);
      at = m.index + address.length;
    }
    out.append(text.slice(at));
    return out;
  };
  const show = (role, text) => {
    const li = document.createElement('li');
    li.className = `billy-msg billy-msg-${role === 'user' ? 'user' : 'assistant'}`;
    const who = document.createElement('span');
    who.className = 'sr-only';
    who.textContent = role === 'user' ? 'You: ' : 'Billy: ';
    li.append(who, role === 'user' ? text : linked(text));
    list.append(li);
    list.scrollTop = list.scrollHeight;
  };
  const render = () => {
    list.textContent = '';
    show('assistant', GREETING);
    chat.forEach((m) => show(m.role, m.text));
  };
  const ready = () => { send.disabled = busy || Date.now() < waitUntil; };
  const gone = () => { button.hidden = true; store('billy-gone', '1'); };

  const open = () => {
    if (!preloaded) { MOODS.forEach((m) => { new Image().src = `${faces}${m}.svg`; }); preloaded = true; }
    if (!list.children.length) { render(); mood('waving', 2500); }
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    list.scrollTop = list.scrollHeight;
    box.focus();
    track('Ask Billy opened', { page: document.body.dataset.page });
    drawHuman();
  };
  const close = () => {
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (!button.hidden) button.focus();
  };
  button.addEventListener('click', () => (panel.hidden ? open() : close()));
  billy.querySelector('.billy-hint')?.addEventListener('click', () => button.click());
  // "Ask Billy now" links open the chat (or go to the contact page without it)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-ask-billy]');
    if (!link || button.hidden) return;
    e.preventDefault();
    if (panel.hidden) open(); else box.focus();
  });
  panel.querySelector('.billy-close').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  panel.querySelector('.billy-reset').addEventListener('click', () => {
    chat = []; save(); render(); mood('waving', 2500); box.focus();
  });
  // He listens while they type, and stops when they stop
  box.addEventListener('input', () => { if (!busy) mood(box.value.trim() ? 'listening' : 'normal'); });
  box.addEventListener('blur', () => { if (!busy && face.dataset.mood === 'listening') mood('normal'); });
  // Enter sends; Shift+Enter is a new line
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = box.value.trim().slice(0, 500);
    if (!question || send.disabled) return;
    const pass = stored('billy-pass');
    // Without a pass, the box's token: Cloudflare may still be working on it,
    // so wait a few seconds; past that, it needs the visitor's tick
    let turnstileToken = '';
    if (!pass && humanReady) {
      send.disabled = true;
      for (let i = 0; i < 20 && !(turnstileToken = window.turnstile.getResponse(humanId) || ''); i++) await new Promise((r) => setTimeout(r, 250));
      ready();
      if (!turnstileToken) {
        // said once, not again for each try
        if (chat.at(-1)?.text !== HUMAN) { chat.push({ role: 'notice', text: HUMAN }); save(); show('notice', HUMAN); }
        mood('sad', 4000);
        return;
      }
    }
    // The conversation so far, before this question: the last 8, his answers as they came
    const history = chat.filter((m) => m.role !== 'notice').slice(-8).map(({ role, text }) => ({ role, text }));
    chat.push({ role: 'user', text: question }); save();
    show('user', question);
    box.value = '';
    busy = true; ready(); typing.hidden = false; mood('thinking');
    track('Billy question', { page: document.body.dataset.page });
    const say = (text, role = 'assistant') => {
      chat.push({ role, text }); save(); show(role, text);
      // Talking for about as long as it takes to read, or sad for an error
      if (role === 'notice') mood('sad', 4000);
      else mood('talking', Math.min(7000, Math.max(1500, text.split(/\s+/).length * 250)));
    };
    try {
      const res = await fetch(api, {
        method: 'POST', credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history, ...(pass ? { humanPass: pass } : turnstileToken ? { turnstileToken } : {}) }),
      });
      const answer = await res.json().catch(() => ({}));
      // A token is good once; a pass from Studio stands in for it from now on
      if (turnstileToken) window.turnstile.reset(humanId);
      // Verified: the box goes, to give the chat its room back
      if (typeof answer.humanPass === 'string') {
        store('billy-pass', answer.humanPass);
        if (humanReady) { window.turnstile.remove(humanId); humanId = null; humanReady = false; }
      }
      if (res.status === 400 && answer.field === 'turnstile') {
        store('billy-pass', null);
        drawHuman();
      }
      if (res.ok && typeof answer.answer === 'string') say(answer.answer);
      else if ([400, 429, 503].includes(res.status) && answer.error) {
        say(String(answer.error), 'notice');
        if (res.status === 429) {
          // Retry-After, where Studio lets the page read it; else a minute
          const seconds = Number(res.headers.get('Retry-After')) || 60;
          waitUntil = Date.now() + seconds * 1000;
          setTimeout(ready, seconds * 1000 + 50);
        }
        if (res.status === 503) gone();
      } else {
        say(UNREACHABLE, 'notice');
        if (res.status === 404) gone();   // a Studio without Billy's address
      }
    } catch {
      say(UNREACHABLE, 'notice');
    } finally {
      busy = false; ready(); typing.hidden = true;
    }
  });

  if (!stored('billy-gone')) button.hidden = false;
}

// Momentum page: the bar fills to 16 the first time it comes into view
document.querySelectorAll('[data-fill]').forEach(bar => {
  if (!('IntersectionObserver' in window)) return bar.classList.add('is-filled');
  const seen = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    bar.classList.add('is-filled');
    seen.disconnect();
  }, { threshold: 0.6 });
  seen.observe(bar);
});
