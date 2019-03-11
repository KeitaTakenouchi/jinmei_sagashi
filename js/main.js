var tbSize = 12
var lineWidth = 2
var targetNum = 10
var timeoutSeconds = 100

var table = []
var char2XY = {}

var markedCell = null
var targetList = []
var isCountDown = true

// ---- Utility Functions ----
function cellIdStr(x, y) {
    return "cell_" + x + "_" + y
}

function dom2Cell(dom) {
    var cellStr = $(dom).attr("id")
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
    } while (x < tbSize && y < tbSize) // just in case
}

function lineCss(degree, width) {
    return function (color) {
        return "linear-gradient(" + degree + "deg, "
            + "transparent " + (50 - width) + "%,"
            + color + " " + (50 - width) + "%,"
            + color + " " + (50 + width) + "%,"
            + "transparent " + (50 + width) + "%)"
    }
}

function cornerCss(degree, width) {
    return function (color) {
        return "linear-gradient(" + degree + "deg, "
            + color + " " + width + "%,"
            + "transparent " + width + "%) "
    }
}

var hLine = lineCss(0, lineWidth * 1.4)
var vLine = lineCss(90, lineWidth * 1.4)
var rtLine = lineCss(45, lineWidth)
var ltLine = lineCss(-45, lineWidth)
var rtCorner = cornerCss(-135, lineWidth)
var ltCorner = cornerCss(135, lineWidth)
var rbCorner = cornerCss(-45, lineWidth)
var lbCorner = cornerCss(45, lineWidth)

function drawLineInCell(color, x, y, dir) {
    var dx = dir[0]
    var dy = dir[1]
    var prev = $("#" + cellIdStr(x, y)).css("background-image") + ","
    if (dx == 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + hLine(color))
    } else if (dy == 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + vLine(color))
    } else if (dx > 0 && dy > 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + rtLine(color))

        // Display corners to fill a gap bettween two lines.
        prev = $("#" + cellIdStr(x - 1, y)).css("background-image") + ","
        $("#" + cellIdStr(x - 1, y)).css("background-image", prev + lbCorner(color))
        prev = $("#" + cellIdStr(x, y - 1)).css("background-image") + ","
        $("#" + cellIdStr(x, y - 1)).css("background-image", prev + rtCorner(color))
    } else if (dx > 0 && dy < 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + ltLine(color))

        prev = $("#" + cellIdStr(x - 1, y)).css("background-image") + ","
        $("#" + cellIdStr(x - 1, y)).css("background-image", prev + rbCorner(color))
        prev = $("#" + cellIdStr(x, y + 1)).css("background-image") + ","
        $("#" + cellIdStr(x, y + 1)).css("background-image", prev + ltCorner(color))
    } else if (dx < 0 && dy > 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + ltLine(color))

        prev = $("#" + cellIdStr(x + 1, y)).css("background-image") + ","
        $("#" + cellIdStr(x + 1, y)).css("background-image", prev + ltCorner(color))
        prev = $("#" + cellIdStr(x, y - 1)).css("background-image") + ","
        $("#" + cellIdStr(x, y - 1)).css("background-image", prev + rbCorner(color))
    } else if (dx < 0 && dy < 0) {
        $("#" + cellIdStr(x, y)).css("background-image", prev + rtLine(color))

        prev = $("#" + cellIdStr(x + 1, y)).css("background-image") + ","
        $("#" + cellIdStr(x + 1, y)).css("background-image", prev + rtCorner(color))
        prev = $("#" + cellIdStr(x, y + 1)).css("background-image") + ","
        $("#" + cellIdStr(x, y + 1)).css("background-image", prev + lbCorner(color))
    }
}

function drawLine(color, x1, y1, x2, y2) {
    var dir = checkLine(x1, y1, x2, y2)
    if (!dir) return
    var dx = dir[0]
    var dy = dir[1]
    var x = x1
    var y = y1
    drawLineInCell(color, x, y, dir)
    do {
        x += dx
        y += dy
        drawLineInCell(color, x, y, dir)
        if (x == x2 && y == y2) {
            break
        }
    } while (x < tbSize && y < tbSize) // just in case
}

function checkName(x1, y1, x2, y2) {
    if (!checkLine(x1, y1, x2, y2)) return null

    var foundIndex = -1
    for (var i = 0; i < targetList.length; i++) {
        var ts = targetList[i].start
        var te = targetList[i].end
        if (ts[0] == x1 && ts[1] == y1 && te[0] == x2 && te[1] == y2 ||
            ts[0] == x2 && ts[1] == y2 && te[0] == x1 && te[1] == y1) {
            foundIndex = i
            break
        }
    }
    if (foundIndex >= 0) {
        var foundInfo = targetList.splice(foundIndex, 1)[0]
        return foundInfo
    }
    return null
}

function showAnswerLines() {
    for (var i = 0; i < targetList.length; i++) {
        var t = targetList[i]
        drawLine("green", t.start[0], t.start[1], t.end[0], t.end[1])
    }
    targetList = []
}

