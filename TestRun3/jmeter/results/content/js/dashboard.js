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

    var data = {"OkPercent": 85.584896952565, "KoPercent": 14.415103047434991};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4871929849863709, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.8710505131817267, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.70835, 500, 1500, "14 Register Request"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.33032987171655465, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.31981208324914123, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.45766578787264245, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.1, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.7113556778389195, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 69337, 9995, 14.415103047434991, 1018.8116445765035, 0, 6089, 542.0, 1284.9000000000015, 1544.0, 1956.0, 1334.6101283852713, 366.98926644034026, 453.40641045151386], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 5, 0, 0.0, 1600.8, 1123, 2262, 1293.0, 2262.0, 2262.0, 2262.0, 1.5413070283600494, 0.4124200446979038, 0.5313294736436498], "isController": false}, {"data": ["16 Get Stock Prices Request", 9938, 40, 0.4024954719259408, 343.6854497886909, 0, 2808, 175.0, 932.1000000000004, 1363.0499999999993, 2179.4400000000023, 209.37091813087264, 76.43806059863903, 71.39108865424726], "isController": false}, {"data": ["14 Register Request", 10000, 5, 0.05, 650.7955999999981, 8, 3441, 507.5, 1360.0, 1679.0, 2302.9699999999993, 205.63015360572473, 36.73691131942588, 53.93058424024799], "isController": false}, {"data": ["Debug Sampler", 5, 0, 0.0, 33.2, 1, 147, 5.0, 147.0, 147.0, 147.0, 1.8733608092918694, 2.8982208926564255, 0.0], "isController": false}, {"data": ["19 Place Stock Order Request", 9822, 20, 0.20362451639177356, 1651.2412950519206, 0, 5798, 1412.0, 3212.7000000000007, 3749.0, 4827.540000000001, 210.97173296674973, 38.288146935948106, 100.04355893305912], "isController": false}, {"data": ["20 Get Stock Transactions Request", 9802, 9797, 99.9489900020404, 1012.3249336870005, 0, 4363, 835.0, 2189.7000000000007, 2597.0, 3153.0, 213.1703710147449, 97.5448358189074, 73.92647360651995], "isController": false}, {"data": ["17 Add Money Request", 9898, 36, 0.36370984037179227, 1647.1467973327942, 0, 6089, 1362.0, 3283.0, 3842.0499999999993, 4580.02, 208.0810628994282, 38.37705035422974, 78.87495434167928], "isController": false}, {"data": ["18 Get Wallet Balance Request", 9862, 40, 0.4055972419387548, 1190.116203609812, 0, 4514, 947.5, 2492.0, 2922.8500000000004, 3501.0, 208.74166578473913, 41.299219824849196, 71.58053266218649], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5, 0, 0.0, 2181.6, 1084, 3120, 2148.0, 3120.0, 3120.0, 3120.0, 1.538935056940597, 0.29155605570944904, 0.5290089258233303], "isController": false}, {"data": ["15 Login Request", 9995, 57, 0.5702851425712856, 650.8371185592788, 0, 3734, 485.0, 1371.0, 1791.199999999999, 2502.2399999999943, 209.89520989520992, 75.49733135670635, 49.32125635250635], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5, 0, 0.0, 2392.0, 2151, 2725, 2305.0, 2725.0, 2725.0, 2725.0, 1.0510826150935462, 0.3684947840025226, 0.366441888269918], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 238, 2.3811905952976486, 0.34325107806798677], "isController": false}, {"data": ["Assertion failed", 9757, 97.61880940470235, 14.071851969367005], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 69337, 9995, "Assertion failed", 9757, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 238, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["16 Get Stock Prices Request", 9938, 40, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 10000, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["19 Place Stock Order Request", 9822, 20, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 9802, 9797, "Assertion failed", 9757, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 40, "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 9898, 36, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 36, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 9862, 40, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["15 Login Request", 9995, 57, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 57, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
