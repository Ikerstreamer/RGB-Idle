var v = 0.0091;
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
}

var AB = {red:true,green:true};
var CM = 1;
var Cores = 1;
var Clock = 1;
var RUM = 1;
var tab = "RGB";
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
    }
}

function init() {
    setupPlayer();
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    setInterval(save, 3000);
    window.mainLoop = setInterval(gameLoop, 1000 / player.options.fps);
    window.ABLoop = setInterval(autoBuyer, 5000);
}

function autoBuyer() {
        if (player.spectrumLevel[4] == 1 && AB.red) while (buyUpgrade("red"));
        if (player.spectrumLevel[5] == 1 && AB.green) while (buyUpgrade("green"));
}

function gameLoop() {
    var dif = Date.now() - player.lastUpdate;
    player.lastUpdate = Date.now();
    player.spectrumTimer += dif;
    updateStats();
    increase(auto * (dif / 1000));
    if (player.level.green >= 1 && !player.unlock) document.getElementById("unlockBtn").classList.remove("hidden");
    if (player.level.blue[3] >= 1) document.getElementById("spectrumDiv").classList.remove("hidden");
    if (player.money.blue >= 1) document.getElementsByClassName("switch")[1].classList.remove("hidden");
    if (player.specced > 0) {
        document.getElementsByClassName("switch")[1].classList.remove("hidden");
        document.getElementsByClassName("switch")[3].classList.remove("hidden");
        document.getElementById("tabSpectrum").childNodes[1].classList.add("hidden");
        document.getElementById("tabSpectrum").childNodes[3].classList.remove("hidden");
    }
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    for (var i = 0; i < Object.keys(player.money).length; i++) {
        var tempKey = Object.keys(player.money)[i];
        document.getElementById(tempKey + "Count").innerHTML = formatNum(player.money[tempKey]);
        if (income[tempKey] >= 10) document.getElementById(tempKey + "Bar").innerHTML = formatNum(displayIncome(income[tempKey])) + "/s";
        else document.getElementById(tempKey + "Bar").innerHTML = "";
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

function press(name, num) {
    player.bars.red.mouse = num;
}

function increase(amnt) {
    var next = amnt * IR;
    for (var i = 0; i < (player.unlock ? 3 : 2) ; i++) {
        var temp = player.bars[Object.keys(player.bars)[i]];
        temp.width += next;
        player.money[temp.name] += (player.spectrumLevel[1] + 1) * Math.floor(temp.width / 256);
        next = Math.floor(temp.width / 256) * (temp.name == "red" ? IG : 8);
        temp.width = temp.width % 256;
    }
}

function RGBstring(color) {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
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
        case 1:
            return "Currency Gain: " + (player.spectrumLevel[1] + 1) + " per fill"
        case 2:
            return "Base Bar Increase: " + (2 + player.spectrumLevel[2] * 2) + "/256";
        case 3:
            return player.spectrumLevel[3] == 1 ? "Resets on Spectrum" : "Constantly Decaying";
        case 4:
            return player.spectrumLevel[4] == 1 ? "<div onclick='ToggleAB(`red`)' class='button' style='height:100%;width:50%;background-color:" + (AB.red ? "green" : "red") + "'>" + (AB.red ? "On" : "Off") + "</div>" : "Buy Red Yourself!";
        case 5:
            return player.spectrumLevel[5] == 1 ? "<div onclick='ToggleAB(`green`)' class='button' style='height:100%;width:50%;background-color:" + (AB.green ? "green" : "red") + "'>" + (AB.green ? "On" : "Off") + "</div>" : "Buy Green Yourself!";
        case 6:
            return "Current Multi per 10: " + (player.spectrumLevel[6] + 1) + "x";
        case 7:
            return "Current Multi per 10: " + (player.spectrumLevel[7] / 10 + 1.15) + "x";
        case 8:
            return player.spectrumLevel[8] == 1 ? "Blue is Unlocked Permanetly" : "Blue Still Costs 50G";
        case 9:
            return "You start with " + (player.spectrumLevel[9] * 100) + " lvls of Red and Green";
        case 10:
            return "R&G cost " + ((1 - PD) * 100) + "% less";
        case 11:
            return "Current Multi: " + formatNum(player.level.red,0) + "x";
        case 12:
            return "Current Multi: " + formatNum(Math.max(player.spectrum, 1),0) + "x";
        case 13:
            return player.spectrumLevel[13] == 1 ? "Better Formula" : "Regular Formula";
        case 14:
            return "Base Core Count: " + (player.spectrumLevel[13] == 1 ? 8 : 1);
    }
}

function updateStats() {
    PD = player.spectrumLevel[10] == 1 ? 0.5 : 1;
    Clock = Math.pow(2, player.level.blue[0]);
    if (player.spectrumLevel[2] == 1) {
        IR = (4 + (4 * player.level.blue[1])) * (player.spectrumLevel[6] == 1 ? Math.max(2 * Math.ceil(player.level.blue[1] / 10), 1) : 1);
        IG = (4 + (4 * player.level.blue[2])) * (player.spectrumLevel[6] == 1 ? Math.max(2 * Math.ceil(player.level.blue[2] / 10), 1) : 1);
    } else {
        IR = (2 + (2 * player.level.blue[1])) * (player.spectrumLevel[6] == 1 ? Math.max(2 * Math.ceil(player.level.blue[1] / 10), 1) : 1);
        IG = (2 + (2 * player.level.blue[2])) * (player.spectrumLevel[6] == 1 ? Math.max(2 * Math.ceil(player.level.blue[2] / 10), 1) : 1);
    }
    Cores = Math.pow(2, player.level.blue[3])* (player.spectrumLevel[14] == 1 ? 8 : 1);
    click = (1 + player.level.red / 2) * Math.pow((player.spectrumLevel[7] == 1 ? 1.25 : 1.15), (Math.floor(player.level.red / 10))) * Math.log10(CM);
    auto = (((player.level.green * 4) * Math.pow((player.spectrumLevel[7] == 1 ? 1.25 : 1.15), Math.floor(player.level.green / 10))) * (Clock * (Cores * Math.pow(1.05,Cores)))) * (player.spectrumLevel[0] == 1 ? Math.max(Math.log10(CM), 1): 1) * (player.spectrumLevel[11] == 1 ? player.level.red : 1) * (player.spectrumLevel[12] == 1 ? Math.max(player.spectrum, 1) : 1);
    price.red = 5 * Math.pow(1+((0.1 * Math.pow(1.2, Math.floor(player.level.red / 100))) * PD), player.level.red);
    price.green = 5 * Math.pow(1+((0.05 * Math.pow(1.2, Math.floor(player.level.green / 100))) * PD), player.level.green);
    price.blue[0] = 1 * Math.pow(16, player.level.blue[0]);
    price.blue[1] = 4 * Math.pow(2, player.level.blue[1]);
    price.blue[2] = 8 * Math.pow(2, player.level.blue[2]);
    price.blue[3] = 1048576 * Math.pow(Math.pow(512, Math.max(Math.floor(Math.max(player.level.blue[3] - 4, 0) * 1.25), 1)), player.level.blue[3]);
    if (player.bars.red.mouse == 1) income.red = ((auto + (click * 50)) * IR) / 256;
    else income.red = (auto * IR / 256);
    income.green = (income.red * IG / 256);
    income.blue = income.green * 8 / 256;
    if (player.spliced.red * player.spliced.green * player.spliced.blue > Number.MAX_VALUE) SR = Math.max(Math.log(Math.pow((player.spliced.red) / 16777216, 1 / (3 - player.spectrumLevel[13])) * Math.pow((player.spliced.green) / 16777216, 1 / (3 - player.spectrumLevel[13])) * Math.pow((player.spliced.blue) / 16777216, 1 / (3 - player.spectrumLevel[13]))) / Math.log(1000), 0);
        else SR = Math.max(Math.log(Math.pow((player.spliced.red * player.spliced.green * player.spliced.blue) / 16777216, 1 / (3 - player.spectrumLevel[13]))) / Math.log(1000), 0);
}       

function formatNum(num, dp, type) {
    if (dp == undefined) dp = 2;
    var suffix = ["K", "M", "B", "T", "Qu", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
    if (type == "Hz") {
        suffix = ["nHz", "&mu;Hz", "mHz", "Hz", "kHz", "MHz", "GHz", "THz", "PHz", "EHz", "ZHz", "YHz"]
        return (num / Math.pow(1024, Math.floor(Math.log(num) / Math.log(1024)))) + suffix[Math.floor(Math.log(num * 1024) / Math.log(1024))]
    } else if (num < 10000) return num.toFixed(Math.min(Math.max(2 - Math.floor(Math.log10(num)), 0), dp));
    else if (num < 1e36 && player.options.notation == "Default") return (num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))).toFixed(2 - Math.floor(Math.log10(num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))))) + suffix[Math.floor(Math.log(num) / Math.log(1000)) - 1];
    else return (num / Math.pow(10, Math.floor(Math.log10(num)))).toFixed(1) + "e" +Math.floor(Math.log10(num));
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
        if (load().version >= 0.001) player = load();
        if (player.version < 0.002) player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
        if (player.version < 0.003) {
            player.spectrum = 0;
            player.spectrumLevel = [1, 1, 1, 1, 0, 0];
        }
        if (player.version < 0.004) player.specced = 0;
        if (player.version < 0.005) {
            player.spliced = { red: 0, green: 0, blue: 0 };
            player.spectrumLevel = [0, 0, 0, 0, 0, 0, 0, 0];
        }
        if (player.version < 0.006) {
            var temp = [1, 3, 7, 12, 35, 50, 200, 500]
            for (var i = 0; i < player.spectrumLevel.length; i++) if (player.spectrumLevel[i] == 1) player.spectrum += temp[i];
            player.spectrumLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        if (player.version < 0.0065) player.options = { fast: false, fps: 50 };
        if (player.version < 0.007) player.options.notation = "Default";
        if(player.version < 0.008){
            player.spectrumTimer = 0;
            player.previousSpectrums = [{ time: 0, amount: 0 }, { time: 0, amount: 0 }, { time: 0, amount: 0 }, { time: 0, amount: 0 }, { time: 0, amount: 0 }];
        }
        if(player.version < 0.0085){
            player.lastUpdate = Date.now();
        }
        if (player.version < 0.009) {
            var temp = [1, 1, 3, 5, 10, 15, 50, 100, 500, 2000];
            for (var i = 0; i < player.spectrumLevel.length; i++) if (player.spectrumLevel[i] == 1) player.spectrum += temp[i];
            player.spectrumLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        if (player.version < 0.0091) {
            var temp = [1, 1, 3, 5, 5, 7, 10, 15, 50, 100, 500, 2000];
            for (var i = 0; i < player.spectrumLevel.length; i++) if (player.spectrumLevel[i] == 1) player.spectrum += temp[i];
            player.spectrumLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        if (player.unlock) document.getElementById('blueDiv').classList.remove('hidden');
        updateStats();
        player.version = v;
        statPage();
        document.getElementById("spectrumButton" + 4).childNodes[1].innerHTML = SUInfo(4);
        document.getElementById("spectrumButton" + 5).childNodes[1].innerHTML = SUInfo(5);
    }
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
        tempSave.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
        tempSave.bars.red.width = temp.bars.red.width;
        tempSave.bars.green.width = temp.bars.green.width;
        tempSave.bars.blue.width = temp.bars.blue.width;
        return tempSave;
    } else return false;
}

