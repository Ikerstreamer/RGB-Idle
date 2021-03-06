var v = 1.12;
var player = {
    money: { red: 0, green: 0, blue: 0 },
    pixels: { red: { max: 0, cur: 0 }, green: { max: 0, cur: 0 }, blue: { max: 0, cur: 0 }},
    level: { red: 0, green: 0, blue: [0,0,0,0]},
    unlock: false,
    spliced: { red: 0, green: 0, blue: 0 },
    spectrum: 0,
    specced: 0,
    spectrumLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1,-1,-1,-1,-1],
    options: { fast: false, fps: 50, notation: "Default" },
    spectrumTimer: 0,
    wastedTime: 0,
    sleepingTime:0,
    previousSpectrums: [{ time: 0, amount: 0}, { time: 0, amount: 0}, { time: 0, amount: 0}, { time: 0, amount: 0}, { time: 0, amount: 0}],
    lastUpdate: Date.now(),
    prism: { active: false, potency: { points: 0, total: 0, red: -1, green: -1, blue: -1 }, specbar: { red: false, green: false, blue: false }, potencyEff: { red: 1 / 256, green: 1 / 256, blue: 1 / 256 }, cost: 0,},
    specbar: { red: false, green: false, blue: false},
    black: 0,
    AB: { red: true, green: true, blue: true },
    CM: 1,
    progress: [],
    advSpec: { unlock: false, multi: 1, max: 50, reduce: 0.1, time: 0, active: false, gain: 0, SR: 0 },
    potencyEff: {red:1/256, green:1/256,blue:1/256},
}
let resetplayer;

