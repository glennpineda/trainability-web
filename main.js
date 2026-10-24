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

// Studio's embedded forms (personal training, reserve a studio, contact) say how tall they
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
  const say = (text, field) => {
    problem.textContent = text;
    problem.hidden = false;
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  };
  document.addEventListener('click', (e) => {
    if (!e.target.closest(opener)) return;
    e.preventDefault();
    dayPass?.close();
    openedAt = Date.now();
    dialog.showModal();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
    // A link to somewhere on this same page (the contact form) closes the dialog first
    if (e.target.closest('[data-close-dialog]')) dialog.close();
  });
  form.addEventListener('input', (e) => { problem.hidden = true; e.target.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements;
    const value = (name) => f[name].value.trim();
    if (!value('firstName')) return say('Enter your first name.', f.firstName);
    if (!value('lastName')) return say('Enter your last name.', f.lastName);
    const wrong = check(f, value);
    if (wrong) return say(...wrong);
    send.disabled = true;
    try {
      const res = await fetch(dialog.dataset.api, {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: value('firstName'), lastName: value('lastName'),
          ...body(f, value), openedAt, website: f.website.value,
        }),
      });
      const answer = await res.json().catch(() => ({}));
      if (res.ok) {
        dialog.querySelector('[data-ask]').hidden = true;
        dialog.querySelector('[data-done]').hidden = false;
        return;
      }
      if (res.status === 400 && answer.error) return say(answer.error, f[answer.field]);
      if (res.status === 429) return say('Too many requests from here just now. Please try again in a few minutes, or call us.');
      say('We couldn\'t send your request. Please try again, or call us at the front desk.');
    } catch {
      say('We couldn\'t send your request. Please check your connection and try again, or call us.');
    } finally {
      send.disabled = false;
    }
  });
};

// Contact page: "Cancel membership" (topic "cancel")
studioRequest(document.querySelector('dialog.cancel-membership'), {
  opener: '[data-cancel-membership]',
  check: (f, value) => {
    if (!/^\S+@\S+\.\S+$/.test(value('email'))) return ['Enter the email address on your membership.', f.email];
    if (value('phone').replace(/\D/g, '').length < 10) return ['Enter the phone number on your membership.', f.phone];
    if (!f.agree.checked) return ['Tick "I understand" to send your request.', f.agree];
  },
  body: (f, value) => ({ email: value('email'), phone: value('phone'), topic: 'cancel', message: '' }),
});

// Assisted stretching: "Book a session" (topic "other", the answers in the
// message, headed so the front desk sees at once what it is)
studioRequest(document.querySelector('dialog.book-stretch'), {
  opener: '[data-book-stretch]',
  check: (f, value) => {
    if (!/^\S+@\S+\.\S+$/.test(value('email'))) return ['Enter your email address.', f.email];
    if (value('phone').replace(/\D/g, '').length < 10) return ['Enter your phone number.', f.phone];
    if (![...f.times].some((t) => t.checked)) return ['Tick at least one time of day that works for you.', f.times[0]];
  },
  body: (f, value) => {
    const times = [...f.times].filter((t) => t.checked).map((t) => t.value).join(', ');
    const note = value('message');
    return {
      email: value('email'), phone: value('phone'), topic: 'other',
      message: `Assisted stretching: booking request\nBest times: ${times}${note ? `\n\n${note}` : ''}`,
    };
  },
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
})();

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
