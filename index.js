import { getRandomInt, formatTime } from "./helper.js";

const REFRESH_INTERVAL_MS = 250;
const SORT_MODE =
{
    NAME: "name",
    AUTHOR: "author",
    DURATION: "duration"
};

let isRandom = false;
let isRepeat = false;
let isMuted = false;
let howl;
let currentSongIndex = 0;

const randomBtn = document.getElementById('random');
const prevBtn = document.getElementById('prevButton');
const playPauseBtn = document.getElementById('playPauseButton');
const nextBtn = document.getElementById('nextButton');
const repeatBtn = document.getElementById('repeat');
const volumeSlider = document.getElementById('volumeSlider');
const muteLabel = document.getElementById('muteVolume');
const progressSlider = document.getElementById('progressSlider');
const currentTimeSpan = document.getElementById('currentTime');
const songListElement = document.querySelector(".cards-container");


// ===== Equalizer =====
const EQ_BANDS = [
    { type: 'lowshelf', frequency: 200 },            // Graves
    { type: 'peaking', frequency: 1000, Q: 1 },      // Medios
    { type: 'highshelf', frequency: 3000 }           // Agudos
];
const SPECTRUM_BARS = 40;

const spectrumEl = document.querySelector('#equalizer .spectrum');
const eqSliders = document.querySelectorAll('#equalizer .eq-slider');
const eqResetBtn = document.getElementById('eqReset');

let eqFilters = [];
let analyser;
let freqData;
let spectrumBars = [];
let equalizerReady = false;


let songs;
try {
    const response = await fetch('./songs.json');
    if (!response.ok) {
        throw new Error(`Failed to load songs.json: ${response.status} ${response.statusText}`);
    }
    const songFile = await response.json();
    songs = songFile.songs;
} catch (error) {
    console.error('Error loading songs json file.', error);
    songs = [];
}



function toggleRandom() {
    isRandom = !isRandom;
    randomBtn.setAttribute('aria-pressed', isRandom);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatBtn.setAttribute('aria-pressed', isRepeat);

    if (howl)
        howl.loop(isRepeat);
}

function toggleMute() {
    setMuted(!isMuted);
}

function setMuted(muted) {
    isMuted = muted;
    muteLabel.setAttribute('aria-pressed', muted);
    muteLabel.textContent = muted ? '🔇' : '🔈';

    if (howl)
        howl.mute(isMuted);
}

function togglePlayPause() {
    if (!howl) {
        playSong(currentSongIndex);
        return;
    }

    if (!howl.playing())
        howl.play();
    else howl.pause();

    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    playPauseBtn.textContent = howl.playing() ? '⏸️' : '▶️';
}

//Gets Previous or Next song index on the list based on the parameter given
//@beforeOrAfter has to be either "Before" for previous song or "After" for the next song
function getSongIndexFor(beforeOrAfter = "Before") {
    let nextSongIndex;
    let sanitizedStr = beforeOrAfter.trim().toLowerCase();

    if (sanitizedStr === "before")
        nextSongIndex = currentSongIndex - 1;
    else if (sanitizedStr === "after")
        nextSongIndex = currentSongIndex + 1;
    else throw new Error("Invalid parameter");

    if (nextSongIndex < 0)
        nextSongIndex = songs.length - 1;

    if (nextSongIndex >= songs.length)
        nextSongIndex = 0;


    return nextSongIndex;
}

function playNextSong() {
    playSongController("after");
}

function playPreviousSong() {
    playSongController("before");
}

function playSongController(beforeOrAfter) {
    if (isRandom) {
        playRandomSong();
        return;
    }

    let songIndex = getSongIndexFor(beforeOrAfter);
    playSong(songIndex);
}

function playRandomSong() {
    let randomIndex;
    if (songs.length > 1) {
        do {
            randomIndex = getRandomInt(0, songs.length);
        } while (randomIndex === currentSongIndex);
        playSong(randomIndex);
    }
}

function onSongEnd() {
    if (isRepeat)
        return;

    playNextSong();
}

function howlerLoaded() {
    setTotalDuration();
    updatePlayPauseButton();
}

