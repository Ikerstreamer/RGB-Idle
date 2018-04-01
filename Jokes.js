
function DisplayText(num, elem) {
    var num = prank(num);
    elem.innerHTML = "";
    var tab = document.createElement("table");
    tab.style.width = "100%";
    var row = tab.insertRow(0);
    var out1 = row.insertCell(0);
    var out2 = row.insertCell(1);
    out1.style.fontSize = "0.5em";
    out1.innerHTML = num.m;
    out2.innerHTML = num.e;
    out2.style.fontSize = (window.getComputedStyle(elem, null).getPropertyValue("font-size").replace("px", "") / Math.log(num.e.length)) + "px";
    out2.style.lineHeight = (window.getComputedStyle(elem,null).getPropertyValue("font-size").replace("px","") / Math.log(num.e.length)) + "px";
    elem.appendChild(tab);
}
function prank(num) {
    var stuff = [" Sup", " nerd,", " you", " have", " been", " pranked!", " Happy", " April", " fools", " 2018!"]
    if (num >= Number.MAX_VALUE) return "Infinity";
    var digits = Math.floor(Math.log10(num));
    var temp = {};
    temp.m = (num / Math.pow(10, digits)).toFixed(1) + "e";
    temp.e = "";
    for (var i = 0; i < digits; i++) {
        temp.e = temp.e + stuff[i % 10];
    }
    return temp;
}

