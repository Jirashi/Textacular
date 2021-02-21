let editorsOpen = [];
let selectionIndex = "";
/* FILE TOOLS */
function fileNew() {
    tab("addTab", [makeKey(6), "Untitled"]);
    resetEditors();
}

function fileOpen(file) {
    if (file) {
        let fileType = "txt";
        if (file.type === "text/html") {
            fileType = "html";
        }
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
            tab('addTab', [makeKey(6), file.name, e.target.result, fileType])
        };
    } else {
        return document.getElementById('file-upload').click();
    }
}

function fileSave(fileType) {
    if (currentTab && textEditor.value.length + cssEditor.value.length + jsEditor.value.length) {
        let file = "";
        if (!fileType) {
            fileType = tabs[currentTab][2];
        }

        let filename = tabs[currentTab][0].split(tabs[currentTab][2])[0] + `${fileType}`;
        if (fileType === "txt") {
            file = new Blob([textEditor.value], {type: "text/plain"});
        } else if (fileType === "html") {
            let htmlFile = document.getElementById('output-frame').contentWindow.document.getElementsByTagName('HTML')[0].innerHTML;
            file = new Blob([
`<!DOCTYPE html>
<html>
    ${htmlFile}
</html>`
            ], {type: "text/html"});
        } else if (fileType === "css") {
            file = new Blob([cssEditor.value], {type: "text/css"});
        } else if (fileType === "js") {
            file = new Blob([jsEditor.value], {type: "text/javascript"});
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

function outputOpen() {
    let htmlDoc = document.getElementById('output-frame').contentWindow.document.getElementsByTagName('HTML')[0].innerHTML;
    let htmlFile = new Blob([
`<!DOCTYPE html>
<html>
${htmlDoc}
</html>`
    ], {type: "text/html"});
    const fileObjectURL = URL.createObjectURL(htmlFile);
    window.open(fileObjectURL);
}

function fileEmail() {
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

/* EDIT TOOLS */
function deleteAll() {
    if (currentTab && textEditor.value.length + cssEditor.value.length + jsEditor.value.length) {
        if (confirm(`Are you sure you want to delete all text in ${tabs[currentTab][0]}`)) {
            resetEditors();
        }
    }
}

function selectAll() {
    let lang = document.getElementById('footer--lang').innerText.toLowerCase();
    if (currentTab && document.getElementById(`editor-module--${lang}`).value.length) {
        document.getElementById(`editor-module--${lang}`).select();
    }
}

function Undo() {
    document.execCommand("undo");
}

function Redo() {
    document.execCommand("redo");
}

function Copy() {
    document.execCommand("copy");
}

function Cut() {
    document.execCommand("cut");
}

function Paste() {
    let lang = document.getElementById('footer--lang').innerText.toLowerCase();
    let textarea = document.getElementById(`editor-module--${lang}`);
    navigator.clipboard.readText()
    .then(text => {
        if (currentTab && textarea && text) {
            if (textarea.selectionStart) {
                selectionIndex = textarea.selectionStart;
            }
            var str = textarea.value.substring(0, selectionIndex) + text + textarea.value.substring(selectionIndex);
            textarea.value = str;
            selectionIndex = selectionIndex + text.length;
        }
    })
    .catch(err => {
        return;
    });
}

/* SETTINGS TOOLS */
function Zoom(value) {
    let fontSize = 18;

    for (let module of editor.childNodes) {
        if (module.nodeName === "TEXTAREA" ) {
            let lineNumRow = document.getElementById(module.id.replace('editor-module', 'line-row'));
            let fontSize = getFontSize(module)

            module.style.fontSize = fontSize + "px";
            module.style.lineHeight = (fontSize + 4) + "px";

            lineNumRow.style.fontSize = fontSize + "px";
            lineNumRow.style.lineHeight = (fontSize + 4) + "px";
            lineNumRow.style.paddingTop = (fontSize + 4) / 9.5 + "px";

            document.getElementById('footer--fontsize').innerText = module.style.fontSize;
        }
    }

    function getFontSize(module) {
        fontSize = parseInt(module.style.fontSize.split("px")[0]);
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

/* VIEW TOOLS */
function View(type) {
    let target = document.getElementById(`view-${type}--btn`);
    let targetModule = document.getElementById(`editor-module--${type}`);
    let targetLineRow = document.getElementById(`line-row--${type}`);

    if (!targetModule) {
        output.style.display = "block";
    }

    if (editorsOpen.indexOf(type) > -1) {
        if (editorsOpen.length >= 2) {
            editorsOpen.splice(editorsOpen.indexOf(type), 1);
            target.className = "tool-dropdown--btn";
            if (targetModule) {
                targetModule.className = "editor-module";
            }
            if (lineNumsEnabled && targetLineRow) {
                targetLineRow.style.display = "none";
            }
        }
    } else {
        editorsOpen.push(type);
        target.className += "-highlighted";
        if (targetModule) {
            targetModule.className += "--active";
        }
        if (lineNumsEnabled && targetLineRow) {
            targetLineRow.style.display = "block";
        }
    }

    editor.style.display = "flex";
    editor.style.width = "50%";
    output.style.width = "50%";
    if (editorsOpen.includes('html')) {
        output.style.display = "block";
        if (editorsOpen.length === 1) {
            editor.style.display = "none";
            output.style.width = "100%";

        }
    } else {
        output.style.display = "none";
        editor.style.width = "100%";
    }
    for (let title of document.getElementsByClassName('editor-title')) {
        if (editorsOpen.includes(title.id.split("editor-title--")[1])) {
            title.style.display = "block";
        } else {
            title.style.display = "none";
        }
    }
    
}

/* HELP TOOLS */
function Help() {
    window.location = "/help";
}

function Feedback() {
    window.location.href = "mailto:techlujo@gmail.com?subject=Feedback for Textacular";
}