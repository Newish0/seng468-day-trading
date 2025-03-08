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

    var data = {"OkPercent": 61.95, "KoPercent": 38.05};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6124, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.087, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [1.0, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [1.0, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.932, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.028, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.997, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [1.0, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.052, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [1.0, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.028, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10000, 3805, 38.05, 88.22210000000004, 1, 900, 33.0, 292.0, 362.0, 552.9699999999993, 505.48450689986356, 123.76057568366778, 176.9485539194005], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 1000, 913, 91.3, 57.51999999999998, 1, 453, 33.0, 141.89999999999998, 212.94999999999993, 322.94000000000005, 68.3900971139379, 12.567882514361921, 24.022823057721244], "isController": false}, {"data": ["16 Get Stock Prices Request", 1000, 0, 0.0, 8.137999999999984, 1, 247, 4.0, 12.0, 23.0, 89.95000000000005, 67.91171477079797, 24.33945246179966, 23.655825551782684], "isController": false}, {"data": ["14 Register Request", 1000, 0, 0.0, 43.803000000000054, 3, 398, 21.0, 120.0, 166.94999999999993, 235.0, 67.43088334457181, 11.984785906945381, 18.552119331591367], "isController": false}, {"data": ["19 Place Stock Order Request", 1000, 0, 0.0, 380.62499999999994, 258, 900, 339.0, 549.9, 675.8999999999999, 783.9300000000001, 66.25149065853982, 11.775167285013913, 31.876542417516895], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1000, 972, 97.2, 66.53500000000004, 2, 406, 39.0, 161.0, 255.89999999999986, 374.0, 67.5401864109145, 30.542411015804404, 23.922153603268946], "isController": false}, {"data": ["17 Add Money Request", 1000, 0, 0.0, 90.96299999999997, 2, 563, 48.0, 230.0, 366.5499999999994, 485.9100000000001, 67.79201410073892, 12.048971256186022, 26.196052386278897], "isController": false}, {"data": ["18 Get Wallet Balance Request", 1000, 0, 0.0, 61.472999999999985, 2, 443, 36.0, 154.89999999999998, 224.79999999999973, 320.98, 67.80580417683754, 12.912238100081368, 23.75136671074044], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1000, 948, 94.8, 67.22999999999989, 2, 427, 36.0, 191.69999999999993, 264.94999999999993, 364.8800000000001, 67.76904310111141, 12.901796303198699, 23.738489851585797], "isController": false}, {"data": ["15 Login Request", 1000, 0, 0.0, 42.105000000000025, 2, 424, 19.0, 114.0, 154.0, 265.8800000000001, 67.87944610371979, 24.174893514118924, 16.858496809666033], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1000, 972, 97.2, 63.8290000000001, 2, 478, 39.0, 166.0, 223.94999999999993, 330.98, 67.6956404007582, 12.443965991402653, 24.04332309436772], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 3805, 100.0, 38.05], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10000, 3805, "Assertion failed", 3805, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 1000, 913, "Assertion failed", 913, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1000, 972, "Assertion failed", 972, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1000, 948, "Assertion failed", 948, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1000, 972, "Assertion failed", 972, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
