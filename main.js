var v = 1.096;
var player = {
    money: { red: 0, green: 0, blue: 0 },
    inf: { red: 0, green: 0, blue: 0 },
    reduction:{red:0,green:0,blue:0},
    level: { red: 0, green: 0, blue: [0,0,0,0]},
    unlock: false,
    spliced: { red: 0, green: 0, blue: 0 },
    spectrum: 0,
    specced: 0,
    spectrumLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1,-1,-1],
    options: { fast: false, fps: 50, notation: "Default" },
    spectrumTimer: 0,
    previousSpectrums: [{ time: 0, amount: 0}, { time: 0, amount: 0}, { time: 0, amount: 0}, { time: 0, amount: 0}, { time: 0, amount: 0}],
    lastUpdate: Date.now(),
    prism: { active: false, potency: { red: -1, green: -1, blue: -1 }, cost: {}},
    black: 0,
    pop: false,
    AB: { red: true, green: true, blue: true },
    CM: 1,
    progress: [],
    advSpec: { unlock: false, multi: 1, max: 50, reduce: 0.1, time: 0, active: false, gain: 0, SR: 0 },
    logmath:false,
}

var p3 = true;
var ABInt = {red:2000,green:2000,blue:2000};
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
var IB = 8;
var RSS = 0;
var PD = 0;
var BPD = 0;
var SR = 0;
var potencyEff = {red:1/256, green:1/256,blue:1/256};
var SpecPrice = [1, 1, 3, 5, 5, 7, 10, 15, 25, 50, 100, 250, 500, 2500, 5000, 1e6, 1e8, 1e10,1e12];

