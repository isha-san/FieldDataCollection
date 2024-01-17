import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

// TODO: add user written sensor names to the global list of sensor names
export default function EntryForm(props) {
    const [collectingData, setCollectingData] = useState(false);
    const [sensor, setSensor] = useState("");
    const [startTime, setStartTime] = useState(new Date());
    const [X, setX] = useState(0);
    const [Y, setY] = useState(0);
    const [soilMoisture, setSoilMoisture] = useState(0);
    const [soilTemp, setSoilTemp] = useState(0);
    // const [coordinates, setCoordinates] = React.useState([]); // N, W
    const [vegHeight, setVegHeight] = useState(0); // cm
    const [vegType, setVegType] = useState(""); // text input for now
    // const [percentCover, setPercentCover] = React.useState(0); TODO activate once automated
    const [notes, setNotes] = useState("");

    function startCollecting() {
        setStartTime(new Date());
        setCollectingData(true);
    }

    function updateSheet(values) {
        console.log("hi");
        // get date
        const body = {
            values: values,
        };
        try {
            console.log('vals ', values);
            gapi.client.sheets.spreadsheets.values.append({
              spreadsheetId: props.spreadsheetId,
              range: "Sheet1",
              valueInputOption: "USER-ENTERED",
              resource: body,
            }).then((response) => {
              const result = response.result;
              console.log(`${result.updates.updatedCells} cells appended.`);
              setCollectingData(false);
            });
          } catch (err) {
            console.log("Error " + err.message);
            setCollectingData(false);
            return;
        }
    }
    // adds a new row to the Google spreadsheet for the collection 
    function addEntryWithGPS() {
        var endTime = new Date();
        const date = (startTime.getMonth()+1) + "/" + startTime.getDate() + "/" + startTime.getFullYear();
        let values = [[sensor, date, X, Y, `${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`, `${endTime.getHours()}:${endTime.getMinutes()}:${endTime.getSeconds()}`, -1, -1, soilMoisture, soilTemp, vegHeight, vegType, notes]];
        // get gps coordinates
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
            function(position) {
                console.log('lat: ', position.coords.latitude);
                console.log('lat type: ', typeof position.coords.latitude);
                values[0][6] = position.coords.latitude;
                values[0][7] = position.coords.longitude;
                updateSheet(values);
            },
            function(error) {
                console.error("Error getting geolocation:", error.message);
                updateSheet(values);
            }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            updateSheet(values);
        }
    }

    if (collectingData) {
        var endTime = new Date(startTime.getTime() + 10 * 60000);
        return (
            <div>
                <Button id="add-entry-gps" variant="contained" onClick={addEntryWithGPS}>End Data Collection</Button>
                <h2>Your data collection started at {startTime.getHours()}:{startTime.getMinutes()}.</h2>
                <h2>Your data collection should end at {endTime.getHours()}:{endTime.getMinutes()}.</h2>
            </div>
        );
    } else {
        return (
            <div>
                <p>Select sensor: </p>
                <Select
                    labelId="sensor-select-label"
                    id="sensor-select"
                    value={sensor}
                    label="Sensor"
                    onChange={(e) => setSensor(e.target.value)}
                >
                    {props.sensorNames.map((name) => {
                        return <MenuItem value={name}>{name}</MenuItem>;
                    })}
                </Select>
                <p>...or write sensor in (NO whitespace after): </p>
                <TextField id="sensor-text" label="Sensor" variant="outlined" onChange={(e) => setSensor(e.target.value)}></TextField>
                <p></p>
                <TextField id="x" label="X" variant="outlined" onChange={(e) => setX(e.target.value)}></TextField>
                <p></p>
                <TextField id="y" label="Y" variant="outlined" onChange={(e) => setY(e.target.value)}></TextField>
                <p></p>
                <TextField id="soil-moisture" label="Soil Moisture" variant="outlined" onChange={(e) => setSoilMoisture(e.target.value)}></TextField>
                <p></p>
                <TextField id="soil-temp" label="Soil Temp (C)" variant="outlined" onChange={(e) => setSoilTemp(e.target.value)}></TextField>
                <p></p>
                <TextField id="veg-height" label="Vegetation Height (cm)" variant="outlined" onChange={(e) => setVegHeight(e.target.value)}></TextField>
                <p></p>
                <TextField id="veg-type" label="Vegetation type" variant="outlined" onChange={(e) => setVegType(e.target.value)}></TextField>
                <p></p>
                <TextField id="notes" label="Notes" variant="outlined" onChange={(e) => setNotes(e.target.value)}></TextField>
                <p></p>
                <Button id="submit-collection" type="submit" variant="contained" onClick={startCollecting}>Submit</Button>
            </div>
        );
    }
}