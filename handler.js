'use strict';

const {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  ScanCommand
} = require("@aws-sdk/client-dynamodb");

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const documentClient = new DynamoDBClient({
  region: process.env.AWS_REGION
 });

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

module.exports.createNote = async (event) => {
  console.log(event);
  let data = JSON.parse(event.body);
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

module.exports.updateNote = async (event) => {
  let notesId = event.pathParameters.id;
  let data = JSON.parse(event.body);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId
      },
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
      body: JSON.stringify(error.message)
    }
  }
};

module.exports.deleteNote = async (event) => {
  let notesId = event.pathParameters.id;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId
      },
      ConditionExpression: 'attribute_exists(notesId)'
    }

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

module.exports.getAllNotes = async (event) => {

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };

    // const notes = await documentClient.scan(params).promise();
    const notes = await documentClient.send(new ScanCommand(params));
    // notes.Items = unmarshall(notes.Items);
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
