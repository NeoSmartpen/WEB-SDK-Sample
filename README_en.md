# Neo smartpen SDK Sample Page
Web SDK sample page using 'NeoSmart Pen'

## Installation 
``` sh
# Sample project setting
$ git clone https://github.com/NeoSmartpen/WEB-SDK-Sample
$ cd WEB-SDK-Sample
$ npm install
$ npm start
```


## 🔨 Usage

### 1. Pen Connection
![MainPage](./src/assets/1.png)

### 1-1. Successful Pen Connection
![SuccessPenConnection](./src/assets/1-1.png)

### 1-2. Required password if pen has a password set
![RequiredPassword](./src/assets/1-2.png)

### 1-3. 10 failed attempts at entering the password will reset the Pen
![ResetPen](./src/assets/1-3.png)

### 2. **(Paper)** Touch your ncode paper with a smartpen and wait until the note image pops up. Once the image is loaded, write anything.
![Paper](./src/assets/2.png)

### 3. **(SmartPlate)** If you want to write on the smart plate, click the 'PLATE MODE ON' button below. Then set the view size.
![SmartPlatePage](./src/assets/3.png)

#### [Landscape]
- The default setting is landscape.

![SmartPlateLandscape](./src/assets/4.png)

#### [Portrait]
- You can change the page orientation to portrait(vertical) by setting the angle value.

![SmartPlatePortrait](./src/assets/5.png)

