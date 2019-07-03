import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SleepStatCard from './SleepStatCard';
import WorkStatCard from './WorkStatCard';

const App = () => (
  <div className="stat-container">
    <SleepStatCard />
    <WorkStatCard />
  </div>
);

/*
<KeyStatCard label="Health" iconSrc="#" iconFillPercent={50} />
<KeyStatCard label="Social" iconSrc="#" iconFillPercent={50} />
*/

ReactDOM.render(<App />, document.querySelector('main'));


