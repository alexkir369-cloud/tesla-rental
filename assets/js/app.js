/* ==========================================================================
   VOLTA RENT — site logic: fleet, filters, price calculator, booking
   European edition · English · prices in EUR
   ========================================================================== */

/* ------------------------------- Data ----------------------------------- */

const MODELS = [
  {
    id: 'model3',
    img: 'assets/img/model3.jpg',
    thumb: 'assets/img/thumb/model3.jpg',
    cut: 'assets/img/cut/model3.webp',
    name: 'Tesla Model 3',
    trim: 'RWD · Standard Range',
    klass: 'Sedan',
    shape: 'sedan',
    color: '#e8eaee',
    price: 89,
    deposit: 500,
    range: 513,
    accel: '6.1 s',
    power: '283 hp',
    seats: 5,
    drive: 'Rear-wheel drive',
    year: 2023,
    group: 'sedan',
    badge: 'Most booked',
    popular: true
  },
  {
    id: 'model3lr',
    img: 'assets/img/model3lr.jpg',
    thumb: 'assets/img/thumb/model3lr.jpg',
    cut: 'assets/img/cut/model3lr.webp',
    name: 'Tesla Model 3 Long Range',
    trim: 'AWD · Long Range',
    klass: 'Sedan',
    shape: 'sedan',
    color: '#c8202a',
    price: 99,
    deposit: 500,
    range: 629,
    accel: '4.4 s',
    power: '498 hp',
    seats: 5,
    drive: 'All-wheel drive',
    year: 2024,
    group: 'sedan',
    popular: true
  },
  {
    id: 'modely',
    img: 'assets/img/modely.jpg',
    thumb: 'assets/img/thumb/modely.jpg',
    cut: 'assets/img/cut/modely.webp',
    name: 'Tesla Model Y',
    trim: 'AWD · Long Range',
    klass: 'SUV',
    shape: 'suv',
    color: '#9fb0c9',
    price: 109,
    deposit: 700,
    range: 533,
    accel: '5.0 s',
    power: '378 hp',
    seats: 5,
    drive: 'All-wheel drive',
    year: 2024,
    group: 'suv',
    badge: 'Family favourite',
    popular: true
  },
  {
    id: 'modely7',
    img: 'assets/img/modely7.jpg',
    thumb: 'assets/img/thumb/modely7.jpg',
    cut: 'assets/img/cut/modely7.webp',
    name: 'Tesla Model Y 7 seats',
    trim: 'AWD · 7-seat',
    klass: 'SUV',
    shape: 'suv',
    color: '#2b2f38',
    price: 119,
    deposit: 700,
    range: 505,
    accel: '5.4 s',
    power: '378 hp',
    seats: 7,
    drive: 'All-wheel drive',
    year: 2024,
    group: 'suv'
  },
  {
    id: 'models',
    img: 'assets/img/models.jpg',
    thumb: 'assets/img/thumb/models.jpg',
    cut: 'assets/img/cut/models.webp',
    name: 'Tesla Model S Plaid',
    trim: 'Plaid · Tri-Motor',
    klass: 'Business',
    shape: 'sedan',
    color: '#3a4a6b',
    price: 159,
    deposit: 1500,
    range: 600,
    accel: '2.1 s',
    power: '1,020 hp',
    seats: 5,
    drive: 'All-wheel drive',
    year: 2023,
    group: 'business',
    badge: '0–100 in 2.1 s'
  },
  {
    id: 'modelx',
    img: 'assets/img/modelx.jpg',
    thumb: 'assets/img/thumb/modelx.jpg',
    cut: 'assets/img/cut/modelx.webp',
    name: 'Tesla Model X',
    trim: 'AWD · Long Range',
    klass: 'Business',
    shape: 'suv',
    color: '#e8eaee',
    price: 169,
    deposit: 1500,
    range: 576,
    accel: '3.9 s',
    power: '670 hp',
    seats: 6,
    drive: 'All-wheel drive',
    year: 2023,
    group: 'business',
    badge: 'Falcon Wing'
  },
  {
    id: 'cybertruck',
    img: 'assets/img/cybertruck.jpg',
    thumb: 'assets/img/thumb/cybertruck.jpg',
    cut: 'assets/img/cut/cybertruck.webp',
    name: 'Tesla Cybertruck',
    trim: 'AWD · Cyberbeast',
    klass: 'Exclusive',
    shape: 'truck',
    color: '#8d939c',
    price: 259,
    deposit: 2000,
    range: 547,
    accel: '2.7 s',
    power: '845 hp',
    seats: 5,
    drive: 'All-wheel drive',
    year: 2024,
    group: 'exclusive',
    badge: 'New arrival'
  }
];

