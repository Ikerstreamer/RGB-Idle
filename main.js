var v = 1.07;
var player = {
    money: { red: 0, green: 0, blue: 0},
    level: { red: 0, green: 0, blue: [0,0,0,0]},
    unlock: false,
    spliced: { red: 0, green: 0, blue: 0 },
    spectrum: 0,
    specced: 0,
    spectrumLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    options: { fast: false, fps: 50, notation: "Default" },
    spectrumTimer: 0,
    previousSpectrums: [{ time: 0, amount: 0}, { time: 0, amount: 0}, { time: 0, amount: 0}, { time: 0, amount: 0}, { time: 0, amount: 0}],
    lastUpdate: Date.now(),
    prism: { active: false, potency: {red:0.5,green:0.5,blue:0.5}, pcost: {red:100,green:100,blue:100}, },
    black:0,
}

var AB = {red:true,green:true,blue:true};
var CM = 1;
var Cores = 1;
var Clock = 1;
var RUM = 1;
var tab = "RGB";
var subtab = {spectrum:"Upgrades"}
var price = { red: 5, green: 5, blue: [0, 0, 0, 0] };
var income = {red:0, green:0, blue: 0};
var click = 5;
var auto = 0;
var IG = 0;
var IR = 0;
var RSS = 0;
var PD = 0;
var SR = 0;
var SpecPrice = [1, 1, 3, 5, 5, 7, 10, 15, 25, 50, 100, 250, 500, 2500, 5000];

function bar(n,r,g,b,elemid) {
    this.name = n;
    this.color = [r, g, b];
    this.width = 0;
    this.element = document.getElementById(elemid);
    this.mouse = 0;
    this.draw = function () {
        if (this.mouse == 1) {
            CM += 0.1 * (50 / player.options.fps);
            increase(click * (50 / player.options.fps));
        } else if (this.name == "red" && CM > 1 && player.spectrumLevel[3] == 0) CM -= 0.15 * (50 / player.options.fps);
        if (income[this.name] >= 10) this.element.style.width = "100%";
        else this.element.style.width = this.width/2.56 + "%";
        this.element.style.background = RGBstring(this.color);
    }
    this.setup = function () {
        var temp = this.name;
        this.element.parentNode.onmousedown = function () { press(temp, 1) };
        this.element.parentNode.onmouseup = function () { press(temp, 0) };
        this.element.parentNode.onmouseleave = function () { press(temp, 0) };
        this.element.parentNode.ontouchstart = function () { press(temp, 1) };
        this.element.parentNode.ontouchstop = function () { press(temp, 0) };
        this.element.parentNode.ontouchcancel = function () { press(temp, 0) };
    }
}

function init() {
    setupPlayer();
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    setInterval(save, 3000);
    window.mainLoop = setInterval(gameLoop, 1000 / player.options.fps);
    window.ABLoop = setInterval(autoBuyer, 2000);
}

function autoBuyer() {
        if (player.spectrumLevel[4] == 1 && AB.red) while (buyUpgrade("red"));
        if (player.spectrumLevel[5] == 1 && AB.green) while (buyUpgrade("green"));
        if (player.spectrumLevel[9] == 1 && AB.blue) for (var i = 0; i < 4; i++) while (buyUpgrade("blue", i));
}

