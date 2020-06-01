import { Polls } from "../collections";

// Publish all polls from the local DB
Meteor.publish("allPolls", function () {
	let self = this;
    
    let subHandle = Polls.find({}).observeChanges({
        added: function(id, fields) {
            self.added("polls", id, fields);
        },
        changed: function(id, fields) {
            self.changed("polls", id, fields);
        },
        removed: function(id) {
            self.removed("polls", id);
        }
    });

    self.onStop(function () {
        subHandle.stop();
    });

	self.ready();
});
