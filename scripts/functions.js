let tabs = {};
let currentTab = "";
let currentMode = "text";
let textEditor = document.getElementById('editor-module--text');
let cssEditor = document.getElementById('editor-module--css');
let jsEditor = document.getElementById('editor-module--javascript');
let editor = document.getElementById('editor');
let output = document.getElementById('output');

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
            </div>
        `
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
                textEditor.value = splitText(tabs[tab][1])[0];
                cssEditor.value = splitText(tabs[tab][1])[1];
                jsEditor.value = splitText(tabs[tab][1])[2];
                updateOutput();
            }
            makeTab(tab, tabs[tab][0], tabType)
        }
    }
}

function splitText(fileText) {
    let splitHTML = fileText.split("<head>")[1].split("<style>")[1].split("</style>");
    let cssContent = splitHTML[0];
    splitHTML = splitHTML[1].split("</head>")[1].split("<body>")[1].split("<script>");
    let htmlContent = splitHTML[0];
    splitHTML = splitHTML[1].split("</script>")
    let jsContent = splitHTML[0];

    return [htmlContent, cssContent, jsContent]
}

function combineText() {
    let combinedHTML = `
    <head>
        <style>${cssEditor.value}</style>
    </head>
    <body>${textEditor.value}<script>${jsEditor.value}</script></body>
    `
    return combinedHTML;
}

function resetEditors() {
    textEditor.value = "";
    cssEditor.value = "";
    jsEditor.value = "";
    updateOutput();
}

function updateOutput() {
    let fullHTML = `
    <style>
        ${cssEditor.value}
    </style>
        ${textEditor.value}
    <script>
        ${jsEditor.value}
    </script>
    `
    let outputWindow = document.getElementById('output-frame').contentWindow.document;
    outputWindow.open();
    outputWindow.write(fullHTML);
    outputWindow.close();
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
    })
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
        let fontWeights = [["300", "Light"],["400", "Regular"],["500", "Medium"],["700", "Bold"],["900", "Black"]]
        
        menuContent = `
        <h1>Preferences</h1><button class="close-menu" onclick="menuClose()">X</button>
        <h3>Font Library</h3>
        <div class="menu-list">
            <ul id="menu-list--fontfam" class="menu-list--ul">
            </ul>
        </div>
        <h3>Font Weight</h3>
        <div class="menu-list" id="font-weights">
            <ul id="menu-list--fontweight" class="menu-list--ul">
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
        for (let weight of fontWeights) {
            let liClass = "menu-list--li";
            if (textEditor.style.fontWeight == weight[0]) {
                liClass = "menu-list--li-selected";
            }
            let fontLI = `
                <li class="${liClass}" id="${weight[0]}" onclick="menuLISelect(this)">
                    <button style="font-weight:${weight[0]};">${weight[1]} (${weight[0]})</button>
                </li>
            `
            document.getElementById('menu-list--fontweight').insertAdjacentHTML('beforeend', fontLI)
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