function gameLoop() {
    var dif = Date.now() - player.lastUpdate;
    player.lastUpdate = Date.now();
    player.spectrumTimer += dif;
    updateStats();
    increase(auto * (dif / 1000));
    if (player.level.green >= 1 && !player.unlock) document.getElementById("unlockBtn").classList.remove("hidden");
    if (SumOf(player.spectrumLevel) == 15)document.getElementsByClassName("switch")[5].classList.remove("hidden");
    if (player.level.blue[3] >= 1) document.getElementById("spectrumDiv").classList.remove("hidden");
    if (player.money.blue >= 1) document.getElementsByClassName("switch")[1].classList.remove("hidden");
    if (player.specced > 0) {
        document.getElementsByClassName("switch")[1].classList.remove("hidden");
        document.getElementsByClassName("switch")[3].classList.remove("hidden");
        document.getElementById("tabSpectrum").childNodes[1].classList.add("hidden");
        document.getElementById("tabSpectrum").childNodes[3].classList.remove("hidden");
    }
    if (tab == "Spectrum" && subtab.spectrum == "Prism") renderPrismTab();
    else for (var i = 0; i < 3; i++) for (var j = 0; j < 5; j += 2) document.getElementById(Object.keys(player.money)[i] + "Prism").cells[1].childNodes[j].value = player.bars[Object.keys(player.money)[i]].color[j / 2];
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    for (var i = 0; i < Object.keys(player.money).length; i++) {
        var tempKey = Object.keys(player.money)[i];
        document.getElementById(tempKey + "Count").innerHTML = formatNum(player.money[tempKey]);
        if (income[tempKey] >= 10) document.getElementById(tempKey + "Bar").innerHTML = formatNum(displayIncome(income[tempKey],i)  ) + "/s";
        else document.getElementById(tempKey + "Bar").innerHTML = "";
        document.getElementById(tempKey + "Splice").childNodes[0].innerHTML = "Splice " + Math.min(player.level.blue[3]*10, 100) + "% " + tempKey + " into a spectrum";
        document.getElementById(tempKey + "Splice").childNodes[1].innerHTML = "Spliced " + tempKey + ": " + formatNum(player.spliced[tempKey]);
        if (tempKey == "blue") {
            for (var j = 0; j < 4; j++) {
                document.getElementById(tempKey + "Button" + j).childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey][j], 0);
                document.getElementById(tempKey + "Button" + j).childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey][j]) + " " + tempKey;
                switch (j) {
                    case 0: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current speed: " + formatNum(Clock, 0, "Hz");
                        break
                    case 1: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current fill: " + (IR / 256 >= 100 ? "~" + formatNum(Math.floor(IR / 256), 0) : (IR / 256 >= 1 ? formatNum(Math.floor(IR / 256), 0) + " & " : "") + formatNum(IR % 256, 0) + "/256");
                        break
                    case 2: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current fill: " + (IG / 256 >= 100 ? "~" + formatNum(Math.floor(IG / 256), 0) : (IG / 256 >= 1 ? formatNum(Math.floor(IG / 256), 0) + " & " : "") + formatNum(IG % 256, 0) + "/256");
                        break
                    case 3: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Core Count: " + formatNum(Cores, 0);
                        break
                }
            }
        } else {
            document.getElementById(tempKey + "Button").childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey], 0);
            document.getElementById(tempKey + "Button").childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey]) + " " + tempKey;
        }
    }
    document.getElementById("spectrumCount").innerHTML = "You have " + formatNum(player.spectrum, 0) + " Spectrum";
    document.getElementById("blackCount").innerHTML = "You have " + formatNum(player.black) + " Blackness";
    document.getElementById("spectrumReset").childNodes[1].innerHTML ="<b>" + formatNum(Math.floor(SR), 0) + " Spectrum</b>";
    document.getElementById("spectrumReset").childNodes[2].innerHTML = formatNum(((SR % 1) * 100)) + "% towards next";
    for (var i = 0; i < player.spectrumLevel.length; i++) {
        if(i!=5 && i!=4)document.getElementById("spectrumButton" + i).childNodes[1].innerHTML = SUInfo(i);
        document.getElementById("spectrumButton" + i).childNodes[2].innerHTML = "Price: " + formatNum(SpecPrice[i], 0) + " Spectrum ";
        if (player.spectrumLevel[i] == 1) document.getElementById("spectrumButton" + i).classList.add("bought");
        else document.getElementById("spectrumButton" + i).classList.remove("bought");
    }
    document.getElementsByClassName("setting")[4].childNodes[1].innerHTML = player.options.fast ? "On" : "Off";
    document.getElementsByClassName("setting")[5].childNodes[1].innerHTML = player.options.fps;
    document.getElementsByClassName("setting")[6].childNodes[1].innerHTML = "<b>" + player.options.notation + "</b>";
}

