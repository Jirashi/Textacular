// FILE TOOLS
function newFile(type) {
    addTab(config["defaultFileName"], type);
}

function openFile(file) {
    if (file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
            // Some types are not the right format
            let fileType = file.type.split("/")[1];
            if (fileType === "plain") {
                fileType = "txt";
            } else if (fileType === "javascript") {
                fileType = "js";
            }
            addTab(file.name, fileType, e.target.result)
        };
    } else {
        return document.getElementById('file-upload').click();
    }
}

function saveFile() {
    if (currentTab && textEditor.value.length) {
        let file = new Blob([textEditor.value], {type: `text/${currentMode}`});
        let filename = tabs[currentTab][0];

        if (tabs[currentTab][2] === "html") {
            file = new Blob([new XMLSerializer().serializeToString(document.getElementById('output-frame').contentWindow.document)], {type: "text/html"});
        }
       
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
            url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        }
    }
}

function saveFileAs() {
    if (currentTab && textEditor.value.length) {
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
        <button id="apply-changes--save" class="apply-changes" onclick="menuClose(this);">Export</button>
        `
        document.getElementById('menu-content').innerHTML = menuContent;
        document.getElementById('file-type--select').addEventListener('change', function(e) {
            let fileType = e.target.value;
            let fileName = tabs[currentTab][0].split(tabs[currentTab][2])[0];
            let filePreview = document.getElementById('file-preview--content');
            let fileTitle = document.getElementById('file-title');

            
            if (fileType !== "html") {
                fileTitle.innerText = `${fileName + fileType} (${textEditor.value.length} bytes)`;
                filePreview.value = textEditor.value;
            } else {
                fileTitle.innerText = `${fileName + fileType} (${new XMLSerializer().serializeToString(document.getElementById('output-frame').contentWindow.document).length} bytes)`;
                updateOutput();
                filePreview.value = new XMLSerializer().serializeToString(document.getElementById('output-frame').contentWindow.document);
            }
            
        });
    } else {
        return;
    }
    document.getElementById('menu').style.display = "block";
}

function emailFile() {
    if (currentTab) {
        var email = prompt("Enter a valid E-Mail", "abc@example.com")
        if (email) {
            window.location.href = `
            mailto:${email}
            ?subject=${tabs[currentTab][0].split(`.${tabs[currentTab][2]}`)[0]}
            &body=${textEditor.value}`;
        }
    }
}

function openOutput() {
    // Creating htmlDoc string, converting to object url then opening in new window
    let htmlDoc = new XMLSerializer().serializeToString(document.getElementById('output-frame').contentWindow.document);
    let htmlFile = new Blob([ htmlDoc ], {type: "text/html"});
    const fileObjectURL = URL.createObjectURL(htmlFile);
    window.open(fileObjectURL);
}

// EDIT TOOLS
function Undo() { document.execCommand("undo"); }
function Redo() { document.execCommand("redo"); }
function Copy() { document.execCommand("copy"); }
function Cut() { document.execCommand("cut"); }

function Paste() {
    // Paste clipboard text where the cursor is
    navigator.clipboard.readText()
    .then(text => {
        if (currentTab && textEditor && text) {
            if (textEditor.selectionStart) {
                selectionIndex = textEditor.selectionStart;
            }
            var str = textEditor.value.substring(0, selectionIndex) + text + textEditor.value.substring(selectionIndex);
            textEditor.value = str;
            selectionIndex = selectionIndex + text.length;
        }
    })
    .catch(err => {
        return;
    });
}

function deleteAll() {
    if (currentTab && textEditor.value.length) {
        if (confirm(`Are you sure you want to delete all text in ${tabs[currentTab][0]}`)) {
            textEditor.value = "";
        }
    }
}

function selectAll() {
    if (currentTab && textEditor.value.length) {
        textEditor.select();
    }
}

// SETTINGS TOOLS
function Preferences() {
    let lineNumsChecked = "checked";
    let tabsChecked = "checked";
    if (!config["lineNumsEnabled"]) {
        lineNumsChecked = "";
    }
    if (!config["tabsEnabled"]) {
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

    let fonts = config["fontLibrary"];
    for (let font in fonts) {
        let liClass = "menu-list--li";
        
        if (textEditor.style.fontFamily == fonts[font]) {
            liClass = "menu-list--li-selected";
        }
        let fontLI = `
            <li class="${liClass}" id="${font}" onclick="menuLISelect(this)">
                <button>${font}</button><p class="font-preview" style="font-family:${fonts[font]};">The quick brown fox jumps over the lazy dog.</p>
            </li>
        `
        document.getElementById('menu-list--fontfam').insertAdjacentHTML('beforeend', fontLI)
    }
    document.getElementById('menu').style.display = "block";
}

function Zoom(value) {
    let fontSize = getFontSize();
    textEditor.style.fontSize = fontSize + "px";
    textEditor.style.lineHeight = (fontSize + 4) + "px";

    let lineNumRow = document.getElementById(('line-row'));
    lineNumRow.style.fontSize = fontSize + "px";
    lineNumRow.style.lineHeight = (fontSize + 4) + "px";
    lineNumRow.style.paddingTop = (fontSize + 4) / 9.5 + "px";

    document.getElementById('footer--fontsize').innerText = textEditor.style.fontSize;

    function getFontSize() {
        let fontSize = parseInt(textEditor.style.fontSize.split("px")[0]);
        if (value === "in") {
            if (30 >= fontSize) {
            return fontSize + 2;
            } else {
                return 18;
            }
        } else if (value === "out") {
            if (fontSize >= 10) {
            return fontSize - 2;
            } else {
                return 18;
            }
        }
    }
}

// VIEW TOOLS
function Theme() {
    let themes = config["themeLibrary"];

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
    <button id="apply-changes--theme-upload" class="apply-changes" onclick="menuClose(this)">Custom Theme</button>
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

    function invertColor(hex) {
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // Convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        // Invert color components
        var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
            g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
            b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
        // Pad each with zeros and return
        return '#' + padZero(r) + padZero(g) + padZero(b);
    }
    
    function padZero(str, len) {
        len = len || 2;
        var zeros = new Array(len).join('0');
        return (zeros + str).slice(-len);
    }
    document.getElementById('menu').style.display = "block";
}

function View(type) {
    // Check if type is the exact name or extension
    let types = { "txt":"Text", "js":"JavaScript", "css":"CSS"}
    if (Object.keys(types).includes(type)) {
        type = types[type];
    }
    
    if (type !== "html") {
        output.style.display = "none";
        editor.style.width = "100%";

        textEditor.style.display = "block";
        document.getElementById('editor-title').innerText = type;
        currentMode = type.toLowerCase();
    } else {
        if (currentMode === "html" || tabs[currentTab][2] === "html") {
            editor.style.display = "flex";
            editor.style.width = "50%";
            output.style.width = "50%";

            document.getElementById('editor-title').innerText = "HTML";
            currentMode = "html";
            if (output.style.display === "block") {
                output.style.display = "none";
                editor.style.width = "100%";
            } else {
                output.style.display = "block";
            }
        }
    }
}

// HELP TOOLS 
function Help() {
    fetch('../README.txt')
    .then(response => response.text())
    .then(text => addTab("README", "txt", text))
}

function Feedback() {
    window.location.href = "mailto:jirashi.info@gmail.com?subject=Feedback for Textacular";
}