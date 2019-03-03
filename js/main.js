var tbSize = 10;
var table = [];

var targetCell = null;

// ---- Utility Functions ----
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
    return null
}

function highlightLine(x1, y1, x2, y2) {
    var dir = checkLine(x1, y1, x2, y2)
    if (!dir) return
    var dx = dir[0]
    var dy = dir[1]
    var x = x1
    var y = y1
    do {
        x += dx
        y += dy
        setCellColorByXY(x, y, "yellow")
        if (x == x2 && y == y2) {
            break
        }
    } while (x < tbSize && y < tbSize); // just in case
}

var hLine = "linear-gradient(   0deg, transparent 48%, red 48%, red 52%, transparent 52%)"
var vLine = "linear-gradient(  90deg, transparent 48%, red 48%, red 52%, transparent 52%)"
var rtLine = "linear-gradient( 45deg, transparent 48%, red 48%, red 52%, transparent 52%)"
var ltLine = "linear-gradient(-45deg, transparent 48%, red 48%, red 52%, transparent 52%)"

var rtCorner = "linear-gradient( 45deg, transparent 98%, green 98%)"
var ltCorner = "linear-gradient(-45deg, transparent 98%, green 98%)"
var rbCorner = "linear-gradient(-45deg, green 2%, transparent 2%)"
var lbCorner = "linear-gradient( 45deg, green 2%, transparent 2%)"

function drawLineInCell(x, y, dir) {
    var dx = dir[0]
    var dy = dir[1]
    var prev = $("#" + cellIdStr(x, y)).css("background-image") + ","
    if (dx == 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + hLine)
    } else if (dy == 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + vLine)
    } else if (dx > 0 && dy > 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + rtLine)

        // Display corners to fill a gap bettween two lines.
        prev = $("#" + cellIdStr(x - 1, y)).css("background-image") + ","
        $("#" + cellIdStr(x - 1, y)).css("background-image", prev + lbCorner)
        prev = $("#" + cellIdStr(x, y - 1)).css("background-image") + ","
        $("#" + cellIdStr(x, y - 1)).css("background-image", prev + rtCorner)
    } else if (dx > 0 && dy < 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + ltLine)

        prev = $("#" + cellIdStr(x - 1, y)).css("background-image") + ","
        $("#" + cellIdStr(x - 1, y)).css("background-image", prev + rbCorner)
        prev = $("#" + cellIdStr(x, y + 1)).css("background-image") + ","
        $("#" + cellIdStr(x, y + 1)).css("background-image", prev + ltCorner)
    } else if (dx < 0 && dy > 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + ltLine)

        prev = $("#" + cellIdStr(x + 1, y)).css("background-image") + ","
        $("#" + cellIdStr(x + 1, y)).css("background-image", prev + ltCorner)
        prev = $("#" + cellIdStr(x, y - 1)).css("background-image") + ","
        $("#" + cellIdStr(x, y - 1)).css("background-image", prev + rbCorner)
    } else if (dx < 0 && dy < 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + rtLine)

        prev = $("#" + cellIdStr(x + 1, y)).css("background-image") + ","
        $("#" + cellIdStr(x + 1, y)).css("background-image", prev + rtCorner)
        prev = $("#" + cellIdStr(x, y + 1)).css("background-image") + ","
        $("#" + cellIdStr(x, y + 1)).css("background-image", prev + lbCorner)
    }
}

function drawLine(x1, y1, x2, y2) {
    var dir = checkLine(x1, y1, x2, y2)
    if (!dir) return
    var dx = dir[0]
    var dy = dir[1]
    var x = x1
    var y = y1
    drawLineInCell(x, y, dir)
    do {
        x += dx
        y += dy
        drawLineInCell(x, y, dir)
        if (x == x2 && y == y2) {
            break
        }
    } while (x < tbSize && y < tbSize); // just in case
}

// ---- Initialization ---- 
var hiraganaList = [
    "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ",
    "た", "ち", "つ", "て", "と", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "ん",
]

function randomHiragana() {
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

// ---- Event Handlers ----
$(".cell").on("click", function () {
    var x = dom2Cell(this)[0]
    var y = dom2Cell(this)[1]

    if (!targetCell) {
        // create targetCell
        targetCell = [x, y]
        setCellColorByXY(x, y, "yellow")
        return
    }
    drawLine(targetCell[0], targetCell[1], x, y)
    if (targetCell[0] == x && targetCell[1] == y) {
        // toggle targetCell
        setCellColorByXY(targetCell[0], targetCell[1], "white")
        targetCell = null
    } else {
        // replace targetCell
        clearTableColor()
        setCellColorByXY(targetCell[0], targetCell[1], "white")
        targetCell = [x, y]
        setCellColorByXY(x, y, "yellow")
    }
})

$(".cell").mouseover(function () {
    clearTableColor()
    setCellColorByDom(this, "yellow")
    if (targetCell) {
        setCellColorByXY(targetCell[0], targetCell[1], "yellow")

        var x = dom2Cell(this)[0]
        var y = dom2Cell(this)[1]
        highlightLine(targetCell[0], targetCell[1], x, y)
    }
})
