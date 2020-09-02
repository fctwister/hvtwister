import { Players } from '../../imports/collections';

function updatePlayers(players) {
    for (let i=0; i < players.length; i++) {
        Players.upsert({
            "id": players[i].id
        },{
            $set: players[i]
        });

        console.log("Player updated. Id: " + players[i].id + ", name: " + players[i].name);
    }

    console.log("Players update finished");
}

function addPlayer(name) {
    const result = Players.find({"name": name});
    const count = Players.find().count() + 1;

    if (result.count() === 0) {
        console.log("Adding player: " + name + ", id: " + count);

        Players.insert({
            "name": name,
            "id": count
        });

        return count;
    } else {
        return result.fetch()[0].id;
    }
}
export { updatePlayers, addPlayer }