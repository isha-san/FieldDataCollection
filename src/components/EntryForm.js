import React, {useState} from 'react';
// import Timer from './Timer.js';
// TODO fix timer
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

// TODO: add user written sensor names to the global list of sensor names
export default function EntryForm(props) {
    const gapi = window.gapi;
    
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
              valueInputOption: "RAW",
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
        const sh = startTime.getHours();
        const eh = endTime.getHours();
        const startAmOrPm = sh >= 0 && sh < 12 ? "AM" : "PM";
        const endAmOrPm = eh >= 0 && eh < 12 ? "AM" : "PM";
        const date = (startTime.getMonth()+1) + "/" + startTime.getDate() + "/" + startTime.getFullYear();
        const s = `${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()} ${startAmOrPm}`;
        const e = `${endTime.getHours()}:${endTime.getMinutes()}:${endTime.getSeconds()} ${endAmOrPm}`;
        let values = [[sensor, date, X, Y, s, e, -1, -1, soilMoisture, soilTemp, vegHeight, vegType, notes]];
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

    // TODO: create a separate component for collecting data page
    if (collectingData) {
        const endTime = new Date(startTime.getTime() + 10 * 60000);
        return (
            <div>
                <Button id="add-entry-gps" variant="contained" onClick={addEntryWithGPS}>End Measurement</Button>
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
                <TextField id="sensor-text" label="Sensor" className="form-field-1" variant="outlined" onChange={(e) => {e.target.value !== "" ? setSensor(e.target.value) : setSensor(sensor)}}></TextField>
                <p></p>
                <TextField id="x" label="X" className="form-field-1" variant="outlined" onChange={(e) => setX(e.target.value)}></TextField>
                <p></p>
                <TextField id="y" label="Y" className="form-field-1" variant="outlined" onChange={(e) => setY(e.target.value)}></TextField>
                <p></p>
                <TextField id="soil-moisture" label="Soil Moisture" className="form-field-1" variant="outlined" onChange={(e) => setSoilMoisture(e.target.value)}></TextField>
                <p></p>
                <TextField id="soil-temp" label="Soil Temp (C)" className="form-field-1" variant="outlined" onChange={(e) => setSoilTemp(e.target.value)}></TextField>
                <p></p>
                <TextField id="veg-height" label="Vegetation Height (cm)" className="form-field-1"variant="outlined" onChange={(e) => setVegHeight(e.target.value)}></TextField>
                <p></p>
                <TextField id="veg-type" label="Vegetation type" className="form-field-1" variant="outlined" onChange={(e) => setVegType(e.target.value)}></TextField>
                <p></p>
                <TextField id="notes" label="Notes" className="form-field-1" variant="outlined" onChange={(e) => setNotes(e.target.value)}></TextField>
                <p></p>
                <Button id="submit-collection" type="submit" className="form-field-1" variant="contained" onClick={startCollecting}>Submit</Button>
            </div>
        );
    }
}