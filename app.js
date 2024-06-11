document.addEventListener('DOMContentLoaded', function() {
    fetchAirtableData()
        .then(keywords => {
            initializeLogAnalyzer(keywords);
        });

    document.getElementById('search').addEventListener('input', function() {
        let searchTerm = this.value.toLowerCase();
        filterLogs(searchTerm);
    });
});

async function fetchAirtableData() {
    const apiKey = 'YOUR_AIRTABLE_API_KEY';
    const baseId = 'YOUR_AIRTABLE_BASE_ID';
    const tableName = 'Log Keywords';
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    });

    const keywords = {};
    response.data.records.forEach(record => {
        keywords[record.fields.Keyword] = record.fields.Meaning;
    });

    return keywords;
}

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

                for (let keyword in keywords) {
                    if (line.includes(keyword)) {
                        div.classList.add(`log-${keyword.toLowerCase()}`);
                        div.title = keywords[keyword];
                    }
                }

                // Convert timestamps in the line
                line = convertTimestamps(line);
                div.innerHTML = line;
                logsElement.appendChild(div);
            });

            // Add hover functionality for timestamp conversion
            convertTimestampsOnHover();
        };
        reader.readAsText(file);
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
