// FlowCare single-page application

const state = {
  site: {},
  facilities: [],
  profile: {},
  triageData: {},
  recommended: null,
  facilityOverrides: [],
  map: null,
};

// Load site and facility data from content folder
async function loadData() {
  const siteRes = await fetch('content/site.json');
  state.site = await siteRes.json();
  const facilitiesRes = await fetch('content/facilities.json');
  const facData = await facilitiesRes.json();
  state.facilities = facData.facilities;
  // Load overrides from localStorage
  const overrides = localStorage.getItem('facilityOverrides');
  if (overrides) {
    try {
      state.facilityOverrides = JSON.parse(overrides);
    } catch (e) {
      state.facilityOverrides = [];
    }
  }
  // Merge overrides into facilities
  applyFacilityOverrides();
}

function applyFacilityOverrides() {
  if (!state.facilityOverrides || state.facilityOverrides.length === 0) return;
  const baseById = {};
  state.facilities.forEach((fac) => {
    baseById[fac.id] = fac;
  });
  state.facilityOverrides.forEach((ov) => {
    const idx = state.facilities.findIndex((f) => f.id === ov.id);
    if (idx >= 0) {
      state.facilities[idx] = { ...state.facilities[idx], ...ov };
    } else {
      // new facility
      state.facilities.push(ov);
    }
  });
}

// Navigation
function initNav() {
  const links = document.querySelectorAll('a[data-route]');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href').substring(1);
      navigateToPage(target);
    });
  });
  // mobile nav toggle
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

function navigateToPage(id) {
  document.querySelectorAll('section.page').forEach((sec) => {
    sec.classList.add('hidden');
    sec.classList.remove('active');
  });
  const page = document.getElementById(id);
  if (page) {
    page.classList.remove('hidden');
    page.classList.add('active');
  }
  // special actions when entering certain pages
  if (id === 'facilities') renderAllFacilities();
  if (id === 'privacy') renderPrivacy();
  if (id === 'demo-admin') initAdmin();
  if (id === 'triage') initTriage();
}

// Render Home content
function renderHome() {
  const { hero, valueProps, howItWorks, operationalConcept } = state.site;
  // hero
  document.getElementById('hero-title').textContent = hero.title;
  document.getElementById('hero-subtitle').textContent = hero.subtitle;
  document.getElementById('hero-cta').textContent = hero.cta;
  document.getElementById('hero-cta').addEventListener('click', () => {
    navigateToPage('triage');
  });
  // value props
  const vpContainer = document.getElementById('value-props');
  vpContainer.innerHTML = '';
  valueProps.forEach((vp) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${vp.title}</h3><p>${vp.description}</p>`;
    vpContainer.appendChild(card);
  });
  // how it works
  const hiw = document.getElementById('how-it-works');
  hiw.innerHTML = `<h3>${howItWorks.title}</h3>`;
  howItWorks.steps.forEach((step, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<strong>Step ${idx + 1}</strong><p>${step}</p>`;
    hiw.appendChild(card);
  });
  // operational concept
  const op = document.getElementById('operational-concept');
  op.innerHTML = `<h3>${operationalConcept.title}</h3><p>${operationalConcept.description}</p>`;
}

// Render Privacy & Safety
function renderPrivacy() {
  const { safety, privacy } = state.site;
  const container = document.getElementById('privacy-content');
  container.innerHTML = '';
  const safetyEl = document.createElement('div');
  safetyEl.innerHTML = `<h3>${safety.title}</h3><ul>${safety.points
    .map((p) => `<li>${p}</li>`) .join('')}</ul>`;
  const privacyEl = document.createElement('div');
  privacyEl.innerHTML = `<h3>${privacy.title}</h3><p>${privacy.description}</p>`;
  const lastUpdated = document.createElement('p');
  lastUpdated.innerHTML = `<em>${state.site.lastUpdatedDemo || ''}</em>`;
  container.appendChild(safetyEl);
  container.appendChild(privacyEl);
  container.appendChild(lastUpdated);
}

