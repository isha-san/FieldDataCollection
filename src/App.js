import React,{ useState } from 'react';
import Footer from './components/Footer.js';
import CollectionForm from './components/CollectionForm.js';
import EntryForm from './components/EntryForm.js';
import Button from '@mui/material/Button';
import Box from '@mui/system/Box';

export default function App() {
  var tokenClient = window.tokenClient;
  var gapi = window.gapi;
  var google = window.google;
  console.log("we have redelcared.");
  console.log('token client value', tokenClient);
  
  const sensorNames = ["Peso", "Tweak", "Shelling", "Captain Barnacles", "Kwazii", "Inkling", "Dashi", "Tunip"];

  // 0 = not started; 1 = in progress of starting; 2 = started collection
  const [collectionStep, setCollectionStep] = useState(0); 
  // 0 = not started; 1 = in progress of starting or collecting data
  const [entryStep, setEntryStep] = useState(0);
  const [spreadsheetId, setSpreadsheetId] = useState("");

  function displayError(errorString) {
    document.getElementById("error-message").innerText = "Error " + errorString;
  }

  function resetSteps() {
    setCollectionStep(0);
    setEntryStep(0);
  }

  async function getToken(err) {

    if (err.result.error.code === 401 || (err.result.error.code === 403 &&
        err.result.error.status === "PERMISSION_DENIED")) {

      // The access token is missing, invalid, or expired, prompt for user consent to obtain one.
      await new Promise((resolve, reject) => {
        try {
          // Settle this promise in the response callback for requestAccessToken()
          tokenClient.callback = (resp) => {
            if (resp.error !== undefined) {
              reject(resp);
            }
            // GIS has automatically updated gapi.client with the newly issued access token.
            console.log('gapi.client access token: ' + JSON.stringify(gapi.client.getToken()));
            resolve(resp);
          };
          tokenClient.requestAccessToken();
        } catch (err) {
          console.log(err)
        }
      });
    } else {
      // Errors unrelated to authorization: server errors, exceeding quota, bad requests, and so on.
      throw new Error(err);
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
    // check that everything is loaded
    if (!tokenClient || !google || !gapi) {
      // somehow these variables never load. ummmm
      console.log("hi");
      throw new Error('API variables not yet loaded');
    }
    // If a valid access token is needed,
    // prompt to obtain one and then retry the original request.
    var current = new Date();
    gapi.client.sheets.spreadsheets.create({
    properties: {
      // title: `${Flux Data} ${current.getMonth()+1}/${current.getDate()}/${current.getFullYear()}`,
      title: "Flux Data " + (current.getMonth()+1) + "/" + current.getDate() + "/" + current.getFullYear()
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

  function tryCreateSpreadsheet() {
    document.getElementById("loading-msg").innerText = "Loading...";
    const intervalId = setInterval(() => {
      try {
        createSpreadsheet();
        // we are not getting here
        console.log("hey bish");
        clearInterval(intervalId);
        document.getElementById("loading-msg").innerText = "";
      } catch {
        document.getElementById("loading-msg").innerText = "Loading...";
      }
    }, 200);
    // issue: not TRYINg w full api call, just waiting for gapi to laod
  }

  var body; 

  // TODO: thoroughly test logout button
  // TODO: make it so that the collection spreadsheet is created when the user hits "submit"
  // and not before. "New Collection" should just change state

  if (collectionStep === 0) {
    body = (
      <div> 
        {spreadsheetId !== "" ? 
          <Button id="revoke-btn" variant="outlined" onClick={revokeToken}>Log Out of Google</Button>
        : <></>}
        <p>Note: if the "New Collection" button is not working, just reload the page!</p>
        <p></p>
        <Button id="new-collection-btn" variant="contained" onClick={tryCreateSpreadsheet}>New Collection</Button>
        <p id="loading-msg"></p>
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
    {/* Header */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2>Carbon Flux Data Collector</h2>
        <p>Use this site to collect additional metadata when collecting carbon fluxes.</p>
    </div>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="55vh"
    >
      {body}
    </Box>
    <Footer />
    <p id="error-message"></p>
  </div>);
}