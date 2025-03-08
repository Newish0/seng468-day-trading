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

    var data = {"OkPercent": 57.642, "KoPercent": 42.358};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.24656, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0032, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.6908, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.5424, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.1039, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [5.0E-4, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.2719, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.3244, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0018, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.5256, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0011, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50000, 21179, 42.358, 1319.867800000002, 0, 6176, 1212.0, 2817.9000000000015, 3447.9000000000015, 4457.930000000011, 1346.112427309929, 357.91738634604513, 451.8944376531203], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 4951, 99.02, 991.6196000000019, 0, 5244, 611.0, 2368.9000000000005, 2896.95, 4028.9799999999996, 177.71459036786922, 32.75352791229785, 60.65575989648125], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 179, 3.58, 616.0141999999989, 0, 3228, 304.5, 1657.9000000000005, 2040.0, 2382.0, 175.68517217146874, 68.28505193692902, 58.49931921995783], "isController": false}, {"data": ["14 Register Request", 5000, 0, 0.0, 984.3053999999986, 4, 4060, 955.5, 1940.9000000000005, 2236.0, 3045.8899999999976, 214.65676383462844, 38.151885759670286, 56.32354509670287], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 348, 6.96, 2276.4697999999953, 0, 5492, 2177.0, 3658.0, 4042.95, 4606.98, 157.1486940943521, 31.573720171213502, 73.40737778742496], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 4989, 99.78, 1474.2384000000036, 0, 5027, 1327.5, 2841.600000000002, 3378.8499999999995, 4250.939999999999, 162.43786751567526, 74.11154735266885, 55.293754923897865], "isController": false}, {"data": ["17 Add Money Request", 5000, 302, 6.04, 1789.0510000000006, 0, 6176, 1650.0, 3522.7000000000016, 4096.95, 5173.309999999985, 158.5188003297191, 41.171635983371374, 57.21853748573331], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 370, 7.4, 1528.2335999999991, 0, 5324, 1354.0, 3039.9000000000005, 3689.8499999999995, 4391.9299999999985, 157.68393831404333, 34.09674944416412, 53.12236372165631], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 4970, 99.4, 1254.0370000000016, 0, 5561, 1009.0, 2608.9000000000005, 3240.95, 4299.98, 174.89244114869356, 35.77151614257232, 59.29403709687293], "isController": false}, {"data": ["15 Login Request", 5000, 81, 1.62, 995.3914000000008, 0, 4454, 859.0, 2062.800000000001, 2397.7999999999993, 3311.6899999999932, 198.71234401080994, 74.95414091685876, 46.20054236050394], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 4989, 99.78, 1289.3176000000017, 0, 5311, 1095.5, 2549.800000000001, 3150.95, 4094.99, 171.6974005013564, 33.19296400149377, 58.970612380241064], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 211, 0.9962698899853628, 0.422], "isController": false}, {"data": ["401/Unauthorized", 645, 3.045469568912602, 1.29], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 702, 3.3146040889560413, 1.404], "isController": false}, {"data": ["Assertion failed", 19621, 92.64365645214599, 39.242], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50000, 21179, "Assertion failed", 19621, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 702, "401/Unauthorized", 645, "400/Bad Request", 211, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 4951, "Assertion failed", 4851, "401/Unauthorized", 81, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 19, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 179, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 98, "401/Unauthorized", 81, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 348, "400/Bad Request", 211, "401/Unauthorized", 80, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 57, "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 4989, "Assertion failed", 4834, "401/Unauthorized", 81, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 74, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 5000, 302, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 221, "401/Unauthorized", 81, "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 370, "Assertion failed", 221, "401/Unauthorized", 79, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 70, "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 4970, "Assertion failed", 4851, "401/Unauthorized", 81, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 38, "", "", "", ""], "isController": false}, {"data": ["15 Login Request", 5000, 81, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 81, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 4989, "Assertion failed", 4864, "401/Unauthorized", 81, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 44, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
