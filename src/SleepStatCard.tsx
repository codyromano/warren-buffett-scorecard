import * as React from 'react';
import KeyStatCard, { KeyStatCardProps } from './KeyStatCard';
import Fitbit, {
  FitBitSleepResponse,
  FitbitSleepDay,
  getSecondsOfDeepSleepForDay,
  convertSecondsToHoursForDisplay,
} from './Fitbit';
import Loader from './Loader';

// TODO: Move
type FitbitShape = {
  isAuthorized: Function;
  getSleepThisWeek: Function;
  authorize: Function;
};

type SleepStatCardState = {
  rawStat: number;
  statForDisplay: string | number;
  authorized: boolean;
  error: null | string | React.ReactElement;
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
    this.fetchAndDisplayData = this.fetchAndDisplayData.bind(this);
    this.onSignInClicked = this.onSignInClicked.bind(this);
  }
  componentDidMount() {
    this.fetchAndDisplayData();
  }
  onSignInClicked(event: any) {
    this.fitbit.authorize();
  }
  async fetchAndDisplayData() {
    try {
      const response: FitBitSleepResponse = await this.fitbit.getSleepThisWeek();

      const averageSecondsAsleepThisWeek =
        response.sleep.reduce((total: number, day: FitbitSleepDay): number => {
          const seconds: number = getSecondsOfDeepSleepForDay(day);
          return total + seconds;
        }, 0) / response.sleep.length;

      const hoursAsleepThisWeek: string = convertSecondsToHoursForDisplay(
        averageSecondsAsleepThisWeek,
      );
      this.setState({
        statForDisplay: hoursAsleepThisWeek,
        rawStat: averageSecondsAsleepThisWeek / (60 * 60),
      });
    } catch (error) {
      this.setState({
        error: (
          <span>
            Please{' '}
            <a href="#" onClick={this.onSignInClicked}>
              login in to Fitbit
            </a>{' '}
            to access your data.
          </span>
        ),
      });
    }
  }
  render() {
    const { statForDisplay, error, rawStat } = this.state;
    const LABEL = 'Sleep';

    // Fitbit user average is 2.7
    const MAX_HOURS = 3;

    const cardProps: KeyStatCardProps = {
      stat: '-',
      label: 'Sleep',
      iconSrc: '/images/sleep.png',
      description: '',
      iconFillPercent: 0,
    };

    if (statForDisplay) {
      const iconFillPercent = rawStat / MAX_HOURS;

      const description = `You're averaging ${statForDisplay} hours of REM sleep this week.`;
      return (
        <KeyStatCard
          {...cardProps}
          description={description}
          stat={statForDisplay}
          iconFillPercent={iconFillPercent * 100}
        />
      );
    }
    if (error) {
      return <KeyStatCard {...cardProps} description={error} />;
    }

    return <Loader />;
  }
}
