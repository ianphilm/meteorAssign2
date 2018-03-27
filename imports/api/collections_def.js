import { Mongo } from 'meteor/mongo';

export const Users = new Mongo.Collection('users');
export const Messages = new Mongo.Collection('messages');