import React from 'react';
import labLogo from '../assets/lab_logo.png';
import Button from '@mui/material/Button';


export default function Footer() {

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img 
                src={labLogo}
                alt="Fulweiler Lab Logo"
                style={{ width: "20%", height: "20%" }} // for responsiveness
            />
            <p>Created by Isha Sangani in the Fulweiler Lab @ Boston University. </p>
            <Button 
                href="https://docs.google.com/forms/d/e/1FAIpQLSfQTkskWdv5rvEnK_1ppDJl6pGguHcCtUe7vpSl74nAkD0dJA/viewform?usp=sf_link"
            >
                Submit feedback
            </Button>
        </div>
    );
}