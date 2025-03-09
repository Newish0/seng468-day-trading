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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5903, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7169, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.9809, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.7453, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.3279, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.4215, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.3215, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.3749, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.6397, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.8246, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.5498, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50000, 0, 0.0, 914.0336200000082, 1, 6526, 736.0, 1889.9000000000015, 2335.9000000000015, 3315.0, 1737.5590770086183, 462.150737050841, 595.6838828906901], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 0, 0.0, 607.967399999999, 1, 4290, 277.0, 1689.0, 1939.9499999999998, 2522.8899999999976, 254.49177991550874, 66.35674339593831, 87.88028627144094], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 0, 0.0, 83.56280000000018, 1, 1815, 20.0, 197.90000000000055, 358.9499999999998, 1217.9399999999987, 270.7092582566324, 95.17122360584733, 92.68736041553872], "isController": false}, {"data": ["14 Register Request", 5000, 0, 0.0, 490.6502000000003, 2, 1966, 504.0, 877.9000000000005, 1033.9499999999998, 1369.9699999999993, 309.4059405940594, 52.87699180074257, 81.19591439124382], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 0, 0.0, 1462.3940000000005, 262, 4807, 1322.5, 2249.0, 2612.0, 4054.9799999999996, 211.2735570016057, 36.106320776641596, 100.39711175842982], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 0, 0.0, 1167.5129999999945, 6, 4353, 918.5, 2109.9000000000005, 2744.0, 3270.0, 219.85753231905724, 105.84937835282736, 76.56461269347463], "isController": false}, {"data": ["17 Add Money Request", 5000, 0, 0.0, 1865.0335999999982, 4, 6526, 1672.0, 3885.9000000000005, 4721.0, 5348.0, 229.63167080003674, 39.24369374024065, 87.36866144828694], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 0, 0.0, 1328.403799999996, 4, 4861, 945.0, 2664.600000000002, 3153.0, 4116.819999999996, 219.07724663716428, 40.22121324979187, 75.43711045327082], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 0, 0.0, 824.6878000000003, 1, 4483, 548.5, 2293.0, 2949.8999999999996, 3927.9399999999987, 233.38312173263628, 42.61976930078417, 80.36319883658514], "isController": false}, {"data": ["15 Login Request", 5000, 0, 0.0, 417.4628000000001, 1, 1968, 373.0, 897.0, 1053.0, 1543.9899999999998, 279.87685418415896, 96.0995443254968, 66.1427721802407], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 0, 0.0, 892.6608000000057, 1, 4588, 675.0, 2125.4000000000033, 2680.0, 3007.99, 223.42374547566914, 76.80191250726126, 78.02472113923767], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
