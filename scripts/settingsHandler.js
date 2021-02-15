function setPref(num, val) {
    var preferences = JSON.parse(localStorage.getItem("preferences"))
    preferences[num] = val;
    localStorage.setItem("preferences", JSON.stringify(preferences));
}

function style() {
    let preferences = JSON.parse(localStorage.getItem("preferences"));
    let fonts = localStorage.getItem("fonts");
    let theme = JSON.parse(preferences[0])[0];
    let colors = JSON.parse(preferences[0])[1];
    let font = preferences[1];
    let fontWght = preferences[2];
    var editor = document.getElementById('editor');

    var themeCSS = `
        body.${theme} {background-color: ${colors[0]};}
        body.${theme} header h1 {background-color: ${colors[6]}; color: ${colors[1]};}
        body.${theme} #file-name {background-color: ${colors[1]}; color: ${colors[5]};}
        
        body.${theme} .topbar-list, .topbar-list button {background-color: ${colors[3]}; color: ${colors[5]};}
        body.${theme} .dropdown-content, .dropdown-content button {background-color: ${colors[1]}; color: ${colors[5]};}
        body.${theme} .dropdown-content button:hover {background-color: ${colors[4]};}
        body.${theme} .dropdown-content hr {border: 0.25px solid ${colors[2]};}

        body.${theme} .tool button {background-color: ${colors[1]}; color: ${colors[5]};}
        body.${theme} .tool button:hover {background-color: ${colors[4]}; color: ${colors[5]};}
        body.${theme} #set-zoom-btn {background-color: ${colors[0]}; border: 1px solid ${colors[2]};}

        body.${theme} #editor {background-color: ${colors[1]}; color: ${colors[5]}; border: 1px solid ${colors[2]};}
        body.${theme} #output {border: 1px solid ${colors[2]};}

        body.${theme} .menu-content {background-color: ${colors[3]}; border: 1px solid ${colors[2]};}
        body.${theme} .menu-content h1, h6 {background-color: ${colors[6]}; color: ${colors[5]};}
        body.${theme} .menu-content h3, h4 {color: ${colors[5]};}
        body.${theme} .menu-content .options, .apply-changes, .file-options button {background-color: ${colors[0]}; color: ${colors[5]};}
        body.${theme} .menu-content .apply-changes:hover, .file-options button:hover {background-color: ${colors[6]}; color: ${colors[0]};}

        body.${theme} footer {background-color: ${colors[2]}; color: ${colors[5]};}
    `;
    
    function getFontCSS(font) {
        if (fonts) {
            for (let fontArray of JSON.parse(fonts)) {
                if (fontArray[0] == font) {
                    var fontCSS = `
                        @font-face {
                        font-family: ${fontArray[0]};
                        src: url(${fontArray[1]});
                    }`
                    return [fontCSS];
                }
            }
        }
        return [null];
    }
    let fontCSS = getFontCSS(font);
    let prefCSS = themeCSS + fontCSS;

    editor.style.fontFamily = font;
    editor.style.fontWeight = fontWght;
    document.getElementById('style').innerHTML = prefCSS;
    document.body.classList.replace(document.body.classList[0], theme)
}

for (button of document.getElementsByClassName('apply-changes')) {
    button.addEventListener('click', function(event) {
        event.target.parentElement.parentElement.style.display = "none";
    })
    if (button.id == "apply-changes-theme") {
        button.addEventListener('click', function() {
            let theme = document.getElementById('theme-select').value;
            let truTheme = theme.replaceAll("\'", "\"");
            setPref(0, truTheme);
            style()
        });
    } else if (button.id == "apply-changes-pref") {
        button.addEventListener('click', function() {
            setPref(1, document.getElementById('font').value);
            setPref(2, document.getElementById('font-weight').value);
            style();
        });
    }
}

function loadPreferences() {
    let preferences = localStorage.getItem("preferences");

    if (!preferences) {
        let defaultPreferences = JSON.stringify([JSON.stringify(['light',['#eeeeee','#f9f9f9','#dddddd','#ffffff','#dddddd','#000000','#00c3ff']]), "Arial, Helvetica, sans-serif", "400"]);
        localStorage.setItem("preferences", defaultPreferences);
        return loadPreferences();
    }
    style();
}

document.getElementById("theme-select").addEventListener('change', function() {
    if (document.getElementById("preview").checked) {
        let theme = document.getElementById('theme-select').value;
        let truTheme = theme.replaceAll("\'", "\"");
        setPref(0, truTheme);
        style()
    }
})