const container = document.querySelector('.middle');
const board =[];
let okRow = new Array(9);
let okCol = new Array(9);
let okBox = new Array(3);
let  found = false;
let st = new Set();
let enableSolveBTN = true;
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

function addAlert (i, j, k, l) {
    enableSolveBTN = false;
    board[i][j].style.backgroundColor = '#FFCCCB';
    board[k][l].style.backgroundColor = '#FFCCCB';
    let div = document.querySelector('.alert');
    div.textContent = "Conflict with cell (" + k + ", " + l + ")";
}

function EraseAlert(i, j, k, l) {
    enableSolveBTN = true;
    board[i][j].style.backgroundColor = 'white';
    board[k][l].style.backgroundColor = 'white';
    board[i][j].value = "";
    let div = document.querySelector('.alert');
    div.textContent = "";
}
// adding borders to the board
for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j += 3) {
        board[i][j].style.borderLeftWidth = '3px';
        board[j][i].style.borderTopWidth = '3px';
    }
    board[i][8].style.borderRightWidth = '4px';
    board[8][i].style.borderBottomWidth ='4px';
    board[i][0].style.borderLeftWidth = '4px';
    board[0][i].style.borderTopWidth ='4px';
}

function Valid (i, j, k, l) {
    if (board[k][l].value == '') return;
    if (i == k && j == l) return;
    if(board[i][j].value == board[k][l].value) { 
        if (i == k || j == l || 
            (Math.floor(i / 3) == Math.floor(k / 3) && 
            Math.floor(j / 3) == Math.floor(l / 3))) {
            addAlert(i, j, k, l);
            document.body.addEventListener('click', () => {
                EraseAlert(i, j, k, l);
            }, {once: true});
            board[i][j].addEventListener('keydown', () => {
                EraseAlert(i, j, k, l);
            }, {once: true}); 
            return ;
        }
    }
}
for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
        board[i][j].addEventListener('input', (event) => {
            // Restrict character to be input.
            val = board[i][j].value // get the character jus pressed
            regex = /[1-9]/; //regex for 1-9 
            if (!regex.test(val)) {
                board[i][j].value ="";
            }
        });
        board[i][j].addEventListener('input', () => {
            for (let k = 0; k < 9; k++) {
                for (let l = 0; l < 9; l++) {
                    Valid(i, j, k, l);
                }
            }
        });
    }
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

//get the input from the board and solve the puzzle
solve_btn = document.querySelector('.solve-btn');
solve_btn.addEventListener('click', () => {
    if (!enableSolveBTN) return;
    initialize();
    iterate();
    if(!found) alert("No Solution Found");
});
