
class NSocket {
    url = "";
    protocols : string | string[] | undefined = undefined;
    socket :WebSocket|undefined = undefined;
    events = {};
    eventsKey = {};

    constructor(url = "", protocols ?: string | string[] | undefined){
        this.url = url;
        this.protocols = protocols;
    };
    async connect(url ?: string, protocols?: string | string[] | undefined){
        console.log(1);
        if(url !== undefined) this.url = url;
        if(protocols !== undefined) this.protocols = protocols;
        console.log(2);
        return new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
            console.log(3);
            const socket = new WebSocket(this.url, this.protocols);
            
            socket.onopen = ()=>{
                console.log(4);
                this.socket = socket;
                this.socket.onmessage = this.onmessage.bind(this);
                this.socket.onerror = this.connectError.bind(this);
                resolve("soccess");
            }
            socket.onerror = () => {
                console.log(5);
                reject("fail");
            }
            console.log(6);
            // this.socket.onmessage = this.onmessage.bind(this);
            // this.socket.onerror = this.connectError.bind(this);
        })
        // this.socket.onmessage = this.onmessage.bind(this);
        // this.socket.onerror = this.connectError.bind(this);
    }
    connectError(ev: Event){
        
    }
    disConnect(){
        this.socket?.close();
    }
    onmessage(event){
        try{
            const data = JSON.parse(event.data);
            const dataKeys = Object.keys(data);
            const eventKeys = Object.keys(this.events);

            const listenKey = eventKeys.filter(el => dataKeys.includes(el));


            this.callback(listenKey, data);
        }catch(e){
            console.error(e);
        }
        
    }
    callback(listenKey, data){
        for(let i = 0; i < listenKey.length; i++){
            const nowKey = listenKey[i];
            const nowData = data[nowKey];

            if(this.events[nowKey]){
                const eventsKey = Object.keys(this.events[nowKey]);
                for(let j = 0; j < eventsKey.length; j++){
                    this.events[nowKey][eventsKey[j]](nowData);
                }
            }
        }
    }
    on(eventName : string, callback : Function){
        if(this.events[eventName] === undefined) this.events[eventName] = {};
        if(this.eventsKey[eventName] === undefined) this.eventsKey[eventName] = 0;

        this.events[eventName][this.eventsKey[eventName]] = callback;

        this.eventsKey[eventName] += 1;

        return this.eventsKey[eventName]-1;
    }
    off(eventName : string, offData ?: Function | number){ // string, Function | number
        if(offData === undefined){
            delete this.events[eventName];
            delete this.eventsKey[eventName];
        }else{
            if(typeof offData === "number"){
                delete this.events[eventName][offData];
            }else if(typeof offData === "function"){
                const nowEvent = this.events[eventName];
                const keys = Object.keys(nowEvent);
                for(let i = 0; i < keys.length; i++){
                    if(nowEvent[keys[i]] === offData){
                        delete nowEvent[keys[i]];
                        break ;
                    }
                }
            }
        }
    }
    emit(eventName : string, data : any){
        if(this.socket === undefined){
            return false;
        }
        
        const sendData = {};
        sendData[eventName] = data;
        this.socket.send(JSON.stringify(sendData));
    }
}

export default NSocket;