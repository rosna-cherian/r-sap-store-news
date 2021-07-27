const guardianService = require('./guardian-service');


exports.handler = async (event) => {
    console.log(`event: ${JSON.stringify(event)}`);

    const httpOptions = {
        host: "content.guardianapis.com",
        path: "/search?q=olympics&api-key=117141e8-2a91-4d13-a929-336f68bc268c&show-fields=body,thumbnail&order-by=newest"
    }
    //just a work-around for testing
    if (event.pageSize) {
        httpOptions.path = httpOptions.path + "&page-size=" + event.pageSize;
    }

    //https call to guardian API
    const GuardianService1 = new guardianService.GuardianService();
    let res1 = await GuardianService1.callGuardianAPI(httpOptions);
    console.log("res1" + JSON.stringify(res1));
    if (res1.httpCode != 200) {
        throw "api_call_failed";
    }
    
    //if successfull call store data method
    return await GuardianService1.storeDatainDB(res1.httpData);
}
