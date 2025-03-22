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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.57744, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5696666666666667, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.9873333333333333, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.9051666666666667, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.21116666666666667, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.5161666666666667, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.27796666666666664, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.3480666666666667, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.474, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.9565666666666667, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.5283, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150000, 0, 0.0, 1238.6361533333306, 0, 10340, 74.0, 935.0, 1258.0, 1545.9900000000016, 2063.983488132095, 548.4743587676298, 708.7435500515996], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["23 Get Stock Portfolio Request", 15000, 0, 0.0, 902.1546666666669, 1, 4538, 766.0, 2002.0, 2705.0, 3389.0, 252.51675027776844, 65.84176984781656, 86.5892924217619], "isController": false}, {"data": ["16 Get Stock Prices Request", 15000, 0, 0.0, 93.8471999999999, 0, 1060, 29.0, 300.0, 399.0, 628.0, 243.56580336120808, 85.62860274417471, 82.80639499776731], "isController": false}, {"data": ["14 Register Request", 15000, 0, 0.0, 311.0800000000002, 2, 1415, 242.0, 730.0, 924.0, 1081.9899999999998, 243.11971214626084, 41.54877893124574, 66.0091544701611], "isController": false}, {"data": ["19 Place Stock Order Request", 15000, 0, 0.0, 2052.83626666667, 268, 5759, 1969.0, 3449.0, 4240.0, 4648.909999999998, 237.16539914936678, 40.53119614369061, 112.12894423352095], "isController": false}, {"data": ["20 Get Stock Transactions Request", 15000, 0, 0.0, 996.7970666666736, 2, 5064, 878.0, 1968.0, 2378.0, 3386.99, 239.18485800392264, 115.15442870696666, 82.71845488076634], "isController": false}, {"data": ["17 Add Money Request", 15000, 0, 0.0, 3312.4976666666676, 1, 10340, 2197.5, 6852.9, 7872.899999999998, 9097.98, 238.70526265535736, 40.794356410827675, 90.24524417061856], "isController": false}, {"data": ["18 Get Wallet Balance Request", 15000, 0, 0.0, 1963.3309333333336, 3, 7615, 1648.0, 3819.0, 4461.949999999999, 6192.959999999999, 238.20488796430104, 43.73292864969589, 81.4490592643836], "isController": false}, {"data": ["22 Get Wallet Balance Request", 15000, 0, 0.0, 1518.6266000000098, 1, 7631, 830.0, 3719.0, 4614.0, 7125.0, 244.85398540670246, 44.714546163138046, 83.72257571599386], "isController": false}, {"data": ["15 Login Request", 15000, 0, 0.0, 221.58713333333498, 2, 1341, 177.0, 475.0, 579.0, 836.9899999999998, 243.47487339306585, 83.01324947145663, 61.384961165757694], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 15000, 0, 0.0, 1013.6040000000007, 1, 6054, 807.0, 2078.0, 2570.0, 4980.0, 242.60852688102477, 83.39668111535227, 84.13940121688393], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
