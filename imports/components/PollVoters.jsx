import React from 'react';
import VotersHeader from './VotersHeader';
import VotersData from './VotersData';

const VALID_OPTIONS = ["yes", "1", "Hell yeah"];
let votersArray = [];

export default class PollVoters extends React.Component {
  
  render() {
    
    const data = this.props.data;
    const pollDates = [];
    const pollValidOptions = [];
    
    let votersMatrix = [];
    let validOptionFound = false;

    // Extract date for table header and voters for table data
    // TODO: Order dates asc
    data.forEach(pollData => {
      // Create date string and push to the pollDates array
      let date = new Date(pollData.date).getDate() + "." + (new Date(pollData.date).getMonth() + 1);
      pollDates.push(date);

      // Iterate over all poll answers in case some exist
      votersMatrix = pollData.answers;
      validOptionFound = false;

      if (votersMatrix !== undefined) {
        votersMatrix.forEach(answer => {

          // Check if answer is part of the valid options array and only process voters for these
          VALID_OPTIONS.forEach(validOption => {
            if(answer.option && validOption === answer.option.text) {
              updateVotersArray(answer, date);
              pollValidOptions.push(answer.option);
              validOptionFound = true;
            }
          })

          if(validOptionFound) {
            validOptionFound = false;
          } else if (/.*- 1$/.test(answer.option.text)) {
            updateVotersArray(answer, date);
            pollValidOptions.push(answer.option);
          }
            
        })
      }

    });

    let votersData = {
      dates: pollDates,
      options: pollValidOptions,
      names: votersArray
    }

    return (
      <table>
        <VotersHeader headersData={pollValidOptions} />
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

function updateVotersArray(answer, date) {
  answer.voters.forEach(voter => {
    // Search for voter name in the votersArray
    const res = search(voter, votersArray);

    // If voter does not exist, create a new object in the array
    if (res === null) {
      votersArray.push({
        name: voter,
        dates: [date],
        options: [answer.option]
      });
      // else, push the new date value in the resulting array from the search
    } else {
      votersArray[res].dates.push(date);
      votersArray[res].options.push(answer.option);
    }
  })
}