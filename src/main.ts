import './styles.css';
import { TinyGame } from './game';
import { containImage, removePaperBackground } from './image';
import { captureReturnedLicense, checkoutUrl, hasOptimisticUnlock, storeLicense, verifyLicense } from './license';
import { defaultProject, loadProject, projectFromJson, projectToJson, saveProject, type AssetSlot, type GameTemplate, type Project } from './state';

type Step = 'choose' | 'draw' | 'tune' | 'play';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root is missing.');

let project: Project = defaultProject();
let step: Step = 'choose';
let activeSlot: AssetSlot = 'hero';
let game: TinyGame | undefined;
let paid = false;
let storageAvailable = true;
let editorHistory: ImageData[] = [];
let editorColor = '#172033';
let editorSize = 12;
let erasing = false;
let dirty = false;

const templateCopy: Record<GameTemplate, { eyebrow: string; title: string; description: string; object: string }> = {
  dodge: { eyebrow: 'Move + survive', title: 'Doodle dodge', description: 'Steer your hero away from a shower of wobbly obstacles.', object: 'Obstacle' },
  collect: { eyebrow: 'Move + gather', title: 'Treasure dash', description: 'Race around the board and collect your second drawing.', object: 'Treasure' },
  maze: { eyebrow: 'Think + explore', title: 'Pocket maze', description: 'Guide your hero through a fixed maze to the drawn goal.', object: 'Goal' },
};

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);

const setStatus = (message: string, kind: 'plain' | 'error' | 'success' = 'plain'): void => {
  const status = document.querySelector<HTMLElement>('#app-status');
  if (status) { status.textContent = message; status.dataset.kind = kind; }
};

const persist = async (message = 'Saved on this device.'): Promise<void> => {
  try { await saveProject(project); storageAvailable = true; setStatus(message, 'success'); }
  catch { storageAvailable = false; setStatus('Could not save here. You can still play, then export your project before closing.', 'error'); }
};

const shell = (): void => {
  app.innerHTML = `
    <header class="site-header">
      <a class="brand" href="/" data-route="/" aria-label="Doodle to Game home">
        <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="20" cy="26" r="13"/><path d="M31 13h12v26H31z"/><path class="brand-spark" d="m11 25 7-5 7 5-3 9h-9z"/></svg>
        <h1>Doodle to Game</h1>
      </a>
      <nav aria-label="Legal and product links"><a href="/privacy" data-route="/privacy">Privacy</a><a href="/terms" data-route="/terms">Terms</a></nav>
    </header>
    <div id="connection-note" class="connection-note" role="status" hidden>You’re offline — drawing and playing still work.</div>
    <main id="main" tabindex="-1"></main>
    <footer><p>Made for side-by-side play. Your drawings stay on this device.</p><p><a href="/privacy" data-route="/privacy">Privacy</a> · <a href="/terms" data-route="/terms">Terms</a> · Generated hero artwork disclosed in <a href="https://github.com/B-Divyesh/sf-doodle-to-game" rel="noreferrer">the project notes</a>.</p></footer>
    <div id="app-status" class="app-status" role="status" aria-live="polite"></div>
    <div id="update-toast" class="toast" role="status" hidden><span>A fresh version is ready.</span><button type="button" data-action="reload">Reload</button></div>`;
};

const renderRoute = (): void => {
  game?.dispose(); game = undefined;
  const main = document.querySelector<HTMLElement>('#main');
  if (!main) return;
  if (location.pathname === '/privacy') renderLegal(main, 'privacy');
  else if (location.pathname === '/terms') renderLegal(main, 'terms');
  else renderWorkshop(main);
};

