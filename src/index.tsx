import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import './showReport';
// import './fitbit';
import HealthStatCard from './HealthStatCard';

//     <KeyStatCard stat={"1.0"} description={"Your average deep sleep is higher than yesterday."} label="Sleep" iconSrc="/images/tent.jpg" iconFillPercent={30} />
const App = () => (
  <div className="stat-container">
    <HealthStatCard />
  </div>
);

/*
<KeyStatCard label="Health" iconSrc="#" iconFillPercent={50} />
<KeyStatCard label="Social" iconSrc="#" iconFillPercent={50} />
*/

ReactDOM.render(<App />, document.querySelector('main'));


