import React from 'react';
import VotersHeader from './VotersHeader';
import VotersData from './VotersData';

const VALID_OPTIONS = ["yes", "1", "Hell yeah"];

export default class PollVoters extends React.Component {
  
  render() {
    
    const data = this.props.data;
    const pollDates = [];
    
    let votersMatrix = [];
    let dates = [];
    let votersArray = [];

    // Extract date for table header and voters for table data
    // TODO: Order dates asc
    data.forEach(pollData => {
      // Create date string and push to the pollDates array
      let date = new Date(pollData.date).getDate() + "." + (new Date(pollData.date).getMonth() + 1);
      pollDates.push(date);

      // Iterate over all poll answers in case some exist
      //TODO: change .voters to .answers
      votersMatrix = pollData.voters;
      if (votersMatrix !== undefined) {
        votersMatrix.forEach(answer => {

          // Check if answer is part of the valid options array and only process voters for these
          VALID_OPTIONS.forEach(validOption => {

            if(validOption === answer.option) {
              // TODO: voters array needs to be one level higher
              answer.voters[0].forEach(voter => {
                // Search for voter name in the votersArray
                const res = search(voter, votersArray);

                // If voter does not exist, create a new object in the array
                if (res === null) {
                  votersArray.push({
                    name: voter,
                    dates: [date]
                  });
                  // else, push the new date value in the resulting array from the search
                } else {
                  votersArray[res].dates.push(date);
                }
                
              })

            }
          })
            
        })
      }

    });

    let votersData = {
      dates: pollDates,
      names: votersArray
    }

    console.log(votersData);

    return (
      <table>
        <VotersHeader dates={pollDates} />
        <VotersData votersData={votersData}/>
      </table>
    );
  }
}

function search(nameKey, myArray){
  for (var i=0; i < myArray.length; i++) {
      if (myArray[i].name === nameKey) {
          return i;
      }
  }
  return null;
}