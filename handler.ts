import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  ScanCommand
} from "@aws-sdk/client-dynamodb";

import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda";

import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
const documentClient = new DynamoDBClient({
  region: process.env.AWS_REGION
 });

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

export const createNote = async (event: APIGatewayEvent, context: Context) => {
  console.log(event);
  let data = JSON.parse(event.body as string);
  const dataItem = {
    notesId: data.id,
    title: data.title,
    body: data.body
  };

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: marshall(dataItem),
      ConditionExpression: "attribute_not_exists(notesId)"
    };

    // await documentClient.put(params).promise();
    await documentClient.send(new PutItemCommand(params));

    return {
      statusCode: 201,
      body: JSON.stringify(data)
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify(error.message)
    }
  }
};

export const updateNote = async (event: APIGatewayEvent) => {
  let notesId = event.pathParameters?.id!;
  let data = JSON.parse(event.body as string);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { "notesId": {"S": notesId} },
      UpdateExpression: `set #title = :title, #body = :body`,
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body
      },
      ConditionExpression: 'attribute_exists(notesId)'
    }

    // await documentClient.update(params).promise();
    await documentClient.send(new UpdateItemCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify(err.message)
    }
  }
};

export const deleteNote = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  let notesId = event.pathParameters?.id!;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { "notesId": {"S": notesId} },
      ConditionExpression: 'attribute_exists(notesId)'
    };

    // await documentClient.delete(params).promise();
    await documentClient.send(new DeleteItemCommand(params));

    return {
      statusCode: 200,
      body: `note ${notesId} succesfully deleted`
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify(error.message)
    }
  }
};

export const getAllNotes = async (event: APIGatewayEvent) => {

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };

    // const notes = await documentClient.scan(params).promise();
    const notes = await documentClient.send(new ScanCommand(params));
    notes.Items = notes.Items?.map(item => unmarshall(item));
    // const resNotes = unmarshall(notes);
    return {
      statusCode: 200,
      body: JSON.stringify(notes)
    };

  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify(error.message)
    }
  }
};
