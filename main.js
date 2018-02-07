
var player = {
    version : 0.001,
    money: { red: 0, green: 0, blue: 0 },
    level: { red: 0, green: 0, blue: [0,0,0,0]},
    unlock: false
}

var price = { red: 5, green: 5, blue: [0, 0, 0, 0] };
var income = {red:0, green:0, blue: 0};
var click = 5;
var auto = 0;
var RSM = 0;
var IG = 0;
var RSS = 0;
var PD = 0;

function bar(n,r,g,b,elemid) {
    this.name = n;
    this.element = document.getElementById(elemid);
    this.color = [r, g, b];
    this.width = 0;
    this.mouse;
    this.draw = function () {
        if (this.mouse) increase(click)
        if ((this.name == "red" && click >= 100) || income[this.name] >= 100) this.element.style.width = "100%";
        else this.element.style.width = this.width + "%";
        this.element.style.background = RGBstring(this.color);
    }
    this.setup = function () {
        var temp = this.name;
        this.element.parentNode.onmousedown = function () { press(temp, true) };
        this.element.parentNode.onmouseup = function () { press(temp, false) };
    }
}

function init() {
    if (load().version >= 0.001 && load() != false) player = load();
    if (player.unlock) document.getElementById('blueDiv').classList.remove('hidden');
    updateStats();
    player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
    player.bars.red.setup();
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    setInterval(gameLoop, 20);
    setInterval(save, 1000);
}

function gameLoop() {
    increase(auto / 50);
    if (player.money.green >= 10 && !player.unlock) document.getElementById("unlockBtn").classList.remove("hidden");
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    for (var i = 0; i < Object.keys(player.money).length; i++) {
        var tempKey = Object.keys(player.money)[i];
        var tempValue = Object.values(player.money)[i];
        document.getElementById(tempKey + "Count").innerHTML = formatNum(tempValue);
        if (tempKey == "blue") {
            for (var j = 1; j < 3; j++) {
                document.getElementById(tempKey + "Button" + j).childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey][j], 0);
                document.getElementById(tempKey + "Button" + j).childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey][j]) + " " + tempKey;
            }
        } else {
            document.getElementById(tempKey + "Button").childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey], 0);
            document.getElementById(tempKey + "Button").childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey]) + " " + tempKey;
        }
    }
}

function press(name, active) {
    player.bars[name].mouse = active;
}

function increase(amnt) {
    var next = amnt;
    for (var i = 0; i < (player.unlock ? 3 : 2) ;i++){
        var temp = player.bars[Object.keys(player.bars)[i]];
        temp.width += next;
        next = 0;
     while (temp.width > 100) {
        temp.width -= 100;
        player.money[temp.name]++;
        next += (temp.name == "red"? IG : 5);
    }
}
}

function RGBstring(color) {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

function buyUpgrade(name, Bindex) {
    if (name == "blue") {
        if (player.money[name] >= price[name][Bindex]) {
            player.money[name] -= price[name][Bindex]
            player.level[name][Bindex]++;
            updateStats()
        }
    }else if (player.money[name] >= price[name]) {
        player.money[name] -= price[name]
        player.level[name]++;
        updateStats()
    }
}

function updateStats() {
    PD = Math.pow(0.95, player.level.blue[1]);
    RSM = 1 + player.level.blue[0] * 0.1;
    IG = 5 * Math.pow(1.1, player.level.blue[2])
    RSS = Math.pow(0.95, player.level.blue[2]);
    click = Math.floor(((5 + player.level.red) * (((Math.floor(player.level.red / 25)) * 0.5) + 1)) * RSS);
    auto = (((player.level.green * 10) * (((Math.floor(player.level.green / 25)) * 0.5) + 1)) * RSS) * RSM;
    price.red = 5 * Math.pow(1.1 * PD, player.level.red);
    price.green = 5 * Math.pow(1.05 * PD, player.level.green);
    price.blue[0] = 5 * Math.pow(1.14, player.level.blue[0]);
    price.blue[1] = 10 * Math.pow(1.22, player.level.blue[1]);
    price.blue[2] = 15 * Math.pow(1.18, player.level.blue[2]);
    price.blue[3] = 50 * Math.pow(10, player.level.blue[3]);
    income.red = click / 100;
    income.green = income.red / 100;
    income.blue = income.green / 100;
}

function formatNum(num, dp) {
    if (dp == undefined) dp = 2;
    var suffix = ["K", "M", "B", "T", "Qu", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
    if (num < 10000) return num.toFixed(Math.min(Math.max(2 - Math.floor(Math.log10(num)), 0),dp));
    else return (num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))).toFixed(2 - Math.floor(Math.log10(num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))))) + suffix[Math.floor(Math.log(num) / Math.log(1000)) - 1];
}

function unlockBlue() {
    if (player.money.green >= 50) {
        player.money.green -= 50;
        player.unlock = true;
        document.getElementById('unlockBtn').classList.add('hidden');
        document.getElementById('blueDiv').classList.remove('hidden');
    }
}

function save() {
  localStorage.setItem("RGBsave",btoa(JSON.stringify(player)));
}
function load() {
    if (localStorage.getItem("RGBsave") != undefined || localStorage.getItem("RGBsave") != null) return JSON.parse(atob(localStorage.getItem("RGBsave")));
    else return false;
}