function renderPrismTab() {
    window.mixCost = 1;
    window.blackBar = false;
    for (var i = 0; i < 3; i++) {
        var temp = Object.keys(player.money)[i];
        var row = document.getElementById(temp + "Prism");
        var PVal = [[32, 1, 0], [32, 0, 1], [0, 0, 0]];
        if (!player.prism.active) for (var j = 0; j < 5; j += 2) row.cells[1].childNodes[j].value = PVal[i][j / 2];
        row.cells[0].childNodes[0].style.backgroundColor = "rgb(" + Math.floor(row.cells[1].childNodes[0].value) + "," + Math.floor(row.cells[1].childNodes[2].value) + "," + Math.floor(row.cells[1].childNodes[4].value) + ")";
        var colors = ["Red: ", "Green: ", "Blue: "]
        if (row.cells[1].childNodes[0].value + row.cells[1].childNodes[2].value + row.cells[1].childNodes[4].value == 0) {
            row.cells[2].innerHTML = "Black: <sup>" + formatNum(player.spectrum * player.prism.potency[temp], 0) + "</sup>&frasl;<sub> " + formatNum(Math.max(player.black, Math.pow(256, 3))) + "</sub>";
            blackBar = true;
        } else if (row.cells[1].childNodes[0].value == 255 && row.cells[1].childNodes[2].value == 255 && row.cells[1].childNodes[4].value == 255) row.cells[2].innerHTML = "Spectrum: log<sub>1000</sub>(x)";
        else {
            row.cells[2].innerHTML = "<span></span><br><span></span><br><span></span>";
            for (var j = 0; j < 5; j += 2) row.cells[2].childNodes[j].innerHTML = colors[j / 2] + formatNum((Math.floor(row.cells[1].childNodes[j].value) / 255 * player.prism.potency[Object.keys(player.prism.potency)[i]]), 3);
        }
        if (player.prism.active) mixCost *= Math.pow(1.25,Math.pow(Math.floor(row.cells[1].childNodes[0].value), 1) + Math.pow(Math.floor(row.cells[1].childNodes[2].value), 1.05) + Math.pow(Math.floor(row.cells[1].childNodes[4].value), 1.1));
        if (player.prism.active) {
            row.cells[3].childNodes[0].classList.remove("hidden");
            row.cells[3].childNodes[0].childNodes[1].innerHTML = formatNum(player.prism.pcost[temp],0) + " Spectrum";
        }
    }
    mixCost -= 1;
    if (player.prism.active) document.getElementById("mixButton").innerHTML = "Create a New Color Mix<br>This will cost: " + formatNum(mixCost, 2) + " Blackness";
    else document.getElementById("mixButton").innerHTML = "Activate the Prism and Embrace its Power!"

}

function press(name, num) {
    player.bars.red.mouse = num;
}

function increase(amnt) {
    var next = amnt * IR;
    for (var i = 0; i < (player.unlock ? 3 : 2) ; i++) {
        var temp = player.bars[Object.keys(player.bars)[i]];
        temp.width += next;
        if (temp.color[0] == 255 && temp.color[1] == 255 && temp.color[2] == 255) player.spectrum += Math.max(Math.floor(Math.log(Math.floor(temp.width / 256)) / Math.log(1000)), 0);
            else{
            player.money["red"] += (player.prism.active? player.prism.potency[temp.name] : player.spectrumLevel[1] + 1) * Math.floor(temp.width / 256) * temp.color[0] / 255;
            player.money["green"] += (player.prism.active ? player.prism.potency[temp.name] : player.spectrumLevel[1] + 1) * Math.floor(temp.width / 256) * temp.color[1] / 255;
            player.money["blue"] += (player.prism.active ? player.prism.potency[temp.name] : player.spectrumLevel[1] + 1) * Math.floor(temp.width / 256) * temp.color[2] / 255;
            player.black += (temp.color[0] + temp.color[1] + temp.color[2] == 0 ? Math.floor(temp.width / 256) * (player.spectrum / Math.max(player.black * Math.pow(256, 3), Math.pow(256, 3))) : 0);
            }
        next = Math.floor(temp.width / 256) * (temp.name == "red" ? IG : 8);
        temp.width = temp.width % 256;
    }
}

