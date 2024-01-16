import React from 'react';

function CollectionForm(props) {
    const [fieldTeam, setFieldTeam] = React.useState("");
    const [weather, setWeather] = React.useState("");
    const [notes, setNotes] = React.useState("");

    // updates the spreadsheet w info about the collection
    function updateCollectionInfo() {
        let values = [
            ["Field Team", fieldTeam],
            ["Weather", weather],
            ["Notes", notes], 
            ["Sensor", "Date", "X", "Y", "Start", "End", "N", "W", "Soil_moisture", "Soil_temp", "Veg_height", "Veg_type"]];
        const body = {
            values: values,
        };
        try {
            gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: props.spreadsheetId,
                range: "A1",
                valueInputOption: "RAW",
                resource: body,
            }).then((response) => {
                const result = response.result;
                console.log(`${result.totalUpdatedCells} cells updated.`);
                props.onUpdate();
            });
            } catch (err) {
            document.getElementById('content').innerText = err.message;
            return;
        }
        
    }

    return (
        <div>
            <label>Field Team (comma-separated names)</label>
            <input id="field-team" onChange={(e) => setFieldTeam(e.target.value)}></input>
            <label>Weather</label>
            <input id="weather" onChange={(e) => setWeather(e.target.value)}></input>
            <label>Notes</label>
            <input id="notes" onChange={(e) => setNotes(e.target.value)}></input>
            <button id="submit-collection" type="submit" onClick={updateCollectionInfo}>Submit</button>
        </div>
    );
}

export default CollectionForm;