/* eslint-disable no-restricted-globals */
import React from "react";
import { Button } from "@material-ui/core";

const OfflineButton = ({
  controller,
  offlineData,
  drawingOffline,
}) => {
  const RequestOfflineNoteList = () => {
    controller.RequestOfflineNoteList(0, 0);
  };


  const startDrawingOffline = async () => {
    drawingOffline();
  };

  return (
    <>
      {offlineData?.length ? (
        <Button onClick={startDrawingOffline}>Drawing Offline</Button>
      ) : (
        <Button onClick={RequestOfflineNoteList}>Request Offline</Button>
      )}
    </>
  );
};

export default OfflineButton;
