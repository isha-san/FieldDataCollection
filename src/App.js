import React,{ useState } from 'react';
import CollectionForm from './components/CollectionForm.js';
import EntryForm from './components/EntryForm.js';
import Button from '@mui/material/Button';
import Box from '@mui/system/Box';

export default function App() {
  const tokenClient = window.tokenClient;
  const gapi = window.gapi;
  const google = window.google;

  // 0 = not started; 1 = in progress of starting; 2 = started collection
  const [collectionStep, setCollectionStep] = useState(0); 
  // 0 = not started; 1 = in progress of starting or collecting data
  const [entryStep, setEntryStep] = useState(0);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sensorNames, setSensorNames] = useState(["Peso", "Tweak", "Shelling", "Captain Barnacles", "Kwazii", "Inkling", "Dashi", "Tunip"]);
  
  function displayError(errorString) {
    document.getElementById("error-message").innerText = "Error " + errorString;
  }

  function resetSteps() {
    setCollectionStep(0);
    setEntryStep(0);
  }

  async function getToken(err) {
    if (err.result.error.code == 401 || (err.result.error.code == 403) &&
        (err.result.error.status == "PERMISSION_DENIED")) {
  
      // Access token is missing, invalid, or expired, prompt for user consent to obtain one.
      await new Promise((resolve, reject) => {
        try {
          // Settle this promise in the response callback for requestAccessToken()
          tokenClient.callback = (resp) => {
            console.log('RESPONSE STRUCTURE ', resp);
            if (resp.error !== undefined) {
              reject(resp);
              displayError(JSON.stringify(resp.error));
            }
            // GIS has automatically updated gapi.client with the newly issued access token.
            console.log('gapi.client access token: ' + JSON.stringify(gapi.client.getToken()));
            resolve(resp);
          };
          tokenClient.requestAccessToken();
        } catch (err) {
          console.log(err);
          displayError(JSON.stringify(err));
        }
      });
    } else {
      // Errors unrelated to authorization: server errors, exceeding quota, bad requests, and so on.
      let error = new Error(err);
      displayError(JSON.stringify(error));
      throw error;
    }
  }

  function revokeToken() {
    let cred = gapi.client.getToken();
    if (cred !== null) {
      google.accounts.oauth2.revoke(cred.access_token, () => {console.log('Revoked: ' + cred.access_token)});
      gapi.client.setToken("");
      setSpreadsheetId("");
    }
  }

  function createSpreadsheet() {
    // If a valid access token is needed,
    // prompt to obtain one and then retry the original request.
    var current = new Date();
    gapi.client.sheets.spreadsheets.create({
    properties: {
        title: "Flux Data " + "/" + (current.getMonth()+1) + "/" + current.getDate() + "/" + current.getFullYear()
    }
    })
    .then(
    response => {
        console.log(JSON.stringify(response));
        setCollectionStep(1);
        setSpreadsheetId(response.result.spreadsheetId);
    }
    )
    .catch(err  => getToken(err))  // for authorization errors obtain an access token
    .then(retry => gapi.client.sheets.spreadsheets.create({
    properties: {
        title: "Flux Data " + (current.getMonth()+1) + "/" + current.getDate() + "/" + current.getFullYear()
    }
    }))
    .then(
    response => {
        console.log(JSON.stringify(response));
        setCollectionStep(1);
        setSpreadsheetId(response.result.spreadsheetId);
    }
    )
    .catch(err  => {
      console.log(err);
      displayError(err.message);
    }); // cancelled by user, timeout, etc.
  }

  var body; 

  // TODO: thoroughly test logout button
  // TODO: make it so that the collection spreadsheet is created when the user hits "submit"
  // and not before. "New Collection" should just change state

  if (collectionStep === 0) {
    body = (
      <div> 
        {spreadsheetId != "" ? 
          <Button id="revoke-btn" variant="outlined" onClick={revokeToken}>Log Out of Google</Button>
        : <></>}
        <p></p>
        <Button id="new-collection-btn" variant="contained" onClick={createSpreadsheet}>New Collection</Button>
      </div>
    );
  } else if (collectionStep === 1) {
    body = (
      <div>
        <p>Note: if you cancel a collection before creating it, a blank spreadsheet will still be created in your Google account.</p>
        <Button id="cancel-collection-btn" variant="outlined" onClick={() => resetSteps()}>Cancel Collection</Button>
        <p></p>
        <CollectionForm spreadsheetId={spreadsheetId} onUpdate={() => setCollectionStep(2)}></CollectionForm>
      </div>
    );
  } else {
    if (entryStep === 0) {
      body = (
      <div>
        <Button id="new-entry-btn" variant="contained" onClick={() => setEntryStep(1)}>New Entry</Button>
        <p></p>
        <Button id="cancel-collection-btn" variant="outlined" onClick={() => resetSteps()}>Cancel Collection</Button>
      </div>
      )
    } else {
      body = (
        <div>
          <Button id="cancel-entry-btn" variant="outlined" onClick={() => setEntryStep(0)}>Cancel Entry</Button>
          <p></p>
          <Button id="cancel-collection-btn" variant="outlined" onClick={() => resetSteps()}>Cancel Collection</Button>
          <p></p>
          <EntryForm spreadsheetId={spreadsheetId} sensorNames={sensorNames}></EntryForm>
        </div>
      );
    }
  }
  return (
  <div>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      {body}
    </Box>
    <h2 id="error-message"></h2>
  </div>);
}