// ====== Configurações ======
const API_KEY = ''; // Coloque sua API key se tiver (ExchangeRate API)
const BASE_URL = API_KEY
  ? `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
  : 'https://open.er-api.com/v6/latest/USD';
const BTC_URL = 'https://api.exchangerate.host/convert?from=BTC&to=BRL';
const BRL_FORMAT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// ====== Estado ======
let lastRates = null;
let btcHistory = [];
let timeLabels = [];

// ====== DOM ======
const usdEl = document.getElementById('usd');
const eurEl = document.getElementById('eur');
const btcEl = document.getElementById('btc');
const lastUpdatedEl = document.getElementById('last-updated');
const refreshBtn = document.getElementById('refresh');
const loadingEl = document.getElementById('loading');
const errorMsgEl = document.getElementById('error-msg');

// ====== Funções API ======
async function getExchangeRates() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Falha na API de moedas');
  const data = await res.json();
  if (!data.rates) throw new Error('Resposta inválida da API');
  return data.rates;
}

async function getBTCtoBRL() {
  const res = await fetch(BTC_URL);
  if (!res.ok) throw new Error('Falha na API BTC');
  const data = await res.json();
  if (!data.result) throw new Error('Resposta inválida BTC');
  return data.result;
}

// ====== Funções UI ======
function showLoading(show) {
  loadingEl.classList.toggle('d-none', !show);
}
function showError(show) {
  errorMsgEl.classList.toggle('d-none', !show);
}
function updateUI(rates, btcPrice) {
  usdEl.textContent = BRL_FORMAT.format(rates.BRL);
  eurEl.textContent = BRL_FORMAT.format(rates.BRL / rates.EUR);
  btcEl.textContent = BRL_FORMAT.format(btcPrice);
  lastUpdatedEl.textContent = new Date().toLocaleString('pt-BR');

  // Atualiza gráfico
  const now = new Date().toLocaleTimeString('pt-BR');
  btcHistory.push(btcPrice);
  timeLabels.push(now);
  if (btcHistory.length > 10) {
    btcHistory.shift();
    timeLabels.shift();
  }
  btcChart.update();
}

// ====== Fluxo principal ======
async function updateAll() {
  showLoading(true);
  showError(false);
  try {
    const rates = await getExchangeRates();
    const btcPrice = await getBTCtoBRL();
    lastRates = rates;
    updateUI(rates, btcPrice);
  } catch (err) {
    console.error(err);
    showError(true);
  } finally {
    showLoading(false);
  }
}

// ====== Conversor ======
document.getElementById('convert').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('amount').value);
  if (isNaN(amount) || !lastRates) {
    document.getElementById('conversion-result').textContent = 'Digite um valor válido e atualize as taxas.';
    return;
  }
  const usdValue = amount / lastRates.BRL;
  document.getElementById('conversion-result').textContent = 
    `${amount} BRL = ${usdValue.toFixed(2)} USD`;
});

// ====== Gráfico BTC ======
const ctx = document.getElementById('btcChart').getContext('2d');
const btcChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'BTC → BRL',
      data: btcHistory,
      borderColor: 'rgb(13, 110, 253)',
      backgroundColor: 'rgba(13, 110, 253, 0.2)',
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

// ====== Eventos ======
refreshBtn.addEventListener('click', updateAll);

// ====== Inicialização ======
updateAll();
