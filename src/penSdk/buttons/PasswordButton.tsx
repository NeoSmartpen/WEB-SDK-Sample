import React from 'react';
import { Button, makeStyles } from '@material-ui/core';

const useStyle = makeStyles((theme) => ({
}));

const PasswordButton = ({ controller, passwordPen }) => {
  const classes = useStyle();

  const setPassword = () => {
    const newPassword = prompt("신규 패스워드를 입력하세요. (4자리)");
    const reNewPassword = prompt("다시 한 번 입력해주세요.");

    if(newPassword === null || newPassword.length !== 4){
      alert("패스워드를 바르게 입력해주세요.")
      return;
    }

    if(newPassword === reNewPassword){
      //패스워드를 설정하기 위해서는 oldPassword를 default_PASSWORD인 0000으로 설정해둬야 한다.
      controller?.SetPassword("0000", newPassword);
    }else{
      alert("비밀번호가 일치하지 않습니다.");
    }
  }
  const updatePassword = () => {
    const oldPassword = prompt("기존 패스워드를 입력하세요. (4자리)");
    const newPassword = prompt("신규 패스워드를 입력하세요. (4자리)");
    
    if(oldPassword === null || newPassword === null) return
    if(newPassword !== null && newPassword.length !== 4){
        alert("패스워드는 4자리");
        return;
    }

    controller?.SetPassword(oldPassword, newPassword);
  };

  const removePassword = () => {
    const oldPassword = prompt("기존 패스워드를 입력하세요. (4자리)");
    if(oldPassword === null || oldPassword.length !== 4){
      alert("패스워드를 바르게 입력해주세요.")
      return;
    }
    //패스워드를 제거하기 위해서는 newPassword를 빈 문자열(더미 값)로 설정해둬야 한다.
    controller?.SetPassword(oldPassword, "");
  }

  return (
    <>
      {passwordPen ?
        <>
          <Button onClick={updatePassword} >updatePassword</Button>
          <Button onClick={removePassword} >removePassword</Button>
        </> :
        <Button onClick={setPassword} >setPassword</Button>
      }
    </>
  );
};

export default PasswordButton;
