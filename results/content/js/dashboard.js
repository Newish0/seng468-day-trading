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

    var data = {"OkPercent": 6.896551724137931, "KoPercent": 93.10344827586206};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.06896551724137931, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "27 Invalid Payload Example"], "isController": false}, {"data": [0.0, 500, 1500, "4 Login Request"], "isController": false}, {"data": [0.0, 500, 1500, "11 Place Stock Order Request"], "isController": false}, {"data": [0.0, 500, 1500, "19 Place Stock Order Request"], "isController": false}, {"data": [0.0, 500, 1500, "8 Add Apple Stock Request"], "isController": false}, {"data": [0.0, 500, 1500, "9 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0, 500, 1500, "13 Get Stock Transactions Request"], "isController": false}, {"data": [0.0, 500, 1500, "23 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0, 500, 1500, "16 Get Stock Prices Request"], "isController": false}, {"data": [0.0, 500, 1500, "3 Failed Login Request"], "isController": false}, {"data": [0.0, 500, 1500, "10 Place Stock Order Request"], "isController": false}, {"data": [0.0, 500, 1500, "17 Add Money Request"], "isController": false}, {"data": [0.0, 500, 1500, "1 Register Request"], "isController": false}, {"data": [0.0, 500, 1500, "14 Register Request"], "isController": false}, {"data": [0.0, 500, 1500, "6 Add Google Stock Request"], "isController": false}, {"data": [0.0, 500, 1500, "2 Failed Register Request"], "isController": false}, {"data": [0.0, 500, 1500, "22 Get Wallet Balance Request"], "isController": false}, {"data": [0.0, 500, 1500, "7 Create Apple Stock Request"], "isController": false}, {"data": [0.0, 500, 1500, "15 Login Request"], "isController": false}, {"data": [0.0, 500, 1500, "25 Get Stock Transactions Request"], "isController": false}, {"data": [0.0, 500, 1500, "21 Get Wallet Transactions Request"], "isController": false}, {"data": [0.0, 500, 1500, "12 Get Stock Portfolio Request"], "isController": false}, {"data": [0.0, 500, 1500, "26 Invalid Token"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0, 500, 1500, "20 Get Stock Transactions Request"], "isController": false}, {"data": [0.0, 500, 1500, "18 Get Wallet Balance Request"], "isController": false}, {"data": [0.0, 500, 1500, "5 Create Google Stock Request"], "isController": false}, {"data": [0.0, 500, 1500, "24 Cancel Stock Order Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 29, 27, 93.10344827586206, 2.9655172413793105, 2, 27, 2.0, 3.0, 15.0, 27.0, 2.1865339666742063, 5.241835251262912, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["27 Invalid Payload Example", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["4 Login Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["11 Place Stock Order Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["19 Place Stock Order Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["8 Add Apple Stock Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["9 Get Stock Portfolio Request", 1, 1, 100.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 831.0546875, 0.0], "isController": false}, {"data": ["13 Get Stock Transactions Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["23 Get Stock Portfolio Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["16 Get Stock Prices Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["3 Failed Login Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["10 Place Stock Order Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["17 Add Money Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["1 Register Request", 1, 1, 100.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 92.33940972222223, 0.0], "isController": false}, {"data": ["14 Register Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["6 Add Google Stock Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["2 Failed Register Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["7 Create Apple Stock Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["15 Login Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["25 Get Stock Transactions Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["12 Get Stock Portfolio Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["26 Invalid Token", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["Debug Sampler", 2, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 0.3951788184153329, 0.43608600079035764, 0.0], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["18 Get Wallet Balance Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["5 Create Google Stock Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}, {"data": ["24 Cancel Stock Order Request", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1246.58203125, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 27, 100.0, 93.10344827586206], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 29, 27, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 27, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["27 Invalid Payload Example", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4 Login Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["11 Place Stock Order Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["19 Place Stock Order Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["8 Add Apple Stock Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["9 Get Stock Portfolio Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["13 Get Stock Transactions Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["23 Get Stock Portfolio Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["16 Get Stock Prices Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["3 Failed Login Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["10 Place Stock Order Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["17 Add Money Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1 Register Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["14 Register Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["6 Add Google Stock Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2 Failed Register Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["22 Get Wallet Balance Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7 Create Apple Stock Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["15 Login Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["25 Get Stock Transactions Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["21 Get Wallet Transactions Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["12 Get Stock Portfolio Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["26 Invalid Token", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["20 Get Stock Transactions Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["18 Get Wallet Balance Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["5 Create Google Stock Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["24 Cancel Stock Order Request", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
