document.addEventListener('DOMContentLoaded', function() {
    fetch('keywords.json')
        .then(response => response.json())
        .then(keywords => {
            initializeLogAnalyzer(keywords);
        });

    document.getElementById('search').addEventListener('input', function() {
        let searchTerm = this.value.toLowerCase();
        filterLogs(searchTerm);
    });
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