
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

export function initEqualizerControls() {
    eqSliders.forEach(slider => slider.addEventListener('input', onEqSliderInput));
    eqResetBtn.addEventListener('click', resetEqualizer);
}

// Wire Howler.masterGain -> EQ filters -> analyser -> speakers (once)
export function setupEqualizer() {
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