function reset(type) {
    if (type >= 1) {
        if (SR >= 1) {
            player = {
                version: v,
                money: { red: 0, green: 0, blue: 0 },
                level: { red: player.spectrumLevel[9] * 100, green: player.spectrumLevel[9] * 100, blue: [0, 0, 0, 0] },
                unlock: player.spectrumLevel[8] == 1,
                spectrum: Math.floor(SR) + player.spectrum,
                spectrumLevel: [player.spectrumLevel[0], player.spectrumLevel[1], player.spectrumLevel[2], player.spectrumLevel[3], player.spectrumLevel[4], player.spectrumLevel[5], player.spectrumLevel[6], player.spectrumLevel[7], player.spectrumLevel[8], player.spectrumLevel[9], player.spectrumLevel[10], player.spectrumLevel[11], player.spectrumLevel[12], player.spectrumLevel[13], player.spectrumLevel[14]],
                spliced: { red: 0, green: 0, blue: 0 },
                specced: player.specced + 1,
                options: player.options,
                previousSpectrums: [{ time: player.spectrumTimer, amount: Math.floor(SR) }, player.previousSpectrums[0], player.previousSpectrums[1], player.previousSpectrums[2], player.previousSpectrums[3]],
                spectrumTimer: 0,
                lastUpdate: player.lastUpdate,
            };
            player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
            player.bars.red.setup();
            if (!player.unlock) {
                document.getElementById('unlockBtn').classList.add('hidden');
                document.getElementById('blueDiv').classList.add('hidden');
            }
            document.getElementById("spectrumDiv").classList.add("hidden");
            updateStats();
            CM = 1;
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

function switchTab(name , num) {
    tab = name;
    for (var i = 0; i < document.getElementsByClassName("tab").length; i++) {
        if ("tab" + tab == document.getElementsByClassName("tab")[i].id) document.getElementsByClassName("tab")[i].classList.remove("hidden");
        else document.getElementsByClassName("tab")[i].classList.add("hidden");
    }
    for (var i = 0; i < document.getElementsByClassName("switch").length; i++) document.getElementsByClassName("switch")[i].classList.remove("active");
    document.getElementsByClassName("switch")[num].classList.add("active");
}

function displayIncome(num) {
    if (num == income.red) num *= player.spectrumLevel[1] + 1;
    if (num == income.green) num *= player.spectrumLevel[1] + 1;
    return(num)
}

function spliceColor(name) {
    player.spliced[name] += (player.money[name] / 10) * (name == "red" ? 0.5 : (name == "green" ? 1 : 128));
    player.money[name] -= player.money[name] / 10;
}

function statPage() {
    var table = document.getElementById("last5");
    for (var i = 0; i < table.rows.length; i++) {
        if (player.previousSpectrums[i].time != 0) table.rows[i].cells[0].innerHTML = (i == 0 ? "Your last Spectrum" : "Your Spectrum " + (i + 1) + " Spectrums ago") + " took " + (player.previousSpectrums[i].time >= 3600000 ? Math.floor(player.previousSpectrums[i].time / 3600000) + " hours and " + Math.floor((player.previousSpectrums[i].time % 3600000) / 60000) + " minutes" : (player.previousSpectrums[i].time >= 60000 ? Math.floor(player.previousSpectrums[i].time / 60000) + " minutes and " + Math.floor((player.previousSpectrums[i].time % 60000) / 1000) + " seconds" : (player.previousSpectrums[i].time >= 10000 ? Math.floor(player.previousSpectrums[i].time / 1000) + " seconds" : (player.previousSpectrums[i].time > 0 ? player.previousSpectrums[i].time + " millis" : 0)))) + " and earned you " + formatNum(player.previousSpectrums[i].amount, 0) + " Spectrum";
    }
}

function ToggleAB(name){
    if (name == "all") {
        AB.red = !AB.red;
        AB.green = !AB.green;
    } else AB[name] = !AB[name];
    document.getElementById("spectrumButton" + 4).childNodes[1].innerHTML = SUInfo(4);
    document.getElementById("spectrumButton" + 5).childNodes[1].innerHTML = SUInfo(5);
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