const EXTRAS = [
  { id: 'delivery', label: 'Delivery within the city', price: 49, unit: 'once' },
  { id: 'childseat', label: 'Child seat / booster', price: 9, unit: 'day' },
  { id: 'driver2', label: 'Second driver on the policy', price: 19, unit: 'once' },
  { id: 'unlimited', label: 'Unlimited mileage', price: 20, unit: 'day' },
  { id: 'charger', label: 'Portable charger for the trip', price: 12, unit: 'once' },
  { id: 'airport', label: 'Airport meet & greet (BER / MUC / AMS)', price: 79, unit: 'once' }
];

const DISCOUNTS = [
  { min: 14, pct: 20, label: 'from 14 days — 20% off' },
  { min: 7, pct: 15, label: 'from 7 days — 15% off' },
  { min: 3, pct: 10, label: 'from 3 days — 10% off' }
];

/* ------------------------------ Helpers --------------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const money = (n) => '€' + new Intl.NumberFormat('en-GB').format(Math.round(n));
const days = (n) => n + ' ' + (n === 1 ? 'day' : 'days');

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const daysBetween = (from, to) => {
  if (!from || !to) return 0;
  const a = new Date(from + 'T00:00:00');
  const b = new Date(to + 'T00:00:00');
  const diff = Math.round((b - a) / 86400000);
  return diff > 0 ? diff : 0;
};

const discountFor = (n) => DISCOUNTS.find((d) => n >= d.min) || { pct: 0, label: '' };
const modelById = (id) => MODELS.find((m) => m.id === id) || MODELS[0];

/* --------------------------- Car illustrations --------------------------- */

const SHAPES = {
  /* Sedan: long bonnet, sloping roof, low stance */
  sedan: {
    body:
      'M20 130C20 110 30 100 58 96L104 90C130 62 152 46 178 45L256 44C284 46 306 62 330 86L386 94C406 98 414 108 414 126V132C414 139 409 143 402 143H372A34 34 0 0 0 304 143H150A34 34 0 0 0 82 143H32C25 143 20 139 20 132Z',
    glass: 'M124 86C146 62 168 50 196 47L256 46C288 49 312 64 330 86Z',
    detail: ['M230 88V141', 'M132 106h28', 'M258 106h28', 'M90 139h46', 'M282 139h46'],
    wheels: [116, 338],
    wheelR: 30,
    wheelY: 143,
    light: 'M30 100h32l-4 11H32z',
    tail: 'M396 100h16v11h-16z',
    shadow: 196
  },
  /* SUV: tall roof, upright tail, bigger wheels */
  suv: {
    body:
      'M22 128C22 106 34 96 64 92L112 84C136 56 160 41 192 39L262 38C296 40 320 55 344 82L384 90C404 94 414 106 414 124V132C414 139 409 143 402 143H372A34 34 0 0 0 304 143H150A34 34 0 0 0 82 143H34C27 143 22 139 22 132Z',
    glass: 'M120 80C144 54 166 45 194 44L262 43C292 47 314 62 334 82Z',
    detail: ['M230 84V141', 'M132 100h28', 'M258 100h28', 'M90 139h46', 'M282 139h46'],
    wheels: [116, 338],
    wheelR: 32,
    wheelY: 142,
    light: 'M32 94h32l-4 11H34z',
    tail: 'M396 94h16v12h-16z',
    shadow: 198
  },
  /* Cybertruck: angular wedge profile */
  truck: {
    body:
      'M22 130L36 92L90 84L176 42L266 40L344 74L394 84C406 87 414 96 414 116V132C414 139 409 143 402 143H372A36 36 0 0 0 300 143H152A36 36 0 0 0 80 143H34C27 143 22 139 22 132Z',
    glass: 'M186 46L266 44L320 72L186 76Z',
    detail: ['M152 42V84', 'M96 86h62', 'M306 80h64'],
    wheels: [116, 336],
    wheelR: 33,
    wheelY: 143,
    light: 'M30 96h30l-4 10H32z',
    tail: 'M394 92h18v12h-18z',
    shadow: 200
  }
};

