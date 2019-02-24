import React, { Component } from 'react';
const graphql = require('babel-plugin-relay/macro');

const { createFragmentContainer } = require('react-relay');
const { Card } = require('reactstrap');
const { format, isSameDay } = require('date-fns');

class Event extends Component {

  render() {
    const event = this.props.event;
    return (
      <Card key={event.id} className="mb-2 p-3">
        <div>
          <a href={event.link} target="_blank" rel="noopener noreferrer">
            {event.name}
          </a>
        </div>
        <div>
          {this.renderDate()}
        </div>
        <div>
          {this.renderLocation()}
        </div>
      </Card>
    );
  }

  renderDate() {
    const { event } = this.props;
    const start_time = new Date(event.start_time);
    const end_time = new Date(event.end_time);

    const std = 'dddd Do MMMM YYYY h:mm A';

    if (isSameDay(start_time, end_time)) {
      return `${format(start_time, std)} - ${format(end_time, 'h:mm A')}`
    }

    return `${format(start_time, std)} - ${format(end_time, std)}`
  }

  renderLocation() {
    const { event } = this.props;
    const query = [
      event.venue,
      event.place,
      event.city,
      event.country
    ].filter(q => q).join(', ');

    const href = `https://www.google.com/maps/search/?api=1&query=${query}`

    const Url = (props) => {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {props.children}
        </a>
      );
    }

    const address = [
      event.place,
      event.city,
      event.country
    ];
    
    const comma_seperated_addresses = address.filter(add => add).join(', ');
    console.log(comma_seperated_addresses);

    return (
      <div>
        <div>
          <Url>
            {event.venue}
          </Url>
        </div>
        <div>
          <Url>
            {comma_seperated_addresses}
          </Url>
        </div>
      </div>
    );
  }

}

export default createFragmentContainer(Event, {
  event: graphql`
    fragment Event_event on Event {
      id
      link
      name
      description
      start_time
      end_time
      venue
      city
      country
      place
    }
  `,
});