// Profile
function initProfileForm() {
  // load profile from localStorage
  const saved = localStorage.getItem('profile');
  if (saved) {
    try {
      state.profile = JSON.parse(saved);
    } catch (e) {
      state.profile = {};
    }
  }
  const form = document.getElementById('profile-form');
  // populate fields
  document.getElementById('profile-name').value = state.profile.name || '';
  document.getElementById('profile-age').value = state.profile.age || '';
  document.getElementById('profile-postal').value = state.profile.postal || '';
  document.getElementById('profile-language').value = state.profile.language || 'English';
  document.getElementById('profile-radius').value = state.profile.radius || 10;
  document.getElementById('profile-transport').value = state.profile.transport || 'car';
  document.getElementById('profile-wheelchair').checked = state.profile.mobility?.includes('wheelchair') || false;
  document.getElementById('profile-lowvision').checked = state.profile.mobility?.includes('lowvision') || false;
  // chronic conditions
  form.querySelectorAll('input[name="chronic"]').forEach((el) => {
    el.checked = state.profile.chronic?.includes(el.value) || false;
  });
  document.getElementById('profile-pregnant').checked = state.profile.pregnant || false;
  document.getElementById('profile-pediatric').checked = state.profile.pediatric || false;
  // handlers
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfile(form);
  });
  document.getElementById('reset-profile').addEventListener('click', () => {
    localStorage.removeItem('profile');
    state.profile = {};
    form.reset();
  });
}

function saveProfile(form) {
  const mobility = [];
  if (document.getElementById('profile-wheelchair').checked) mobility.push('wheelchair');
  if (document.getElementById('profile-lowvision').checked) mobility.push('lowvision');
  const chronic = [];
  form.querySelectorAll('input[name="chronic"]:checked').forEach((el) => chronic.push(el.value));
  state.profile = {
    name: document.getElementById('profile-name').value.trim(),
    age: parseInt(document.getElementById('profile-age').value, 10) || '',
    postal: document.getElementById('profile-postal').value.trim().toUpperCase(),
    language: document.getElementById('profile-language').value,
    mobility,
    chronic,
    pregnant: document.getElementById('profile-pregnant').checked,
    pediatric: document.getElementById('profile-pediatric').checked,
    radius: parseInt(document.getElementById('profile-radius').value, 10) || 10,
    transport: document.getElementById('profile-transport').value,
  };
  localStorage.setItem('profile', JSON.stringify(state.profile));
  alert('Profile saved.');
}

// Triage wizard
function initTriage() {
  state.triageData = {};
  state.recommended = null;
  const container = document.getElementById('triage-container');
  container.innerHTML = '';
  state.triageStep = 0;
  const steps = [
    renderTriageStep1,
    renderTriageStep2,
    renderTriageStep3,
    renderTriageStep4,
    renderTriageStep5,
    renderTriageStep6,
  ];
  function renderCurrentStep() {
    container.innerHTML = '';
    steps[state.triageStep](container, proceedNext, proceedBack);
  }
  function proceedNext() {
    if (state.triageStep < steps.length - 1) {
      state.triageStep++;
      renderCurrentStep();
    } else {
      // compute result
      computeRecommendation();
      navigateToPage('results');
      renderResults();
    }
  }
  function proceedBack() {
    if (state.triageStep > 0) {
      state.triageStep--;
      renderCurrentStep();
    } else {
      navigateToPage('home');
    }
  }
  renderCurrentStep();
}

function renderTriageStep1(container, next, back) {
  const step = document.createElement('div');
  step.innerHTML = `<h3>1. What is your main complaint?</h3>`;
  const select = document.createElement('select');
  const options = [
    'Chest pain',
    'Breathing',
    'Fever',
    'Injury',
    'Abdominal pain',
    'Mental health',
    'Pediatrics',
    'Other',
  ];
  options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
  select.value = state.triageData.complaint || options[0];
  select.addEventListener('change', () => {
    state.triageData.complaint = select.value;
  });
  // set initial value
  state.triageData.complaint = select.value;
  step.appendChild(select);
  step.appendChild(navButtons(next, back));
  container.appendChild(step);
}

function renderTriageStep2(container, next, back) {
  const step = document.createElement('div');
  step.innerHTML = `<h3>2. How severe is your symptom? (1 = mild, 10 = severe)</h3>`;
  const range = document.createElement('input');
  range.type = 'range';
  range.min = 1;
  range.max = 10;
  range.value = state.triageData.severity || 5;
  const output = document.createElement('span');
  output.textContent = range.value;
  range.addEventListener('input', () => {
    output.textContent = range.value;
    state.triageData.severity = parseInt(range.value, 10);
  });
  // set initial
  state.triageData.severity = parseInt(range.value, 10);
  step.appendChild(range);
  step.appendChild(output);
  step.appendChild(navButtons(next, back));
  container.appendChild(step);
}

