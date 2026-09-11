let DATA={deliveries:[],rents:[]},FILTERED={deliveries:[],rents:[]};
const $=id=>document.getElementById(id);
const brl=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

function parseBRDate(s){const m=String(s||'').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);return m?new Date(+m[3],+m[2]-1,+m[1]):null}
function monthKey(d){return d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`:''}
function isPaid(s){return String(s||'').trim().toLowerCase()==='pago'}
function itemDate(x,t){return parseBRDate(t==='delivery'?x.data:x.vencimento)}
function periodMatch(x,t){
  const mode=$('periodMode').value;if(mode==='all')return true;
  const d=itemDate(x,t);if(!d)return false;
  if(mode==='month'){const v=$('monthFilter').value;return !v||monthKey(d)===v}
  const from=$('fromDate').value?new Date($('fromDate').value+'T00:00:00'):null;
  const to=$('toDate').value?new Date($('toDate').value+'T23:59:59'):null;
  return (!from||d>=from)&&(!to||d<=to);
}
function statusMatch(x){
  const f=$('statusFilter').value;if(f==='all')return true;
  return f==='paid'?isPaid(x.status):!isPaid(x.status);
}
function totals(list){
  const p=list.filter(x=>!isPaid(x.status)),q=list.filter(x=>isPaid(x.status));
  return {pendingValue:p.reduce((s,x)=>s+Number(x.valor||0),0),paidValue:q.reduce((s,x)=>s+Number(x.valor||0),0),pendingCount:p.length,paidCount:q.length};
}
function applyFilters(){
  FILTERED.deliveries=DATA.deliveries.filter(x=>periodMatch(x,'delivery')&&statusMatch(x));
  FILTERED.rents=DATA.rents.filter(x=>periodMatch(x,'rent')&&statusMatch(x));
  render();
}
function render(){
  const dt=totals(FILTERED.deliveries),rt=totals(FILTERED.rents);
  $('deliveryPending').textContent=brl(dt.pendingValue);$('deliveryPaid').textContent=brl(dt.paidValue);
  $('rentPending').textContent=brl(rt.pendingValue);$('rentPaid').textContent=brl(rt.paidValue);
  $('deliveryPendingCount').textContent=`${dt.pendingCount} entrega(s)`;$('deliveryPaidCount').textContent=`${dt.paidCount} entrega(s)`;
  $('rentPendingCount').textContent=`${rt.pendingCount} registro(s)`;$('rentPaidCount').textContent=`${rt.paidCount} registro(s)`;
  $('deliveryCount').textContent=`${FILTERED.deliveries.length} registro(s)`;$('rentCount').textContent=`${FILTERED.rents.length} registro(s)`;

  $('deliveryBody').innerHTML=FILTERED.deliveries.length?FILTERED.deliveries.map(x=>`<tr><td>#${esc(x.pedido)}</td><td>${esc(x.data||'—')}</td><td>${esc(x.cliente||'—')}</td><td>${esc(x.produto||'—')}</td><td>${esc(x.responsavelEntrega||'—')}</td><td class="money">${brl(x.valor)}</td><td class="${isPaid(x.status)?'paid':'pending'}">${esc(x.status||'Pendente')}</td><td>${esc(x.dataPagamento||'—')}</td><td>${x.fontePagamento?`<span class="tag">${esc(x.fontePagamento)}</span>`:'—'}</td></tr>`).join(''):'<tr><td colspan="9" class="muted">Nenhuma entrega para o filtro selecionado.</td></tr>';
  $('rentBody').innerHTML=FILTERED.rents.length?FILTERED.rents.map(x=>`<tr><td>${esc(x.competencia||'—')}</td><td>${esc(x.vencimento||'—')}</td><td class="money">${brl(x.valor)}</td><td class="${isPaid(x.status)?'paid':'pending'}">${esc(x.status||'Pendente')}</td><td>${x.fontePagamento?`<span class="tag">${esc(x.fontePagamento)}</span>`:'—'}</td><td>${esc(x.dataPagamento||'—')}</td><td>${esc(x.responsavel||'—')}</td></tr>`).join(''):'<tr><td colspan="7" class="muted">Nenhum aluguel para o filtro selecionado.</td></tr>';
}
async function loadDashboard(){
  $('refreshBtn').disabled=true;$('refreshBtn').textContent='Carregando...';
  try{
    const r=await fetch('/api/dashboard',{credentials:'same-origin'});
    if(r.status===401)return showLogin();
    const d=await r.json();if(!r.ok)throw new Error(d.detail||d.error||'Erro ao carregar.');
    DATA=d;$('updatedAt').textContent='Atualizado '+new Date(d.updatedAt).toLocaleString('pt-BR');applyFilters();
  }catch(e){alert('Erro: '+e.message)}
  finally{$('refreshBtn').disabled=false;$('refreshBtn').textContent='Atualizar'}
}
function setDefaultMonth(){const d=new Date();$('monthFilter').value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function updatePeriodFields(){const m=$('periodMode').value;$('monthField').classList.toggle('hidden',m!=='month');$('fromField').classList.toggle('hidden',m!=='custom');$('toField').classList.toggle('hidden',m!=='custom');applyFilters()}
function selectedPeriodText(){const m=$('periodMode').value;if(m==='all')return'Todos os registros';if(m==='month'){const v=$('monthFilter').value;if(!v)return'Mês não informado';const [y,mo]=v.split('-');return`${mo}/${y}`}return`${$('fromDate').value||'início'} até ${$('toDate').value||'hoje'}`}
function openSummary(){const dt=totals(FILTERED.deliveries),rt=totals(FILTERED.rents);$('summaryPeriod').textContent=selectedPeriodText()+' • '+$('statusFilter').selectedOptions[0].text;$('sDeliveryPending').textContent=brl(dt.pendingValue);$('sDeliveryPaid').textContent=brl(dt.paidValue);$('sRentPending').textContent=brl(rt.pendingValue);$('sRentPaid').textContent=brl(rt.paidValue);$('sPendingTotal').textContent=brl(dt.pendingValue+rt.pendingValue);$('sPaidTotal').textContent=brl(dt.paidValue+rt.paidValue);$('summaryModal').classList.remove('hidden')}
async function checkAuth(){try{const r=await fetch('/api/me',{credentials:'same-origin'});if(!r.ok)return showLogin();showApp();setDefaultMonth();loadDashboard()}catch{showLogin()}}
function showLogin(){$('loginScreen').classList.remove('hidden');$('appScreen').classList.add('hidden')}
function showApp(){$('loginScreen').classList.add('hidden');$('appScreen').classList.remove('hidden')}

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();

  const errorEl = $('loginError');
  const button = e.currentTarget.querySelector('button[type="submit"]');
  errorEl.textContent = 'Verificando acesso...';
  button.disabled = true;
  button.textContent = 'Entrando...';

  try {
    const r = await fetch('/api/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials:'same-origin',
      body:JSON.stringify({
        username:$('username').value.trim(),
        password:$('password').value
      })
    });

    let d = {};
    try { d = await r.json(); } catch {}

    if (!r.ok) {
      throw new Error(d.error || `Falha no login (HTTP ${r.status}).`);
    }

    errorEl.textContent = '';
    showApp();
    setDefaultMonth();
    await loadDashboard();
  } catch (err) {
    errorEl.textContent = err.message || 'Não foi possível entrar.';
  } finally {
    button.disabled = false;
    button.textContent = 'Entrar';
  }
});
$('logoutBtn').addEventListener('click',async()=>{await fetch('/api/logout',{method:'POST',credentials:'same-origin'});showLogin()});
$('refreshBtn').addEventListener('click',loadDashboard);$('periodMode').addEventListener('change',updatePeriodFields);$('monthFilter').addEventListener('change',applyFilters);$('fromDate').addEventListener('change',applyFilters);$('toDate').addEventListener('change',applyFilters);$('statusFilter').addEventListener('change',applyFilters);$('summaryBtn').addEventListener('click',openSummary);$('closeSummary').addEventListener('click',()=>$('summaryModal').classList.add('hidden'));$('summaryModal').addEventListener('click',e=>{if(e.target===$('summaryModal'))$('summaryModal').classList.add('hidden')});
checkAuth();
