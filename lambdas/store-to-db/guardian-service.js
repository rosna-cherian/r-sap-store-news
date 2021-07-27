const AWS = require('aws-sdk');
const https = require('https');



class GuardianService {

    //https call
    async callGuardianAPI(httpOptions, httpBody) {
        let httpResponse = {};
        let httpData = "";
        let binData = [];
        let timeOut = httpOptions.timeout || 15000;
        return new Promise((resolve) => {
            let httpRequest = https.request(httpOptions, (res) => {
                console.log(` status code: ${res.statusCode}`);
                httpResponse.httpCode = res.statusCode;
                httpResponse.headers = res.headers;
                res.on('data', function (data) {
                    httpData += data;
                    binData.push(data);
                });
                res.on('end', () => {
                    try {
                        httpResponse.httpData = JSON.parse(httpData);
                    }
                    catch (e) {
                        httpResponse.binData = Buffer.concat(binData);
                        httpResponse.httpData = httpData;
                    }
                    resolve(httpResponse);
                });
            });
            httpRequest.setTimeout(timeOut, function () {
                console.log(` Request Timeout`);
                httpRequest.abort();
                resolve({
                    httpCode: 408,
                    httpData: {
                        message: "Request has timed out"
                    }
                });
            }.bind(httpRequest));
            httpRequest.on('error', function (err) {
                resolve(err);
            });
            if (httpBody) {
                httpRequest.write(httpBody);
            }
            httpRequest.end();
        }).catch((err) => {
            throw err;
        });
    }

    //call processor data for all events
    async storeDatainDB(data) {
        let updateRes = [];
        data.response.results.forEach(newsItem => {
            updateRes.push(this.updateDDB(newsItem));
        });
        await Promise.all(updateRes);
        console.log("data added to DB");
        return "success";
    }

    //store data of individual events
    async updateDDB(newsItem) {
        try {
            const params = {
                TableName: 'POC_GUARDIAN_NW',
                Key: {
                    newsId: newsItem.id,
                    searchOn: "olympics"
                },
                ConditionExpression: "attribute_not_exists(newsId)",
                UpdateExpression: "SET webPublicationDate=:webPublicationDate,webTitle=:webTitle, webUrl =:webUrl, #fieldspace=:fields",
                ExpressionAttributeValues: {
                    ":webPublicationDate": newsItem.webPublicationDate,
                    ":webTitle": newsItem.webTitle,
                    ":webUrl": newsItem.webUrl,
                    ":fields": newsItem.fields
                },
                ExpressionAttributeNames: {
                    "#fieldspace": "fields"
                },
                ReturnConsumedCapacity: "TOTAL"
            };
            const docClient = new AWS.DynamoDB.DocumentClient();
            await docClient.update(params).promise();
            console.log("info: " + "new_data_added");
            return "new_data_added";
        } catch (error) {
            console.error("error: " + "data_already_present");
            return "data_already_present";
        }
    }
}
exports.GuardianService = GuardianService;