function renderTriageStep3(container, next, back) {
  const step = document.createElement('div');
  step.innerHTML = `<h3>3. Do you have any red flag symptoms?</h3>`;
  const flags = [
    'Severe chest pain',
    'Trouble breathing',
    'Stroke signs',
    'Uncontrolled bleeding',
    'Suicidal intent',
    'Severe allergic reaction',
  ];
  const list = document.createElement('div');
  flags.forEach((flag) => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = flag;
    checkbox.checked = state.triageData.redFlags?.includes(flag) || false;
    checkbox.addEventListener('change', () => {
      if (!state.triageData.redFlags) state.triageData.redFlags = [];
      if (checkbox.checked) {
        state.triageData.redFlags.push(flag);
      } else {
        state.triageData.redFlags = state.triageData.redFlags.filter((f) => f !== flag);
      }
    });
    label.appendChild(checkbox);
    label.append(` ${flag}`);
    list.appendChild(label);
  });
  step.appendChild(list);
  step.appendChild(navButtons(next, back));
  container.appendChild(step);
}

function renderTriageStep4(container, next, back) {
  const step = document.createElement('div');
  step.innerHTML = `<h3>4. How long have you had these symptoms? (hours)</h3>`;
  const input = document.createElement('input');
  input.type = 'number';
  input.min = 0;
  input.placeholder = '0';
  input.value = state.triageData.duration || '';
  input.addEventListener('input', () => {
    state.triageData.duration = parseInt(input.value, 10) || 0;
  });
  step.appendChild(input);
  step.appendChild(navButtons(next, back));
  container.appendChild(step);
}

function renderTriageStep5(container, next, back) {
  const step = document.createElement('div');
  step.innerHTML = `<h3>5. Additional questions</h3>`;
  const feverLabel = document.createElement('label');
  const feverSelect = document.createElement('select');
  ['No', 'Yes'].forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.toLowerCase();
    opt.textContent = v;
    feverSelect.appendChild(opt);
  });
  feverSelect.value = state.triageData.fever || 'no';
  feverSelect.addEventListener('change', () => {
    state.triageData.fever = feverSelect.value;
  });
  feverLabel.textContent = 'Do you have a fever? ';
  feverLabel.appendChild(feverSelect);
  const faintLabel = document.createElement('label');
  const faintSelect = document.createElement('select');
  ['No', 'Yes'].forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.toLowerCase();
    opt.textContent = v;
    faintSelect.appendChild(opt);
  });
  faintSelect.value = state.triageData.fainted || 'no';
  faintSelect.addEventListener('change', () => {
    state.triageData.fainted = faintSelect.value;
  });
  faintLabel.textContent = ' Have you fainted or lost consciousness? ';
  faintLabel.appendChild(faintSelect);
  step.appendChild(feverLabel);
  step.appendChild(document.createElement('br'));
  step.appendChild(faintLabel);
  step.appendChild(navButtons(next, back));
  container.appendChild(step);
  // set initial values
  state.triageData.fever = feverSelect.value;
  state.triageData.fainted = faintSelect.value;
}

function renderTriageStep6(container, next, back) {
  const step = document.createElement('div');
  step.innerHTML = `<h3>6. Preferences / Constraints</h3>`;
  const options = [
    { label: 'Avoid ED if possible', value: 'avoidED' },
    { label: 'Needs imaging', value: 'imaging' },
    { label: 'Needs pediatric care', value: 'pediatric' },
    { label: 'Needs wheelchair access', value: 'wheelchair' },
  ];
  const list = document.createElement('div');
  options.forEach((opt) => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = opt.value;
    checkbox.checked = state.triageData.preferences?.includes(opt.value) || false;
    checkbox.addEventListener('change', () => {
      if (!state.triageData.preferences) state.triageData.preferences = [];
      if (checkbox.checked) {
        state.triageData.preferences.push(opt.value);
      } else {
        state.triageData.preferences = state.triageData.preferences.filter((p) => p !== opt.value);
      }
    });
    label.appendChild(checkbox);
    label.append(` ${opt.label}`);
    list.appendChild(label);
  });
  step.appendChild(list);
  // add summary of selected preferences maybe; not needed
  step.appendChild(navButtons(() => {
    // finalize preferences
    next();
  }, back, true));
  container.appendChild(step);
}

