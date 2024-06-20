
import {clientIdType, AuthorizationToken, TokenUserData} from "./enum";
import qs from "query-string";

interface AuthInitData {
    googleClientId ?: string,
    googleClientSecret ?: string,
    appleClientId ?: string,
    appleClientSecret ?: string,
    ndpClientId ?: string,
    ndpClientSecret ?: string,
    googleRedirectUri ?: string,
    appleRedirectUri ?: string,
    ndpRedirectUri ?: string,
    // redirectUri를 공유하고 싶다면 redirectUri 에다가만 넣으면 됨
    redirectUri ?: string,
    authURL ?: string,
    userURL ?: string
}


class Auth {
    isInit : boolean = false;
    isLogin : boolean = false; // 로그인 성공 시 다른 방식으로 로그인을 할 경우, headerAuthorization 꼬일 가능성이 있음. 따라서 로그인은 한번만 시도하도록
    private _headerAuthorization : string = "";
    authURL : string = "";
    userURL : string = "";
    usedType : clientIdType = null as unknown as clientIdType;
    clientIds : {[type in clientIdType] : string} = {
        google : "",
        apple : "",
        ndp : ""
    };
    clientSecrets : {[type in clientIdType] : string} = {
        google : "",
        apple : "",
        ndp : ""
    };    
    // 로그인 타입과 상관없이 redirectUri는 공유 할 수도 있기 때문에 default 추가
    redirectUris : {[type in ( clientIdType | "default")] : string} = {
        google : "",
        apple : "",
        ndp : "",
        default : ""
    };

    tokenUserData:TokenUserData = {
        "sub":"",
        "aud":"",
        "resourceOwner":"",
        "scope":[""],
        "iss":"",
        "type":"",
        "applicationId":0,
        "exp":0,
        "iat":0,
        "jti":""
    }
    tokenData : AuthorizationToken = {
        "client_id": "",
        "access_token": "",
        "refresh_token": "",
        "token_type": ""
    };
    private authStateChangeFunctions:Array<Function> = [];
    
    private _userId : string = "";
    
    constructor(initData ?:AuthInitData){
        if(initData === undefined) return ;
        else{
            this.init(initData);
        }
    }
    init(initData :AuthInitData){
        this.clientIds.google = initData.googleClientId ?? "";
        this.clientIds.apple = initData.appleClientId ?? "";
        this.clientIds.ndp = initData.ndpClientId ?? "";

        this.clientSecrets.google = initData.googleClientSecret ?? "";
        this.clientSecrets.apple = initData.appleClientSecret ?? "";
        this.clientSecrets.ndp = initData.ndpClientSecret ?? "";
        
        this.redirectUris.google = initData.googleRedirectUri ?? "";
        this.redirectUris.apple = initData.appleRedirectUri ?? "";
        this.redirectUris.ndp = initData.ndpRedirectUri ?? "";

        
        this.redirectUris.default = initData.redirectUri ?? "";

        this.setUrl(initData.authURL, initData.userURL);
    }
    setUrl(authURL:string|undefined, userURL:string|undefined){
        if(authURL === undefined || userURL === undefined) return ;

        this.authURL = authURL;
        this.userURL = userURL;
        this.isInit = true;
    }
    onAuthStateChanged(callbackFunction:(userId:string)=>any){

        this.authStateChangeFunctions.push(callbackFunction);
    }
    
    get headerAuthorization():string {
        return this._headerAuthorization;
    }
    set headerAuthorization(val:any) {
        console.error("can not change");
    }
    get userId():string {
        return this._userId;
    }
    set userId(val:any) {
        console.error("can not change");
    }

    async getDataWithLogin(type:clientIdType, scope?:string){
        try{
            const code = await this.login(type, scope);


            this.usedType = type;
            
            const token = await this.getLoginToken(code);
    
            console.log(token);
    
            for(let i = 0; i < this.authStateChangeFunctions.length; i++){
                try{
                    this.authStateChangeFunctions[i](this._userId);
                }catch(e){}
            }
            // TODO : 유저 정보 불러오기 등등 필요함
            return token;
        }catch(e){
            console.error(e);
        }
    }
    googleLogin = async (scope?:string) => this.getDataWithLogin("google", scope);
    ndpLogin = async (scope?:string) => this.getDataWithLogin("ndp", scope);
    appleLogin = async (scope?:string) => this.getDataWithLogin("apple", scope);
    
    async getLoginToken(code:string){
        const res = await fetch(`${this.authURL}/oauth/v2/token?code=${code}&grant_type=authorization_code`,{
          method : "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Basic ${this.headerAuthorization}`
          }
        })
        let tokenData = await res.json() as AuthorizationToken;
        this.tokenData = tokenData;

        this.discomposeJWTToken(this.tokenData.access_token);

        return this.tokenData;
    }

    private discomposeJWTToken(token:string){
        let jwtData = token.split(".");
        // console.log(jwtData[1], Buffer);
        console.log(token);
        console.log(jwtData[0]);
        console.log(jwtData[1]);
        console.log(jwtData[2]);
        console.log(Buffer.from(jwtData[1],"base64").toString());
        let jwtUserData = JSON.parse(Buffer.from(jwtData[1],"base64").toString());
        if(jwtUserData.sub){
            this._userId = jwtUserData.sub;
            this.tokenUserData = jwtUserData as TokenUserData;
        }
    }

    async login(type:clientIdType, scope?:string){
        const nowScope = scope ?? "profile.read,profile.write,userdata.read,userdata.write,storage.read,storage.write";
        return new Promise((resolve:(value: string) => void, reject)=>{
            if(!this.isInit){
                console.error("Gateway is not ready");
                reject("Gateway is not ready");
                return;
            }else if(this.clientIds[type] === "" || this.clientSecrets[type] === ""){
                console.error(`${type}_Id is not ready`);
                reject(`${type}_Id is not ready`);
                return;
            }else if(this.isLogin){
                console.error(`Already logged in`);
                reject(`Already logged in`);
                return;
            }

            this._headerAuthorization = Buffer.from(`${this.clientIds[type]}:${this.clientSecrets[type]}`).toString("base64");

            let redirectUri = "";
            if(this.redirectUris.default !== "") redirectUri = this.redirectUris.default;
            else redirectUri = this.redirectUris[type];

            const authorizationRequest = `${this.authURL}/oauth/v2/authorize?client_id=${this.clientIds[type]}&response_type=code&scope=${nowScope}&redirect_uri=${redirectUri}`;
            console.log(authorizationRequest);
            const popup = window.open(authorizationRequest, "_blank", "width = 500, height = 800, top = 0, left = 0, location = no");
            if(popup === null){
              reject("Can't use Popup");
            }
        
            const receiveMessage = async (event)=>{
                // origin 체크
                if (event.origin !== window.location.origin)
                    return;
          
                // 모든 postMessage가 들어오기때문에 login 데이터인지 체크
                if (event.data.constructor !== String || event.data.indexOf("login/") === -1)
                    return;
          
          
                popup?.close();
          
                const search = event.data.substr(6); //   login/~~~~~~으로 들어오도록 하였기 때문에 빼준다
                const { code } = qs.parse(search);

                resolve(code as string);
            }
            window.addEventListener("message", receiveMessage);
          
            const interval = setInterval(()=>{
              // 팝업 종료 자동 감지
              // onbeforeunload로 하려 했으나, popup내부가 계속 바뀌어 이벤트가 증발함
              if (popup !== null && popup.closed) {
                clearInterval(interval);
                window.removeEventListener("message", receiveMessage);
                reject();
              }
            }, 500);
        })
    }
}

export default Auth;