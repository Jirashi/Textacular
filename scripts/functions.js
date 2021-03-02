// IMPORTANT TABLES
// ===================
const tabs = {};
const config = {};
const editorsOpen = [];

// VARIABLES
// ===================
let tabBar = document.getElementById('tabs');
let currentTab = "";
let currentMode = "text";
let textEditor = document.getElementById('text-editor');
let editor = document.getElementById('editor');
let output = document.getElementById('output');

// TAB FUNCTIONS
// =============
function addTab(name, type, content) {
    if (9 >= Object.keys(tabs).length) {
        // Generate a unique key for the tab
        let key = makeKey(6)
        if (!name.endsWith(`.${type}`)) {
            name = checkTabs(name, type);
        } else {
            name = checkTabs(name.split(`.${type}`)[0], type);
        }
        tabs[key] = [name, content || "", type];
        loadTab(key);
        return loadTabs();
    }

    function checkTabs(name, type) {
        let names = [];
        let newTab = name + `.${type}`;
        for (let tab in tabs) {
            names.push(tabs[tab][0])
        }
        var i;
        for (i = 0; names.length > i; i++) {
            if (names[i] === newTab) {
                newTab = `${name}(${i + 1}).${type}`
            }
        }
        return newTab;
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
}

function removeTab(key) {
    if (textEditor.value.length > 0) {
        if (!confirm(`Are you sure you want to close ${tabs[key][0]}?`)) {
            return;
        }
        textEditor.value = "";
    }
    delete tabs[key];
    loadTabs();
    View("txt");
    if (Object.keys(tabs).length === 0) {
        let menuContent = `
        <div id="main-menu">
            <h1>Textacular v3</h1><button class="close-menu" onclick="menuClose()">X</button>
            <button onclick="newFile(); menuClose();">New file</button><br>
            <button onclick="openFile(); menuClose();">Open file</button><br>
            <hr>
            <div class="new-file-types">
                <button onclick="newFile('txt'); menuClose();">.txt</button>
                <button onclick="newFile('html'); menuClose();">.html</button>
                <button onclick="newFile('css'); menuClose();">.css</button>
                <button onclick="newFile('js'); menuClose();">.js</button>
            </div>

            <span><a href="https://github.com/Jirashi/Textacular">Textacular</a> | Version 3.1 | Jirashi™ 2020</span>
        </div>
        `
        document.getElementById('menu-content').innerHTML = menuContent;
        document.getElementById('menu').style.display = "block";
    }
}

function loadTab(key) {
    if (tabs[key]) {
        if (!currentTab || !tabs[currentTab]) {
            currentTab = key;
            textEditor.value = tabs[key][1];
            View(tabs[key][2]);
        } else if (key != currentTab && tabs[currentTab]) {
            tabs[currentTab][1] = textEditor.value;
            currentTab = key;
            textEditor.value = tabs[key][1];
            View(tabs[key][2]);
        } else { return; }
        loadTabs();
        lineNum();
        if (tabs[currentTab][2] === "html") { updateOutput(); View('html'); }
    }
}

function loadTabs() {
    tabBar.innerHTML = "";
    for (let tab in tabs) {
        if (tab === currentTab) {
            makeTab(tab, tabs[tab][0], "tab-selected")
        } else {
            makeTab(tab, tabs[tab][0])
        }
    }

    function makeTab(key, name, selected) {
        let tabTemplate = 
        `<div class="${selected || "tab"}" id="tab-${key}" onclick="loadTab(this.id.replace('tab-', ''))">
            <textarea class="tab-content" id="tab--textarea-${key}" spellcheck="false" rows="1"></textarea>
            <button class="tab-content" id="tab--btn-${key}" onclick="removeTab(this.id.replace('tab--btn-', ''))"><i class="fa fa-close"></i></button>
        </div>`
        tabBar.insertAdjacentHTML('beforeend', tabTemplate);
        document.getElementById(`tab--textarea-${key}`).value = name;
        document.getElementById(`tab--textarea-${key}`).addEventListener('change', function(e) {
            let types = ["txt", "html", "css", "js"];
            let tab = e.target;
            let tabKey = tab.id.replace("tab--textarea-", "");
            for (let type of types) {
                if (tab.value.endsWith(type)) {
                    tabs[tabKey][2] = type;
                    tabs[tabKey][0] = tab.value;
                    View(type);
                    return;
                }
            }
            tabs[tabKey][2] = "txt";
            tabs[tabKey][0] = tab.value + ".txt";
            tab.value = tabs[tabKey][0];
            View("txt");
        })
        return;
    }
}

// STYLE FUNCTIONS
// ===============
function loadTheme(name, colors) {
    // Fetching theme file
    fetch(new Request("./config/theme.json")).then(response => response.json()).then(function(data) {
        const style = data;
        let theme = [];
        // sorting through each element in the theme file
        for (let elmnt in style) {
            let elmntRules = style[elmnt];
            let elmntStyle = [];
            // sorting through each rule for the element
            for (let rule in elmntRules) {
                if (rule.startsWith("border")) {
                    elmntStyle.push(rule + " " + colors[elmntRules[rule]])
                } else {
                    elmntStyle.push(rule + ": " + colors[elmntRules[rule]])
                }
            }
            theme.push(elmnt + " " + JSON.stringify(elmntStyle).replaceAll("\"", "").replaceAll(",", "; ").replaceAll("[", "{").replaceAll("]", "}"));
        }
        for (let elmnt of theme) {
            document.getElementById('style').insertAdjacentHTML('beforeend', elmnt);
        }
    });
    document.body.classList = name;
}

function loadFont(fontFamily, fontWeight) {
    if (fontFamily) { textEditor.style.fontFamily = fontFamily; }
    if (fontWeight) { textEditor.style.fontWeight = fontWeight; }                
}

// MENU FUNCTIONS
// ==============
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
                loadTheme(selected[0].id, config["themeLibrary"][selected[0].id][0])
            }
        } else if (option === "preferences") {
            // Line number checked
            if (document.getElementById('show-linenums').checked) {
                config["lineNumsEnabled"] = true;
                document.getElementById('line-row').style.display = "block";
            } else {
                config["lineNumsEnabled"] = false;
                document.getElementById('line-row').style.display = "none";
            }

            // Tabs checked
            if (document.getElementById('show-tabs').checked) {
                config["tabsEnabled"] = true;
                document.getElementById('tabs').style.display = "flex";
                document.getElementById('toolbar--tabs').style.display = "none";
            } else {
                config["tabsEnabled"] = false;
                document.getElementById('tabs').style.display = "none";
                document.getElementById('toolbar--tabs').style.display = "block";
            }

            // Font
            if (selected) {
                let font = [];
                if (selected.length === 2) {
                    font = [config["fontLibrary"][selected[0].id], selected[1].id];
                } else {
                    if (config["fontLibrary"][selected[0].id]) {
                        font = [config["fontLibrary"][selected[0].id], null];
                    } else {
                        font = [null, selected[0].id];
                    }
                }
                loadFont(font[0], font[1]);
            }
        } else if (option === "save") {
            tabs[currentTab][0] = tabs[currentTab][0].replace(`.${tabs[currentTab][2]}`, `.${document.getElementById('file-type--select').value}`);
            tabs[currentTab][2] = document.getElementById('file-type--select').value;
            saveFile();
            menuClose();
        }
    }
    document.getElementById('menu').style.display = "none";
}

// OTHER FUNCTIONS
// ===============
function footer(textarea) {
    var textLines = textarea.value.substr(0, textarea.selectionStart).split("\n");
    var currentLineNumber = textLines.length;
    var currentColumnIndex = textLines[textLines.length-1].length;
    document.getElementById('footer--lncol').innerText = "Ln " + currentLineNumber+", Col " + currentColumnIndex;
    document.getElementById('footer--lang').innerText = currentMode.toUpperCase();
}

function lineNum() {
    var i;
    var str = '';
    for (i = 1; i <= textEditor.value.split('\n').length; i++) {
        str = str + i.toString() + '\n';
    }
    document.getElementById('line-row').value = str;
}

function updateOutput() {
    let idoc = document.getElementById('output-frame').contentWindow.document;
    idoc.open();
    idoc.write(textEditor.value);
    idoc.close();
}