function navButtons(next, back, isLast = false) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-actions';
  const backBtn = document.createElement('button');
  backBtn.className = 'btn secondary';
  backBtn.type = 'button';
  backBtn.textContent = 'Back';
  backBtn.addEventListener('click', back);
  wrapper.appendChild(backBtn);
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn primary';
  nextBtn.type = 'button';
  nextBtn.textContent = isLast ? 'Finish' : 'Next';
  nextBtn.addEventListener('click', next);
  wrapper.appendChild(nextBtn);
  return wrapper;
}

function computeRecommendation() {
  const d = state.triageData;
  // Determine care setting
  let recommended;
  let explanation = '';
  if (d.redFlags && d.redFlags.length > 0) {
    recommended = 'ED';
    explanation = 'You reported red flag symptoms that require emergency care.';
  } else if (d.severity >= 7 || (d.complaint === 'Injury' && d.preferences?.includes('imaging')) || d.complaint === 'Breathing') {
    recommended = 'Urgent';
    explanation = 'Your symptoms indicate a need for urgent care.';
  } else if (d.severity >= 4 || d.fever === 'yes' || d.fainted === 'yes' || d.duration > 24) {
    recommended = 'Walk-in';
    explanation = 'A walk‑in clinic should be able to address your needs.';
  } else if (d.severity >= 2) {
    recommended = 'Virtual';
    explanation = 'Virtual care is appropriate for mild symptoms.';
  } else {
    recommended = 'Self-care';
    explanation = 'Your symptoms seem mild; consider self‑care and monitor your condition.';
  }
  state.recommended = { type: recommended, explanation };
}

function renderResults() {
  const summary = document.getElementById('results-summary');
  summary.innerHTML = '';
  const rec = state.recommended;
  const p = document.createElement('p');
  p.innerHTML = `<strong>Recommended care setting:</strong> ${rec.type}<br/>${rec.explanation}`;
  summary.appendChild(p);
  // Filter and rank facilities
  const ranked = rankFacilities(rec.type);
  renderFacilityFilters();
  renderFacilitiesList(ranked, 'facility-list');
  // update map
  initMap(ranked);
}

function rankFacilities(recommendedType) {
  // Determine user location (approx) from postal code
  const userCoords = getCoordsForPostal(state.profile.postal);
  const radius = state.profile.radius || 10; // km
  const results = state.facilities.map((fac) => {
    const distance = userCoords ? haversine(userCoords.lat, userCoords.lon, fac.lat, fac.lon) : 0;
    let score = fac.waitTime;
    // penalty/bonus based on type match
    if (fac.type === recommendedType) score -= 20;
    else if (recommendedType === 'Self-care') {
      // if self-care, treat virtual as lower
      if (fac.type === 'Virtual') score -= 10;
    } else score += 20;
    // profile adjustments
    if (state.profile.pediatric && fac.capabilities.includes('pediatrics')) score -= 10;
    if (state.profile.mobility?.includes('wheelchair') && fac.capabilities.includes('wheelchair')) score -= 10;
    // Distance penalty
    score += distance * 5;
    // Out of radius penalty
    if (distance > radius) score += 100;
    return { ...fac, distance: distance.toFixed(2), score };
  });
  results.sort((a, b) => a.score - b.score);
  return results;
}

function renderFacilityFilters() {
  const container = document.getElementById('results-filters');
  container.innerHTML = '';
  // Build filters: Type, Open now, Shortest wait, Closest, capabilities
  const typeFilter = document.createElement('select');
  ['All', 'ED', 'Urgent', 'Walk-in', 'Virtual', 'Self-care'].forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    typeFilter.appendChild(opt);
  });
  const sortFilter = document.createElement('select');
  [
    { label: 'Sort by Recommended', value: 'recommended' },
    { label: 'Shortest wait', value: 'wait' },
    { label: 'Closest', value: 'distance' },
  ].forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    sortFilter.appendChild(o);
  });
  const applyBtn = document.createElement('button');
  applyBtn.className = 'btn secondary';
  applyBtn.textContent = 'Apply Filters';
  container.append('Filter by type: ', typeFilter, ' Sort: ', sortFilter, applyBtn);
  applyBtn.addEventListener('click', () => {
    let list = rankFacilities(state.recommended.type);
    const type = typeFilter.value;
    if (type !== 'All' && type !== 'Self-care') {
      list = list.filter((f) => f.type === type);
    }
    const sort = sortFilter.value;
    if (sort === 'wait') list.sort((a, b) => a.waitTime - b.waitTime);
    else if (sort === 'distance') list.sort((a, b) => a.distance - b.distance);
    // else recommended sorts by score already
    renderFacilitiesList(list, 'facility-list');
    initMap(list);
  });
}