function bar(n,r,g,b,elemid) {
    this.name = n;
    this.color = [r, g, b];
    this.width = 0;
    this.element = document.getElementById(elemid);
    this.mouse = 0;
    this.draw = function (dif) {
        if (this.mouse == 1) {
            player.CM += 5 * (dif / 1000);
            increase(Log.multi(Log.multi(click, 50), (dif / 1000)),dif);
        } else if (this.name == "red" && player.CM > 1 && player.spectrumLevel[3] == 0) {
            player.CM -= 7.5 * (dif / 1000);
            player.CM = Math.max(player.CM, 1);
        }
        if ((this.name == "red" ? Log.multi(Log.add(auto, player.bars.red.mouse === 1 ? click : 0), IR) : (this.name == "green" ? Log.div(Log.multi(Log.multi(Log.add(auto, player.bars.red.mouse === 1 ? click : 0), IR), IG), 256) : Log.div(Log.multi(Log.multi(Log.multi(Log.add(auto, player.bars.red.mouse === 1 ? click : 0), IR), IG),IB), 65536))).get("log") > Math.log10(128)) this.element.style.width = "100%";
        else this.element.style.width = Log.div(this.width,2.56).get("num") + "%";
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
    var dif = Date.now() - player.lastUpdate;
    player.lastUpdate = Date.now();
    player.spectrumTimer += dif;
    //simulateTime(dif);
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw();
    setInterval(save, 3000);
    window.mainLoop = setInterval(gameLoop, 1000 / player.options.fps);
    window.ABLoop = setInterval(autoBuyer, 10);
    window.ABcount = 0;
}

function autoBuyer() {
        ABcount += 10;
        if (player.AB.red || player.AB.green || player.AB.blue) p3 = false;
        if (player.spectrumLevel[4] == 1 && player.AB.red && ABcount%ABInt.red < 10) while (buyUpgrade("red"));
        if (player.spectrumLevel[5] == 1 && player.AB.green && ABcount % ABInt.green < 10) while (buyUpgrade("green"));
        if (player.spectrumLevel[9] == 1 && player.AB.blue && ABcount % ABInt.blue < 10) for (var i = 0; i < 4; i++) while (buyUpgrade("blue", i));
}

function gameLoop() {
    var dif = Date.now() - player.lastUpdate;
    player.lastUpdate = Date.now();
    player.spectrumTimer += dif;
    if (Date.now() % (player.advSpec.unlock ? 1000 : 60000) < dif) CalcSRgain();
    updateStats()
    increase(Log.multi(auto, (dif / 1000)), dif);
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw(dif);
    if (player.level.green >= 1 && !player.unlock) document.getElementById("unlockBtn").classList.remove("hidden");
    if (SumOf(player.spectrumLevel) >= 12) document.getElementsByClassName("switch")[5].classList.remove("hidden");
    if (player.prism.active) document.getElementsByClassName("switch")[6].classList.remove("hidden");
    if (player.level.blue[3] >= 1) document.getElementById("spectrumDiv").classList.remove("hidden");
    if (player.money.blue >= 1) document.getElementsByClassName("switch")[1].classList.remove("hidden");
    if (player.specced > 0) {
        document.getElementsByClassName("switch")[1].classList.remove("hidden");
        document.getElementsByClassName("switch")[3].classList.remove("hidden");
        document.getElementById("tabSpectrum").childNodes[1].classList.add("hidden");
        document.getElementById("tabSpectrum").childNodes[3].classList.remove("hidden");
    }
    if (SumOf(player.spectrumLevel) < 15) {
        var row = document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.insertRow(5);
        row.innerHTML = `<td><div id="spectrumButton15" class="button spec" onclick="buyUpgrade('spectrum', 15)"><div>Your Prism can Create Spectrum Bars</div><div>Not bought</div><div>Price 5 Spectrum</div><div></div></div></td><td><div id="spectrumButton16" class="button spec" onclick="buyUpgrade('spectrum', 16)"><div>Increase Blue = Product of Increase R&G</div><div>Not Bought</div><div>Price 5 Spectrum</div><div></div></div></td><td><div id="spectrumButton17" class="button spec" onclick="buyUpgrade('spectrum', 17)"><div>Price Reduction for First 3 Blue Upgrades Based on R&G Lvls</div><div>Not Bought</div><div>Price 5 Spectrum</div><div></div></div></td>`;
        var row2 = document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.insertRow(6);
        row.innerHTML = `<td></td><td><div id="spectrumButton18" class="button spec" onclick="buyUpgrade('spectrum', 18)"><div>Infinity and Beyond</div><div>Not Bought</div><div>Price 5 Spectrum</div><div></div></div></td><td></td>`;
        for (var i = 15; i < 19; i++) player.spectrumLevel[i] = 0;
    } 
    render[tab]();
    if (tab == "Spectrum") render[subtab.spectrum]();
}

function incomeBarDisplay(name) {
    var elem = document.getElementById(name + "Bar");
    if (player.prism.active) {
        var c = ["R","G","B"]
        var show = [1, 1, 1];
        for (var i = 0; i < 3; i++) if (player.bars[name].color[i] === 0) show[i] = 0;
        if (SumOf(show) === 0) elem.innerHTML = "~" + formatNum(displayIncome(name, "black")) + " Black/s";
        else if (SumOf(show) == 3 && player.bars[name].color[0] == 255 && player.bars[name].color[1] == 255 && player.bars[name].color[2] == 255 && player.spectrumLevel[15] == 1) elem.innerHTML = formatNum(displayIncome(name, "spectrum")) + " Spec/s";
        else if (SumOf(show) == 1 && !player.progress.includes(8)) elem.innerHTML = formatNum(displayIncome(name, show.indexOf(1))) + "/s";
        else {
            elem.innerHTML = "";
            for (var i = 0; i < 3; i++) {
                var temp = document.createElement("div");
                temp.style.fontSize = (1 / SumOf(show)) + "em";
                temp.innerHTML = c[i] + ": " + formatNum(displayIncome(name, i)) + "/s";
                if (SumOf(show) == 1 && player.progress.includes(8)) {
                    temp.style.fontSize = "0.5em";
                    if (i == 2) {
                        var tempb = document.createElement("div");
                        tempb.innerHTML = "Black: " + formatNum(displayIncome(name, "miniBlack")) + "/s";
                        tempb.style.fontSize = "0.5em";
                        
                    }
                }
                if (show[i]) elem.appendChild(temp);
                if(tempb) elem.appendChild(tempb);
            }
        }
    }else elem.innerHTML = formatNum(displayIncome(name)) + "/s";
}


var render = {
    Prism: function () {
        document.getElementById("blackCount").innerHTML = "You have " + formatNum(player.black) + " Blackness";
        window.mixCost = 1;
        window.blackBar = false;
        window.colorBar = false;
        for (var i = 0; i < 3; i++) {
            var temp = Object.keys(player.money)[i];
            var row = document.getElementById(temp + "Prism");
            var PVal = [[128, 32, 0], [64, 0, 16], [0, 0, 0]];
            if (!player.prism.active) for (var j = 0; j < 5; j += 2) row.cells[1].childNodes[j].value = PVal[i][j / 2];
            row.cells[0].childNodes[0].style.backgroundColor = "rgb(" + Math.floor(row.cells[1].childNodes[0].value) + "," + Math.floor(row.cells[1].childNodes[2].value) + "," + Math.floor(row.cells[1].childNodes[4].value) + ")";
            var colors = ["Red: ", "Green: ", "Blue: "]
            if (row.cells[1].childNodes[0].value + row.cells[1].childNodes[2].value + row.cells[1].childNodes[4].value == 0) {
                row.cells[2].innerHTML = "Black: <sup>" + formatNum(player.spectrum * potencyEff[temp] * (player.spectrumLevel[1] + 1) * (player.progress.includes(3) ? Cores : 1), 0) + "</sup>&frasl;<sub> " + formatNum(player.progress.includes(10) ? Math.pow(10, Math.log10(Math.max(player.black, Math.pow(256, 3))) * 0.85) : Math.max(player.black, Math.pow(256, 3))) + "</sub>";
                blackBar = true;
            } else if (row.cells[1].childNodes[0].value == 255 && row.cells[1].childNodes[2].value == 255 && row.cells[1].childNodes[4].value == 255 && player.spectrumLevel[15] == 1) row.cells[2].innerHTML = "Spectrum: " + (potencyEff[temp] > 1 ? formatNum(potencyEff[temp]*(player.spectrumLevel[1]+1),0) + "x " : "") + "log<sub>10</sub>(x)";
            else {
                row.cells[2].innerHTML = "<span></span><br><span></span><br><span></span>";
                var tempcount = 0;
                for (var j = 0; j < 5; j += 2) {
                    row.cells[2].childNodes[j].innerHTML = colors[j / 2] + formatNum((Math.floor(row.cells[1].childNodes[j].value) / 255 * potencyEff[Object.keys(potencyEff)[i]] * (player.spectrumLevel[1] + 1)), 5);
                    if (row.cells[1].childNodes[j].value === 0) tempcount++;
                }
                if (tempcount == 2) blackBar = true;
                colorBar = true;
            }
            if (player.prism.active) mixCost *= Math.pow(1.25, Math.pow(Math.floor(row.cells[1].childNodes[0].value), 1) + Math.pow(Math.floor(row.cells[1].childNodes[2].value), 1.05) + Math.pow(Math.floor(row.cells[1].childNodes[4].value), 1.1));
            if (player.prism.active && player.progress.includes(1)) {
                row.cells[3].childNodes[0].classList.remove("hidden");
                row.cells[3].childNodes[0].childNodes[1].innerHTML = formatNum(Math.pow(10, player.prism.potency[temp] + 3), 0) + " Spectrum";
            }
        }
        mixCost -= 1;
        if (player.prism.active) document.getElementById("mixButton").innerHTML = "Create a New Color Mix<br>This will cost: " + formatNum(mixCost, 2) + " Blackness";
        else document.getElementById("mixButton").innerHTML = "Activate the Prism and Embrace its Power!";
    },
    Upgrades : function(){
        for (var i = 0; i < (player.spectrumLevel[15] == -1 ? 15 : player.spectrumLevel.length); i++) {
            if (i != 5 && i != 4 && i != 9) document.getElementById("spectrumButton" + i).childNodes[1].innerHTML = SUInfo(i);
            document.getElementById("spectrumButton" + i).childNodes[2].innerHTML = "Price: " + formatNum(SpecPrice[i], 0) + " Spectrum ";
            if (player.spectrumLevel[i] == 1) document.getElementById("spectrumButton" + i).classList.add("bought");
            else document.getElementById("spectrumButton" + i).classList.remove("bought");
        }
    },
    RGB : function () {
        for (var i = 0; i < Object.keys(player.money).length; i++) {
            var tempKey = Object.keys(player.money)[i];
            if (player.inf[tempKey] > 0) {
                document.getElementById(tempKey + "Count").innerHTML = "";
                elem1 = document.createElement("span");
                elem1.innerHTML = formatNum(player.inf[tempKey], 0) + "\' + ";
                elem1.style.fontSize = "0.75em";
                elem2 = document.createElement("span");
                elem2.style.fontSize = "0.5em";
                elem2.style.display = "inline-block";
                elem2.innerHTML = formatNum(player.money[tempKey]);
                document.getElementById(tempKey + "Count").appendChild(elem1);
                document.getElementById(tempKey + "Count").appendChild(elem2);
            } else {
                document.getElementById(tempKey + "Count").innerHTML = formatNum(player.money[tempKey]);
            }
            
            if ((tempKey == "red" ? Log.multi(Log.add(auto, player.bars.red.mouse === 1 ? click : 0), IR) : (tempKey == "green" ? Log.div(Log.multi(Log.multi(Log.add(auto, player.bars.red.mouse === 1 ? click : 0), IR), IG), 256) : Log.div(Log.multi(Log.multi(Log.multi(Log.add(auto, player.bars.red.mouse === 1 ? click : 0), IR), IG), IB), 65536))).get("log") > Math.log10(128)) incomeBarDisplay(tempKey);
            else document.getElementById(tempKey + "Bar").innerHTML = "";
            document.getElementById(tempKey + "Splice").childNodes[0].innerHTML = "Splice " + player.level.blue[3] * 10 + "% " + tempKey + " into a spectrum";
            document.getElementById(tempKey + "Splice").childNodes[1].innerHTML = "Spliced " + tempKey + ": " + formatNum(player.spliced[tempKey]);
            if (tempKey == "blue") {
                for (var j = 0; j < 4; j++) {
                    if (j == 0 && player.progress.includes(7)) document.getElementById(tempKey + "Button" + j).childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey][j], 0) + "+" + Math.min(Math.floor(player.spectrumTimer / 300000), 5)
                    else document.getElementById(tempKey + "Button" + j).childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey][j], 0);
                    if (j == 3 && player.level.blue[3] >= 10) document.getElementById(tempKey + "Button" + j).childNodes[2].innerHTML = "Price: MAXED";
                    else document.getElementById(tempKey + "Button" + j).childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey][j]) + " " + tempKey;
                    switch (j) {
                        case 0: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current speed: " + formatNum(Clock, 0, "Hz");
                            break
                        case 1: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current fill: " + (Log.div(IR, 256).get("l") >= 2 ? "~" + formatNum(Log.floor(Log.div(IR, 256)), 0) : (Log.div(IR, 256).get("n") >= 1 ? formatNum(Log.floor(Log.div(IR, 256)), 0) + " & " : "") + formatNum(Log.mod(IR, 256), 0) + "/256");
                            break
                        case 2: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current fill: " + (Log.div(IG, 256).get("l") >= 2 ? "~" + formatNum(Log.floor(Log.div(IG, 256)), 0) : (Log.div(IG, 256).get("n") >= 1 ? formatNum(Log.floor(Log.div(IG, 256)), 0) + " & " : "") + formatNum(Log.mod(IG , 256), 0) + "/256");
                            break
                        case 3: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Core Count: " + formatNum(Cores, 0);
                            break
                    }
                }
            } else {
                if(player.pop){
                    document.getElementById(tempKey + "Button").childNodes[1].innerHTML = "L: " + formatNum(player.level[tempKey], 0);
                    document.getElementById(tempKey + "Button").childNodes[2].innerHTML = "P: " + formatNum(price[tempKey]);
                    document.getElementById(tempKey + "Button").childNodes[0].innerHTML = (tempKey.charAt(0).toUpperCase()).toString() + (tempKey.substr(1,tempKey.length-1)).toString();
                    document.getElementById(tempKey + "Button").style.width = "unset";
                }else{
                    document.getElementById(tempKey + "Button").childNodes[0].innerHTML = tempKey == "red" ? "Increase Click Strength" : "Increase Auto Strength";
                    document.getElementById(tempKey + "Button").style.width = "";
                    document.getElementById(tempKey + "Button").childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey]) + " " + tempKey;
                    document.getElementById(tempKey + "Button").childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey], 0);
                }
            }
        }
        document.getElementById("spectrumCountRGB").innerHTML = formatNum(player.spectrum, 0) + " Spectrum";
        document.getElementById("blackCountRGB").innerHTML = formatNum(player.black) + " Black";
        for (var i = 0; i < 3; i++) for (var j = 0; j < 5; j += 2) document.getElementById(Object.keys(player.money)[i] + "Prism").cells[1].childNodes[j].value = player.bars[Object.keys(player.money)[i]].color[j / 2];
    },
    Spectrum: function () {
        document.getElementById("spectrumCount").innerHTML = "You have " + formatNum(player.spectrum, 0) + " Spectrum";
    },
    Settings: function () {
        document.getElementsByClassName("setting")[4].childNodes[1].innerHTML = player.options.fast ? "On" : "Off";
        document.getElementsByClassName("setting")[5].childNodes[1].innerHTML = player.options.fps;
        document.getElementsByClassName("setting")[6].childNodes[1].innerHTML = "<b>" + player.options.notation + "</b>";
    },
    Stats: function () {
        var table = document.getElementById("last5");
        for (var i = 0; i < table.rows.length; i++) {
            if (player.previousSpectrums[i].time != 0) table.rows[i].cells[0].innerHTML = (i == 0 ? "Your last Spectrum" : "Your Spectrum " + (i + 1) + " Spectrums ago") + " took " + (player.previousSpectrums[i].time >= 3600000 ? Math.floor(player.previousSpectrums[i].time / 3600000) + " hours and " + Math.floor((player.previousSpectrums[i].time % 3600000) / 60000) + " minutes" : (player.previousSpectrums[i].time >= 60000 ? Math.floor(player.previousSpectrums[i].time / 60000) + " minutes and " + Math.floor((player.previousSpectrums[i].time % 60000) / 1000) + " seconds" : (player.previousSpectrums[i].time >= 10000 ? Math.floor(player.previousSpectrums[i].time / 1000) + " seconds" : (player.previousSpectrums[i].time > 0 ? player.previousSpectrums[i].time + " millis" : 0)))) + " and earned you " + formatNum(player.previousSpectrums[i].amount, 0) + " Spectrum";
        }
    },
    Progress: function () {
        var rows = document.getElementById("achieves").rows;
        for (var i = 0; i < 13; i++) rows[i].style.backgroundColor = "";
        for (var i = 0; i < player.progress.length; i++) rows[player.progress[i]-1].style.backgroundColor = "green";
    },
}

