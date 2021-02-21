let tabs = {};
let currentTab = "";
let currentMode = "text";
/* editors */
let textEditor = document.getElementById('editor-module--text');
let cssEditor = document.getElementById('editor-module--css');
let jsEditor = document.getElementById('editor-module--javascript');
let editor = document.getElementById('editor');
let output = document.getElementById('output');
/* settings */
let tabsEnabled = true;
let lineNumsEnabled = true;

function tab(option, params) {
    let tabsDiv = document.getElementById('tabs');
    if (option === "addTab") {
        if (9 >= Object.keys(tabs).length) {
            let tabKey = params[0];
            let tabContent = params[2];
            let tabType = params[3];
            if (!tabType) {
                tabType = 'txt';
            }
            let tabName = params[1];
            if (!tabName.endsWith(`.${tabType}`)) {
                tabName = checkTabs(tabName, tabType);
            } else {
                tabName = checkTabs(tabName.split(`.${tabType}`)[0], tabType);
            }
            
            if (!tabContent) {
                tabContent = '<head><style></style></head><body><script></script></body>';
            } else if (tabType === 'txt') {
                tabContent = `<head><style></style></head><body>${tabContent}<script></script></body>`
            }
            tabs[params[0]] = [tabName, tabContent, tabType];
            return tab('selectTab', tabKey);
        }
    } else if (option === "removeTab") {
        if ((textEditor.value.length + cssEditor.value.length + jsEditor.value.length) > 1) {
            if (!confirm(`Are you sure you want to close ${tabs[params][0]}?`)) {
                return;
            }
        }
        delete tabs[params];
        resetEditors();
    } else if (option === "selectTab") {
        if (!currentTab || !tabs[currentTab]) {
            currentTab = params;
            return updateTabs(params);
        }
        if (currentTab !== params && tabs[currentTab]) {
            tabs[currentTab][1] = combineText();
            currentTab = params;
            updateTabs(params);
        } else {
            return;
        }
    }
    updateTabs(currentTab);
    function checkTabs(oldTab, tabType) {
        let tabNames = [];
        let newTab = oldTab + `.${tabType}`;
        for (let tab in tabs) {
            tabNames.push(tabs[tab][0])
        }
        var i;
        for (i = 0; tabNames.length > i; i++) {
            if (tabNames[i] === newTab) {
                newTab = `${oldTab}(${i + 1}).${tabType}`
            }
        }
        return newTab;
    }

    function makeTab(tabKey, tabName, tabType) {
        let tabTemplate = `
            <div class="${tabType}" id="tab-${tabKey}" onclick="tab('selectTab', this.id.replace('tab-', ''))">
                <textarea class="tab-content" id="tab--${tabKey}" spellcheck="false"></textarea>
                <button class="tab-content" id="tab-btn--${tabKey}" onclick="tab('removeTab', this.id.replace('tab-btn--', ''))"><i class="fa fa-close"></i></button>
            </div>`
        tabsDiv.insertAdjacentHTML('beforeend', tabTemplate);
        document.getElementById(`tab--${tabKey}`).value = tabName;
        document.getElementById(`tab--${tabKey}`).addEventListener('change', function(e) {
            if (e.target.value.endsWith("txt")) {
                tabs[e.target.id.replace("tab--", "")][2] = "txt";
            } else if (e.target.value.endsWith("html")) {
                tabs[e.target.id.replace("tab--", "")][2] = "html";
            } else {
                tabs[e.target.id.replace("tab--", "")][2] = "txt";
            }
            tabs[e.target.id.replace("tab--", "")][0] = e.target.value;
        })
        return;
    }

    function updateTabs(selected) {
        tabsDiv.innerHTML = "";
        for (let tab in tabs) {
            let tabType = "tab";
            if (selected === tab) {
                tabType = "tab-selected";
                textEditor.value = tabs[tab][1][1];
                cssEditor.value = tabs[tab][1][0];
                jsEditor.value = tabs[tab][1][2];
                updateOutput();
            }
            makeTab(tab, tabs[tab][0], tabType)
        }
    }
}

