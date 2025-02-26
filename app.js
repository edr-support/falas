document.addEventListener('DOMContentLoaded', function() {
    let tabsContainer = document.getElementById('tabs');
    let logsContainer = document.getElementById('logs-container');

    fetch('keywords.json')
        .then(response => response.json())
        .then(keywords => {
            initializeLogAnalyzer(keywords);
        });

    document.getElementById('search').addEventListener('input', function() {
        let searchTerm = this.value.toLowerCase();
        filterLogs(searchTerm);
    });

    document.getElementById('exclude').addEventListener('input', function() {
        let excludeTerm = this.value.toLowerCase();
        updateDisplayedLogs(excludeTerm);
    });

    function initializeLogAnalyzer(keywords) {
        document.getElementById("file-upload").addEventListener("change", function(event) {
            let files = event.target.files;
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                let reader = new FileReader();
                reader.onload = function(event) {
                    let logText = event.target.result;
                    createTab(file.name, logText, keywords);
                };
                reader.readAsText(file);
            }
        });
    }

    function createTab(filename, logText, keywords) {
        let tabCount = tabsContainer.querySelectorAll('.tab').length + 1;
        let tabId = `tab-${tabCount}`;
        let contentId = `content-${tabCount}`;

        // Create tab
        let tab = document.createElement("div");
        tab.className = "tab";
        tab.textContent = filename;
        tab.setAttribute("data-tab", tabId);
        tab.addEventListener("click", function() {
            showTab(tabId);
        });
        tabsContainer.appendChild(tab);

        // Create log container for the tab
        let logContainer = document.createElement("div");
        logContainer.id = contentId;
        logContainer.classList.add("logs");
        logsContainer.appendChild(logContainer);

        // Display the newly created tab
        showTab(tabId);

        // Parse and display log text
        displayLogs(logText, contentId, keywords);
    }

    function showTab(tabId) {
        let allTabs = tabsContainer.querySelectorAll(".tab");
        allTabs.forEach(tab => tab.classList.remove("active"));

        let selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (selectedTab) {
            selectedTab.classList.add("active");
        }

        // Hide all log containers
        let allLogContainers = logsContainer.querySelectorAll(".logs");
        allLogContainers.forEach(container => container.style.display = "none");

        // Show the corresponding log container
        let logContainer = document.getElementById(`content-${tabId.replace("tab-", "")}`);
        if (logContainer) {
            logContainer.style.display = "block";
        }
    }

    function displayLogs(logText, containerId, keywords) {
        let excludeTerm = document.getElementById('exclude').value.toLowerCase();
        let logLines = logText.split('\n');
        let logContainer = document.getElementById(containerId);
        logContainer.innerHTML = '';

        logLines.forEach(line => {
            if (excludeTerm && line.toLowerCase().includes(excludeTerm)) {
                return; // Skip this line if it contains the excluded term
            }

            let div = document.createElement('div');
            div.className = 'line';

            // Convert timestamps in the line
            line = convertTimestamps(line);

            // Highlight log levels
            highlightLogLevels(line, div);

            // Highlight keywords
            highlightKeywords(line, div, keywords);

            div.innerHTML = line;
            logContainer.appendChild(div);
        });

        // Add hover functionality for timestamp conversion
        convertTimestampsOnHover();
        addTooltipHover();
    }

    function updateDisplayedLogs(excludeTerm) {
        let allLogContainers = logsContainer.querySelectorAll(".logs");
        allLogContainers.forEach(logContainer => {
            let logLines = logContainer.querySelectorAll('.line');
            logLines.forEach(line => {
                if (excludeTerm && line.textContent.toLowerCase().includes(excludeTerm)) {
                    line.style.display = 'none';
                } else {
                    line.style.display = 'block';
                }
            });
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

    function highlightKeywords(line, div, keywords) {
        keywords.forEach(keyword => {
            let regex = new RegExp('\\b' + keyword + '\\b', 'gi');
            line = line.replace(regex, '<span class="keyword">' + keyword + '</span>');
        });
        div.innerHTML = line;
    }

    function convertTimestamps(line) {
        let regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC/g;
        return line.replace(regex, match => {
            return `<span class="timestamp" data-utc="${match}">${match}</span>`;
        });
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

    function addTooltipHover() {
        let keywordElements = document.querySelectorAll('.keyword');
        keywordElements.forEach(element => {
            element.addEventListener('mouseover', function() {
                let tooltipText = this.textContent;
                if (tooltipText) {
                    showTooltip(tooltipText);
                }
            });
            element.addEventListener('mouseout', function() {
                hideTooltip();
            });
        });

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

    function showTooltip(text) {
        let tooltip = document.getElementById('tooltip');
        tooltip.textContent = text;
        tooltip.style.display = 'block';
    }

    function hideTooltip() {
        let tooltip = document.getElementById('tooltip');
        tooltip.style.display = 'none';
    }
});