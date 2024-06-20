import { makeStyles } from '@material-ui/core';
import React from 'react';
import Header from "./layout/Header";

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

const NDPSample = () => {
  const classes = useStyle();
  
  return (
    <div className={classes.mainBackground}>
        <Header />
    </div>
  );
};

export default NDPSample;
