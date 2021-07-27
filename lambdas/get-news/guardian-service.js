const AWS = require('aws-sdk');


class GuardianService {

    async retrieveDataFromDB(req, dataRec = []) {
        let response = await this.queryDB(req);
        dataRec = dataRec.concat(response.Items);

        if (response.LastEvaluatedKey) {
            console.log("scan db again ");
            req.LastEvaluatedKey = response.LastEvaluatedKey
            return await this.retrieveDataFromDB(req, dataRec);
        } else {
            console.log("dataRec db : " + JSON.stringify(dataRec));
            return dataRec;
        }
    }

    async queryDB(req) {
        let params = {
            TableName: 'POC_GUARDIAN_NW',
            ProjectionExpression: "webTitle, webPublicationDate, webUrl, #fieldspace",
            ExpressionAttributeNames: {
                "#fieldspace": "fields"
            },
            Limit: 10 //limit added to display pagination
        };

        if (req && req.searchOn && req.searchOn.length > 1) {
            params.FilterExpression = 'searchOn = :searchOn'
            params.ExpressionAttributeValues = { ':searchOn': req.searchOn }
        }

        if (req && req.LastEvaluatedKey) {
            params.ExclusiveStartKey = req.LastEvaluatedKey
        }

        const documentClient = new AWS.DynamoDB.DocumentClient();

        let data = await documentClient.scan(params).promise();
        console.log("data from db : " + JSON.stringify(data));
        return data;
    }
}
exports.GuardianService = GuardianService;
