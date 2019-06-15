import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SleepStatCard from './SleepStatCard';
import HealthStatCard from './HealthStatCard';

const App = () => (
  <div className="stat-container">
    <SleepStatCard />
    <HealthStatCard />
  </div>
);

/*
<KeyStatCard label="Health" iconSrc="#" iconFillPercent={50} />
<KeyStatCard label="Social" iconSrc="#" iconFillPercent={50} />
*/

ReactDOM.render(<App />, document.querySelector('main'));


