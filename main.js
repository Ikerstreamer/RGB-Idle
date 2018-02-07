
var player = {
    version : 0.002,
    money: { red: 0, green: 0, blue: 0 },
    level: { red: 0, green: 0, blue: [0,0,0,0]},
    unlock: false
}

var tab = "RGB";
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
    this.color = [r, g, b];
    this.width = 0;
    this.element = document.getElementById(elemid);
    this.mouse = 0;
    this.draw = function () {
        if (this.mouse == 1) increase(click)
        if ((this.name == "red" && click >= 100) || income[this.name] >= 100) this.element.style.width = "100%";
        else this.element.style.width = this.width + "%";
        this.element.style.background = RGBstring(this.color);
    }
    this.setup = function () {
        var temp = this.name;
        this.element.parentNode.onmousedown = function () { press(temp, 1) };
        this.element.parentNode.onmouseup = function () { press(temp, 0) };
        this.element.parentNode.onmouseleave = function () { press(temp, 0) };
    }
}

function init() {
    player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar")};
    player.bars.red.setup();
    if (load() != false) {
        if (load().version >= 0.001) player = load();
        if (load().version < 0.002) player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
        if (player.unlock) document.getElementById('blueDiv').classList.remove('hidden');
        updateStats();
        player.version = 0.002;
    }
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
        if (income[tempKey] >= 1) document.getElementById(tempKey + "Bar").innerHTML = formatNum(income[tempKey]) + "/s";
        if (tempKey == "blue") {
            for (var j = 0; j < 3; j++) {
                document.getElementById(tempKey + "Button" + j).childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey][j], 0);
                document.getElementById(tempKey + "Button" + j).childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey][j]) + " " + tempKey;
                switch (j) {
                    case 0: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current multi: " + formatNum(RSM) + "x";
                        break
                    case 1: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current multi: " + formatNum(PD) + "x";
                        break
                    case 2: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current increase: " + formatNum(IG) + "%";
                        break
                    case 3:
                        break
                }
            }
        } else {
            document.getElementById(tempKey + "Button").childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey], 0);
            document.getElementById(tempKey + "Button").childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey]) + " " + tempKey;
        }
    }
}

function press(name, num) {
    player.bars.red.mouse = num;
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
    click = Math.floor(((5 + player.level.red) * (((Math.floor(player.level.red / 25)) * 0.25) + 1)) * RSS);
    auto = (((player.level.green * 10) * (((Math.floor(player.level.green / 25)) * 0.5) + 1)) * RSS) * RSM;
    price.red = 5 * Math.pow(1+(0.1 * PD), player.level.red);
    price.green = 5 * Math.pow(1+(0.05 * PD), player.level.green);
    price.blue[0] = 5 * Math.pow(1.14, player.level.blue[0]);
    price.blue[1] = 10 * Math.pow(1.22, player.level.blue[1]);
    price.blue[2] = 15 * Math.pow(1.18, player.level.blue[2]);
    price.blue[3] = 50 * Math.pow(10, player.level.blue[3]);
    income.red = click / 100;
    income.green = income.red*IG / 100;
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
    localStorage.setItem("RGBsave", btoa(JSON.stringify(player)));
}
function load() {
    if (localStorage.getItem("RGBsave") != undefined || localStorage.getItem("RGBsave") != null) {
        var temp = JSON.parse(atob(localStorage.getItem("RGBsave")));
        var tempSave = JSON.parse(atob(localStorage.getItem("RGBsave")));
        tempSave.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
        tempSave.bars.red.width = temp.bars.red.width;
        tempSave.bars.green.width = temp.bars.green.width;
        tempSave.bars.blue.width = temp.bars.blue.width;
        return tempSave;
    } else return false;
}

function reset(start) {
    player = {
        version : 0.002,
        money: { red: 0, green: 0, blue: 0 },
        level: { red: 0, green: 0, blue: [0,0,0,0]},
        unlock: false
    };
        player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
        player.bars.red.setup();
        updateStats();
}
