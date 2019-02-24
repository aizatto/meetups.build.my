import ScrollPagination from './../components/ScrollPagination.js';
import Event from './../Event.js';
import React from 'react';

const graphql = require('babel-plugin-relay/macro');

const {createPaginationContainer} = require('react-relay');

class EventsPagination extends React.Component {
  render() {
    return (
      <div>
        <h1>
          Events <small>({this.renderTotalCount()})</small>
        </h1>
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

  renderEvents() {
    const edges  = this.props.viewer.events.edges;

    if (!edges || edges.length === 0) {
      return <div>No events have been shared.</div>;
    }

    const events = edges.map(edge => {
      const event = edge.node;
      return (
        <Event key={event.id} event={event} />
      );
    });

    return (
      <div>
        <ScrollPagination
          loadMore={() =>
            this.loadMore(this.props.viewer.events.edges.length * 2)}
          hasMore={this.props.relay.hasMore()}
          isLoading={this.props.relay.isLoading()}>
          {events}
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