function showPopup(foundInfo) {
    isCountDown = false
    $("#table_div").addClass("inActive")
    $("#popup").fadeIn(200)
    $("#message").html("<p>" + foundInfo.message + "生まれです．<br>改行テスト</p>"
        + "<p align=\"right\">" + foundInfo.display_name + "<br>&nbsp;</p>")
}

function closePopup() {
    isCountDown = true
    $("#table_div").removeClass("inActive")
    $("#popup").fadeOut(0)
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

function initTable() {
    table = []
    for (var i = 0; i < tbSize; i++) {
        var row = []
        for (var j = 0; j < tbSize; j++) {
            row.push(null)
        }
        table.push(row)
    }
}

function chooseTargets() {
    if (jinmei.length < targetNum) {
        targetNum = jinmei.length
    }
    for (var i = 0; i < targetNum; i++) {
        var index = Math.round(Math.random() * (jinmei.length - 1))
        var target = jinmei.splice(index, 1)
        targetList.push(target[0])
    }
}

function randomDir() {
    var dirs = [
        [0, 1],
        //[0, -1],
        [1, 0],
        //[-1, 0],
        [1, 1],
        [1, -1],
        //[-1, -1],
        //[-1, 1]
    ]
    var index = Math.round(Math.random() * (dirs.length - 1))
    return dirs[index]
}

function locateName(name, nth, x, y, dir) {
    if (nth >= name.length) return null

    var dx = dir[0]
    var dy = dir[1]

    var startx = x - nth * dx
    var starty = y - nth * dy

    var endx = startx + (name.length - 1) * dx
    var endy = starty + (name.length - 1) * dy

    // check the range
    if (!isInTable(startx, starty) || !isInTable(endx, endy)) return null

    // check in advance
    for (var i = 0; i < name.length; i++) {
        var curx = startx + i * dx
        var cury = starty + i * dy
        if (table[curx][cury] && table[curx][cury] != name[i])
            return null
    }

    // fill a name in the table
    for (var i = 0; i < name.length; i++) {
        var curx = startx + i * dx
        var cury = starty + i * dy
        table[curx][cury] = name[i]
        char2XY[name[i]] = [curx, cury]
    }
    return [[startx, starty], [endx, endy]]
}

function locateNames() {
    var nameTrialLim = 100
    var dirTrialLim = 10
    while (true) {
        initTable()
        targets:
        for (var i = 0; i < targetList.length; i++) {
            var name = targetList[i].name
            target:
            for (var j = 0; j < nameTrialLim; j++) {
                var nth = Math.round(Math.random() * (targetList.length - 1))

                var tx, ty, dirTrial
                if (char2XY[name[nth]]) {
                    var p = char2XY[name[nth]]
                    tx = p[0]
                    ty = p[1]
                    dirTrial = dirTrialLim
                } else {
                    tx = Math.round(Math.random() * (tbSize - 1))
                    ty = Math.round(Math.random() * (tbSize - 1))
                    dirTrial = 1
                }

                for (var dirTrialCnt = 0; dirTrialCnt < dirTrial; dirTrialCnt++) {
                    var dir = randomDir()
                    var result = locateName(name, nth, tx, ty, dir)
                    if (result) {
                        targetList[i].start = result[0]
                        targetList[i].end = result[1]
                        break target
                    }
                }

                // reset from the beginning if the name can't be embedded.
                if (j == nameTrialLim - 1) {
                    break targets
                }
            }
            if (i == targetList.length - 1) {
                return // success
            }
        }
    }
}

function fillRandomly() {
    for (var i = 0; i < tbSize; i++) {
        for (var j = 0; j < tbSize; j++) {
            if (!table[i][j]) {
                table[i][j] = randomHiragana()
                //table[i][j] = "."
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
    $("#tb").empty()
    $("#tb").append(tbHtml)
}

var interval

function timeOver() {
    showAnswerLines()
    clearInterval(interval)
}

function resetTimer() {
    var remainingTime = timeoutSeconds
    $("#timer").text(remainingTime)
    var decTime = function () {
        if (isCountDown) {
            remainingTime--
            $("#timer").text(remainingTime)
            if (remainingTime <= 0) {
                timeOver()
            }
        }
    }
    interval = setInterval(decTime, 1000)
}

function showRemaining() {
    var text = targetList.length
    $("#remaining").text(text)
}

function init() {
    chooseTargets()
    locateNames()
    fillRandomly()
    showTable()

    resetTimer()
    showRemaining()
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
    var foundInfo = checkName(markedCell[0], markedCell[1], x, y)
    if (foundInfo) {
        // if valid name
        drawLine("red", markedCell[0], markedCell[1], x, y)
        showRemaining()
        markedCell = null
        clearTableColor()
        showPopup(foundInfo)
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

$("#close_popup_btn").on("click", function () {
    closePopup()
})