import * as React from 'React';

type PreloadImageProps = {
  src: string;
  className?: string;
  style?: object;
};


type State = {
  loaded: boolean;
};

export default class PreloadImage extends React.Component<PreloadImageProps, State> {
  constructor(props: PreloadImageProps) {
    super(props);
    this.state = {
      loaded: false
    };
  }
  componentDidMount() {
    const { src } = this.props;
    const img = document.createElement('img');
    img.addEventListener('load', () => {
      this.setState({
        loaded: true,
      });
    });
    img.src = src;
  }
  render() {
    const { loaded } = this.state;

    if (loaded) {
      return <img {...this.props} />;
    }
    return null;
  }
}