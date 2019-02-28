import React, { Component } from 'react';

class Others extends Component {

  render() {
    const Links = [
      {
        name: 'DevKami',
        url: 'https://devkami.com/page/meetups/',
      },
      {
        name: 'KL Meetups',
        url: 'http://malaysia.herokuapp.com/',
      },
      {
        name: 'Google Spreadsheet',
        url: 'https://docs.google.com/spreadsheets/d/16ncyDZH-wGN1XK9D0En2teWNw5WLnf-jrrfvzRaajgs/edit#gid=0'
      },
      {
        name: 'Engineers.SG',
        url: 'https://engineers.sg',
      },
    ];

    const lis = Links.map((link) => 
      <li key={link.name}>
        <a href={link.url}>{link.name}</a>
      </li>
    );
    return (
      <div className="mt-2">
        <div>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSerefGCg2zhIYh_cxeSP-zTbWVmu1dJhp8c_ZEKR9shSmku9A/viewform?usp=sf_link">Suggest a Community or Event</a>
        </div>
        Alternative Aggregators:
        <ul>{lis}</ul>
      </div>
    );
  }

}

export default Others;