function pCheck(num) {
    if (!player.prism.active) return;
    switch(num){
        case 1:
            if (player.prism.active && !player.progress.includes(1)) player.progress.push(1);
            return
        case 2:
            if (!player.progress.includes(2) && !player.advSpec.unlock) {
                player.progress.push(2);
                player.advSpec.unlock = true;
                document.getElementById("advSpectrumReset").classList.remove("hidden");
            }
            return
        case 3:
            if (!player.progress.includes(3) && player.black >= 1e50) player.progress.push(3);
            return
        case 4:
            if (p3 && player.black > 1e64 && !player.progress.includes(4)) {
                player.progress.push(4);
                document.getElementById("spectrumButton" + 4).childNodes[0].innerHTML = "Auto Buy Max Red Level Every " + formatNum(2 / Math.pow(2, player.reduction.red + player.progress.includes(4)*3)) + "s";
                document.getElementById("spectrumButton" + 5).childNodes[0].innerHTML = "Auto Buy Max Green Level Every " + formatNum(2 / Math.pow(2, player.reduction.green + player.progress.includes(4)*3)) + "s";
                document.getElementById("spectrumButton" + 9).childNodes[0].innerHTML = "Auto Buy Max Blue Upgrades Every " + formatNum(2 / Math.pow(2, player.reduction.blue + player.progress.includes(4)*3)) + "s";
                ABInt = { red: 2000 / Math.pow(2, player.reduction.red + player.progress.includes(4)*3), green: 2000 / Math.pow(2, player.reduction.green + player.progress.includes(4)*3), blue: 2000 / Math.pow(2, player.reduction.blue + player.progress.includes(4)*3) };
            }
            return
        case 5:
            if (Math.floor(Math.log10(player.spliced.red)) == 128 && Math.floor(Math.log10(player.spliced.green)) == 128 && Math.floor(Math.log10(player.spliced.blue)) == 128 && !player.progress.includes(5)) player.progress.push(5);
            return
        case 6:
            if (player.money.blue >= 1e64 && player.level.blue[3] === 0 && !player.progress.includes(6)) player.progress.push(6);
            return
        case 7:
            if(!player.progress.includes(7))player.progress.push(7);
            return
        case 8:
            if (player.bars.red.color[0] == 255 && player.bars.green.color[1] == 255 && player.bars.blue.color[2] == 255 && !player.progress.includes(8)) player.progress.push(8);
            return
        case 9:
            if (player.previousSpectrums[0].amount / (player.previousSpectrums[0].time/1000) >= 100 && !player.progress.includes(9)) player.progress.push(9);
            return
        case 10:
            if (!player.progress.includes(10)) {
                var b = 0;
                var c = 0;
                for (var i = 0; i < player.bars.length; i++) if (SumOf(player.bars[Object.keys(player.bars)[i]].color) === 0) b = Log.add(b,Log.sub(getBlack(Object.keys(player.bars)[i], 1000, income[Object.keys(player.bars)[i]], 0, player.spectrum), player.black));
                else c += income[Object.keys(player.bars)[i]]
                if (b > c) player.progress.push(10);
            }
            return
        case 11:
            if (!player.progress.includes(11)) {
                var b = 0;
                var w = 0;
                for (var i = 0; i < Object.keys(player.bars).length; i++) {
                    if (SumOf(player.bars[Object.keys(player.bars)[i]].color) == 255 * 3) {
                        w = Log.add(w,getSpec(Object.keys(player.bars)[i], income[Object.keys(player.bars)[i]]));
                    }
                }
                for (var i = 0; i < Object.keys(player.bars).length; i++) {
                    if (SumOf(player.bars[Object.keys(player.bars)[i]].color) === 0) {
                        b = Log.add(b,Log.sub(getBlack(Object.keys(player.bars)[i], 1000, income[Object.keys(player.bars)[i]], w, player.spectrum), player.black));
                    }
                }
                if (w > b) player.progress.push(11);
            }
            return
        case 12:
            if (!player.progress.includes(12) && (player.money.red == 2.56e256 || player.money.green == 2.56e256 || player.money.blue == 2.56e256)) player.progress.push(12);
            return
        case 13:
            if (!player.progress.includes(13) && player.black == 2.56e256) player.progress.push(13);
            return
    }          
}

function press(name, num) {
    player.bars.red.mouse = num;
}

