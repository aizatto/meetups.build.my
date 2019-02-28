import React from 'react';

const graphql = require('babel-plugin-relay/macro');

const {createPaginationContainer} = require('react-relay');

class OrganizationsPagination extends React.Component {
  render() {
    return (
      <div>
        <h1>
          Organizations <small>({this.renderTotalCount()})</small>
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
      return (
        <tr>
          <td>
            <a href={org.link} target="_blank" rel="noopener noreferrer">
              {org.name}
            </a>
          </td>
        </tr>
      );
    });

    return (
      <table className="table">
        <thead>
          <th>Name</th>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
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
