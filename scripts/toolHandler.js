let editor = document.getElementById('editor');
let fileName = document.getElementById('file-name');
let zoomAmnt = document.getElementById('set-zoom-btn');

let container = document.getElementById('container');
let htmlViewer = document.getElementById('output');

var undone = [];
var copiedText = "";

function newFile() {
    if (confirm("New file? All current text will be deleted.")) {
        editor.value = "";
        fileName.value = `Untitled.${container.className}`;
        window.location.href = "https://techlujo.github.io/projects/Textacular/";
    }
}

function openFile(type) {
    if (type == "text") {
        document.getElementById('file-upload').click();
    } else if (type== "font") {
        document.getElementById('font-upload').click();
    }
}

function emailFile() {
    var email = prompt("Enter a valid E-Mail", "abc@example.com")
    if (email) {
        window.location.href = `
        mailto:${email}
        ?subject=${fileName.value}
        &body=${editor.value}`;
    }
}

function saveFile() {
    var file = new Blob([ editor.value ], { type: "text/plain" });
    var filename = fileName.value;

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

function saveFileAs () {
    fileName.value = prompt("Save As:", fileName.value)
    if (fileName.value) {saveFile();}
}

function saveLocal() {
    function makeKey(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    var fileContent = [fileName.value, editor.value];
    var fileKey = makeKey(10);
    var fileComplete = JSON.stringify({Key: fileKey, Content: fileContent});
    var files = localStorage.getItem("files");

    if (files) {
        let parsedFiles = JSON.parse(files);
        for (var truFile of parsedFiles) {
            file = JSON.parse(truFile);
            if (file.Content[0] == fileName.value) {
                file.Content[1] = editor.value;
                parsedFiles[parsedFiles.indexOf(truFile)] = JSON.stringify(file);
                localStorage.setItem("files", JSON.stringify(parsedFiles));
                return;
            }
        }
        parsedFiles.push(fileComplete);
        localStorage.setItem("files", JSON.stringify(parsedFiles));
    } else {
        localStorage.setItem("files", JSON.stringify([fileComplete]));
    }
    prompt(`Saved file as ${fileName.value} \nKey:`, fileKey);
}

function delLocal(key) {
    var files = JSON.parse(localStorage.getItem("files"));
    for (var truFile of files) {
        file = JSON.parse(truFile)
        if (file.Key == key) {
            if (confirm(`Are you sure you want to delete ${file.Content[0]}?`)) {
                files.splice(files.indexOf(truFile), 1);
                localStorage.setItem("files", JSON.stringify(files));
            }
        }
    }
}

function loadLocal(key) {
    let files = JSON.parse(localStorage.getItem("files"));
    for (var file of files) {
        file = JSON.parse(file)
        if (file.Key == key) {
            fileName.value = file.Content[0]
            editor.value = file.Content[1]
        }
    }
}

function loadLocalFiles() {
    let files = localStorage.getItem("files");
    let menu = document.getElementById('localfiles-menu');
    let filelist = document.getElementById('lclfiles');
    filelist.innerHTML = "";
    if (files) {
        let parsedFiles = JSON.parse(localStorage.getItem("files"));
        for (var file of parsedFiles) {
            file = JSON.parse(file);
            optionHTML = `<option value="${file.Key}">${file.Content[0]} (${file.Content[1].slice(0, 10)}...)</option>`;
            filelist.insertAdjacentHTML('beforeend', optionHTML);
        }
        menu.style.display = "block";
    }
}

function Undo() {
    let last = undone.length
    if (last < 101) {
        undone.push(editor.value.slice(editor.value.length - 1));
        editor.value = editor.value.slice(0, editor.value.length - 1)
    }
}

function Redo() {
    let last = undone.length - 1;
    if (last > -1) {
        editor.value += undone[last];
        undone.splice(last, 1)
    }
}

function Copy() {
    copiedText = editor.value;
    editor.select();
    editor.setSelectionRange(0, 99999)
    document.execCommand("copy");
}

function Clear() {
    if (editor.value.length > 0) {
        if (confirm("Are you sure? All current text will be deleted.")) {
            editor.value = "";
        }
    }
}

function Cut() {
    Copy()
    editor.value = "";
}

function Paste() {
    editor.value += copiedText
}

function slctAll() {
    editor.select();
}

function Update() {
    if (container.className == "html") {
        document.getElementById('output').innerHTML = editor.value;
    }
}

function Zoom(inout) {
    let fontSize = editor.style.fontSize;
    var truFontSize = parseInt(fontSize.slice(0, fontSize.length - 2))
    if (inout) {var ZoomAmnt = 2;} else {var ZoomAmnt = -2;}
    if (truFontSize >= 32 || 6 > truFontSize) {
        editor.style.fontSize = "18px";
        zoomAmnt.innerHTML = "18px"
    } else {
        editor.style.fontSize = `${(truFontSize + ZoomAmnt)}px`;
        zoomAmnt.innerHTML = `${(truFontSize + ZoomAmnt)}px`;
    }
}

function setZoom() {
    var amnt = prompt("Choose size:", "6-32")
    if (amnt > 5 && amnt < 33) {
        amnt = `${amnt}px`;
        editor.style.fontSize = amnt;
        zoomAmnt.innerHTML = amnt;
    }
}

function Theme() {
    let menu = document.getElementById('theme-menu');
    let themes = localStorage.getItem("themes");
    let themeList = document.getElementById('theme-select');

    themeList.innerHTML = `
    <option value="['light',['#eeeeee','#f9f9f9','#dddddd','#ffffff','#dddddd','#000000','#00c3ff']]">Light (default)</option>
    <option value="['dark', ['#1d1d1d','#222222','#141414','#1a1a1a','#313131','#eeeeee','#109c5f']]">Dark</option>
    <option value="['onedark', ['#282c34','#282c34','#1d2025','#17191d','#282c34','#abb2bf','#e06c75']]">One Dark</option>
    <option value="['dracula', ['#282a36','#282a36','#22242e','#22242e','#2f303a','#f8f8f2','#6272a4']]">Dracula</option>
    <option value="['gruvbox', ['#282828','#3c3836','#1d2021','#1d2021','#504945','#ebdbb2','#1d2021']]">Gruvbox</option>
    `;

    if (themes) {
        let parsedThemes = JSON.parse(themes);
        for (let theme of parsedThemes) {
            let themeArray = JSON.parse(theme.replaceAll("\'", "\""));
            let optionHTML = `<option value="${theme}">${themeArray[0]}</option>`;
            themeList.insertAdjacentHTML('beforeend', optionHTML);
        }
    }
    menu.style.display = "block";
}
  
window.onclick = function(event) {
    if (event.target.className == "menu") {
        event.target.style.display = "none";
    }
}

function Type(type) {
    container.classList.replace(container.classList[0], type);
    Update();
}

function Settings() {
    let menu = document.getElementById('settings-menu');
    let fonts = localStorage.getItem("fonts");
    let fontList = document.getElementById('font');
    fontList.innerHTML = `
    <option value="Arial, Helvetica, sans-serif">Arial (default)</option>
    <option value="'Courier New', Courier, monospace">Courier New</option>
    <option value="'Roboto', sans-serif">Roboto</option>
    <option value="'Source Code Pro', monospace">Source Code Pro</option>
    <option value="'Ubuntu', sans-serif">Ubuntu</option>
    `;

    if (fonts) {
        let parsedFonts = JSON.parse(fonts);
        for (var font of parsedFonts) {
            let optionHTML = `<option value="${font[0]}">${font[0]}</option>`;
            fontList.insertAdjacentHTML('beforeend', optionHTML);
        }
    }
    menu.style.display = "block";
}

editor.addEventListener("keyup", function() {
    Update();
});

fileName.addEventListener('change', function() {
    if (fileName.value) {
        if (!fileName.value.endsWith(`.${container.className}`)) {
            fileName.value += `.${container.className}`;
        }
    } else {
        fileName.value = `Untitled.${container.className}`
    }
});

document.getElementById('file-upload').addEventListener('change', function() {
    var file = document.getElementById('file-upload').files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
            editor.value = e.target.result;
        };
        fileName.value = file.name;
    }
});

