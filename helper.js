
export function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

export function formatTime(seconds) {
    const secondsleft = Math.floor(seconds % 60);
    const minutes = Math.floor(seconds / 60);

    return minutes + ':' + String(secondsleft).padStart(2, '0');
}