var p3 = true;
var p10 = 0;
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
var SR5 = 0;
var SpecPrice = [1, 1, 3, 5, 5, 7, 10, 30, 50, 75, 300, 500, 1500, 2500, 25000, 100000, 1e10, 1e13, 1e25, 1e35, 1e50];

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
        } else if (this.name == "red" && player.CM > 1 && player.spectrumLevel[3] === 0) {
            player.CM -= 7.5 * (dif / 1000);
            player.CM = Math.max(player.CM, 1);
        }
        if (Log.get((this.name == "red" ? Log.multi(Log.add(Log.div(auto, 1000 / player.options.fps), (player.bars.red.mouse === 1 ? click : 0)), IR) : (this.name == "green" ? Log.div(Log.multi(Log.multi(Log.add(Log.div(auto, 1000 / player.options.fps), (player.bars.red.mouse === 1 ? click : 0)), IR), IG), 256) : Log.div(Log.multi(Log.multi(Log.multi(Log.add(Log.div(auto, 1000 / player.options.fps), (player.bars.red.mouse === 1 ? click : 0)), IR), IG), IB), 65536))), "log") > Math.log10(32)) this.element.style.width = "100%";
        else this.element.style.width = Log.get(Log.div(this.width,2.56),"num") + "%";
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
    resetplayer = Object.assign({version:v},player);
    setupPlayer();
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
    player.wastedTime += dif;
    if (Date.now() % (player.advSpec.unlock ? 1000 : 60000) < dif) CalcSRgain();
    updateStats()
    increase(Log.multi(auto, (dif / 1000)), dif);
    for (var i = 0; i < Object.keys(player.bars).length ; i++) player.bars[Object.keys(player.bars)[i]].draw(dif);
    if (player.level.green >= 1 && !player.unlock) document.getElementById("unlockBtn").classList.remove("hidden");
    if (SumOf(player.spectrumLevel) >= 9) document.getElementsByClassName("switch")[5].classList.remove("hidden");
    if (player.prism.active) document.getElementsByClassName("switch")[6].classList.remove("hidden");
    if (player.level.blue[3] >= 1) document.getElementById("spectrumDiv").classList.remove("hidden");
    if (player.money.blue >= 1) document.getElementsByClassName("switch")[1].classList.remove("hidden");
    if (player.specced > 0) {
        document.getElementsByClassName("switch")[1].classList.remove("hidden");
        document.getElementsByClassName("switch")[3].classList.remove("hidden");
        document.getElementById("tabSpectrum").childNodes[1].classList.add("hidden");
        document.getElementById("tabSpectrum").childNodes[3].classList.remove("hidden");
    }
    if (Log.get(player.black, "l") > 128 && SumOf(player.spectrumLevel) === 9) {
        document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows[5].classList.remove('hidden');
        for (var i = 15; i < 18; i++) player.spectrumLevel[i] = 0;
        document.getElementById("newupgrades").classList.add('hidden');
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
        else if (SumOf(show) == 3 && player.specbar[name]) elem.innerHTML = formatNum(displayIncome(name, "spectrum")) + " Spec/s";
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
        if (player.prism.active && player.progress.includes(1)) document.getElementById("potencydiv").classList.remove("hidden");
        if (player.spectrumLevel[15] === 1) document.getElementById("specpot").classList.remove("hidden");
        if (player.specbar.red || player.specbar.green || player.specbar.blue) document.getElementById("costReset").classList.remove('hidden');
        else document.getElementById("costReset").classList.add('hidden');
        function suffix(num) {
            let ret = num;
            if (num % 10 === 1) ret += "st";
            else if (num % 10 === 2) ret += "nd";
            else if (num % 10 === 3) ret += "rd";
            else ret += "th";
            return ret;
        }
        if (SumOf(player.bars.red.color) + SumOf(player.bars.green.color) + SumOf(player.bars.blue.color) === 255 * 9) {
            if (player.prism.cost === 0) document.getElementById("blackCostInfo").innerHTML = "You are now ready to move on to a better prism! Pressing this button will reset you back to 1st prism, however you will retain log2(spectrum).";
            else document.getElementById("blackCostInfo").innerHTML = "Destroy your prism for the " + suffix(player.prism.cost + 1) + " time and move forth to an even greater one! Pressing this button will reset you back to 1st prism, however you will retain log2(spectrum).";
            document.getElementById("costReset").style.borderColor = 'white';
            document.getElementById("costReset").style.borderWidth = '5';
        } else {
            document.getElementById("blackCostInfo").innerHTML = "Before you may destroy your " + suffix(player.prism.cost + 1) + " prism you must first conquer it using the power of the light. Get all bars to be completly white to fully overpower the darkness within the prism.";
            document.getElementById("costReset").style.borderColor = 'black';
        }
        for (var i = 0; i < 3; i++) {
            var temp = Object.keys(player.money)[i];
            var row = document.getElementById(temp + "Prism");
            var PVal = [[128, 32, 0], [64, 0, 16], [0, 0, 0]];
            if (!player.prism.active) for (var j = 0; j < 5; j += 2) row.cells[2].childNodes[j].value = PVal[i][j / 2];
            if (player.prism.specbar[temp]) for (var j = 0; j < 5; j += 2) row.cells[2].childNodes[j].value = 255;
            row.cells[1].childNodes[0].style.backgroundColor = "rgb(" + Math.floor(row.cells[2].childNodes[0].value) + "," + Math.floor(row.cells[2].childNodes[2].value) + "," + Math.floor(row.cells[2].childNodes[4].value) + ")";
            var colors = ["Red: ", "Green: ", "Blue: "]
            if (row.cells[2].childNodes[0].value + row.cells[2].childNodes[2].value + row.cells[2].childNodes[4].value == 0) {
                row.cells[3].innerHTML = "Black: <sup>" + formatNum(Log.multi(Log.multi(Log.multi(player.spectrum, player.spectrumLevel[18] === 1 ? Log.pow(player.prism.potencyEff[temp], Log.add(1,Log.floor(Log.div(player.prism.potency[temp],7)))) : player.prism.potencyEff[temp]), (player.spectrumLevel[1] + 1)), (player.progress.includes(3) ? Cores : 1)), 0) + "</sup>&frasl;<sub> " + formatNum(Log.max(Log.root(Log.multi(player.black, 1e100), 1 + Math.min(player.prism.cost / 10,0.5)), 1e100)) + "</sub>";
                blackBar = true;
            } else if (player.prism.specbar[temp]) {
                if (player.progress.includes(14)) row.cells[3].innerHTML = "Spectrum: " + formatNum(Math.pow(16, Math.floor(player.prism.potency[temp] / 5)), 0) + "x log<sub>10</sub>(prod)";
                else row.cells[3].innerHTML = "Spectrum: log<sub>10</sub>(prod)";
            }else {
                row.cells[3].innerHTML = "<span></span><br><span></span><br><span></span>";
                var tempcount = 0;
                for (var j = 0; j < 5; j += 2) {
                    row.cells[3].childNodes[j].innerHTML = colors[j / 2] + formatNum(getColorPotency(Object.keys(player.money)[i], Math.floor(row.cells[2].childNodes[j].value),true), player.prism.potency[temp] === -1 ? 6 : 2);
                    if (row.cells[2].childNodes[j].value === 0) tempcount++;
                }
                if (tempcount == 2) blackBar = true;
                colorBar = true;
            }
            if (player.prism.active) {
                if (player.prism.cost < 5) mixCost = Log.multi(mixCost, Log.pow(1.3 * (player.prism.cost / 2 + 1), Log.add(Log.add(Math.floor(parseInt(row.cells[2].childNodes[0].value)), Log.pow(Math.floor(parseInt(row.cells[2].childNodes[2].value)), 1.05)), Log.pow(Math.floor(parseInt(row.cells[2].childNodes[4].value)), 1.1))));
                else mixCost = Log.multi(mixCost, Log.pow(1.3 * player.prism.cost , Log.add(Log.add(Math.floor(parseInt(row.cells[2].childNodes[0].value)), Log.pow(Math.floor(parseInt(row.cells[2].childNodes[2].value)), 1.05)), Log.pow(Math.floor(parseInt(row.cells[2].childNodes[4].value)), 1.1))));
            }

            let node = document.getElementById('specpot').childNodes[i * 2 + 1];
            if (player.prism.specbar[temp]) {
                node.innerHTML = 'Click here to make this color bar!';
                node.style.backgroundColor = 'gold';
            } else {
                node.style.backgroundColor = 'white';
                if (row.cells[2].childNodes[0].value == 255 && row.cells[2].childNodes[2].value == 255 && row.cells[2].childNodes[4].value == 255) {
                    if (player.prism.potency[temp] >= 5) node.innerHTML = 'Click here to make this Spectrum bar!';
                    else node.innerHTML = 'You need 5 potency to make a Spectrum bar.';
                } else node.innerHTML = 'You must first make the bar white.';
            }
        }
        mixCost = Log.sub(mixCost, 1);
        if (player.prism.active) document.getElementById("mixButton").innerHTML = "Create a New Color Mix<br>This will cost: " + formatNum(mixCost, 2) + " Blackness";
        else document.getElementById("mixButton").innerHTML = "Activate the Prism and Embrace its Power!";
    },
    Upgrades : function(){
        for (var i = 0; i < player.spectrumLevel.length ; i++) {
            if (i != 5 && i != 4 && i != 9) document.getElementById("spectrumButton" + i).childNodes[1].innerHTML = SUInfo(i);
            document.getElementById("spectrumButton" + i).childNodes[2].innerHTML = "Price: " + formatNum(SpecPrice[i], 0) + " Spectrum ";
            if (player.spectrumLevel[i] == 1) document.getElementById("spectrumButton" + i).classList.add("bought");
            else document.getElementById("spectrumButton" + i).classList.remove("bought");
        }
    },
    RGB : function () {
        for (var i = 0; i < Object.keys(player.money).length; i++) {
            var tempKey = Object.keys(player.money)[i];
            /*if (player.inf[tempKey] > 0) {
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
            }*/
            document.getElementById(tempKey + "Count").innerHTML = formatNum(player.money[tempKey]);
            if (Log.get((tempKey == "red" ? Log.multi(Log.add(Log.div(auto, 1000 / player.options.fps), player.bars.red.mouse === 1 ? click : 0), IR) : (tempKey == "green" ? Log.div(Log.multi(Log.multi(Log.add(Log.div(auto, 1000 / player.options.fps), player.bars.red.mouse === 1 ? click : 0), IR), IG), 256) : Log.div(Log.multi(Log.multi(Log.multi(Log.add(Log.div(auto, 1000 / player.options.fps), player.bars.red.mouse === 1 ? click : 0), IR), IG), IB), 65536))), "log") > Math.log10(32)) incomeBarDisplay(tempKey);
            else document.getElementById(tempKey + "Bar").innerHTML = "";
            document.getElementById(tempKey + "Splice").childNodes[0].innerHTML = "Splice " + player.level.blue[3] * 10 + "% " + tempKey + " into a spectrum";
            document.getElementById(tempKey + "Splice").childNodes[1].innerHTML = "Spliced " + tempKey + ": " + formatNum(player.spliced[tempKey]);
            if (tempKey == "blue") {
                for (var j = 0; j < 4; j++) {
                    if (j == 0 && player.progress.includes(7)) document.getElementById(tempKey + "Button" + j).childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey][j], 0) + "+" + Math.min(Math.floor(player.spectrumTimer / 360000), 10)
                    else document.getElementById(tempKey + "Button" + j).childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey][j], 0);
                    document.getElementById(tempKey + "Button" + j).childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey][j]) + " " + tempKey;
                    switch (j) {
                        case 0: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current speed: " + formatNum(Clock, 0, "Hz");
                            break
                        case 1: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current fill: " + (Log.get(Log.div(IR, 256),"l") >= 2 ? "~" + formatNum(Log.floor(Log.div(IR, 256)), 0) : (Log.get(Log.div(IR, 256),"n") >= 1 ? formatNum(Log.floor(Log.div(IR, 256)), 0) + " & " : "") + formatNum(Log.mod(IR, 256), 0) + "/256");
                            break
                        case 2: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Current fill: " + (Log.get(Log.div(IG, 256),"l") >= 2 ? "~" + formatNum(Log.floor(Log.div(IG, 256)), 0) : (Log.get(Log.div(IG, 256),"n") >= 1 ? formatNum(Log.floor(Log.div(IG, 256)), 0) + " & " : "") + formatNum(Log.mod(IG , 256), 0) + "/256");
                            break
                        case 3: document.getElementById(tempKey + "Button" + j).childNodes[3].innerHTML = "Core Count: " + formatNum(Cores, 0);
                            break
                    }
                }
            } else {
                    document.getElementById(tempKey + "Button").childNodes[0].innerHTML = tempKey == "red" ? "Increase Click Strength" : "Increase Auto Strength";
                    document.getElementById(tempKey + "Button").style.width = "";
                    document.getElementById(tempKey + "Button").childNodes[2].innerHTML = "Price: " + formatNum(price[tempKey]) + " " + tempKey;
                    document.getElementById(tempKey + "Button").childNodes[1].innerHTML = "Level: " + formatNum(player.level[tempKey], 0);
            }
        }
        document.getElementById("spectrumCountRGB").innerHTML = formatNum(player.spectrum, 0) + " Spectrum";
        document.getElementById("blackCountRGB").innerHTML = formatNum(player.black) + " Black";
        for (var i = 0; i < 3; i++) for (var j = 0; j < 5; j += 2) document.getElementById(Object.keys(player.money)[i] + "Prism").cells[2].childNodes[j].value = player.bars[Object.keys(player.money)[i]].color[j / 2];
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
        if (player.progress.includes(16)) document.getElementById('specstat').innerHTML = 'Times specced is  currently ' + formatNum(player.specced, 0) + '. This multiplies your spectrum gain by ' + formatNum(1 + player.specced / 100, 2) +'x and your spectrum bar gain by ' +formatNum(Math.sqrt(player.specced),2)+'x.';
        else document.getElementById('specstat').innerHTML = 'Times specced is  currently ' + formatNum(player.specced,0) + '. This multiplies your spectrum gain by ' + formatNum(1 + player.specced / 100,2) + 'x.';
        let ret = 'You have wasted ' + formatTime(player.wastedTime + player.sleepingTime) + ' playing this broken game.<br>';
        if (player.sleepingTime < 60000) ret += ' FYI it is not healthly to play this game 24/7 you should take a break seeing as you haven\'t done so yet!';
        else if (player.sleepingTime > 3.154e12) ret += ' Hey Philipe I am on to you, don\'t even try to hide it! You used simulateTime a bit to much there.';
        else if (player.sleepingTime + player.wastedTime > 3.154e+10) ret += ' You either love my game or you\'re Hunter, I can\'t tell which one.';
        else if (player.sleepingTime > player.wastedTime * 100) ret += ' Hello is anybody there? Wait if you are ready this pls stop sleeping so much! You are sleeping ' + (player.sleepingTime / player.wastedTime).toFixed(1) + 'x more then you are playing my game. I need more attention!';
        else if(player.sleepingTime > player.wastedTime) ret += ' Luckily you\'ve spent ' + (player.sleepingTime/(player.wastedTime + player.sleepingTime) * 100).toFixed(1) + '% of that time sleeping(or other IRL things).';
        else if(player.sleepingTime < player.wastedTime) ret += 'Your insane, or you really like my game... You have been online ' + (player.wastedTime/(player.wastedTime + player.sleepingTime) * 100).toFixed(1) + '% of the time you have spent playing this game.';
        else if (Math.floor(player.sleepingTime%60000) === Math.floor(player.wastedTime%60000)) ret += 'How is this possible you have been online for the same amount of minutes you\'ve been offline. This is an anomally!';
        ret += '<br> Time online: ' + formatTime(player.wastedTime) + '<br> Time offline: '+ formatTime(player.sleepingTime);
        document.getElementById('timestat').innerHTML = ret;
    },
    Progress: function () {
        var rows = document.getElementById("achieves").rows;
        for (var i = 0; i < 14; i++) rows[i].style.backgroundColor = "";
        for (var i = 0; i < player.progress.length; i++) rows[player.progress[i]-1].style.backgroundColor = "green";
    },
}

