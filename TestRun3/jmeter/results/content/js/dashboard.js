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

    var data = {"OkPercent": 59.194, "KoPercent": 40.806};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.353405, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0026, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.8197, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.7439, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.39955, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [1.5E-4, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.36315, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.52155, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.00115, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.682, 500, 1500, "15 Login Request"], "isController": false}, {"data": [3.0E-4, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 40806, 40.806, 879.849940000011, 0, 5268, 496.0, 1307.9000000000015, 1537.0, 2059.980000000003, 1570.820439515559, 398.75404179462305, 533.9985062479383], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 9945, 99.45, 777.6876000000001, 0, 4151, 616.0, 1673.0, 2037.0, 2848.909999999998, 185.04468829222256, 33.190656168464685, 63.68903861766992], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 182, 1.82, 405.24820000000136, 0, 3686, 235.0, 958.8999999999996, 1391.0, 2750.9799999999996, 173.77704405248068, 66.47060181162568, 58.51743404618125], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 596.6886000000006, 3, 3522, 426.0, 1369.8999999999996, 1705.0, 2304.9799999999996, 177.67038590007817, 31.578134993959207, 46.62095216891124], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 242, 2.42, 1268.0055999999954, 0, 5171, 1106.0, 2415.0, 2738.899999999998, 3516.869999999997, 173.2051615138131, 33.09864372239543, 81.63867982484628], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 9994, 99.94, 928.1713999999994, 0, 4641, 765.0, 1828.0, 2204.949999999999, 3170.9699999999993, 176.27046940826003, 80.31209650587861, 60.8592903075479], "isController": false}, {"data": ["17 Add Money Request", 10000, 174, 1.74, 1369.2015000000008, 0, 5268, 1215.0, 2562.8999999999996, 2924.0, 3755.909999999998, 171.68266176798804, 35.02386657252734, 64.29829205259499], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 275, 2.75, 967.7840000000098, 0, 4127, 796.0, 1884.699999999999, 2322.899999999998, 3101.899999999998, 171.80949762902895, 35.89592008818122, 58.463751954333034], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 9965, 99.65, 843.7837000000017, 0, 4129, 675.0, 1739.0, 2184.0, 2952.9699999999993, 180.3068823136979, 35.395033362407816, 61.783315358991004], "isController": false}, {"data": ["15 Login Request", 10000, 34, 0.34, 739.9374000000003, 0, 3842, 515.0, 1616.0, 2103.0, 3223.9699999999993, 177.13850459674418, 63.034633068658884, 41.720477100419814], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 9995, 99.95, 901.991399999995, 0, 4629, 744.0, 1816.0, 2245.949999999999, 3086.9799999999996, 178.87807670291932, 33.46871701935461, 61.99601451260196], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 670, 1.6419154045973632, 0.67], "isController": false}, {"data": ["400/Bad Request", 139, 0.3406361809537813, 0.139], "isController": false}, {"data": ["401/Unauthorized", 270, 0.6616674018526687, 0.27], "isController": false}, {"data": ["Assertion failed", 39727, 97.35578101259618, 39.727], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 40806, "Assertion failed", 39727, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 670, "401/Unauthorized", 270, "400/Bad Request", 139, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 9945, "Assertion failed", 9895, "401/Unauthorized", 34, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 16, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 182, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 148, "401/Unauthorized", 34, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 242, "400/Bad Request", 139, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 69, "401/Unauthorized", 34, "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 9994, "Assertion failed", 9891, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 69, "401/Unauthorized", 34, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 174, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 142, "401/Unauthorized", 32, "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 275, "Assertion failed", 140, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 101, "401/Unauthorized", 34, "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 9965, "Assertion failed", 9899, "401/Unauthorized", 34, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 32, "", "", "", ""], "isController": false}, {"data": ["15 Login Request", 10000, 34, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 9995, "Assertion failed", 9902, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8888 failed to respond", 59, "401/Unauthorized", 34, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
