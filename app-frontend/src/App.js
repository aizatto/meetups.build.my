import React, { Component } from 'react';
import {
  Container,
} from 'reactstrap';
import Navbar from './Navbar.js';
import {QueryRenderer} from 'react-relay';
import {environment} from './RelayEnvironment.js';
import EventRoute from './routes/Events.js';
import OrganizationRoute from './routes/Organizations.js';
import Others from './Others.js';

const {Tab, Tabs} = require('aizatto/lib/react/bootstrap');

const tabsConfig = {
  events: {
    title: 'Events',
    route: EventRoute,
  },
  communities: {
    title: 'Communities',
    route: OrganizationRoute,
  },
};

class App extends Component {
  render() {
    const tabs = Object.keys(tabsConfig).map(key => {
      const tab = tabsConfig[key];
      const Route = tab.route;

      return (
        <Tab
          key={key}
          eventKey={key}
          title={tab.title}
          render={() => (
            <QueryRenderer
              environment={environment}
              query={Route.query}
              variables={{}}
              render={({error, props}) => {
                if (props) {
                  return Route.render(props);
                }

                const result = error ? 'Error' : ' Loading';

                return result;
              }}
            />
          )}
        />
      );
    });

    return (
      <div className="App">
        <Navbar />
        <Container className="pt-3">
          <Tabs className="mb-3">
            {tabs}
          </Tabs>
          <Others />
        </Container>
      </div>
    );
  }
}

export default App;
