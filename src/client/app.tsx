import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import './app.scss';

import Homepage from './containers/Homepage';

const rootDivId = 'lightnovel-crawler-root';

class App extends React.Component {
  render () {
    return <Router>
      <Switch>
        <Route path="/*" component={Homepage} />
      </Switch>
    </Router>;
  }
}

ReactDOM.render(<App />, document.getElementById(rootDivId));