/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 56.894, "KoPercent": 43.106};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.26622, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.01045, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.7202, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.70175, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.13495, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.001, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.20135, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.29595, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [3.0E-4, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.59505, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0012, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 43106, 43.106, 1220.7755600000207, 0, 6879, 733.0, 1787.9000000000015, 1997.0, 2437.980000000003, 1678.4719191647923, 497.51466499274056, 549.2908521706838], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 9373, 93.73, 1063.0097999999987, 0, 4473, 991.0, 2157.0, 2511.949999999999, 3245.8799999999974, 203.5623409669211, 43.87289281170484, 67.70555025445293], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 607, 6.07, 489.06350000000117, 0, 2551, 364.0, 1181.0, 1536.949999999999, 2019.9899999999998, 194.36345966958214, 77.45577472060252, 63.67407677356657], "isController": false}, {"data": ["14 Register Request", 10000, 76, 0.76, 632.3693000000015, 8, 3182, 525.0, 1209.0, 1576.0, 2479.99, 196.85814402141816, 37.74401182133155, 51.263206413146186], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 1063, 10.63, 2022.9787999999958, 0, 5492, 1908.0, 3440.8999999999996, 3989.8499999999967, 4837.969999999999, 186.08459405645806, 48.414159467518935, 83.46173897216175], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 9942, 99.42, 1340.8879999999908, 0, 5260, 1253.5, 2487.8999999999996, 3000.949999999999, 4247.909999999998, 190.7960009158208, 93.32488266045944, 62.52819085443219], "isController": false}, {"data": ["17 Add Money Request", 10000, 689, 6.89, 1945.8394999999873, 0, 6879, 1733.0, 3542.8999999999996, 4139.849999999997, 6120.869999999997, 189.25773117831864, 47.299776409733525, 68.28367190752867], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 1062, 10.62, 1452.3099000000086, 0, 5072, 1328.0, 2597.8999999999996, 3143.899999999998, 4352.99, 187.2343612499766, 49.83750836703552, 60.69359067526072], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 9944, 99.44, 1225.4148000000023, 0, 5059, 1140.0, 2401.8999999999996, 2892.0, 3914.9399999999987, 196.8077778433804, 45.59476924903072, 64.98412160998603], "isController": false}, {"data": ["15 Login Request", 10000, 405, 4.05, 771.8222000000014, 0, 3096, 614.0, 1677.0, 1892.0, 2311.9799999999996, 196.97447210841477, 79.58155312524622, 45.01909267402694], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 9945, 99.45, 1264.0598000000045, 0, 5271, 1155.0, 2439.7999999999993, 2915.949999999999, 4104.99, 194.12198625616335, 49.93344497369647, 64.45128614915363], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 338, 0.7841135804760359, 0.338], "isController": false}, {"data": ["401/Unauthorized", 2954, 6.852874309840858, 2.954], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 3019, 7.003665383009326, 3.019], "isController": false}, {"data": ["Assertion failed", 36795, 85.35934672667378, 36.795], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 43106, "Assertion failed", 36795, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 3019, "401/Unauthorized", 2954, "400/Bad Request", 338, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 9373, "Assertion failed", 8793, "401/Unauthorized", 404, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 176, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 607, "401/Unauthorized", 337, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 270, "", "", "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 10000, 76, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 76, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 1063, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 435, "401/Unauthorized", 366, "400/Bad Request", 262, "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 9942, "Assertion failed", 9150, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 408, "401/Unauthorized", 384, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 689, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 386, "401/Unauthorized", 303, "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 1062, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 410, "401/Unauthorized", 369, "Assertion failed", 283, "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 9944, "Assertion failed", 9325, "401/Unauthorized", 398, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 221, "", "", "", ""], "isController": false}, {"data": ["15 Login Request", 10000, 405, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 329, "400/Bad Request", 76, "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 9945, "Assertion failed", 9244, "401/Unauthorized", 393, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 308, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
