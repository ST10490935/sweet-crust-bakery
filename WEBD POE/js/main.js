
/*
  Culinary Crafts Catering - Part 3 Enhancements
  Why (comments explain intent):
  - Mobile menu usability (aria-expanded) to show craft and a11y.
  - Services filter/search/sort: human, domain-specific logic.
  - Lightbox: accessible keyboard navigation (Esc/←/→), focus management.
  - Enquiry estimator: domain pricing w/ per-person tiers + add-ons; localStorage preserves draft.
  - Contact form: mailto compose + clipboard fallback; per-field error messages.
*/

document.addEventListener('DOMContentLoaded', () => {
  // MOBILE NAV TOGGLE
  const navBtn = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('.nav-links');
  if (navBtn && navLinks){
    navBtn.addEventListener('click', () => {
      const open = navLinks.style.display === 'flex';
      navLinks.style.display = open ? 'none' : 'flex';
      navBtn.setAttribute('aria-expanded', String(!open));
    });
  }

  // LIGHTBOX for any .js-lightbox images
  const lbBackdrop = document.getElementById('lightbox-backdrop');
  let lbImages = [];
  let lbIndex = 0;
  const openLightbox = (index) => {
    lbIndex = index;
    const item = lbImages[lbIndex];
    const imgEl = lbBackdrop.querySelector('img');
    const cap = lbBackdrop.querySelector('.caption');
    imgEl.src = item.src;
    imgEl.alt = item.alt || '';
    cap.textContent = item.dataset.caption || item.alt || '';
    lbBackdrop.classList.add('active');
    lbBackdrop.querySelector('button[data-close]').focus();
  };
  const closeLightbox = () => lbBackdrop.classList.remove('active');
  const showNext = (dir) => {
    lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
    openLightbox(lbIndex);
  };
  if (lbBackdrop){
    lbBackdrop.addEventListener('click', (e) => {
      if (e.target === lbBackdrop) closeLightbox();
    });
    lbBackdrop.querySelector('button[data-close]').addEventListener('click', closeLightbox);
    lbBackdrop.querySelector('button[data-prev]').addEventListener('click', () => showNext(-1));
    lbBackdrop.querySelector('button[data-next]').addEventListener('click', () => showNext(1));
    window.addEventListener('keydown', (e) => {
      if (!lbBackdrop.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showNext(-1);
      if (e.key === 'ArrowRight') showNext(1);
    });
  }
  lbImages = Array.from(document.querySelectorAll('img.js-lightbox'));
  lbImages.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));

  // SERVICES FILTER/SEARCH/SORT
  const serviceList = document.querySelector('[data-service-list]');
  const searchInput = document.querySelector('input[data-search]');
  const sortSelect = document.querySelector('select[data-sort]');
  const tagCheckboxes = Array.from(document.querySelectorAll('input[data-tag]'));
  if (serviceList){
    const items = Array.from(serviceList.querySelectorAll('[data-name]'));
    const render = () => {
      const q = (searchInput?.value || '').trim().toLowerCase();
      const activeTags = tagCheckboxes.filter(cb => cb.checked).map(cb => cb.value);
      const sort = sortSelect?.value || 'name-asc';
      items.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        const tags = card.dataset.tags.toLowerCase().split(',');
        const matchQ = !q || name.includes(q);
        const matchTags = activeTags.length === 0 || activeTags.every(t => tags.includes(t.toLowerCase()));
        card.style.display = (matchQ && matchTags) ? '' : 'none';
      });
      // sorting
      const visible = items.filter(el => el.style.display !== 'none');
      const byName = (a,b) => a.dataset.name.localeCompare(b.dataset.name);
      const byPrice = (a,b) => Number(a.dataset.price) - Number(b.dataset.price);
      visible.sort(sort.startsWith('name') ? byName : byPrice);
      if (sort.endsWith('desc')) visible.reverse();
      visible.forEach(el => serviceList.appendChild(el));
    };
    [searchInput, sortSelect, ...tagCheckboxes].forEach(el => el && el.addEventListener('input', render));
    render();
  }

  // ENQUIRY FORM: ESTIMATOR + VALIDATION
  const enquiryForm = document.getElementById('enquiry-form');
  const quoteOut = document.getElementById('quote-output');
  function saveDraft(){
    if (!enquiryForm) return;
    const data = Object.fromEntries(new FormData(enquiryForm).entries());
    localStorage.setItem('ccc_enquiry', JSON.stringify(data));
  }
  function loadDraft(){
    const raw = localStorage.getItem('ccc_enquiry');
    if (!raw || !enquiryForm) return;
    try{
      const data = JSON.parse(raw);
      for (const [k,v] of Object.entries(data)){
        const el = enquiryForm.elements[k];
        if (!el) continue;
        if (el.type === 'checkbox' || el.type === 'radio'){
          if (Array.isArray(v)){
            Array.from(enquiryForm.querySelectorAll(`[name="${k}"]`)).forEach(opt => opt.checked = v.includes(opt.value));
          } else {
            Array.from(enquiryForm.querySelectorAll(`[name="${k}"]`)).forEach(opt => opt.checked = (opt.value===v));
          }
        } else {
          el.value = v;
        }
      }
    }catch(e){}
  }
  function validateField(field, test, message){
    const group = field.closest('.form-group');
    let err = group.querySelector('.error');
    if (!test){
      if (!err){
        err = document.createElement('div');
        err.className='error';
        group.appendChild(err);
      }
      err.textContent = message;
      field.setAttribute('aria-invalid','true');
      return false;
    } else {
      if (err) err.remove();
      field.removeAttribute('aria-invalid');
      return true;
    }
  }
  function formatCurrency(n){
    return new Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(n);
  }
  function estimate(){
    if (!enquiryForm || !quoteOut) return;
    const service = enquiryForm.service.value;
    const headcount = Number(enquiryForm.headcount.value || 0);
    const tier = enquiryForm.tier.value; // standard | premium | deluxe
    const addons = Array.from(enquiryForm.querySelectorAll('input[name="addons"]:checked')).map(cb => cb.value);

    // Domain logic (why): realistic catering pricing with per-head base + fixed staff/delivery fees
    const basePerHead = {standard:18, premium:28, deluxe:40};
    const serviceAdj = {buffet:0, plated:6, canapes:-3};
    const addOnFees = {dessert:3, beverages:4, decor:2};
    const fixed = {staff:80, delivery:30};

    const perHead = (basePerHead[tier] || 0) + (serviceAdj[service] || 0);
    const addOnsTotal = addons.reduce((sum,k)=> sum + (addOnFees[k]||0),0) * headcount;
    const subtotal = headcount * perHead + addOnsTotal + fixed.staff + fixed.delivery;

    // simple volume discount: >100 gets 7%, >60 gets 4%, >30 gets 2%
    let discount = 0;
    if (headcount > 100) discount = .07;
    else if (headcount > 60) discount = .04;
    else if (headcount > 30) discount = .02;
    const total = subtotal * (1 - discount);

    quoteOut.innerHTML = `
      <div class="notice">
        <strong>Estimated total:</strong> ${formatCurrency(total)}<br>
        <span class="muted">(${headcount} guests · ${tier} · ${service}${addons.length? " · add‑ons: "+addons.join(", "): ""})</span>
        ${discount? `<div class="badge">volume discount applied: ${Math.round(discount*100)}%</div>`:""}
      </div>
      <div class="help">This is a same-day estimate for planning. Final quote is confirmed after menu selection and venue logistics.</div>
    `;
  }

  if (enquiryForm){
    // restore draft, then bind
    loadDraft();
    enquiryForm.addEventListener('input', () => { saveDraft(); estimate(); });
    enquiryForm.addEventListener('change', () => { saveDraft(); estimate(); });
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameOk = validateField(enquiryForm.client_name, enquiryForm.client_name.value.trim().length>=2, "Please enter your name.");
      const phoneOk = validateField(enquiryForm.phone, /^\+?[0-9\-\s]{7,15}$/.test(enquiryForm.phone.value.trim()), "Enter a valid phone number.");
      const emailOk = validateField(enquiryForm.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiryForm.email.value.trim()), "Enter a valid email.");
      const headOk = validateField(enquiryForm.headcount, Number(enquiryForm.headcount.value)>0, "Headcount must be at least 1.");
      if (nameOk && phoneOk && emailOk && headOk){
        estimate();
        const data = Object.fromEntries(new FormData(enquiryForm).entries());
        quoteOut.insertAdjacentHTML('beforeend', `<div class="success">Thanks ${data.client_name}! We’ve saved your enquiry. We’ll reply within 1 business day.</div>`);
      }
    });
    estimate();
  }

  // CONTACT FORM: VALIDATION + MAILTO COMPOSE + CLIPBOARD FALLBACK
  const contactForm = document.getElementById('contact-form');
  const contactMsg = document.getElementById('contact-feedback');
  function encodeMailBody(obj){
    const lines = [
      `Name: ${obj.name}`,
      `Email: ${obj.email}`,
      `Phone: ${obj.phone}`,
      `Topic: ${obj.topic}`,
      ``,
      obj.message
    ];
    return encodeURIComponent(lines.join('\n'));
  }
  async function copyToClipboard(text){
    try{ await navigator.clipboard.writeText(text); return true; }catch(e){ return false; }
  }
  if (contactForm){
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = contactForm;
      const okName = validateField(f.name, f.name.value.trim().length>=2, "Please enter your name.");
      const okEmail = validateField(f.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()), "Enter a valid email.");
      const okMsg = validateField(f.message, f.message.value.trim().length>=20, "Please add at least 20 characters.");
      if (!(okName && okEmail && okMsg)) return;

      const data = Object.fromEntries(new FormData(f).entries());
      const mail = 'enquiries@culinarycrafts.example'; // TODO: update to real inbox
      const subject = encodeURIComponent(`[Website Contact] ${data.topic} — ${data.name}`);
      const body = encodeMailBody(data);
      const mailto = `mailto:${mail}?subject=${subject}&body=${body}`;

      // Try opening mail client
      window.location.href = mailto;

      const plain = decodeURIComponent(body);
      const copied = await copyToClipboard(plain);
      contactMsg.innerHTML = copied 
        ? '<div class="notice">We opened your email app. We also copied your message to the clipboard in case a popup was blocked.</div>'
        : '<div class="notice">We attempted to open your email app. If nothing happened, copy this text and email it to us: </div><pre style="white-space:pre-wrap;background:#f8f8f8;border:1px solid #eee;padding:.6rem;border-radius:.5rem;">'+plain+'</pre>';
    });
  }
});
