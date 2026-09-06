const ticker = document.getElementById(“ticker”);
const analyze = document.getElementById(“analyze”);
const status = document.getElementById(“status”);
const result = document.getElementById(“result”);

analyze.addEventListener(“click”, function () {

const symbol = ticker.value.trim().toUpperCase();
if (symbol === "") {
    status.textContent = "请输入股票代码";
    return;
}
status.textContent = "正在分析 " + symbol + "...";
setTimeout(function () {
    document.getElementById("name").textContent =
        symbol + " Stock";
    document.getElementById("symbol").textContent =
        symbol;
    document.getElementById("price").textContent =
        "$100.00";
    document.getElementById("change").textContent =
        "+2.35%";
    document.getElementById("rsi").textContent =
        "58.4";
    document.getElementById("sma20").textContent =
        "$98.20";
    document.getElementById("sma50").textContent =
        "$94.70";
    document.getElementById("points").textContent =
        "90";
    document.getElementById("signal").textContent =
        "偏强";
    document.getElementById("trend").textContent =
        "上升";
    document.getElementById("momentum").textContent =
        "较强";
    document.getElementById("risk").textContent =
        "中等";
    document.getElementById("summary").textContent =
        symbol +
        " 当前技术指标显示趋势偏强，但这只是 V1 演示数据，不代表未来走势。";
    result.classList.remove("hidden");
    status.textContent =
        "分析完成";
}, 800);

});
