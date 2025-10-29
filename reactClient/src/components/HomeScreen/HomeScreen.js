import React, { useEffect } from 'react';
import './HomeScreen.scss';

export default function HomeScreen({ createCall, startHairCheck }) {


  useEffect(() => {
    // Code here will run after the component has been rendered]\
    if (typeof window.shstarted === 'undefined') {
      startDemo()

      window.shstarted = true
    } else {
      console.log('already started');
      /* location.reload() */
    }

  }, []);

  const startDemo = () => {

    createCall().then((url) => {
      console.log(url);

      startHairCheck(url);
    })
  };

  return (
    <div className="home-screen">

      <button onClick={startDemo} className='button dn' type="button">
        Create And Join Room
      </button>

    </div>
  );
}
