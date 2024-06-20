import { Button, makeStyles } from '@material-ui/core';
import React from 'react';

import NDP from "../../NDP-lib";


(window as any).NDP = NDP;
const ndp = new NDP({
  googleClientId : process.env.REACT_APP_NDP_GOOGLE_CLIENT_ID,
  googleClientSecret : process.env.REACT_APP_NDP_GOOGLE_CLIENT_SECRET,
  ndpClientId : process.env.REACT_APP_NDP_CLIENT_ID,
  ndpClientSecret  : process.env.REACT_APP_NDP_CLIENT_SECRET,
  redirectUri : process.env.REACT_APP_NDP_REDIRECT_URI,
  applicationId : Number(process.env.REACT_APP_NDP_APPLICATION_ID),
  resourceOwnerId : String(process.env.REACT_APP_NDP_RESOURCE_OWNER_ID)
});
ndp.setShare();


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
  const code = await NDP.getInstance().Auth.googleLogin();
  // const code = await NDP.getInstance().Auth.ndpLogin();
  console.log(code);
  // NDP.getInstance().getLoginToken(code);

}

const LoginButton = () => {
  const classes = useStyle();

  
  return (
    <React.Fragment>
      <Button onClick={tryLogin}>Login</Button>
    </React.Fragment>
  );
};

export default LoginButton;
