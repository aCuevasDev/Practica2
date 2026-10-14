import { Howl, Howler } from 'howler';

const songs = JSON.parse('songs.json').songs;

const randomBtn = document.getElementById('random');
const prevBtn = document.getElementById('prevButton');
const playPauseBtn = document.getElementById('playPauseButton');
const nextBtn = document.getElementById('nextButton');
const repeatBtn = document.getElementById('repeat');
const volumeSlider = document.getElementById('volumeSlider');

randomBtn.addEventListener('click', toggleRandom);
prevBtn.addEventListener('click', playPreviousSong);
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', playNextSong);
repeatBtn.addEventListener('click', toggleRepeat);
volumeSlider.addEventListener('onChange', volumeSliderChange);

document.onload(buildSongList); //TODO look for a nicer way


let isRandom = false;
let isRepeat = false;
let isPlaying = false;
let isMuted = false;

const howl = new Howl({
    src: ['songs/Pufino - Fantasy (freetouse.com).mp3'],
    html5: true,
});

howl.on("load", howlerLoaded);


function toggleRandom() {
    isRandom = !isRandom;
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    howl.loop(isRepeat);
}

function toggleMute() {
    isMuted = !isMuted;
    howl.mute(isMuted);
}

function playPreviousSong() {
    let activeSongIndex = songs.findIndex(song => song.file === howl._src);
    let nextSongIndex = activeSongIndex - 1;
    if (nextSongIndex < 0) {
        nextSongIndex = songs.length;
    }

    howl.stop();
    howl = new Howl({
        src: [songs[nextSongIndex].file],
        html5: true,
    });

}

function howlerLoaded() {
    playPauseBtn.classList.remove('disable');
    playPauseBtn.removeAttribute('disable');
}

function volumeSliderChange() {
    const volumeSpan = document.getElementById('volumeValue');
    const volume = volumeSlider.value;

    howl.volume(volume);
    volumeSpan.textContent = volume;
}

function progressBarChange() {
    const progressBar = document.getElementById('progressSlider');
    howl.pos //https://goldfirestudios.com/howler-js-modern-web-audio-javascript-library
}


function buildSongList() {
    const songListElement = document.querySelector("cards-container");
    songs.array.forEach(song => {
        let cardStr = `                
                <div class="card">
                    <img id="coverArt" src="${song.picture}" alt="Cover Art">
                    <span id="songName">${song.name}</span>
                    <span id="author">${song.author}</span>
                </div>`;
        songListElement.append(cardStr);
    });
}

function playSong() {

}
