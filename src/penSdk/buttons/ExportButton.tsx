import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { strokesToInkML } from 'neo-inkml';
import { PDFDocument, rgb } from 'pdf-lib';
const ExportButton = ({ strokes, paperSize, imageBlobUrl, setStrokes }) => {
/*
 * ----------------------------------------------------------------------------------------------------------
 * 1) Ncode 좌표계
 * 2) PDF 좌표계
 * 
 * 1) NU(Ncode Unit): 56/600 DPI, Ncode 좌표계는 펜에서 검출되는 좌표계를 기준으로 한다.
 *    - 600DPI에서 8 pixel 거리를 가지는 7개 glyph 가 하나의 Ncode
 *    - 1 NU = 7(glyphs) * 8(pixels) / 600 (DPI) = 56/600 Inch = 약 2.370666667 mm
 *
 * 2) PU(Pdf Unit): 72 DPI, PDF 좌표계는 PdfJs.getViewport({scale:1})을 통해서 나오는 크기를 기준으로 하는 좌표계
 *    - PDF가 설계될 당시 1:1 scale의 좌표계는 72DPI
 *    - 1 PU = 1 pixel @ 72DPI = 1(pixel) / 72(DPI) = 1/72 Inch = 약 0.352777778 mm
 * 
 * 1) NU to PU
 *    pu = nu * (56/600) / (1/72) = nu * 6.72
 * ----------------------------------------------------------------------------------------------------------
 */
  async function StrokesToPDF(strokes) {
    const resp = await fetch(imageBlobUrl);
    const imgBytes = await resp.arrayBuffer();

    const pdfDoc = await PDFDocument.create();
    const scale = 6.72;
    const PW = paperSize.Xmax - paperSize.Xmin;
    const PH = paperSize.Ymax - paperSize.Ymin;
    const page = pdfDoc.addPage([PW * scale, PH * scale]);

    // 배경 이미지 임베드
    let bg;
    bg = await pdfDoc.embedJpg(imgBytes);

    // "원래 종이 크기(PW, PH)"를 기준으로 스케일링
    page.drawImage(bg, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });

    // 스트로크도 동일 스케일 적용
    for (let j = 0; j < strokes.length; j++) {
      const pts = strokes[j].dotArray;
      if (!Array.isArray(pts) || pts.length < 2) continue;

      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];

        const startX = (prev.x - paperSize.Xmin) * scale;
        const startY = (paperSize.Ymax - prev.y) * scale;
        const endX = (curr.x - paperSize.Xmin) * scale;
        const endY = (paperSize.Ymax - curr.y) * scale;

        page.drawLine({
          start: { x: startX, y: startY },
          end: { x: endX, y: endY },
          thickness: 0.2,
          color: rgb(0, 0, 0),
        });
      }
    }

    // 저장 & 다운로드
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "myDrawing.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function StrokesToInkML(strokes) {
    console.log(strokes);
    console.log(strokes[0].dotArray[0].x);
    const inkml = strokesToInkML(strokes);
    console.log(inkml);
    const blob = new Blob([inkml], { type: "application/inkml+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "myDrawing.inkml";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  async function DeleteStrokes(strokes, setStrokes) {
    if (window.confirm("The file has been saved. Do you want to delete all strokes?")) {
      setStrokes([]);
      console.log(strokes);
    } else {
      return;
    }
  }

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const ToPDF = async () => {
    await StrokesToPDF(strokes);
    await DeleteStrokes(strokes, setStrokes);
  }
  const ToInkML = async () => {
    await StrokesToInkML(strokes);
    await DeleteStrokes(strokes, setStrokes);
  }
  const onClick = () => {
    if (!strokes || strokes.length === 0 || !imageBlobUrl) {
      alert("No page or strokes to export.");
      return;
    }
    setIsMenuOpen(true);
  };

  return (
    <>
      {isMenuOpen ?
        <>
          <Button onClick={ToPDF}>Export PDF<br /></Button>
          <Button onClick={ToInkML}>Export InkML<br /></Button>
        </> :
        <Button onClick={onClick}>Export Files<br /></Button>}

    </>
  );
};

export default ExportButton;