function howlerLoadError(id, error) {
    console.error(`Error loading audio (id ${id}):`, error);
}

function howlerPlayError(id, error) {
    console.error(`Error playing audio (id ${id}):`, error);
}

function volumeSliderChange() {
    const volumeSpan = document.getElementById('volumeValue');
    const volume = Number(volumeSlider.value);

    if (howl)
        howl.volume(volume);

    volumeSpan.textContent = Math.round(volume * 100) + '%';
    updateSliderFill(volumeSlider);

    setMuted(volume === 0);
}

function buildSongList() {
    songListElement.innerHTML = "";

    songs.forEach((song, index) => {
        let cardStr = `                
                <div class="card" data-index="${index}" >
                    <img class="coverArt" src="${song.picture}" alt="Cover Art">
                    <span class="songName">${song.name}</span>
                    <span class="author">${song.author}</span>
                    <span class="duration">${formatTime(song.duration)}</span>
                </div>`;

        songListElement.insertAdjacentHTML('beforeend', cardStr);
    });
}

function handleSongListClick(event) {
    const card = event.target.closest('.card');
    if (card) {
        let index = Number(card.dataset.index);
        playSong(index);
    }
}


function playSong(songIndex) {
    const song = songs[songIndex];

    if (!song)
        return;

    createPlayer(song);
    currentSongIndex = songIndex;
    renderNowPlaying(song);
    highlightSongCard(currentSongIndex);
    resetProgressBar();
    //updatePlayPauseButton(); both are called after song is loaded @ howlerLoaded();
    //setTotalDuration(); 
}

function createPlayer(song) {
    if (howl)
        howl.unload();

    howl = new Howl(
        {
            src: song.file,
            volume: Number(volumeSlider.value),
            loop: isRepeat,
            mute: isMuted,
            onend: onSongEnd,
            onload: howlerLoaded,
            onloaderror: howlerLoadError,
            onplayerror: howlerPlayError
        });

    setupEqualizer();
    howl.play();
}

function renderNowPlaying(song) {
    document.querySelectorAll('.currentCover').forEach(element => element.src = song.picture);
    document.querySelectorAll('.currentSong').forEach(element => element.textContent = song.name);
    document.querySelectorAll('.currentAuthor').forEach(element => element.textContent = song.author);

    document.getElementById('currentlyPlaying').hidden = false;
}

function highlightSongCard(index) {
    document.querySelectorAll(".playing")
        .forEach(elem => elem.classList.remove("playing"));

    const card = document.querySelector(`.card[data-index="${index}"]`);
    card?.classList.add("playing");
}


function setTotalDuration() {
    const durationSpan = document.getElementById("totalTime");
    let currentSongDuration = howl.duration();

    durationSpan.textContent = formatTime(currentSongDuration);
    progressSlider.max = currentSongDuration;
}

function setTotalSongNumber() {
    let totalSongNumberLabel = document.getElementById('totalSongNumber');
    totalSongNumberLabel.textContent = `${songs.length} canciones`;
}

function updateCurrentProgressSongInterval() {

    if (!howl)
        return;

    const currentPosition = howl.seek();
    progressSlider.value = currentPosition;
    updateSliderFill(progressSlider);

    currentTimeSpan.textContent = formatTime(currentPosition);
}

function progressBarChange() {

    if (!howl) {
        resetProgressBar();
        return;
    }

    const currentPosition = Number(progressSlider.value);
    howl.seek(currentPosition);
    currentTimeSpan.textContent = formatTime(currentPosition);

}

function resetProgressBar() {
    progressSlider.value = 0;
    currentTimeSpan.textContent = formatTime(0);
}

function updateSliderFill(slider) {
    slider.style.setProperty('--progress', (slider.value / slider.max * 100) + '%');
}

