import { Button, makeStyles } from '@material-ui/core';
import React from 'react';
import NSocket from '../../NDP-lib/NSocket';


const Socket = new NSocket("ws://localhost:8899");


const useStyle = makeStyles((theme) => ({
  mainBackground: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  },
  title: {
    margin: '15px',
  }
}));

const tryLogin = async ()=>{
    try{
        const test = await (NSocket as any).connect();

        console.log(test);
    }catch(e){
        console.log(e);
    }

    console.log("111111111");
}


const SocketButton = () => {
  const classes = useStyle();

  
  return (
    <React.Fragment>
      <Button onClick={tryLogin}>on Socket</Button>
    </React.Fragment>
  );
};

export default SocketButton;
