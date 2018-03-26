import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import logo from './images/logo.png';
import unknownImage from './images/unknownImage.png';
import registerServiceWorker from './registerServiceWorker';
import ReactPlayer from 'react-player'

class App extends React.Component {
  render() {
    return (
      <div>
        <Logo />
        <Player />
        <History />
      </div>
    );
  }
}
// It's basically just the WYEP logo block-centered
function Logo(props) {
  return (
    <div className='blockCenter'>
      <img src={logo} alt='logo' className='logo'/>
    </div>
  )
}
// Shows the current song and a play/stop button to control
// streaming of the WYEP radio stream
class Player extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      play: false, // used by React Player to toggle on/off
      streamURL: '',
      currentSongId: null, // the id for the setInterval call that repeatedly updates the song information
      trackName: 'searching...',
      artistName: 'searching...',
      buttonStatus: 'far fa-3x fa-play-circle', //className string forfont-awesome play/stop button
    }
  }
  // gets WYEP's current information from the NPR Composer API
  // and updates the player's state with the current track and artist
  getCurrentSong = () => {
    const that = this; // to store the component global scope, used in the fetch call
    fetch('https://api.composer.nprstations.org/v1/widget/50e451b6a93e91ee0a00028e/tracks?format=json&limit=10&hide_amazon=false&hide_itunes=false&hide_arkiv=false&share_format=false')
    .then(function(response) {
      return response.json();
    })
    .then(function(wyepJson) {
      if(wyepJson.onNow.hasOwnProperty('song')) {
        that.setState({ // 'that' refers to the component global scope
          artistName: wyepJson.onNow.song.artistName,
          songName: wyepJson.onNow.song.trackName,
        });
      }
    });
  }
  // when the player loads, first get the current song. Then, set up recurring function calls
  // for the current song to take place every 10 seconds
  componentDidMount() {
    this.getCurrentSong();
    const currentSongId = setInterval(this.getCurrentSong, 10000);
    this.setState({currentSongId: currentSongId});
  }
  // if the player ever is removed from the page, stop the browser from making any more
  // calls to the current song
  componentWillUnmount() {
    clearInterval(this.currentSongId);
  }
  // an event handler for when the play/stop button is pressed
  togglePlay = () => {
    if (this.state.play) { //if currently playing, stop the stream (including background downloading)
      this.setState({
        play: false,
        // the below streamURL causes react to update the audio player's
        // src attribute, BUT NOT reload the entire audio
        // player. This is neccesary to disconnect from
        // the stream when the stop button is pressed.
        // There is no stop.mp3 file.
        streamURL: 'stop.mp3',
        buttonStatus: 'far fa-3x fa-play-circle',
      });
    } else { // if currently stopped, play the stream
      this.setState({
        play: true,
        streamURL: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WYEPFMAAC.aac',
        buttonStatus: 'far fa-3x fa-stop-circle',
      });
    }
  }
  render () {
    return (
      <div className='blockCenter currentCard'>
        <Status value='Now Playing' />
        <img src={unknownImage} alt='unknown album' /> {/* a placeholder for whenever I decide to include album covers for songs */}
        <div className='songInfo'>
          <p>{this.state.songName} by</p>
          <p>{this.state.artistName}</p>
        </div>
        <div className='playStopButton' onClick={this.togglePlay} >
           {/* buttonStatus is a string that holds a string containing the corresponding class names for play/stop buttons from the
           linked (in index.html) font-awesome CSS file. See index.html's head for the link. */}
          <i className={`${this.state.buttonStatus}`}></i>
        </div>
        {/* hide the audio player, so we can use the above play/stop button to control the stream
            the attributes in the config attribute are important for stopping and playing of the 
            stream without unneccesary background downloading of the stream */}
        <ReactPlayer
        className='hide'
        url={this.state.streamURL} 
        playing={this.state.play} 
        controls={false}
        config={{
          file: {
            attributes: {preload: 'none', autoPlay: 'true'}
          }
        }}
        />
      </div>
    )
  }
}
// Component for simple headers. Not really sure this needed to be a component, but maybe it'll get fancier in a later version.
function Status(props) {
  return (
    <div className='textCenter header'>
      <p>{props.value}</p>
    </div>
  )
}
// Show the previously played songs
class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pastSongsTracks: new Array(10),
      pastSongsArtists: new Array(10),
      pastSongsId: null,
    }
  }
  // get information on previously played songs
  getPastSongs = () => {
    const that = this; // refer to comments on this same pattern in Player's getCurrentSongs()
    fetch('https://api.composer.nprstations.org/v1/widget/50e451b6a93e91ee0a00028e/tracks?format=json&limit=10&hide_amazon=false&hide_itunes=false&hide_arkiv=false&share_format=false')
    .then(function(response) {
      return response.json();
    })
    .then(function(wyepJson) {
      if(wyepJson.hasOwnProperty('tracklist')) {
        let trackNameArr = [];
        let artistNameArr = [];
        for (let i=0; i< wyepJson.tracklist.results.length; i++) {
          trackNameArr.push(wyepJson.tracklist.results[i].song.trackName);
          artistNameArr.push(wyepJson.tracklist.results[i].song.artistName);
        }
        that.setState({
          pastSongsTracks: trackNameArr,
          pastSongsArtists: artistNameArr,
        })
      }
    });
  }
  componentDidMount() {
    this.getPastSongs(); // get the current information and then...
    // update the previously played song information every 10 seconds
    const pastSongsId = setInterval(this.getPastSongs, 10000);
    this.setState({pastSongsId: pastSongsId});
  }
  componentWillUnmount() {
    // when component is removed, stop making repeated calls to getPastSongs
    clearInterval(this.pastSongsId);
  }
  render() {
    return (
      <div className='historyContainer'>
        <Status value='Previously Played' />
        <HistoryItem 
        trackName={this.state.pastSongsTracks[0]}
        artistName={this.state.pastSongsArtists[0]}
        />
        <HistoryItem 
        trackName={this.state.pastSongsTracks[1]}
        artistName={this.state.pastSongsArtists[1]}
        />
        <HistoryItem 
        trackName={this.state.pastSongsTracks[2]}
        artistName={this.state.pastSongsArtists[2]}
        />
      </div>
    )
  }
}
// a component that contains information on a single previously played song
class HistoryItem extends React.Component {
  render() {
    return (
      <div className='historyItem'>
        <div className='historyAlbum'>
          <img src={unknownImage} alt='unknown'/>
        </div>
        <div className='historyInfo'>
          <div>{this.props.trackName}</div>
          <div>{this.props.artistName}</div>
        </div>
      </div>
    )
  }
}
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
