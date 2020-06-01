import React from 'react';
import VotersCell from './VotersCell';

export default class VotersRow extends React.Component {
  
  render() {

    const voters = this.props.voters;
    const cells = [];

    voters.forEach((option, iter) => {
        cells.push(
            <VotersCell key={iter} value={option.option} />
        );
    })
      
      return (
        <tr>
          <td>{this.props.name}</td>
          {cells}
        </tr>
      );
    }
  }