function combineText() {
    let combinedHTML = [cssEditor.value, textEditor.value, jsEditor.value];
    return combinedHTML;
}

function resetEditors() {
    textEditor.value = "";
    cssEditor.value = "";
    jsEditor.value = "";
    updateOutput();
}

function updateOutput() {
    if (editorsOpen.includes("html")) {
        let style = "";
        let script = "";
        if (cssEditor.value) {
            style = 
`<style>
${cssEditor.value}
</style>`
    }

    if (jsEditor.value) {
        script = 
`<script>
${jsEditor.value}
</script>`
    }

    let fullHTML = 
`<head>
${style}
</head>
<body>
    ${textEditor.value}
${script}
</body>`
        let outputWindow = document.getElementById('output-frame').contentWindow.document;
        outputWindow.open();
        outputWindow.write(fullHTML);
        outputWindow.close();
    }
}

function footer(textarea) {
    var textLines = textarea.value.substr(0, textarea.selectionStart).split("\n");
    var currentLineNumber = textLines.length;
    var currentColumnIndex = textLines[textLines.length-1].length;
    document.getElementById('footer--lncol').innerText = "Ln " + currentLineNumber+", Col " + currentColumnIndex;
    document.getElementById('footer--lang').innerText = textarea.id.replace("editor-module--", "").toUpperCase();
}

function addListeners() {
    for (let module of document.getElementsByClassName('editor-module')) {
        lineNum(module);
        module.addEventListener('keydown', function(e) {
            if (e.key == 'Tab') {
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;

                this.value = this.value.substring(0, start) +
                "\t" + this.value.substring(end);
    
                this.selectionStart = 
                this.selectionEnd = start + 1;
            }
          })
        module.addEventListener('keyup', function(e) {
            footer(e.target);
            updateOutput();
        });
        module.addEventListener('click', function(e) {
            footer(e.target);
            lineNum(e.target);
        });
        module.addEventListener('input', function(e) {
            lineNum(e.target);
        });
        module.addEventListener('scroll', function(e) {
            document.getElementById(e.target.id.replace('editor-module', 'line-row')).scrollTop = e.target.scrollTop;
        });
    }
    document.getElementById('file-upload').addEventListener('change', function(e) {
        fileOpen(e.target.files[0]);
    });
    document.getElementById('menu-bar--tabs').addEventListener('mouseover', function(e) {
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
    });
    
}

