// JavaScript source code
let pattern = {
    options: {
        amnt: 0,
        list:[],
    },
    newOption: function (arr) {
        let temp = {};
        temp.id = this.options.amnt;
        this.options.amnt++;
        temp.grid = arr;
        if (Array.isArray(arr[0])) {
            temp.width = arr[0].length;
            temp.height = arr.length;
        } else {
            temp.width = arr.length;
            temp.height = 1;
        }
        if (temp.height === undefined) temp.height = 1;
        this.options.list.push(temp);
    },
    check: function (arr) {
        let check = arr;
        let index = [0, 0];
        let size;
        if(Array.isArray(check[0])) size = [check[0].length, check.length]; 
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
                    if(size[1] === 1)ret1 = check[index[0] + l];
                    else ret1 = check[index[1] + j][index[0] + l];
                    if(fill[i].height === 1)ret2 = grid[l];
                    else ret2 = grid[j][l];
                    console.log(ret1, ret2);
                    if (ret1 != ret2) return false;
                }
            }
            return true;
        }
        for (index[0] = 0; index[0] < size[0]; index[0]++) {
            for (index[1] = 0; index[1] < size[1]; index[1]++) {
                fill = [];
                for (let i = 0; i < this.options.amnt; i++) {
                    if (this.options.list[i].height <= size[1] - index[1] && this.options.list[i].width <= size[0] - index[0]) fill.push(this.options.list[i]);
                }
                if (fill.length === 0) break;
                for (let i = 0; i < fill.length; i++) {
                    if (checkCoords(i)) correct.push(fill[i].id);
                }
            }
        }
        console.log(correct);
    }
}