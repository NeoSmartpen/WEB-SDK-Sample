import { Button, makeStyles, TextField } from "@material-ui/core";
import {
  PenHelper,
  NoteServer,
  PenMessageType,
  PenController,
} from "web_pen_sdk";
import React, { useEffect, useState } from "react";
import { fabric } from "fabric";
import {
  Dot,
  PageInfo,
  ScreenDot,
  PaperSize,
  VersionInfo,
  SettingInfo,
} from "web_pen_sdk/dist/Util/type";
import { NULL_PageInfo } from "../utils/constants";
import Header from "../component/Header";
import note_3138 from "../../assets/note_3138.nproj";
import alice from "../../assets/alice_Quiz03.nproj";

interface Stroke {
  Dots: Dot[];
}
interface OfflinePageData {
  Section: number;
  Owner: number;
  Note: number;
  Pages: number[];
}

const useStyle = makeStyles(() => ({
  mainBackground: {
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    alignItems: "center",
    position: "relative",
    height: window.innerHeight - 163.25,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  hoverCanvasContainer: {
    position: "absolute",
  },
  mainCanvas: {
    position: "absolute",
    boxShadow: "1px 2px 6px rgba(0, 0, 0, 0.2)",
  },
  hoverCanvas: {
    position: "absolute",
  },
  inputContainer: {
    display: "flex",
    justifyContent: "center",
  },
  inputStyle: {
    margin: 20,
  },
}));

const PenBasic = () => {
  const classes = useStyle();

  const [canvasFb, setCanvasFb] = useState<any>();
  const [hoverCanvasFb, setHoverCanvasFb] = useState<any>();
  const [ctx, setCtx] = useState<any>();

  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const pendingDotsRef = React.useRef<Dot[]>([]);
  const [isBackgroundImageSet, setIsBackgroundImageSet] = useState<boolean>(false);

  const [imageChangeCount, setImageChangeCount] = useState<number>(0);
  const [noteWidth, setNoteWidth] = useState<number>(0);
  const [noteHeight, setNoteHeight] = useState<number>(0);

  const [hoverPoint, setHoverPoint] = useState<any>();
  const [angle, setAngle] = useState<number>(0);

  const [imageBlobUrl, setImageBlobUrl] = useState<any>();

  const [paperSize, setPaperSize] = useState<PaperSize>();

  const [plateMode, setPlateMode] = useState<boolean>(false);

  const [passwordPen, setPasswordPen] = useState<boolean>(false);

  const [penVersionInfo, setPenVersionInfo] = useState<VersionInfo>();
  const [penSettingInfo, setPenSettingInfo] = useState<SettingInfo>();
  const [controller, setController] = useState<PenController>();

  const [authorized, setAuthorized] = useState<boolean>(false);

  // const [offlineData, setOfflineData] = useState<Stroke[] | null>(null);
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const offlineDataRef = React.useRef<Stroke[] | null>(null);
  const [offlineDataDrawing, setOfflineDataDrawing] = useState<boolean>(false);

  useEffect(() => {
    const { canvas, hoverCanvas } = createCanvas();
    setCanvasFb(canvas);
    setHoverCanvasFb(hoverCanvas);
  }, []);

  /** Setting Ncode noteImage/paperSize */
  useEffect(() => {
    async function getNoteImageUsingAPI(pageInfo) {
      if (PenHelper.isPUI(pageInfo)) {
        return;
      }
      if (pageInfo.section === 0) {
        // pageInfo.section === 0 -> abnormal pageInfo
        return;
      }
      try {
        await NoteServer.getNoteImage(pageInfo, setImageBlobUrl);
      } catch (e) {
        console.log(e);
      }

      let nprojUrl: string | null = null;
      if (pageInfo.book && pageInfo.book === 3138) {
        nprojUrl = note_3138;
      } else if (pageInfo.owner === 45 && pageInfo.book === 3) {
        nprojUrl = alice;
      }
      try {
        await NoteServer.setNprojInPuiController(nprojUrl, pageInfo);

        const paperSize = (await NoteServer.extractMarginInfo(
          nprojUrl,
          pageInfo
        )) as any;
        setPaperSize(paperSize);
      } catch (e) {
        console.log(e);
      } finally {
        console.log("success");
      }

      // 페이지가 바뀔 때마다 PUI 세팅을 새로 해준다. 왜냐하면 페이지마다 PUI 위치가 다를 수 있기 때문

      if (PenHelper.isPlatePaper(pageInfo)) {
        // SmartPlate Case, 서버에서 가져온 이미지를 사용하지 않으므로 0으로 설정해주고, canvasFb의 backgroundColor를 white로 만들어준다.
        setImageBlobUrl(0);
        canvasFb.backgroundColor = "white";
        canvasFb.renderAll();
        setIsBackgroundImageSet(true);
      }
    }

    if (pageInfo) {
      setIsBackgroundImageSet(false);
      getNoteImageUsingAPI(pageInfo);
    }
  }, [pageInfo]);

  useEffect(() => {
    if (hoverCanvasFb) {
      createHoverPoint();
    }
  }, [hoverCanvasFb]);

  /** Get noteImage size */
  useEffect(() => {
    if (imageBlobUrl) {
      const image = new Image();
      image.src = imageBlobUrl;
      image.onload = () => {
        setNoteWidth(image.width);
        setNoteHeight(image.height);
      };
      setImageChangeCount(imageChangeCount + 1);
    }
  }, [imageBlobUrl]);

  useEffect(() => {
    if (noteWidth > 0 && noteHeight > 0) {
      if (pageInfo && pageInfo.section === 0) {
        // pageInfo.section === 0 -> abnormal pageInfo
        return;
      }

      if (pageInfo && PenHelper.isPlatePaper(pageInfo)) {
        // In case of SmartPlate, not required bottom process.
        return;
      }

      if (imageBlobUrl === 0) {
        // In case of 'imageBlobUrl === 0', not required bottom process.
        return;
      }

      setCanvasInitialize();

      /**
       * Refactoring canvas width based on noteImage.
       *
       * Canvas(View) default height = 'window.innerHeight - 81(Header) - 82.25(input container)'
       * CanvasFb.height : CanvasFb.width = noteHeight : noteWidth;
       * CanvasFb.width(=refactorCanvasWidth) = (CanvasFb.height * noteWidth) / noteHeight;
       */
      const refactorCanvasWidth = (canvasFb.height * noteWidth) / noteHeight;
      canvasFb.setWidth(refactorCanvasWidth);
      hoverCanvasFb.setWidth(refactorCanvasWidth);

      canvasFb.setBackgroundImage(
        imageBlobUrl,
        () => {
          canvasFb.renderAll();
          setIsBackgroundImageSet(true);
        },
        {
          // Resizing noteImage to fit canvas size
          scaleX: canvasFb.width / noteWidth,
          scaleY: canvasFb.height / noteHeight,
          // backgroundImage angle setting
          angle: angle,
          top: [180, 270].includes(angle) ? canvasFb.height : 0,
          left: [90, 180].includes(angle) ? canvasFb.width : 0,
        }
      );
    }
  }, [noteWidth, noteHeight, angle, imageChangeCount]);

  useEffect(() => {
    if (isBackgroundImageSet && pendingDotsRef.current.length > 0) {
      console.log("processPendingDots 전");
      processPendingDots();
    }
  }, [isBackgroundImageSet])

  useEffect(() => {
    const drawingOfflineData = async () => {
      if (offlineDataRef.current === null) {
        return;
      }

      const offlineData = offlineDataRef.current;
      for (let i = 0; i < offlineData.length; i++) {
        const dots = offlineData[i].Dots;
        for (let j = 0; j < dots.length; j++) {
          const dot = dots[j];
          await new Promise<void>(resolve => {
            strokeProcess(dot);
            setTimeout(resolve, 500);
          });
        }

        offlineDataRef.current = offlineDataRef.current?.slice(1);
      }

      setOfflineDataDrawing(false);
      offlineDataRef.current = null;
    }

    if (offlineDataRef.current === null) {
      return;
    }

    if (!offlineDataDrawing) {
      return;
    }

    if (pageInfo && paperSize) {
      drawingOfflineData();
    } else {
      setPageInfo(offlineDataRef.current[0].Dots[0].pageInfo);
    }
  }, [offlineDataDrawing, pageInfo, paperSize]);

  /**
   * This callback type is called `dotCallback`.
   *
   * @callback dotCallback
   */
  useEffect(() => {
    PenHelper.dotCallback = async (mac, dot) => {
      strokeProcess(dot);
    };
  });

  /**
   * This callback type is called `messageCallback`. (Pen Event Callback)
   *
   * @callback messageCallback
   */
  useEffect(() => {
    PenHelper.messageCallback = async (mac, type, args) => {
      messageProcess(mac, type, args);
    };
  });

  /** Create mainCanvas, hoverCanvas */
  const createCanvas = () => {
    const canvas = new fabric.Canvas("mainCanvas");
    const hoverCanvas = new fabric.Canvas("hoverCanvas");

    setCtx(canvas.getContext());

    return { canvas, hoverCanvas };
  };

  const processPendingDots = () => {
    pendingDotsRef.current.forEach((dot) => processDot(dot));
    pendingDotsRef.current = [];
  };
  
  /**
   * Process pending dot after pageInfo is updated.
   *
   * @param {Dot} dot
   */
  const processDot = (dot: Dot) => {
    if (!isBackgroundImageSet || imageBlobUrl === undefined || !paperSize) {
      pendingDotsRef.current.push(dot);
      return;
    }

    /** Convert SmartPlate ncode dot coordinate values ​​according to the view size */
    const view = { width: canvasFb.width, height: canvasFb.height };
    let screenDot: ScreenDot;
    if (PenHelper.isPlatePaper(dot.pageInfo)) {
      // Smart Plate
      screenDot = PenHelper.ncodeToScreen_smartPlate(
        dot,
        view,
        angle,
        paperSize
      );
    } else {
      // Default
      screenDot = PenHelper.ncodeToScreen(dot, view, paperSize);
    }

    try {
      if (dot.dotType === 0) {
        // Pen Down
        ctx.beginPath();
        hoverPoint.set({ opacity: 0 }); // In case of PenDown, hoverPoint dont need to look
        hoverCanvasFb.requestRenderAll();
      } else if (dot.dotType === 1) {
        // Pen Move
        ctx.lineWidth = 2;
        ctx.lineTo(screenDot.x, screenDot.y);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(screenDot.x, screenDot.y);
      } else if (dot.dotType === 2) {
        // Pen Up
        ctx.closePath();
      } else if (dot.dotType === 3) {
        // Hover
        hoverProcess(screenDot);
      }
    } catch {
      console.log("ctx : " + ctx);
    }
  };

  const drawingOffline = async () => {
    setOfflineDataDrawing(true);
  }
  /**
   * Process ncode dot.
   *
   * @param {Dot} dot
   */
  const strokeProcess = (dot: Dot) => {
    if (PenHelper.isPlatePaper(dot.pageInfo) && !plateMode) {
      // SmartPlate를 터치했는데 plateMode가 on으로 설정되지 않으면 사용하지 못하도록 함.
      if (dot.dotType === 0) {
        // Show alert message only if penDown
        alert("Plate Mode를 on으로 설정한 후, 캔버스를 생성해주세요.");
      }
      return;
    }
    console.log(
      `s: ${pageInfo?.section}, o: ${pageInfo?.owner}, b: ${pageInfo?.book}, p: ${pageInfo?.page}`
    );
    /** Update pageInfo either pageInfo !== NULL_PageInfo or pageInfo changed */
    if (
      (!pageInfo && !PenHelper.isSamePage(dot.pageInfo, NULL_PageInfo)) ||
      (pageInfo && !PenHelper.isSamePage(pageInfo, dot.pageInfo))
    ) {
      pendingDotsRef.current.push(dot);
      setPageInfo(dot.pageInfo);
    } else {
      processDot(dot);
    };
  }

  let resolveOfflineDataPromise: {
    resolve: (value: Stroke[]) => void;
    reject: (reason?: any) => void;
  } | null = null;
  let resolveOfflinePageListPromise:
    | ((value: OfflinePageData | PromiseLike<OfflinePageData>) => void)
    | null = null;
  const requestOfflinePageList = (
    Section: number,
    Owner: number,
    Note: number
  ) => {
    if (!controller) {
      return Promise.reject(new Error("Controller not initialized"));
    }

    return new Promise<OfflinePageData>((resolve, reject) => {
      resolveOfflinePageListPromise = resolve;
      controller.RequestOfflinePageList(Section, Owner, Note);
    });
  };
  const requestOfflineData = (Section: number, Owner: number, Note: number) => {
    if (!controller) {
      return Promise.reject(new Error("Controller not initialized"));
    }

    return new Promise<Stroke[]>((resolve, reject) => {
      resolveOfflineDataPromise = { resolve, reject };
      controller.RequestOfflineData(Section, Owner, Note, true, []);
    });
  };
  const getOfflineData = async (
    bookData: { Section: number; Owner: number; Note: number }[]
  ) => {
    if (!bookData.length || !controller) {
      return;
    }

    // 순차적으로 request 를 해야 함에 주의
    for (let i = 0; i < bookData.length; i++) {
      const { Section: s, Owner: o, Note: n } = bookData[i];
      const offlinePageList = (await requestOfflinePageList(
        s,
        o,
        n
      )) as OfflinePageData;

      if (offlinePageList) {
        const { Section: sp, Owner: op, Note: no, Pages: p } = offlinePageList;
        console.log(`take offline data: ${sp}, ${op}, ${no}, ${p}`);
        try {
          const result = await requestOfflineData(sp, op, no);
          console.log("requestOfflineData result: ", result);
          offlineDataRef.current = result;
          forceUpdate();
        } catch (e) {
          console.log("requestOfflineData error: " + e);
        }
      }
    }
  };

  /**
   * Message callback process. (Pen Event Processing)
   *
   * @param mac
   * @param type
   * @param args
   */
  const messageProcess = (mac, type, args) => {
    // console.log(mac, type, args);

    switch (type) {
      case PenMessageType.PEN_SETTING_INFO:
        const _controller = PenHelper.pens.filter(
          (c) => c.info.MacAddress === mac
        )[0];
        setController(_controller); // 해당 펜의 controller를 등록해준다.
        setPenSettingInfo(args); // 펜의 Setting 정보 저장
        setPenVersionInfo(_controller.RequestVersionInfo()); // 펜의 versionInfo 정보 저장
        break;
      case PenMessageType.PEN_SETUP_SUCCESS:
        controller?.RequestPenStatus();
        break;
      case PenMessageType.PEN_DISCONNECTED:
        console.log("Pen disconnted");
        setController(undefined); // 펜 연결해제시 펜 controller 초기화.
        setPenVersionInfo(undefined); // 펜 연결해제시 펜 상태정보 초기화.
        setPenSettingInfo(undefined); // 펜 연결해제시 Setting 정보 초기화
        setAuthorized(false); // 연결해제시 인증상태 초기화
        break;
      case PenMessageType.PEN_PASSWORD_REQUEST:
        setPasswordPen(true);
        onPasswordRequired(args); // 패스워드 요청시 process
        break;
      case PenMessageType.PASSWORD_SETUP_SUCCESS:
        const usingPassword = args.UsingPassword;
        if (usingPassword) {
          setPasswordPen(true);
        } else {
          setPasswordPen(false);
        }
        break;
      case PenMessageType.PEN_AUTHORIZED:
        setAuthorized(true); // Pen 인증 성공시 authorized trigger 값 true 변경
        PenHelper.debugMode(false);
        break;
      case PenMessageType.PEN_USING_NOTE_SET_RESULT:
        controller?.SetHoverEnable(true);
        break;
      case PenMessageType.EVENT_DOT_PUI:
        console.log(args);
        break;
      case PenMessageType.OFFLINE_DATA_NOTE_LIST:
        const offlineNoteList = args;
        if (!offlineNoteList.length) {
          alert("오프라인 노트리스트가 없습니다.");
          return;
        }
        const dataString = JSON.stringify(offlineNoteList, null, 2);
        // eslint-disable-next-line no-restricted-globals
        const result = confirm(
          `오프라인 노트 리스트는 아래와 같습니다.\n\n ${dataString} \n\n오프라인 데이터를 가져올까요?`
        );
        if (result) {
          getOfflineData(offlineNoteList);
        }
        break;
      case PenMessageType.OFFLINE_DATA_PAGE_LIST:
        const offlinePageList = args;
        if (resolveOfflinePageListPromise) {
          resolveOfflinePageListPromise(offlinePageList);
          resolveOfflinePageListPromise = null;
        }
        break;
      case PenMessageType.OFFLINE_DATA_SEND_START:
        console.log(args);
        break;
      case PenMessageType.OFFLINE_DATA_SEND_SUCCESS:
      case PenMessageType.OFFLINE_DATA_SEND_FAILURE:
        if (resolveOfflineDataPromise) {
          if (type === PenMessageType.OFFLINE_DATA_SEND_SUCCESS) {
            resolveOfflineDataPromise.resolve(args);
          } else {
            resolveOfflineDataPromise.reject(args);
          }
          resolveOfflineDataPromise = null;
        }
        break;
      default:
        break;
    }
  };

  /**
   * Request Password Process.
   *
   * @param args
   */
  const onPasswordRequired = (args: SettingInfo) => {
    const password = prompt(
      `비밀번호를 입력해주세요. (4자리) (${args.RetryCount}회 시도)\n비밀번호 ${args.ResetCount}회 오류 시 필기데이터가 초기화 됩니다. `
    );
    if (password === null) return;

    if (password.length !== 4) {
      alert("패스워드는 4자리 입니다.");
    }

    if (args.RetryCount >= 10) {
      alert("펜의 모든정보가 초기화 됩니다.");
    }

    controller?.InputPassword(password);
  };

  /**
   * Set canvas angle.
   *
   * @param {number} rotate
   */
  const setCanvasAngle = (rotate: number) => {
    if (![0, 90, 180, 270].includes(rotate)) return;
    if (!pageInfo || !PenHelper.isPlatePaper(pageInfo)) return;

    if (
      Math.abs(angle - rotate) / 90 === 1 ||
      Math.abs(angle - rotate) / 90 === 3
    ) {
      // 90', 270' - swap noteWidth <-> noteHeight
      const tmp = noteWidth;
      setNoteWidth(noteHeight);
      setNoteHeight(tmp);
    }
    setAngle(rotate);
  };

  /**
   * Set canvas width.
   *
   * @param {number} width
   */
  const setCanvasWidth = (width: number) => {
    canvasFb.setWidth(width);
    hoverCanvasFb.setWidth(width);
    canvasFb.setBackgroundImage(0, canvasFb.renderAll.bind(canvasFb));
  };

  /**
   * Set canvas height.
   *
   * @param {number} height
   */
  const setCanvasHeight = (height: number) => {
    canvasFb.setHeight(height);
    hoverCanvasFb.setHeight(height);
    canvasFb.setBackgroundImage(0, canvasFb.renderAll.bind(canvasFb));
  };

  /** Initialize Canvas width, height, angle and plateMode */
  const setCanvasInitialize = () => {
    setPlateMode(false);
    canvasFb.setHeight(window.innerHeight - 163.25 - 20); // header(81) + inputContainer(82.25) + margin value(20)
    hoverCanvasFb.setHeight(window.innerHeight - 163.25 - 20);
    setAngle(0);
  };

  /**
   * Hover Point Process.
   *
   * @param {ScreenDot} screenDot
   */
  const hoverProcess = (screenDot: ScreenDot) => {
    hoverPoint.set({ left: screenDot.x, top: screenDot.y, opacity: 0.5 });
    hoverCanvasFb.requestRenderAll();
  };

  const createHoverPoint = () => {
    const hoverPoint = new fabric.Circle({
      radius: 10,
      fill: "#ff2222",
      stroke: "#ff2222",
      opacity: 0,
      top: 0,
      left: 0,
    });

    setHoverPoint(hoverPoint);
    hoverCanvasFb.add(hoverPoint);
  };

  // PenHelper.getPaperInfo({
  //   section: 3,
  //   owner: 1013,
  //   book: 2,
  //   page: 16
  // })

  return (
    <>
      <Header
        controller={controller}
        penVersionInfo={penVersionInfo}
        penSettingInfo={penSettingInfo}
        passwordPen={passwordPen}
        authorized={authorized}
        offlineData={offlineDataRef.current}
        drawingOffline={drawingOffline}
      />
      <div id="abc" className={classes.mainBackground}>
        <canvas
          id="mainCanvas"
          className={classes.mainCanvas}
          width={window.innerWidth}
          height={window.innerHeight - 163.25}
        ></canvas>
        <div className={classes.hoverCanvasContainer}>
          <canvas
            id="hoverCanvas"
            className={classes.hoverCanvas}
            width={window.innerWidth}
            height={window.innerHeight - 163.25}
          ></canvas>
        </div>
      </div>
      <div id="def" className={classes.mainBackground}></div>
      <div className={classes.inputContainer}>
        <div className={classes.inputStyle}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setPlateMode(!plateMode)}
          >
            {plateMode ? "Plate mode off" : "Plate mode on"}
          </Button>
        </div>
        {plateMode ? (
          <div className={classes.inputContainer}>
            <div className={classes.inputStyle}>
              <TextField
                id="width"
                label="Width"
                variant="outlined"
                type="number"
                size="small"
                onChange={(e) => setCanvasWidth(parseInt(e.target.value))}
              />
            </div>
            <div className={classes.inputStyle}>
              <TextField
                id="height"
                label="Height"
                variant="outlined"
                type="number"
                size="small"
                onChange={(e) => setCanvasHeight(parseInt(e.target.value))}
              />
            </div>
            <div className={classes.inputStyle}>
              <TextField
                id="angle"
                label="Angle"
                variant="outlined"
                type="number"
                size="small"
                onChange={(e) => setCanvasAngle(parseInt(e.target.value))}
              />
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default PenBasic;