function pCheck(num) {
    if (!player.prism.active) return;
    switch(num){
        case 1:
            if (player.prism.active && !player.progress.includes(1)) {
                player.progress.push(1);
                pop(3);
            }
            return
        case 2:
            if (!player.progress.includes(2) && !player.advSpec.unlock) {
                player.progress.push(2);
                player.advSpec.unlock = true;
                document.getElementById("advSpectrumReset").classList.remove("hidden");
                pop(3);
            }
            return
        case 3:
            if (!player.progress.includes(3) && Log.get(player.black, "log") >= 50) {
                player.progress.push(3);
                pop(3);
            }
            return
        case 4:
            if (p3 && Log.get(player.black,"l") >= 3 && !player.progress.includes(4)) {
                player.progress.push(4);
                document.getElementById("spectrumButton" + 4).childNodes[0].innerHTML = "Auto Buy Max Red Level Every " + 0.25 + "s";
                document.getElementById("spectrumButton" + 5).childNodes[0].innerHTML = "Auto Buy Max Green Level Every " + 0.25 + "s";
                document.getElementById("spectrumButton" + 9).childNodes[0].innerHTML = "Auto Buy Max Blue Upgrades Every " + 0.25 + "s";
                ABInt = { red: 2000 / 8, green: 2000 / 8, blue: 2000 / 8 };
                pop(3);
            }
            return
        case 5:
            if (Math.floor(Log.get(player.spliced.red, "l")) === 128 && Math.floor(Log.get(player.spliced.green, "l")) == 128 && Math.floor(Log.get(player.spliced.blue, "l")) == 128 && !player.progress.includes(5)) {
                player.progress.push(5);
                pop(3);
            }
            return
        case 6:
            if (Log.get(player.money.blue, "l") >= 64 && player.level.blue[3] === 0 && !player.progress.includes(6)) {
                player.progress.push(6);
                pop(3);
            }
            return
        case 7:
            if (!player.progress.includes(7)) {
                player.progress.push(7);
                pop(3);
            }
            return
        case 8:
            if (player.bars.red.color[0] == 255 && player.bars.green.color[1] == 255 && player.bars.blue.color[2] == 255 && !player.progress.includes(8)) {
                player.progress.push(8);
                pop(3);
            }
            return
        case 9:
            if (Log.get(Log.div(player.previousSpectrums[0].amount, (player.previousSpectrums[0].time / 1000)), "num") >= 1000000 && !player.progress.includes(9)) {
                player.progress.push(9);
                pop(3);
            }
            return
        case 10:
            if (!player.progress.includes(10)) {
                if (p10 === 9) {
                    pop(3);
                    player.progress.push(10);
                } else {
                    let names = ['red','green','blue'];
                    let pColor = [SumOf(player.bars.red.color),SumOf(player.bars.green.color),SumOf(player.bars.blue.color)];
                    let nColor = [];
                    for(let i = 0 ; i < 3; i++){
                        var row = document.getElementById(names[i] + "Prism");
                        let ret = [];
                        for(j = 0; j < 5; j+=2){
                            ret.push(Math.floor(parseFloat(row.cells[2].childNodes[j].value)))
                        }
                        nColor.push(SumOf(ret));
                    }
                    if ((nColor.every(function (val) { return val === 0 }) && pColor.every(function (val) { return val > 0 })) || (pColor.every(function (val) { return val === 0 }) && nColor.every(function (val) { return val > 0 }))) p10++;
                    else p10 = 0;
                }
            }
            return
        case 11:
            if (!player.progress.includes(11)) {
                var b = 0;
                var w = 0;
                for (var i = 0; i < Object.keys(player.bars).length; i++) {
                    if (player.specbar[Object.keys(player.bars)[i]]) {
                        w = Log.add(w, displayIncome(Object.keys(player.bars)[i],'spectrum'));
                    }
                }
                for (var i = 0; i < Object.keys(player.bars).length; i++) {
                    if (SumOf(player.bars[Object.keys(player.bars)[i]].color) === 0) b = Log.add(b, displayIncome(Object.keys(player.bars)[i], 'black'));
                    if (player.bars[Object.keys(player.bars)[i]].color.filter(function (item) { return item === 0 }).length == 2 && player.progress.includes(8)) b = Log.add(displayIncome(Object.keys(player.bars)[i], 'miniBlack'), b);
                }
                if (Log.get(w, 'l') > Log.get(b, 'l')) {
                    player.progress.push(11);
                    pop(3);
                }
            }
            return
        case 12:
            if (!player.progress.includes(12) && Log.get(player.money.green, 'n') === 0 && player.level.green === 0 && player.level.red >= 1000) {
                player.progress.push(12);
                pop(3);
            }
            return
        case 13:
            if (!player.progress.includes(13) && Log.get(player.black, 'l') >= 256) {
                player.progress.push(13);
                pop(3);
            }
            return
        case 14:
            if (!player.progress.includes(14) && player.specbar.red && player.specbar.green && player.specbar.blue) {
                player.progress.push(14);
                pop(3);
            }
            return
        case 15:
            if (!player.progress.includes(15) && player.prism.cost > 0) {
                player.progress.push(15);
                pop(3);
            }
            return
        case 16:
            if (!player.progress.includes(16) && player.specced >= 10000) {
                player.progress.push(16);
                pop(3);
            }
            return
        case 17:
            if (!player.progress.includes(17) && player.advSpec.time >= 3.6e6) {
                player.progress.push(17);
                pop(3);
            }
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
        if (player.specbar[temp.name]) {
            player.spectrum = Log.add(player.spectrum, getSpec(temp.name, Log.div(temp.width, 256), dif ));
            specGain = Log.add(specGain,getSpec(temp.name, Log.div(temp.width, 256), dif));
        } else {
            player.money.red = Log.add(player.money.red, Log.multi((player.prism.active ? getColorPotency(temp.name, temp.color[0]) : (player.spectrumLevel[1] + 1) * temp.color[0] / 255), Log.floor(Log.div(temp.width, 256))));
            player.money.green = Log.add(player.money.green, Log.multi((player.prism.active ? getColorPotency(temp.name, temp.color[1]) : (player.spectrumLevel[1] + 1) * temp.color[1]/255), Log.floor(Log.div(temp.width, 256))));
            player.money.blue = Log.add(player.money.blue, Log.multi((player.prism.active ? getColorPotency(temp.name, temp.color[2]) : (player.spectrumLevel[1] + 1) * temp.color[2]/255), Log.floor(Log.div(temp.width, 256))));
            if (temp.color[0] + temp.color[1] + temp.color[2] == 0) player.black = getBlack(temp.name, dif, Log.div(temp.width,256), specGain,tspec)
            if (temp.color.filter(function (item) { return item === 0 }).length == 2 && player.progress.includes(8)) player.black = getBlack(temp.name, dif, Log.div(temp.width, 256), specGain, tspec,true);
        }
        next = Log.multi(Log.floor(Log.div(temp.width, 256)), (temp.name == "red" ? IG : IB));
        temp.width = Log.mod(temp.width, 256);
    }
    pCheck(13);
    pCheck(11);
    pCheck(12);
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

function prismUpgrade(type, name) {

    function updatePotency(all) {
        let btn = document.getElementById('potencyBtn');
        
        btn.childNodes[0].innerHTML = 'You have ' + formatNum(player.prism.potency.points,0) + ' potency, out of a total of ' + formatNum(player.prism.potency.total,0);
        btn.childNodes[2].innerHTML = 'Increase potency by 2 for ' + formatNum(Log.pow(10, player.prism.potency.total/2 + 3),0) + ' Spectrum';

        if (name) {
            let pot = document.getElementById(name + 'pot');
            player.prism.potencyEff[name] = Log.pow(256, player.prism.potency[name]);
            if (Log.get(player.prism.potencyEff[name],'l') === Log.get(player.potencyEff[name],'l')) pot.getElementsByClassName('amnt')[0].innerHTML = formatNum(player.prism.potency[name],0);
                else pot.getElementsByClassName('amnt')[0].innerHTML = formatNum(Log.log(player.potencyEff[name],256),0) + "(" + formatNum(player.prism.potency[name],0) + ")";
        }
        if (all) {
            let names = ['red','green','blue']
            for (let i = 0; i < 3; i++) {
                let pot = document.getElementById(names[i] + 'pot');
                player.prism.potencyEff[names[i]] = Log.pow(256, player.prism.potency[names[i]]);
                if (Log.get(player.prism.potencyEff[names[i]], 'l') === Log.get(player.potencyEff[names[i]], 'l')) pot.getElementsByClassName('amnt')[0].innerHTML = formatNum(player.prism.potency[names[i]], 0);
                else pot.getElementsByClassName('amnt')[0].innerHTML = formatNum(Log.log(player.potencyEff[names[i]], 256), 0) + "(" + formatNum(player.prism.potency[names[i]], 0) + ")";
            }
        }
    }

    switch (type) {
        case "cost":
            if (SumOf(player.bars.red.color) + SumOf(player.bars.green.color) + SumOf(player.bars.blue.color) === 255 * 9) {
                reset(1);
                player.spectrum = Log.log(player.spectrum, 2);
                player.black = 0;
                player.prism = { active: true, potency: { points: 0, total: 0, red: -1, green: -1, blue: -1 }, specbar: { red: false, green: false, blue: false }, potencyEff: { red: 1 / 256, green: 1 / 256, blue: 1 / 256 }, cost: player.prism.cost + 1 };
                player.potencyEff = { red: 1 / 256, green: 1 / 256, blue: 1 / 256 };
                player.specbar = { red: false, green: false, blue: false };
                player.bars.red.color = [128, 32, 0];
                player.bars.green.color = [64, 0, 16];
                player.bars.blue.color = [0, 0, 0];
                updatePotency(true);

                pCheck(15);
                if (player.prism.cost === 1) {
                    document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows[6].classList.remove('hidden');
                    for (var i = 18; i < 21; i++) player.spectrumLevel[i] = 0;
                }
            }
            return
        case "specbar":
            let row = document.getElementById(name + "Prism");
            if (row.cells[2].childNodes[0].value == 255 && row.cells[2].childNodes[2].value == 255 && row.cells[2].childNodes[4].value == 255 && player.spectrumLevel[15] === 1 && player.prism.potency[name] >= 5) {
                player.prism.specbar[name] = !player.prism.specbar[name];
            }
            return
        case "potency":
            if (player.prism.potency.red === -1 && player.prism.potency.green === -1 && player.prism.potency.blue === -1 && Log.get(player.spectrum, "num") >= 100) {
                player.spectrum = Log.sub(player.spectrum, 100);
                let names = ['red','green','blue']
                for (let i = 0; i < 3; i++) {
                    player.prism.potency[names[i]] = 0;
                    player.prism.potencyEff[names[i]] = Math.pow(256, player.prism.potency[names[i]]);
                }
                pCheck(2);
                updatePotency(true);
            }else if (Log.get(player.spectrum, "num") >= Math.pow(10, player.prism.potency.total/2 + 3)) {
                player.spectrum = Log.sub(player.spectrum, Math.pow(10, player.prism.potency.total/2 + 3));
                player.prism.potency.points += 2;
                player.prism.potency.total += 2;
                updatePotency();
            }
                return
        case "add":
            if (player.prism.potency.points > 0) {
                player.prism.potency.points--;
                player.prism.potency[name]++;
            }
            updatePotency();
            return
        case "sub":
            if (player.prism.specbar[name] && player.prism.potency[name] <= 5) return;
            if (player.prism.potency[name] > 0) {
                player.prism.potency[name]--;
                player.prism.potency.points++;
            }
            updatePotency();
            return
}
}

function buyUpgrade(name, Bindex) {
    if (name == "spectrum") {
        if (Log.get(player.spectrum,"log") >= Math.log10(SpecPrice[Bindex]) && player.spectrumLevel[Bindex] < 1) {
            if(Bindex === 6) {
                player.unlock = true;
                document.getElementById('blueDiv').classList.remove('hidden');
            }
            if (Bindex === 5 || Bindex === 4 || Bindex === 9) {
                document.getElementById("spectrumButton" + Bindex).childNodes[1].innerHTML = SUInfo(Bindex);
            }
            player.spectrum = Log.sub(player.spectrum, SpecPrice[Bindex]);
            player.spectrumLevel[Bindex]++;
            updateStats();
            return true;
        }
    } else if (name == "blue") {
        if (Log.get(player.money[name], "log") >= Log.get(price[name][Bindex], "log")) {
            //if (Bindex == 3 && player.level.blue[3] >= 10) return false;
            player.money[name] = Log.sub(player.money[name], price[name][Bindex])
            player.level[name][Bindex]++;
            updateStats();
            if (Bindex == 3 && player.progress.includes(6)) CalcSRgain();
            return true;
        }
    } else {
        if (Log.get(player.money[name], "log") >= Log.get(price[name], "log")) {
            player.money[name] = Log.sub(player.money[name], price[name])
            player.level[name]++;
            updateStats();
            if (player.level[name] % 100 === 0) CalcSRgain();
            return true;
        } else if (player.spectrumLevel[20] === 1 && Log.get(player.black, "log") >= Log.get(price[name], "log")) {
            player.black = Log.sub(player.black, price[name])
            player.level[name]++;
            updateStats();
            if (player.level[name] % 100 === 0) CalcSRgain();
            return true;
        }
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
        case 7:
            return "Current Multi per 10: " + (player.spectrumLevel[7] + 1) + "x";
        case 8:
            return "Current Multi per 10: " + (1.15 + player.spectrumLevel[8] * 0.15).toFixed(2-player.spectrumLevel[8]) + "x";
        case 9:
            return player.spectrumLevel[9] == 1 ? "<div onclick='ToggleAB(`blue`)' class='button' style='height:100%;width:50%;background-color:" + (player.AB.blue ? "green" : "red") + "'>" + (player.AB.blue ? "On" : "Off") + "</div>" : "Buy Blue Yourself!";
        case 10:
            return "R&G cost " + ((1 - PD) * 100) + "% less";
        case 11:
            return "Current Multi: " + formatNum(player.level.red,0) + "x";
        case 12:
            return "Current Multi: " + formatNum(Log.max(Log.floor(player.spectrum),1), 0) + "x";
        case 14:
            return "Base Core Count: " + (player.spectrumLevel[14] == 1 ? 8 : 1);
        case 16:
            return "Increase Blue: ~" + formatNum(Log.round(Log.div(IB,256)));
        default:
            return "";
    }
}

function updateStats() {
    PD = player.spectrumLevel[10] == 1 ? 0.5 : 1;
    if (player.spectrumLevel[2] == 1) {
        IR =  Log.multi(Log.add(4, Log.multi(4, player.level.blue[1])),(player.spectrumLevel[7] == 1 ? Log.max(Log.multi(2,Log.ceil(Log.div(player.level.blue[1],10))),1) : 1));
        IG = Log.multi(Log.add(4, Log.multi(4, player.level.blue[2])),(player.spectrumLevel[7] == 1 ? Log.max(Log.multi(2,Log.ceil(Log.div(player.level.blue[2],10))),1) : 1));
    } else {
        IR = Log.multi(Log.add(2, Log.multi(2, player.level.blue[1])), (player.spectrumLevel[7] == 1 ? Log.max(Log.multi(2, Log.ceil(Log.div(player.level.blue[1], 10))), 1) : 1));
        IG = Log.multi(Log.add(2, Log.multi(2, player.level.blue[2])), (player.spectrumLevel[7] == 1 ? Log.max(Log.multi(2, Log.ceil(Log.div(player.level.blue[2], 10))), 1) : 1));
    }
    if (player.spectrumLevel[16] == 1) IB = Log.multi(IR, IG);
    else IB = 8;
    if (player.spectrumLevel[17] == 1) BPD = Log.floor(Log.root(Log.div(Log.add(player.level.red, player.level.green), 100), 1.75))
    else BPD = 0;
    Cores = Log.multi(Log.pow(2, player.level.blue[3]), (player.spectrumLevel[14] == 1 ? 8 : 1));
    Clock = Log.pow(2, Log.floor(Log.log(Log.pow(Log.add(2 , Log.log(Cores,6)), Log.add(player.level.blue[0], (player.progress.includes(7) ? Math.min(Math.floor(player.spectrumTimer / 360000), 10) : 0))), 2)));
    click = Log.multi(Log.multi(Log.add(2,Log.div(player.level.red, 2)), Log.pow((1.15 + player.spectrumLevel[8] * 0.15), Log.floor(Log.div(player.level.red, 10)))), Math.log10(Math.max(player.CM,1)));
    auto = Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(player.level.green, 16), Log.pow(Log.add(1.15 ,Log.multi( player.spectrumLevel[8], 0.15)), Log.floor(Log.div(player.level.green, 10)))), Clock),(player.spectrumLevel[0] == 1 ? Math.max(Math.log10(player.CM), 1) : 1)), (player.spectrumLevel[11] == 1 ? player.level.red : 1)), (player.spectrumLevel[12] == 1 ? Log.max(Log.floor(player.spectrum), 1) : 1)),player.progress.includes(10) ? Log.max(Log.log10(player.black),1):1);
    price.red = Log.multi(5 , Log.pow(Log.add(1,Log.multi(Log.multi(0.1, Log.pow(1.05, Math.max((player.level.red / 100)-1,0))), PD)), player.level.red));
    price.green = Log.multi(5, Log.pow(Log.add(1,Log.multi(Log.multi(0.05, Log.pow(1.05, Math.max((player.level.green / 100)-1,0))), PD)), player.level.green));
    price.blue[0] = Log.pow(Log.multi(16, Log.add(Log.max(Log.div(Log.sub(player.level.blue[0], Log.add(1000, BPD)), Log.add(1000, BPD)), 0), 1)), Log.max(Log.sub(player.level.blue[0], BPD), 0));
    price.blue[1] = Log.multi(4, Log.pow(2, Log.max(Log.sub(player.level.blue[1],BPD),0)));
    price.blue[2] = Log.multi(8, Log.pow(2, Log.max(Log.sub(player.level.blue[2],BPD),0)));
    price.blue[3] = Log.multi(1048576, Log.pow(Log.pow(512, Log.max(Log.floor(Log.multi(Log.max(Log.sub(player.level.blue[3], 4), 0),Log.add(1.25,Log.multi(Log.max(Log.sub(Log.floor(Log.div(player.level.blue[3],5)),1),0),0.075)))), 1)), player.level.blue[3]));
    if (player.bars.red.mouse == 1) income.red = Log.div(Log.multi(Log.add(auto, Log.multi(click, 50)), IR), 256);
    else income.red = Log.div(Log.multi(auto, IR), 256);
    income.green = Log.div(Log.multi(income.red, IG), 256);
    income.blue = Log.div(Log.multi(income.green, IB), 256);
}

