const state = {
    party_config: { name: '', max_participants: 20, grid_size: 0 },
    tiles: [],
    selectedEmoji: DEFAULT_ICON
};

const currentEmojiDisplay = document.getElementById('current-emoji');
const previewGrid = document.getElementById('bingo-preview');
const modal = document.getElementById('emoji-modal');
const grid = document.getElementById('emoji-grid');

currentEmojiDisplay.textContent = state.selectedEmoji;

EMOJI_POOL.forEach(emoji => {
    const el = document.createElement('div');
    el.className = 'emoji-item';
    el.textContent = emoji;
    el.onclick = () => {
        state.selectedEmoji = emoji;
        currentEmojiDisplay.textContent = emoji;
        modal.classList.add('hidden');
    };
    grid.appendChild(el);
});

document.getElementById('select-emoji-btn').onclick = () => modal.classList.remove('hidden');
document.getElementById('close-emoji-modal').onclick = () => modal.classList.add('hidden');

document.getElementById('add-tile-btn').onclick = () => {
    const textInput = document.getElementById('tile-text');
    if (!textInput.value) return;

    const newTile = {
        id: state.tiles.length + 1,
        icon: state.selectedEmoji,
        text: textInput.value
    };

    state.tiles.push(newTile);
    
    previewGrid.innerHTML = '';
    state.tiles.forEach(t => {
        const div = document.createElement('div');
        div.className = 'tile';
        div.innerHTML = `<span>${t.icon}</span><p>${t.text}</p>`;
        previewGrid.appendChild(div);
    });

    textInput.value = '';
};

document.getElementById('export-json-btn').onclick = () => {
    const nameInput = document.getElementById('party-name').value;
    const maxInput = parseInt(document.getElementById('max-players').value);

    state.party_config.name = nameInput || "Party";
    state.party_config.max_participants = isNaN(maxInput) || maxInput < 1 ? 1 : maxInput;
    state.party_config.grid_size = state.tiles.length;

    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'party_config.json';
    a.click();
    URL.revokeObjectURL(url);
};