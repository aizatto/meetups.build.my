import ScrollPagination from './../components/ScrollPagination.js';
import Event from './../Event.js';
import React from 'react';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { format } from 'date-fns';
import { groupBy } from 'underscore';

const graphql = require('babel-plugin-relay/macro');

const {createPaginationContainer} = require('react-relay');

class EventsPagination extends React.Component {
  render() {
    return (
      <div>
        <h1>
          Events <small>({this.renderTotalCount()})</small>
        </h1>
        {this.renderUpcoming()}
        {this.renderEvents()}
      </div>
    );
  }

  renderTotalCount() {
    const count = this.props.viewer.events.edges.length;
    const totalCount = this.props.viewer.events.totalCount;

    if (!this.props.relay.hasMore()) {
      return totalCount;
    }

    return (
      <span onClick={() => this.loadMore(totalCount)}>
        {count} of {totalCount}
      </span>
    );
  }
  
  renderUpcoming() {
    const edges = this.props.viewer.events.edges;

    if (!edges || edges.length === 0) {
      return null;
    }

    const today = new Date();

    const range = (date) => { 
      const start_of_day = startOfDay(date);
      const end_of_day = endOfDay(date);
      const name = format(date, 'ddd MMM Do');

      return {
        name,
        count: 0,
        fn: (start_time, end_time) => {
          // day is inbetween
          if (start_time <= start_of_day && end_of_day <= end_time) {
            return true;
          }

          if (start_of_day <= start_time && start_time <= end_of_day) {
            return true;
          }

          if (start_of_day <= end_time && end_time <= end_of_day) {
            return true;
          }
        }
      };
    }

    let dates = [
      range(today),
      range(addDays(today, 1)),
      range(addDays(today, 2)),
      range(addDays(today, 3)),
      {
        name: `${format(addDays(today, 4), 'ddd MMM Do')}+`,
        fn: () => true,
        count: 0,
      },
    ];

    edges.forEach((edge) => {
      const event = edge.node;
      const start_time = new Date(event.start_time);
      const end_time = new Date(event.end_time);

      for (const key in dates) {
        let date = dates[key]
        if (date.fn(start_time, end_time)) {
          return date.count += 1;
        }
      }
    });

    let headers = [];
    let cells = [];

    dates.forEach(date => {
      headers.push(
        <th key={date.name}>
          {date.name}
        </th>
      );
      cells.push(
        <td key={date.name}>
          {date.count}
        </td>
      );
    });

    return (
      <table className="table">
        <thead>
          <tr>
            {headers}
          </tr>
        </thead>
        <tbody>
          <tr>
            {cells}
          </tr>
        </tbody>
      </table>
    );
  }

  renderEvents() {
    const edges  = this.props.viewer.events.edges;

    if (!edges || edges.length === 0) {
      return <div>No events have been shared.</div>;
    }

    const group = groupBy(edges, edge => {
      const start_time = new Date(edge.node.start_time);
      let end_of_day = endOfDay(new Date());

      if (start_time <= endOfDay) {
        return end_of_day.toISOString();
      } else {
        return endOfDay(start_time).toISOString();
      }
    });

    const cells = [];
    for (const key in group) {
      const date = new Date(key);

      const day_events = group[key].map((edge) => {
        const event = edge.node;
        return (
          <Event key={event.id} event={event} />
        );
      });

      cells.push(
        <div key={key}>
          <h3>{format(date, 'ddd Do MMMM YYYY')} <small>({day_events.length})</small></h3>
          {day_events}
        </div>
      );
    }

    return (
      <div>
        <ScrollPagination
          loadMore={() =>
            this.loadMore(this.props.viewer.events.edges.length * 2)}
          hasMore={this.props.relay.hasMore()}
          isLoading={this.props.relay.isLoading()}>
          {cells}
        </ScrollPagination>
      </div>
    );
  }

  loadMore(pageSize) {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return;
    }

    this.props.relay.loadMore(pageSize, e => {
      e && console.error(e);
    });
  }
}

const EventsPaginationContainer = createPaginationContainer(
  EventsPagination,
  {
    viewer: graphql`
      fragment Events_viewer on Viewer {
        events(
          first: $count
          after: $cursor
        ) @connection(key: "Events_events") {
          edges {
            node {
              id
              start_time
              end_time
              ...Event_event
            }
          }
          totalCount
        }
      }
    `,
  },
  {
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
      };
    },
    query: graphql`
      query EventsRoutePaginationQuery($count: Int!, $cursor: String) {
        viewer {
          ...Events_viewer
        }
      }
    `,
  },
);

export default {
  query: graphql`
    query EventsQuery(
      $count: Int
      $cursor: String
    ) {
      viewer {
        ...Events_viewer
      }
    }
  `,
  variables: {
    count: 50,
  },
  render: props => {
    return (
      <div>
        <EventsPaginationContainer {...props} />
      </div>
    );
  },
};
