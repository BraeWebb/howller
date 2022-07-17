// Saves options to chrome.storage
function saveOptions() {
    var table = document.querySelector("table");
    var tableContent = tableToJson(table);

    chrome.storage.sync.set({data: tableContent}, function() {
      var status = document.getElementById('status');
      status.textContent = 'Options saved. Refresh the CAHP website before trying to send changes.';
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    });
  }
  
function restoreOptions() {
chrome.storage.sync.get({
    data: [{"Course": "CSSE1001", "Recipient": "b.webb@uq.edu.au"}]
}, function(items) {
    var data = items.data;
    for (var i = 0; i < data.length; i++) {
        addCourse(data[i]);
    }
});
}


function addCourse(data) {
    var row = document.createElement("tr");
    
    var courseInput = row
                      .appendChild(document.createElement("td"))
                      .appendChild(document.createElement("input"))
    courseInput.value = data ? data.Course : "";

    var recipientInput = row
                         .appendChild(document.createElement("td"))
                         .appendChild(document.createElement("input"));
    recipientInput.value = data ? data.Recipient : "";

    var tableBody = document.querySelector("tbody");
    var tableLast = tableBody.lastChild;

    tableLast.parentNode.insertBefore(row, tableLast.nextSibling);
}


// https://stackoverflow.com/questions/9927126/how-to-convert-the-following-table-to-json-with-javascript
function tableToJson(table) { 
    var data = [];
    headerRow = table.rows[0];
    for (var i=1; i<table.rows.length; i++) { 
        var tableRow = table.rows[i]; 
        var rowData = {}; 
        for (var j=0; j<tableRow.cells.length; j++) { 
            rowData[headerRow.cells[j].innerHTML] = tableRow.cells[j].lastChild.value;
            // rowData.push(tableRow.cells[j].innerHTML);; 
        } 
        data.push(rowData); 
    } 
    return data; 
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('add-course-btn').addEventListener('click', addCourse);
document.getElementById('save').addEventListener('click', saveOptions);
