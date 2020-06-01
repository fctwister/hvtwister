import React from 'react';
import VotersRow from './VotersRow';

export default class VotersData extends React.Component {
  
  render() {
      
      const votersData = this.props.votersData;
      const rows = [];

      votersData.forEach((voters, iter) => {

        if (voters[0] !== undefined) {
          rows.push(
            <VotersRow key={iter} name={voters[0].voters[0][0]} voters={voters} />
          );
        }
      })

      return (
        <tbody>
            {rows} 
        </tbody>
      );
    }
  }
