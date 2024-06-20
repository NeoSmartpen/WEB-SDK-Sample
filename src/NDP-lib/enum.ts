
export type clientIdType = "google" | "apple" | "ndp";


export interface AuthorizationToken {
    client_id: string,
    access_token: string, // JWT Token
    refresh_token: string,
    token_type: string  // "Bearer"
}

export interface TokenUserData {
    sub:string,
    aud:string,
    resourceOwner:string,
    scope: Array<string>,
    iss:string,
    type:string,
    applicationId: number,
    exp:number,
    iat:number,
    jti:string
}



interface LocalDateTime {
    nano: number,
    dayOfYear: number,
    dayOfWeek: string,
    month: string,
    dayOfMonth: number,
    year: number,
    monthValue: number,
    hour: number,
    minute: number,
    second: number,
    chronology: {
        calendarType: string,
        id: string
    }
}
type GenderType = "MALE" | "FEMALE" | "ETC";

export interface UserData {
    id : string,
    name : string,
    email : string,
    birthday : string,
    gender : GenderType,
    nationality : string,
    pictureUrl : string,
    visitCount : number,
    lastVisitDate : LocalDateTime,
    allowedPushMessage : boolean,
    canShare : boolean,
    extra : string
}