const renderLegal = (main: HTMLElement, page: 'privacy' | 'terms'): void => {
  const privacy = `
    <p class="kicker">The short version</p><h2>Private by default</h2>
    <p>Doodle to Game processes photos and drawings in your browser. Artwork, settings, and the current game are stored in IndexedDB on this device. We do not upload child artwork, use analytics, or create accounts.</p>
    <h3>What leaves the device</h3><p>Nothing during ordinary drawing and play. If you buy or restore the optional Workshop Pack, your browser contacts Sociobot’s billing API with the license token to check whether it is valid. Checkout is hosted by Sociobot/Dodo, the merchant of record; their checkout privacy terms apply there.</p>
    <h3>Your controls</h3><p>Use “Export project” to keep a copy you control. Clear this site’s storage in browser settings to remove local artwork and a saved license. Uninstalling the PWA may not clear browser storage automatically.</p>
    <h3>Children</h3><p>The app is designed for an adult and child to use together. It collects no name, age, account, or public profile. Adults should decide whether a paper photo contains private information before loading it.</p>
    <p class="legal-date">Effective 28 August 2026 · Contact: privacy@sociobot.in</p>`;
  const terms = `
    <p class="kicker">Plain-language terms</p><h2>Terms of use</h2>
    <p>You may use Doodle to Game for personal, family, classroom, and workshop projects. You keep ownership of the drawings you load. The app runs locally and is provided “as is”; export anything you want to keep before clearing browser data.</p>
    <h3>Workshop Pack</h3><p>The optional Workshop Pack costs US $9 once. It unlocks bonus ink colours and a geometric finish celebration. Sociobot/Dodo is the merchant of record and handles checkout and refunds. A refunded or revoked license stops unlocking paid extras; the three games, core colours, local save, import/export, and accessibility features stay available.</p>
    <h3>Good workshop rules</h3><p>Only use artwork you have permission to use. Do not load unlawful or harmful material. This tool is not a public gallery and does not publish games online.</p>
    <h3>Limits</h3><p>Simple background removal is designed for high-contrast art on plain paper and may need cleanup. Browser storage can be removed by the browser or device owner. To the extent allowed by law, Sociobot is not liable for lost local data or indirect damages.</p>
    <p class="legal-date">Effective 28 August 2026 · Contact: support@sociobot.in</p>`;
  main.innerHTML = `<article class="legal"><a class="back-link" href="/" data-route="/">← Back to the workshop</a>${page === 'privacy' ? privacy : terms}</article>`;
};