function makeKey(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function createMenu(menuType) {
    let menuContent = `err loading menu`;
    if (menuType === "theme") {
        menuContent = `
        <h1>Theme</h1><button class="close-menu" onclick="menuClose()">X</button>
        <h3>Theme Library</h3>
        <div class="menu-list">
            <ul id="menu-list--theme-light" class="menu-list--ul">
            </ul>
        </div>
        <div class="menu-list">
            <ul id="menu-list--theme-dark" class="menu-list--ul">
            </ul>
        </div>
        <button id="apply-changes--theme" class="apply-changes" onclick="menuClose(this)">Apply Changes</button>
        `
        document.getElementById('menu-content').innerHTML = menuContent;

        for (theme in themes) {
            let liClass = "menu-list--li";
            if (document.body.classList[0] === theme) {
                liClass = "menu-list--li-selected";
            }
            themeLI = `
                <li class="${liClass}" id="${theme}" onclick="menuLISelect(this)">
                    <button>${theme.replaceAll("-", " ")}</button><div class="theme-preview" id="theme-preview--${theme}"> </div>
                </li>
            `
            document.getElementById(`menu-list--theme-${themes[theme][1]}`).insertAdjacentHTML('beforeend', themeLI);
            for (let color of themes[theme][0]) {
                let colorHTML = `
                    <button class="theme-preview--color" style="background-color:${color};}"><span style="color:${invertColor(color)}">${color.toUpperCase()}</span></button>
                `
                document.getElementById(`theme-preview--${theme}`).insertAdjacentHTML('beforeend', colorHTML)
            }
        }
    } else if (menuType === "preferences") {
        let lineNumsChecked = "checked";
        let tabsChecked = "checked";
        if (!lineNumsEnabled) {
            lineNumsChecked = "";
        }
        if (!tabsEnabled) {
            tabsChecked = "";
        }
        menuContent = `
        <h1>Preferences</h1><button class="close-menu" onclick="menuClose()">X</button>
        <h2>Display</h2>
        <div class="checkbox">
            <h4>Show line numbers</h4>
            <input id="show-linenums" type="checkbox" ${lineNumsChecked}>
        </div>
        <div class="checkbox">
            <h4>Show tabs</h4>
            <input id="show-tabs" type="checkbox" ${tabsChecked}>
        </div>
        <h2>Font</h2>
        <h3>Font Library</h3>
        <div class="menu-list">
            <ul id="menu-list--fontfam" class="menu-list--ul">
            </ul>
        </div>
        <h3>Font Weight</h3>
        <div class="menu-list" id="font-weights">
            <ul id="menu-list--fontweight" class="menu-list--ul">
                <li class="menu-list--li" id="300" onclick="menuLISelect(this)">
                    <button style="font-weight:300;">Light (300)</button>
                </li>
                <li class="menu-list--li-selected" id="400" onclick="menuLISelect(this)">
                    <button style="font-weight:400;">Regular (400)</button>
                </li>
                <li class="menu-list--li" id="500" onclick="menuLISelect(this)">
                    <button style="font-weight:500;">Medium (500)</button>
                </li>
                <li class="menu-list--li" id="700" onclick="menuLISelect(this)">
                    <button style="font-weight:700;">Bold (700)</button>
                </li>
                <li class="menu-list--li" id="900" onclick="menuLISelect(this)">
                    <button style="font-weight:900;">Black (900)</button>
                </li>
            </ul>
        </div>
        <button id="apply-changes--preferences" class="apply-changes" onclick="menuClose(this)">Apply Changes</button>
        `
        document.getElementById('menu-content').innerHTML = menuContent;

        for (let font in fonts) {
            let liClass = "menu-list--li";
            if (textEditor.style.fontFamily.replaceAll("\"", "\'") == fonts[font]) {
                liClass = "menu-list--li-selected";
            }
            let fontLI = `
                <li class="${liClass}" id="${font}" onclick="menuLISelect(this)">
                    <button>${font}</button><p class="font-preview" style="font-family:${fonts[font]};">The quick brown fox jumps over the lazy dog.</p>
                </li>
            `
            document.getElementById('menu-list--fontfam').insertAdjacentHTML('beforeend', fontLI)
        }
    } else if (menuType === "save") {
        if (currentTab && textEditor.value.length + cssEditor.value.length + jsEditor.value.length) {
            menuContent = `
            <h1>Save File</h1><button class="close-menu" onclick="menuClose()">X</button>
            <div class="file-save">
                <div class="file-preview">
                    <textarea id="file-preview--content" disabled>${textEditor.value}</textarea>
                </div>
                <div class="file-info">
                    <p id="file-title">${tabs[currentTab][0]} (${textEditor.value.length} bytes)</p>
                    <select name="filetypes" id="file-type--select" class="menu-select">
                        <option value="txt">Plain Text (.txt)</option>
                        <option value="html">HTML (.html)</option>
                        <option value="css">CSS (.css)</option>
                        <option value="js">JavaScript (.js)</option>
                    </select>
                </div>
            </div>
            <button id="apply-changes--save" class="apply-changes" onclick="menuClose(this); fileSave(document.getElementById('file-type--select').value)">Export</button>
            `
            document.getElementById('menu-content').innerHTML = menuContent;
            document.getElementById('file-type--select').addEventListener('change', function(e) {
                let fileType = e.target.value;
                let fileName = tabs[currentTab][0].split(tabs[currentTab][2])[0];
                let filePreview = document.getElementById('file-preview--content');
                let fileTitle = document.getElementById('file-title');

                if (fileType === "txt") {
                    filePreview.value = textEditor.value;
                    fileTitle.innerText = `${fileName + fileType} (${textEditor.value.length} bytes)`;
                } else if (fileType === "html") {
                    let htmlFile = 
`<!DOCTYPE html>
<html>
${document.getElementById('output-frame').contentWindow.document.getElementsByTagName('HTML')[0].innerHTML}
</html>`;
                    filePreview.value = htmlFile;
                    fileTitle.innerText = `${fileName + fileType} (${htmlFile.length} bytes)`;
                } else if (fileType === "css") {
                    filePreview.value = cssEditor.value;
                    fileTitle.innerText = `${fileName + fileType} (${cssEditor.value.length} bytes)`;
                } else if (fileType === "js") {
                    filePreview.value = jsEditor.value;
                    fileTitle.innerText = `${fileName + fileType} (${jsEditor.value.length} bytes)`;
                }
            });
        } else {
            return;
        }
    }
    document.getElementById('menu').style.display = "block";
}

function menuLISelect(li) {
    if (li.classList[0] === "menu-list--li-selected") {
        li.classList = "menu-list--li";
    } else if (li.classList[0] === "menu-list--li") {
        if (document.getElementsByClassName('menu-list--li-selected')[0]) {
            for (listItem of document.getElementsByClassName('menu-list--li-selected')) {
                if (listItem.parentElement === li.parentElement || li.parentElement.id.startsWith("menu-list--theme-")) {
                    listItem.classList = "menu-list--li"
                }
            }
        }
        li.classList = "menu-list--li-selected";
    }
}

function menuClose(params) {
    if (params) {
        let option = params.id.split("apply-changes--")[1];
        let selected = document.getElementsByClassName('menu-list--li-selected');
        if (option === "theme") {
            if (selected) {
                style([null, selected[0].id]);
            }
        } else if (option === "preferences") {
            if (document.getElementById('show-linenums').checked) {
                lineNumsEnabled = true;
                for (let lineRow of document.getElementsByClassName('line-row')) {
                    if (document.getElementById(`editor-module--${lineRow.id.split("line-row--")[1]}`).classList[0] === "editor-module--active") {
                        lineRow.style.display = "block";
                    }
                }
            } else {
                lineNumsEnabled = false;
                for (let lineRow of document.getElementsByClassName('line-row')) {
                    lineRow.style.display = "none";
                }
            }
            if (document.getElementById('show-tabs').checked) {
                tabsEnabled = true;
                document.getElementById('tabs').style.display = "flex";
                document.getElementById('menu-bar--tabs').style.display = "none";
            } else {
                tabsEnabled = false;
                document.getElementById('tabs').style.display = "none";
                document.getElementById('menu-bar--tabs').style.display = "block";
            }
            if (selected) {
                let font = [];
                if (selected.length === 2) {
                    font = [selected[0].id, selected[1].id];
                } else {
                    if (fonts[selected[0].id]) {
                        font = [selected[0].id, null];
                    } else {
                        font = [null, selected[0].id];
                    }
                }
                style([font, null]);
            }
        }
    }
    document.getElementById('menu').style.display = "none";
}

function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function lineNum(textarea) {
    var textLines = textarea.value.split('\n');
    var lineRow = document.getElementById(textarea.id.replace('editor-module--', 'line-row--'));

    var i;
    var str = '';
    for (i = 1; i <= textLines.length; i++) {
        str = str + i.toString() + '\n';
    }
    lineRow.value = str;
}