document.addEventListener("DOMContentLoaded", function() {
    let tabCount = 0;

// Function to create a new tab and its corresponding content area
function createTab() {
    tabCount++;
    let tabId = `tab-${tabCount}`;
    let contentId = `content-${tabCount}`;

    // Create content area
    let content = document.createElement("div");
    content.className = "tab-content";
    content.id = contentId;
    document.body.appendChild(content); // Append content area to the body

    // Show the newly created tab
    showTab(tabId);

    // Create tab
    let tab = document.createElement("div");
    tab.className = "tab";
    tab.textContent = `Tab ${tabCount}`;
    tab.setAttribute("data-tab", tabId);
    tab.addEventListener("click", function() {
        showTab(tabId);
    });
    document.querySelector(".tabs").appendChild(tab); // Append tab to the .tabs container
}


    // Function to show a specific tab and hide others
    function showTab(tabId) {
        let allTabs = document.querySelectorAll(".tab");
        let allContents = document.querySelectorAll(".tab-content");

        allTabs.forEach(tab => {
            tab.classList.remove("active");
        });
        allContents.forEach(content => {
            content.style.display = "none";
        });

        document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
        document.getElementById(tabId).style.display = "block";
    }

    // Function to create a file upload input for a tab
    function createFileUploadInput(containerId) {
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = `file-upload-${containerId}`;
        fileInput.addEventListener("change", function() {
            createTab(); // Create a new tab when a file is uploaded
        });
        document.getElementById(containerId).appendChild(fileInput);
    }

    // Function to create a logs container for a tab
    function createLogsContainer(containerId) {
        let logsContainer = document.createElement("div");
        logsContainer.id = `logs-${containerId}`;
        document.getElementById(containerId).appendChild(logsContainer);
    }

    // Initial tab creation
    createTab();
});

function initializeLogAnalyzer(keywords) {
    document.getElementById("file-upload").addEventListener("change", function(event) {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = function(event) {
            let logText = event.target.result;
            let logLines = logText.split('\n');

            let logsElement = document.getElementById("logs");
            logsElement.innerHTML = '';

            logLines.forEach(line => {
                let div = document.createElement('div');
                div.className = 'line';

                // Convert timestamps in the line
                line = convertTimestamps(line);

                // Highlight log levels
                highlightLogLevels(line, div);

                div.innerHTML = line;
                logsElement.appendChild(div);
            });

            // Add hover functionality for timestamp conversion
            convertTimestampsOnHover();
        };
        reader.readAsText(file);
    });
}

function highlightLogLevels(line, div) {
    if (line.includes('WRN')) {
        div.classList.add('log-warning');
    } else if (line.includes('ERR')) {
        div.classList.add('log-error');
    } else if (line.includes('INF')) {
        div.classList.add('log-info');
    } else if (line.includes('DBG')) {
        div.classList.add('log-debug');
    } else {
        div.classList.add('log-default');
    }
}
        
function convertTimestampsOnHover() {
    let timestampElements = document.querySelectorAll('.timestamp');
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

function convertTimestamps(line) {
    let regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC/g;
    return line.replace(regex, match => {
        return `<span class="timestamp" data-utc="${match}">${match}</span>`;
    });
}


function escapeHTML(html) {
    return html.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}

function addTooltipHover() {
    let keywordElements = document.querySelectorAll('.line span');
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