const renderWorkshop = (main: HTMLElement): void => {
  main.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><p class="kicker"><span aria-hidden="true">●</span> No account. No uploads.</p><h2 id="hero-title">Their drawing.<br><em>Your tiny game.</em></h2><p>Draw or photograph two characters, pick one simple rule, then play together. Everything happens right here on your device.</p><a class="primary-link" href="#maker">Make a game <span aria-hidden="true">→</span></a><p class="hero-note">Works offline after the first visit · About 15 minutes</p></div>
      <picture class="hero-art"><source type="image/webp" srcset="/assets/hero-768.webp 768w, /assets/hero-1280.webp 1280w" sizes="(max-width: 850px) 54vw, 680px"><img src="/assets/hero-1280.jpg" width="1280" height="853" alt="Two paper doodle creatures passing through red and blue gates into a handmade game board" decoding="async" fetchpriority="high"></picture>
    </section>
    <section class="maker" id="maker" aria-labelledby="maker-title">
      <div class="maker-heading"><div><p class="kicker">Your worktable</p><h2 id="maker-title">Make one small, playable thing</h2></div><p class="local-note"><span aria-hidden="true">⌂</span> ${storageAvailable ? 'Autosaves locally' : 'Storage unavailable—export before closing'}</p></div>
      <ol class="step-tabs" aria-label="Game-making steps">
        ${(['choose', 'draw', 'tune', 'play'] as Step[]).map((name, index) => `<li><button type="button" data-step="${name}" ${step === name ? 'aria-current="step"' : ''}><span>${index + 1}</span>${name === 'choose' ? 'Choose' : name === 'draw' ? 'Add art' : name === 'tune' ? 'Tune' : 'Play'}</button></li>`).join('')}
      </ol>
      <div id="work-stage" class="work-stage"></div>
      <div class="project-tools" aria-labelledby="project-tools-title"><div><h3 id="project-tools-title">Keep your work</h3><p>Move this game to another device with a private project file.</p></div><div class="button-row"><button type="button" class="secondary" data-action="export">Export project</button><label class="button secondary" for="import-file">Import project</label><input id="import-file" class="visually-hidden" type="file" accept="application/json,.json"></div></div>
    </section>
    ${renderPaid()}
    <section class="how"><p class="kicker">The whole trick</p><h2>Paper in. Play out.</h2><ol><li><span>01</span><h3>Make two doodles</h3><p>Use the built-in pad or photograph bold art on plain paper.</p></li><li><span>02</span><h3>Pick one rule</h3><p>Dodge, collect, or solve. Nothing else to configure.</p></li><li><span>03</span><h3>Pass the controls</h3><p>Use arrows, WASD, or the roomy touch pad.</p></li></ol></section>`;
  renderStage();
};

const renderPaid = (): string => paid ? `
  <section class="paid-strip paid-active" aria-labelledby="pack-title"><div><p class="kicker">Workshop Pack active</p><h2 id="pack-title">Bonus inks are on the table.</h2><p>Your license is stored on this device. Paid extras keep working offline after verification.</p></div><div class="pack-mark" aria-hidden="true"><i></i><i></i><i></i></div></section>` : `
  <section class="paid-strip" aria-labelledby="pack-title"><div><p class="kicker">Optional extra</p><h2 id="pack-title">Workshop Pack · US $9 once</h2><p>Unlock four bonus ink colours and a geometric finish celebration. The complete three-game maker, saving, and exports stay free.</p><p class="legal-small">Hosted checkout by Sociobot/Dodo, the merchant of record. Refunds are handled there.</p></div><div class="purchase"><a class="primary-link" href="${checkoutUrl}">Buy Workshop Pack</a><details><summary>Have a license?</summary><form id="license-form"><label for="license-token">Paste the token from your receipt</label><div class="paste-row"><input id="license-token" autocomplete="off" spellcheck="false"><button type="submit" class="secondary">Restore</button></div></form></details></div></section>`;

const renderStage = (): void => {
  game?.dispose(); game = undefined;
  const stage = document.querySelector<HTMLElement>('#work-stage');
  if (!stage) return;
  if (step === 'choose') stage.innerHTML = chooseMarkup();
  else if (step === 'draw') { stage.innerHTML = drawMarkup(); setupEditor(); }
  else if (step === 'tune') stage.innerHTML = tuneMarkup();
  else { stage.innerHTML = playMarkup(); setupGame(); }
};

const chooseMarkup = (): string => `
  <div class="stage-intro"><p class="step-number">Step 1</p><div><h3>Choose the kind of fun</h3><p>Same drawings, three dependable rules. You can switch later.</p></div></div>
  <div class="template-grid" role="radiogroup" aria-label="Game template">
    ${(Object.entries(templateCopy) as [GameTemplate, typeof templateCopy.collect][]).map(([key, info]) => `<button type="button" class="template-card" role="radio" aria-checked="${project.template === key}" data-template="${key}"><span class="template-sketch ${key}" aria-hidden="true"><i></i><b></b><em></em></span><span class="template-eyebrow">${info.eyebrow}</span><strong>${info.title}</strong><small>${info.description}</small><span class="choose-label">${project.template === key ? 'Chosen ✓' : 'Choose this'}</span></button>`).join('')}
  </div><div class="stage-actions"><span></span><button type="button" class="primary" data-next="draw">Add your art <span aria-hidden="true">→</span></button></div>`;

const drawMarkup = (): string => {
  const objectName = templateCopy[project.template].object;
  const colors = ['#172033', '#D8422E', '#1859C9', '#237A4B', ...(paid ? ['#8B3FA8', '#D56B00', '#087B80', '#EE6F9A'] : [])];
  return `
    <div class="stage-intro"><p class="step-number">Step 2</p><div><h3>Bring in two doodles</h3><p>Draw here or take a photo. Bold dark lines on plain light paper clean up best.</p></div></div>
    <div class="asset-tabs" role="tablist" aria-label="Drawing slots"><button type="button" role="tab" aria-selected="${activeSlot === 'hero'}" data-slot="hero"><span class="asset-dot hero-dot"></span>Hero ${project.assets.hero ? '<b>Ready</b>' : '<b>Needs art</b>'}</button><button type="button" role="tab" aria-selected="${activeSlot === 'object'}" data-slot="object"><span class="asset-dot object-dot"></span>${objectName} ${project.assets.object ? '<b>Ready</b>' : '<b>Needs art</b>'}</button></div>
    <div class="editor-layout"><div class="canvas-wrap"><canvas id="draw-canvas" width="640" height="420" aria-label="Drawing pad for ${activeSlot === 'hero' ? 'hero' : objectName.toLowerCase()}" tabindex="0"></canvas><span class="canvas-caption">${activeSlot === 'hero' ? 'Hero' : objectName} drawing pad</span></div>
      <div class="drawing-tools"><fieldset><legend>Ink colour</legend><div class="swatches">${colors.map((color) => `<button type="button" class="swatch" data-color="${color}" aria-label="Use ${color} ink" aria-pressed="${editorColor === color}" style="--swatch:${color}"></button>`).join('')}</div>${!paid ? '<small>4 bonus inks in Workshop Pack</small>' : ''}</fieldset>
      <label for="brush-size">Brush size <output id="brush-output">${editorSize}px</output></label><input id="brush-size" type="range" min="4" max="32" value="${editorSize}">
      <div class="tool-grid"><button type="button" class="secondary" data-action="eraser" aria-pressed="${erasing}">Eraser</button><button type="button" class="secondary" data-action="undo" ${editorHistory.length ? '' : 'disabled'}>Undo</button><button type="button" class="secondary" data-action="clear">Clear</button></div>
      <div class="photo-tool"><label class="button secondary" for="photo-file">Use a photo</label><input id="photo-file" class="visually-hidden" type="file" accept="image/*" capture="environment"><button type="button" class="secondary" data-action="remove-bg">Remove paper</button><small>Photos never leave this device. Background cleanup works best with high-contrast art on plain paper.</small></div></div></div>
    <div class="stage-actions"><button type="button" class="text-button" data-back="choose">← Change game</button><button type="button" class="primary" data-action="save-art">Save this doodle</button><button type="button" class="primary" data-next="tune">Tune the rules <span aria-hidden="true">→</span></button></div>`;
};

const tuneMarkup = (): string => {
  const shortLabel = project.template === 'dodge' ? '15 seconds' : project.template === 'collect' ? '5 treasures' : 'Relaxed target';
  const longLabel = project.template === 'dodge' ? '30 seconds' : project.template === 'collect' ? '10 treasures' : 'Fewer moves';
  return `<div class="stage-intro"><p class="step-number">Step 3</p><div><h3>Choose just three rules</h3><p>The game is already built. These are the only knobs you need.</p></div></div>
    <div class="tune-grid"><fieldset><legend>Movement speed</legend><label><input type="radio" name="speed" value="gentle" ${project.speed === 'gentle' ? 'checked' : ''}><span><b>Gentle</b><small>More room to learn</small></span></label><label><input type="radio" name="speed" value="zippy" ${project.speed === 'zippy' ? 'checked' : ''}><span><b>Zippy</b><small>A lively challenge</small></span></label></fieldset>
    <fieldset><legend>Score goal</legend><label><input type="radio" name="score" value="short" ${project.score === 'short' ? 'checked' : ''}><span><b>${shortLabel}</b><small>Good for a first round</small></span></label><label><input type="radio" name="score" value="long" ${project.score === 'long' ? 'checked' : ''}><span><b>${longLabel}</b><small>Try a bigger challenge</small></span></label></fieldset>
    <fieldset><legend>Game sound</legend><label class="sound-toggle"><input type="checkbox" id="sound-toggle" ${project.sound ? 'checked' : ''}><span><b>${project.sound ? 'Sound on' : 'Sound off'}</b><small>Simple locally generated beeps</small></span></label></fieldset></div>
    <div class="stage-actions"><button type="button" class="text-button" data-back="draw">← Edit art</button><button type="button" class="primary play-button" data-next="play"><span aria-hidden="true">▶</span> Open the game</button></div>`;
};

const playMarkup = (): string => `
  <div class="stage-intro play-intro"><p class="step-number">Step 4</p><div><h3>${escapeHtml(project.title)}</h3><p>${templateCopy[project.template].title} · Arrows, WASD, or the touch pad</p></div><div class="hud"><strong id="game-score">Ready</strong><span id="game-detail">Press start</span></div></div>
  <div class="game-shell"><div class="game-screen"><canvas id="game-canvas" width="720" height="430" tabindex="0" aria-label="${templateCopy[project.template].title} play area. Use arrow or WASD keys.">Your browser needs canvas to play this game.</canvas><div id="game-message" class="game-message" role="status" aria-live="assertive" hidden></div>${paid ? '<div id="confetti" class="confetti" aria-hidden="true"></div>' : ''}</div>
  <div class="game-controls"><div class="dpad" aria-label="Touch direction controls"><span></span><button type="button" data-direction="up" aria-label="Move up">↑</button><span></span><button type="button" data-direction="left" aria-label="Move left">←</button><button type="button" data-direction="down" aria-label="Move down">↓</button><button type="button" data-direction="right" aria-label="Move right">→</button></div><div class="round-actions"><button type="button" class="primary" data-action="start-game">Start round</button><button type="button" class="secondary" data-action="reset-game">Reset</button></div></div></div>
  <div class="stage-actions"><button type="button" class="text-button" data-back="tune">← Tune rules</button><button type="button" class="secondary" data-back="choose">Make another version</button></div>`;

const saveEditor = async (): Promise<boolean> => {
  const canvas = document.querySelector<HTMLCanvasElement>('#draw-canvas');
  if (!canvas) return false;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return false;
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  if (!pixels.some((value, index) => index % 4 === 3 && value > 10)) { setStatus(`Add something to the ${activeSlot === 'hero' ? 'hero' : templateCopy[project.template].object.toLowerCase()} pad first.`, 'error'); return false; }
  project.assets[activeSlot] = canvas.toDataURL('image/webp', .84);
  dirty = false;
  await persist(`${activeSlot === 'hero' ? 'Hero' : templateCopy[project.template].object} saved on this device.`);
  return true;
};

const updateUndoButton = (): void => {
  const button = document.querySelector<HTMLButtonElement>('[data-action="undo"]');
  if (button) button.disabled = editorHistory.length === 0;
};

const setupEditor = (): void => {
  const canvas = document.querySelector<HTMLCanvasElement>('#draw-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  context.lineCap = 'round'; context.lineJoin = 'round';
  const existing = project.assets[activeSlot];
  if (existing) { const image = new Image(); image.onload = () => containImage(canvas, image, image.width, image.height); image.src = existing; }
  let drawing = false, lastX = 0, lastY = 0, penActive = false;
  const point = (event: PointerEvent): [number, number] => { const rect = canvas.getBoundingClientRect(); return [(event.clientX - rect.left) * canvas.width / rect.width, (event.clientY - rect.top) * canvas.height / rect.height]; };
  const down = (event: PointerEvent) => {
    if (event.pointerType === 'touch' && penActive) return;
    if (event.pointerType === 'pen') penActive = true;
    event.preventDefault(); canvas.setPointerCapture(event.pointerId); drawing = true;
    editorHistory.push(context.getImageData(0, 0, canvas.width, canvas.height)); editorHistory = editorHistory.slice(-20);
    updateUndoButton();
    [lastX, lastY] = point(event); dirty = true;
  };
  const move = (event: PointerEvent) => {
    if (!drawing) return; event.preventDefault(); const [x, y] = point(event);
    context.save(); context.globalCompositeOperation = erasing ? 'destination-out' : 'source-over'; context.strokeStyle = editorColor; context.lineWidth = editorSize; context.beginPath(); context.moveTo(lastX, lastY); context.lineTo(x, y); context.stroke(); context.restore(); [lastX, lastY] = [x, y];
  };
  const up = (event: PointerEvent) => { drawing = false; if (event.pointerType === 'pen') window.setTimeout(() => { penActive = false; }, 400); };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
};

const setupGame = (): void => {
  const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  if (!canvas) return;
  game = new TinyGame(canvas, project, {
    onHud: (score, detail) => { const scoreNode = document.querySelector('#game-score'); const detailNode = document.querySelector('#game-detail'); if (scoreNode) scoreNode.textContent = score; if (detailNode) detailNode.textContent = detail; },
    onFinish: (message, won) => { const node = document.querySelector<HTMLElement>('#game-message'); if (!node) return; node.textContent = message; node.hidden = !message; node.dataset.won = String(won); if (won && paid) celebrate(); },
  });
  document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach((button) => {
    const direction = button.dataset.direction as 'up' | 'down' | 'left' | 'right';
    const start = (event: PointerEvent) => { event.preventDefault(); button.setPointerCapture(event.pointerId); game?.press(direction, true); };
    const end = () => game?.press(direction, false);
    button.addEventListener('pointerdown', start); button.addEventListener('pointerup', end); button.addEventListener('pointercancel', end); button.addEventListener('pointerleave', end);
  });
};

const celebrate = (): void => {
  const node = document.querySelector('#confetti'); if (!node) return;
  node.innerHTML = Array.from({ length: 16 }, (_, index) => `<i style="--i:${index};--x:${(index * 47) % 100}%"></i>`).join('');
  window.setTimeout(() => { node.innerHTML = ''; }, 1600);
};

const downloadProject = (): void => {
  const blob = new Blob([projectToJson(project)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `doodle-game-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  setStatus('Project exported. Keep that file somewhere safe.', 'success');
};

