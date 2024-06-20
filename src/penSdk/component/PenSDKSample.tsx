import { makeStyles } from '@material-ui/core';
import React from 'react';
import PenBasic from '../renderer/PenBasic';

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

const PenSDKSample = () => {
  const classes = useStyle();
  
  return (
    <div className={classes.mainBackground}>
      <PenBasic />
    </div>
  );
};

export default PenSDKSample;
