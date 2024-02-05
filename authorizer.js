const generatePolicy = (principalId, effect, resource) => {
    let authResponse = {};
    authResponse.principalId = principalId;

    if (effect && resource) {
        let policyDocument = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: effect,
                    Resource: resource,
                    Action: "execute-api:Invoke"
                }
            ]
        };

        authResponse.policyDocument = policyDocument;
    }

    authResponse.context = {
        foo: "The value of foo is bar"
    };

    console.log(JSON.stringify(authResponse));
    return authResponse;
};

exports.handler = (event, context) => {
    let token = event.authorizationToken;

    switch (token) {
        case "allow":
            return generatePolicy("user", "Allow", event.methodArn);
        case "deny":
            return generatePolicy("user", "Deny", event.methodArn);
            break;
        default:
            return "Invalid token";
    }
};