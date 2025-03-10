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

    var data = {"OkPercent": 99.984, "KoPercent": 0.016};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.705395, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7524, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.9742, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.7683, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.49545, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.66735, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.4819, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.63735, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.7231, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.8237, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.7302, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 16, 0.016, 641.9689100000124, 0, 5346, 290.0, 875.0, 983.0, 1267.9900000000016, 678.2465968977001, 180.39416804364856, 232.5058345103738], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 0, 0.0, 505.30829999999855, 1, 3081, 448.0, 1036.8999999999996, 1472.0, 1904.9899999999998, 72.54367129011666, 18.91519554146596, 25.048614177844435], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 0, 0.0, 104.79540000000006, 0, 2840, 21.0, 290.0, 477.9499999999989, 1192.949999999999, 71.09088970248463, 24.992890911029754, 24.338708933903245], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 563.7617000000017, 2, 3317, 295.0, 1458.8999999999996, 1857.949999999999, 2539.959999999999, 70.91494461542825, 12.119253230175726, 18.608178421114214], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 992.7727999999993, 271, 4210, 783.0, 1934.0, 2260.0, 3364.9799999999996, 70.45230379033394, 12.040188636043398, 33.4770289713083], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 8, 0.08, 732.814800000001, 2, 4149, 522.0, 1734.0, 2287.899999999998, 3221.9799999999996, 70.74587374691372, 34.058169026041554, 24.63511572035217], "isController": false}, {"data": ["17 Add Money Request", 10000, 0, 0.0, 1182.3501000000017, 2, 5346, 859.5, 2565.8999999999996, 3491.949999999999, 4342.0, 70.38882788523804, 12.029340703043612, 26.77917523430681], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 0, 0.0, 764.2048000000007, 3, 3863, 615.0, 1635.7999999999993, 2036.0, 3085.0, 70.42551093708185, 12.92968364860487, 24.24845938692832], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 0, 0.0, 548.9806999999994, 1, 3390, 508.0, 1116.0, 1445.949999999999, 2017.9899999999998, 71.6157955798731, 13.078275169371357, 24.658290546625466], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 442.79680000000025, 1, 3552, 197.0, 1189.8999999999996, 1443.949999999999, 2488.99, 71.1207203106553, 24.4183755827454, 16.807826479666588], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 8, 0.08, 581.9037000000002, 1, 3385, 447.0, 1315.8999999999996, 1847.949999999999, 2825.99, 70.9748394194258, 24.39760105042762, 24.784157473206996], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 16, 100.0, 0.016], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 16, "Assertion failed", 16, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 8, "Assertion failed", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 8, "Assertion failed", 8, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
