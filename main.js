
var player = {
    money: { red: 0, green: 0, blue: 0 },
    level: { red: 0, green: 0, blue: 0 },
    unlock: false
}

var price = {red: 5, green: 5}  
var income = {red:0, green:0};
var click = 5;
var auto = 0;

function bar(n,r,g,b,elemid) {
    this.name = n;
    this.element = document.getElementById(elemid);
    this.color = [r, g, b];
    this.width = 0;
    this.mouse;
    this.draw = function () {
        increase(auto / 50);
        if (this.mouse) increase(click)
        if ((this.name == "red" && click >= 100) || income[this.name] >= 100) this.element.style.width = "100%";
        else this.element.style.width = this.width + "%";
        this.element.style.background = RGBstring(this.color);
        if (this.bar == "green");
    }
    this.setup = function () {
        var temp = this.name;
        this.element.parentNode.onmousedown = function () { press(temp, true) };
        this.element.parentNode.onmouseup = function () { press(temp, false) };
    }
}

function init() {
    player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
    player.bars.red.setup();
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    setInterval(gameLoop, 20);
}

function gameLoop() {
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    for (var i = 0; i < Object.keys(player.money).length; i++) {
        var tempKey = Object.keys(player.money)[i];
        var tempValue = Object.values(player.money)[i];
        document.getElementById(tempKey + "Count").innerHTML = formatNum(tempValue);
            document.getElementById(tempKey + "Button").childNodes[1].innerHTML = "Level " + formatNum(player.level[tempKey],0);
            document.getElementById(tempKey + "Button").childNodes[2].innerHTML = "Price " + formatNum(price[tempKey]) + " " + tempKey;
    }
}

function press(name, active) {
    player.bars[name].mouse = active;
}

function increase(amnt) {
    var next = amnt;
    for (var i = 0; i < 2;i++){
        var temp = player.bars[i == 0 ? "red" : "green"];
        temp.width += next;
        next = 0;
     while (temp.width > 100) {
        temp.width -= 100;
        player.money[temp.name]++;
        next += 5;
    }
}
}

function RGBstring(color) {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

function buyUpgrade(name) {
    if (name == "blue") {

    }else if (player.money[name] >= price[name]) {
        player.money[name] -= price[name]
        player.level[name]++;
        updateStats()
    }
}

function updateStats() {
    click = Math.floor((5 + player.level.red) * (((Math.floor(player.level.red / 25)) * 0.5) + 1));
    auto = (player.level.green*10)*(((Math.floor(player.level.green/25))*0.5)+1)
    price.red = 5 * Math.pow(1.1, player.level.red);
    price.green = 5 * Math.pow(1.05, player.level.green);
    income.red = click / 100;
    income.green = income.red / 100;
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