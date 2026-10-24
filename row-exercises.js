// Each bank contains four distinct words; a round repeats exactly one of them.
export const memoryWordBanks = [
  ['ave', 'avô', 'avó', 'ovo'], ['saldo', 'sapo', 'sabe', 'sopa'],
  ['véu', 'céu', 'réu', 'seu'], ['fruta', 'truta', 'trufa', 'bruxa'],
  ['livre', 'livro', 'litro', 'lindo'], ['ouve', 'olhe', 'olho', 'olha'],
  ['cavalo', 'cavaco', 'calçado', 'cigarro'], ['fatia', 'farinha', 'família', 'fábula'],
  ['pranto', 'pronto', 'prato', 'prazo'], ['tia', 'fio', 'tio', 'frio'],
  ['seu', 'eu', 'teu', 'meu'], ['rei', 'rio', 'rua', 'rir'],
  ['verde', 'vence', 'verbo', 'verso'], ['perto', 'certo', 'porto', 'mero'],
  ['gema', 'goma', 'gota', 'gama']
];

// Guarantee a visible change even when the random shuffle returns the same order.
export function shuffled(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  if (result.every((item, i) => item === items[i]) && new Set(items).size > 1) {
    result.push(result.shift());
  }
  return result;
}

export function createMemoryExercises(random = Math.random) {
  return shuffled(memoryWordBanks, random).map(bank => {
    const target = bank[Math.floor(random() * bank.length)];
    return { target, items: shuffled([...bank, target], random) };
  });
}

// Eight related families of vector figures, each with five distinct variants.
export const figureFamilies = ['dots', 'diamonds', 'rings', 'stars', 'petals', 'tiles', 'triangles', 'spokes'];
export function createFigureExercises(random = Math.random) {
  return shuffled(figureFamilies, random).map(family => {
    const variants = Array.from({ length: 5 }, (_, i) => `${family}-${i}`);
    const target = variants[Math.floor(random() * variants.length)];
    const count = 2 + Math.floor(random() * 5);
    const others = variants.filter(item => item !== target);
    const items = Array.from({ length: 20 }, (_, i) => i < count ? target : others[(i - count) % others.length]);
    return { target, items: shuffled(items, random) };
  });
}

export function shuffleExercises(exercises, random = Math.random) {
  return shuffled(exercises, random).map(exercise => ({ ...exercise, items: shuffled(exercise.items, random) }));
}

function radial(count, radius, draw) {
  return Array.from({ length: count }, (_, i) => {
    const angle = i * Math.PI * 2 / count - Math.PI / 2;
    return draw(32 + radius * Math.cos(angle), 32 + radius * Math.sin(angle), i);
  }).join('');
}

export function figureMarkup(id) {
  const [family, variant] = id.split('-');
  const v = Number(variant), n = v + 3;
  let shapes = '';
  if (family === 'dots') shapes = radial(n, 17, (x, y) => `<circle cx="${x}" cy="${y}" r="6"/>`) + '<circle cx="32" cy="32" r="5"/>';
  if (family === 'diamonds') shapes = radial(n, 17, (x, y) => `<path d="M${x} ${y - 6}l6 6-6 6-6-6z"/>`);
  if (family === 'rings') shapes = radial(n, 11, (x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="currentColor" stroke-width="2.5"/>`);
  if (family === 'stars') {
    const points = Array.from({ length: (n + 1) * 2 }, (_, i) => {
      const angle = i * Math.PI / (n + 1) - Math.PI / 2, radius = i % 2 ? 10 : 25;
      return `${32 + radius * Math.cos(angle)},${32 + radius * Math.sin(angle)}`;
    }).join(' ');
    shapes = `<polygon points="${points}" fill="none" stroke="currentColor" stroke-width="3"/>`;
  }
  if (family === 'petals') shapes = radial(n, 0, (_, __, i) => `<ellipse cx="32" cy="18" rx="5" ry="11" transform="rotate(${i * 360 / n} 32 32)"/>`) + '<circle cx="32" cy="32" r="4"/>';
  if (family === 'tiles') shapes = radial(n, 18, (x, y) => `<rect x="${x - 5}" y="${y - 5}" width="10" height="10"/>`);
  if (family === 'triangles') shapes = radial(n, 0, (_, __, i) => `<path d="M27 9h10l-5 17z" transform="rotate(${i * 360 / n} 32 32)"/>`);
  if (family === 'spokes') shapes = radial(n, 23, (x, y) => `<path d="M32 32L${x} ${y}" stroke="currentColor" stroke-width="3"/><circle cx="${x}" cy="${y}" r="3"/>`);
  return `<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" focusable="false">${shapes}</svg>`;
}

const familyNames = { dots: 'pontos em círculo', diamonds: 'losangos', rings: 'anéis entrelaçados', stars: 'estrela', petals: 'pétalas', tiles: 'quadrados', triangles: 'triângulos', spokes: 'raios' };
function figureElement(id) {
  const element = document.createElement('span'); element.className = 'figure-tile';
  const [family, variant] = id.split('-');
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', `${familyNames[family]}, ${Number(variant) + (family === 'stars' ? 4 : 3)} ${family === 'stars' ? 'pontas' : 'elementos'}`);
  element.innerHTML = figureMarkup(id);
  return element;
}

function setupPanel(selector, kind) {
  const panel = document.querySelector(selector), list = panel.querySelector('.row-exercise-list');
  const makeSeries = kind === 'figures' ? createFigureExercises : createMemoryExercises;
  let exercises = makeSeries();

  function render() {
    list.replaceChildren(...exercises.map((exercise, rowIndex) => {
      const row = document.createElement('li'); row.className = `practice-row ${kind}-row`;
      const heading = document.createElement('div'); heading.className = 'row-model';
      const label = document.createElement('span'); label.className = 'row-number';
      label.id = `${kind}-line-${rowIndex}`; label.textContent = `Linha ${String(rowIndex + 1).padStart(2, '0')}`;
      heading.append(label);
      if (kind === 'figures') {
        const caption = document.createElement('span'); caption.className = 'model-caption'; caption.textContent = 'Modelo';
        heading.append(figureElement(exercise.target), caption);
      }
      const items = document.createElement('div'); items.className = `${kind}-items`;
      items.setAttribute('role', 'group'); items.setAttribute('aria-labelledby', label.id);
      exercise.items.forEach(item => {
        if (kind === 'figures') { items.append(figureElement(item)); return; }
        const word = document.createElement('span'); word.textContent = item;
        word.className = 'memory-word'; items.append(word);
      });
      row.append(heading, items);
      return row;
    }));
  }

  panel.querySelector('[data-action="shuffle"]').addEventListener('click', () => {
    exercises = shuffleExercises(exercises); render();
  });
  panel.querySelector('[data-action="new"]').addEventListener('click', () => { exercises = makeSeries(); render(); });
  render();
}

export function setupRowExercises() {
  setupPanel('#figure-count', 'figures');
  setupPanel('#word-memory', 'memory');
}
