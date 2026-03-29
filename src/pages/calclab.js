// ─── STATE ───────────────────────────────────────────
let state = {
  inputCount: 1,
  outputCount: 1,
  editingId: null
};

const STORE_KEY = 'calclab_calculators';

function getCalcs() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function saveCalcs(arr) { localStorage.setItem(STORE_KEY, JSON.stringify(arr)); }

// ─── NAVIGATION ──────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn[id^=nav-]').forEach(b => b.classList.remove('active'));
  const nb = document.getElementById('nav-' + name);
  if (nb) nb.classList.add('active');
  if (name === 'dashboard') renderDashboard();
  if (name === 'builder') renderBuilder();
}

// ─── DASHBOARD ───────────────────────────────────────
function renderDashboard() {
  const calcs = getCalcs();
  const query = (document.getElementById('search-input')?.value || '').toLowerCase();
  const filtered = query
    ? calcs.filter(c => c.name.toLowerCase().includes(query) || (c.desc || '').toLowerCase().includes(query))
    : calcs;

  document.getElementById('calc-count').textContent =
    `${filtered.length} calculadora${filtered.length !== 1 ? 's' : ''}`;
  const grid = document.getElementById('calcs-grid');

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">⊞</div>
        <h3>${query ? 'Sin resultados' : 'Sin calculadoras'}</h3>
        <p>${query
          ? `No hay calculadoras que coincidan con "${query}".`
          : 'Crea tu primera calculadora con el botón de arriba.'}</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(c => {
    const ins  = c.inputs?.length  || 0;
    const outs = c.outputs?.length || 0;
    const date = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('es-ES') : '';
    return `
    <div class="calc-card" onclick="runCalculator('${c.id}')">
      <div class="calc-card-header">
        <div class="calc-card-name">${esc(c.name)}</div>
        <div class="calc-card-actions" onclick="event.stopPropagation()">
          <button class="icon-btn" title="Editar"    onclick="editCalculator('${c.id}')">✎</button>
          <button class="icon-btn danger" title="Eliminar" onclick="confirmDelete('${c.id}')">✕</button>
        </div>
      </div>
      <div class="calc-card-desc">${esc(c.desc || 'Sin descripción.')}</div>
      <div class="calc-card-meta">
        <span class="meta-tag in">${ins}  entrada${ins  !== 1 ? 's' : ''}</span>
        <span class="meta-tag out">${outs} salida${outs !== 1 ? 's' : ''}</span>
      </div>
      ${date ? `<div class="calc-card-date">Actualizada: ${date}</div>` : ''}
    </div>`;
  }).join('');
}

// ─── BUILDER ─────────────────────────────────────────
function newCalculator() {
  state.editingId = null;
  state.inputCount  = 1;
  state.outputCount = 1;
  document.getElementById('calc-name').value = '';
  document.getElementById('calc-desc').value = '';
  document.getElementById('delete-btn').style.display = 'none';
  showPage('builder');
}

