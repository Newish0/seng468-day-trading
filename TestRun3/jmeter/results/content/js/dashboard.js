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

    var data = {"OkPercent": 99.596, "KoPercent": 0.404};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.741635, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7949, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.9884, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.78385, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.46595, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.71, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.59415, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.6847, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.7711, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.89395, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.72935, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 404, 0.404, 584.4688399999997, 0, 5316, 221.0, 672.0, 782.0, 918.0, 1530.573199663274, 406.9784422352109, 524.6870396322798], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 0, 0.0, 478.15470000000107, 1, 3174, 306.0, 1099.4999999999982, 1468.0, 2282.9699999999993, 188.39132646332962, 49.1215665680752, 65.04966687114975], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 0, 0.0, 82.38940000000035, 0, 1961, 24.0, 220.0, 333.0, 880.0, 170.50007672503455, 59.94143322364495, 58.372482859414156], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 541.8725999999997, 1, 3383, 236.0, 1772.699999999999, 2128.949999999999, 2790.99, 168.5459540543729, 28.80424019483912, 44.226688777789015], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 1016.4827000000026, 265, 4408, 789.0, 2089.699999999999, 2330.949999999999, 3025.9199999999983, 168.5601591207902, 28.80666781849442, 80.09522793020767], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 202, 2.02, 609.7762, 2, 3538, 476.0, 1370.0, 1669.0, 2220.0, 170.21566324533183, 81.821937926603, 59.27246833456739], "isController": false}, {"data": ["17 Add Money Request", 10000, 0, 0.0, 929.7378999999995, 5, 5316, 656.0, 2364.0, 2843.0, 4138.909999999998, 168.78206859303268, 28.84459180056711, 64.2125281391355], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 0, 0.0, 762.8769999999998, 3, 4374, 509.0, 1833.8999999999996, 2407.0, 3678.99, 168.66535107692826, 30.9659042992798, 58.07376987615746], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 0, 0.0, 514.2082999999973, 1, 3095, 306.0, 1334.8999999999996, 1595.8999999999978, 2275.0, 178.24041066590618, 32.54976249465279, 61.37059286659596], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 345.5549000000004, 2, 3039, 181.0, 1079.0, 1385.0, 2115.99, 170.22145811701023, 58.443326760302654, 40.228118031559056], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 202, 2.02, 563.6347000000029, 1, 3201, 389.5, 1227.8999999999996, 1848.949999999999, 2332.819999999996, 172.6966583196615, 59.364476297383646, 60.305049083628354], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 404, 100.0, 0.404], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 404, "Assertion failed", 404, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 202, "Assertion failed", 202, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 202, "Assertion failed", 202, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