function increase(amnt, dif) {
    var next = Log.multi(amnt, IR);
    var specGain = 0;
    var tspec = player.spectrum;
    for (var i = 0; i < (player.unlock ? 3 : 2) ; i++) {
        var temp = player.bars[Object.keys(player.bars)[i]];
        temp.width = Log.add(temp.width, next);
        if (temp.color[0] == 255 && temp.color[1] == 255 && temp.color[2] == 255 && player.spectrumLevel[15] == 1) {
            player.spectrum = Log.add(player.spectrum, Log.multi(getSpec(temp.name, Log.multi(Log.div(temp.width, 256), (dif / 1000))), (dif / 1000)));
            specGain = Log.add(specGain,getSpec(temp.name, Log.multi(Log.div(temp.width, 256), (dif / 1000))));
        } else {
            player.money.red = Log.add(player.money.red, Log.div(Log.multi(Log.multi(Log.multi((player.prism.active ? potencyEff[temp.name] : 1), (player.spectrumLevel[1] + 1)), Log.floor(Log.div(temp.width, 256))), temp.color[0] / 255), Log.max(Log.multi(2.56e256, player.reduction.red), 1)));
            player.money.green = Log.add(player.money.green, Log.div(Log.multi(Log.multi(Log.multi((player.prism.active ? potencyEff[temp.name] : 1), (player.spectrumLevel[1] + 1)), Log.floor(Log.div(temp.width, 256))), temp.color[1] / 255), Log.max(Log.multi(2.56e256, player.reduction.green), 1)));
            player.money.blue = Log.add(player.money.blue, Log.div(Log.multi(Log.multi(Log.multi((player.prism.active ? potencyEff[temp.name] : 1), (player.spectrumLevel[1] + 1)), Log.floor(Log.div(temp.width, 256))), temp.color[2] / 255), Log.max(Log.multi(2.56e256, player.reduction.blue), 1)));
            if (temp.color[0] + temp.color[1] + temp.color[2] == 0) player.black = getBlack(temp.name, dif, Log.div(temp.width,256), specGain,tspec)
            if (temp.color.filter(function (item) { return item === 0 }).length == 2 && player.progress.includes(8)) player.black = Log.root(getBlack(temp.name, dif, Log.div(temp.width, 256), specGain, tspec),2);
        }
        next = Log.multi(Log.floor(Log.div(temp.width, 256)), (temp.name == "red" ? IG : IB));
        temp.width = Log.mod(temp.width, 256);
    }
    pCheck(13);
    pCheck(10);
    pCheck(11);
    pCheck(6);
   /* if (player.money.red > 2.56e256) player.money.red = 2.56e256;
    if (player.money.green > 2.56e256) player.money.green = 2.56e256;
    if (player.money.blue > 2.56e256) player.money.blue = 2.56e256;
    if (!player.pop) pCheck(12);
    if (player.money.blue.get("num") == 2.56e256 && player.money.green == 2.56e256 && player.money.red == 2.56e256 && player.pop == false)pop(1);
    else {
        for (var i = 0; i < 3 ; i++) if (player.money[Object.keys(player.bars)[i]] == 2.56e256) {
            if (player.reduction[Object.keys(player.bars)[i]] > 0) reduceProd(Object.keys(player.bars)[i]);
            else document.getElementById(Object.keys(player.bars)[i] + "Reduce").classList.remove("hidden");
        } else document.getElementById(Object.keys(player.bars)[i] + "Reduce").classList.add("hidden");
    }*/
}

function RGBstring(color) {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

function prismUpgrade(name,type) {  
    switch (type){
        case "potency":
            if (player.spectrum >= Math.pow(10, player.prism.potency[name] + 3)) {
                player.spectrum -= Math.pow(10, player.prism.potency[name] + 3);
                player.prism.potency[name]++;
                potencyEff.red = Math.pow(256, player.prism.potency.red)
                potencyEff.green = Math.pow(256, player.prism.potency.green)
                potencyEff.blue = Math.pow(256, player.prism.potency.blue)
                pCheck(2);
            }
            return
        case "cost":
}
}

function buyUpgrade(name, Bindex) {
    if (name == "spectrum") {
        if (player.spectrum >= SpecPrice[Bindex] && player.spectrumLevel[Bindex] < 1) {
            if (Bindex == 18) {
                player.money.red = Math.log10(player.money.red);
                player.money.green = Math.log10(player.money.green);
                player.money.blue = Math.log10(player.money.blue);
                player.spectrum = Math.log10(player.spectrum);
                player.black = Math.log10(player.black);
                player.logmath = true;
            }
            if(Bindex == 8) {
                player.unlock = true;
                document.getElementById('blueDiv').classList.remove('hidden');
            }
            player.spectrum -= SpecPrice[Bindex];
            player.spectrumLevel[Bindex]++;
            if (Bindex == 5 || Bindex == 4) {
                document.getElementById("spectrumButton" + Bindex).childNodes[1].innerHTML = SUInfo(Bindex);
            }
            updateStats();
            return true;
        }
    }else if (name == "blue") {
        if (player.money[name].get("log") >= price[name][Bindex].get("log")) {
            //if (Bindex == 3 && player.level.blue[3] >= 10) return false;
            player.money[name] = Log.sub(player.money[name], price[name][Bindex])
            player.level[name][Bindex]++;
            updateStats();
            if (Bindex == 3 && player.progress.includes(6)) CalcSRgain();
            return true;
        }
    }else if (player.money[name].get("log") >= price[name].get("log")) {
        player.money[name] = Log.sub(player.money[name],price[name])
        player.level[name]++;
        updateStats();
        if (player.level[name] % 100 === 0) CalcSRgain();
        return true;
    }
}

function SUInfo(num){
    switch(num){
        case 0:
            return "Current CM: " + Math.max(Math.log10(player.CM), 1).toFixed(1) + "x";
        case 2:
            return "Base Bar Increase: " + (2 + player.spectrumLevel[2] * 2) + "/256";
        case 4:
            return player.spectrumLevel[4] == 1 ? "<div onclick='ToggleAB(`red`)' class='button' style='height:100%;width:50%;background-color:" + (player.AB.red ? "green" : "red") + "'>" + (player.AB.red ? "On" : "Off") + "</div>" : "Buy Red Yourself!";
        case 5:
            return player.spectrumLevel[5] == 1 ? "<div onclick='ToggleAB(`green`)' class='button' style='height:100%;width:50%;background-color:" + (player.AB.green ? "green" : "red") + "'>" + (player.AB.green ? "On" : "Off") + "</div>" : "Buy Green Yourself!";
        case 6:
            return "Current Multi per 10: " + (player.spectrumLevel[6] + 1) + "x";
        case 7:
            return "Current Multi per 10: " + (1.15 + player.spectrumLevel[7] * 0.15).toFixed(2-player.spectrumLevel[7]) + "x";
        case 9:
            return player.spectrumLevel[9] == 1 ? "<div onclick='ToggleAB(`blue`)' class='button' style='height:100%;width:50%;background-color:" + (player.AB.blue ? "green" : "red") + "'>" + (player.AB.blue ? "On" : "Off") + "</div>" : "Buy Blue Yourself!";
        case 10:
            return "R&G cost " + ((1 - PD) * 100) + "% less";
        case 11:
            return "Current Multi: " + formatNum(player.level.red,0) + "x";
        case 12:
            return "Current Multi: " + formatNum(Math.max(Math.floor(Math.pow(player.spectrum, 0.8)), 1), 0) + "x";
        case 14:
            return "Base Core Count: " + (player.spectrumLevel[13] == 1 ? 8 : 1);
        case 16:
            return "Increase Blue: ~" + formatNum(Math.round(IB/256));
        default:
            return "";
    }
}

function updateStats() {
    PD = player.spectrumLevel[10] == 1 ? 0.5 : 1;
    if (player.spectrumLevel[2] == 1) {
        IR =  Log.multi(Log.add(4, Log.multi(4, player.level.blue[1])),(player.spectrumLevel[6] == 1 ? Log.max(Log.multi(2,Log.ceil(Log.div(player.level.blue[1],10))),1) : 1));
        IG = Log.multi(Log.add(4, Log.multi(4, player.level.blue[1])),(player.spectrumLevel[6] == 1 ? Log.max(Log.multi(2,Log.ceil(Log.div(player.level.blue[2],10))),1) : 1));
    } else {
        IR = Log.multi(Log.add(2, Log.multi(2, player.level.blue[1])), (player.spectrumLevel[6] == 1 ? Log.max(Log.multi(2, Log.ceil(Log.div(player.level.blue[1], 10))), 1) : 1));
        IG = Log.multi(Log.add(2, Log.multi(2, player.level.blue[1])), (player.spectrumLevel[6] == 1 ? Log.max(Log.multi(2, Log.ceil(Log.div(player.level.blue[2], 10))), 1) : 1));
    }
    if (player.spectrumLevel[16] == 1) IB = Log.multi(IR, IG);
    else IB = 8;
    if (player.spectrumLevel[17] == 1) BPD = Log.floor(Log.root(Log.div(Log.add(player.level.red, player.level.green), 100), 2))
    else BPD = 0;
    Cores = Log.multi(Log.pow(2, player.level.blue[3]), (player.spectrumLevel[14] == 1 ? 8 : 1));
    Clock = Log.pow(2, Log.floor(Log.log(Log.multi(Log.multi(Log.pow(2, Log.add(player.level.blue[0], (player.progress.includes(7) ? Math.min(Math.floor(player.spectrumTimer / 300000), 5) : 0))), Log.multi(Cores, Log.pow(1.025, Cores))), (player.progress.includes(12) ? 1 + SumOf(Object.values(player.reduction)) : 1)),2)));
    click = Log.multi(Log.multi(Log.add(2,Log.div(player.level.red, 2)), Log.pow((1.15 + player.spectrumLevel[7] * 0.15), Log.floor(Log.div(player.level.red, 10)))), Math.log10(Math.max(player.CM,1)));
    auto = Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(player.level.green, 16), Log.pow(Log.add(1.15 ,Log.multi( player.spectrumLevel[7], 0.15)), Log.floor(Log.div(player.level.green, 10)))), Clock),(player.spectrumLevel[0] == 1 ? Log.max(Log.log10(player.CM), 1) : 1)), (player.spectrumLevel[11] == 1 ? player.level.red : 1)), (player.spectrumLevel[12] == 1 ? Log.max(Log.floor(Log.pow(player.spectrum, 0.8)), 1) : 1));
    price.red = Log.multi(5 , Log.pow(Log.add(1,Log.multi(Log.multi(0.1, Log.pow(1.05, Math.max((player.level.red / 100)-1,0))), PD)), player.level.red));
    price.green = Log.multi(5, Log.pow(Log.add(1,Log.multi(Log.multi(0.05, Log.pow(1.05, Math.max((player.level.green / 100)-1,0))), PD)), player.level.green));
    price.blue[0] = Log.pow(16, Log.max(Log.sub(player.level.blue[0],BPD),0));
    price.blue[1] = Log.multi(4, Log.pow(2, Log.max(Log.sub(player.level.blue[1],BPD),0)));
    price.blue[2] = Log.multi(8, Log.pow(2, Log.max(Log.sub(player.level.blue[2],BPD),0)));
    price.blue[3] = Log.multi(1048576, Log.pow(Log.pow(512, Log.max(Log.floor(Log.multi(Log.max(Log.sub(player.level.blue[3], 4), 0), 1.2)), 1)), player.level.blue[3]));
    if (player.bars.red.mouse == 1) income.red = Log.div(Log.multi(Log.add(auto, Log.multi(click, 50)), IR), 256);
    else income.red = Log.div(Log.multi(auto, IR), 256);
    income.green = Log.div(Log.multi(income.red, IG), 256);
    income.blue = Log.div(Log.multi(income.green, IB), 256);
}

