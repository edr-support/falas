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

                // Check for keywords and apply appropriate class
                keywords.forEach(keywordObj => {
                    let keyword = keywordObj.Keyword;
                    let meaning = keywordObj.Meaning;
                    let index = line.indexOf(keyword);
                    if (index !== -1) {
                        let beforeKeyword = line.substring(0, index);
                        let afterKeyword = line.substring(index + keyword.length);
                        div.innerHTML += escapeHTML(beforeKeyword); // Escape HTML to prevent XSS
                        let span = document.createElement('span');
                        span.className = `log-${keyword.toLowerCase()}`;
                        span.title = meaning;
                        span.textContent = keyword;
                        div.appendChild(span);
                        div.innerHTML += escapeHTML(afterKeyword); // Escape HTML to prevent XSS
                    }
                });

                logsElement.appendChild(div);
            });

            // Add hover functionality for tooltips
            addTooltipHover();
        };
        reader.readAsText(file);
    });
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

function convertTimestamps(line) {
    let regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC/g;
    return line.replace(regex, match => {
        return `<span class="timestamp" data-utc="${match}">${match}</span>`;
    });
}

function convertTimestampsOnHover() {
    let timestampElements = document.getElementsByClassName("timestamp");
    for (let element of timestampElements) {
        element.addEventListener("mouseover", function() {
            let utcTimestamp = element.getAttribute("data-utc");
            let localTimestamp = new Date(utcTimestamp.replace(" UTC", "Z")).toLocaleString();
            element.textContent = localTimestamp;
        });

        element.addEventListener("mouseout", function() {
            let utcTimestamp = element.getAttribute("data-utc");
            element.textContent = utcTimestamp;
        });
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
