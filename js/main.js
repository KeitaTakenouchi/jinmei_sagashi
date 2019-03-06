var tbSize = 15
var table = [];

var markedCell = null;
var targetList = []
var char2XY = {}

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
    $(".cell").css("background-color", "transparent")
}

function isInTable(x, y) {
    return 0 <= x && x < tbSize && 0 <= y && y < tbSize
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

var width = 2;
var hLine = "linear-gradient(   0deg, transparent " + (50 - width) + "%, red " + (50 - width) + "%, red " + (50 + width) + "%, transparent " + (50 + width) + "%)"
var vLine = "linear-gradient(  90deg, transparent " + (50 - width) + "%, red " + (50 - width) + "%, red " + (50 + width) + "%, transparent " + (50 + width) + "%)"
var rtLine = "linear-gradient(  45deg, transparent " + (50 - width) + "%, red " + (50 - width) + "%, red " + (50 + width) + "%, transparent " + (50 + width) + "%)"
var ltLine = "linear-gradient( -45deg, transparent " + (50 - width) + "%, red " + (50 - width) + "%, red " + (50 + width) + "%, transparent " + (50 + width) + "%)"

var rtCorner = "linear-gradient( 45deg, transparent " + (100 - width) + "%, red " + (100 - width) + "%)"
var ltCorner = "linear-gradient(-45deg, transparent " + (100 - width) + "%, red " + (100 - width) + "%)"
var rbCorner = "linear-gradient(-45deg, red " + (width) + "%, transparent " + (width) + "%)"
var lbCorner = "linear-gradient( 45deg, red " + (width) + "%, transparent " + (width) + "%)"

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

function checkName(x1, y1, x2, y2) {
    if (!checkLine(x1, y1, x2, y2)) return false

    var dx = x2 - x1
    var dy = y2 - y1

    var len = Math.max(Math.abs(dx), Math.abs(dy))
    var ex = dx / len
    var ey = dy / len

    // read the sentence
    var str1 = ""
    var str2 = ""
    for (var i = 0; i <= len; i++) {
        var x = x1 + i * ex
        var y = y1 + i * ey
        str1 = str1 + table[x][y]
        str2 = table[x][y] + str2
    }

    // check if the sentence is contained in the target list
    for (var i = 0; i < targetList.length; i++) {
        var name = targetList[i].name;
        if (name == str1 || name == str2) {
            return true
        }
    }
    return false
}

// ---- Initialization ---- 
var hiraganaList = [
    "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ",
    "た", "ち", "つ", "て", "と", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "ん",
    "ず", "ぞ", "づ", "で", "ど", "ば", "べ", "っ", "ゃ", "ょ", "ゅ",
]

function randomHiragana() {
    var index = Math.round(Math.random() * (hiraganaList.length - 1))
    return hiraganaList[index]
}

function createTable() {
    for (var i = 0; i < tbSize; i++) {
        var row = []
        for (var j = 0; j < tbSize; j++) {
            row.push(null)
        }
        table.push(row)
    }
}

function chooseTargets(targetNum) {
    for (let i = 0; i < targetNum && jinmei.length > 0; i++) {
        var index = Math.round(Math.random() * (jinmei.length - 1))
        var target = jinmei.splice(index, 1)
        targetList.push(target[0])
    }
}

function randomDir() {
    var dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, -1], [-1, 1]]
    var index = Math.round(Math.random() * (dirs.length - 1))
    return dirs[index]
}

function locateName(name, nth, x, y, dir) {
    if (nth >= name.length) return false

    var dx = dir[0]
    var dy = dir[1]

    var startx = x - nth * dx
    var starty = y - nth * dy

    var endx = startx + (name.length - 1) * dx
    var endy = starty + (name.length - 1) * dy

    // check the range
    if (!isInTable(startx, starty) || !isInTable(endx, endy)) return false

    // check in advance
    for (var i = 0; i < name.length; i++) {
        var curx = startx + i * dx
        var cury = starty + i * dy
        if (table[curx][cury] && table[curx][cury] != name[i])
            return false
    }

    // fill a name in the table
    for (var i = 0; i < name.length; i++) {
        var curx = startx + i * dx
        var cury = starty + i * dy
        table[curx][cury] = name[i]
        char2XY[name[i]] = [curx, cury]
    }
    return true
}

function locateNames() {
    for (var i = 0; i < targetList.length; i++) {
        target:
        while (true) {
            var name = targetList[i].name
            var nth = Math.round(Math.random() * (targetList.length - 1))

            var tx = Math.round(Math.random() * (tbSize - 1))
            var ty = Math.round(Math.random() * (tbSize - 1))
            var dirTrial = 1

            if (char2XY[name[nth]]) {
                var p = char2XY[name[nth]]
                tx = p[0]
                ty = p[1]
                dirTrial = 40
            }

            for (var cnt = 0; cnt < dirTrial; cnt++) {
                var dir = randomDir()
                var done = locateName(name, nth, tx, ty, dir)
                if (done) break target
            }
        }
    }
}

function fillRandomly() {
    for (var i = 0; i < tbSize; i++) {
        for (var j = 0; j < tbSize; j++) {
            if (!table[i][j]) {
                //table[i][j] = randomHiragana()
                table[i][j] = "."
                // TODO: Check no new jinmei is created.
            }
        }
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
    var targetNum = 10
    createTable()
    chooseTargets(targetNum)
    locateNames()
    fillRandomly()
    showTable()
}
init()

// ---- Event Handlers ----
$(".cell").on("click", function () {
    var x = dom2Cell(this)[0]
    var y = dom2Cell(this)[1]

    if (!markedCell) {
        // create targetCell
        markedCell = [x, y]
        setCellColorByXY(x, y, "yellow")
        return
    }
    if (markedCell[0] == x && markedCell[1] == y) {
        // toggle targetCell
        setCellColorByXY(markedCell[0], markedCell[1], "transparent")
        markedCell = null
        return
    }
    if (checkName(markedCell[0], markedCell[1], x, y)) {
        // if valid name
        drawLine(markedCell[0], markedCell[1], x, y)
        markedCell = null
        clearTableColor()
    } else {
        // replace targetCell
        clearTableColor()
        markedCell = [x, y]
        setCellColorByXY(x, y, "yellow")
    }
})

$(".cell").mouseover(function () {
    clearTableColor()
    setCellColorByDom(this, "yellow")
    if (markedCell) {
        setCellColorByXY(markedCell[0], markedCell[1], "yellow")

        var x = dom2Cell(this)[0]
        var y = dom2Cell(this)[1]
        highlightLine(markedCell[0], markedCell[1], x, y)
    }
})

$(".cell").mouseleave(function () {
    clearTableColor()
})