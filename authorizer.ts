import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent, AuthResponse, Context, PolicyDocument } from "aws-lambda";

const { CognitoJwtVerifier } = require('aws-jwt-verify');
const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "id",
    clientId: process.env.COGNITO_WEB_CLIENT_ID
});

export const generatePolicy = async (principalId: string, effect, resource) => {

    if (effect && resource) {
        let policyDocument: PolicyDocument = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: effect,
                    Resource: resource,
                    Action: "execute-api:Invoke"
                }
            ]
        };

        let authResponse: AuthResponse = {
            principalId,
            policyDocument,
            context: {
                foo: "The value has to be bar"
            }
        };

        console.log(JSON.stringify(authResponse));
        return authResponse;
    }

    throw new Error('Invalid request');
};

export const handler = async (event: APIGatewayTokenAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
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