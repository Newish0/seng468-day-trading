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

    var data = {"OkPercent": 52.872, "KoPercent": 47.128};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.306765, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0635, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.42325, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.67215, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.15395, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.01775, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.4397, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.5668, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0487, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.6698, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.01205, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 47128, 47.128, 896.9570200000055, 0, 5881, 421.0, 1293.0, 1540.0, 1908.0, 1164.5375039303142, 273.2690969593926, 396.49026592213903], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 8668, 86.68, 802.830299999998, 2, 4208, 585.0, 1875.8999999999996, 2332.949999999999, 3048.9699999999993, 129.95620475899622, 24.4652581376951, 44.83212399608832], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 5020, 50.2, 367.52050000000025, 0, 3047, 152.0, 1106.0, 1496.0, 2037.9899999999998, 127.39827247942517, 46.24259945425765, 43.45433150145234], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 746.3229000000007, 4, 3876, 538.0, 1659.0, 2061.949999999999, 2903.0, 128.37794466910586, 22.817173759548112, 33.6865481978946], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 5009, 50.09, 1321.2092000000011, 0, 5785, 1143.5, 2525.8999999999996, 3078.7499999999945, 4299.98, 125.76876155500497, 24.95650169473406, 57.40474391908038], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 9687, 96.87, 945.7461999999999, 0, 4807, 767.0, 2081.8999999999996, 2559.949999999999, 3168.99, 126.90999543124015, 40.24691479818138, 44.08676013455632], "isController": false}, {"data": ["17 Add Money Request", 10000, 22, 0.22, 1299.5017000000016, 0, 5881, 1119.0, 2646.8999999999996, 3140.899999999998, 4004.9699999999993, 125.31956489047069, 22.396698984754874, 47.6189258194333], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 28, 0.28, 969.5563000000008, 1, 5132, 859.0, 2008.8999999999996, 2405.0, 3143.99, 124.65408491436264, 23.879364645920074, 42.8597628884533], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 8990, 89.9, 883.9711999999989, 0, 4394, 644.0, 2024.8999999999996, 2511.0, 3148.99, 129.17393270038104, 24.708841451107663, 44.41831111138022], "isController": false}, {"data": ["15 Login Request", 10000, 17, 0.17, 745.8242999999989, 0, 3871, 563.0, 1645.0, 2024.0, 2990.9199999999983, 127.78246313475938, 45.10875685233459, 30.147252317654427], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 9687, 96.87, 887.0876000000025, 1, 4244, 658.0, 1976.8999999999996, 2476.899999999998, 3110.99, 128.08525354475938, 24.013645982766132, 44.67791261863897], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 4983, 10.573332201663554, 4.983], "isController": false}, {"data": ["401/Unauthorized", 136, 0.2885757935834323, 0.136], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 91, 0.193091156000679, 0.091], "isController": false}, {"data": ["Assertion failed", 41918, 88.94500084875233, 41.918], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 47128, "Assertion failed", 41918, "400/Bad Request", 4983, "401/Unauthorized", 136, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 91, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 8668, "Assertion failed", 8650, "401/Unauthorized", 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 5020, "Assertion failed", 4974, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 29, "401/Unauthorized", 17, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 5009, "400/Bad Request", 4983, "401/Unauthorized", 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 9, "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 9687, "Assertion failed", 9654, "401/Unauthorized", 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 16, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 22, "401/Unauthorized", 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 5, "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 28, "401/Unauthorized", 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 6, "Assertion failed", 5, "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 8990, "Assertion failed", 8968, "401/Unauthorized", 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 5, "", "", "", ""], "isController": false}, {"data": ["15 Login Request", 10000, 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 9687, "Assertion failed", 9667, "401/Unauthorized", 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 3, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
