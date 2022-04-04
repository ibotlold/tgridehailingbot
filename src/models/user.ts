import { ObjectId } from 'mongodb'

export default class UserModel {
    public _id?: ObjectId
    public role?: string
    constructor(
        public userId: Number,
        public status: string,
    ) {

    }
}