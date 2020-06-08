import React from 'react';
import VotersHeader from './VotersHeader';
import VotersData from './VotersData';

const VALID_OPTIONS = ["yes", "1", "Hell yeah"];

export default class PollVoters extends React.Component {
  
  render() {
    
    const data = this.props.data;
    const pollDates = [];
    
    let votersData = [];
    let names = [];

    // Extract date for table header and voters for table data
    data.forEach(pollData => {
      // Create date string and push to the pollDates array
      let date = new Date(pollData.date).getDate() + "." + (new Date(pollData.date).getMonth() + 1);
      pollDates.push(date);

      // Iterate over all poll answers in case some exist
      //TODO: change .voters to .answers
      votersData = pollData.voters;
      if (votersData !== undefined) {
        votersData.forEach(answer => {

          // Check if answer is part of the valid options array and only process voters for these
          VALID_OPTIONS.forEach(validOption => {

            if(validOption === answer.option) {
              answer.voters.forEach(voter => {
                
                // Add poll date to the relevant voter name in the names array
                if (names[voter] !== undefined) {
                  names[voter].push(date);
                  console.log(names[voter]);
                } else {
                  names[voter] = [date];
                }

              })


            }
          })
            
        })
      }

    });

    return (
      <table>
        <VotersHeader dates={pollDates} />
        <VotersData votersData={votersData}/>
      </table>
    );
  }
}
