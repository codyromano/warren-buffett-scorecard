import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SleepStatCard from './SleepStatCard';
import WorkStatCard from './WorkStatCard';
import WeightStatCard from './WeightStatCard';

const App = () => (
  <div className="stat-container">
    <SleepStatCard />
    <WorkStatCard />
    <WeightStatCard />
  </div>
);

ReactDOM.render(<App />, document.querySelector('main'));


