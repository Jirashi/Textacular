let regex = /^#[0-9A-F]{6}$/i;
let themes = {
    "light": [["#a5a7a2", "#ffffff", "#f7f9fa", "#f3f3f3", "#373b3d", "#369ada"], "light"],
    "dark": [["#414141", "#1a1a1a", "#161616", "#121212", "#eaeaea", "#007acc"], "dark"],
    "one-dark-pro": [["#787d86", "#282c34", "#20232a", "#21252b", "#abb2bf", "#98c375"], "dark"],
    "one-light-pro": [["#595852", "#d6d3c2", "#c1beaf", "#d0cdbb", "#464541", "#595852"], "light"],
    "bluloco-light": [["#abacb1", "#fafafa", "#ebebeb", "#c9cbce", "#40424b", "#275fe4"], "light"],
    "bluloco-dark": [["#abacb1", "#fafafa", "#ebebeb", "#c9cbce", "#40424b", "#275fe4"], "dark"],
    "night-owl": [["#465e73", "#001122", "#000c18", "#010d17", "#d0dee3", "#0b2942"], "dark"],
    "dracula": [["#44475a", "#282a36", "#22222c", "#191923", "#f8f8f2", "#6272a4"], "dark"],
}

let fonts = {
    "Arial":"Arial, Helvetica, sans-serif",
    "Verdana":"Verdana, sans-serif",
    "Helvetica":"Helvetica, sans-serif",
    "Tahoma":"Tahoma, sans-serif",
    "Trebuchet MS":"'Trebuchet MS', sans-serif",
    "Times New Roman":"'Times New Roman', serif",
    "Georgia":"Georgia, serif",
    "Garamond":"Garamond, serif",
    "Courier New":"'Courier New', monospace",
    "Exo 2":"'Exo 2', monospace",
    "Jetbrains Mono":"'Jetbrains Mono', monospace",
    "Open Sans":"'Open Sans', sans-serif",
    "Roboto":"'Roboto', sans-serif",
    "Roboto Mono":"'Roboto Mono', monospace",
    "Share Tech Mono":"'Share Tech Mono', monospace",
    "Space Mono":"'Space Mono', monospace",
    "VT323":"'VT323', monospace",
    "Lora":"'Lora', serif",
    "Comic Sans MS":"'Comic Sans MS', 'Comic Sans', cursive",
    "Brush Script MT":"'Brush Script MT', cursive",
}

function style(styleSettings) {
    let font = styleSettings[0];
    let theme = styleSettings[1];
    
    if (theme) {
        let themeName = theme;
        let colors = themes[theme][0];

        for (let color of colors) {
            if (!regex.exec(color)) {
                colors[color] = "#000000";
            }
        }

        let themeCSS = `    
            body.${themeName} {background-color: ${colors[1]}}
            body.${themeName} header, footer {background-color:${colors[2]}; color:${colors[0]};}
            body.${themeName} footer {background-color:${colors[3]};}

            body.${themeName} .menu-bar--tool--btn {background-color:${colors[2]}; color:${colors[4]};}
            body.${themeName} .tool-dropdown--btn {background-color:${colors[2]}; color:${colors[4]};}
            body.${themeName} .tool-dropdown--btn-highlighted {background-color:${colors[1]}; color:${colors[5]};}
            body.${themeName} .tool--dropdown hr {border: 0.5px solid ${colors[3]};}
            body.${themeName} .tool-dropdown--btn:hover {background-color: ${colors[1]};}
            body.${themeName} .tool-dropdown--btn-highlighted:hover {background-color: ${colors[1]}; color: ${colors[5]};}
            
            body.${themeName} #tabs {background-color: ${colors[3]}; border-bottom: 0.5px solid ${colors[0]};}
            body.${themeName} .tab {background-color: ${colors[3]}; border-right: 1px solid ${colors[2]}; border-left: 1px solid ${colors[2]};}
            body.${themeName} .tab-selected {background-color: ${colors[1]}; border: 0 1px 1px 1px solid ${colors[3]}; border-top: 1px solid ${colors[5]};}

            body.${themeName} button.tab-content {background-color: ${colors[1]}; color: ${colors[4]};}
            body.${themeName} textarea.tab-content {background-color: ${colors[3]}; color: ${colors[0]};}
            body.${themeName} .tab-selected textarea.tab-content {background-color: ${colors[1]}; color: ${colors[4]}}
            body.${themeName} .tab-selected textarea.tab-content:focus {background-color: ${colors[2]}}
            body.${themeName} textarea.tab-content:focus {color: ${colors[4]}}

            body.${themeName} .editor-module, .editor-module--active {background-color: ${colors[1]}; color:${colors[4]};  border-bottom: 0.5px solid ${colors[0]}}
            body.${themeName} .line-row {background-color: ${colors[1]}; color:${colors[0]};}
            body.${themeName} #output {background-color: #ffffff; border: 1px solid ${colors[3]};}

            body.${themeName} #menu-content {background-color: ${colors[2]}; border: 1px solid ${colors[0]};}
            body.${themeName} #menu-content h1, .close-menu {background-color: ${colors[1]}; color: ${colors[0]};}
            body.${themeName} #menu-content h3 {background-color: ${colors[2]}; color: ${colors[4]};}
            body.${themeName} .menu-list--ul {background-color: ${colors[3]}; color: ${colors[4]}; border: 1px solid ${colors[3]};}
            body.${themeName} .menu-list--li, .menu-list--li button {background-color: ${colors[1]}; color: ${colors[0]};}
            body.${themeName} .menu-list--li-selected, .menu-list--li-selected button {background-color: ${colors[5]}; color: ${colors[1]};}
            body.${themeName} .menu-list--li:hover button {background-color: ${colors[3]}; color: ${colors[4]};}
            body.${themeName} .apply-changes {background-color: ${colors[2]}; color: ${colors[0]};}
            body.${themeName} .apply-changes:hover, .close-menu:hover {background-color: ${colors[3]}; color: ${colors[4]};}
            body.${themeName} button.tab-content:hover {background-color: ${colors[3]}; color: ${colors[5]};}
        `
        document.body.classList = themeName;
        document.getElementById('style').innerHTML = themeCSS;
    }
    if (font) {
        let fontFamily = font[0];
        let fontWeight = font[1];
        if (font[0]) {
            fontFamily = fonts[font[0]];
        }

        for (let module of editor.childNodes) {
            if (module.nodeName === "TEXTAREA" ) {
                if (fontFamily) {
                    module.style.fontFamily = fontFamily;
                    
                }
                if (fontWeight) {
                    module.style.fontWeight = fontWeight;
                }                
            }
        }
    }
}

