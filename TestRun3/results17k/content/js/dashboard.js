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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5974411764705883, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6059705882352941, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.9941470588235294, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.8913529411764706, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.1943235294117647, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.5933529411764706, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.2846470588235294, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.3800294117647059, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.5134705882352941, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.9479705882352941, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.5691470588235295, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 170000, 0, 0.0, 1156.104588235288, 1, 12615, 35.0, 667.0, 1027.0, 1592.7300000000432, 2163.593091774528, 574.9414184301542, 742.9216525754713], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 17000, 0, 0.0, 787.1875294117724, 1, 4755, 588.0, 1898.8999999999996, 2562.949999999999, 3264.0, 254.88402776736586, 66.45901895887371, 87.3977681951587], "isController": false}, {"data": ["16 Get Stock Prices Request", 17000, 0, 0.0, 81.02788235294113, 1, 1099, 36.0, 215.0, 302.0, 518.9900000000016, 249.70622796709753, 87.78734576968273, 84.89077934507198], "isController": false}, {"data": ["14 Register Request", 17000, 0, 0.0, 309.2698235294124, 2, 1139, 260.0, 657.0, 784.0, 905.0, 249.500998003992, 42.63933071357286, 67.73817369855877], "isController": false}, {"data": ["19 Place Stock Order Request", 17000, 0, 0.0, 2308.8099411764683, 284, 9011, 1859.5, 4306.9, 4943.949999999999, 6137.990000000002, 246.39466628016524, 42.10846347561417, 116.48926382799478], "isController": false}, {"data": ["20 Get Stock Transactions Request", 17000, 0, 0.0, 891.3882352941148, 2, 8188, 689.0, 1977.0, 2517.949999999999, 4458.470000000085, 247.90737014028642, 119.35384128824336, 85.73181720203722], "isController": false}, {"data": ["17 Add Money Request", 17000, 0, 0.0, 2922.8767647058817, 6, 12615, 1859.5, 6926.0, 7776.899999999998, 9679.0, 248.53074471506682, 42.4735159425163, 93.95668540850414], "isController": false}, {"data": ["18 Get Wallet Balance Request", 17000, 0, 0.0, 1692.5305294117638, 7, 10795, 1281.0, 3609.8999999999996, 4463.949999999999, 6780.0, 248.3274416430512, 45.591366239153935, 84.90705809127495], "isController": false}, {"data": ["22 Get Wallet Balance Request", 17000, 0, 0.0, 1407.3647647058785, 1, 9398, 904.5, 3929.0, 4713.899999999998, 6451.410000000094, 251.90783136993406, 46.00269967400163, 86.1312496527006], "isController": false}, {"data": ["15 Login Request", 17000, 0, 0.0, 234.3780000000009, 1, 1241, 185.0, 507.0, 640.0, 878.9900000000016, 249.66588829654432, 85.12087970968999, 62.94453091726513], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 17000, 0, 0.0, 926.2124117647021, 1, 8130, 673.5, 2061.0, 2724.0, 4795.81000000003, 249.1463075051661, 85.64404320490085, 86.40357591359752], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 170000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