const handleClick = async (event: MouseEvent): Promise<void> => {
  const target = event.target as HTMLElement;
  const route = target.closest<HTMLAnchorElement>('[data-route]');
  if (route) { event.preventDefault(); history.pushState({}, '', route.pathname); renderRoute(); document.querySelector<HTMLElement>('#main')?.focus(); return; }
  const stepButton = target.closest<HTMLButtonElement>('[data-step]');
  if (stepButton) { if (step === 'draw' && dirty) await saveEditor(); step = stepButton.dataset.step as Step; renderWorkshop(document.querySelector('#main') as HTMLElement); document.querySelector('#maker')?.scrollIntoView({ behavior: 'smooth' }); return; }
  const templateButton = target.closest<HTMLButtonElement>('[data-template]');
  if (templateButton) { project.template = templateButton.dataset.template as GameTemplate; await persist('Game type saved.'); renderStage(); return; }
  const next = target.closest<HTMLButtonElement>('[data-next]');
  if (next) {
    if (step === 'draw' && dirty) await saveEditor();
    step = next.dataset.next as Step; await persist(); renderWorkshop(document.querySelector('#main') as HTMLElement); document.querySelector('#maker')?.scrollIntoView({ behavior: 'smooth' }); return;
  }
  const back = target.closest<HTMLButtonElement>('[data-back]');
  if (back) { if (step === 'draw' && dirty) await saveEditor(); step = back.dataset.back as Step; renderWorkshop(document.querySelector('#main') as HTMLElement); document.querySelector('#maker')?.scrollIntoView({ behavior: 'smooth' }); return; }
  const slot = target.closest<HTMLButtonElement>('[data-slot]');
  if (slot) { if (dirty) await saveEditor(); activeSlot = slot.dataset.slot as AssetSlot; editorHistory = []; renderStage(); return; }
  const color = target.closest<HTMLButtonElement>('[data-color]');
  if (color) { editorColor = color.dataset.color ?? '#172033'; erasing = false; renderStage(); return; }
  const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'save-art') { await saveEditor(); renderStage(); }
  if (action === 'undo') { const canvas = document.querySelector<HTMLCanvasElement>('#draw-canvas'); const image = editorHistory.pop(); const context = canvas?.getContext('2d'); if (image && context) { context.putImageData(image, 0, 0); dirty = true; updateUndoButton(); } }
  if (action === 'clear') { const canvas = document.querySelector<HTMLCanvasElement>('#draw-canvas'); const context = canvas?.getContext('2d', { willReadFrequently: true }); if (canvas && context) { editorHistory.push(context.getImageData(0, 0, canvas.width, canvas.height)); context.clearRect(0, 0, canvas.width, canvas.height); dirty = true; updateUndoButton(); setStatus('Pad cleared. Use Undo if you want it back.'); } }
  if (action === 'eraser') { erasing = !erasing; const button = target.closest<HTMLButtonElement>('[data-action="eraser"]'); button?.setAttribute('aria-pressed', String(erasing)); if (button) button.textContent = erasing ? 'Eraser on' : 'Eraser'; }
  if (action === 'remove-bg') { const canvas = document.querySelector<HTMLCanvasElement>('#draw-canvas'); const context = canvas?.getContext('2d', { willReadFrequently: true }); if (canvas && context) { editorHistory.push(context.getImageData(0, 0, canvas.width, canvas.height)); removePaperBackground(canvas); dirty = true; updateUndoButton(); setStatus('Light paper softened. Use Undo if an edge disappeared.', 'success'); } }
  if (action === 'export') downloadProject();
  if (action === 'start-game') { game?.start(); document.querySelector<HTMLCanvasElement>('#game-canvas')?.focus(); }
  if (action === 'reset-game') game?.reset();
  if (action === 'reload') location.reload();
};

