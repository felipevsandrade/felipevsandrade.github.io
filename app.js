// ===================== CONFIG ===================== //
const API_KEY = ''; // se tiver, insira aqui. Se não, usa open.er-api.com
const BASE_URL = API_KEY
  ? `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
  : 'https://open.er-api.com/v6/latest/USD';
const BTC_URL = 'https://api.exchangerate.host/convert?from=BTC&to=BRL';

const BRL_FORMAT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Histórico BTC para gráfico
let btcHistory = [];
let timeLabels = [];

// Referências DOM
const usdEl = document.getElementById('usd');
const eurEl = document.getElementById('eur');
const btcEl = document.getElementById('btc');
const lastUpdatedEl = document.getElementById('last-updated');
const refreshBtn = document.getElementById('refresh');

// ===================== FUNÇÕES ===================== //
async function fetchFiatRates() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
  const data = await res.json();
  if (!data.rates) throw new Error('Sem dados da API');
  return data.rates; // USD base
}

async function fetchBTCtoBRL() {
  const res = await fetch(BTC_URL);
  if (!res.ok) throw new Error('Erro ao buscar BTC');
  const data = await res.json();
  if (!data.result) throw new Error('Sem dados BTC');
  return data.result;
}

async function updateAll() {
  try {
    const rates = await fetchFiatRates();
    const usdbrl = rates.BRL;
    const eurbrl = rates.BRL / rates.EUR;

    usdEl.textContent = BRL_FORMAT.format(usdbrl);
    eurEl.textContent = BRL_FORMAT.format(eurbrl);

    const btcbrl = await fetchBTCtoBRL();
    btcEl.textContent = BRL_FORMAT.format(btcbrl);

    // Atualiza histórico para gráfico
    const now = new Date().toLocaleTimeString('pt-BR');
    btcHistory.push(btcbrl);
    timeLabels.push(now);
    if (btcHistory.length > 10) {
      btcHistory.shift();
      timeLabels.shift();
    }
    btcChart.update();

    // Data/hora da última atualização
    lastUpdatedEl.textContent = new Date().toLocaleString('pt-BR');
  } catch (err) {
    alert('Erro ao atualizar: ' + err.message);
  }
}

// ===================== EVENTOS ===================== //
refreshBtn.addEventListener('click', updateAll);

// ===================== GRÁFICO BTC ===================== //
const ctx = document.getElementById('btcChart').getContext('2d');
const btcChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'BTC → BRL',
      data: btcHistory,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: true,
      tension: 0.2
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: false }
    }
  }
});

// Primeira atualização ao carregar
updateAll();
