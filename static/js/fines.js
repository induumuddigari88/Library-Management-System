/* fines.js */

const BASE = 'http://127.0.0.1:5000';
let currentFilter = 'all';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const str = String(dateStr);
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(isoMatch[3])} ${months[parseInt(isoMatch[2]) - 1]} ${isoMatch[1]}`;
  }
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

async function loadFines() {
  const url = currentFilter === 'unpaid' ? `${BASE}/fines/unpaid` : `${BASE}/fines`;
  try {
    const res  = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      showToast(`Failed to load fines: ${res.status}`, 'error');
      return;
    }
    const data = await res.json();
    renderFines(data.fines || []);
    loadCollected();
  } catch (err) {
    console.error('loadFines error:', err);
    showToast('Error loading fines', 'error');
  }
}

async function loadCollected() {
  try {
    const res  = await fetch(`${BASE}/fines/collected`, { credentials: 'include' });
    const data = await res.json();
    document.getElementById('total-collected').textContent = `₹${data.total_collected || 0}`;
  } catch (err) {
    console.error('loadCollected error:', err);
  }
}

function renderFines(fines) {
  const tbody = document.getElementById('fines-tbody');
  if (!fines.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading-row">No fines found</td></tr>`;
    return;
  }
  tbody.innerHTML = fines.map((f, i) => {
    const isPaid = f.is_paid == 1 || f.is_paid === true;
    return `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${f.member_name}</strong><br><span style="color:var(--text-muted);font-size:12px">${f.member_email}</span></td>
      <td>${f.book_title}</td>
      <td style="font-weight:600;color:var(--accent)">₹${f.amount}</td>
      <td>
        <span class="badge ${isPaid ? 'badge-success' : 'badge-danger'}">
          ${isPaid ? 'Paid' : 'Unpaid'}
        </span>
      </td>
      <td>${formatDate(f.paid_on)}</td>
      <td>
        ${!isPaid
          ? `<button class="btn-icon btn-icon-pay" onclick="payFine(${f.fine_id})" title="Mark as Paid"><i class="fa-solid fa-check"></i></button>`
          : `<span style="color:var(--text-muted);font-size:12px">—</span>`
        }
      </td>
    </tr>
  `}).join('');
}

function filterFines(filter) {
  currentFilter = filter;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${filter}`).classList.add('active');
  loadFines();
}

async function payFine(fine_id) {
  const res  = await fetch(`${BASE}/fines/${fine_id}/pay`, { method: 'POST', credentials: 'include' });
  const data = await res.json();
  if (res.ok) { showToast(data.message); loadFines(); }
  else showToast(data.message, 'error');
}

loadFines();