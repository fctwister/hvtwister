import { Polls } from '../../imports/collections';

function updatePolls(polls) {
    polls.forEach(poll => {
        Polls.upsert({
            "date": poll.date,
            "message": poll.message,
        },{
            $set: poll
        });
    })

    console.log("Polls updated");
}

export { updatePolls }