function CalcSRgain() {
    if (player.progress.includes(5)) {
        SR5 = Log.add(player.spliced.red, Log.multi(player.money.red, player.level.blue[3] / 10));
        SR5 = Log.multi(SR5, Log.add(player.spliced.green, Log.multi(player.money.green, player.level.blue[3] / 10)));
        SR5 = Log.multi(SR5, Log.add(player.spliced.blue, Log.multi(player.money.blue, player.level.blue[3] / 10)));
        SR5 = Log.max(SR5, 0);
        SR5 = Log.div(SR5, 16777216);
        if (player.spectrumLevel[13]) SR5 = Log.pow(SR5, Log.div(Cores, 256))
        SR5 = Log.root(SR5, 3);
        SR5 = Log.max(Log.log(SR5, 1000), 0);
        SR5 = Log.multi(SR5, Log.add(Log.div(player.specced, 100), 1));
        SR5 = Log.multi(SR5, Log.add(Log.div(Log.add(Log.floor(Log.div(player.level.green, 100)), Log.floor(Log.div(player.level.red, 100))), 10), 1));
        if (player.progress.includes(6)) SR5 = Log.multi(SR5, Log.add(1, Log.div(player.level.blue[3], 10)));
        if (player.progress.includes(9)) SR5 = Log.multi(SR5, Log.add(1, Log.log10(Log.max(Log.div(player.spectrumTimer, 60000), 1))));
        SR5 = Log.max(Log.sub(SR5, 1), 0);
        }
        SR = Log.max(Log.multi(Log.multi(player.spliced.red, player.spliced.green), player.spliced.blue), 0);
        SR = Log.div(SR, 16777216);
        if (player.spectrumLevel[13]) SR = Log.pow(SR, Log.div(Cores, 256))
        SR = Log.root(SR,3);
        SR = Log.max(Log.log(SR,1000), 0);
        SR = Log.multi(SR, Log.add(Log.div(player.specced, 100), 1));
        SR = Log.multi(SR, Log.add(Log.div(Log.add(Log.floor(Log.div(player.level.green, 100)), Log.floor(Log.div(player.level.red, 100))), 10), 1));
        if (player.progress.includes(6)) SR = Log.multi(SR, Log.add(1, Log.div(player.level.blue[3], 10)));
        if (player.progress.includes(9)) SR = Log.multi(SR, Log.add(1, Log.log10(Log.max(Log.div(player.spectrumTimer, 60000), 1))));
        SR = Log.max(Log.sub(SR, 1),0);
        document.getElementById("spectrumReset").childNodes[0].innerHTML = "Reset all progress and gain";
        if (player.progress.includes(5) && Log.get(SR5,'l') > Log.get(Log.multi(SR,1.05),'l')) document.getElementById("spectrumReset").childNodes[1].innerHTML = "<b>" + formatNum(Log.floor(SR), 0) + "(" + formatNum(Log.floor(SR5), 0) + ") Spectrum</b>";
        else document.getElementById("spectrumReset").childNodes[1].innerHTML = "<b>" + formatNum(Log.floor(SR), 0) + " Spectrum</b>";
        if (Log.get(SR, 'l') >= 3 || (player.progress.includes(5) && Log.get(SR5, 'l') >= 3 )) {
            if (player.progress.includes(5)) document.getElementById("spectrumReset").childNodes[2].innerHTML = formatNum(Log.get(Log.div(SR5, player.spectrumTimer / 60000), 'num')) + "/min";
                else document.getElementById("spectrumReset").childNodes[2].innerHTML = formatNum(Log.get(Log.div(SR, player.spectrumTimer / 60000), 'num')) + "/min";
        } else document.getElementById("spectrumReset").childNodes[2].innerHTML = formatNum(Log.multi(Log.mod(SR, 1), 100)) + "% towards next";
        if (player.advSpec.unlock) {
                var prevmulti = player.advSpec.multi;
                player.advSpec.multi = parseInt(document.getElementById("advSpectrumReset").childNodes[1].childNodes[0].value);
                if (player.advSpec.active && player.advSpec.multi != prevmulti) {
                    if (player.advSpec.multi == 1) player.advSpec.active = false;
                    player.advSpec.time *= player.advSpec.multi / prevmulti;
                }
                let num = (player.advSpec.active ? player.advSpec.SR : SR);
                player.advSpec.gain = 0;
                for (var i = 0; i < player.advSpec.multi; i++) {
                    player.advSpec.gain = Log.add(player.advSpec.gain,num);
                    if(i%10 === 0)num = Log.multi(num, 1-player.advSpec.reduce);
                }
                player.advSpec.gain = Log.floor(player.advSpec.gain);
                if (player.progress.includes(17)) player.advSpec.gain = Log.multi(player.advSpec.gain, 4);
                if (player.spectrumLevel[19] === 1) player.advSpec.gain = Log.pow(player.advSpec.gain, 2)
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
            num = Log.get(num,"num");
        } else {
            var suffix = ["K", "M", "B", "T", "Qu", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
            num = Log.get(num,"log");
            let m = Math.pow(10, num % 1)
            let e = Math.floor(num);
            if(type === 'Hz') e -= 9;
            let ret;
            if (num < 1000) ret =  m.toFixed(1) + "e" + e;
            else if (num < 100000) ret = m.toFixed(0) + "e" + e;
            else if (num < 1000000) ret = "e" + e;
            else if (num < 1e36) ret = "e" + (e / Math.pow(1000, Math.floor(Math.log(e) / Math.log(1000)))).toFixed(3 - Math.floor(Math.log10(e / Math.pow(1000, Math.floor(Math.log(e) / Math.log(1000)))))) + suffix[Math.floor(Math.log(e) / Math.log(1000)) - 1];
            else ret = 'Too Big';
            if (type === 'Hz') ret += 'Hz'
            return ret;
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
            var pre2 = ["b", "t", "q","Q","s","S","O","N","D"];
            return pre2[Math.floor((num - 20) / 10)] + "X" + preHz[(num % 10)] + "Hz";
        }   
        return num / Math.pow(1024, Math.floor(Math.log(num) / Math.log(1024))) + createSuffix(Math.floor(Math.log(num) / Math.log(1024)));
    } else if (num < 10000) {
        if (num === 0) return num.toFixed(0);
        let maxdp = Math.floor(Math.log10(num) * -1)+1;
        let mindp = Math.max(dp - Math.floor(Math.log10(num)),0);
        if (maxdp >= 2) return num.toFixed(maxdp);
        return num.toFixed(Math.min(dp, mindp));
    }else if (num < 1e36 && player.options.notation == "Default") return (num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))).toFixed(2 - Math.floor(Math.log10(num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))))) + suffix[Math.floor(Math.log(num) / Math.log(1000)) - 1];
    else return (num / Math.pow(10, Math.floor(Math.log10(num)))).toFixed(1) + "e" + Math.floor(Math.log10(num));
}

