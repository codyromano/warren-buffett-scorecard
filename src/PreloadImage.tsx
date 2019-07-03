import * as React from 'React';

type PreloadImageProps = {
  src: string;
  className?: string;
  style?: object;
  height: number;
  width: number;
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
    const { height, width } = this.props;
    const { loaded } = this.state;
    const size = {
      height: `${height}px`,
      width: `${width}px`,
    };

    if (loaded) {
      return <img {...size} {...this.props} />;
    }
    return <div {...size}>&nbsp;</div>;
  }
}