document.getElementById('font-upload').addEventListener('change', function() {
    saveFont();
});

function saveFont() {
    let fonts = localStorage.getItem("fonts");
    let font = document.getElementById('font-upload').files[0];
    let fontName = font.name.slice(0, font.name.length - 4);
    var reader = new FileReader();

    reader.readAsDataURL(font);
    reader.onload = function() {
        let fontURL = reader.result.replace("application/octet-stream", "font/ttf");
        if (fonts) {
            let parsedFonts = JSON.parse(fonts)
            parsedFonts.push([fontName, fontURL])
            localStorage.setItem("fonts", JSON.stringify(parsedFonts));
        } else {
            localStorage.setItem("fonts", JSON.stringify([[fontName, fontURL]]));
        }
    };
}

function saveTheme() {
    let themes = localStorage.getItem("themes");
    let importedTheme = document.getElementById('import-theme');
    let theme = verifyTheme(importedTheme.value)

    if (theme) {
        if (themes) {
            let parsedThemes = JSON.parse(themes);
            parsedThemes.push(theme);
            localStorage.setItem("themes", JSON.stringify(parsedThemes))
        } else {
            localStorage.setItem("themes", JSON.stringify([theme]));
        }
    }
    
    importedTheme.value = "";

    function verifyTheme(toVerify) {
        /* check if parsable */
        try {
           JSON.parse(toVerify.replaceAll("\'", "\""));
        } catch (error) {
            return;
        }

        /* check theme to see if valid */
        let theme = JSON.parse(toVerify.replaceAll("\'", "\""));
        if (Array.isArray(theme) && theme.length == 2) {
            if (theme[0].length < 21 && theme[1].length == 7) {
                theme[0] = theme[0].replaceAll(" ", "");
                let regex = /^#[0-9A-F]{6}$/i;
                for (let color of theme[1]) {
                    if (!regex.exec(color)) {
                        return;
                    }
                }
                return JSON.stringify(theme).replaceAll("\"", "\'")
            }
        }
        return;
    }
}

