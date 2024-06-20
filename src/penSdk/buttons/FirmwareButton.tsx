import React, { useState } from 'react';
import { Button, makeStyles } from '@material-ui/core';

const useStyle = makeStyles((theme) => ({
}));

const ConnectButton = ({ controller }) => {
  const classes = useStyle();

  const [fileName, setFileName] = useState("");
  const [fwFile, setFwFile] = useState();
  

  const input = document.getElementById("inputFile");

  const handleFile = (e) => {
    setFwFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  }

  const update = () => {
      if(fileName === ""){
          alert("파일부터 선택해주세요.")
          return;
      }
      controller.RequestFirmwareInstallation(fwFile, "1.10", true)
  }

  return (
      <>
        <input type="file" id="inputFile" onChange={handleFile} style={{display:'none'}} />
        <Button onClick={() => input?.click()} >펌웨어파일선택<br/>{fileName}</Button>
        <Button onClick={update} >업데이트 시작</Button>
      </>
  );
};

export default ConnectButton;