function RGBstring(color) {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

function prismUpgrade(name) {
    if (player.spectrum >= player.prism.pcost[name]) {
        player.prism.potency[name] *= 2;
        player.spectrum -= player.prism.pcost[name];
        player.prism.pcost[name] *= 10;
    }
}


function buyUpgrade(name, Bindex) {
    if (name == "spectrum") {
        if (player.spectrum >= SpecPrice[Bindex] && player.spectrumLevel[Bindex] < 1) {
            if(Bindex == 8) {
                player.unlock = true;
                document.getElementById('blueDiv').classList.remove('hidden');
            }
            if(Bindex == 9) {
                if (player.level.red < 100) player.level.red = 100;
                if (player.level.green < 100) player.level.green = 100;
            }
            if (Bindex == 5 || Bindex == 4) {
                document.getElementById("spectrumButton" + Bindex).childNodes[1].innerHTML = SUInfo(Bindex);
            }
            player.spectrum -= SpecPrice[Bindex];
            player.spectrumLevel[Bindex]++;
            updateStats();
            return true;
        }
    }else if (name == "blue") {
        if (player.money[name] >= price[name][Bindex]) {
            if (Bindex == 3 && player.level[3] == 10) return;
            player.money[name] -= price[name][Bindex]
            player.level[name][Bindex]++;
            updateStats();
            return true;
        }
    }else if (player.money[name] >= price[name]) {
        player.money[name] -= price[name]
        player.level[name]++;
        updateStats();
        return true;
    }
}

function SUInfo(num){
    switch(num){
        case 0:
            return "Current CM: " + Math.max(Math.log10(CM), 1).toFixed(1) + "x";
        case 2:
            return "Base Bar Increase: " + (2 + player.spectrumLevel[2] * 2) + "/256";
        case 4:
            return player.spectrumLevel[4] == 1 ? "<div onclick='ToggleAB(`red`)' class='button' style='height:100%;width:50%;background-color:" + (AB.red ? "green" : "red") + "'>" + (AB.red ? "On" : "Off") + "</div>" : "Buy Red Yourself!";
        case 5:
            return player.spectrumLevel[5] == 1 ? "<div onclick='ToggleAB(`green`)' class='button' style='height:100%;width:50%;background-color:" + (AB.green ? "green" : "red") + "'>" + (AB.green ? "On" : "Off") + "</div>" : "Buy Green Yourself!";
        case 6:
            return "Current Multi per 10: " + (player.spectrumLevel[6] + 1) + "x";
        case 7:
            return "Current Multi per 10: " + (player.spectrumLevel[7] / 10 + 1.15) + "x";
        case 9:
            return player.spectrumLevel[9] == 1 ? "<div onclick='ToggleAB(`blue`)' class='button' style='height:100%;width:50%;background-color:" + (AB.blue ? "green" : "red") + "'>" + (AB.blue ? "On" : "Off") + "</div>" : "Buy Blue Yourself!";
        case 10:
            return "R&G cost " + ((1 - PD) * 100) + "% less";
        case 11:
            return "Current Multi: " + formatNum(player.level.red,0) + "x";
        case 12:
            return "Current Multi: " + formatNum(Math.max(Math.floor(Math.pow(player.spectrum, 0.8)), 1), 0) + "x";
        case 13:
            return player.spectrumLevel[13] == 1 ? "Better Formula" : "Regular Formula";
        case 14:
            return "Base Core Count: " + (player.spectrumLevel[13] == 1 ? 8 : 1);
        default:
            return "";
    }
}

function updateStats() {
    PD = player.spectrumLevel[10] == 1 ? 0.5 : 1;
    if (player.spectrumLevel[2] == 1) {
        IR = (4 + (4 * player.level.blue[1])) * (player.spectrumLevel[6] == 1 ? Math.max(2 * Math.ceil(player.level.blue[1] / 10), 1) : 1);
        IG = (4 + (4 * player.level.blue[2])) * (player.spectrumLevel[6] == 1 ? Math.max(2 * Math.ceil(player.level.blue[2] / 10), 1) : 1);
    } else {
        IR = (2 + (2 * player.level.blue[1])) * (player.spectrumLevel[6] == 1 ? Math.max(2 * Math.ceil(player.level.blue[1] / 10), 1) : 1);
        IG = (2 + (2 * player.level.blue[2])) * (player.spectrumLevel[6] == 1 ? Math.max(2 * Math.ceil(player.level.blue[2] / 10), 1) : 1);
    }
    Cores = Math.pow(2, player.level.blue[3]) * (player.spectrumLevel[14] == 1 ? 8 : 1);
    Clock = Math.pow(2,Math.floor(Math.log(Math.pow(2, player.level.blue[0]) * (Cores * Math.pow(1.025,Cores)))/Math.log(2)));
    click = (1 + player.level.red / 2) * Math.pow((player.spectrumLevel[7] == 1 ? 1.25 : 1.15), (Math.floor(player.level.red / 10))) * Math.log10(CM);
    auto = (((player.level.green * 4) * Math.pow((player.spectrumLevel[7] == 1 ? 1.25 : 1.15), Math.floor(player.level.green / 10))) * Clock * (player.spectrumLevel[0] == 1 ? Math.max(Math.log10(CM), 1): 1) * (player.spectrumLevel[11] == 1 ? player.level.red : 1) * (player.spectrumLevel[12] == 1 ? Math.max(Math.floor(Math.pow(player.spectrum, 0.8)), 1) : 1));
    price.red = 5 * Math.pow(1+((0.1 * Math.pow(1.075, Math.max((player.level.red / 100)-1,0))) * PD), player.level.red);
    price.green = 5 * Math.pow(1+((0.05 * Math.pow(1.075, Math.max((player.level.red / 100)-1,0))) * PD), player.level.green);
    price.blue[0] = 1 * Math.pow(16, player.level.blue[0]);
    price.blue[1] = 4 * Math.pow(2, player.level.blue[1]);
    price.blue[2] = 8 * Math.pow(2, player.level.blue[2]);
    price.blue[3] = 1048576 * Math.pow(Math.pow(512, Math.max(Math.floor(Math.max(player.level.blue[3] - 4, 0) * 1.2), 1)), player.level.blue[3]);
    if (player.bars.red.mouse == 1) income.red = ((auto + (click * 50)) * IR) / 256;
    else income.red = (auto * IR / 256);
    income.green = (income.red * IG / 256);
    income.blue = income.green * 8 / 256;
    SR = Math.pow((player.spliced.red) / 16777216, 1 / (3 - player.spectrumLevel[13])) * Math.pow((player.spliced.green) / 16777216, 1 / (3 - player.spectrumLevel[13])) * Math.pow((player.spliced.blue) / 16777216, 1 / (3 - player.spectrumLevel[13]))
    SR = Math.max(Math.log(SR * (player.specced + 1)) / Math.log(1000), 0);
    SR *= Math.floor(player.level.green / 1000) + (Math.floor(player.level.red / 500)/2);
}       

function formatNum(num, dp, type) {
    if (dp == undefined) dp = 2;
    var suffix = ["K", "M", "B", "T", "Qu", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
    if (type == "Hz") {
        var hsuffix = ["nHz", "&mu;Hz", "mHz", "Hz", "kHz", "MHz", "GHz", "THz", "PHz", "EHz", "ZHz", "YHz","XHz","XKHz","XMHz","XGHz","XTHz","XPHz","XEHz","XZHz","XYHz","XNHz","bXHz","bXKHz","bXMHz","bXGHz","bXTHz","bXPHz","bXEHz","bXZHz","bXYHz","bXNHz"]
        return num / Math.pow(1024, Math.floor(Math.log(num) / Math.log(1024))) + hsuffix[Math.floor(Math.log(num * 1024) / Math.log(1024))]
    } else if (num < 10000) return num.toFixed(Math.min(Math.max(dp - Math.floor(Math.log10(num)), 0), dp));
    else if (num < 1e36 && player.options.notation == "Default") return (num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))).toFixed(2 - Math.floor(Math.log10(num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))))) + suffix[Math.floor(Math.log(num) / Math.log(1000)) - 1];
    else return (num / Math.pow(10, Math.floor(Math.log10(num)))).toFixed(1) + "e" + Math.floor(Math.log10(num));
}

