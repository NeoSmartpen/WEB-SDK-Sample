import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PenSDKSample from './penSdk/component/PenSDKSample';
import NDPSample from './NDP';
import qs from "query-string";

const App = () => {
  /**
   * TODO : NDP 로그인용 code 받기 인데, 여기 말고 팝업용으로 따로 옮겨야 함
   * 지금은 테스트 redirect url이 127.0.0.1:52095? 로 등록되어 있어서 일단 여기 둠
   */
  const { code } = qs.parse(window.location.search);
  if(code){
    console.log(code);
    (window.opener as Window).postMessage("login/"+window.location.search , window.location.origin);
    return <div />;
  }


  return (
      <div>
        <Routes>
          <Route path='/' element={<PenSDKSample />} />
          <Route path='/ndp' element={<NDPSample />} />
        </Routes>
      </div>
  );
};

export default App;
