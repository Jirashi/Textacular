// EVENTS
textEditor.addEventListener('keydown', function(e) {
    // Allows tab indentation
    if (e.key == 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;

        this.value = this.value.substring(0, start) +
        "\t" + this.value.substring(end);

        this.selectionStart = 
        this.selectionEnd = start + 1;
    }
});

textEditor.addEventListener('keyup', function(e) {
    footer(e.target);
    if (currentMode === "html") {
        updateOutput();
    }
});

textEditor.addEventListener('click', function(e) {
    footer(e.target);
    lineNum(e.target);
});

textEditor.addEventListener('input', function(e) {
    lineNum(e.target);
});

textEditor.addEventListener('scroll', function(e) {
    document.getElementById('line-row').scrollTop = textEditor.scrollTop;
});

document.getElementById('file-upload').addEventListener('change', function(e) {
    fileOpen(e.target.files[0]);
});

/* document.getElementById('menu-bar--tabs').addEventListener('mouseover', function(e) {
    if (e.target.classList[0] === "menu-bar--tool--btn" || e.target.classList[0] === "fa fa-caret-down") {
        let dropdown = document.getElementById('menu-bar--tabs').childNodes[3]
        if (!tabsEnabled || window.innerWidth < 700) {
            dropdown.innerHTML = "";
            for (let tab in tabs) {
                let tabClass = "tool-dropdown--btn";
                if (currentTab === tab) {
                    tabClass = "tool-dropdown--btn-highlighted";
                }
                let tabHTML = 
                `<button class="${tabClass}" id="tabs-${tab}--btn" onclick="tab('selectTab','${tab}')">
                    <i class="fa fa-file-text"></i> ${tabs[tab][0]}
                </button>
                `
                dropdown.insertAdjacentHTML('beforeend', tabHTML);
            }
        }
    }
}); */

// FUNCTIONS
function footer(textarea) {
    var textLines = textarea.value.substr(0, textarea.selectionStart).split("\n");
    var currentLineNumber = textLines.length;
    var currentColumnIndex = textLines[textLines.length-1].length;
    document.getElementById('footer--lncol').innerText = "Ln " + currentLineNumber+", Col " + currentColumnIndex;
    document.getElementById('footer--lang').innerText = currentMode.toUpperCase();
}

function lineNum(textarea) {
    var textLines = textarea.value.split('\n');
    var lineRow = document.getElementById('line-row');

    var i;
    var str = '';
    for (i = 1; i <= textLines.length; i++) {
        str = str + i.toString() + '\n';
    }
    lineRow.value = str;
}

function updateOutput() {
    let idoc = document.getElementById('output-frame').contentWindow.document;
    idoc.open();
    idoc.write(textEditor.value);
    idoc.close();
}