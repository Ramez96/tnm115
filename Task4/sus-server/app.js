/*
 *  Filename: app.js
 *  Description: Example solution for Lesson 4: JavaScript + Node.js.
 *  Course Code: TNM115-2024VT
 *  Institution: Linköping University
 *
 *  Author: Nico Reski
 *  Version: 2024-01-28
 */

// === Documentation: TNM115 SUS Server API Endpoints and HTTP Methods ===
// serverUrl/       ->  GET; default, e.g., http://127.0.0.1:3000/ | implementation of a response with status code 200 (OK) and some simple text
// serverUrl/*      ->  OPTIONS; typically any preflight (dry run) request that a client might send | implementation of default response with status code 204 (No content)
// serverUrl/score  ->  POST; request to calculate the SUS score based on an transmitted JSON data structure | implementation of multiple responses:
//                      1. status code 200 (OK) with JSON data structure in message body, if client's input JSON was valid and the SUS score could be computed
//                      2. status code 406 (Not Acceptable), if client's input JSON was not as expected and the SUS score could *not* be computed
//                      3. status code 500 (Internal Server Error), if there was an error parsing the body of the received HTTP request message

// declaration and loading (inclusion) of various modules
const http = require("node:http");      // Node.js standard library for handling client/server server features

// initialization of server properties
const hostname = "127.0.0.1";
const port = 3000;
const serverUrl = "http://" + hostname + ":" + port + "";

// initialization of server object, including the implementation of the internal "routing"
const server = http.createServer((req, res) => {
    
    // create array with individual components of the URL pathname for convenient handling
    // of the internal server routing (API endpoints)
    const requestUrl = new URL(serverUrl + req.url);
    const pathComponents = requestUrl.pathname.split("/");

    // debugging: examination of the URL object and the path components array
    // console.log(requestUrl);
    // console.log("URL Path Components (split):")
    // console.log(pathComponents);

    // handle HTTP GET methods
    if(req.method == "GET"){

        // send simple response, according to server documentation (see start of the file)
        sendResponse(res, 200, "text/plain", "Welcome on the SUS Server of the TNM115 Lesson Project.");
    }
    // handle HTTP OPTIONS methods
    else if (req.method == "OPTIONS"){

        // send simple default response to handle preflight request, according to server documentation (see start of the file)
        sendResponse(res, 204, null, null);
    }
    // handle HTTP POST methods
    else if (req.method == "POST"){

        // handle the one API endpoint, according to server documentation (see start of the file)
        switch(pathComponents[1])
        {
            case "score":
                
                // at this stage, a HTTP POST method as been received,
                // with an expected JSON data structure in the message's body

                // conceptually similar to the Fetch API used in the client implementation of asynchronous programming,
                // i.e., waiting for the data transmission to complete,
                // an event-based approach is utilized in Node.js:
                //  (1) on "error" event: an error reading the message's body occured
                //  (2) on "data" event: a new "chunk" of data has been received
                //  (3) on "end" event: the last "chunk" of message's body has been received

                // for detailed information about the "Anatomy of an HTTP Transaction" and the applied implementation,
                // refer to the Node.js doc: https://nodejs.org/en/guides/anatomy-of-an-http-transaction#request-body

                // beneath, various anonymous callback functions are utilized directly for addressing the above stated events (using JavaScript's Arrow function expression)

                // container (array) for collecting all received "chunks" during the transmission process
                const bodyChunks = [];

                // an error occurred: send HTTP response message to client, indicating that there was an Internal Server Error (500)
                req.on("error", (err) => {
                    console.log("An error ocurred when reading the HTTP POST message's body: " + err.message);
                    sendResponse(res, 500, null, null);
                });
                // a new chunk of data has been received: "collect it"
                req.on("data", (chunk) => {
                    bodyChunks.push(chunk);
                });
                // the last chunk of data has been received
                req.on("end", () => {

                    // compose a string based on all the received "chunks", representing the HTTP message's entire body 
                    const messageBody = Buffer.concat(bodyChunks).toString();
                    // console.log(messageBody);

                    // routing: further handling of the receive HTTP POST method and received data (in the message's body)
                    routing_score(res, messageBody);
                });
                break;

            // this is the default response for when someone sends a HTTP POST request, but a specific API endpoint could not be determined
            default:
                sendResponse(res, 400, "text/plain", "A HTTP POST method has been sent to the server, but no specific API endpoint could be determined.");
        }
    }
});

