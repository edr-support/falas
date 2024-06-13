document.addEventListener("DOMContentLoaded", function() {
    let editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/html");

    document.getElementById("file-upload").addEventListener("change", function(event) {
        let files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let reader = new FileReader();
            reader.onload = function(event) {
                let logText = event.target.result;
                createTab(file.name, logText);
            };
            reader.readAsText(file);
        }
    });

    function createTab(filename, logText) {
        let tabCount = document.querySelectorAll('.tab').length + 1;
        let tabId = `tab-${tabCount}`;
        let contentId = `content-${tabCount}`;

        // Create tab
        let tab = document.createElement("div");
        tab.className = "tab";
        tab.textContent = filename;
        tab.setAttribute("data-tab", tabId);
        tab.addEventListener("click", function() {
            showTab(tabId, logText);
        });
        document.getElementById("tabs").appendChild(tab);

        // Show the newly created tab
        showTab(tabId, logText);
    }

    function showTab(tabId, logText) {
        let allTabs = document.querySelectorAll(".tab");
        allTabs.forEach(tab => tab.classList.remove("active"));

        document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");

        editor.session.setValue(logText);
        convertTimestamps();
        highlightLogLevels();
        addTooltipHover();
    }

    function highlightLogLevels() {
        let content = editor.session.getValue();
        content = content.replace(/WRN/g, '<span class="log-warning">WRN</span>')
                         .replace(/ERR/g, '<span class="log-error">ERR</span>')
                         .replace(/INF/g, '<span class="log-info">INF</span>')
                         .replace(/DBG/g, '<span class="log-debug">DBG</span>');
        editor.session.setValue(content);
    }

    function convertTimestamps() {
        let content = editor.session.getValue();
        let regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC/g;
        content = content.replace(regex, match => {
            let localTimestamp = new Date(match.replace(" UTC", "Z")).toLocaleString();
            return `[${localTimestamp}]`;
        });
        editor.session.setValue(content);
    }

    function addTooltipHover() {
        let keywordElements = editor.container.querySelectorAll('.line span');
        keywordElements.forEach(element => {
            element.addEventListener('mouseover', function() {
                let tooltipText = this.getAttribute('title');
                if (tooltipText) {
                    showTooltip(tooltipText);
                }
            });
            element.addEventListener('mouseout', function() {
                hideTooltip();
            });
        });

        let timestampElements = editor.container.querySelectorAll('.timestamp');
        timestampElements.forEach(element => {
            element.addEventListener("mouseover", function() {
                let utcTimestamp = element.getAttribute("data-utc");
                let localTimestamp = new Date(utcTimestamp.replace(" UTC", "Z")).toLocaleString();
                element.textContent = localTimestamp;
            });

            element.addEventListener("mouseout", function() {
                let utcTimestamp = element.getAttribute("data-utc");
                element.textContent = utcTimestamp;
            });
        });
    }

    function showTooltip(text) {
        let tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        document.addEventListener("mousemove", function(event) {
            tooltip.style.left = event.pageX + 10 + 'px';
            tooltip.style.top = event.pageY + 10 + 'px';
        });
    }

    function hideTooltip() {
        let tooltip = document.querySelector(".tooltip");
        if (tooltip) {
            tooltip.remove();
        }
    }

    function filterLogs(searchTerm) {
        let logLines = document.getElementsByClassName('line');
        for (let line of logLines) {
            if (line.textContent.toLowerCase().includes(searchTerm)) {
                line.style.display = 'block';
            } else {
                line.style.display = 'none';
            }
        }
    }
});
