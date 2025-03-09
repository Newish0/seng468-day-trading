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

    var data = {"OkPercent": 64.708, "KoPercent": 35.292};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.413335, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4458, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.622, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.7007, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.0, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.3958, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.25785, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.3041, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.39475, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.613, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.39935, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 35292, 35.292, 1676.931129999987, 0, 24902, 12.0, 16960.700000000004, 20330.9, 22642.99, 1348.7268018990073, 642.2338967288317, 377.36144413657877], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 4476, 44.76, 434.8942000000002, 0, 2967, 197.0, 1254.8999999999996, 1510.0, 2006.9799999999996, 161.43352974412787, 63.658837350673984, 46.95488122023569], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 2583, 25.83, 343.43960000000214, 0, 2131, 193.0, 1006.8999999999996, 1202.949999999999, 1396.9899999999998, 218.67004876342088, 114.75208368639434, 61.22441047921541], "isController": false}, {"data": ["14 Register Request", 10000, 347, 3.47, 641.8596000000018, 4, 3546, 433.0, 1499.7999999999993, 2353.899999999998, 3058.9799999999996, 218.9093934020709, 52.89830051060616, 55.448830100315234], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 4209, 42.09, 11482.618099999983, 0, 24902, 13546.0, 21765.699999999997, 22702.0, 23614.98, 146.7588312126682, 79.22475965948283, 53.299754798096544], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 4751, 47.51, 544.288599999998, 0, 2946, 338.0, 1504.8999999999996, 1710.949999999999, 2096.9799999999996, 156.91935914133725, 86.87837254028905, 44.88307423658732], "isController": false}, {"data": ["17 Add Money Request", 10000, 3042, 30.42, 1019.9905000000016, 0, 3684, 878.0, 2211.0, 2523.949999999999, 3099.9299999999985, 217.9171479003683, 119.5875679629105, 62.637155861154085], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 4136, 41.36, 810.2257000000023, 0, 3072, 706.0, 1677.0, 1972.0, 2491.0, 219.5630694917115, 106.06133442886156, 58.73918909183225], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 5006, 50.06, 483.51130000000126, 0, 2788, 254.0, 1370.8999999999996, 1648.8499999999967, 2101.0, 158.49116411760045, 60.60098487399953, 45.159704612092874], "isController": false}, {"data": ["15 Login Request", 10000, 1687, 16.87, 535.4298999999983, 0, 2900, 400.0, 1248.8999999999996, 1433.0, 2131.679999999993, 219.2790106131041, 126.82622583819402, 44.60820322778704], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 5055, 50.55, 473.05379999999826, 0, 2878, 267.0, 1331.0, 1582.0, 1998.8999999999978, 157.81831955053343, 81.2725661702623, 44.38328916064327], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 1316, 3.728890400090672, 1.316], "isController": false}, {"data": ["401/Unauthorized", 10822, 30.66417318372436, 10.822], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 12710, 36.013827496316445, 12.71], "isController": false}, {"data": ["Assertion failed", 10444, 29.593108919868527, 10.444], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 35292, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 12710, "401/Unauthorized", 10822, "Assertion failed", 10444, "400/Bad Request", 1316, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 4476, "Assertion failed", 2127, "401/Unauthorized", 1469, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 880, "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 2583, "401/Unauthorized", 1458, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1125, "", "", "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 10000, 347, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 347, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 4209, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1920, "401/Unauthorized", 1268, "400/Bad Request", 1021, "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 4751, "Assertion failed", 2226, "401/Unauthorized", 1394, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1131, "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 10000, 3042, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1994, "401/Unauthorized", 1048, "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 4136, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1585, "401/Unauthorized", 1357, "Assertion failed", 1194, "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 5006, "Assertion failed", 2521, "401/Unauthorized", 1449, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1036, "", "", "", ""], "isController": false}, {"data": ["15 Login Request", 10000, 1687, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1392, "400/Bad Request", 295, "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 5055, "Assertion failed", 2376, "401/Unauthorized", 1379, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:8080 failed to respond", 1300, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
