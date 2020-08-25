import React from 'react';

export default class VotersHeader extends React.Component {
  
    render() {
        
        const headersData = this.props.headersData;
        const headers = [];

        headersData.forEach((option, iter) => {
            headers.push(
                <th key={iter}>{option.text} ({option.pollDate.getDate()}/{option.pollDate.getMonth()+1})</th>
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
