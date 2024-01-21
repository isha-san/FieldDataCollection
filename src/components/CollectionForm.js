import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function CollectionForm(props) {
    const gapi = window.gapi;
    
    const [fieldTeam, setFieldTeam] = useState("");
    const [weather, setWeather] = useState("");
    const [notes, setNotes] = useState("");

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
                valueInputOption: "USER-ENTERED",
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
            <TextField id="field-team" label="Field Team" variant="outlined" onChange={(e) => setFieldTeam(e.target.value)}></TextField>
            <p></p>
            <TextField id="weather" label="Weather" variant="outlined" onChange={(e) => setWeather(e.target.value)}></TextField>
            <p></p>
            <TextField id="notes" label="Notes" variant="outlined" onChange={(e) => setNotes(e.target.value)}></TextField>
            <p></p>
            <Button id="submit-collection" type="submit" variant="contained" onClick={updateCollectionInfo}>Submit</Button>
        </div>
    );
}

export default CollectionForm;