function carSVG(shape, color) {
  const s = SHAPES[shape] || SHAPES.sedan;
  const gid = 'g' + Math.random().toString(36).slice(2, 8);

  const wheels = s.wheels
    .map(
      (x) => `
      <g>
        <circle cx="${x}" cy="${s.wheelY}" r="${s.wheelR}" fill="#0b0c11"/>
        <circle cx="${x}" cy="${s.wheelY}" r="${s.wheelR}" fill="none" stroke="rgba(255,255,255,.20)" stroke-width="1.4"/>
        <circle cx="${x}" cy="${s.wheelY}" r="${(s.wheelR * 0.56).toFixed(1)}" fill="#191d27" stroke="rgba(255,255,255,.24)" stroke-width="1.2"/>
        <circle cx="${x}" cy="${s.wheelY}" r="4.6" fill="#333a4c"/>
      </g>`
    )
    .join('');

  return `
  <svg viewBox="0 0 420 186" role="img" aria-label="Car illustration" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gid}" x1="0.1" y1="0" x2="0.5" y2="1">
        <stop offset="0" stop-color="${color}" stop-opacity="1"/>
        <stop offset="0.5" stop-color="${color}" stop-opacity="0.8"/>
        <stop offset="1" stop-color="#05060a" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="${gid}w" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stop-color="#0d1220" stop-opacity="0.95"/>
        <stop offset="1" stop-color="#1b2436" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <ellipse cx="212" cy="178" rx="${s.shadow}" ry="7" fill="rgba(0,0,0,.55)"/>
    ${wheels}
    <path d="${s.body}" fill="url(#${gid})" stroke="rgba(255,255,255,.26)" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="${s.glass}" fill="url(#${gid}w)" stroke="rgba(255,255,255,.18)" stroke-width="1.2" stroke-linejoin="round"/>
    ${s.detail.map((d) => `<path d="${d}" stroke="rgba(0,0,0,.32)" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}
    <path d="${s.light}" fill="#ff5a5a" opacity=".9"/>
    <path d="${s.tail}" fill="#ff5a5a" opacity=".8"/>
  </svg>`;
}

/* ------------------------------ Car cards ------------------------------- */

function carCardHTML(m) {
  return `
  <article class="card car-card reveal" id="${m.id}" data-group="${m.group}" data-id="${m.id}">
    <div class="car-card__media" data-visual="cut">
      ${m.badge ? `<span class="car-card__class">${m.badge}</span>` : `<span class="car-card__class">${m.klass}</span>`}
      <span class="car-card__glow" aria-hidden="true"></span>
      <img class="car-card__photo car-card__photo--cut" src="${m.cut}" alt="${m.name} for rent in Europe"
           loading="lazy" decoding="async" width="1200" height="690"
           onerror="this.closest('.car-card__media').dataset.visual==='cut' ? (this.closest('.car-card__media').dataset.visual='photo', this.src='${m.img}') : this.closest('.car-card__media').classList.add('no-photo')">
      <div class="car-card__fallback">${carSVG(m.shape, m.color)}</div>
    </div>
    <div class="car-card__body">
      <div class="car-card__title">
        <h3>${m.name}</h3>
        <div class="car-card__price">${money(m.price)}<span> / day</span></div>
      </div>
      <div class="car-card__sub">${m.trim} · ${m.year} · ${m.klass}</div>
      <div class="specs">
        <span class="spec"><svg class="icon icon--xs" aria-hidden="true"><use href="#i-battery-charging"/></svg>Range <b>${m.range} km</b></span>
        <span class="spec"><svg class="icon icon--xs" aria-hidden="true"><use href="#i-gauge"/></svg>0–100 <b>${m.accel}</b></span>
        <span class="spec"><svg class="icon icon--xs" aria-hidden="true"><use href="#i-users"/></svg>Seats <b>${m.seats}</b></span>
        <span class="spec"><svg class="icon icon--xs" aria-hidden="true"><use href="#i-cog"/></svg>Drive <b>${m.drive.replace('-wheel drive', '-wheel')}</b></span>
      </div>
      <div class="car-card__foot">
        <a class="btn btn--primary" href="booking.html?car=${m.id}"><svg class="icon icon--xs" aria-hidden="true"><use href="#i-calendar"/></svg>Book now</a>
        <a class="btn btn--ghost" href="fleet.html#${m.id}">Details <svg class="icon icon--xs" aria-hidden="true"><use href="#i-arrow-right"/></svg></a>
      </div>
    </div>
  </article>`;
}

/* --------------------------- Price calculator --------------------------- */

function initCalculator() {
  const root = $('#calculator');
  if (!root) return;

  const select = $('#calc-model', root);
  const dayInput = $('#calc-days', root);
  const daysOut = $('#calc-days-out', root);
  const unlimited = $('#calc-unlimited', root);
  const delivery = $('#calc-delivery', root);
  const out = $('#calc-out', root);
  const btn = $('#calc-submit', root);

  select.innerHTML = MODELS.map((m) => `<option value="${m.id}">${m.name} — ${money(m.price)}/day</option>`).join('');

  const render = () => {
    const m = modelById(select.value);
    const n = Math.max(1, Math.min(60, parseInt(dayInput.value, 10) || 1));
    daysOut.textContent = days(n);

    const base = m.price * n;
    const d = discountFor(n);
    const discount = Math.round((base * d.pct) / 100);
    const extras = [];
    if (unlimited.checked) extras.push({ label: 'Unlimited mileage', sum: 20 * n });
    if (delivery.checked) extras.push({ label: 'Delivery within the city', sum: 49 });

    const extrasSum = extras.reduce((acc, e) => acc + e.sum, 0);
    const total = base - discount + extrasSum;

    out.innerHTML = `
      <div class="calc__out-row"><span>${m.name} × ${days(n)}</span><b>${money(base)}</b></div>
      ${d.pct ? `<div class="calc__out-row"><span>Long-stay discount ${d.pct}%</span><b>−${money(discount)}</b></div>` : ''}
      ${extras.map((e) => `<div class="calc__out-row"><span>${e.label}</span><b>${money(e.sum)}</b></div>`).join('')}
      <div class="calc__out-row"><span>Deposit (refundable)</span><b>${money(m.deposit)}</b></div>
      <div class="calc__total"><span>Total for the rental</span><b>${money(total)}</b></div>
      ${d.pct ? `<div class="calc__saving">You save ${money(discount)} · ${d.label}</div>` : `<div class="calc__saving">Rentals from 3 days — up to 20% off</div>`}
    `;
    root.dataset.total = total;
    return { m, n, total };
  };

  [select, dayInput, unlimited, delivery].forEach((el) => el.addEventListener('input', render));

  btn?.addEventListener('click', (e) => {
    e.preventDefault();
    const { m, n } = render();
    location.href = `booking.html?car=${m.id}&days=${n}`;
  });

  render();
}

/* ------------------------------ Fleet filter ---------------------------- */

function initFleet() {
  const wrap = $('#fleet-grid');
  if (!wrap) return;

  const chips = $$('.filters .chip');

  const apply = () => {
    const active = $('.filters .chip.is-active')?.dataset.filter || 'all';
    $$('.car-card', wrap).forEach((card) => {
      const show = active === 'all' || card.dataset.group === active;
      card.classList.toggle('hidden', !show);
      if (show) card.classList.add('is-in');
    });
    const count = $$('.car-card', wrap).filter((c) => !c.classList.contains('hidden')).length;
    const counter = $('#fleet-count');
    if (counter) counter.textContent = `${count} of ${MODELS.length} cars available`;
  };

  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      apply();
    })
  );

  apply();
}

/* ------------------------------ Booking form ---------------------------- */

function initBookingForm() {
  const form = $('#booking-form');
  if (!form) return;

  const carSelect = $('#bk-model', form);
  const from = $('#bk-from', form);
  const to = $('#bk-to', form);
  const time = $('#bk-time', form);
  const extrasWrap = $('#bk-extras', form);
  const summary = $('#bk-summary');
  const success = $('#booking-success');
  const result = $('#booking-result');

  carSelect.innerHTML = MODELS.map((m) => `<option value="${m.id}">${m.name} — ${money(m.price)}/day</option>`).join('');
  extrasWrap.innerHTML = EXTRAS.map(
    (x) => `
    <label class="check">
      <input type="checkbox" value="${x.id}" data-price="${x.price}" data-unit="${x.unit}">
      <span>${x.label} <span class="dim small">· ${money(x.price)}${x.unit === 'day' ? ' / day' : ' one-off'}</span></span>
    </label>`
  ).join('');

  // prefill from the URL: booking.html?car=modely&days=5
  const params = new URLSearchParams(location.search);
  if (params.get('car')) carSelect.value = params.get('car');
  const presetDays = parseInt(params.get('days'), 10);
  const today = new Date();
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
  from.value = iso(today);
  to.value = iso(addDays(today, presetDays > 0 ? presetDays : 3));
  from.min = iso(today);
  to.min = iso(addDays(today, 1));
  if (!time.value) time.value = '10:00';

  const calc = () => {
    const m = modelById(carSelect.value);
    const n = Math.max(1, daysBetween(from.value, to.value));
    const base = m.price * n;
    const d = discountFor(n);
    const discount = Math.round((base * d.pct) / 100);
    const chosen = $$('input[type="checkbox"][data-price]', extrasWrap)
      .filter((c) => c.checked)
      .map((c) => {
        const price = Number(c.dataset.price);
        const unit = c.dataset.unit;
        return { label: c.parentElement.innerText.split('·')[0].trim(), sum: unit === 'day' ? price * n : price };
      });
    const extrasSum = chosen.reduce((a, e) => a + e.sum, 0);
    const total = base - discount + extrasSum;

    summary.innerHTML = `
      <div class="calc__out-row"><span>Car</span><b>${m.name}</b></div>
      <div class="calc__out-row"><span>Rental period</span><b>${days(n)}</b></div>
      <div class="calc__out-row"><span>Rental (${money(m.price)}/day)</span><b>${money(base)}</b></div>
      ${d.pct ? `<div class="calc__out-row"><span>Discount ${d.pct}%</span><b>−${money(discount)}</b></div>` : ''}
      ${chosen.map((e) => `<div class="calc__out-row"><span>${e.label}</span><b>${money(e.sum)}</b></div>`).join('')}
      <div class="calc__out-row"><span>Deposit (held and released)</span><b>${money(m.deposit)}</b></div>
      <div class="calc__total"><span>Total to pay</span><b>${money(total)}</b></div>
    `;
    return { m, n, total, discount, extrasSum };
  };

  $$('input, select', form).forEach((el) => el.addEventListener('input', calc));
  calc();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const { m, n, total } = calc();
    const num = 'VR-' + String(Math.floor(100000 + Math.random() * 899999));
    const booking = {
      num,
      car: m.name,
      from: from.value,
      to: to.value,
      time: time.value,
      days: n,
      total,
      name: $('#bk-name', form).value.trim(),
      phone: $('#bk-phone', form).value.trim(),
      created: new Date().toISOString()
    };
    try {
      const all = JSON.parse(localStorage.getItem('volta_bookings') || '[]');
      all.push(booking);
      localStorage.setItem('volta_bookings', JSON.stringify(all));
    } catch (_) {}

    result.innerHTML = `
      <div class="success__icon"><svg class="icon icon--lg" aria-hidden="true"><use href="#i-check"/></svg></div>
      <h2 class="mt-0">Booking received!</h2>
      <p class="muted">Booking number: <code>${num}</code></p>
      <div class="panel card--flat mb-24" style="text-align:left">
        <div class="calc__out-row"><span>Car</span><b>${booking.car}</b></div>
        <div class="calc__out-row"><span>Pick-up</span><b>${fmtDate(booking.from)}, ${booking.time}</b></div>
        <div class="calc__out-row"><span>Return</span><b>${fmtDate(booking.to)}</b></div>
        <div class="calc__out-row"><span>Duration</span><b>${days(booking.days)}</b></div>
        <div class="calc__total"><span>Total to pay</span><b>${money(booking.total)}</b></div>
      </div>
      <p class="muted small">A manager will confirm availability on ${booking.phone} within 15 minutes and send you the rental agreement.</p>
      <div class="hero__cta" style="justify-content:center">
        <a class="btn btn--primary" href="index.html">Back to home</a>
        <button class="btn btn--ghost" type="button" id="booking-again">New booking</button>
      </div>
    `;
    form.classList.add('hidden');
    success.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    $('#booking-again')?.addEventListener('click', () => location.reload());
    toast('Booking ' + num + ' saved. We will call you within 15 minutes.');
  });
}

/* ------------------------------ Validation ------------------------------ */

function setError(field, message) {
  field.classList.add('input--error');
  let err = field.parentElement.querySelector('.error-text');
  if (!err) {
    err = document.createElement('span');
    err.className = 'error-text';
    field.parentElement.appendChild(err);
  }
  err.textContent = message;
}

function clearError(field) {
  field.classList.remove('input--error');
  field.parentElement.querySelector('.error-text')?.remove();
}

function validateForm(form) {
  let ok = true;
  let first = null;

  $$('[required]', form).forEach((field) => {
    clearError(field);
    const value = (field.value || '').trim();
    let message = '';

    if (field.type === 'checkbox' && !field.checked) message = 'Please tick the box to continue';
    else if (!value) message = 'This field is required';
    else if (field.type === 'tel' && value.replace(/\D/g, '').length < 9) message = 'Enter a full phone number, e.g. +49 30 1234567';
    else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Check the email address';

    if (message) {
      ok = false;
      setError(field, message);
      first = first || field;
    }
  });

  const from = $('#bk-from', form);
  const to = $('#bk-to', form);
  if (from && to && daysBetween(from.value, to.value) < 1) {
    setError(to, 'Return date must be later than the pick-up date');
    ok = false;
    first = first || to;
  }

  if (!ok) {
    first?.focus();
    toast('Please check the highlighted fields');
  }
  return ok;
}

/* ----------------------------- Contact form ----------------------------- */

function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    toast('Thank you! Your message has been sent — we reply within 15 minutes.');
    form.reset();
  });
}

/* --------------------------------- FAQ ---------------------------------- */

function initFaq() {
  $$('.faq__item').forEach((item) => {
    const btn = $('.faq__q', item);
    const ans = $('.faq__a', item);
    btn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      $$('.faq__item').forEach((other) => {
        other.classList.remove('is-open');
        $('.faq__a', other).style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('is-open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });
}

/* ------------------------------ Navigation ------------------------------ */

function initNav() {
  const header = $('.header');
  const burger = $('.burger');
  const nav = $('.nav');

  const onScroll = () => header?.classList.toggle('is-stuck', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger?.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    nav.classList.toggle('is-open');
  });

  const current = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) a.classList.add('is-active');
  });
}

/* --------------------------- Reveal on scroll --------------------------- */

function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach((i) => i.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-in'), i * 60);
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  items.forEach((i) => io.observe(i));
}

/* --------------------------------- Toast -------------------------------- */

let toastTimer;
function toast(text) {
  let el = $('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = text;
  requestAnimationFrame(() => el.classList.add('is-visible'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4200);
}

/* --------------------------- Phone input mask --------------------------- */

function initPhoneMask() {
  $$('input[type="tel"]').forEach((input) => {
    input.addEventListener('input', () => {
      let v = input.value.replace(/[^\d+ ]/g, '');
      if (v.startsWith('00')) v = '+' + v.slice(2);
      if (!v.startsWith('+')) v = '+' + v.replace(/\+/g, '');
      v = v.replace(/(?!^)\+/g, '');
      input.value = v.slice(0, 20);
    });
  });
}

/* ------------------------------ Hero counter ---------------------------- */

function initHeroCounter() {
  const free = $('#hero-free');
  if (!free) return;
  // the number of free cars drifts a little day to day, but stays plausible
  const seed = new Date().getDate() % 3;
  free.textContent = 5 + (seed === 0 ? 1 : 0) + ' of 7 cars available';
}

/* ---------------------------- Card rendering ---------------------------- */

function initCarCards() {
  const grids = $$('[data-cars]');
  grids.forEach((grid) => {
    let list = MODELS.slice();
    const limit = parseInt(grid.dataset.limit, 10);
    const filter = grid.dataset.cars;
    if (filter === 'popular') list = list.filter((m) => m.popular);
    if (limit) list = list.slice(0, limit);
    grid.innerHTML = list.map(carCardHTML).join('');
  });
}


/* ------------------------------- Counters -------------------------------- */

function initCounters() {
  const items = $$('[data-count]');
  if (!items.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    if (reduce || isNaN(target)) return;
    const dur = 1300;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) { items.forEach(run); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  items.forEach((el) => io.observe(el));
}

/* -------------------------------- Videos --------------------------------- */

function initVideos() {
  const cards = $$('.video-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    const video = $('video', card);
    const btn = $('.video-card__btn', card);
    if (!video) return;
    const use = btn ? $('use', btn) : null;
    const setIcon = (playing) => use?.setAttribute('href', playing ? '#i-pause' : '#i-play');

    const play = () => video.play().then(() => setIcon(true)).catch(() => setIcon(false));
    const pause = () => { video.pause(); setIcon(false); };

    video.addEventListener('play', () => { card.classList.add('is-playing'); setIcon(true); });
    video.addEventListener('pause', () => { card.classList.remove('is-playing'); setIcon(false); });

    btn?.addEventListener('click', () => {
      if (video.paused) { card.dataset.manual = 'play'; play(); }
      else { card.dataset.manual = 'pause'; pause(); }
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (card.dataset.manual !== 'pause') play();
          } else {
            pause();
          }
        });
      }, { threshold: 0.35 });
      io.observe(card);
    }
  });
}


/* --------------------------- Modern UI details --------------------------- */

function initScrollProgress() {
  const bar = $('.scroll-progress span');
  const toTop = $('.to-top');
  if (!bar && !toTop) return;

  let raf = null;
  const update = () => {
    raf = null;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? (doc.scrollTop || window.scrollY) / max : 0;
    if (bar) bar.style.width = (Math.min(1, Math.max(0, progress)) * 100).toFixed(2) + '%';
    toTop?.classList.toggle('is-visible', (window.scrollY || doc.scrollTop) > 600);
  };
  const onScroll = () => { if (raf === null) raf = requestAnimationFrame(update); };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initSpotlight() {
  const targets = $$('.card, .video-card, .gallery__item');
  if (!targets.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce || !fine) return;

  targets.forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });
}

/* --------------------------------- Init --------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCarCards();
  initHeroCounter();
  initFleet();
  initCalculator();
  initBookingForm();
  initContactForm();
  initFaq();
  initPhoneMask();
  initReveal();
  initCounters();
  initVideos();
  initScrollProgress();
  initSpotlight();
});
