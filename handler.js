'use strict';

module.exports.createNote = async (event) => {
  return {
    statusCode: 201,
    body: JSON.stringify("A new note created")
  };
};

module.exports.updateNote = async (event) => {
  let notesid = event.pathParameters.id;

  return {
    statusCode: 200,
    body: JSON.stringify(`Note with id: ${notesid} has been updated`)
  };
};
