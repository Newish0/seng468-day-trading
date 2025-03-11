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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.69427, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.78215, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.9622, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.8373, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.41375, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.6589, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.42075, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.56085, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.7125, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.8658, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.7285, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 0, 0.0, 708.3186800000022, 0, 5463, 347.0, 1218.800000000003, 1524.0, 2087.9900000000016, 1614.9349181227997, 429.5312266591438, 553.6065975642745], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 10000, 0, 0.0, 539.0471999999951, 1, 2981, 385.0, 1283.8999999999996, 1516.949999999999, 2428.0, 193.16952557564517, 50.36744465693092, 66.6995318959106], "isController": false}, {"data": ["16 Get Stock Prices Request", 10000, 0, 0.0, 127.26569999999934, 0, 2838, 32.0, 307.89999999999964, 548.0, 1650.0, 182.1692716872518, 64.04388457754946, 62.36755368870004], "isController": false}, {"data": ["14 Register Request", 10000, 0, 0.0, 430.686199999999, 2, 2909, 233.0, 1208.0, 1468.0, 1736.0, 181.21194549144678, 30.968838340823428, 47.55026224766237], "isController": false}, {"data": ["19 Place Stock Order Request", 10000, 0, 0.0, 1166.5278999999991, 266, 3855, 971.0, 2150.8999999999996, 2446.949999999999, 3055.99, 177.20442302239863, 30.283959012616954, 84.20274830216012], "isController": false}, {"data": ["20 Get Stock Transactions Request", 10000, 0, 0.0, 718.5222000000014, 3, 3628, 572.0, 1579.0, 1832.8499999999967, 2591.9699999999993, 178.46944603083952, 85.92327821601943, 62.14659912527663], "isController": false}, {"data": ["17 Add Money Request", 10000, 0, 0.0, 1454.7457000000065, 2, 5463, 1067.5, 3224.8999999999996, 3540.949999999999, 4235.869999999997, 181.16598427479255, 30.96098364071162, 68.92394411369071], "isController": false}, {"data": ["18 Get Wallet Balance Request", 10000, 0, 0.0, 1000.2894000000026, 2, 4125, 767.0, 2355.8999999999996, 2589.949999999999, 3297.9799999999996, 179.18256911967603, 32.896799799315524, 61.69499081129388], "isController": false}, {"data": ["22 Get Wallet Balance Request", 10000, 0, 0.0, 658.183900000002, 1, 4145, 432.0, 1579.0, 1876.949999999999, 2877.9699999999993, 188.77185034167704, 34.47298438856798, 64.99671050302979], "isController": false}, {"data": ["15 Login Request", 10000, 0, 0.0, 361.8729000000015, 2, 2867, 205.0, 970.0, 1326.8999999999978, 1764.9899999999998, 182.01343259132526, 62.491948038577746, 43.01489324912178], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 10000, 0, 0.0, 626.0457000000006, 1, 3744, 481.0, 1348.0, 1588.949999999999, 2494.99, 181.60355942976483, 62.42622355398166, 63.41530676813766], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
