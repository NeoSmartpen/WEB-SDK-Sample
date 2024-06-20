/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from "react";
import { Button } from "@material-ui/core";
import { sleep } from "web_view_sdk_test/dist/common";

const OfflineButton = ({
  controller,
  offlineData,
  setOfflineData,
  strokeProcess,
  setPageInfo,
  pageInfo,
  paperSize,
  imageBlobUrl,
}) => {
  const [canDraw, setCanDraw] = useState(false);
  useEffect(() => {
    if (canDraw && pageInfo && offlineData && imageBlobUrl && paperSize) {
      startDrawingOffline();
    }
  }, [canDraw, pageInfo, offlineData, imageBlobUrl, paperSize]);

  const RequestOfflineNoteList = () => {
    controller.RequestOfflineNoteList(0, 0);
  };

  const DrawingOffline = async () => {
    const sobp = offlineData[0].Dots[0].pageInfo;
    setPageInfo(sobp);
    setCanDraw(true);
  };

  const startDrawingOffline = async () => {
    for (let i = 0; i < offlineData.length; i++) {
      const dots = offlineData[i].Dots;
      for (let j = 0; j < dots.length; j++) {
        const dot = dots[j];
        strokeProcess(dot);
        await sleep(10);
      }
    }
    setOfflineData(null);
    setCanDraw(false);
  };

  return (
    <>
      {offlineData?.length ? (
        <Button onClick={DrawingOffline}>Drawing Offline</Button>
      ) : (
        <Button onClick={RequestOfflineNoteList}>Request Offline</Button>
      )}
    </>
  );
};

export default OfflineButton;
