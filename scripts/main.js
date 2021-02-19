function loadTools(tools) {
    let menuBar = document.getElementById('menu-bar--ul');
    let menuBarHTML = "";
    function getToolDropwdown(tool) {
        let dropDownContent = "";
        for (let item of tool.content) {
            let itemHTML = "";
            if (item.id != "split") {
                let name = item.name;
                let functionParams = item.function[1];
                if (!name) {
                    name = item.id.substring(0, 1).toUpperCase() + item.id.substring(1);
                }
                if (!functionParams) {
                    functionParams = "";
                }
                itemHTML = 
                `<button class="tool-dropdown--btn" id="${tool.name}-${item.id}--btn" onclick="${item.function[0]}(${functionParams})">
                    <i class="fa fa-${item.icon}"></i> ${name}
                </button>`
            } else if (item.id = "split") {
                itemHTML = `<hr class="tool-dropdown--hr">`
            }
            dropDownContent += itemHTML;
        }
        return dropDownContent;
    }

    for (let tool of tools) {
        let menuBarTool = `
            <li class="menu-bar--tool" id="menu-bar--${tool.name}">
                <button class="menu-bar--tool--btn">${tool.name.substring(0, 1).toUpperCase() + tool.name.substring(1)} <i class='fa fa-caret-down'></i></button>
                <div class="tool--dropdown">
                    ${getToolDropwdown(tool)}
                </div>
            </li>
        `
        menuBarHTML += menuBarTool;
    }
    menuBar.innerHTML = menuBarHTML;
}

function setUp() {
    /* get tools.json */
    fetch(new Request("/scripts/tools.json")).then(response => response.json()).then(function(data) {
        const tools = data;
        loadTools(tools);
    }).then(function() {
        /* functions onload */
        addListeners();
        fileNew();
        View('text');
    })
}

style([["Arial", "400"], "light"])