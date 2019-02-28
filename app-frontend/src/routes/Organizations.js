import React from 'react';
import { format, distanceInWordsToNow } from 'date-fns';

const graphql = require('babel-plugin-relay/macro');

const {createPaginationContainer} = require('react-relay');

class OrganizationsPagination extends React.Component {
  render() {
    return (
      <div>
        <h1>
          Communities <small>({this.renderTotalCount()})</small>
        </h1>
        {this.renderOrganizations()}
      </div>
    );
  }

  renderTotalCount() {
    const count = this.props.viewer.organizations.edges.length;
    const totalCount = this.props.viewer.organizations.totalCount;

    if (!this.props.relay.hasMore()) {
      return totalCount;
    }

    return (
      <span onClick={() => this.loadMore(totalCount)}>
        {count} of {totalCount}
      </span>
    );
  }

  renderOrganizations() {
    const rows = this.props.viewer.organizations.edges.map(({node: org}) => {
      const last_event_at = this.renderDate(org.last_event_at, org.last_event_url);
      const next_event_at = this.renderDate(org.next_event_at, org.next_event_url);

      return (
        <tr>
          <td>
            <a href={org.link} target="_blank" rel="noopener noreferrer">
              {org.name}
            </a>
          </td>
          <td style={{textAlign: "right"}}>
            {last_event_at}
          </td>
          <td>
            {next_event_at}
          </td>
        </tr>
      );
    });

    return (
      <table className="table">
        <thead>
          <th>Name</th>
          <th style={{textAlign: "right"}}>Last Event At</th>
          <th>Next Event At</th>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }

  renderDate(time, url) {
    if (!time) {
      return null;
    }

    let date = new Date(time);
    const word = date <= new Date() ? 'ago' : 'from now';
    return (
      <div>
        <a href={url} rel="noreferrer noopener" target="_blank">
          {format(date, 'ddd Do MMMM YYYY')}
        </a>
        <div>
          <small className="font-weight-lighter">
            {distanceInWordsToNow(date)}
            {' '}
            {word}
          </small>
        </div>
      </div>
    );
  }

}

const OrganizationsPaginationContainer = createPaginationContainer(
  OrganizationsPagination,
  {
    viewer: graphql`
      fragment Organizations_viewer on Viewer {
        organizations(
          first: $count
          after: $cursor
        ) @connection(key: "Organizations_organizations") {
          edges {
            node {
              id
              name
              link
              last_event_at
              last_event_url
              next_event_at
              next_event_url
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
      query OrganizationsRoutePaginationQuery($count: Int!, $cursor: String) {
        viewer {
          ...Organizations_viewer
        }
      }
    `,
  },
);

export default {
  query: graphql`
    query OrganizationsQuery(
      $count: Int
      $cursor: String
    ) {
      viewer {
        ...Organizations_viewer
      }
    }
  `,
  variables: {
    count: 50,
  },
  render: props => {
    return (
      <div>
        <OrganizationsPaginationContainer {...props} />
      </div>
    );
  },
};
