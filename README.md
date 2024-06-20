# Neo smartpen SDK Sample Page
네오스마트펜을 사용하기 위한 Web SDK 샘플 페이지입니다.

## Installation 
``` sh
# Sample project setting
$ git clone https://github.com/NeoSmartpen/WEB-SDK-Sample
$ cd WEB-SDK-Sample
$ npm install
$ npm start
```


## 🔨 Usage

### 1. Connect버튼을 눌러 펜 연결을 시도합니다.
![MainPage](./src/assets/1.png)

### 1-1. 펜 연결 성공 시 맥/hover모드/배터리 정보가 표시되며 connect버튼은 disconnect버튼으로 바뀝니다. <br />
### 추가, 펜 배터리 정보는 충전중일 때 128로 표시됩니다.
![SuccessPenConnection](./src/assets/1-1.png)

### 1-2. 펜에 패스워드가 설정되어있다면 패스워드를 입력해주세요.
![RequiredPassword](./src/assets/1-2.png)

### 1-3. 패스워드를 10회 잘못 입력하게 되면 펜은 초기화가 됩니다.
![ResetPen](./src/assets/1-3.png)

### 2. **(Paper)** ncode paper를 터치하면 해당 note의 이미지가 로드됩니다. 이미지가 로드된 이후 사용합니다.
![Paper](./src/assets/2.png)

### 3. **(SmartPlate)** 스마트 플레이트를 사용하고자 한다면, 아래의 PLATE MODE를 ON으로 바꾼 뒤 보여지고자 하는 view 사이즈, 각도를 설정한 뒤 사용하면 됩니다.
![SmartPlatePage](./src/assets/3.png)

#### [Landscape]
- SmartPlate의 기본설정은 가로모드입니다.
![SmartPlateLandscape](./src/assets/4.png)

#### [Portrait]
- SmartPlate를 세로로 사용하고자 한다면 각도를 설정한 후 사용합니다. (0'/180' - 가로, 90'/270' - 세로)
![SmartPlatePortrait](./src/assets/5.png)

