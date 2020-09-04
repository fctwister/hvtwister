import { Players } from "../collections";

// Publish all players from the local DB
Meteor.publish("allPlayers", function () {
	let self = this;
    
    let subHandle = Players.find({}).observeChanges({
        added: function(id, fields) {
            self.added("players", id, fields);
        },
        changed: function(id, fields) {
            self.changed("players", id, fields);
        },
        removed: function(id) {
            self.removed("players", id);
        }
    });

    self.onStop(function () {
        subHandle.stop();
    });

	self.ready();
});
