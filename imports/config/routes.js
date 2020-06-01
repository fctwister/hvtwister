import React from 'react';
import { Router, Route, Switch } from 'react-router';
import history from 'history';

// route components
import VotersContainer from '../ui/containers/VotersContainer';

const browserHistory = history.createBrowserHistory();

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Switch>
      <Route exact path="/" component={VotersContainer}/>
    </Switch>
  </Router>
);