// ===== Equalizer =====
// Wire Howler.masterGain -> EQ filters -> analyser -> speakers (once)
function setupEqualizer() {
    if (equalizerReady || !Howler.ctx || !Howler.masterGain)
        return;

    const ctx = Howler.ctx;

    eqFilters = EQ_BANDS.map(band => {
        const filter = ctx.createBiquadFilter();
        filter.type = band.type;
        filter.frequency.value = band.frequency;
        if (band.Q) filter.Q.value = band.Q;
        filter.gain.value = 0;
        return filter;
    });

    for (let i = 0; i < eqFilters.length - 1; i++)
        eqFilters[i].connect(eqFilters[i + 1]);

    analyser = ctx.createAnalyser();
    analyser.fftSize = 128;              // -> 64 frequency bins
    freqData = new Uint8Array(analyser.frequencyBinCount);

    // Reroute the audio through our chain
    Howler.masterGain.disconnect();
    Howler.masterGain.connect(eqFilters[0]);
    eqFilters[eqFilters.length - 1].connect(analyser);
    analyser.connect(ctx.destination);

    buildSpectrum();
    requestAnimationFrame(drawSpectrum);
    equalizerReady = true;
}

function buildSpectrum() {
    spectrumEl.innerHTML = '';
    spectrumBars = [];

    for (let i = 0; i < SPECTRUM_BARS; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        spectrumEl.appendChild(bar);
        spectrumBars.push(bar);
    }
}

function drawSpectrum() {
    requestAnimationFrame(drawSpectrum);

    if (!analyser)
        return;

    analyser.getByteFrequencyData(freqData);

    // High frequencies are mostly empty, so only use the lower ~65% of the bins
    const usableBins = Math.floor(freqData.length * 0.65);
    for (let i = 0; i < spectrumBars.length; i++) {
        const bin = Math.floor(i / spectrumBars.length * usableBins);
        spectrumBars[i].style.height = (freqData[bin] / 255 * 100) + '%';
    }
}

function onEqSliderInput(event) {
    const slider = event.target;
    const index = Number(slider.dataset.band);

    eqFilters[index]?.gain.setValueAtTime(Number(slider.value), Howler.ctx.currentTime);
    slider.parentElement.querySelector('.value').textContent = slider.value + ' dB';
}

function resetEqualizer() {
    eqSliders.forEach(slider => {
        slider.value = 0;
        eqFilters[Number(slider.dataset.band)]?.gain.setValueAtTime(0, Howler.ctx.currentTime);
        slider.parentElement.querySelector('.value').textContent = '0 dB';
    });
}

// sortMode : SORT_MODE
function sortSongList(sortMode, sortOrder) {
    switch (sortMode) {
        case 'name':
            songs.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'author':
            songs.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'duration':
            songs.sort((a, b) => (a.duration - b.duration));
            break;
    }

    if (sortOrder !== 'desc')
        songs.reverse();
}

// SETTING LISTENERS AND EVENTS
function init() {
    randomBtn.addEventListener('click', toggleRandom);
    prevBtn.addEventListener('click', playPreviousSong);
    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', playNextSong);
    repeatBtn.addEventListener('click', toggleRepeat);
    volumeSlider.addEventListener('input', volumeSliderChange);
    muteLabel.addEventListener('click', toggleMute);
    progressSlider.addEventListener('input', progressBarChange);
    songListElement.addEventListener('click', handleSongListClick)

    eqSliders.forEach(slider => slider.addEventListener('input', onEqSliderInput));
    eqResetBtn.addEventListener('click', resetEqualizer);

    setInterval(updateCurrentProgressSongInterval, REFRESH_INTERVAL_MS);

    renderSongList();
}

function renderSongList(sortMode = SORT_MODE.NAME, sortOrder = 'desc') {
    sortSongList(sortMode, sortOrder);
    buildSongList();
    setTotalSongNumber();
}

init();


document.querySelectorAll('.sortBar button').forEach(btn => {
    btn.addEventListener('click', () => {
        const asc = btn.dataset.order !== 'asc';           // flip direction on each click
        document.querySelectorAll('.sortBar button').forEach(b => {
            b.classList.remove('toggled');
            delete b.dataset.order;
        });
        btn.classList.add('toggled');
        btn.dataset.order = asc ? 'asc' : 'desc';

        renderSongList(btn.dataset.sort, btn.dataset.order);
    });
});