function unlockBlue() {
    if (Log.get(player.money.green,"n") >= 50) {
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
        let temp = document.createElement("textarea");
        temp.value = btoa(JSON.stringify(player));
        document.getElementById("tabSettings").appendChild(temp);
        temp.select()
        document.execCommand('copy')
        temp.parentNode.removeChild(temp);
    }
    if (name === 'reset') localStorage.setItem("RGBsave", btoa(JSON.stringify(resetplayer)));
    else {
        let temp = Object.assign({},player);
        temp.bars = { red: { width: Log.get(player.bars.red.width,'n'), color: player.bars.red.color }, green: { width: Log.get(player.bars.green.width,'n'), color: player.bars.green.color }, blue: { width: Log.get(player.bars.blue.width,'n'), color: player.bars.blue.color }, };
        localStorage.setItem("RGBsave", btoa(JSON.stringify(temp)));
    }
    console.log("Saved");
}

function setupPlayer() {
    player.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
    player.bars.red.setup();
    let loadedSave = load();
    if (loadedSave != false) {
        if (loadedSave.version >= 1) player = Object.assign(player, loadedSave);
            if (player.version < 1.1) {
            for (var i = 0; i < 3; i++) player.spectrumLevel.push(-1);
            player.prism = { active: false,potency :{}, };
            player.AB = { red: true, green: true, blue: true };
            player.CM = 1;
            player.black = 0;
            player.progress = [];
            player.prism.potency.red = -1;
            player.prism.potency.green = -1;
            player.prism.potency.blue = -1;
            player.prism.potency.total = 0;
            player.prism.potency.points = 0;
            player.potencyEff = { red: 1 / 256, green: 1 / 256, blue: 1 / 256 };
            player.prism.potencyEff = { red: 1 / 256, green: 1 / 256, blue: 1 / 256 };
            player.prism.specbar = { red: false, green: false, blue: false };
            while (player.spectrumLevel.length > 18) player.spectrumLevel.splice(length - 1, 1);
            player.advSpec = { unlock: false, multi: 1, max: 50, reduce: 0.1, time: 0, active: false, gain: 0, SR: 0 };
            }
            if (player.version < 1.11) player.prism.cost = 0;
            if (player.version < 1.12) {
                player.sleepingTime = 0;
                player.wastedTime = 0;
                alert('RGB Idle has updated, hope you enjoy the new stuff! \n Current Version: 1.12');
            }
            while (player.spectrumLevel.length < 21) player.spectrumLevel.push(-1);
        if (player.unlock) document.getElementById('blueDiv').classList.remove('hidden');
        else document.getElementById('blueDiv').classList.add('hidden');
        if (SumOf(player.spectrumLevel) >= 9) document.getElementsByClassName("switch")[5].classList.remove("hidden");
        if (player.prism.active) document.getElementById("newupgrades").classList.remove("hidden");
        else document.getElementById("newupgrades").classList.add("hidden");
        if (SumOf(player.spectrumLevel) >= 12) {
            document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows[5].classList.remove('hidden');
            document.getElementById("newupgrades").classList.add("hidden")
        } else {
            document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows[5].classList.add('hidden');
        }
        if (player.prism.cost > 0) document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows[6].classList.remove('hidden');
        else document.getElementById("spectrumButton0").parentElement.parentElement.parentElement.rows[6].classList.add('hidden');
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
        document.getElementById("spectrumButton" + 4).childNodes[0].innerHTML = "Auto Buy Max Red Level Every " + formatNum(2 / (player.progress.includes(4) ? 8 : 1)) + "s";
        document.getElementById("spectrumButton" + 5).childNodes[0].innerHTML = "Auto Buy Max Green Level Every " + formatNum(2 / (player.progress.includes(4) ? 8 : 1)) + "s";
        document.getElementById("spectrumButton" + 9).childNodes[0].innerHTML = "Auto Buy Max Blue Upgrades Every " + formatNum(2 / (player.progress.includes(4) ? 8 : 1)) + "s";
        ABInt = { red: 2000 / (player.progress.includes(4) ? 8 : 1), green: 2000 / (player.progress.includes(4) ? 8 : 1), blue: 2000 / (player.progress.includes(4) ? 8 : 1)};
        player.CM = Math.max(player.CM, 1);
        let btn = document.getElementById('potencyBtn');
        if (player.prism.potency.total > 0) {
            btn.childNodes[0].innerHTML = 'You have ' + formatNum(player.prism.potency.points,0) + ' potency, out of a total of ' + formatNum(player.prism.potency.total,0);
            btn.childNodes[2].innerHTML = 'Increase potency for ' + formatNum(Math.pow(10, player.prism.potency.total/2 + 3), 0) + ' Spectrum';
        } else {
            btn.childNodes[0].innerHTML = 'Escape the loss of power. Remove your negative potency.';
            btn.childNodes[2].innerHTML = 'This requires you to channel 100 spectrum.';
        }

        let names = ['red', 'green', 'blue']
        for (let i = 0; i < 3; i++) {
            let pot = document.getElementById(names[i] + 'pot');
            if (Log.get(player.prism.potencyEff[names[i]],'l') === Log.get(player.potencyEff[names[i]],'l')) pot.getElementsByClassName('amnt')[0].innerHTML = formatNum(player.prism.potency[names[i]],0);
            else pot.getElementsByClassName('amnt')[0].innerHTML = formatNum(Log.log(player.potencyEff[names[i]],256),0) + "(" + formatNum(player.prism.potency[names[i]],0) + ")";
        }


        //Should always be the last thing to happen
       let dif = Date.now() - player.lastUpdate;
       player.lastUpdate = Date.now();
        simulateTime(dif);
    }
    player.version = v;
}

