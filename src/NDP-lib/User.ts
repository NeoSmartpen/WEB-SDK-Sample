import {UserData} from "./enum";


interface UserInitData {
    userId:string,
    accessToken:string,
    url : string,
    clientId : string
}



class User {
    userId : string = "";
    accessToken : string = "";
    url : string = "";
    clientId : string = "";
    userData : UserData|null = null;
    
    async setInit(initData:UserInitData){
        this.userId = initData.userId;
        this.accessToken = initData.accessToken;
        this.clientId = initData.clientId;

        this.url = initData.url;
        let data;
        try{
          console.log(`${this.url}/user/v2/users/${this.userId}/profile?clientId=${this.clientId}`)
          const res = await fetch(`${this.url}/user/v2/users/${this.userId}/profile?clientId=${this.clientId}`,{
            method : "GET",
            headers: {
              'Content-Type': 'application/json',
              'Authorization' : `Bearer ${this.accessToken}`
            }
          });
          data = await res.json();
        }catch(e){
          console.log(e);
        }
        console.log(data);

        this.userData = data as UserData;
    }
}

export default User;