var v = 0.004;
var player = {
    money: { red: 0, green: 0, blue: 0},
    level: { red: 0, green: 0, blue: [0,0,0,0]},
    unlock: false,
    spectrum: 0,
    specreset: 0,
    spectrumLevel: [1,1,1,1,0,0],
    specced: 0,
}

var RUM = 1;
var SML = [50, 100, 50, 50, 1, 1];
var tab = "RGB";
var price = { red: 5, green: 5, blue: [0, 0, 0, 0] };
var income = {red:0, green:0, blue: 0};
var click = 5;
var auto = 0;
var RSM = 0;
var IG = 0;
var RSS = 0;
var PD = 0;
var SG = 0;
var SpecPrice = [1, 3, 8, 15, 50, 100];

function bar(n,r,g,b,elemid) {
    this.name = n;
    this.color = [r, g, b];
    this.width = 0;
    this.element = document.getElementById(elemid);
    this.mouse = 0;
    this.draw = function () {
        if (this.mouse == 1) increase(click);
        if (income[this.name] >= 10) this.element.style.width = "100%";
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
        if (load().version < 0.003) {
            player.specreset = 0;
            player.spectrum = 0;
            player.spectrumLevel = [1, 1, 1, 1, 0, 0];
        }
        if(load().version < 0.004) player.specced = 0;
        if (player.unlock) document.getElementById('blueDiv').classList.remove('hidden');
        updateStats();
        player.version = v;
    }
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    setInterval(gameLoop, 20);
    setInterval(save, 3000);
}

function gameLoop() {
    for (var i = 0; i < document.getElementsByClassName("tab").length; i++) {
        if ("tab" + tab == document.getElementsByClassName("tab")[i].id) document.getElementsByClassName("tab")[i].classList.remove("hidden");
        else document.getElementsByClassName("tab")[i].classList.add("hidden");
    }
    updateStats();
    increase(auto / 50);
    if (player.money.green >= 10 && !player.unlock) document.getElementById("unlockBtn").classList.remove("hidden");
    if (player.specreset >= 1) document.getElementById("spectrumDiv").classList.remove("hidden");
    if (player.specced > 0) for (var i = 0; i < document.getElementsByClassName("switch").length; i++)document.getElementsByClassName("switch")[i].classList.remove("hidden");
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    for (var i = 0; i < Object.keys(player.money).length; i++) {
        var tempKey = Object.keys(player.money)[i];
        document.getElementById(tempKey + "Count").innerHTML = formatNum(player.money[tempKey]);
        if (income[tempKey] >= 10) document.getElementById(tempKey + "Bar").innerHTML = formatNum(income[tempKey]) + "/s";
        else document.getElementById(tempKey + "Bar").innerHTML = "";
        if (tempKey == "blue") {
            for (var j = 0; j < 4; j++) {
                document.getElementById(tempKey + "Button" + j).childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey][j], 0);
                document.getElementById(tempKey + "Button" + j).childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey][j]) + " " + tempKey;
                switch (j) {
                    case 0: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current multi: " + formatNum(RSM) + "x";
                        break
                    case 1: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current multi: " + formatNum(PD) + "x";
                        break
                    case 2: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current increase: " + formatNum(IG) + "%";
                        break
                    case 3: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current gain: " + formatNum(SG) + "/Blue";
                        break
                }
            }
        } else {
            document.getElementById(tempKey + "Button").childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey], 0);
            document.getElementById(tempKey + "Button").childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey]) + " " + tempKey;
        }
    }
    document.getElementById("spectrumCount").innerHTML ="You have " + formatNum(Math.floor(player.spectrum), 0) + " Spectrum";
    document.getElementById("specResetCount").innerHTML = formatNum(Math.floor(player.specreset), 0);
    document.getElementById("spectrumReset").childNodes[1].innerHTML = formatNum(Math.floor(player.specreset), 0) + "Spectrum";
    for (var i = 0; i < player.spectrumLevel.length; i++) {
        document.getElementById("spectrumButton" + i).childNodes[1].innerHTML = "Level: " + formatNum(player.spectrumLevel[i], 0) + "/" + SML[i];
        document.getElementById("spectrumButton" + i).childNodes[2].innerHTML = "Price: " + formatNum(SpecPrice[i], 0) + " Spectrum ";
    }
}

function press(name, num) {
    player.bars.red.mouse = num;
}

function increase(amnt) {
    var next = amnt;
    for (var i = 0; i < (player.unlock ? 3 : 2) ;i++){
        var temp = player.bars[Object.keys(player.bars)[i]];
        if(amnt >= 10000){
        player.money[temp.name] += income[temp.name];
        if (temp.name == "blue") player.specreset += SG * amnt/100;
        next = (temp.name == "red" ? IG : 5) * amnt/100;
        }else{
        temp.width += next;
        next = 0;
     while (temp.width > 100) {
        temp.width -= 100;
        player.money[temp.name] += (temp.name == "blue" ? 1 : player.spectrumLevel[i+2]);
        if (temp.name == "blue") player.specreset += SG;
        next += (temp.name == "red" ? IG : 5);
    }
  }
}
}

