export interface OdooResultProducts {
    jsonrpc:String
    id:String,
    result : {
    status: number,
        data:
        {
            id: number,
            name: String,
            price: number
        }
    }
}