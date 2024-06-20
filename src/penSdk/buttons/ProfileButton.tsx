import React from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { PenHelper } from 'web_pen_sdk';

const useStyle = makeStyles((theme) => ({
}));

const ProfileButton = ({ controller }) => {
  const classes = useStyle();

  const createProfile = () => {
    const profileName = prompt("생성할 프로파일의 이름을 입력해주세요.");
    const profilePassword = prompt("생성할 프로파일의 비밀번호를 입력해주세요.");

    if(profileName === null || profilePassword === null){
        alert("바르게 입력해주세요.")
        return;
    }
    controller?.RequestProfileCreate(profileName, profilePassword);
  }

  const DeleteProfile = () => {
    const profileName = prompt("삭제할 프로파일의 이름을 입력해주세요.");
    const profilePassword = prompt("삭제할 프로파일의 비밀번호를 입력해주세요.");

    if(profileName === null || profilePassword === null){
        alert("바르게 입력해주세요.")
        return;
    }
    controller?.RequestProfileDelete(profileName, profilePassword);
  }

  const InfoProfile = () => {
    const profileName = prompt("조회할 프로파일의 이름을 입력해주세요.");

    if(profileName === null){
        alert("바르게 입력해주세요.")
        return;
    }
    controller?.RequestProfileInfo(profileName);
  }

  const WriteProfileV = () => {
    const profileName = prompt("조회할 프로파일의 이름을 입력해주세요.");
    const profilePassword = prompt("조회할 프로파일의 비밀번호를 입력해주세요.");
    const profileKey = prompt("생성할 내용의 항목을 입력해주세요.");
    const profileValue = prompt("생성할 내용을 입력해주세요.");

    if(profileName === null || profileKey === null){
        alert("바르게 입력해주세요.")
        return;
    }  
    const data = {};
    data[profileKey] = profileValue;
    controller?.RequestProfileWriteValue(profileName, profilePassword, data);
  }

  const ReadProfileV = () => {
    const profileName = prompt("조회할 프로파일의 이름을 입력해주세요.");
    const profileKey = prompt("조회할 내용의 항목을 입력해주세요.");
    

    if(profileName === null || profileKey === null){
        alert("바르게 입력해주세요.")
        return;
    }
    controller?.RequestProfileReadValue(profileName, [profileKey]);
  }

  const DeleteProfileV = () => {
    const profileName = prompt("삭제할 프로파일의 이름을 입력해주세요.");
    const profilePassword = prompt("삭제할 프로파일의 비밀번호를 입력해주세요.");
    const profileKey = prompt("삭제할 내용의 항목을 입력해주세요.")

    if(profileName === null || profilePassword === null || profileKey === null){
        alert("바르게 입력해주세요.")
        return;
    }
    controller?.RequestProfileDeleteValue(profileName, profilePassword, [profileKey]);
  }
  return (
    <>
        <Button onClick={createProfile} >createProfile</Button>
        <Button onClick={DeleteProfile} >DeleteProfile</Button>
        <Button onClick={InfoProfile} >InfoProfile</Button>
        <Button onClick={WriteProfileV} >WriteProfileV</Button>
        <Button onClick={ReadProfileV} >ReadProfileV</Button>
        <Button onClick={DeleteProfileV} >DeleteProfileV</Button>
    </>
  );
};

export default ProfileButton;
