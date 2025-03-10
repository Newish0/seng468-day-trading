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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6039, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7122, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.9893, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.879, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.2422, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.4695, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.2504, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.444, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.6109, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.9419, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.4996, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50000, 0, 0.0, 967.9284799999988, 1, 6260, 785.0, 2031.0, 2476.0, 2730.0, 1750.6389832288785, 465.62969116540035, 600.1680408270894], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 5000, 0, 0.0, 681.4567999999979, 1, 3582, 321.0, 1841.9000000000005, 2501.95, 3117.8799999999974, 257.82498839787553, 67.22585146702419, 89.0312991478884], "isController": false}, {"data": ["16 Get Stock Prices Request", 5000, 0, 0.0, 76.4441999999998, 1, 1779, 22.0, 189.0, 264.0, 877.9299999999985, 277.97854005670763, 97.72683048868629, 95.17626879829878], "isController": false}, {"data": ["14 Register Request", 5000, 0, 0.0, 346.37759999999963, 3, 1890, 334.0, 643.9000000000005, 760.9499999999998, 1213.9399999999987, 318.55249745158005, 54.44012407619776, 83.59620136101555], "isController": false}, {"data": ["19 Place Stock Order Request", 5000, 0, 0.0, 1676.8507999999988, 338, 4086, 1537.5, 2650.0, 2931.0, 3492.959999999999, 213.5930624973301, 36.50272064163356, 101.49933986394123], "isController": false}, {"data": ["20 Get Stock Transactions Request", 5000, 0, 0.0, 1181.6051999999981, 16, 4538, 997.0, 2411.0, 2573.0, 2840.0, 217.66575247050628, 104.79415621871055, 75.80133306669279], "isController": false}, {"data": ["17 Add Money Request", 5000, 0, 0.0, 2000.8662000000068, 10, 6260, 1935.0, 3622.800000000001, 4073.8499999999995, 4642.99, 246.2568951930654, 42.08491861209614, 93.69411122808314], "isController": false}, {"data": ["18 Get Wallet Balance Request", 5000, 0, 0.0, 1311.946600000001, 24, 4601, 1067.0, 2601.9000000000005, 3436.95, 4013.9799999999996, 219.57753282684118, 40.313062667427864, 75.60937911707873], "isController": false}, {"data": ["22 Get Wallet Balance Request", 5000, 0, 0.0, 934.8482000000006, 2, 5278, 682.0, 2139.0, 2501.95, 2744.959999999999, 234.03856955626287, 42.73946533888785, 80.58889589379329], "isController": false}, {"data": ["15 Login Request", 5000, 0, 0.0, 298.818999999999, 2, 2004, 260.0, 483.0, 640.8999999999996, 1757.0, 286.25407912062747, 98.28925169605543, 67.64988979217955], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 5000, 0, 0.0, 1170.0701999999999, 8, 3928, 899.5, 2612.0, 3266.95, 3700.909999999998, 225.58087074216107, 77.54342431761786, 78.77803899729304], "isController": false}]}, function(index, item){
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