const handleChange = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement;
  if (input.name === 'speed') { project.speed = input.value === 'zippy' ? 'zippy' : 'gentle'; await persist('Speed saved.'); }
  if (input.name === 'score') { project.score = input.value === 'long' ? 'long' : 'short'; await persist('Score goal saved.'); }
  if (input.id === 'sound-toggle') { project.sound = input.checked; await persist('Sound choice saved.'); renderStage(); }
  if (input.id === 'brush-size') { editorSize = Number(input.value); const output = document.querySelector('#brush-output'); if (output) output.textContent = `${editorSize}px`; }
  if (input.id === 'photo-file' && input.files?.[0]) {
    const file = input.files[0];
    if (!file.type.startsWith('image/') || file.size > 15_000_000) { setStatus('Choose a JPG, PNG, or WebP photo smaller than 15 MB.', 'error'); return; }
    const canvas = document.querySelector<HTMLCanvasElement>('#draw-canvas'); const context = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !context) return;
    editorHistory.push(context.getImageData(0, 0, canvas.width, canvas.height)); updateUndoButton();
    const image = new Image(); const url = URL.createObjectURL(file);
    image.onload = () => { containImage(canvas, image, image.width, image.height); URL.revokeObjectURL(url); dirty = true; setStatus('Photo added locally. Try “Remove paper” for a plain light background.', 'success'); };
    image.onerror = () => { URL.revokeObjectURL(url); setStatus('That image could not be opened. Try a JPG, PNG, or WebP.', 'error'); };
    image.src = url;
  }
  if (input.id === 'import-file' && input.files?.[0]) {
    try { project = projectFromJson(await input.files[0].text()); await persist('Project imported and saved.'); step = 'choose'; renderWorkshop(document.querySelector('#main') as HTMLElement); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'That project could not be imported.', 'error'); }
  }
};

