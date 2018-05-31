// JavaScript source code
function num(input, force) {
    this.val;
    this.typ;
    if (force === "log") {
        if (input <= 308) {
            this.typ = "num";
            this.val = Math.pow(10, input);
        } else {
            this.typ = "log";
            this.val = input;
        }
    }else if(isFinite(input)){
        this.typ = "num";
        this.val = input;
    }else if(input.typ === "log" || input.typ === "num"){
        this.typ = input.typ;
        this.val = input.val;
    }else if(input.charAt(0).toLowerCase() === "e" && isFinite(parseFloat(input.replace(/e/i,"")))){
        this.typ = "log";
        this.val = parseFloat(input.replace(/e/i, ""));
    } else if (isFinite(parseFloat(input))) {
        this.typ = "num";
        this.val = parseFloat(input);
    } else {
        console.error("Invalid input, can not create a number! Setting value to 0.", input);
        this.typ = "num";
        this.val = 0;
    }
}

const Log = {
    get: function (input, type) {
        if (typeof input === 'number') {
            if (type === 'num' || type === 'n' || type === undefined) return input;
            if (type === 'log' || type === 'l') return Math.log10(input);
        }
        if (input.typ === type || type === input.typ.charAt(0) || type === undefined) return input.val;
        if (type === "num" || type === "n") {
            if(isFinite(Math.pow(10,input.val)))return Math.pow(10,input.val);
            return Math.pow(10,input.val % 1) + "e" + Math.floor(input.val);
        }
        if(type === "log" || type === "l") return Math.log10(input.val);
    },

    check: function(in1,in2){
        let ret = {};
        if (in1.typ === "log" || in2.typ === "log") {
            if (in1.val === 0 || in1 === 0) {
                ret.typ = "null";
                ret.n1 = 0;
            }
            if (in2.val === 0 || in2 === 0) {
                ret.typ = "null";
                ret.n2 = 0;
            }
            if (ret.typ === "null") {
                if (ret.n1 === undefined) ret.n1 = "e" + in1.val;
                if (ret.n2 === undefined) ret.n1 = "e" + in2.val;
                return ret;
            }
            ret.typ = "log";
            if(in1.typ === "log") ret.n1 = in1.val;
            else if(in1.typ === "num") ret.n1 = Math.log10(in1.val);
            else ret.n1 = Math.log10(in1);
            if(in2.typ === "log") ret.n2 = in2.val;
            else if(in2.typ === "num") ret.n2 = Math.log10(in2.val);
            else ret.n2 = Math.log10(in2);
            return ret;
        }
        ret.typ = "num";
        if(in2.typ === "num") ret.n2 = in2.val;
        else ret.n2 = in2;
        if(in1.typ === "num") ret.n1 = in1.val;
        else ret.n1 = in1;
        return ret;
    },

    max: function (in1, in2) {
        let typ = this.check(in1, in2).typ;
        let n1 = this.check(in1, in2).n1;
        let n2 = this.check(in1, in2).n2;
        if (typ === "num") {
            if (isFinite(Math.max(n1, n2))) return new num(Math.max(n1, n2));
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        if (typ === "null") {
            if (n1 === 0 && n2 === 0) return new num(0);
            let tn1 = 0;
            let tn2 = 0;
            if (n1 === 0) {
                tn2 = parseFloat(n2.replace(/e/i, ""));
            } else {
                tn1 = parseFloat(n1.replace(/e/i, ""));
            }
            if (tn1 >= tn2) return new num(n1);
            else return new num(n2);
        }
        return new num(Math.max(n1, n2), "log");
    },

    min: function (in1, in2) {
        let typ = this.check(in1, in2).typ;
        let n1 = this.check(in1, in2).n1;
        let n2 = this.check(in1, in2).n2;
        if (typ === "num") {
            if (isFinite(Math.max(n1, n2))) return new num(Math.min(n1, n2));
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        if (typ === "null") return new num(0);
        return new num(Math.min(n1, n2), "log");
    },

    ceil: function (in1) {
        let n;
        let typ = "num";
        if(typeof in1 === "num") n = in1;
        else{
            typ = in1.typ;
            n = in1.val;
        }
        if (typ === "num") {
            if (isFinite(Math.ceil(n))) return new num(Math.ceil(n));
            n = Math.log10(n);
        }
        if (n < 25) {
            return new num(Math.log10(Math.ceil(Math.pow(10,n))), "log");
        }
        return new num(n,"log")
    },

    floor: function (in1) {
        let n;
        let typ = "num";
        if (typeof in1 === "num") n = in1;
        else {
            typ = in1.typ;
            n = in1.val;
        }
        if (typ === "num") {
            if (isFinite(Math.floor(n))) return new num(Math.floor(n));
            n = Math.log10(n);
        }
        if (n < 25) {
            return new num(Math.log10(Math.floor(Math.pow(10, n))), "log");
        }
        return new num(n, "log")
    },

    round: function (in1) {
        let n;
        let typ = "num";
        if (typeof in1 === "num") n = in1;
        else {
            typ = in1.typ;
            n = in1.val;
        }
        if (typ === "num") {
            if (isFinite(Math.ceil(n))) return new num(Math.ceil(n));
            n = Math.log10(n);
        }
        if (n < 25) {
            return new num(Math.log10(Math.round(Math.pow(10, n))), "log");
        }
        return new num(n, "log")
    },

    mod: function (in1, in2) {
        let typ = this.check(in1, in2).typ;
        let n1 = this.check(in1, in2).n1;
        let n2 = this.check(in1, in2).n2;
        if (typ === "num") {
            if (isFinite(n1%n2)) return new num(n1%n2);
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        if (n1 < 25 && n2 < 25) {
            return new num(Math.pow(10,n1) % Math.pow(10,n2), "num");
        }
        return new num(0, "num")
    },


    log: function (in1, in2) {
        let typ = this.check(in1, in2).typ;
        let n = this.check(in1, in2).n1;
        let base = this.check(in1, in2).n2;
        if (typ === "null" || n === 0 || base === 0) return new num(0);
        if (typ === "num") {
            if (isFinite(Math.log(n) / Math.log(base))) return new num(Math.log(n) / Math.log(base));
            n = Math.log10(n);
            base = Math.log10(base);
        }
        return new num(n/base,"num")
    },

    log10: function (in1) {
        return(this.log(in1, 10));
    },

    ln: function (in1) {
        return(this.log(in1, Math.E));
    },

    pow: function (in1, in2) {
        let typ = this.check(in1, in2).typ;
        let base = this.check(in1, in2).n1;
        let exp = this.check(in1, in2).n2;
        if (typ === "null") {
            if (exp === 0) return new num(1);
            if (base === 0) return new num(0);
        }
        if (typ === "num") {
            if (isFinite(Math.pow(base, exp))) return new num(Math.pow(base,exp));
            base = Math.log10(base);
            exp = Math.log10(exp);
        }
        return new num(base * Math.pow(10,exp), "log");
    },

    root: function (in1, in2) {
        let typ = this.check(in1, in2).typ;
        let n1 = this.check(in1, in2).n1;
        let n2 = this.check(in1, in2).n2;
        if (typ === "num") {
            if (isFinite(Math.pow(n1, 1/n2))) return new num(Math.pow(n1, 1/n2));
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        if (typ === "null") return new num(0);
        return new num(n1 / Math.pow(10,n2), "log");
    },

    sqrt: function (in1) {
        return this.root(in1, 2);
    },

    cbrt: function (in1) {
        return this.root(in1, 3);
    },

    multi: function(in1, in2){
        let typ = this.check(in1,in2).typ;
        let n1 = this.check(in1,in2).n1;
        let n2 = this.check(in1,in2).n2;
        if(typ === "num"){
            if(isFinite(n1 * n2)) return new num(n1 * n2);
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        if (typ === "null") return new num(0);
        return new num(n1 + n2,"log");
    },
    
    div: function(in1,in2){
        let typ = this.check(in1,in2).typ;
        let n1 = this.check(in1,in2).n1;
        let n2 = this.check(in1,in2).n2;
        if(typ === "num"){
            if(isFinite(n1 / n2)) return new num(n1 / n2);
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        if (typ === "null") return new num(0);
        return new num(n1 - n2,"log");
    },

    add: function(in1, in2) {
        let typ = this.check(in1,in2).typ;
        let n1 = this.check(in1,in2).n1;
        let n2 = this.check(in1, in2).n2;
        if (typ === "null") {
            if (n1 === 0) return new num(n2);
            return new num(n1);
        }
        if(typ === "num"){
            if(isFinite(n1 + n2)) return new num(n1 + n2);
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        let m1 = Math.pow(10, n1 % 1);
        let e1 = Math.floor(n1);
        let m2 = Math.pow(10, n2 % 1);
        let e2 = Math.floor(n2)
        if (e1 >= e2) {
            let y = m1 + m2 / Math.pow(10, e1 - e2);
            return new num (Math.log10(y) + e1,"log");
        } else if (e1 < e2) {
            let y = m2 + m1 / Math.pow(10, e2 - e1);
            return new num(Math.log10(y) + e2,"log");
        }
    },

    sub: function (in1, in2) {
        let typ = this.check(in1,in2).typ;
        let n1 = this.check(in1,in2).n1;
        let n2 = this.check(in1, in2).n2;
        if (typ === "null") {
            if (n1 === 0) return new num(n2);
            return new num(n1);
        }
        if(typ === "num"){
            if(isFinite(n1 - n2)) return new num(n1 - n2);
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        let m1 = Math.pow(10, n1 % 1);
        let e1 = Math.floor(n1);
        let m2 = Math.pow(10, n2 % 1);
        let e2 = Math.floor(n2);
        let y = m1 - m2 / Math.pow(10, e1 - e2);
        if (y < 0) return new num(0);
        return new num (Math.log10(y) + e1,"log");
    },


}

 /*function Add(n1, n2) {
    let num;
    let m1 = Math.pow(10, n1 % 1);
    let e1 = Math.floor(n1);
    let m2 = Math.pow(10, n2 % 1);
    let e2 = Math.floor(n2)
    if (e1 >= e2) {
        let y = m1 + m2 / Math.pow(10, e1 - e2);
        return num = Math.log10(y) + e1;
    } else if (e1 < e2) {
        let y = m2 + m1 / Math.pow(10, e2 - e1);
        return num = Math.log10(y) + e2;
    }
}*/
