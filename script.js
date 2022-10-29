const container = document.querySelector('.middle');
const board =[];
let okRow = new Array(9);
let okCol = new Array(9);
let okBox = new Array(3);
let  found = false;
let st = new Set();
for (let i = 0; i < 3; i++) okBox[i] = new Array(3);
//draw the board
for (let i = 0; i < 9; i++) {
    board.push([]);
    const line = document.createElement('div');
    line.classList = 'line'
    for (let j = 0; j < 9; j++) {
        const cell = document.createElement('input');
        cell.setAttribute('maxlength',1 );
        cell.classList.add('cell');
        line.appendChild(cell);
        board[i].push(cell);
    }
    container.append(line);
}

// clear everything when click reset button
reset_btn = document.querySelector('.reset-btn');
reset_btn.addEventListener('click', () => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            board[i][j].value="";
            board[i][j].style.color = 'black';
        }
    }
})

function change(i, j, val) {
    okRow[i] ^= 1 << val;
    okCol[j] ^= 1 << val;
    okBox[Math.floor(i / 3)][Math.floor(j / 3)] ^= 1 << val;
}

function get(i, j) {
    return okRow[i] & okCol[j] & okBox[Math.floor(i / 3)][Math.floor(j / 3)];
}

function hash(a, b) {
    return a * 10 + b;
}

function bitCount (n) {
    let count = 0;
    while (n) {
        count += n & 1;
        n >>= 1;
    }
    return count;
}

function iterate() {
    if (found) return;
    if (st.size == 0) {
        found = true;
        return;
    }
    let curi = -1, curj = -1, bits = 10;
    for (const x of st) {
        let i = Math.floor(x / 10), j = x % 10;
        let num = get(i, j);
        if (num == 0) return;
        if (bitCount(num) < bits) {
            bits = bitCount(num);
            curi = i;
            curj = j;
        }
    }
    let num = get(curi, curj);
    for (let val = 1; val < 10; val++) {
        if (num & (1 << val)) {
            board[curi][curj].value = val;
            board[curi][curj].style.color = 'red';
            change(curi, curj, val);
            st.delete(hash(curi, curj));
            iterate();
            if (found) return;
            board[curi][curj].value = "";
            change(curi, curj, val);
            st.add(hash(curi, curj));
        }
    }
}

function initialize() {
    found = false;
    st.clear();
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) st.add(hash(i, j));
    }
    for (let i = 0; i < 9; i++) {
        okRow[i] = (1 << 10) - 2;
        okCol[i] = (1 << 10) - 2;
    }
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            okBox[i][j] = (1 << 10) - 2;
        }
    }
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j].value) {
                change(i, j, board[i][j].value);
                st.delete(hash(i, j));
            }
        }
    }
}

// Check for conflict
function isValid() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j].value == '') continue;
            for (let k = 0; k < 9; k++) {
                for (let l = 0; l < 9; l++) {
                    if (board[k][l].value == '') continue;
                    if (i == k && j == l) continue;
                    if(board[i][j].value == board[k][l].value) { 
                        if (i == k || j == l || 
                            (Math.floor(i / 3) == Math.floor(k / 3) && 
                            Math.floor(j / 3) == Math.floor(l / 3))) {
                            alert("Input conflict at cell ("+(i+1)+","+(j+1)+") and ("+(k+1)+","+(l+1)+")");
                            return false;
                        }
                    }
                }
            }
        }
    }
    return true;
}
//get the input from the board and solve the puzzle
solve_btn = document.querySelector('.solve-btn');
solve_btn.addEventListener('click', () => {
    if (isValid()) {
        initialize();
        iterate();
        if(!found) alert("No Solution Found");
    }
});