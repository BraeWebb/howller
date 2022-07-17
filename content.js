
// Trigger a reload of the extension if the table changes in any way
var observer = new MutationObserver((changes, observer) => {
    loadExtension();
})
var config = { attributes: true, childList: true, subtree: true };
observer.observe(document.querySelector('table.scheduled-works'), config);

// Initial load
loadExtension();

function loadExtension() {
    // Remove any previous buttons if this is a reload
    document.querySelectorAll(".js-copy").forEach((element) => {
        element.parentNode.removeChild(element);
    })

    // Load recipient config
    chrome.storage.sync.get({
        data: [{"Course": "CSSE1001", "Recipient": "b.webb@uq.edu.au"}]
    }, function(items) {

        var items = optionsToMap(items["data"]);
        var timesheet = loadTimesheet();

        function btnCallback(course) {
            return function(e) {
                var event = e || window.event;
                event.stopPropagation();

                var courseTimesheet = timesheet[course];

                if (!(course in items)) {
                    alert("Unable to find a recipient for " + course + ". Please configure the extension options.");
                    chrome.runtime.sendMessage({"action": "openOptionsPage"});
                    return;
                }

                if (hasDraft(courseTimesheet)) {
                    alert("Wait! You have draft hours. Please submit your timesheet before emailing the changes");
                    return;
                }

                sendEmail(items[course], "[" + course + "] Hours", formatEmail(courseTimesheet))
            }
        }

        for (var course in timesheet) {
            createBtn("Send " + course + " changes", btnCallback(course));
        }    
    });
}

function hasDraft(data) {
    for (var i = 0; i < data.length; i++) {
        var row = data[i];

        if (row["Status"] === "DRAFT") {
            return true;
        }
    }
    return false;
}

function createBtn(text, onclick) {
    var copySpreadsheet = document.createElement("a");
    copySpreadsheet.href = "#"
    copySpreadsheet.className = "button small js-copy";
    copySpreadsheet.innerHTML = text;
    copySpreadsheet.onclick = onclick;

    var submitBtn = document.querySelector("a.js-submit")

    submitBtn.parentNode.insertBefore(copySpreadsheet, submitBtn.nextSibling);
    submitBtn.parentNode.insertBefore(document.createTextNode (" "), submitBtn.nextSibling);
}

function loadTimesheet() {
    var table = document.querySelector('table.scheduled-works');
    var tableData = tableToJson(table);
    var data = sortTable(tableData);

    return data;
}

function sendEmail(recipient, subject, body) {
    document.location = "mailto:"+recipient+"?subject="+subject+"&body="+encodeURIComponent(body);
}

function formatEmail(data) {
    var csvFormat = "\"ID\",\"Date\",\"Activity\",\"Code\",\"Duration\",\"Comment\"";
    var unstructured = "";

    for (var i = 0; i < data.length; i++) {
        var row = data[i];

        // CSV
        var dataOfInterest = [
            "Id",
            "Scheduled date",
            "Activity",
            "Pay code",
            "Duration",
            "Comment",
        ].map((key) => "\"" + row[key] + "\"").join(",");
        csvFormat += "\n" + dataOfInterest;

        // Informal
        unstructured += row["Duration"] + " hours on " + row["Scheduled date"] + ". " + row["Comment"];
    }

    return `Hi,

Please find the hours lodged in CAHP for approval.

` + unstructured + `

---CSV---
` + csvFormat;
}

function optionsToMap(options) {
    var result = {};
    for (var i = 0; i < options.length; i++) {
        result[options[i]["Course"]] = options[i]["Recipient"];
    }
    return result;
}

function sortTable(table) {
    var results = {};

    for (var i = 0; i < table.length; i++) {
        var row = table[i];
        if (row["Status"] === "APPROVED") {
            continue;
        }

        var course = row["Course"];
        if (!(course in results)) {
            results[course] = [];
        }

        results[course].push(row);
    }

    return results;
}

function tableToJson(table) { 
    var data = [];
    headerRow = table.rows[0];

    for (var i = 1; i < table.rows.length; i++) { 
        var row = table.rows[i];

        var rowData = {}; 
        for (var j = 0; j < row.cells.length; j++) { 
            rowData[headerRow.cells[j].innerHTML] = row.cells[j].innerHTML;
        }
        data.push(rowData); 
    }

    return data; 
}