const handleSubmit = async (event: SubmitEvent): Promise<void> => {
  const form = event.target as HTMLFormElement;
  if (form.id !== 'license-form') return;
  event.preventDefault(); const input = form.querySelector<HTMLInputElement>('#license-token');
  try { storeLicense(input?.value ?? ''); setStatus('Checking that license…'); const verdict = await verifyLicense(true); if (!verdict?.valid) { setStatus('That license is not active. Check the token and try again.', 'error'); return; } paid = true; renderWorkshop(document.querySelector('#main') as HTMLElement); setStatus('Workshop Pack restored on this device.', 'success'); }
  catch (error) { setStatus(error instanceof Error ? error.message : 'Could not restore that license.', 'error'); }
};

const registerServiceWorker = (): void => {
  if (!('serviceWorker' in navigator)) return;
  const register = () => navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) { const toast = document.querySelector<HTMLElement>('#update-toast'); if (toast) toast.hidden = false; } }); });
  }).catch(() => setStatus('Offline setup did not finish. The app still works while this page is open.', 'error'));
  if (document.readyState === 'complete') void register();
  else window.addEventListener('load', () => { void register(); }, { once: true });
};

const updateConnection = (): void => { const note = document.querySelector<HTMLElement>('#connection-note'); if (note) note.hidden = navigator.onLine; };

const init = async (): Promise<void> => {
  captureReturnedLicense(); paid = hasOptimisticUnlock(); shell();
  try { project = await loadProject(); } catch { storageAvailable = false; }
  renderRoute(); updateConnection();
  app.addEventListener('click', (event) => { void handleClick(event); });
  app.addEventListener('change', (event) => { void handleChange(event); });
  app.addEventListener('submit', (event) => { void handleSubmit(event as SubmitEvent); });
  window.addEventListener('popstate', renderRoute); window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection);
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && step === 'play' && location.pathname === '/') { step = 'tune'; renderWorkshop(document.querySelector('#main') as HTMLElement); } });
  registerServiceWorker();
  const verdict = await verifyLicense();
  if (verdict && verdict.valid !== paid) { paid = verdict.valid; renderRoute(); if (!verdict.valid) setStatus('This license is no longer active. Free games and your artwork are unchanged.', 'error'); }
};

void init();
