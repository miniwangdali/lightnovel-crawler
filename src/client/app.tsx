import React from "react";
import ReactDOM from "react-dom";
import { Provider as ReduxProvider } from "react-redux";
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import "./app.scss";

import store from "./store";

import Homepage from "./containers/Homepage";
import Messages from "./containers/Messages";
import ImageGallery from "./containers/ImageGallery";

const rootDivId = "lightnovel-crawler-root";

class App extends React.Component {
  render() {
    return (
      <ReduxProvider store={store}>
        <Router>
          <React.Fragment>
            <Messages />
            <Route path="/" component={Homepage} />
            <Route path="/images-preview" component={ImageGallery} />
          </React.Fragment>
        </Router>
      </ReduxProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById(rootDivId));