function CalcSRgain() {
        SR = Log.max(Log.multi(Log.multi(player.spliced.red, player.spliced.green), player.spliced.blue), 0);
        SR = Log.div(SR, 16777216);
        SR = Log.max(Log.log(SR, Log.pow(1000, (3 - player.spectrumLevel[13]))), 0);
        SR = Log.multi(SR,Log.max(Log.div(player.specced, 1000), 1));
        SR = Log.multi(SR , Log.floor(Log.div(Log.add(Log.floor(Log.div(player.level.green, 100)), Log.floor(Log.div(player.level.red, 100))), 10)));
        if (player.progress.includes(6)) SR = Log.multi(SR,Log.add(1,Log.div(player.level.blue[3], 10)));
        if (player.progress.includes(9)) SR = Log.multi(SR,Log.add(1, Log.log10(Log.max(Log.div(player.spectrumTimer, 60000), 1))));
        SR = Log.pow(SR, 1 + (player.reduction.red + player.reduction.green + player.reduction.blue) / 100);
        document.getElementById("spectrumReset").childNodes[0].innerHTML = "Reset all progress and gain";
        document.getElementById("spectrumReset").childNodes[1].innerHTML = "<b>" + formatNum(Log.floor(SR), 0) + " Spectrum</b>";
        document.getElementById("spectrumReset").childNodes[2].innerHTML = formatNum(Log.multi(Log.mod(SR, 1), 100)) + "% towards next";
        if (player.advSpec.unlock) {
                var prevmulti = player.advSpec.multi;
                player.advSpec.multi = parseInt(document.getElementById("advSpectrumReset").childNodes[1].childNodes[0].value);
                if (player.advSpec.active && player.advSpec.multi != prevmulti) {
                    if (player.advSpec.multi == 1) player.advSpec.active = false;
                    player.advSpec.time *= player.advSpec.multi / prevmulti;
                }
                var num = (player.advSpec.active ? player.advSpec.SR : SR);
                player.advSpec.gain = 0;
                for (var i = 0; i < player.advSpec.multi; i++) {
                    player.advSpec.gain += num;
                    if(i%10 === 0)num *= 1-player.advSpec.reduce;
                }
                player.advSpec.gain = Math.floor(player.advSpec.gain);
        if (player.advSpec.multi > 1) {
            document.getElementById("spectrumReset").childNodes[0].innerHTML = "<b>Start Advanced Spectrum</b>";
            document.getElementById("spectrumReset").childNodes[1].innerHTML = "";
            document.getElementById("spectrumReset").childNodes[2].innerHTML = formatTime(player.spectrumTimer * player.advSpec.multi)
            if (player.advSpec.active) {
                document.getElementById("spectrumReset").childNodes[0].innerHTML = "<b>Advanced Spectrum Finishes in</b>";
                document.getElementById("spectrumReset").childNodes[2].innerHTML = formatTime(player.advSpec.time - player.spectrumTimer);
                if (player.advSpec.time <= player.spectrumTimer) {
                    document.getElementById("spectrumReset").childNodes[0].innerHTML = "Reset all progress and gain";
                    document.getElementById("spectrumReset").childNodes[1].innerHTML = "<b>" + formatNum(player.advSpec.gain, 0) + " Spectrum</b>";
                    document.getElementById("spectrumReset").childNodes[2].innerHTML = "Adv spectrum complete!";
                    document.getElementById("advSpectrumReset").childNodes[1].childNodes[0].value = player.advSpec.multi;
                }
            }
        }
        document.getElementById("advSpectrumReset").childNodes[2].innerHTML = formatNum(player.advSpec.gain, 0) + " Spectrum";
    }
   
}

function formatNum(num, dp, type) {
    if (typeof num !== "number") {
        if (num.typ === "num") {
            num = num.get("num");
        } else {
            var suffix = ["K", "M", "B", "T", "Qu", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
            num = num.get("log");
            let m = Math.pow(10, num % 1)
            let e = Math.floor(num);
            if (num < 1000) return m.toFixed(1)+"e"+e;
            else if (num < 1e36 && player.options.notation == "Default") return m.toFixed(0) + "e" + (e / Math.pow(1000, Math.floor(Math.log(e) / Math.log(1000)))).toFixed(2 - Math.floor(Math.log10(e / Math.pow(1000, Math.floor(Math.log(e) / Math.log(1000)))))) + suffix[Math.floor(Math.log(e) / Math.log(1000)) - 1];
            else return "e" + (e / Math.pow(10, Math.floor(Math.log10(e)))).toFixed(1) + "e" + Math.floor(Math.log10(e));
        }
    }
    if (dp == undefined) dp = 2;
    var suffix = ["K", "M", "B", "T", "Qu", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
    if (type == "Hz") {
        function createSuffix(num) {
            var smallHz = ["n", "&mu;", "m", ""]
            var preHz = ["","k", "M", "G", "T", "P", "E", "Z", "Y", "N"]
            if (num < 3) return smallHz[num] + "Hz";
            num -= 3;
            if (num < 10) return preHz[num] + "Hz";
            if (num < 20) return "X" + preHz[num%10] + "Hz";
            if (num == 20) return "bXHz";
            var pre2 = ["b", "t", "q","Q","s","S"];
            return pre2[Math.floor((num - 20) / 10)] + "X" + preHz[(num % 10)] + "Hz";
        }   
        return num / Math.pow(1024, Math.floor(Math.log(num) / Math.log(1024))) + createSuffix(Math.floor(Math.log(num) / Math.log(1024)));
    } else if (num < 10000) return num.toFixed(Math.min(Math.max(dp - Math.floor(Math.log10(num)), 0), dp));
    else if (num < 1e36 && player.options.notation == "Default") return (num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))).toFixed(2 - Math.floor(Math.log10(num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))))) + suffix[Math.floor(Math.log(num) / Math.log(1000)) - 1];
    else return (num / Math.pow(10, Math.floor(Math.log10(num)))).toFixed(1) + "e" + Math.floor(Math.log10(num));
}