function unlockBlue() {
    if (player.money.green >= 50) {
        player.money.green -= 50;
        player.unlock = true;
        document.getElementById('unlockBtn').classList.add('hidden');
        document.getElementById('blueDiv').classList.remove('hidden');
    }
}

function save(name) {
    if (name == "Export")
    {
        var temp = document.createElement("textarea");
        temp.value = btoa(JSON.stringify(player));
        document.getElementById("tabSettings").appendChild(temp);
        temp.select()
        document.execCommand('copy')
        temp.parentNode.removeChild(temp);
    }
    localStorage.setItem("RGBsave", btoa(JSON.stringify(player)));
    console.log("Saved");
}

function setupPlayer() {
    player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
    player.bars.red.setup();
    if (load() != false) {
        if (load().version >= 1) player = load();
        if (player.version < 1.07) {
            player.prism = { active: false, potency: { red: 0.5, green: 0.5, blue: 0.5 }, pcost: {red:100,green:100,blue:100} };
            player.black = 0;
        }
        if (player.unlock) document.getElementById('blueDiv').classList.remove('hidden');
        if (SumOf(player.spectrumLevel) == 15)
        updateStats();
        statPage();
        document.getElementById("spectrumButton" + 4).childNodes[1].innerHTML = SUInfo(4);
        document.getElementById("spectrumButton" + 5).childNodes[1].innerHTML = SUInfo(5);
    }
    player.version = v;
}

