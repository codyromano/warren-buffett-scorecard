import * as React from 'react';
import KeyStatCard, { KeyStatCardProps } from './KeyStatCard';
import Loader from './Loader';

type State = {
  rawStat: number;
  statForDisplay: string | number;
  error: null | string | React.ReactElement;
};

export default class WorkStatCard extends React.Component<{}, State> {
  static COMMIT_COUNT_URL =
    'https://internal-scorecard.s3-us-west-2.amazonaws.com/countOfMyGitCommits.txt';

  constructor(props: object) {
    super(props);
    this.state = {
      rawStat: 0,
      statForDisplay: null,
      error: null,
    };
  }
  componentDidMount() {
    this.fetchAndDisplayData();
  }
  async fetchAndDisplayData() {
    try {
      const countCommitsTextFileContent = await window
        .fetch(WorkStatCard.COMMIT_COUNT_URL)
        .then((resp) => resp.text());
      const [totalRecentCommits] = countCommitsTextFileContent.match(/\w*([0-9]{1,})/);

      this.setState({
        statForDisplay: totalRecentCommits,
        rawStat: parseInt(totalRecentCommits, 10),
      });
    } catch (error) {
      this.setState({
        error: <span>Error fetching data from S3</span>,
      });
    }
  }
  render() {
    const { statForDisplay, error, rawStat } = this.state;
    const LABEL = 'Work';

    // Fitbit user average is 2.7
    const MAX_COMMITS = 10;

    const cardProps: KeyStatCardProps = {
      stat: '-',
      label: 'Work',
      iconSrc: '/images/work.jpg',
      description: '',
      iconFillPercent: 0,
    };

    if (statForDisplay) {
      const iconFillPercent = Math.min(1, rawStat / MAX_COMMITS);
      const description = `${statForDisplay} code pushes to Airbnb in the past 10 days`;
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