function renderFacilitiesList(list, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  list.forEach((fac) => {
    const card = document.createElement('div');
    card.className = 'card facility-card';
    // open/closed indicator based on schedule and current time (simple)
    const now = new Date();
    const [openTime, closeTime] = fac.schedule.split('-');
    let open = true;
    if (openTime && closeTime) {
      const [openH, openM] = openTime.split(':').map((n) => parseInt(n, 10));
      const [closeH, closeM] = closeTime.split(':').map((n) => parseInt(n, 10));
      const openDate = new Date(now);
      openDate.setHours(openH, openM, 0);
      const closeDate = new Date(now);
      closeDate.setHours(closeH, closeM, 0);
      open = now >= openDate && now <= closeDate;
    }
    card.innerHTML = `
      <h3>${fac.name}</h3>
      <p><strong>Type:</strong> ${fac.type}</p>
      <p><strong>Wait time:</strong> ${fac.type === 'ED' ? (fac.waitTime / 60).toFixed(1) + ' hrs' : fac.waitTime + ' min'} <span class="demo-badge">DEMO DATA</span></p>
      <p><strong>Distance:</strong> ${fac.distance || 'N/A'} km</p>
      <p><strong>Status:</strong> <span style="color:${open ? 'green' : 'red'}">${open ? 'Open' : 'Closed'}</span></p>
      <div class="tags">${fac.capabilities
        .map((cap) => `<span class="tag">${cap}</span>`) .join('')}</div>
      <p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        fac.address
      )}" target="_blank">Directions</a> | <a href="#" onclick="alert('Call feature coming soon'); return false;">Call</a> | <a href="#" onclick="alert('Join queue feature coming soon'); return false;">Join Queue</a></p>
    `;
    container.appendChild(card);
  });
}

function renderAllFacilities() {
  const list = state.facilities.map((fac) => ({ ...fac, distance: '–' }));
  renderFacilitiesList(list, 'all-facilities-list');
}

// Map initialization
function initMap(list) {
  const container = document.getElementById('map');
  if (!container) return;
  if (!state.map) {
    state.map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(state.map);
  }
  // Determine user location for center
  const userCoords = getCoordsForPostal(state.profile.postal) || { lat: 43.653, lon: -79.383 };
  state.map.setView([userCoords.lat, userCoords.lon], 12);
  // Remove existing markers
  if (state.markers) {
    state.markers.forEach((m) => state.map.removeLayer(m));
  }
  state.markers = [];
  list.forEach((fac) => {
    const marker = L.marker([fac.lat, fac.lon]);
    marker.bindPopup(`<strong>${fac.name}</strong><br/>${fac.type}<br/>Wait: ${fac.type === 'ED' ? (fac.waitTime / 60).toFixed(1) + ' hrs' : fac.waitTime + ' min'}`);
    marker.addTo(state.map);
    state.markers.push(marker);
  });
}

// Haversine formula to compute distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Map FSA (first 3 letters of postal code) to approximate coordinates
function getCoordsForPostal(postal) {
  if (!postal) return null;
  const fsa = postal.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const map = {
    'M5V': { lat: 43.6426, lon: -79.3871 },
    'M5H': { lat: 43.6535, lon: -79.3837 },
    'M4W': { lat: 43.6720, lon: -79.3810 },
    'M6K': { lat: 43.6390, lon: -79.4170 },
    'M4C': { lat: 43.6950, lon: -79.3070 },
    'M1C': { lat: 43.7850, lon: -79.1890 },
    'M2N': { lat: 43.7700, lon: -79.4120 },
    'M9W': { lat: 43.7060, lon: -79.5940 },
    'M8V': { lat: 43.6070, lon: -79.5090 },
    'M5A': { lat: 43.6540, lon: -79.3620 },
  };
  return map[fsa] || { lat: 43.653, lon: -79.383 };
}

// Demo Admin
function initAdmin() {
  const addBtn = document.getElementById('admin-add');
  const resetBtn = document.getElementById('admin-reset');
  const exportBtn = document.getElementById('admin-export');
  const importBtn = document.getElementById('admin-import');
  const importInput = document.getElementById('admin-import-input');
  addBtn.onclick = addFacilityOverride;
  resetBtn.onclick = () => {
    if (confirm('Reset all overrides?')) {
      state.facilityOverrides = [];
      localStorage.removeItem('facilityOverrides');
      // reload base data
      loadData().then(() => {
        renderAdminList();
        alert('Overrides cleared.');
      });
    }
  };
  exportBtn.onclick = () => {
    const dataStr = JSON.stringify(state.facilityOverrides, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'facility-overrides.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  importBtn.onclick = () => {
    importInput.click();
  };
  importInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        state.facilityOverrides = data;
        localStorage.setItem('facilityOverrides', JSON.stringify(data));
        applyFacilityOverrides();
        renderAdminList();
        alert('Overrides imported.');
      } catch (err) {
        alert('Invalid JSON');
      }
    };
    reader.readAsText(file);
  };
  renderAdminList();
}

