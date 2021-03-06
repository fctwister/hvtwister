import { Mongo } from 'meteor/mongo';

// Common code on client and server declares a DDP-managed Mongo collection.
Polls = new Mongo.Collection("polls");
Players = new Mongo.Collection("players");

export { Polls, Players };