function load(name) {
    if (name == "Import") {
        var temp = prompt("Enter you save:", "");
        if (temp != null && temp != undefined && temp != "" && temp != false) {
            try {
                if (typeof (JSON.parse(atob(temp))) == 'object') {
                    localStorage.setItem("RGBsave", temp);
                    setupPlayer();
                }
            } catch (e) {
                if (parseFloat(temp) === Log.get(Log.div(Clock, Math.pow(1024, 3)), "num")) pCheck(7);
                else console.error("Invalid save file!");
            }
        }
    } else if (localStorage.getItem("RGBsave") != undefined || localStorage.getItem("RGBsave") != null) {
        let temp = JSON.parse(atob(localStorage.getItem("RGBsave")));
        let tempSave = Object.assign({},temp);
        tempSave.bars = { red: new bar("red", temp.bars.red.color[0], temp.bars.red.color[1], temp.bars.red.color[2], "redBar"), green: new bar("green", temp.bars.green.color[0], temp.bars.green.color[1], temp.bars.green.color[2], "greenBar"), blue: new bar("blue", temp.bars.blue.color[0], temp.bars.blue.color[1], temp.bars.blue.color[2], "blueBar") };
        let names = ['red','green','blue'];
        for (let i = 0; i < 3;i++){
            if (isNaN(temp.bars[names[i]].width)) {
                console.log(temp.bars[names[i]].width)
                tempSave.bars[names[i]].width = 0;
            } else tempSave.bars[names[i]].width = temp.bars[names[i]].width;
                }
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
        if (Log.get(SR, "log") >= 0 || force) {
            if (player.advSpec.multi > 1 && !force) {
                if (player.advSpec.active) {
                    if (player.advSpec.time <= player.spectrumTimer) {
                        pCheck(17);
                        player.advSpec.active = false;
                        if (player.progress.includes(17)) player.advSpec.multi *= 4;
                        if (player.spectrumLevel[19] === 1) player.specced += Math.pow(player.advSpec.multi, 3);
                        else player.specced += player.advSpec.multi;
                        player.advSpec.multi = 1;
                        if (player.spectrumLevel[19] === 1) player.spectrum = Log.add(player.spectrum, player.advSpec.gain);
                        else player.spectrum = Log.add(player.spectrum, player.advSpec.gain);
                    if (!force) player.previousSpectrums = [{ time: player.spectrumTimer, amount: player.advSpec.gain }, player.previousSpectrums[0], player.previousSpectrums[1], player.previousSpectrums[2], player.previousSpectrums[3]];
                }else return
                } else {
                    player.advSpec.SR = SR;
                    player.advSpec.time = player.spectrumTimer * (player.advSpec.multi + 1);
                    player.advSpec.active = true;
                    return
                }
            } else {
                player.spectrum = Log.add(player.spectrum,Log.floor(SR));
                if(!force)player.previousSpectrums = [{ time: player.spectrumTimer, amount: SR }, player.previousSpectrums[0], player.previousSpectrums[1], player.previousSpectrums[2], player.previousSpectrums[3]];
                player.specced += 1;
            }
            if (player.advSpec.active && force) {
                pCheck(17);
                player.advSpec.active = false;
                if (player.progress.includes(17)) player.advSpec.multi *= 4;
                if (player.spectrumLevel[19] === 1) player.specced += Math.pow(player.advSpec.multi, 3);
                else player.specced += player.advSpec.multi;
                player.advSpec.multi = 1;
                if (player.spectrumLevel[19] === 1) player.spectrum = Log.add(player.spectrum, Log.pow(player.advSpec.gain, 2));
                else player.spectrum = Log.add(player.spectrum, player.advSpec.gain);
            }
            if (player.specced == 0) document.getElementById("spectrumCountRGB").classList.remove("hidden");
            pCheck(16);
            for (var i = 0; i < 3; i++) player.bars[Object.keys(player.money)[i]].width = 0;
            player.money = { red: 0, green: 0, blue: 0 };
            player.level = { red: 0, green: 0, blue: [0, 0, 0, 0] };
            player.unlock = player.spectrumLevel[6] == 1;
            player.spliced = { red: 0, green: 0, blue: 0 };
            player.spectrumTimer = 0;
            if (!player.unlock) {
                document.getElementById('unlockBtn').classList.add('hidden');
                document.getElementById('blueDiv').classList.add('hidden');
            }
            document.getElementById("spectrumDiv").classList.add("hidden");
            player.CM = 1;
            updateStats();
            CalcSRgain();
            pCheck(9);
            if (!force) pCheck(1);
        }
    } else {
        resetplayer.bars = { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") };
         save('reset');
         document.location.reload(true);
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
                player.spectrum = new num(0);
                document.getElementById("blackCountRGB").classList.remove("hidden");
                document.getElementById("newupgrades").classList.add("hidden");
                player.prism.active = true;
                mixCost = 0;
            } else return
        }
    }
    if(!blackBar && !player.progress.includes(13)) if (!confirm("You are about to create a prism that has no way of creating blackness!\n Are you sure you want to do this?")) return;
    if (!colorBar) if (!confirm("You are about to create a prism that has no production for colors (This means you can't fesibly make black for next prism)!\n Are you sure you want to do this?")) return;
    if (Log.get(player.black ,"log") >= Log.get(mixCost,"log")) {
        pCheck(3);
        pCheck(4);
        mixReset();
        if (player.progress.includes(13)) player.black = Log.sub(player.black, mixCost);
        else player.black = new num(0);
    } else if (Log.get(player.spectrum,"log") >= Log.get(Log.div(mixCost, Log.max(player.black,1)),"log") && confirm("Do you want to pay the missing blackness using Spectrum? \nThis will cost " + formatNum(Log.div(mixCost, Log.max(player.black,1)), 0) + " Spectrum. This will leave with "+ formatNum(Log.sub(player.spectrum, Log.div(mixCost, Log.max(player.black,1))),0) +" Spectrum.")) {
        pCheck(3);
        pCheck(4);
        player.spectrum = Log.sub(player.spectrum, Log.div(mixCost, Log.max(player.black, 1)));
        mixReset();
        player.black = new num(0);
    }
    function mixReset() {
        var csum = 0;
        p3 = true;
        pCheck(10);
        player.specbar = Object.assign(player.specbar, player.prism.specbar);
        player.potencyEff = Object.assign(player.potencyEff, player.prism.potencyEff);
            for (var i = 0; i < 3; i++) {
                var temp = Object.keys(player.money)[i];
                var row = document.getElementById(temp + "Prism");
                let pot = document.getElementById(temp + 'pot');
                player.prism.potencyEff[temp] = Log.pow(256, player.prism.potency[temp]);
                if (Log.get(player.prism.potencyEff[temp],'l') === Log.get(player.potencyEff[temp],'l')) pot.getElementsByClassName('amnt')[0].innerHTML = formatNum(player.prism.potency[temp],0);
                else pot.getElementsByClassName('amnt')[0].innerHTML = formatNum(Log.log(player.potencyEff[name],256),0) + "(" + formatNum(player.prism.potency[name],0) + ")";
                player.potencyEff[temp] = Log.pow(256, player.prism.potency[temp]);
                player.bars[temp].color = [Math.floor(row.cells[2].childNodes[0].value), Math.floor(row.cells[2].childNodes[2].value), Math.floor(row.cells[2].childNodes[4].value)];
                csum += SumOf(player.bars[temp].color);
                switchTab("RGB", 0);
                reset(1, true);
            }
            pCheck(14);
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
    let num = 0;
    if (player.prism.active) {
        if (index === "black") num = Log.max(Log.sub(getBlack(name, 1000, Log.div(income[name],100), 0, player.spectrum), player.black),0);
        else if (index === "miniBlack") num = Log.max(Log.sub(getBlack(name, 1000, Log.div(income[name], 100), 0, player.spectrum, true), player.black), 0);
        else if (index === "spectrum") num = getSpec(name, income[name],1000);
        else num = Log.multi(income[name],getColorPotency(name,player.bars[name].color[index]));
    }else num = Log.multi(income[name], (player.spectrumLevel[1]+1));
    return(num)
}

