const $ = id => document.getElementById(id);

const tickerInput = $(“ticker”);
const status = $(“status”);
const result = $(“result”);

const companyNames = {
AAPL: “Apple Inc.”,
MSFT: “Microsoft Corp.”,
NVDA: “NVIDIA Corp.”,
TSLA: “Tesla Inc.”,
AMZN: “Amazon.com Inc.”,
GOOGL: “Alphabet Inc.”,
META: “Meta Platforms Inc.”,
AMD: “Advanced Micro Devices”,
NFLX: “Netflix Inc.”
};

$(“analyze”).onclick = () => {
analyzeStock(tickerInput.value);
};

tickerInput.addEventListener(“keydown”, event => {
if (event.key === “Enter”) {
analyzeStock(tickerInput.value);
}
});

function calculateSMA(values, period) {

if (values.length < period) {
return null;
}

const recent = values.slice(-period);

return recent.reduce(
(sum, value) => sum + value,
0
) / period;
}

function calculateRSI(values, period = 14) {

if (values.length <= period) {
return null;
}

let gains = 0;
let losses = 0;

for (
let i = values.length - period;
i < values.length;
i++
) {

const difference =
  values[i] - values[i - 1];
if (difference >= 0) {
  gains += difference;
} else {
  losses -= difference;
}

}

if (losses === 0) {
return 100;
}

const averageGain = gains / period;
const averageLoss = losses / period;

const relativeStrength =
averageGain / averageLoss;

return 100 -
(100 / (1 + relativeStrength));
}

function formatNumber(value) {

if (value === null || value === undefined) {
return “–”;
}

return Number(value).toFixed(2);
}

function drawChart(values) {

const canvas = $(“chart”);

const width = canvas.clientWidth;
const height = 220;
const ratio = window.devicePixelRatio || 1;

canvas.width = width * ratio;
canvas.height = height * ratio;

const ctx = canvas.getContext(“2d”);

ctx.scale(ratio, ratio);

const minimum = Math.min(…values);
const maximum = Math.max(…values);

const range =
maximum - minimum || 1;

ctx.beginPath();

values.forEach((value, index) => {

const x =
  index *
  (width - 8) /
  (values.length - 1) + 4;
const y =
  height -
  12 -
  ((value - minimum) / range) *
  (height - 24);
if (index === 0) {
  ctx.moveTo(x, y);
} else {
  ctx.lineTo(x, y);
}

});

ctx.lineWidth = 3;
ctx.strokeStyle = “#111827”;
ctx.stroke();
}

async function analyzeStock(ticker) {

ticker = ticker
.trim()
.toUpperCase()
.replace(/[^A-Z0-9.=-]/g, “”);

if (!ticker) {
return;
}

status.textContent =
“正在获取市场数据…”;

result.classList.add(“hidden”);

try {

const now =
  Math.floor(Date.now() / 1000);
const start =
  now - 60 * 60 * 24 * 180;
const api =
  "https://query1.finance.yahoo.com/v8/finance/chart/" +
  encodeURIComponent(ticker) +
  "?period1=" +
  start +
  "&period2=" +
  now +
  "&interval=1d&events=history";
const response =
  await fetch(api);
if (!response.ok) {
  throw new Error(
    "行情接口返回错误"
  );
}
const data =
  await response.json();
const stock =
  data.chart.result?.[0];
if (!stock) {
  throw new Error(
    "找不到该股票"
  );
}
const quote =
  stock.indicators.quote[0];
const closes =
  quote.close.filter(
    Number.isFinite
  );
if (closes.length < 20) {
  throw new Error(
    "有效历史数据不足"
  );
}
const metadata =
  stock.meta;
const price =
  closes.at(-1);
const previous =
  closes.at(-2);
const difference =
  price - previous;
const percentage =
  difference /
  previous *
  100;
const sma20 =
  calculateSMA(closes, 20);
const sma50 =
  calculateSMA(closes, 50);
const rsi =
  calculateRSI(closes, 14);
$("name").textContent =
  companyNames[ticker] ||
  metadata.longName ||
  ticker;
$("symbol").textContent =
  ticker;
$("price").textContent =
  formatNumber(price) +
  " " +
  (metadata.currency || "USD");
$("change").textContent =
  (difference >= 0 ? "+" : "") +
  formatNumber(difference) +
  " (" +
  (percentage >= 0 ? "+" : "") +
  formatNumber(percentage) +
  "%)";
$("change").style.color =
  difference >= 0
    ? "#087f3f"
    : "#c62828";
$("rsi").textContent =
  formatNumber(rsi);
$("sma20").textContent =
  formatNumber(sma20);
$("sma50").textContent =
  formatNumber(sma50);
$("points").textContent =
  closes.length;
let score = 0;
if (sma20 && price > sma20) {
  score++;
} else {
  score--;
}
if (sma50 && price > sma50) {
  score++;
} else {
  score--;
}
if (rsi > 50) {
  score++;
} else if (rsi < 40) {
  score--;
}
let signal;
if (score >= 2) {
  signal = "偏强";
} else if (score <= -2) {
  signal = "偏弱";
} else {
  signal = "中性";
}
$("signal").textContent =
  signal;
let trend;
if (
  price > sma20 &&
  sma20 > sma50
) {
  trend = "上升";
} else if (
  price < sma20 &&
  sma20 < sma50
) {
  trend = "下降";
} else {
  trend = "震荡";
}
$("trend").textContent =
  trend;
let momentum;
if (rsi >= 60) {
  momentum = "较强";
} else if (rsi <= 40) {
  momentum = "较弱";
} else {
  momentum = "中性";
}
$("momentum").textContent =
  momentum;
let risk;
if (
  rsi >= 70 ||
  rsi <= 30
) {
  risk = "较高";
} else {
  risk = "中等";
}
$("risk").textContent =
  risk;
$("summary").textContent =
  "根据当前价格、SMA20、SMA50 和 RSI14 的规则模型，" +
  ticker +
  " 当前信号为「" +
  signal +
  "」。" +
  "这只是技术指标汇总，不代表未来一定上涨或下跌。";
drawChart(
  closes.slice(-90)
);
result.classList.remove(
  "hidden"
);
status.textContent =
  "数据更新完成";

} catch (error) {

status.textContent =
  "获取失败：" +
  error.message;

}
}

// 页面打开后默认分析 AAPL
analyzeStock(“AAPL”);
