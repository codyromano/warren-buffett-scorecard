import * as React from 'react';
import KeyStatCard, { KeyStatCardProps } from './KeyStatCard';
import Fitbit, {
  FitBitSleepResponse,
  FitbitSleepDay,
  getSecondsOfDeepSleepForDay,
  convertSecondsToHoursForDisplay,
} from './Fitbit';
import Loader from './Loader';
import { FitbitShape, FitbitWeightResponse } from '../src/shapes/Fitbit';

const TARGET_WEIGHT = 165;

// Over 15lbs = 0% fill, 0lbs = 100% fill
const ICON_PROGRESS_THRESHOLD = 15;

type WeightStatCardState = {
  rawStat: number;
  statForDisplay: string | number;
  authorized: boolean;
  error: null | string | React.ReactElement;
};

export default class WeightStatCard extends React.Component<{}, WeightStatCardState> {
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
      const response: FitbitWeightResponse = await this.fitbit.getWeight();
      const currentWeight = response.weight[response.weight.length - 1].weight * 2.20462;
      const poundsFromTarget = Math.abs(TARGET_WEIGHT - currentWeight);

      this.setState({
        statForDisplay: poundsFromTarget.toFixed(1),
        rawStat: poundsFromTarget,
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
      label: 'Weight',
      iconSrc: '/images/weight.jpg',
      description: '',
      iconFillPercent: 0,
    };
    

    if (statForDisplay) {
      const iconFillPercent = 1 - (rawStat / ICON_PROGRESS_THRESHOLD);

      const description = `You're ${statForDisplay}lbs from your target weight.`;
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
