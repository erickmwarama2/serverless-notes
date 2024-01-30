'use strict';

const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({region: "eu-west-1"});

module.exports.createNote = async (event) => {
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: "notes",
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: "attribute_not_exists(notesId)"
    };

    await documentClient.put(params).promise();

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
  let notesid = event.pathParameters.id;

  return {
    statusCode: 200,
    body: JSON.stringify(`Note with id: ${notesid} has been updated`)
  };
};

module.exports.deleteNote = async (event) => {
  let notesid = event.pathParameters.id;

  return {
    statusCode: 200,
    body: JSON.stringify(`Note with id: ${notesid} has been deleted`)
  };
};

module.exports.getAllNotes = async (event) => {

  return {
    statusCode: 200,
    body: JSON.stringify(`All Notes`)
  };
};
