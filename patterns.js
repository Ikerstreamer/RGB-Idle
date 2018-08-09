let pattern = (function () {
    let pubFunc = {};
    let options = {
        amnt: 0,
        list: [],
    };

    pubFunc.newOption = function (arr) {
        let temp = {};
        temp.id = options.amnt;
        options.amnt++;
        temp.grid = arr;
        if (Array.isArray(arr[0])) {
            temp.width = arr[0].length;
            temp.height = arr.length;
        } else {
            temp.width = arr.length;
            temp.height = 1;
        } 
        if (temp.height === undefined) temp.height = 1;
        options.list.push(temp);
    };
    pubFunc.check = function (arr) {
        let check = arr;
        let index = [0, 0];
        let size;
        if (Array.isArray(check[0])) size = [check[0].length, check.length];
        else size = [check.length, 1];
        let correct = [];
        //skip patterns that are too big
        let fill = [];

        //Checks if the grid spaces are alike
        function checkCoords(i) {
            let grid = fill[i].grid;
            for (let j = 0; j < fill[i].height; j++) {
                for (let l = 0; l < fill[i].width; l++) {
                    let ret1;
                    let ret2;
                    if (size[1] === 1) ret1 = check[index[0] + l];
                    else ret1 = check[index[1] + j][index[0] + l];
                    if (fill[i].height === 1) ret2 = grid[l];
                    else ret2 = grid[j][l];
                    if (ret1 != ret2) return false;
                }
            }
            return true;
        }
        for (index[0] = 0; index[0] < size[0]; index[0]++) {
            for (index[1] = 0; index[1] < size[1]; index[1]++) {
                fill = [];
                for (let i = 0; i < options.amnt; i++) {
                    if (options.list[i].height <= size[1] - index[1] && options.list[i].width <= size[0] - index[0]) fill.push(options.list[i]);
                }
                if (fill.length === 0) break;
                for (let i = 0; i < fill.length; i++) {
                    if (checkCoords(i)) correct.push(fill[i]);
                }
            }
        }
        return correct;
    }
    return pubFunc;
}());
//(n.split('+')).map(function (val) { return ((new Array(val.charCodeAt(0) - 96)).fill(new Array(val.charCodeAt(1) - 96).fill("X"))).map(function (val2, i, a) { let temp = atob(val.substr(2)); return val2.map(function (val3, i2, a2) { return val3 = String.fromCharCode(temp.substr((a2.length * i + i2) * 2, 2)) }) }) }).forEach(function (val) { pattern.newOption(val) });