function addFacilityOverride() {
  // Determine next id
  const ids = state.facilities.map((f) => f.id);
  const nextId = Math.max(...ids) + 1;
  const newFac = {
    id: nextId,
    name: 'New Facility (Demo)',
    type: 'Walk-in',
    waitTime: 30,
    capabilities: [],
    schedule: '09:00-17:00',
    address: '',
    lat: state.facilities[0]?.lat || 43.65,
    lon: state.facilities[0]?.lon || -79.38,
  };
  state.facilityOverrides.push(newFac);
  localStorage.setItem('facilityOverrides', JSON.stringify(state.facilityOverrides));
  applyFacilityOverrides();
  renderAdminList();
}

function renderAdminList() {
  const container = document.getElementById('admin-list');
  container.innerHTML = '';
  state.facilityOverrides.forEach((fac) => {
    const card = document.createElement('div');
    card.className = 'admin-card card';
    card.innerHTML = `
      <button class="remove-btn" title="Remove">×</button>
      <label>Name <input type="text" class="admin-name" value="${fac.name}"></label>
      <label>Type
        <select class="admin-type">
          <option value="ED" ${fac.type === 'ED' ? 'selected' : ''}>ED</option>
          <option value="Urgent" ${fac.type === 'Urgent' ? 'selected' : ''}>Urgent</option>
          <option value="Walk-in" ${fac.type === 'Walk-in' ? 'selected' : ''}>Walk-in</option>
          <option value="Virtual" ${fac.type === 'Virtual' ? 'selected' : ''}>Virtual</option>
        </select>
      </label>
      <label>Wait Time (min) <input type="number" class="admin-wait" value="${fac.waitTime}"></label>
      <label>Capabilities (comma separated) <input type="text" class="admin-caps" value="${fac.capabilities.join(', ')}"></label>
      <label>Schedule <input type="text" class="admin-schedule" value="${fac.schedule}"></label>
      <label>Address <input type="text" class="admin-address" value="${fac.address}"></label>
      <label>Latitude <input type="number" step="0.0001" class="admin-lat" value="${fac.lat}"></label>
      <label>Longitude <input type="number" step="0.0001" class="admin-lon" value="${fac.lon}"></label>
    `;
    // Remove
    card.querySelector('.remove-btn').addEventListener('click', () => {
      if (confirm('Remove this facility?')) {
        state.facilityOverrides = state.facilityOverrides.filter((f) => f.id !== fac.id);
        localStorage.setItem('facilityOverrides', JSON.stringify(state.facilityOverrides));
        applyFacilityOverrides();
        renderAdminList();
      }
    });
    // Update on change
    const update = () => {
      fac.name = card.querySelector('.admin-name').value;
      fac.type = card.querySelector('.admin-type').value;
      fac.waitTime = parseInt(card.querySelector('.admin-wait').value, 10) || 0;
      fac.capabilities = card.querySelector('.admin-caps').value.split(',').map((s) => s.trim()).filter((s) => s);
      fac.schedule = card.querySelector('.admin-schedule').value;
      fac.address = card.querySelector('.admin-address').value;
      fac.lat = parseFloat(card.querySelector('.admin-lat').value) || fac.lat;
      fac.lon = parseFloat(card.querySelector('.admin-lon').value) || fac.lon;
      localStorage.setItem('facilityOverrides', JSON.stringify(state.facilityOverrides));
      applyFacilityOverrides();
    };
    card.querySelectorAll('input, select').forEach((inp) => {
      inp.addEventListener('change', update);
    });
    container.appendChild(card);
  });
  if (state.facilityOverrides.length === 0) {
    container.innerHTML = '<p>No overrides yet. Use "Add Facility" to add a new entry.</p>';
  }
}

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initNav();
  renderHome();
  initProfileForm();
  // When navigating to triage, init wizard each time
  document.querySelector('a[href="#triage"]').addEventListener('click', () => {
    initTriage();
  });
});