function loadConfig() {
    fetch(new Request("./config/config.json")).then(response => response.json()).then(function(data) {
        for (let configuration in data) {
            config[configuration] = data[configuration];
        }
        loadTheme(config["defaultTheme"], config["themeLibrary"][config["defaultTheme"]][0]);
        loadFont(config["fontLibrary"][config["defaultFont"]], 400);
    });
}

function loadTools() {
    // Fetching tools file
    fetch(new Request("./config/tools.json")).then(response => response.json()).then(function(data) {
        const tools = data;
        let toolBar = document.getElementById('toolbar--ul');
        let toolBarHTML = "";
        // sorting through each tool in the tools file
        for (let tool of tools) {
            // The tool LI will consist of the button and the dropdown content
            toolBarTool = 
            `<li class="toolbar--tool" id="toolbar--${tool.name}">
                <button class="toolbar--tool--btn">${tool.name.substring(0, 1).toUpperCase() + tool.name.substring(1)} <i class='fa fa-caret-down'></i></button>
                <div class="tool--dropdown">
                    ${createToolDropdown(tool)}
                </div>
            </li>`;
            toolBarHTML += toolBarTool;
        }
        toolBar.innerHTML = toolBarHTML;
    });

    function createToolDropdown(tool) {
        let dropDownContent = "";
        for (let item of tool.content) {
            let itemHTML = "";
            // split represents an HR seperating two sections of a dropdown
            if (item.id != "split") {
                let name = item.name;
                let functionParams = item.function[1];
                // if no name then name = id
                if (!name) {
                    name = item.id.substring(0, 1).toUpperCase() + item.id.substring(1);
                }
                if (!functionParams) {
                    functionParams = "";
                }
                itemHTML = 
                `<button class="tool-dropdown--btn" id="${tool.name}-${item.id}--btn" onclick="${item.function[0]}(${functionParams})">${name}
                </button>`;
            } else if (item.id = "split") {
                itemHTML = `<hr class="tool-dropdown--hr">`;
            }
            dropDownContent += itemHTML;
        }
        return dropDownContent;
    };
}

function onLoadMenu() {
    
}

function initialize() {
    loadTools();
    loadConfig();

    let menuContent = `
    <div id="main-menu">
        <h1>Textacular v3</h1><button class="close-menu">X</button>
        <button onclick="newFile(config['defaultFileType']); menuClose();">New file</button><br>
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
    View('txt');
}