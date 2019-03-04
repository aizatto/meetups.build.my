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
      const dates = this.renderEventTimes(org);

      return (
        <tr key={org.id}>
          <td>
            <a href={org.link} target="_blank" rel="noopener noreferrer">
              {org.name}
            </a>
          </td>
          {dates}
        </tr>
      );
    });

    return (
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th style={{textAlign: "right"}}>Last Event At</th>
            <th>Next Event At</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }

  renderEventTimes(org) {
    if (org.requires_facebook_access_token) {
      return (
        <td colSpan="2">
          <div>
            Are you an Admin of this Facebook Group?
          </div>
          <a href={process.env.REACT_APP_FACEBOOK_LOGIN_URL}>Login to Facebook</a>
          {' '}
          to automatically add events to build.my
        </td>
      );
    }

    let last_event_at = this.renderDate(org.last_event_at, org.last_event_url);
    let next_event_at = this.renderDate(org.next_event_at, org.next_event_url);

    return(
      <React.Fragment>
        <td style={{textAlign: "right"}}>
          {last_event_at}
        </td>
        <td>
          {next_event_at}
        </td>
      </React.Fragment>
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
              requires_facebook_access_token
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
