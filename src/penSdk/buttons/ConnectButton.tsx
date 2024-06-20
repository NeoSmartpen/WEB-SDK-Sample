import React from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { PenHelper } from 'web_pen_sdk';

const useStyle = makeStyles((theme) => ({
}));

const ConnectButton = ({ controller, penInfo }) => {
  const classes = useStyle();

  const scanPen = () => {
    PenHelper.scanPen();
  };

  const disconnectPen = () => {
    PenHelper.disconnect(controller);
  }

  const InitPen = () => {
    controller.RequestInitPenDisk();
  }

  return (
    <>
      {penInfo ?
        <>
          <Button onClick={InitPen} >InitPEN</Button>
          <Button onClick={disconnectPen} >disconnect</Button>
        </> :
        <Button onClick={scanPen} >connect</Button>
      }
    </>
  );
};

export default ConnectButton;
