const state = {
    party_config: { name: '', max_participants: 20, grid_size: 0 },
    tiles: [],
    selectedEmoji: DEFAULT_ICON
};

const currentEmojiDisplay = document.getElementById('current-emoji');
const previewGrid = document.getElementById('bingo-preview');
const emojiModal = document.getElementById('emoji-modal');
const grid = document.getElementById('emoji-grid');
const partyNameInput = document.getElementById('party-name');
const previewPartyName = document.getElementById('preview-party-name');

const deleteModal = document.getElementById('delete-modal');
let tileToDeleteIndex = null;
let draggedTileIndex = null;

currentEmojiDisplay.textContent = state.selectedEmoji;

partyNameInput.addEventListener('input', (e) => {
    if (e.target.value.trim() !== '') {
        previewPartyName.style.display = 'block';
        previewPartyName.textContent = e.target.value;
    } else {
        previewPartyName.style.display = 'none';
    }
});

EMOJI_POOL.forEach(emoji => {
    const el = document.createElement('div');
    el.className = 'emoji-item';
    el.textContent = emoji;
    el.onclick = () => {
        state.selectedEmoji = emoji;
        currentEmojiDisplay.textContent = emoji;
        emojiModal.classList.add('hidden');
    };
    grid.appendChild(el);
});

document.getElementById('select-emoji-btn').onclick = () => emojiModal.classList.remove('hidden');
document.getElementById('close-emoji-modal').onclick = () => emojiModal.classList.add('hidden');

function reindexTiles() {
    state.tiles.forEach((t, index) => {
        t.id = index + 1;
    });
}

function renderPreview() {
    previewGrid.innerHTML = '';
    
    state.tiles.forEach((t, index) => {
        const div = document.createElement('div');
        div.className = 'tile';
        div.draggable = true;
        div.innerHTML = `
            <span class="tile-id">${t.id}</span>
            <span class="tile-icon">${t.icon}</span>
            <p>${t.text}</p>
        `;
        
        div.onclick = () => {
            tileToDeleteIndex = index;
            document.getElementById('delete-tile-text').textContent = t.text;
            deleteModal.classList.remove('hidden');
        };

        div.ondragstart = (e) => {
            draggedTileIndex = index;
            setTimeout(() => div.classList.add('dragging'), 0);
        };

        div.ondragend = () => {
            div.classList.remove('dragging');
            draggedTileIndex = null;
        };

        div.ondragover = (e) => {
            e.preventDefault();
        };

        div.ondrop = (e) => {
            e.preventDefault();
            if (draggedTileIndex === null || draggedTileIndex === index) return;
            
            const draggedItem = state.tiles.splice(draggedTileIndex, 1)[0];
            state.tiles.splice(index, 0, draggedItem);
            
            reindexTiles();
            renderPreview();
        };

        previewGrid.appendChild(div);
    });
}

document.getElementById('add-tile-btn').onclick = () => {
    const textInput = document.getElementById('tile-text');
    if (!textInput.value.trim()) return;

    const newTile = {
        id: state.tiles.length + 1,
        icon: state.selectedEmoji,
        text: textInput.value.trim()
    };

    state.tiles.push(newTile);
    renderPreview();
    textInput.value = '';
};

document.getElementById('cancel-delete-btn').onclick = () => {
    deleteModal.classList.add('hidden');
    tileToDeleteIndex = null;
};

document.getElementById('confirm-delete-btn').onclick = () => {
    if (tileToDeleteIndex !== null) {
        state.tiles.splice(tileToDeleteIndex, 1);
        reindexTiles();
        renderPreview();
    }
    deleteModal.classList.add('hidden');
    tileToDeleteIndex = null;
};

document.getElementById('export-json-btn').onclick = () => {
    const nameInput = document.getElementById('party-name').value.trim();
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