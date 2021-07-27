const guardianService = require('./guardian-service');


exports.handler = async (event) => {

    console.log(`event: ${JSON.stringify(event)}`);
    const GuardianService1 = new guardianService.GuardianService();
    let searchOn = null;
    if (event && event.queryStringParameters && event.queryStringParameters.searchOn) {
        searchOn = event.queryStringParameters.searchOn
    }
    let res2 = await GuardianService1.retrieveDataFromDB({ searchOn: searchOn });

    //sort data
    function date_sort(a, b) {
        return new Date(b.webPublicationDate).getTime() - new Date(a.webPublicationDate).getTime();
    }
    res2.sort(date_sort);
    console.log("res2" + JSON.stringify(res2));
    let response = {
        statusCode: 200,
        body: JSON.stringify(res2)
    };
    console.log("response: " + JSON.stringify(response))
    return response;
}
