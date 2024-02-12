import React from 'react';
import labLogo from '../assets/lab_logo.png';


export default function Footer() {

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img 
                src={labLogo}
                alt="Fulweiler Lab Logo"
                style={{ width: "20%", height: "20%" }} // for responsiveness
            />
            <p>Created by Isha Sangani in the Fulweiler Lab @ Boston University. </p>
        </div>
    );
}