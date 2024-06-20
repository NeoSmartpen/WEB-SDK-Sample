import {UserData} from "./enum";
import * as StompJs from "./stomp";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const STOMP = StompJs as any;
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

console.log(StompJs);
export interface RoomUserData {
  userId : string,
  type : "Owner" | "Member",
  name : string, 
  nickName : string,
  email : string
}

export interface RoomData {
  id : string,
  ownerId : string,
  name : string,
  comment : null,
  entranceUrl : string,
  type : "Public" | "Private",
  state : "Activated" | "Deactivated",
  users : Array<RoomUserData>,
  activatedDatetime : string, // $date-time
  deactivatedDatetime : string // $date-time
}

export interface RoomListResponse {
  totalElements: number,
  resultElements: Array<RoomData>
}

interface RelayInitData {
    userId:string,
    accessToken:string,
    applicationId : number,
    url : string
}



class Relay {
    userId : string = "";
    accessToken : string = "";
    url : string = "";
    clientId : string = "";
    applicationId : number = -1;
    selectedRoomData : RoomData | null = null;
    userData : UserData|null = null;
    userUuid : string = "";
    client : any = undefined;
    private isInit = false;
    
    setInit(initData:RelayInitData){
        this.userId = initData.userId;
        this.accessToken = initData.accessToken;
        this.applicationId = initData.applicationId;
        this.url = initData.url;
        this.isInit = true;
    }
    async getRoom(){
      if(!this.isInit){
        return ;
      }
      const res = await fetch(`${this.url}/relay/v2/room`,{
        method : "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : `Bearer ${this.accessToken}`
        }
      });
      let data = await res.json();
      
      console.log(data);
      return data as RoomListResponse;
    }
    setRoom(roomData:RoomData){
      this.selectedRoomData = roomData;
    }
    getUUid(){
      if(this.userUuid === ""){
        this.userUuid = uuidv4();
      }

      return this.userUuid;
    }
    async connectRoom(){
      if(this.selectedRoomData === null) return ;
      
      const sessionKey = this.getUUid();

      this.client = new RelaySocket({
        sessionKey : sessionKey,
        url : `${this.url}/live/v2/ws?session-key=${sessionKey}&access-token=${this.accessToken}`,
        userId : this.userId,
        applicationId : this.applicationId,
        roomData : this.selectedRoomData
        
      })
      // this.client.subscribe(`/topic/${this.userId}-${this.applicationId}-${channelId}`, (e)=>{
    }
    async createRoom(){
      if(!this.isInit){
        return ;
      }

      const bodyData = {
        "name" : "test",
        "type" : "Public",
        "users" : [{
            "userId" : "rinmin1@neolab.net",
            "type" : "Owner",
            "name" : "test"
        }]
      }
      const res = await fetch(`${this.url}/relay/v2/room`,{
        method : "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : `Bearer ${this.accessToken}`
        },
        body : JSON.stringify(bodyData)
      });
      let data = await res.json();
      
      return data as RoomListResponse;
    }
}

export default Relay;

class RelaySocket {
  client : any = null;
  sessionKey :string;
  url : string;
  userId :string;
  applicationId : number;
  roomData : RoomData;
  constructor(initData:{sessionKey:string, url:string, userId:string, applicationId:number, roomData:RoomData}){
    this.sessionKey = initData.sessionKey;
    this.url = initData.url;
    this.userId = initData.userId
    this.applicationId = initData.applicationId;
    this.roomData = initData.roomData;
  }
  async connect(){
    this.client = new StompJs.Client({
      brokerURL : this.url
    })
    this.client.onConnect = (frame)=>{
      console.log(frame);
      this.connectEvent(frame);
    };
    this.client.activate();

  }
  connectEvent(frame:any){
    this.client.subscribe(`/topic/${this.userId}-${this.applicationId}-${this.roomData.id}`, (e)=>{
        console.log("topic");
        console.log(e);
    });
    this.client.subscribe(`/user/topic/error`, (e)=>{
        console.log("error");
        console.log(e);
    });
    this.client.subscribe(`/user/topic/direct`, (e)=>{
        console.log("direct");
        console.log(e);
    });
  }
}