function installThemes(themeArray) {
    if (Array.isArray(themeArray)) {
        for (theme of themeArray) {
            saveTheme(theme)
        }
    }
}

function editTheme() {
    let theme = JSON.parse(document.getElementById('theme-select').value.replaceAll("\'", "\""));
    document.getElementById("apply-changes-theme").click()
    fileName.value = theme[0] + ".txt";
    editor.value = document.getElementById('theme-select').value;
}

function delTheme() {
    let themes = localStorage.getItem("themes");
    let toDelete = document.getElementById('theme-select').value;
    var toDelName = JSON.parse(toDelete.replaceAll("\'", "\""))[0];

    if (themes) {
        let parsedThemes = JSON.parse(themes)
        for (var theme of parsedThemes) {
            theme = JSON.parse(theme.replaceAll("\'", "\""));
            if (theme[0] == toDelName && confirm(`Are you sure you want to delete ${theme[0]}?`)) {
                parsedThemes.splice(parsedThemes.indexOf(toDelete));
                localStorage.setItem("themes", JSON.stringify(parsedThemes));
                document.getElementById("apply-changes-theme").click()
            }
        }
    }
}

function checkURL() {
    let urlParams = getKey();
    if (urlParams[0] = "key") {
        loadLocal(urlParams[1])
    }

    function getKey() {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            return pair;
        }
        return(false);
    }
}

function numColmn(textarea){
    var textLines = textarea.value.substr(0, textarea.selectionStart).split("\n");
    var currentLineNumber = textLines.length;
    var currentColumnIndex = textLines[textLines.length-1].length;
    document.getElementById('numColmn').innerHTML = "Line " + currentLineNumber+", Column " + currentColumnIndex;
}