function unlockBlue() {
    if (player.money.green.get("n") >= 50) {
        player.money.green = Log.sub(player.money.green,50);
        player.unlock = true;
        document.getElementById('unlockBtn').classList.add('hidden');
        document.getElementById('blueDiv').classList.remove('hidden');
    }
}

function save(name) {
    if (name == "Export")
    {
        setTimeout(pop,10,2);
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
        if (player.version < 1.08) {
            player.inf = { red: 0, green: 0, blue: 0 };
            player.reduction = { red: 0, green: 0, blue: 0 };
            player.pop = false;
        }
        if (player.version < 1.09) for (var i = 0; i < 3; i++) player.spectrumLevel.push(-1);
        if (player.version < 1.091) player.progress = [];
        if (player.version < 1.092) player.AB = { red: true, green: true, blue: true };
        if (player.version < 1.093) player.CM = 1;
        if (player.version < 1.094) {
            if (player.progress.includes(9)) {
                player.progress.splice(player.progress.indexOf(8), 1)
                player.progress.push(12);
            }
            if (player.progress.includes(8)) {
                player.progress.splice(player.progress.indexOf(7), 1)
                player.progress.push(11);
            }
            if (player.progress.includes(7)) {
                player.progress.splice(player.progress.indexOf(6), 1)
                player.progress.push(10);
            }
            if (player.progress.includes(6)) {
                player.progress.splice(player.progress.indexOf(5), 1)
                player.progress.push(9);
            }
            if (player.progress.includes(5)) {
                player.progress.splice(player.progress.indexOf(4), 1)
                player.progress.push(7);
            } 
        }
        if (player.version < 1.095) player.advSpec = { unlock: false, multi: 1, max: 10, reduce: 0.1, time: 0, active: false, gain: 0, SR: 0 };
        if (player.version < 1.096) {
            player.prism.potency = { red: -1, green: -1, blue: -1 }
            player.advSpec.reduce = 0.1;
            player.advSpec.max = 50;
        }
        if (player.unlock) document.getElementById('blueDiv').classList.remove('hidden');
        else document.getElementById('blueDiv').classList.add('hidden');
        if (SumOf(player.spectrumLevel) >= 12) document.getElementsByClassName("switch")[5].classList.remove("hidden");
        if (player.prism.active) document.getElementById("newupgrades").classList.remove("hidden");
        else document.getElementById("newupgrades").classList.add("hidden");
        if (SumOf(player.spectrumLevel) >= 15 ) {
            var row;
            if(document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows.length == 6)row = document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows[5];
            else row =  document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.insertRow(5);
            row.innerHTML = `<td><div id="spectrumButton15" class="button spec" onclick="buyUpgrade('spectrum', 15)"><div>Your Prism can Create Spectrum Bars</div><div>Not bought</div><div>Price 5 Spectrum</div><div></div></div></td><td><div id="spectrumButton16" class="button spec" onclick="buyUpgrade('spectrum', 16)"><div>Increase Blue = Product of Increase R&G</div><div>Not Bought</div><div>Price 5 Spectrum</div><div></div></div></td><td><div id="spectrumButton17" class="button spec" onclick="buyUpgrade('spectrum', 17)"><div>Price Reduction for First 3 Blue Upgrades Based on R&G Lvls</div><div>Not Bought</div><div>Price 5 Spectrum</div><div></div></div></td>`;
            if (document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows.length == 7) var row2 = document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows[6];
            else var row2 = document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.insertRow(6);
            row2.innerHTML = `<td></td><td><div id="spectrumButton18" class="button spec" onclick="buyUpgrade('spectrum', 18)"><div>Infinity and Beyond</div><div>Not Bought</div><div>Price 5 Spectrum</div><div></div></div></td><td></td>`;
            document.getElementById("newupgrades").classList.add("hidden");
        } else if (document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows.length >= 6) {
            document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.deleteRow(6);
            document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.deleteRow(5);
        }
        if (player.prism.active) document.getElementById("blackCountRGB").classList.remove("hidden");
        else document.getElementById("blackCountRGB").classList.add("hidden");
        if (player.specced > 0) document.getElementById("spectrumCountRGB").classList.remove("hidden");
        else document.getElementById("spectrumCountRGB").classList.add("hidden");
        if (player.advSpec.unlock) document.getElementById("advSpectrumReset").classList.remove("hidden");
        else document.getElementById("advSpectrumReset").classList.add("hidden");
        document.getElementById("advSpectrumReset").childNodes[1].childNodes[0].value = player.advSpec.multi;
        updateStats();
        CalcSRgain();
        document.getElementById("spectrumButton" + 4).childNodes[1].innerHTML = SUInfo(4);
        document.getElementById("spectrumButton" + 5).childNodes[1].innerHTML = SUInfo(5);
        document.getElementById("spectrumButton" + 9).childNodes[1].innerHTML = SUInfo(9);
        document.getElementById("spectrumButton" + 4).childNodes[0].innerHTML = "Auto Buy Max Red Level Every " + formatNum(2 / Math.pow(2, player.reduction.red + player.progress.includes(4)*3)) + "s";
        document.getElementById("spectrumButton" + 5).childNodes[0].innerHTML = "Auto Buy Max Green Level Every " + formatNum(2 / Math.pow(2, player.reduction.green + player.progress.includes(4)*3)) + "s";
        document.getElementById("spectrumButton" + 9).childNodes[0].innerHTML = "Auto Buy Max Blue Upgrades Every " + formatNum(2 / Math.pow(2, player.reduction.blue + player.progress.includes(4)*3)) + "s";
        ABInt = { red: 2000 / Math.pow(2, player.reduction.red + player.progress.includes(4) * 3), green: 2000 / Math.pow(2, player.reduction.green + player.progress.includes(4) * 3), blue: 2000 / Math.pow(2, player.reduction.blue + player.progress.includes(4) * 3) };
        potencyEff.red = Math.pow(256, player.prism.potency.red)
        potencyEff.green = Math.pow(256, player.prism.potency.green)
        potencyEff.blue = Math.pow(256, player.prism.potency.blue)
    }
    player.version = v;
}

