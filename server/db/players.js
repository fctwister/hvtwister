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
    const result = Players.upsert({
        "name": name
    },{
        $set: {
            "name": name,
            "id": Players.count()
        }
    });

    console.log(result);
}
export { updatePlayers, addPlayer }