function load(name) {
    if (name == "Import") {
        var temp = prompt("Enter you save:", "");
        if (temp != null && temp != undefined && temp != "" && temp != false) {
            localStorage.setItem("RGBsave", temp);
            setupPlayer();
        }
    }else if (localStorage.getItem("RGBsave") != undefined || localStorage.getItem("RGBsave") != null) {
        var temp = JSON.parse(atob(localStorage.getItem("RGBsave")));
        var tempSave = JSON.parse(atob(localStorage.getItem("RGBsave")));
        tempSave.bars = { red: new bar("red", temp.bars.red.color[0], temp.bars.red.color[1], temp.bars.red.color[2], "redBar"), green: new bar("green", temp.bars.green.color[0], temp.bars.green.color[1], temp.bars.green.color[2], "greenBar"), blue: new bar("blue", temp.bars.blue.color[0], temp.bars.blue.color[1], temp.bars.blue.color[2], "blueBar") };
        tempSave.bars.red.width = temp.bars.red.width;
        tempSave.bars.green.width = temp.bars.green.width;
        tempSave.bars.blue.width = temp.bars.blue.width;
        return tempSave;
    } else return false;
}

function reset(type, force) {
    if (type >= 1) {
        if (SR >= 1 || force) {
            for (var i = 0; i < 3; i++) player.bars[Object.keys(player.money)[i]].width = 0;
            player.money = { red: 0, green: 0, blue: 0 };
            player.level = { red: 0, green: 0   , blue: [0, 0, 0, 0] };
            player.unlock = player.spectrumLevel[8] == 1;
            player.spectrum += Math.floor(SR);
            player.previousSpectrums = [{ time: player.spectrumTimer, amount: SR }, player.previousSpectrums[0], player.previousSpectrums[1], player.previousSpectrums[2], player.previousSpectrums[3]];
            player.spliced = { red: 0, green: 0, blue: 0 };
            player.specced += 1;
            player.spectrumTimer = 0;
            if (!player.unlock) {
                document.getElementById('unlockBtn').classList.add('hidden');
                document.getElementById('blueDiv').classList.add('hidden');
            }
            document.getElementById("spectrumDiv").classList.add("hidden");
            CM = 1;
            updateStats();
            tab = "Spectrum";
            statPage();
        }
    } else {
        player = {
            version: v,
            money: { red: 0, green: 0, blue: 0 },
            level: { red: 0, green: 0, blue: [0, 0, 0, 0] },
            unlock: false,
            spectrum: 0,
            spectrumLevel: [0,0,0,0,0,0,0,0,0,0,0,0,0],
            specced: 0,
            spliced: { red: 0, green: 0, blue: 0 },
            options: { fast: false, fps: 50, notation: "Default" },
            spectrumTimer: 0,
            previousSpectrums: [{ time: 0, amount: 0 }, { time: 0, amount: 0 }, { time: 0, amount: 0 }, { time: 0, amount: 0 }, { time: 0, amount: 0 }],
            lastUpdate: Date.now(),
            prism: { active: false, potency: { red: 0.5, green: 0.5, blue: 0.5 }, pcost: { red: 100, green: 100, blue: 100 }, },
            black: 0,
        };
        tab = "RGB";
        player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
        player.bars.red.setup();
        updateStats();
        document.getElementById('unlockBtn').classList.add('hidden');
        document.getElementById('blueDiv').classList.add('hidden');
         document.getElementsByClassName("switch")[1].classList.add("hidden");
        document.getElementById("spectrumDiv").classList.add("hidden");
    }
}

