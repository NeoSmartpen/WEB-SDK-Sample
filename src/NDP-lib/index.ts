
import Auth from "./Auth";
import User from "./User";
import Relay from "./Relay";
// import {clientIdType, AuthorizationToken, TokenUserData} from "./enum";

const NdpDefaultRouter = process.env.REACT_APP_NDP_DEFAULT_ROUTER;//;"https://llorqt3rofirq76mqwrlexseh4.apigateway.ap-seoul-1.oci.customer-oci.com";

let isShared = false;
let shared :NDP|undefined;

interface NDPinit {
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
    applicationId : number,
    resourceOwnerId : string
}
class NDP {
    Auth : Auth = new Auth();
    User : User = new User();
    Relay : Relay = new Relay();
    url:{[type:string]:string} = {};

    applicationId : number =  -1;
    resourceOwnerId : string = "";
    isReady : boolean = false;
    userId : string = "";
    
    private gatewayStateChangeFunctions:Array<Function> = [];

    constructor (initData?:NDPinit){
        // 기본적으로 동적으로 생성해서 사용하나, 프로젝트 내에서 단 하나의 NDP class를 이용하고 싶다면 setShare를 이용하여 단일화 시킬 수 있다.
        // TODO : 기본 조건을 단일화로 할지 고민
        
        if(isShared && shared !== undefined) return shared;

        if(initData !== undefined){
            this.init(initData);
        }
    }
    async init(initData:NDPinit){
        this.applicationId = initData.applicationId;
        this.resourceOwnerId = initData.resourceOwnerId;
        
        
        this.Auth.init({
            googleClientId : initData.googleClientId,
            googleClientSecret : initData.googleClientSecret,
            appleClientId : initData.appleClientId,
            appleClientSecret : initData.appleClientSecret,
            ndpClientId : initData.ndpClientId,
            ndpClientSecret : initData.ndpClientSecret,
            googleRedirectUri : initData.googleRedirectUri,
            appleRedirectUri : initData.appleRedirectUri,
            ndpRedirectUri : initData.ndpRedirectUri,
            redirectUri : initData.redirectUri
        });

        this.Auth.onAuthStateChanged((userId:string)=>{
            this.setInitDataAfterLogin(userId);
        })

        await this.getGateway();
    }
    async setInitDataAfterLogin(userId:string){
        this.userId = userId;
        this.User.setInit({
            userId,
            accessToken: this.Auth.tokenData.access_token,
            clientId : this.Auth.clientIds[this.Auth.usedType],
            url : this.url.USER
        });
        this.Relay.setInit({
            userId,
            accessToken: this.Auth.tokenData.access_token,
            applicationId : this.applicationId,
            url : this.url.RELAY
        });
        const rooms = await this.Relay.getRoom();
        if(rooms && rooms.resultElements[0]){
            this.Relay.setRoom(rooms.resultElements[0]);
        }
    }
    onGatewayReady(callback:Function){
        this.gatewayStateChangeFunctions.push(callback);
    }


    async getGateway(){
        if(this.applicationId === -1 || this.resourceOwnerId === ""){
            console.error("applicationId 혹은 resourceOwnerId가 존재하지 않습니다.");
            return ;
        }

        const getUrl = await fetch(`${NdpDefaultRouter}/gateway/v2/router/client?applicationId=${this.applicationId}&resourceOwnerId=${this.resourceOwnerId}`,{
            method : "GET",
            headers: {
            'Content-Type': 'application/json',
            }
        });
        const urlData =  await getUrl.json();
        this.url.server = urlData.url;
        let test;
        try{
            const server = await fetch(`${this.url.server}/gateway/v2/server?applicationId=${this.applicationId}&resourceOwnerId=${this.resourceOwnerId}`,{
                method : "GET",
                headers: {
                'Content-Type': 'application/json',
                }
            })
            test = await server.json();
        }catch(e){
            console.log(e);
        }

        console.log(test.resultElements);
        for(let i = 0; i < test.resultElements.length; i++){
            const obj = test.resultElements[i];
            this.url[obj.type] = obj.url;
        }

        this.isReady = true;
        
        this.Auth.setUrl(this.url.AUTH,this.url.USER);

        for(let i = 0 ; i < this.gatewayStateChangeFunctions.length; i++){
            this.gatewayStateChangeFunctions[i]();
        }
    }
    
    // 사용 편의성을 위해 getInstance 호출시 즉시 share 생성
    static getInstance(){
        if(isShared) return shared as NDP;

        else{
            const ndp = new NDP();
            ndp.setShare();

            return shared as NDP;
        }
    }
    setShare(){
        isShared = true;
        shared = this;
    }
    unsetShare(){
        isShared = false;
        shared = undefined;
    }
}

export default NDP;

