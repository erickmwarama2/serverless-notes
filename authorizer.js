const { CognitoJwtVerifier } = require('aws-jwt-verify');
const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "id",
    clientId: process.env.COGNITO_WEB_CLIENT_ID
});

const generatePolicy = async (principalId, effect, resource) => {
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

exports.handler = async (event, context) => {
    let token = event.authorizationToken;
    console.log(token);

    try {
        const payload = await jwtVerifier.verify(token);
        console.log(payload);
        return await generatePolicy("user", "Allow", event.methodArn);
    } catch (err) {
        return await generatePolicy("user", "Deny", event.methodArn);
    }
};