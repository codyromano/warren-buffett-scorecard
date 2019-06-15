import * as React from 'react';
import KeyStatCard from './KeyStatCard';
import Fitbit, { FitBitSleepResponse, FitbitSleepDay, getSecondsOfDeepSleepForDay, convertSecondsToHoursForDisplay } from './Fitbit';

/*
  const fitbitInfo = document.querySelector('.fitbit-report');
  const fitbit = new Fitbit();

  if (!fitbit.isAuthorized()) {
    fitbitInfo.querySelector('.authorize-fitbit').classList.remove('hidden');
    return Promise.reject();
  }

  try {
    const response: FitBitSleepResponse = await fitbit.getSleepThisWeek();

    const averageSecondsAsleepThisWeek = response.sleep.reduce((total: number, day: FitbitSleepDay): number => {
      const seconds: number = getSecondsOfDeepSleepForDay(day);
      return total + seconds;
    }, 0) / response.sleep.length;

    const hoursAsleepThisWeek: string = convertSecondsToHoursForDisplay(averageSecondsAsleepThisWeek);
    document.querySelector('.fitbit-report').textContent = `Your deep/REM sleep averages ${hoursAsleepThisWeek}hrs. this week`;
  } catch (error) {
    document.querySelector('.authorize-fitbit').classList.remove('hidden');
    return Promise.reject();
  }

  return Promise.resolve();
  */

// TODO: Move
type FitbitShape = {
  isAuthorized: Function;
  getSleepThisWeek: Function;
};

type HealthStatCardState = {
  stat: string|number;
  authorized: boolean;
  error: null | string;
};

export default class HealthStatCard extends React.Component<{}, HealthStatCardState> {
  fitbit: FitbitShape;

  constructor(props: object) {
    super(props);
    this.fitbit = new Fitbit();
    this.state = {
      stat: null,
      authorized: this.fitbit.isAuthorized(),
      error: null,
    };
  }
  componentDidMount() {
    this.fetchAndDisplayData();
  }
  async fetchAndDisplayData() {
    try {
      const response: FitBitSleepResponse = await this.fitbit.getSleepThisWeek();

      const averageSecondsAsleepThisWeek = response.sleep.reduce((total: number, day: FitbitSleepDay): number => {
        const seconds: number = getSecondsOfDeepSleepForDay(day);
        return total + seconds;
      }, 0) / response.sleep.length;
  
      const hoursAsleepThisWeek: string = convertSecondsToHoursForDisplay(averageSecondsAsleepThisWeek);
      this.setState({
        stat: hoursAsleepThisWeek,
      });
      // document.querySelector('.fitbit-report').textContent = `Your deep/REM sleep averages ${hoursAsleepThisWeek}hrs. this week`;
    } catch (error) {
      this.setState({
        error: "There was a problem fetching data from Fitbit",
      });
    }
  }
  render() {
    const { stat, error } = this.state;
    const LABEL = "Health";

    if (stat) {
      return (
        <KeyStatCard stat={stat} description={`You have averaged ${stat} hours of deep/REM sleep per night`} label={LABEL} iconSrc="/images/heart.jpg" iconFillPercent={50} />
      );
    }

    if (error) {
      return (
        <KeyStatCard stat={"-"} description={error} label={LABEL} iconSrc="/images/heart.jpg" iconFillPercent={50} />
      );
    }
    return <div>Loading</div>;
  }
}