function editCalculator(id) {
  const calc = getCalcs().find(c => c.id === id);
  if (!calc) return;
  state.editingId   = id;
  state.inputCount  = calc.inputs.length;
  state.outputCount = calc.outputs.length;
  document.getElementById('calc-name').value = calc.name;
  document.getElementById('calc-desc').value = calc.desc || '';
  document.getElementById('delete-btn').style.display = 'block';
  showPage('builder');

  // Fill in data after render
  setTimeout(() => {
    calc.inputs.forEach((inp, i) => {
      setVal(`in-name-${i}`,    inp.name);
      setVal(`in-type-${i}`,    inp.type);
      setVal(`in-unit-${i}`,    inp.unit);
      setVal(`in-default-${i}`, inp.defaultValue || '');
      const cb = document.getElementById(`in-const-${i}`);
      if (cb) cb.checked = !!inp.constant;
    });
    calc.outputs.forEach((out, i) => {
      setVal(`out-name-${i}`,     out.name);
      setVal(`out-unit-${i}`,     out.unit);
      setVal(`out-formula-${i}`,  out.formula);
      setVal(`out-decimals-${i}`, out.decimals ?? 2);
    });
  }, 50);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function changeCount(type, delta) {
  if (type === 'inputs') {
    state.inputCount  = Math.max(1, Math.min(10, state.inputCount  + delta));
    document.getElementById('inputs-count').textContent  = state.inputCount;
  } else {
    state.outputCount = Math.max(1, Math.min(8,  state.outputCount + delta));
    document.getElementById('outputs-count').textContent = state.outputCount;
  }
  renderBuilder();
}

function renderBuilder() {
  document.getElementById('inputs-count').textContent  = state.inputCount;
  document.getElementById('outputs-count').textContent = state.outputCount;
  renderInputFields();
  renderOutputFields();
}

function renderInputFields() {
  const cont = document.getElementById('input-fields');
  let html = '';
  for (let i = 0; i < state.inputCount; i++) {
    html += `
    <div class="field-card input-card" id="incard-${i}">
      <div class="field-card-header">
        <span class="field-card-index">#${i + 1}</span>
        <span class="field-card-type-badge badge-input">ENTRADA</span>
        <span class="field-card-name-preview" id="in-preview-${i}">Campo ${i + 1}</span>
      </div>
      <div class="field-card-body">
        <div>
          <label class="field-label">Nombre del campo *</label>
          <input class="field-input" id="in-name-${i}" placeholder="ej. Temperatura" oninput="updatePreview(${i})">
        </div>
        <div>
          <label class="field-label">Tipo de dato</label>
          <select class="field-select" id="in-type-${i}">
            <option value="number">Número entero</option>
            <option value="decimal">Número decimal</option>
            <option value="text">Texto</option>
          </select>
        </div>
        <div>
          <label class="field-label">Unidad (opcional)</label>
          <input class="field-input" id="in-unit-${i}" placeholder="ej. °C, kg, m/s">
        </div>
        <div>
          <label class="field-label">Valor por defecto</label>
          <input class="field-input" id="in-default-${i}" placeholder="ej. 0">
        </div>
        <div class="full">
          <label class="checkbox-row">
            <input type="checkbox" id="in-const-${i}" onchange="toggleConst(${i})">
            <span>Campo constante (no editable por el usuario)</span>
          </label>
        </div>
      </div>
    </div>`;
  }
  cont.innerHTML = html;
}

function renderOutputFields() {
  const inputNames = [];
  for (let i = 0; i < state.inputCount; i++) {
    const n = document.getElementById(`in-name-${i}`)?.value || `campo${i + 1}`;
    inputNames.push({ label: n || `campo${i + 1}`, var: varName(n || `campo${i + 1}`) });
  }

  const cont = document.getElementById('output-fields');
  let html = '';
  for (let i = 0; i < state.outputCount; i++) {
    const chips = inputNames.map(v =>
      `<span class="formula-var-chip" onclick="insertVar(${i},'${v.var}')" title="${v.label}">${v.var}</span>`
    ).join('');
    html += `
    <div class="field-card output-card">
      <div class="field-card-header">
        <span class="field-card-index">#${i + 1}</span>
        <span class="field-card-type-badge badge-output">SALIDA</span>
        <span class="field-card-name-preview" id="out-preview-${i}">Resultado ${i + 1}</span>
      </div>
      <div class="field-card-body">
        <div>
          <label class="field-label">Nombre del resultado *</label>
          <input class="field-input" id="out-name-${i}" placeholder="ej. Temperatura en °F" oninput="updateOutPreview(${i})">
        </div>
        <div>
          <label class="field-label">Unidad de salida</label>
          <input class="field-input" id="out-unit-${i}" placeholder="ej. °F">
        </div>
        <div>
          <label class="field-label">Decimales en resultado</label>
          <select class="field-select" id="out-decimals-${i}">
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2" selected>2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="6">6</option>
          </select>
        </div>
        <div class="full">
          <label class="field-label">Fórmula de cálculo *</label>
          <div class="formula-editor">
            <div class="formula-vars">${chips}</div>
            <textarea class="formula-input" id="out-formula-${i}" placeholder="ej. (temperatura * 9/5) + 32" rows="3"></textarea>
            <div class="formula-hint">
              Variables disponibles: ${inputNames.map(v => `<b style="color:var(--blue)">${v.var}</b>`).join(', ')}
              — Usa operadores JS estándar: + − * / ** Math.sqrt() Math.round() etc.
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
  cont.innerHTML = html;
}

function updatePreview(i) {
  const n  = document.getElementById(`in-name-${i}`)?.value;
  const el = document.getElementById(`in-preview-${i}`);
  if (el) el.textContent = n || `Campo ${i + 1}`;
  renderOutputFields(); // refresh var chips
}

function updateOutPreview(i) {
  const n  = document.getElementById(`out-name-${i}`)?.value;
  const el = document.getElementById(`out-preview-${i}`);
  if (el) el.textContent = n || `Resultado ${i + 1}`;
}

function toggleConst(i) {
  const cb   = document.getElementById(`in-const-${i}`);
  const card = document.getElementById(`incard-${i}`);
  if (!card) return;
  card.classList.toggle('const-card', !!cb?.checked);
  card.classList.toggle('input-card', !cb?.checked);
  const badge = card.querySelector('.field-card-type-badge');
  if (badge) {
    badge.className   = 'field-card-type-badge ' + (cb?.checked ? 'badge-const' : 'badge-input');
    badge.textContent = cb?.checked ? 'CONSTANTE' : 'ENTRADA';
  }
}

function insertVar(outIdx, varN) {
  const ta = document.getElementById(`out-formula-${outIdx}`);
  if (!ta) return;
  const pos  = ta.selectionStart;
  ta.value   = ta.value.slice(0, pos) + varN + ta.value.slice(ta.selectionEnd);
  ta.focus();
  ta.selectionStart = ta.selectionEnd = pos + varN.length;
}

function varName(name) {
  return name.trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'campo';
}

// ─── SAVE ─────────────────────────────────────────────
function saveCalculator() {
  const name = document.getElementById('calc-name').value.trim();
  if (!name) { toast('El nombre es obligatorio', 'error'); return; }

  const inputs = [];
  for (let i = 0; i < state.inputCount; i++) {
    const n = document.getElementById(`in-name-${i}`)?.value.trim();
    if (!n) { toast(`Nombre de entrada #${i + 1} es obligatorio`, 'error'); return; }
    inputs.push({
      name:         n,
      type:         document.getElementById(`in-type-${i}`)?.value    || 'number',
      unit:         document.getElementById(`in-unit-${i}`)?.value.trim()    || '',
      defaultValue: document.getElementById(`in-default-${i}`)?.value.trim() || '',
      constant:     !!document.getElementById(`in-const-${i}`)?.checked,
      varName:      varName(n)
    });
  }

  const outputs = [];
  for (let i = 0; i < state.outputCount; i++) {
    const n = document.getElementById(`out-name-${i}`)?.value.trim();
    const f = document.getElementById(`out-formula-${i}`)?.value.trim();
    if (!n) { toast(`Nombre de salida #${i + 1} es obligatorio`, 'error'); return; }
    if (!f) { toast(`Fórmula de salida #${i + 1} es obligatoria`,  'error'); return; }
    outputs.push({
      name:     n,
      unit:     document.getElementById(`out-unit-${i}`)?.value.trim()  || '',
      formula:  f,
      decimals: parseInt(document.getElementById(`out-decimals-${i}`)?.value) || 2
    });
  }

  const calcs = getCalcs();
  if (state.editingId) {
    const idx = calcs.findIndex(c => c.id === state.editingId);
    if (idx >= 0) {
      calcs[idx] = {
        ...calcs[idx],
        name,
        desc: document.getElementById('calc-desc').value.trim(),
        inputs,
        outputs,
        updatedAt: Date.now()
      };
    }
    toast('Calculadora actualizada ✓', 'success');
  } else {
    calcs.push({
      id:        'calc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name,
      desc:      document.getElementById('calc-desc').value.trim(),
      inputs,
      outputs,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    toast('Calculadora creada ✓', 'success');
  }
  saveCalcs(calcs);
  showPage('dashboard');
}

// ─── DELETE ───────────────────────────────────────────
let _deleteId = null;

function confirmDelete(id) {
  _deleteId = id;
  const calc = getCalcs().find(c => c.id === id);
  document.getElementById('modal-title').textContent   = 'Eliminar calculadora';
  document.getElementById('modal-body').textContent    = `¿Eliminar "${calc?.name}"? Esta acción no se puede deshacer.`;
  document.getElementById('modal-confirm').onclick     = () => { doDelete(_deleteId); closeModal(); };
  document.getElementById('modal').classList.add('open');
}

function deleteCurrentCalc() {
  if (!state.editingId) return;
  confirmDelete(state.editingId);
}

function doDelete(id) {
  saveCalcs(getCalcs().filter(c => c.id !== id));
  toast('Calculadora eliminada', 'error');
  showPage('dashboard');
}

function closeModal() { document.getElementById('modal').classList.remove('open'); }

// ─── RUNNER ───────────────────────────────────────────
function runCalculator(id) {
  const calc = getCalcs().find(c => c.id === id);
  if (!calc) return;

  document.getElementById('runner-title').textContent = calc.name;
  document.getElementById('runner-desc').textContent  = calc.desc || '';

  document.getElementById('runner-inputs').innerHTML = calc.inputs.map((inp, i) => {
    const inputType = inp.type === 'text' ? 'text' : 'number';
    const step      = inp.type === 'decimal' ? 'any' : inp.type === 'number' ? '1' : '';
    return `
    <div class="runner-field ${inp.constant ? 'const-field' : ''}">
      <div class="runner-field-label">
        ${esc(inp.name)}
        <small>${inp.constant ? 'CONSTANTE' : inp.type.toUpperCase()}</small>
      </div>
      <input
        class="runner-field-input"
        id="run-in-${i}"
        type="${inputType}"
        ${step ? `step="${step}"` : ''}
        value="${esc(inp.defaultValue || '')}"
        ${inp.constant ? 'disabled' : ''}
        placeholder="Introduce ${esc(inp.name).toLowerCase()}..."
      >
      <span class="runner-field-unit">${esc(inp.unit)}</span>
    </div>`;
  }).join('');

  document.getElementById('runner-outputs').innerHTML = calc.outputs.map((out, i) => `
    <div class="runner-output" id="run-out-${i}">
      <div class="runner-output-label">${esc(out.name)}</div>
      <div>
        <span class="runner-output-value" id="run-out-val-${i}">—</span>
        <span class="runner-output-unit">${esc(out.unit)}</span>
      </div>
    </div>`).join('');

  document.getElementById('runner-out-label').style.display = 'none';
  window._runningCalc = calc;
  showPage('runner');
}

function calculate() {
  const calc = window._runningCalc;
  if (!calc) return;

  const vars = {};
  let hasError = false;

  calc.inputs.forEach((inp, i) => {
    const el = document.getElementById(`run-in-${i}`);
    if (!el) return;
    let val = el.value;
    if (inp.type === 'number')  val = parseInt(val);
    if (inp.type === 'decimal') val = parseFloat(val);
    if (inp.type !== 'text' && isNaN(val)) {
      toast(`"${inp.name}" necesita un valor numérico`, 'error');
      hasError = true;
    }
    vars[inp.varName] = val;
  });
  if (hasError) return;

  document.getElementById('runner-out-label').style.display = 'flex';

  calc.outputs.forEach((out, i) => {
    const el    = document.getElementById(`run-out-${i}`);
    const valEl = document.getElementById(`run-out-val-${i}`);
    el.classList.remove('visible');

    try {
      const fn     = new Function(...Object.keys(vars), `"use strict"; return (${out.formula});`);
      const result = fn(...Object.values(vars));
      if (typeof result === 'number' && isNaN(result)) throw new Error('NaN');
      valEl.className   = 'runner-output-value';
      valEl.textContent = typeof result === 'number' ? result.toFixed(out.decimals) : result;
    } catch {
      valEl.className   = 'runner-output-value runner-output-error';
      valEl.textContent = 'Error en fórmula';
    }

    setTimeout(() => el.classList.add('visible'), i * 80);
  });
}

// ─── UTILS ────────────────────────────────────────────
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toast(msg, type = '') {
  const t = document.createElement('div');
  t.className   = 'toast-msg ' + type;
  t.textContent = msg;
  document.getElementById('toast').appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ─── INIT ─────────────────────────────────────────────
renderDashboard();
renderBuilder();

if (!getCalcs().length) {
  saveCalcs([{
    id:   'calc_sample_001',
    name: 'Conversión de Temperatura',
    desc: 'Convierte grados Celsius a Fahrenheit y Kelvin.',
    inputs: [
      { name: 'Temperatura', type: 'decimal', unit: '°C', defaultValue: '0', constant: false, varName: 'temperatura' }
    ],
    outputs: [
      { name: 'Fahrenheit', unit: '°F', formula: '(temperatura * 9/5) + 32', decimals: 2 },
      { name: 'Kelvin',     unit: 'K',  formula: 'temperatura + 273.15',      decimals: 2 }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }]);
  renderDashboard();
}
