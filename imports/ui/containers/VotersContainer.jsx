import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import PollVoters from '../../components/PollVoters';
import { Polls, Players } from '../../collections';

export default class VotersContainer extends TrackerReact(React.Component) {

  render () {

    const subPolls = Meteor.subscribe("allPolls");
    const subPlayers = Meteor.subscribe("allPlayers");

    if (subPolls.ready() && subPlayers.ready()) {

      const polls = Polls.find({}).fetch();
      const players = Players.find({}).fetch();

      return (
        <PollVoters data={polls} players={players}/>
      )

    } else {
      return (
          <p>Loading...</p>
      )
    }
    
  }
}
