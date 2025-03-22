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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6142375, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.995125, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.9853333333333333, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.23675, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.5730416666666667, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.29791666666666666, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.42004166666666665, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.504625, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.9887916666666666, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.54075, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 120000, 0, 0.0, 893.2267916666625, 0, 7323, 68.0, 1099.0, 1311.9500000000007, 2037.9800000000032, 2003.8741567029592, 532.4978878435809, 688.0724446168844], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 12000, 0, 0.0, 804.1159999999998, 1, 5019, 762.5, 1715.8999999999996, 2104.0, 3029.0, 246.64460567693666, 64.31065401927938, 84.57168140967669], "isController": false}, {"data": ["16 Get Stock Prices Request", 12000, 0, 0.0, 51.57941666666683, 0, 771, 18.0, 135.0, 216.9499999999989, 497.97999999999956, 252.50931128085347, 88.77280474717504, 85.8428501067904], "isController": false}, {"data": ["14 Register Request", 12000, 0, 0.0, 176.34383333333386, 2, 1077, 152.0, 343.0, 431.9499999999989, 576.9899999999998, 251.0460251046025, 42.90337343096235, 68.1571570998954], "isController": false}, {"data": ["19 Place Stock Order Request", 12000, 0, 0.0, 1728.444583333339, 338, 6824, 1564.0, 2770.0, 3394.949999999999, 4755.99, 238.2890843741933, 40.7232321928553, 112.65632291397763], "isController": false}, {"data": ["20 Get Stock Transactions Request", 12000, 0, 0.0, 917.4186666666631, 2, 6197, 821.0, 1888.8999999999996, 2266.0, 4111.0, 241.20118188579124, 116.12517838837411, 83.41183625706016], "isController": false}, {"data": ["17 Add Money Request", 12000, 0, 0.0, 1718.8805000000093, 4, 7323, 1679.0, 2979.0, 3585.949999999999, 5383.99, 240.97837219109584, 41.18282727875174, 91.10068911028777], "isController": false}, {"data": ["18 Get Wallet Balance Request", 12000, 0, 0.0, 1208.1951666666623, 3, 5178, 1135.0, 2053.699999999999, 2524.0, 3750.99, 239.61661341853036, 43.99211261980831, 81.92786073532349], "isController": false}, {"data": ["22 Get Wallet Balance Request", 12000, 0, 0.0, 1188.279000000002, 1, 6761, 1040.0, 2428.0, 3768.949999999999, 5344.869999999997, 243.55097318909705, 44.476593736680805, 83.27306662387612], "isController": false}, {"data": ["15 Login Request", 12000, 0, 0.0, 162.6977499999992, 2, 854, 135.0, 331.0, 405.0, 582.0, 252.4402558061259, 86.06589775380763, 63.64405480188699], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 12000, 0, 0.0, 976.3129999999966, 1, 6190, 872.0, 1936.8999999999996, 2516.7999999999956, 4121.99, 242.1258650955388, 83.23076612659148, 83.96805987823086], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 120000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
