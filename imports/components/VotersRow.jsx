import React from 'react';
import VotersCell from './VotersCell';

export default class VotersRow extends React.Component {
  
  render() {

    const values = this.props.voterValues;
    const cells = [];

    values.forEach((cellValue, iter) => {
        cells.push(
            <VotersCell key={iter} value={cellValue} />
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
