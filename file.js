const Table = require('cli-table');
const fs = require('fs');



// Reading file name from CLI
const fileName = process.argv[2];
if (!fileName) {
    console.log("Usage: node file.js [File Name]");
    process.exit();
}


// Function to process the log data and return processed data
// Parameters: fileName
// Return Values: Objetcs with HTTP status code count, API Call Count, Count of API Call per minute
function consolidateData(fileName) {
    const regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2} \+\d{2}:\d{2}): .*? "(GET|POST|PUT|DELETE|PATCH|HEAD) (\/.*?) HTTP\/.*?" (\d{3})/  // Regex to catch Timestamp, Endpoint Calls and Status Codes
    const httpStatusCodeCount = new Object;
    const endpointCount = {}
    const minuteAPICallCount = {}
    const fileData = fs.readFileSync(fileName, 'utf-8');
    logDataLine = fileData.split('\n');
    var currentTimeStamp = '';
    for (let index = 0; index < logDataLine.length; index++) {                       
        var match = logDataLine[index].match(regex);
        if (match) {
            let [_, timestamp, httpMethod , endpointWithParameter, statusCode] = match;
            if (currentTimeStamp === timestamp) {
                minuteAPICallCount[timestamp] += 1;
            } else {
                minuteAPICallCount[timestamp] = 1;
            }

            if (statusCode in httpStatusCodeCount) {
                httpStatusCodeCount[statusCode] += 1;
            } else {
                httpStatusCodeCount[statusCode] = 1;
            }

            const endpoint = endpointWithParameter.split("?")[0];

            if (endpoint in endpointCount) {
                endpointCount[endpoint] += 1
            } else {
                endpointCount[endpoint] = 1;
            }
        }

    }

    return [httpStatusCodeCount, endpointCount, minuteAPICallCount];
}

// Function to Draw a table for HTTP status code
function drawHttpStatusCodeTable(httpStatusCodeCount) {
    consolidateData

    const httpStatusCodes = {
        '100': "Continue", '101': "Switching Protocols", '200': "OK",
        '201': "Created", '202': "Accepted", '203': "Non-Authoritative Information",
        '204': "No Content", '205': "Reset Content", '206': "Partial Content",
        '300': "Multiple Choices", '301': "Moved Permanently", '302': "Found",
        '303': "See Other", '304': "Not Modified", '305': "Use Proxy",
        '307': "Temporary Redirect", '308': "Permanent Redirect", '400': "Bad Request",
        '401': "Unauthorized", '402': "Payment Required", '403': "Forbidden",
        '404': "Not Found", '405': "Method Not Allowed", '406': "Not Acceptable",
        '407': "Proxy Authentication Required", '408': "Request Timeout", '409': "Conflict",
        '410': "Gone", '411': "Length Required", '412': "Precondition Failed",
        '413': "Payload Too Large", '414': "URI Too Long", '415': "Unsupported Media Type",
        '416': "Range Not Satisfiable", '417': "Expectation Failed", '418': "I'm a Teapot",
        '422': "Unprocessable Entity", '423': "Locked", '424': "Failed Dependency",
        '426': "Upgrade Required", '428': "Precondition Required", '429': "Too Many Requests",
        '431': "Request Header Fields Too Large", '451': "Unavailable For Legal Reasons", '500': "Internal Server Error",
        '501': "Not Implemented", '502': "Bad Gateway", '503': "Service Unavailable",
        '504': "Gateway Timeout", '505': "HTTP Version Not Supported", '506': "Variant Also Negotiates",
        '507': "Insufficient Storage", '508': "Loop Detected", '510': "Not Extended",
        '511': "Network Authentication Required"
    };

    const table = new Table({
        head: ['Status ', ' Status Code', 'Count'],
        colWidths: [40, 15, 10],
      });

      for (let statusCode in httpStatusCodeCount){
        table.push([httpStatusCodes[statusCode], statusCode, httpStatusCodeCount[statusCode]]);
      }

      console.log(table.toString());

}



function drawTable(dataObject, tableHeaders){
    const table = new Table({
        head: tableHeaders,
        colWidths: [30, 10],
    })

    for ( let data in dataObject){
        table.push([data, dataObject[data]]);
    }
    console.log(table.toString());
}

const [httpStatusCodeCount, endpoint, minuteAPICallCount] = consolidateData(fileName);
drawHttpStatusCodeTable(httpStatusCodeCount);
drawTable(endpoint, ['API Endpoints', 'Count']);
drawTable(minuteAPICallCount, ['Time', 'Count']);