function load(name) {
    if (name == "Import") {
        var temp = prompt("Enter you save:", "");
        if (temp != null && temp != undefined && temp != "" && temp != false) {
            if (parseInt(temp) === player.clock / 1024^3) pCheck(7);
            if (typeof (JSON.parse(atob(temp))) == 'object') {
                localStorage.setItem("RGBsave", temp);
                setupPlayer();
            }
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
        if (player.progress.includes(5)) {
            spliceColor('red');
            spliceColor('green');
            spliceColor('blue');
        }
        CalcSRgain();
        if (SR >= 1 || force) {
            if (player.advSpec.multi > 1) {
                if (player.advSpec.active) {
                    if(player.advSpec.time <= player.spectrumTimer){
                    player.advSpec.active = false;
                    player.advSpec.multi = 1;
                    player.spectrum += player.advSpec.gain;
                    player.previousSpectrums = [{ time: player.spectrumTimer, amount: player.advSpec.gain }, player.previousSpectrums[0], player.previousSpectrums[1], player.previousSpectrums[2], player.previousSpectrums[3]];
                }else return
                } else {
                    player.advSpec.SR = SR;
                    player.advSpec.time =player.spectrumTimer * (player.advSpec.multi + 1);
                    player.advSpec.active = true;
                    return
                }
            } else {
                player.spectrum = Log.add(player.spectrum,Log.floor(SR));
                player.previousSpectrums = [{ time: player.spectrumTimer, amount: SR }, player.previousSpectrums[0], player.previousSpectrums[1], player.previousSpectrums[2], player.previousSpectrums[3]];
            }
            if (player.specced == 0) document.getElementById("spectrumCountRGB").classList.remove("hidden");
            for (var i = 0; i < 3; i++) player.bars[Object.keys(player.money)[i]].width = 0;
            player.money = { red: 0, green: 0, blue: 0 };
            player.level = { red: 0, green: 0, blue: [0, 0, 0, 0] };
            player.reduction = { red: 0, green: 0, blue: 0 };
            player.inf = { red: 0, green: 0, blue: 0 };
            player.unlock = player.spectrumLevel[8] == 1;
            player.spliced = { red: 0, green: 0, blue: 0 };
            player.specced += 1;
            player.spectrumTimer = 0;
            if (!player.unlock) {
                document.getElementById('unlockBtn').classList.add('hidden');
                document.getElementById('blueDiv').classList.add('hidden');
            }
            document.getElementById("spectrumDiv").classList.add("hidden");
            player.CM = 1;
            updateStats();
            document.getElementById("spectrumButton" + 4).childNodes[0].innerHTML = "Auto Buy Max Red Level Every " + formatNum(2 / Math.pow(2, player.reduction.red)) + "s";
            document.getElementById("spectrumButton" + 5).childNodes[0].innerHTML = "Auto Buy Max Green Level Every " + formatNum(2 / Math.pow(2, player.reduction.green)) + "s";
            document.getElementById("spectrumButton" + 9).childNodes[0].innerHTML = "Auto Buy Max Blue Upgrades Every " + formatNum(2 / Math.pow(2, player.reduction.blue)) + "s";
            CalcSRgain();
            pCheck(9);
            if (!force) pCheck(1);
        }
    } else {
        player = {
            version: v,
            money: { red: 0, green: 0, blue: 0 },
            level: { red: 0, green: 0, blue: [0, 0, 0, 0] },
            inf: { red: 0, green: 0, blue: 0 },
            reduction: { red: 0, green: 0, blue: 0 },
            unlock: false,
            spectrum: 0,
            spectrumLevel: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-1,-1],
            specced: 0,
            spliced: { red: 0, green: 0, blue: 0 },
            options: { fast: false, fps: 50, notation: "Default" },
            spectrumTimer: 0,
            previousSpectrums: [{ time: 0, amount: 0 }, { time: 0, amount: 0 }, { time: 0, amount: 0 }, { time: 0, amount: 0 }, { time: 0, amount: 0 }],
            lastUpdate: Date.now(),
            prism: { active: false, potency: { red: -1, green: -1, blue: -1 }, pcost: { red: 100, green: 100, blue: 100 }, },
            black: 0,
            pop: false,
            AB: { red: true, green: true, blue: true },
            CM:1,
            progress: [],
            advSpec: { unlock: false, multi: 1, max: 10, reduce: 0.1, time: 0, gain:0, SR: 0},
        };
        switchTab("RGB",0);
        player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
        player.bars.red.setup();
        updateStats();
        document.getElementById('unlockBtn').classList.add('hidden');
        document.getElementById('blueDiv').classList.add('hidden');
         document.getElementsByClassName("switch")[1].classList.add("hidden");
         document.getElementById("spectrumDiv").classList.add("hidden");
         document.getElementById("blackCountRGB").classList.add("hidden");
         document.getElementById("spectrumCountRGB").classList.add("hidden");
         document.getElementById("spectrumButton" + 4).childNodes[0].innerHTML = "Auto Buy Max Red Level Every " + formatNum(2 / Math.pow(2, player.reduction.red)) + "s";
         document.getElementById("spectrumButton" + 5).childNodes[0].innerHTML = "Auto Buy Max Green Level Every " + formatNum(2 / Math.pow(2, player.reduction.green)) + "s";
         document.getElementById("spectrumButton" + 9).childNodes[0].innerHTML = "Auto Buy Max Blue Upgrades Every " + formatNum(2 / Math.pow(2, player.reduction.blue)) + "s";
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

function mix(PC) {
    if (!player.prism.active) {
        if (PC == undefined) {
            setTimeout(pop, 10, 0);
            return;
        } else {
            if (PC) {
                reset(1, true);
                player.spectrum = 0;
                player.specced = 0;
                document.getElementById("blackCountRGB").classList.remove("hidden");
                document.getElementById("newupgrades").classList.add("hidden");
                player.prism.active = true;
                mixCost = 0;
            } else return
        }
    }
    if(!blackBar) if (!confirm("You are about to create a prism that has no way of creating blackness!\n Are you sure you want to do this?")) return;
    if (!colorBar) if (!confirm("You are about to create a prism that has no production for colors(this means u can't fesible make black for next prism)!\n Are you sure you want to do this?")) return;
    if (player.black >= mixCost) {
        pCheck(3);
        pCheck(4);
        mixReset();
        if (player.progress.includes(13)) player.black -= mixCost;
        else player.black = 0;
    } else if (player.spectrum >= mixCost / Math.max(player.black,1) && confirm("Do you want to pay the missing blackness using Spectrum? \nThis will cost " + formatNum(mixCost / Math.max(player.black,1), 0) + " Spectrum. This will leave with "+ formatNum(player.spectrum - (mixCost / Math.max(player.black,1)),0) +" Spectrum.")) {
        pCheck(3);
        pCheck(4);
        player.spectrum -= mixCost / Math.max(player.black, 1);
        mixReset();
         player.black = 0;
    }
    function mixReset() {
        var csum = 0;
        p3 = true;
            for (var i = 0; i < 3; i++) {
                var temp = Object.keys(player.money)[i];
                var row = document.getElementById(temp + "Prism");
                player.bars[temp].color = [Math.floor(row.cells[1].childNodes[0].value), Math.floor(row.cells[1].childNodes[2].value), Math.floor(row.cells[1].childNodes[4].value)];
                csum += SumOf(player.bars[temp].color);
                switchTab("RGB", 0);
                reset(1, true);
            }
            if (csum === 0) pCheck(2);
            pCheck(8);
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

function displayIncome(name, index) {
    var num = 0;
    if (player.prism.active) {
        if (index == "black") num = Log.sub(getBlack(name, 1000, income[name], 0, player.spectrum), player.black);
        else if (index == "miniBlack") num = Log.sub(Log.sqrt(getBlack(name, 1000, income[name], 0, player.spectrum)), player.black);
        else if (index == "spectrum") num = getSpec(name,income[name]);
        else num = Log.div(Log.multi(Log.multi(Log.multi(income[name], potencyEff[name]), (player.spectrumLevel[1]+1)),Log.div(player.bars[name].color[index],255)), Log.max(Log.multi(player.reduction[name], 2.56e256),1));
    }else num = income[name] * (player.spectrumLevel[1]+1);
    return(num)
}

function spliceColor(name) {
    if (player.level.blue[3] === 0) return;
    player.spliced[name] = Log.add(player.spliced[name], Log.multi(player.money[name], player.level.blue[3] / 10));
    player.money[name] =Log.sub(player.money[name],Log.multi(player.money[name], Math.min(player.level.blue[3] / 10, 1)));
    if (player.spliced[name] < 0) player.spliced[name] = 0;
    CalcSRgain();
    pCheck(5);
}

function SumOf(arr) {
    return arr.reduce((acc, num) => acc + num);
}

function ToggleAB(name){
    if (name == "all") {
        player.AB.red = !player.AB.red;
        player.AB.green = !player.AB.green;
        player.AB.blue = !player.AB.blue;
    } else player.AB[name] = !player.AB[name];
    document.getElementById("spectrumButton" + 4).childNodes[1].innerHTML = SUInfo(4);
    document.getElementById("spectrumButton" + 5).childNodes[1].innerHTML = SUInfo(5);
    document.getElementById("spectrumButton" + 9).childNodes[1].innerHTML = SUInfo(9);
}

function pop(num) {
    document.getElementsByClassName("popup")[num].style.visibility = "visible";
    document.body.onmousemove = function (event) {
        document.getElementsByClassName("popup")[num].style.top = event.clientY + "px";
        document.getElementsByClassName("popup")[num].style.left ="calc(" + event.clientX + "px - 12.5%)";
    };
    document.body.onclick = function () {
        document.getElementsByClassName("popup")[num].style.visibility = "hidden";
        if (num == 0) {
            mix(true);
        } else if (num == 1) {
            reduceProd("red");
            reduceProd("green");
            reduceProd("blue");
            player.pop = true;
        }
        document.body.onclick = "";
        document.body.onmousemove = "";
    }
}
    
function reduceProd(name) {
    player.money[name] = 0;
    player.reduction[name]++;
    player.inf[name]++;
    document.getElementById("spectrumButton" + 4).childNodes[0].innerHTML = "Auto Buy Max Red Level Every " + formatNum(2 / Math.pow(2, player.reduction.red + player.progress.includes(4)*3)) + "s";
    document.getElementById("spectrumButton" + 5).childNodes[0].innerHTML = "Auto Buy Max Green Level Every " + formatNum(2 / Math.pow(2, player.reduction.green + player.progress.includes(4)*3)) + "s";
    document.getElementById("spectrumButton" + 9).childNodes[0].innerHTML = "Auto Buy Max Blue Upgrades Every " + formatNum(2 / Math.pow(2, player.reduction.blue + player.progress.includes(4)*3)) + "s";
    ABInt = { red: 2000 / Math.pow(2, player.reduction.red + player.progress.includes(4)*3), green: 2000 / Math.pow(2, player.reduction.green + player.progress.includes(4)*3), blue: 2000 / Math.pow(2, player.reduction.blue + player.progress.includes(4)*3) };
}

window.addEventListener("keypress",function(event) {
    var key = event.keyCode || event.which;
    p3 = false;
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

function simulateTime(time) {
    console.log("You were offline for " + formatTime(time));
    player.spectrumTimer += time;
    let bprod = [auto * IR / 256, auto * IR / 256 * IG / 256, auto * IR / 256 * IG / 256 * IB / 256];
    const color = { red: [player.bars.red.color[0], player.bars.green.color[0], player.bars.blue.color[0]], green: [player.bars.red.color[1], player.bars.green.color[1], player.bars.blue.color[1]], blue: [player.bars.red.color[2], player.bars.green.color[2], player.bars.blue.color[2]] };
    const names = ["red", "blue", "green"];
    const prod = {red:0,green:0,blue:0,spec:0}
    for (var i = 0; i < names.length; i++) {
        if (player.bars[names[i]].color[0] == 255 && player.bars[names[i]].color[1] == 255 && player.bars[names[i]].color[2] == 255 && player.spectrumLevel[15] === 1) prod.spec += getSpec(names[i],bprod[i])
            else{
            prod[names[i]] = color[names[i]].reduce(function(acc, val, i){return acc + (val / 255 * bprod[i] * (player.prism.active ? potencyEff[names[i]] : player.spectrumLevel[1] + 1) / Math.max(2.56e256 * player.reduction.red, 1))},0)
        }
    }
    for (var i = 0; i < names.length; i++) if (SumOf(player.bars[names[i]].color) === 0) player.black = getBlack(names[i], time, bprod[i], prod.spec, player.spectrum);
    while (time > 0) {
        console.log(prod);
        let nextUp = Math.min((price.red - player.money.red) / prod.red, (price.green - player.money.green) / prod.green, (price.blue[0] - player.money.blue) / prod.blue, (price.blue[1] - player.money.blue) / prod.blue, (price.blue[2] - player.money.blue) / prod.blue, (price.blue[3] - player.money.blue) / prod.blue)
        if (5000 > nextUp) {
            player.money.red += prod.red * Math.min(5000, time) / 1000;
            player.money.green += prod.green * Math.min(5000, time) / 1000;
            player.money.blue += prod.blue * Math.min(5000, time) / 1000;
            player.spectrum += prod.spec * Math.min(5000, time) / 1000;
            time -= Math.min(5000, time)
            
        } else {
            player.money.red += prod.red * Math.min(nextUp, time) / 1000;
            player.money.green += prod.green * Math.min(nextUp, time) / 1000;
            player.money.blue += prod.blue * Math.min(nextUp, time) / 1000;
            player.spectrum += prod.spec * Math.min(nextUp, time) / 1000;
            time -= Math.min(nextUp, time);
        }
        if (player.money.red > 2.56e256) player.money.red = 2.56e256;
        if (player.money.green > 2.56e256) player.money.green = 2.56e256;
        if (player.money.blue > 2.56e256) player.money.blue = 2.56e256;
        while (buyUpgrade("red"));
        while (buyUpgrade("green"));
        for (var i = 0; i < 4; i++) while (buyUpgrade("blue", i));
        bprod = [auto * IR, auto * IR / 256 * IG, auto * IR / 256 * IG / 256 * IB];
        for (var i = 0; i < names.length;i++){
            prod[names[i]] = color[names[i]].reduce((acc, val, i) => acc + val * bprod[i])
            prod[names[i]] = prod.red * (player.prism.active ? potencyEff[names[i]] : player.spectrumLevel[1] + 1) / Math.max(2.56e256 * player.reduction.red, 1);
        }
        updateStats();
    }
    
}

function formatTime(num){
    return (num >= 3600000 ? Math.floor(num / 3600000) + " hours and " + Math.floor((num % 3600000) / 60000) + " mins" : (num >= 60000 ? Math.floor(num / 60000) + " mins and " + Math.floor((num % 60000) / 1000) + " secs" : (num >= 10000 ? Math.floor(num / 1000) + " secs" : (num > 0 ? num + " millis" : 0))));
}

function getSpec(name, prod) {
    let blackmulti = 1;
    if (player.progress.includes(11)) blackmulti = Log.max(Log.log10(player.black),1);
    let logprod = Log.max(Log.floor(Log.pow(Log.max(Log.log10(prod),0),2)), 0);
    let rpow = Log.add(1, Log.div(Log.add(Log.add(player.reduction.red, player.reduction.green), player.reduction.blue), 100));
    let logpot = Log.pow(Log.log10(potencyEff[name]),2);
    let coreMulti = 1;
    if (player.progress.includes(6)) coreMulti = Log.add(1, Log.div(player.level.blue[3], 10));
    let timeMulti = 1;
    if (player.progress.includes(9)) timeMulti = Log.add(1, Log.log10(Log.max(Log.div(player.spectrumTimer, 60000), 1)));
    return Log.pow(Log.multi(Log.multi(Log.multi(Log.multi(blackmulti, logprod), logpot), coreMulti), timeMulti), rpow);
}

function getBlack(name, time, prod, specprod,spectrum) {
    let A = player.progress.includes(10) ? 1.85 : 2;
    let mults = Log.max(Log.multi(Log.multi(Log.multi(prod, potencyEff[name]), (player.spectrumLevel[1] + 1)), (player.progress.includes(3) ? Cores : 1)), 0);
    let blackThreshold = Log.pow(256, 3);
    let spectRatio = Log.div(spectrum, specprod);
    let thresholdTime = 0;
    if (player.black < blackThreshold) {
        if (specprod === 0) thresholdTime = Log.multi(Log.multi(Log.div(Log.pow(blackThreshold, A), 2, mults), player.spectrum));
        else thresholdTime =  Log.pow(Log.add(Log.div(Log.pow(blackThreshold, A), Log.multi(mults, specprod)), Math.pow(spectRatio,2)), (1 / A)) - spectRatio;
        if (thresholdTime > 0 && isFinite(thresholdTime)) {
            return  Log.pow(Log.add(Log.multi(Log.multi(mults, thresholdTime),Log.add(Log.multi(specprod, time), Log.multi(2, spectrum))), Log.pow(blackThreshold, A)), (1 / A));
        } else return 0;
    }
    let ret = Log.pow(Log.add(Log.multi(Log.multi(mults, time), Log.add(Log.multi(specprod, time), Log.multi(2, spectrum))), Log.pow(player.black, A)), (1 / A));
        return ret;
}

/*
function getBlack(name, time, prod, specprod, spectrum) {
    let A = player.progress.includes(10) ? 1.85 : 2
    let mults = prod * potencyEff[name] * (player.spectrumLevel[1] + 1) * (player.progress.includes(3) ? Cores : 1)
    let blackThreshold = Math.pow(256, 3)
    let spectRatio = spectrum / specprod
    let thresholdTime = 0;
    if (player.black < blackThreshold) {
        if (specprod === 0) thresholdTime = Math.pow(blackThreshold, A) / (2 * mults * player.spectrum)
        else thresholdTime = Math.sqrt(Math.pow(blackThreshold, A) / (mults * specprod) + Math.pow(spectRatio, 2)) - spectRatio;
        console.log(thresholdTime);
        if (thresholdTime > 0 && thresholdTime != Infinity) {
            return Math.pow(mults * (thresholdTime) * (specprod * thresholdTime + 2 * spectrum) + Math.pow(blackThreshold, A), 1 / A);
        } else return 0;
    }
    return Math.pow(mults * time * (specprod * time + 2 * spectrum) + Math.pow(player.black, A), 1 / A);

}
*/



