import React,{ useState } from 'react';
import CollectionForm from './components/CollectionForm.js';
import EntryForm from './components/EntryForm.js';

export default function App() {
  // 0 = not started; 1 = in progress of starting; 2 = started collection
  const [collectionStep, setCollectionStep] = useState(0); 
  const [entryStep, setEntryStep] = useState(0);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  
  async function getToken(err) {
    if (err.result.error.code == 401 || (err.result.error.code == 403) &&
        (err.result.error.status == "PERMISSION_DENIED")) {
  
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
    .catch(err  => console.log(err)); // cancelled by user, timeout, etc.
  }

  if (collectionStep === 0) {
    return (
      <div>
        {spreadsheetId != "" ? 
            <button id="revoke-btn" onClick={revokeToken}>Log Out of Google</button>
        : <></>}
        <button id="new-collection-btn" onClick={createSpreadsheet}>New Collection</button>
      </div>
    );
  } else if (collectionStep === 1) {
    return (
      <div>
        <CollectionForm spreadsheetId={spreadsheetId} onUpdate={() => setCollectionStep(2)}></CollectionForm>
      </div>
    );
  } else {
    if (entryStep === 0) {
      return (
      <div>
        <button onClick={() => setEntryStep(1)}>New Entry</button>
      </div>
      )
    } else {
      return (
        <div>
          <EntryForm spreadsheetId={spreadsheetId}></EntryForm>
        </div>
      );
    }
  }
}