function RGBstring(color) {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

function buyUpgrade(name, Bindex) {
    if (name == "spectrum") {
        if (player.spectrum >= SpecPrice[Bindex] && player.spectrumLevel[Bindex] < SML[Bindex]) {
            player.spectrum -= SpecPrice[Bindex];
            player.spectrumLevel[Bindex]++;
        }
    }else if (name == "blue") {
        if (player.money[name] >= price[name][Bindex]) {
            player.money[name] -= price[name][Bindex]
            player.level[name][Bindex]++;
        }
    }else if (player.money[name] >= price[name]) {
        player.money[name] -= price[name]
        player.level[name]++;
    }
    updateStats()
}

function updateStats() {
    RUM = (player.spectrumLevel[4] == 1 ? 1 + Math.log(Math.sqrt(player.money.red)) / Math.log(1e15) : 1);
    PD = Math.pow(0.95, player.level.blue[1]);
    RSM = 1 + player.level.blue[0] * (0.1 * player.spectrumLevel[0]);
    IG = 5 * Math.pow(1.1, player.level.blue[2]);
    RSS = Math.pow(0.95, player.level.blue[2]);
    SG = player.level.blue[3] * 0.01;
    click = Math.floor(((5 + player.level.red) * (((Math.floor(player.level.red / 10)) * 0.1) + 1)) * RSS);
    auto = Math.pow(((((player.level.green * 10) * (((Math.floor(player.level.green / 10)) * 0.20) + 1)) * RSS) * RSM) * player.spectrumLevel[1], RUM);
    price.red = 5 * Math.pow(1+((0.1 * Math.pow(1.25, Math.floor(player.level.red / 100))) * PD), player.level.red);
    price.green = 5 * Math.pow(1+((0.05 * Math.pow(1.25, Math.floor(player.level.green / 100))) * PD), player.level.green);
    price.blue[0] = 5 * Math.pow(1.13, player.level.blue[0]);
    price.blue[1] = 10 * Math.pow(1.22, player.level.blue[1]);
    price.blue[2] = 25 * Math.pow(1.16, player.level.blue[2]);
    price.blue[3] = 100 * Math.pow(10, player.level.blue[3]);
    SpecPrice[0] = Math.ceil(1 * Math.pow(1.5, player.spectrumLevel[0]-1));
    SpecPrice[1] = Math.ceil(3 * Math.pow(1.35, player.spectrumLevel[1]-1));
    SpecPrice[2] = Math.ceil(8 * Math.pow(1.75, player.spectrumLevel[2]-1));
    SpecPrice[3] = Math.ceil(15 * Math.pow(1.85, player.spectrumLevel[3]-1));
    if (player.bars.red.mouse == 1) income.red = (auto + (click*50)) / 100;
    else income.red = (auto / 100) * player.spectrumLevel[2];
    income.green = (income.red*IG / 100) * player.spectrumLevel[3];
    income.blue = income.green*5 / 100;
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
    console.log("Saved");
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

function reset(type) {
    if (type >= 1) {
        player = {
            version: v,
            money: { red: 0, green: 0, blue: 0 },
            level: { red: 0, green: 0, blue: [0, 0, 0, 0]},
            unlock: player.spectrumLevel[5] == 1,
            spectrum: Math.floor(player.specreset) + player.spectrum,
            specreset: 0,
            spectrumLevel: [1, 1, 1, 1, 0, 0],
            specced: player.specced +1,
        };
        player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
        player.bars.red.setup();
        if(!unlock){
          document.getElementById('unlockBtn').classList.add('hidden');
        document.getElementById('blueDiv').classList.add('hidden');  
        }
        document.getElementById("spectrumDiv").classList.add("hidden");
        updateStats();
    } else {
        player = {
            version: v,
            money: { red: 0, green: 0, blue: 0 },
            level: { red: 0, green: 0, blue: [0, 0, 0, 0] },
            unlock: false,
            spectrum: 0,
            specreset: 0,
            spectrumLevel: [1, 1, 1, 1, 0, 0],
            specced: 0,
        };
        player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
        player.bars.red.setup();
        updateStats();
        document.getElementById('unlockBtn').classList.add('hidden');
        document.getElementById('blueDiv').classList.add('hidden');
        for (var i = 0; i < document.getElementsByClassName("switch").length; i++) document.getElementsByClassName("switch")[i].classList.add("hidden");
        document.getElementById("spectrumDiv").classList.add("hidden");
    }
}

function switchTab(name) {
    tab = name;
}
