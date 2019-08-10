import React from "react";
import ReactDOM from "react-dom";
import { Provider as ReduxProvider } from "react-redux";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import "./app.scss";

import store from "./store";

import Homepage from "./containers/Homepage";
import Messages from "./containers/Messages";

const rootDivId = "lightnovel-crawler-root";

class App extends React.Component {
  render() {
    return (
      <ReduxProvider store={store}>
        <Router>
          <Messages />
          <Switch>
            <Route path="/*" component={Homepage} />
          </Switch>
        </Router>
      </ReduxProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById(rootDivId));
