# NoteServer Docs. 
<p>이 문서는 네오스마트펜을 위한 노트 서버를 사용하기 위해 작성되었습니다.</p>
<p>This document is written to be used the Note Server for NeoSmartPen.</p>

## Description
### Include methods
> point72ToNcode, extractMarginInfo, getNoteImage

### 1. point72ToNcode
'nproj 좌표'를 'Ncode 좌표'로 변환하기 위한 로직입니다.
```typescript
// This function is covert 'nproj coordinate' to 'Ncode coordinate'
// @param   { number }
// @returns { number }
const point72ToNcode = (p: number) => {
  ...
}
```

### 2. extractMarginInfo
pageInfo를 바탕으로 nproj로 부터 해당 ncode 페이지의 margin info를 추출하는 로직입니다.
```typescript
// This function is to extract the margin info of the ncode page from nproj based on pageInfo.
// @param   { PageInfo }
// @returns { PaperSize }
const extractMarginInfo = async (pageInfo: PageInfo) => {
  ...
}
```

### 3. getNoteImage
pageInfo를 바탕으로 firebase storage에서 노트의 이미지를 받아오기 위한 로직입니다.
```typescript
// This function is to get the note image from firebase storage based on pageInfo.
// @param   { PageInfo }
// @param   { React.dispatch }
// @returns { boolean }   success -> setImageBlobUrl(imageBlobUrl)
const getNoteImage = async (pageInfo: PageInfo, setImageBlobUrl: any) => {
  ...
}
```

## Usage with react hook
### Library Set
```typescript
import { api } from 'web_pen_sdk/noteServer';
```

### Step1: api.extractMarginInfo()함수를 사용하여 ncode paper의 size 정보를 받아옵니다.
```typescript
// Use api.extractMarginInfo() function to get size information of the ncode paper.
const [paperSize, setPaperSize] = useState<PaperSize>();

const paperSize: PaperSize = await api.extractMarginInfo(pageInfo);
```

### Step2: api.getNoteImage()를 사용하여 note의 image url을 받아옵니다.
```typescript
// Use api.getNoteImage() function to get image url of the note.
const [imageBlobUrl, setImageBlobUrl] = useState<string>();

await api.getNoteImage(pageInfo, setImageBlobUrl);
```

### Step3: Full code 
```typescript
const [imageBlobUrl, setImageBlobUrl] = useState<string>();
const [paperSize, setPaperSize] = useState<PaperSize>();

useEffect(() => {
  async function getNoteImageUsingAPI(pageInfo) {
    await api.getNoteImage(pageInfo, setImageBlobUrl);
    const paperSize: PaperSize = await api.extractMarginInfo(pageInfo);
    setPaperSize(paperSize);
  }

  if (pageInfo) {
    getNoteImageUsingAPI(pageInfo);
  }
}, [pageInfo]);
```