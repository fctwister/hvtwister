import React from 'react';

export default class VotersHeader extends React.Component {
  
    render() {
        
        const dates = this.props.dates;
        const headers = [];

        dates.forEach((date, iter) => {
            headers.push(
                <th key={iter}>{date}</th>
            );
        })

        return (
            <thead>
                <tr>
                    <th>Nimi</th>
                    {headers}
                </tr>
            </thead>
        );
    }
}
