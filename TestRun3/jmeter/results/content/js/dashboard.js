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

    var data = {"OkPercent": 94.031, "KoPercent": 5.969};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.72302, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8471, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.97945, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.73075, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.4914, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.5868, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.65865, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.78235, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.7736, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.805, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.5751, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 5969, 5.969, 549.1959399999943, 1, 3395, 250.0, 797.0, 979.9500000000007, 1488.0, 1908.5790628876803, 505.68286871361767, 654.2690664066228], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 0, 0.0, 415.51609999999823, 1, 2739, 258.0, 1085.0, 1376.949999999999, 1802.9899999999998, 226.223871142883, 58.98610702651344, 78.11287139597096], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 0, 0.0, 112.94069999999941, 1, 1975, 46.0, 239.0, 391.8499999999967, 1256.9699999999993, 218.0787264202377, 76.66830225711482, 74.66153074228546], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 671.1194999999983, 2, 3395, 344.0, 1732.0, 1990.0, 2597.99, 217.15526601520088, 37.11149565689468, 56.98183869435397], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 970.9759999999957, 265, 3102, 803.0, 1759.0, 1982.0, 2274.99, 214.44501629782124, 36.64831821495969, 101.89847083949863], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 2765, 27.65, 516.7965999999996, 1, 2753, 330.0, 1169.0, 1518.949999999999, 2197.0, 217.2401807438304, 102.36022121839156, 75.6473375518661], "isController": false}, {"data": ["17 Add Money Request", 10000, 0, 0.0, 761.2854999999979, 4, 2979, 619.0, 1547.0, 1873.949999999999, 2409.9799999999996, 215.28525296017224, 36.79191334768568, 81.90449660252959], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 0, 0.0, 546.7891999999998, 2, 2964, 387.0, 1168.0, 1425.8499999999967, 2165.899999999998, 215.31306519679615, 39.53013306347429, 74.13521105390362], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 439, 4.39, 469.27029999999894, 1, 2657, 306.5, 1102.0, 1441.8999999999978, 2220.0, 223.26910625376766, 40.7823480304874, 76.87458398686061], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 530.1182000000018, 2, 3316, 253.0, 1446.0, 1737.8999999999978, 2535.99, 217.94564435629755, 74.82880625040865, 51.50668548264063], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 2765, 27.65, 497.1473000000005, 1, 2954, 316.0, 1174.8999999999996, 1506.0, 2008.0, 220.35653687666644, 75.74755955135409, 76.94770646718891], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 5969, 100.0, 5.969], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 5969, "Assertion failed", 5969, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 2765, "Assertion failed", 2765, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 439, "Assertion failed", 439, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 2765, "Assertion failed", 2765, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
