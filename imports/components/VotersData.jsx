import React from 'react';
import VotersRow from './VotersRow';

export default class VotersData extends React.Component {

  render() {
  
    const voters = this.props.votersData.names;
    const dates = this.props.votersData.dates;

    const result = [];

    voters.forEach( voter => {
      const voterValues = []

      dates.forEach(date => {
        if (voter.dates.includes(date)) {
          voterValues.push(1);
        } else {
          voterValues.push(0);
        }
      })  

      result.push(
        <VotersRow
          name={voter.name}
          voterValues={voterValues}
          key={voter.name} />
      );
    });
      
    return (
      <tbody>
        {result}
      </tbody>
    );
  }
}
