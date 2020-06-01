import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import PollVoters from '../../components/PollVoters';
import { Polls } from '../../collections';

export default class VotersContainer extends TrackerReact(React.Component) {

  render () {

    const subPolls = Meteor.subscribe("allPolls");

    if (subPolls.ready()) {

      const polls = Polls.find({}).fetch();

      return (
        <PollVoters data={polls} />
      )

    } else {
      return (
          <p>Loading...</p>
      )
    }
    
  }
}
