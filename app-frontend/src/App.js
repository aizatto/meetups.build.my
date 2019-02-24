import React, { Component } from 'react';
import {
  Container,
} from 'reactstrap';
import Navbar from './Navbar.js';
import {QueryRenderer} from 'react-relay';
import {environment} from './RelayEnvironment.js';
import Route from './routes/Events.js';
import Others from './Others.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navbar />
        <Container className="pt-3">
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
          <Others />
        </Container>
      </div>
    );
  }
}

export default App;