function flip(option) {
    if (option == "fps") {
        var temp = [10, 20, 40, 50];
        player.options.fps = temp[(temp.indexOf(player.options.fps) + 1) % 4];
        frameTime = 1000 / player.options.fps;
        clearInterval(mainLoop);
        mainLoop = setInterval(gameLoop,frameTime)
    }else if(option == "notation"){
        var temp = ["Default", "Scientific"];
        player.options.notation = temp[(temp.indexOf(player.options.notation) + 1) % 2];
    }else player.options[option] = !player.options[option];
}

function mix() {
    if (!player.prism.active) {
        if (confirm("The prism rises as you approch it, so many question you want it to answer yet it hovers there dead silent. You stick your hand out to reach for it and as you do all the light around you seems to fade. The blackness of the prism seems to consume everything, your spectrum fades out of exsistence.\n The game is about to change, your 3 colored bars will no longer solely produce red, green and blue respectively. Now each bars production can be altered to produce a certain amount of the base 3 colors, your first prism mix is fixed.")) {
            reset(1, true);
            player.spectrum = 0;
            player.prism.active = true;
            mixCost = 0;
        }else return
    }
    if (!blackBar) if (!confirm("You are about to create a prism that has no way of creating blackness!\n Are you sure you want to do this?")) return;
    if (player.black >= mixCost) {
        player.black = 0;
        mixReset();
    } else if (player.spectrum >= mixCost / Math.max(player.black,1) && confirm("Do you want to pay the missing blackness using Spectrum? \nThis will cost " + formatNum(mixCost / Math.max(player.black,1), 0) + " Spectrum. This will leave with "+ formatNum(player.spectrum - (mixCost / Math.max(player.black,1)),0) +" Spectrum.")) {
        player.spectrum -= mixCost / Math.max(player.black, 1);
        player.black = 0;
        mixReset();
    }
        function mixReset() {
            for (var i = 0; i < 3; i++) {
                var temp = Object.keys(player.money)[i];
                var row = document.getElementById(temp + "Prism");
                player.bars[temp].color = [Math.floor(row.cells[1].childNodes[0].value), Math.floor(row.cells[1].childNodes[2].value), Math.floor(row.cells[1].childNodes[4].value)];
                tab = "RGB";
                reset(1, true);
            }
        }
}

