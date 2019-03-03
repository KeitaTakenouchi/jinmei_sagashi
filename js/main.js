var tbSize = 18;
var table = [];

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
            tbHtml += "<td class=\"cell\" id=cell_" + i + "_" + j + ">"
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

