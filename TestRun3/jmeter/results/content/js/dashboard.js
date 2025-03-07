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

    var data = {"OkPercent": 85.56206866680142, "KoPercent": 14.437931333198579};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.46711039242297364, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8342245989304813, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.7056, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.3032153032153032, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.3078904829258436, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.42476171162036097, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.6827520545199439, 500, 1500, "15 Login Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 69262, 10000, 14.437931333198579, 1064.1083277988034, 0, 6233, 749.0, 2251.9000000000015, 2532.9500000000007, 3314.9900000000016, 1410.4302848881014, 389.41578625501455, 478.86111180050705], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["16 Get Stock Prices Request", 9911, 13, 0.1311673897689436, 417.6840883866405, 0, 2424, 260.0, 1164.0, 1428.0, 1993.5199999999968, 225.94838592011672, 81.47185939779774, 77.25454494289167], "isController": false}, {"data": ["14 Register Request", 10000, 22, 0.22, 614.0529000000021, 8, 2995, 543.0, 1116.8999999999996, 1432.8499999999967, 2082.99, 221.5231934783572, 40.2698879369545, 58.00020196684905], "isController": false}, {"data": ["19 Place Stock Order Request", 9828, 43, 0.43752543752543754, 1766.078958078956, 0, 6152, 1622.0, 3391.0, 3875.5499999999993, 4653.419999999998, 226.2951876583007, 42.043995006332025, 107.05839047749252], "isController": false}, {"data": ["20 Get Stock Transactions Request", 9785, 9785, 100.0, 972.6056208482366, 0, 4544, 745.0, 2277.3999999999996, 2595.699999999999, 3325.8999999999796, 233.37626407174204, 108.13566374201012, 80.63455693391052], "isController": false}, {"data": ["17 Add Money Request", 9898, 36, 0.36370984037179227, 1714.7436855930512, 0, 6233, 1420.5, 3397.0, 3934.0, 5357.02, 223.6229723012968, 41.24349399597849, 84.76684730270887], "isController": false}, {"data": ["18 Get Wallet Balance Request", 9862, 34, 0.3447576556479416, 1322.638511458126, 0, 4561, 1021.0, 2874.7000000000007, 3183.0, 3738.370000000001, 223.06665761914456, 43.885165032457984, 76.53987235925449], "isController": false}, {"data": ["15 Login Request", 9978, 67, 0.6714772499498898, 654.611244738424, 0, 2856, 558.0, 1263.0, 1596.0999999999985, 2190.6299999999974, 226.6748449533156, 81.91659780435721, 53.209933139666965], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 291, 2.91, 0.42014380179607863], "isController": false}, {"data": ["Assertion failed", 9709, 97.09, 14.017787531402501], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 69262, 10000, "Assertion failed", 9709, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 291, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["16 Get Stock Prices Request", 9911, 13, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 10000, 22, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 9828, 43, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 43, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["20 Get Stock Transactions Request", 9785, 9785, "Assertion failed", 9709, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 76, "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 9898, 36, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 36, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 9862, 34, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["15 Login Request", 9978, 67, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:9090 failed to respond", 67, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
