import React, {useState, useEffect} from 'react';

export default function Timer(props) {
    // startTime and endTime are passed in as full Date
    const startTime = props.startTime; 
    const endTime = props.endTime;
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        getTimeLeft();
        const interval = setInterval(() => getTimeLeft(), 1000);
        return () => clearInterval(interval);
      }, []);
    
    function getTimeLeft() {
        const timeLeft = Date.parse(endTime) - Date.now();
        setMinutes(Math.floor((timeLeft / 1000 / 60) % 60));
        setSeconds(Math.floor((timeLeft / 1000) % 60));
    }

  return (
    <div className="timer">
        
    </div>
  );
};