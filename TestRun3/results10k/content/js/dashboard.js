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

    var data = {"OkPercent": 99.956, "KoPercent": 0.044};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.715535, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.75255, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.96045, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.8224, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.45665, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.6979, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.4937, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.65785, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.7303, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.86485, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.7187, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 44, 0.044, 654.1653699999973, 0, 6117, 249.0, 699.0, 792.0, 1388.0, 643.4178355424012, 171.12737235193347, 220.56638614319266], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 0, 0.0, 554.5884000000008, 1, 5501, 423.0, 1249.8999999999996, 1695.0, 2536.9699999999993, 69.94474365251452, 18.237545464083375, 24.151230098534658], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 0, 0.0, 136.63839999999982, 0, 4089, 31.0, 308.0, 634.9499999999989, 1872.9699999999993, 67.11589572874439, 23.5954320921367, 22.977828211411715], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 447.2666, 2, 5423, 280.0, 1049.0, 1244.949999999999, 1873.9599999999991, 66.98372295532185, 11.447413590997389, 17.576620482785184], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 1077.5287999999932, 266, 6117, 809.0, 2084.8999999999996, 2462.0, 3429.9799999999996, 66.69378880744836, 11.397864298147914, 31.6910843222077], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 22, 0.22, 713.691900000001, 2, 6074, 499.0, 1516.0, 1888.0, 2884.8899999999976, 67.18398333837214, 32.33992891094763, 23.394794868403373], "isController": false}, {"data": ["17 Add Money Request", 10000, 0, 0.0, 1183.7594000000042, 1, 5091, 806.0, 2566.8999999999996, 2844.949999999999, 3553.9799999999996, 67.02592562803292, 11.454625961822034, 25.49977122166479], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 0, 0.0, 809.6442999999997, 3, 5510, 539.0, 1770.0, 2153.949999999999, 2879.9699999999993, 66.77082916015652, 12.258706916122485, 22.990102841683026], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 0, 0.0, 620.423900000003, 1, 5789, 421.0, 1509.0, 1905.949999999999, 2895.9799999999996, 68.70963309055931, 12.547559949154872, 23.65765935266937], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 344.3722999999987, 1, 5426, 175.0, 871.0, 988.0, 1915.9899999999998, 67.07852883370562, 23.030541640254494, 15.852542947028084], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 22, 0.22, 653.7397000000036, 1, 5494, 467.0, 1521.0, 1981.0, 2766.9799999999996, 67.990209409845, 23.37163448463421, 23.74193545816902], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 44, 100.0, 0.044], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 44, "Assertion failed", 44, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 22, "Assertion failed", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 22, "Assertion failed", 22, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
