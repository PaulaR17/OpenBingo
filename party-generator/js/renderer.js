export function renderGrid(tiles) {
    const container = document.getElementById('bingo-preview');
    container.innerHTML = '';

    tiles.forEach(tile => {
        const div = document.createElement('div');
        div.className = 'tile';
        div.innerHTML = `
            <span>${tile.icon}</span>
            <p>${tile.text}</p>
        `;
        container.appendChild(div);
    });
}