// start up of the initialized (and configured) server
server.listen(port, hostname, () => {
    console.log("The server running and listening at\n" + serverUrl);
});

// convenience function (template) for composing a HTTP response message
// function parameters:
//  * res: response, http.ServerResponse (handed down from the function that invokes this one)
//  * statusCode: number, representing the HTTP response status code
//  * contentType; string, representing the Multipurpose Internet Mail Extensions (MIME) content type of the response message's body (or null if no body will be transmitted); docs: https://www.iana.org/assignments/media-types/media-types.xhtml
//  * data; object, representing the body (content) of the response message
function sendResponse(res, statusCode, contentType, data){
    
    // configure HTTP response status code, and (if required) Content-Type header
    res.statusCode = statusCode;
    if (contentType != null) res.setHeader("Content-Type", contentType);

    // configure HTTP response message header to allow Cross-Origin Resource Sharing (CORS); docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    
    // send (transmit) the HTTP response message
    if (data != null) res.end(data);     // data in HTTP message body
    else res.end();                      // empty HTTP message body
}


// === API Endpoints ===

// function to handle the /score API endpoint (POST; with expected JSON data in the message's body)
// function parameters:
//  * res: response, http.ServerResponse (handed down from the function that invokes this one)
//  * jsonString: string, representing the received JSON data in the HTTP message's body
function routing_score(res, jsonString){

    // since the received JSON data is still formatted as (typeof) string,
    // it needs to be "deserialized" (parsed into a JSON object) first
    const susJsonDataFromClient = JSON.parse(jsonString);

    // console.log(susJsonDataFromClient);
    // console.log(susJsonDataFromClient.results);      // JSON keys/values can be accessed as usual using dot notation 

    // calculation of the SUS score based on the received data (same as during the previous lesson on the client)
    const susScore = calculateScore(susJsonDataFromClient.results);
    // console.log(susScore);

    // handle HTTP response message to client based on determined SUS score
    if(susScore == null) sendResponse(res, 406, null, null);        // send response with status code 406 (Not Acceptable), according to server documentation (see start of the file)
    else {

        // send response with status code 200 (OK) a JSON data structure in the message's body, according to server documentation (see start of the file)

        // a JSON object *cannot* be simply transmitted in a HTTP message's body,
        // but it needs to be "serialized" (turned into a string) first
        const jsonResult = {
            name: "SUS Score from Server",
            result: susScore
        };
        const jsonResultString = JSON.stringify(jsonResult);
        sendResponse(res, 200, "application/json", jsonResultString);
    }
}


// === SUS Score Calculation ===

// function to calculate the System Usability Scale (SUS) score based on an input array of JSON objects;
// each JSON object has two keys (id, value), representing the answers of the individual SUS items
// returns: either a number value, representing the calculated SUS score,
//          or null if at least one of the answer values is missing (null)
function calculateScore(resultJsonArray){

    // Scoring SUS:
    // SUS yields a single number representing a composite measure of the overall usability of the
    // system being studied. Note that scores for individual items are not meaningful on their own.
    // To calculate the SUS score, first sum the score contributions from each item. Each item's
    // score contribution will range from 0 to 4. For items 1,3,5,7,and 9 the score contribution is
    // the scale position minus 1. For items 2,4,6,8 and 10, the contribution is 5 minus the scale
    // position. Multiply the sum of the scores by 2.5 to obtain the overall value of SU.
    // SUS scores have a range of 0 to 100.
    //
    // Source: John Brooke. SUS: A ’Quick and Dirty’ Usability Scale. In Patrick W. Jordan,
    // B. Thomas, Ian Lyall McClelland, and Bernard Weerdmeester, editors, Usability Evaluation
    // In Industry, pages 189–194. CRC Press, 11 June 1996. doi: 10.1201/9781498710411.

    let sumOdd = 0;
    let sumEven = 0;

    for(let i = 0; i < resultJsonArray.length; i++){
        if(resultJsonArray[i].value == null) return null;   
        if(resultJsonArray[i].id % 2 == 0){
            sumEven += resultJsonArray[i].value;
        } else {
            sumOdd += resultJsonArray[i].value;
        }
    }

    const x = sumOdd - 5;
    const y = 25 - sumEven;

    const susScore = (x + y) * 2.5;
    return susScore; 
}