function switchTab(name, num, sub) {
    if (sub == undefined) tab = name;
    else subtab[sub] = name;
    for (var i = 0; i < document.getElementsByClassName("tab").length; i++) {
        document.getElementsByClassName("tab")[i].classList.add("hidden");
        document.getElementsByClassName("switch")[i].classList.remove("active");
        if ("tab" + tab == document.getElementsByClassName("tab")[i].id || "tab" + subtab.spectrum == document.getElementsByClassName("tab")[i].id) document.getElementsByClassName("tab")[i].classList.remove("hidden");
        if (tab == document.getElementsByClassName("switch")[i].innerHTML || subtab.spectrum == document.getElementsByClassName("switch")[i].innerHTML) document.getElementsByClassName("switch")[i].classList.add("active"); 
    }
}

function displayIncome(num, index) {
    if (player.prism.active) {
        num = 0;
        for (var i = 0; i < 3; i++) num += income[Object.keys(player.money)[i]] * player.prism.potency[Object.keys(player.money)[i]] * player.bars[Object.keys(player.money)[i]].color[index] / 255;
    }else num *= player.spectrumLevel[1] + !player.prism.active;
    return(num)
}

function spliceColor(name) {
    if (player.level.blue[3] === 0) return;
    player.spliced[name] += (player.money[name] / Math.min(player.level.blue[3] * 10, 100)); //* (name == "red" ? 0.5 : (name == "green" ? 1 : 128));
    player.money[name] -= player.money[name] / Math.min(player.level.blue[3] * 10, 100);
}

function statPage() {
    var table = document.getElementById("last5");
    for (var i = 0; i < table.rows.length; i++) {
        if (player.previousSpectrums[i].time != 0) table.rows[i].cells[0].innerHTML = (i == 0 ? "Your last Spectrum" : "Your Spectrum " + (i + 1) + " Spectrums ago") + " took " + (player.previousSpectrums[i].time >= 3600000 ? Math.floor(player.previousSpectrums[i].time / 3600000) + " hours and " + Math.floor((player.previousSpectrums[i].time % 3600000) / 60000) + " minutes" : (player.previousSpectrums[i].time >= 60000 ? Math.floor(player.previousSpectrums[i].time / 60000) + " minutes and " + Math.floor((player.previousSpectrums[i].time % 60000) / 1000) + " seconds" : (player.previousSpectrums[i].time >= 10000 ? Math.floor(player.previousSpectrums[i].time / 1000) + " seconds" : (player.previousSpectrums[i].time > 0 ? player.previousSpectrums[i].time + " millis" : 0)))) + " and earned you " + formatNum(player.previousSpectrums[i].amount, 0) + " Spectrum";
    }
}

function SumOf(arr) {
    return arr.reduce((acc, num) => acc + num);
}

function ToggleAB(name){
    if (name == "all") {
        AB.red = !AB.red;
        AB.green = !AB.green;
        AB.blue = !AB.blue;
    } else AB[name] = !AB[name];
    document.getElementById("spectrumButton" + 4).childNodes[1].innerHTML = SUInfo(4);
    document.getElementById("spectrumButton" + 5).childNodes[1].innerHTML = SUInfo(5);
    document.getElementById("spectrumButton" + 9).childNodes[1].innerHTML = SUInfo(9);
}

window.addEventListener("keypress",function(event) {
    var key = event.keyCode || event.which;
    if (key == 114) while (buyUpgrade("red"));
    if (key == 103) while (buyUpgrade("green"));
    if (key >= 49 && key <= 52) while (buyUpgrade("blue", key % 49));
    if (key == 109) {
        while (buyUpgrade("green"));
        while (buyUpgrade("red"));
        for (var i = 0; i < 4; i++) while (buyUpgrade("blue", i));
    }
}, false)
window.addEventListener("keydown", function (event) {
    var key = event.keyCode || event.which;
    if (key == 32) {
        press("red",1)
    }
    if (key == 65) ToggleAB("all");
}, false)
window.addEventListener("keyup", function (event) {
    var key = event.keyCode || event.which;
    if (key == 32) {
        press("red", 0)
    }
}, false)
