var tbSize = 10;
var table = [];

var targetCell = undefined;

// utils
function cellIdStr(x, y) {
    return "cell_" + x + "_" + y;
}

function dom2Cell(dom) {
    var cellStr = $(dom).attr("id");
    var x = parseInt(cellStr.split("_")[1])
    var y = parseInt(cellStr.split("_")[2])
    return [x, y]
}

function setCellColorByXY(x, y, colorStr) {
    $("#" + cellIdStr(x, y)).css("background-color", colorStr)
}

function setCellColorByDom(dom, colorStr) {
    $(dom).css("background-color", colorStr)
}

function clearTableColor() {
    $(".cell").css("background-color", "white")
}

function checkLine(x1, y1, x2, y2) {
    if (x1 == x2) {
        if (y1 < y2) {
            return [0, 1]
        } else if (y1 > y2) {
            return [0, -1]
        }
    } else if (y1 == y2) {
        if (x1 < x2) {
            return [1, 0]
        } else if (x1 > x2) {
            return [-1, 0]
        }
    } else if (x1 < x2) {
        if (x2 - x1 == y2 - y1) {
            return [1, 1]
        } else if (x2 - x1 == y1 - y2) {
            return [1, -1]
        }
    } else if (x1 > x2) {
        if (x2 - x1 == y2 - y1) {
            return [-1, -1]
        } else if (x2 - x1 == y1 - y2) {
            return [-1, 1]
        }
    }
    return undefined
}

function drawLine(x1, y1, x2, y2) {
    var dir = checkLine(x1, y1, x2, y2)
    if (!dir) return
    dx = dir[0]
    dy = dir[1]

    x = x1
    y = y1
    do {
        x += dx
        y += dy
        setCellColorByXY(x, y, "yellow")
        if (x == x2 && y == y2) {
            break
        }
    } while (x < tbSize && y < tbSize); // just in case
}

// init
function randomHiragana() {
    var hiraganaList = [
        "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ",
        "た", "ち", "つ", "て", "と", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
        "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "ん",
    ]
    var index = Math.round(Math.random() * (hiraganaList.length - 1))
    return hiraganaList[index]
}

function createTable() {
    for (var i = 0; i < tbSize; i++) {
        var row = []
        for (var j = 0; j < tbSize; j++) {
            row.push(randomHiragana())
        }
        table.push(row)
    }
}

function showTable() {
    var tbHtml = ""
    for (var i = 0; i < tbSize; i++) {
        tbHtml += "<tr>"
        for (var j = 0; j < tbSize; j++) {
            tbHtml += "<td class=\"cell\" id=" + cellIdStr(i, j) + ">"
            tbHtml += table[i][j]
            tbHtml += "</td>"
        }
        tbHtml += "</tr>"
    }
    $("#tb").append(tbHtml)
}

function init() {
    createTable()
    showTable()
}
init()

// event handlers
$(".cell").on("click", function () {
    var x = dom2Cell(this)[0]
    var y = dom2Cell(this)[1]
    targetCell = [x, y]
    setCellColorByXY(x, y, "yellow")
})

$(".cell").mouseover(function () {
    if (targetCell) {
        clearTableColor()
        setCellColorByXY(targetCell[0], targetCell[1], "yellow")

        var x = dom2Cell(this)[0]
        var y = dom2Cell(this)[1]
        drawLine(targetCell[0], targetCell[1], x, y)
    }
})

//     background-image: linear-gradient(to top right,red 2%,transparent 2%, transparent 48%, red 48%, red 52%, transparent 52%, transparent 98%, red 98%)