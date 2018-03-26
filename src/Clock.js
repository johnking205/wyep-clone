class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: new Date().toLocaleTimeString(),
      tickID: null,
      buttonStr: 'STOP',
    }
  }
  componentDidMount() {
    const tickID = setInterval(() => this.setState({
      time: new Date().toLocaleTimeString(),
    }), 1000);
    this.setState({tickID: tickID});
  }
  componentWillUnmount() {
    clearInterval(this.state.tickID);
  }
  toggleClock = () => {
    if(this.state.tickID) {
      clearInterval(this.state.tickID);
      this.setState({tickID: null, buttonStr: 'RESUME',});
    } else {
      this.componentDidMount();
      this.setState({buttonStr: 'STOP'});
    }
  }
  render() {
    return (
    <div>
      <h2>It is {this.state.time}.</h2>
      <button onClick={this.toggleClock}>{this.state.buttonStr}</button>
    </div>
    )
  }
}