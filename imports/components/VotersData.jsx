import React from 'react';
import VotersRow from './VotersRow';

export default class VotersData extends React.Component {

  render() {
  
    const voters = this.props.votersData.names;
    const options = this.props.votersData.options;

    const result = [];

    voters.forEach( voter => {
      const voterValues = []

      options.forEach(option => {
        // Check if array contains object with certain property
        if (voter.options.some(e => e.id === option.id)) {
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
