import React, {useState} from 'react';

export default function EntryForm(props) {
    const [collectingData, setCollectingData] = useState(false);
    const [sensor, setSensor] = React.useState("");
    const [startTime, setStartTime] = React.useState(new Date());
    const [X, setX] = React.useState(0);
    const [Y, setY] = React.useState(0);
    const [soilMoisture, setSoilMoisture] = React.useState(0);
    const [soilTemp, setSoilTemp] = React.useState(0);
    // const [coordinates, setCoordinates] = React.useState([]); // N, W
    const [vegHeight, setVegHeight] = React.useState(0); // cm
    const [vegType, setVegType] = React.useState(""); // text input for now
    // const [percentCover, setPercentCover] = React.useState(0); TODO activate once automated
    const [notes, setNotes] = React.useState("");

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
                <button onClick={addEntryWithGPS}>End Data Collection</button>
                <h2>Your data collection started at {startTime.getHours()}:{startTime.getMinutes()}.</h2>
                <h2>Your data collection should end at {endTime.getHours()}:{endTime.getMinutes()}.</h2>
            </div>
        );
    } else {
        return (
            <div>
                <label>Sensor Name (first letter capitalized, no spaces)</label>
                <input id="sensor" onChange={(e) => setSensor(e.target.value)}></input>
                <label>X</label>
                <input id="x" onChange={(e) => setX(e.target.value)}></input>
                <label>Y</label>
                <input id="y" onChange={(e) => setY(e.target.value)}></input>
                <label>Soil Moisture</label>
                <input id="soil-moisture" onChange={(e) => setSoilMoisture(e.target.value)}></input>
                <label>Soil Temperature (Celsius)</label>
                <input id="soil-temp" onChange={(e) => setSoilTemp(e.target.value)}></input>
                <label>Vegetation Height (cm)</label>
                <input id="veg-height" onChange={(e) => setVegHeight(e.target.value)}></input>
                <label>Vegetation Type</label>
                <input id="veg-type" onChange={(e) => setVegType(e.target.value)}></input>
                <label>Notes</label>
                <input id="notes" onChange={(e) => setNotes(e.target.value)}></input>
                <button id="submitCollection" type="submit" onClick={startCollecting}>Submit</button>
            </div>
        );
    }
}