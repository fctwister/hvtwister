import React from 'react';
import VotersHeader from './VotersHeader';
import VotersData from './VotersData';

export default class PollVoters extends React.Component {
  
  render() {
    
    const data = this.props.data;

    const pollDates = [];
    const votersData = [];

    // Extract date for table header and voters for table data
    data.forEach(pollData => {
      pollDates.push(new Date(pollData.date).getDate() + "." + (new Date(pollData.date).getMonth() + 1));
      votersData.push(pollData.voters);
    });

    return (
      <table>
        <VotersHeader dates={pollDates} />
        <VotersData votersData={votersData}/>
      </table>
    );
  }
}
