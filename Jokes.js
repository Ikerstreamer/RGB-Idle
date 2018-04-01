
        var stuff = [" Sup"," nerd,"," you", " have", " been", " pranked!", " Happy"," April", " fools", " 2018!"]
        function DisplayText(num,elem){
        var num = prank(document.getElementById("in").value);
        var out1 = document.createElement("span");
            var out2 = document.createElement("span");
            out1.stlye.width = 50%;
            out1.fontSize = 0.5em;
            out1.innerHTML = num.m;
            out2.stlye.width = 50%;
        out2.innerHTML = num.e;
        out2.style.fontSize = (elem.fontSize.replace("px","")/Math.log(num.e.length)) + "px";
        out2.style.lineHeight = (elem.fontSize.replace("px","")/Math.log(num.e.length)) + "px";
            elem.appendChild(out1);
            elem.appendChild(out2);
        }
        function prank(num){
            if(num>=Number.MAX_VALUE) return "Infinity";
            var digits = Math.floor(Math.log10(num));
            var temp = {}; 
            temp.m = (num / Math.pow(10,digits)).toFixed(1) + "e";
            temp.e = "";
            for(var i = 0;i<digits;i++){
                temp.e = temp.e + stuff[i%10];
            }
            return temp;
        }
        