function spliceColor(name) {
    if (player.level.blue[3] === 0) return;
    player.spliced[name] = Log.add(player.spliced[name], Log.multi(player.money[name], player.level.blue[3] / 10));
    if (player.level.blue[3] >= 10) player.money[name] = 0;
    else player.money[name] =Log.sub(player.money[name],Log.multi(player.money[name], Math.min(player.level.blue[3] / 10, 1)));
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
    setTimeout(function(){document.body.onclick = function () {
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
        window.removeEventListener("keydown", handleEsc);
    }
    },200)
    function handleEsc(event) {
        let key = event.keyCode || event.which;
        if (key === 27 && num === 0) {
            document.body.onclick = "";
            document.body.onmousemove = "";
            document.getElementsByClassName("popup")[num].style.visibility = "hidden";
            window.removeEventListener("keydown", handleEsc);
        }
    }
    window.addEventListener("keydown",handleEsc)
}

window.addEventListener("keypress",function(event) {
    var key = event.keyCode || event.which;
    if (key == 114) {
        while (buyUpgrade("red"));
        p3 = false;
    }
    if (key == 103) {
        while (buyUpgrade("green"));
        p3 = false;
    }
    if (key >= 49 && key <= 52) {
        while (buyUpgrade("blue", key % 49));
        p3 = false;
    }
    if (key == 109) {
        while (buyUpgrade("green"));
        while (buyUpgrade("red"));
        for (var i = 0; i < 4; i++) while (buyUpgrade("blue", i));
        p3 = false;
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
    player.sleepingTime += time;
    let bprod = [Log.div(Log.multi(auto, IR), 256), Log.div(Log.multi(Log.multi(auto, IR), IG), 65536), Log.div(Log.multi(Log.multi(Log.multi(auto, IR), IG), IB), 16777216)];
    if (!player.unlock) bprod[2] = 0;
    const color = { red: [player.bars.red.color[0], player.bars.green.color[0], player.bars.blue.color[0]], green: [player.bars.red.color[1], player.bars.green.color[1], player.bars.blue.color[1]], blue: [player.bars.red.color[2], player.bars.green.color[2], player.bars.blue.color[2]] };
    const names = ["red", "green", "blue"]; 
    const prod = { red: 0, green: 0, blue: 0, spec: 0 }
    for (let i = 0; i < names.length; i++) {
        if (player.specbar[names[i]]) {
            prod.spec = Log.add(prod.spec, getSpec(names[i], bprod[i], 1000));
            for (let j = 0; j < names.length; j++) color[names[j]][i] = 0;
        }
    }
    for (let i = 0; i < names.length; i++) {
        prod[names[i]] = color[names[i]].reduce(function (acc, val, j) {
            return Log.add(acc, Log.multi(bprod[j], (player.prism.active ? getColorPotency(names[j], val) : (player.spectrumLevel[1] + 1) * val / 255)))
        }, 0);
    }
    for (let i = 0; i < names.length; i++) {
        if (SumOf(player.bars[names[i]].color) === 0) player.black = getBlack(names[i], time, Log.div(bprod[i],1000), prod.spec, player.spectrum);
        if (player.bars[names[i]].color.filter(function (item) { return item === 0 }).length == 2 && player.progress.includes(8)) player.black = getBlack(names[i], time, Log.div(bprod[i],1000), prod.spec, player.spectrum, true);
    }
    while (Log.get(time,"n") > 0) {
        let nextRed = Log.div(Log.sub(price.red, player.money.red), prod.red);
        let nextGreen = Log.div(Log.sub(price.green, player.money.green), prod.green);
        let nextBlue = Log.min(Log.min(Log.div(Log.sub(price.blue[0], player.money.blue), prod.blue), Log.div(Log.sub(price.blue[1], player.money.blue), prod.blue), Log.div(Log.sub(price.blue[2], player.money.blue), prod.blue)), Log.div(Log.sub(price.blue[3], player.money.blue), prod.blue));
        let nextUp = time;
        if (player.AB.red && player.spectrumLevel[9]) nextUp = Log.min(nextUp, nextRed);
        if (player.AB.green && player.spectrumLevel[9]) nextUp = Log.min(nextUp, nextGreen);
        if (player.AB.blue && player.spectrumLevel[9]) nextUp = Log.min(nextUp, nextBlue);
        let nextTime = Log.floor(Log.max(Log.div(time, 100), 5000));

        if (Log.get(nextTime,"l") > Log.get(nextUp, "l")) {
            player.money.red = Log.add(player.money.red, Log.div(Log.multi(prod.red, Log.min(nextTime, time)), 1000));
            player.money.green = Log.add(player.money.green, Log.div(Log.multi(prod.green, Log.min(nextTime, time)), 1000));
            player.money.blue = Log.add(player.money.blue, Log.div(Log.multi(prod.blue, Log.min(nextTime, time)), 1000));
            player.spectrum = Log.add(player.spectrum, Log.div(Log.multi(prod.spec, Log.min(nextTime, time)), 1000));
            time = Log.sub(time, Log.min(nextTime, time));
            
        } else {
            player.money.red = Log.add(player.money.red, Log.div(Log.multi(prod.red, Log.min(nextUp, time)), 1000));
            player.money.green = Log.add(player.money.green, Log.div(Log.multi(prod.green, Log.min(nextUp, time)), 1000));
            player.money.blue = Log.add(player.money.blue, Log.div(Log.multi(prod.blue, Log.min(nextUp, time)), 1000));
            player.spectrum = Log.add(player.spectrum, Log.div(Log.multi(prod.spec, Log.min(nextUp, time)), 1000));
            time = Log.sub(time,Log.min(nextUp, time));
        }
        if(player.AB.red && player.spectrumLevel[4]) while (buyUpgrade("red"));
        if (player.AB.green && player.spectrumLevel[5]) while (buyUpgrade("green"));
        if (player.AB.blue && player.spectrumLevel[9]) for (var i = 0; i < 4; i++) while (buyUpgrade("blue", i));
        updateStats();
        prod.spec = 0;
        let bprod = [Log.div(Log.multi(auto, IR), 256), Log.div(Log.multi(Log.multi(auto, IR), IG), 65536), Log.div(Log.multi(Log.multi(Log.multi(auto, IR), IG), IB), 16777216)];
        for (let i = 0; i < names.length; i++) {
            if (player.specbar[names[i]]) {
                prod.spec = Log.add(prod.spec, getSpec(names[i], bprod[i], 1000));
                for (let j = 0; j < names.length; j++) color[names[j]][i] = 0;
            }
        }
        for (let i = 0; i < names.length; i++) {
            prod[names[i]] = color[names[i]].reduce(function (acc, val, i) { return Log.add(acc, Log.multi(bprod[i], (player.prism.active ? getColorPotency(names[i], val) : (player.spectrumLevel[1] + 1)))) }, 0);
        }
    }
    console.log("Finished simulating offline time!");
}

function formatTime(num) {
    if (num >= 1.728e+8) return Math.floor(num / 8.64e+7) + " days and " + Math.floor((num % 8.64e+7) / 3600000) + " hours";
    return (num >= 3600000 ? Math.floor(num / 3600000) + " hours and " + Math.floor((num % 3600000) / 60000) + " mins" : (num >= 60000 ? Math.floor(num / 60000) + " mins and " + Math.floor((num % 60000) / 1000) + " secs" : (num >= 10000 ? Math.floor(num / 1000) + " secs" : (num > 0 ? Math.round(num) + " millis" : 0))));
}

function getSpec(name, prod, time) {
    let timeRatio = Log.div(time, 1000);
    
    let blackMulti = 1;
    if (player.progress.includes(11)) blackMulti = Log.max(Log.sqrt(Log.max(Log.log10(player.black),0)), 1);
    let logprod = Log.floor(Log.max(Log.pow(Log.log(Log.multi(prod,10), 10),Log.log(Cores, 128)), 0));
    let coreMulti = 1;
    if (player.progress.includes(6)) coreMulti = Log.add(1, Log.div(player.level.blue[3], 10));
    let timeMulti = 1;
    if (player.progress.includes(9)) timeMulti = Log.add(1, Log.log10(Log.max(Log.div(player.spectrumTimer, 60000), 1)));
    let potMulti = 1;
    if (player.progress.includes(14)) potMulti = Log.pow(16, (Log.floor(Log.div(Log.log(player.potencyEff[name], 256), 5))));
    let specMulti = 1;
    if (player.progress.includes(16)) specMulti = Log.sqrt(player.specced);
    return Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(blackMulti, logprod), coreMulti), timeMulti), potMulti), timeRatio),specMulti);
}

