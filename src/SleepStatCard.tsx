import * as React from 'react';
import KeyStatCard, { KeyStatCardProps } from './KeyStatCard';
import Fitbit, { FitBitSleepResponse, FitbitSleepDay, getSecondsOfDeepSleepForDay, convertSecondsToHoursForDisplay } from './Fitbit';
import Loader from './Loader';

// TODO: Move
type FitbitShape = {
  isAuthorized: Function;
  getSleepThisWeek: Function;
};

type SleepStatCardState = {
  rawStat: number;
  statForDisplay: string|number;
  authorized: boolean;
  error: null | string;
};

export default class SleepStatCard extends React.Component<{}, SleepStatCardState> {
  fitbit: FitbitShape;

  constructor(props: object) {
    super(props);
    this.fitbit = new Fitbit();
    this.state = {
      rawStat: 0,
      statForDisplay: null,
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
        statForDisplay: hoursAsleepThisWeek,
        rawStat: averageSecondsAsleepThisWeek / (60 * 60),
      });
      // document.querySelector('.fitbit-report').textContent = `Your deep/REM sleep averages ${hoursAsleepThisWeek}hrs. this week`;
    } catch (error) {
      this.setState({
        error: "There was a problem fetching data from Fitbit",
      });
    }
  }
  render() {
    const { statForDisplay, error, rawStat } = this.state;
    const LABEL = "Sleep";

    // Fitbit user average is 2.7
    const MAX_HOURS = 3;

    const cardProps: KeyStatCardProps = {
      stat: '-',
      label: 'Sleep',
      iconSrc: '/images/sleep.png',
      description: '',
      iconFillPercent: 0
    };

    if (statForDisplay) {
      const iconFillPercent = Math.min(
        1,
        Math.round((rawStat / MAX_HOURS))
      ) * 100;

      const description = `You've had an average of ${statForDisplay} hours of deep / REM sleep this week.`;
      return (
        <KeyStatCard {...cardProps} description={description} stat={statForDisplay} iconFillPercent={iconFillPercent} />
      );
    }
    if (error) {
      return (
        <KeyStatCard {...cardProps} description={error} />
      );
    }

    return <Loader />;
  }
}