function getBlack(name, time, prod, specprod, spectrum, mini) {
    let A = Math.pow(2,1/(1 + Math.min(player.prism.cost/10,0.5)));
    if (mini) A = 3;
    let mults;
    if(player.spectrumLevel[18] === 1) mults = Log.max(Log.multi(Log.multi(Log.multi(prod, Log.pow(player.potencyEff[name],Log.add(1,Log.floor(Log.div(Log.log(player.potencyEff[name],256),7))))), (player.spectrumLevel[1] + 1)), (player.progress.includes(3) ? Cores : 1)), 0);
    else mults = Log.max(Log.multi(Log.multi(Log.multi(prod, player.potencyEff[name]), (player.spectrumLevel[1] + 1)), (player.progress.includes(3) ? Cores : 1)), 0);
    let blackThreshold = 1e100;
    let ret = Log.root(Log.add(Log.div(Log.multi(Log.multi(mults, time), Log.add(Log.multi(specprod, time), Log.multi(2, spectrum))),blackThreshold), Log.pow(player.black, A)), A);
    if (Log.get(ret, 'l') < -2) return 0;
    return ret;
}

function getColorPotency(name,color,prism) {
    let potency = player.potencyEff[name];
    if (prism) potency = player.prism.potencyEff[name];
    let multi = (player.spectrumLevel[1] + 1);
    color = (color / 255) * (player.prism.cost/2 + 1);
    if(Log.get(potency,'n') < 1){
        return color / 512;
    }
    let ret = Log.sub(Log.pow(Log.multi(potency , multi), color),1);
    if (player.progress.includes(12)) {
        if (prism) ret = Log.multi(ret, Log.pow(256, [parseFloat(document.getElementById(name + "Prism").cells[2].childNodes[0].value), parseFloat(document.getElementById(name + "Prism").cells[2].childNodes[2].value), parseFloat(document.getElementById(name + "Prism").cells[2].childNodes[4].value)].filter(function (item) { return item == 0 }).length));
        else ret = Log.multi(ret,Log.pow(256, player.bars[name].color.filter(function (item) { return item === 0 }).length));
    }
    return ret;
}


