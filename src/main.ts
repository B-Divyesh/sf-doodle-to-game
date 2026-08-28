import './styles.css';
import { TinyGame } from './game';
import { containImage, removePaperBackground } from './image';
import { captureReturnedLicense, checkoutUrl, hasOptimisticUnlock, storeLicense, verifyLicense } from './license';
import { defaultProject, discardDemoProject, loadProject, projectFromJson, projectToJson, resetDemoProject, sampleProject, saveProject, setDemoMode, type AssetSlot, type GameTemplate, type Project } from './state';

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
let isDemo = false;

const templateCopy: Record<GameTemplate, { eyebrow: string; title: string; description: string; object: string }> = {
  dodge: { eyebrow: 'Move + survive', title: 'Doodle dodge', description: 'Steer your player drawing away from a shower of wobbly obstacles.', object: 'Obstacle' },
  collect: { eyebrow: 'Move + gather', title: 'Treasure dash', description: 'Race around the board and collect your second drawing.', object: 'Treasure' },
  maze: { eyebrow: 'Think + explore', title: 'Pocket maze', description: 'Guide your player drawing through a fixed maze to the drawn goal.', object: 'Goal' },
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
        <span>Doodle to Game</span>
      </a>
      <nav aria-label="Product links"><a href="/demo" data-route="/demo">Demo</a><a href="/privacy" data-route="/privacy">Privacy</a><a href="/terms" data-route="/terms">Terms</a></nav>
    </header>
    <div id="connection-note" class="connection-note" role="status" hidden>You’re offline — drawing and playing still work.</div>
    <main id="main" tabindex="-1"></main>
    <footer><p>A tiny game maker for adults and children.</p><p><a href="/privacy" data-route="/privacy">Privacy</a> · <a href="/terms" data-route="/terms">Terms</a> · Built by Param Factory · build 20260828-polish-2</p></footer>
    <div id="app-status" class="app-status" role="status" aria-live="polite"></div>
    <div id="route-status" class="visually-hidden" aria-live="polite"></div>
    <div id="update-toast" class="toast" role="status" hidden><span>A fresh version is ready.</span><button type="button" data-action="reload">Load update</button></div>`;
};

const updateMetadata = (title: string, description: string, canonicalPath = location.pathname, noindex = false): void => {
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  const canonical = location.origin + canonicalPath;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
  const existingRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (noindex) {
    const robots = existingRobots ?? document.head.appendChild(document.createElement('meta'));
    robots.name = 'robots'; robots.content = 'noindex';
  } else existingRobots?.remove();
};

const focusRouteHeading = (): void => {
  const heading = document.querySelector<HTMLElement>('#main h1');
  heading?.focus();
  const announcement = document.querySelector<HTMLElement>('#route-status');
  if (announcement && heading) announcement.textContent = heading.textContent ?? '';
};

const renderRoute = (): void => {
  game?.dispose(); game = undefined;
  const main = document.querySelector<HTMLElement>('#main');
  if (!main) return;
  const path = location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/privacy') { updateMetadata('Privacy — Doodle to Game', 'How Doodle to Game stores drawings in this browser.'); renderLegal(main, 'privacy'); }
  else if (path === '/terms') { updateMetadata('Terms — Doodle to Game', 'Terms for the local Doodle to Game workshop.'); renderLegal(main, 'terms'); }
  else if (path === '/' || path === '/demo') { updateMetadata(isDemo ? 'Demo — Doodle to Game' : 'Doodle to Game — turn drawings into a game', isDemo ? 'A playable sample game for adults and children.' : 'Turn two drawings into a tiny game with a child.', isDemo ? '/demo' : '/'); renderWorkshop(main); }
  else { updateMetadata('Page not found — Doodle to Game', 'This Doodle to Game page does not exist.', location.pathname, true); renderNotFound(main); }
};

const renderLegal = (main: HTMLElement, page: 'privacy' | 'terms'): void => {
  const privacy = `
    <p class="kicker">The short version</p><h1 tabindex="-1">Private by default</h1>
    <p>Doodle to Game uses this browser for drawings and game settings. It does not ask you to create an account.</p>
    <h2>What leaves this site</h2><p>Drawing and play send no data away from this site. The optional checkout opens at Sociobot/Dodo.</p>
    <h2>Your controls</h2><p>Export a project file to keep a copy. Use browser settings to remove saved local data.</p>
    <h2>Children</h2><p>Doodle to Game is for an adult and child to use together.</p>
    <p class="legal-date">Effective 28 August 2026 · Contact: privacy@sociobot.in</p>`;
  const terms = `
    <p class="kicker">Plain-language terms</p><h1 tabindex="-1">Terms of use</h1>
    <p>Use drawings you have permission to use. Keep a project file for anything you want to keep.</p>
    <h2>Workshop Pack</h2><p>The optional Workshop Pack costs US $9 once. It adds four bonus ink colours and a finish celebration.</p>
    <h2>Free game maker</h2><p>The game maker, saving, and project export stay free.</p>
    <h2>Checkout</h2><p>Sociobot/Dodo hosts the optional checkout as the merchant of record.</p>
    <p class="legal-date">Effective 28 August 2026 · Contact: support@sociobot.in</p>`;
  main.innerHTML = `<article class="legal"><a class="back-link" href="/" data-route="/">← Back to the workshop</a>${page === 'privacy' ? privacy : terms}</article>`;
};

const renderNotFound = (main: HTMLElement): void => {
  main.innerHTML = `<article class="legal not-found"><p class="kicker">404</p><h1 tabindex="-1">This game board is blank</h1><p>That page is not part of Doodle to Game.</p><a class="primary-link" href="/" data-route="/">Go to the game maker</a></article>`;
};

const renderWorkshop = (main: HTMLElement): void => {
  if (isDemo) { renderDemo(main); return; }
  main.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><p class="kicker"><span aria-hidden="true">●</span> No account · no uploads</p><h1 id="hero-title" tabindex="-1">Turn two drawings into a tiny game</h1><p>For an adult and child making their first game together.</p><a class="primary-link" href="/?demo=1" data-route="/?demo=1">Try it with sample data <span aria-hidden="true">→</span></a><p class="action-note">Opens a playable dodge game.</p><ul class="hero-facts"><li>No account or uploads</li><li>Works after the first visit</li><li>US $9 once for extra inks</li></ul></div>
      <picture class="hero-art"><source type="image/webp" srcset="/assets/hero-768.webp 768w, /assets/hero-1280.webp 1280w" sizes="(max-width: 850px) 54vw, 680px"><img src="/assets/hero-1280.jpg" width="1280" height="853" alt="Two paper drawing creatures passing through red and blue gates into a handmade game board" decoding="async" fetchpriority="high"></picture>
    </section>
    <section class="maker" id="maker" aria-labelledby="maker-title">
      <div class="maker-heading"><div><p class="kicker">Game maker</p><h2 id="maker-title">Make a game from two drawings</h2></div><p class="local-note"><span aria-hidden="true">⌂</span> ${storageAvailable ? 'Saved in this browser' : 'Storage unavailable—export before closing'}</p></div>
      ${stepTabs()}
      <div id="work-stage" class="work-stage"></div>
      <div class="project-tools" aria-labelledby="project-tools-title"><div><h3 id="project-tools-title">Export or import a project file</h3><p>Move a game to another device with a project file.</p></div><div class="button-row"><button type="button" class="secondary" data-action="export">Export project</button><label class="button secondary file-button"><span>Import project</span><input id="import-file" type="file" accept="application/json,.json"></label></div></div>
    </section>
    ${renderPaid()}
    <section class="how"><p class="kicker">How to make a game</p><h2>How drawings become a game</h2><ol><li><span>01</span><h3>Add two drawings</h3><p>Use the pad or a clear photo on plain paper.</p></li><li><span>02</span><h3>Choose a game rule</h3><p>Choose dodge, collect, or maze.</p></li><li><span>03</span><h3>Play side by side</h3><p>Use arrow keys, the W, A, S, and D keys, or the touch pad.</p></li></ol></section>`;
  renderStage();
};

const stepTabs = (): string => `<ol class="step-tabs" aria-label="Game-making steps">
  ${(['choose', 'draw', 'tune', 'play'] as Step[]).map((name, index) => `<li><button type="button" data-step="${name}" ${step === name ? 'aria-current="step"' : ''}><span>${index + 1}</span>${name === 'choose' ? 'Choose game' : name === 'draw' ? 'Add drawings' : name === 'tune' ? 'Tune rules' : 'Play game'}</button></li>`).join('')}
</ol>`;

const renderDemo = (main: HTMLElement): void => {
  main.innerHTML = `
    <aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><span><button type="button" class="text-button" data-action="reset-demo">Reset demo</button><a href="/" data-route="/">Start for real</a></span></aside>
    <section class="demo-first" id="maker" aria-labelledby="demo-title">
      <div class="demo-heading"><div><p class="kicker">Playable sample</p><h1 id="demo-title" tabindex="-1">Play Maya and Theo’s Doodle dodge</h1><p>Two sample drawings are ready. The Workshop Pack finish is included for this demo.</p></div></div>
      ${step === 'play' ? '' : stepTabs()}
      <h2 class="visually-hidden">${step === 'play' ? 'Play the sample round' : 'Change the sample game'}</h2>
      <div id="work-stage" class="work-stage demo-stage"></div>
      <div class="project-tools" aria-labelledby="project-tools-title"><div><h2 id="project-tools-title">Export or import a project file</h2><p>Demo files stay separate from your saved game.</p></div><div class="button-row"><button type="button" class="secondary" data-action="export">Export sample project</button><label class="button secondary file-button"><span>Import sample project</span><input id="import-file" type="file" accept="application/json,.json"></label></div></div>
    </section>
    <section class="how"><p class="kicker">Try another version</p><h2>Change the sample game</h2><ol><li><span>01</span><h3>Add sample drawings</h3><p>Draw or use a clear photo on plain paper.</p></li><li><span>02</span><h3>Choose a game rule</h3><p>Choose dodge, collect, or maze.</p></li><li><span>03</span><h3>Play side by side</h3><p>Use arrow keys, the W, A, S, and D keys, or the touch pad.</p></li></ol></section>`;
  renderStage();
};

const renderPaid = (): string => paid ? `
  <section class="paid-strip paid-active" aria-labelledby="pack-title"><div><p class="kicker">Workshop Pack active</p><h2 id="pack-title">Bonus inks are ready.</h2><p>This license is saved in this browser.</p></div><div class="pack-mark" aria-hidden="true"><i></i><i></i><i></i></div></section>` : `
  <section class="paid-strip" aria-labelledby="pack-title"><div><p class="kicker">Optional extra</p><h2 id="pack-title">Workshop Pack · US $9 once</h2><p>Four bonus ink colours and a finish celebration. The game maker, saving, and exports are free.</p><p class="legal-small">Sociobot/Dodo hosts checkout as the merchant of record. Read <a href="/privacy" data-route="/privacy">Privacy</a> and <a href="/terms" data-route="/terms">Terms</a>.</p></div><div class="purchase"><a class="primary-link" href="${checkoutUrl}">Buy Workshop Pack</a><details><summary>Have a license?</summary><form id="license-form"><label for="license-token">Paste the token from your receipt</label><div class="paste-row"><input id="license-token" autocomplete="off" spellcheck="false"><button type="submit" class="secondary" aria-label="Restore Workshop Pack">Restore Workshop Pack</button></div></form></details></div></section>`;

const renderStage = (): void => {
  game?.dispose(); game = undefined;
  const stage = document.querySelector<HTMLElement>('#work-stage');
  if (!stage) return;
  if (step === 'choose') stage.innerHTML = chooseMarkup();
  else if (step === 'draw') { stage.innerHTML = drawMarkup(); setupEditor(); }
  else if (step === 'tune') stage.innerHTML = tuneMarkup();
  else { stage.innerHTML = playMarkup(isDemo); setupGame(); }
};

const chooseMarkup = (): string => `
  <div class="stage-intro"><p class="step-number">Step 1</p><div><h3>Choose a game rule</h3><p>Pick dodge, collect, or maze for these two drawings.</p></div></div>
  <div class="template-grid" role="radiogroup" aria-label="Game template">
    ${(Object.entries(templateCopy) as [GameTemplate, typeof templateCopy.collect][]).map(([key, info]) => `<button type="button" class="template-card" role="radio" aria-checked="${project.template === key}" tabindex="${project.template === key ? '0' : '-1'}" data-template="${key}"><span class="template-sketch ${key}" aria-hidden="true"><i></i><b></b><em></em></span><span class="template-eyebrow">${info.eyebrow}</span><strong>${info.title}</strong><small>${info.description}</small><span class="choose-label">${project.template === key ? 'Chosen ✓' : `Choose ${info.title}`}</span></button>`).join('')}
  </div><div class="stage-actions"><span></span><button type="button" class="primary" data-next="draw">Add two drawings <span aria-hidden="true">→</span></button></div>`;

const drawMarkup = (): string => {
  const objectName = templateCopy[project.template].object;
  const colors = ['#172033', '#D8422E', '#1859C9', '#237A4B', ...(paid ? ['#8B3FA8', '#D56B00', '#087B80', '#EE6F9A'] : [])];
  return `
    <div class="stage-intro"><p class="step-number">Step 2</p><div><h3>Add two drawings</h3><p>Draw here or take a photo. Bold dark lines on plain light paper clean up best.</p></div></div>
    <div class="asset-tabs" role="tablist" aria-label="Drawing slots"><button type="button" role="tab" aria-selected="${activeSlot === 'hero'}" data-slot="hero"><span class="asset-dot hero-dot"></span>Player drawing ${project.assets.hero ? '<b>Ready</b>' : '<b>Needs drawing</b>'}</button><button type="button" role="tab" aria-selected="${activeSlot === 'object'}" data-slot="object"><span class="asset-dot object-dot"></span>${objectName} drawing ${project.assets.object ? '<b>Ready</b>' : '<b>Needs drawing</b>'}</button></div>
    <div class="editor-layout"><div class="canvas-wrap"><canvas id="draw-canvas" width="640" height="420" aria-label="Drawing pad for ${activeSlot === 'hero' ? 'player' : objectName.toLowerCase()}" tabindex="0"></canvas><span class="canvas-caption">${activeSlot === 'hero' ? 'Player' : objectName} drawing pad</span></div>
      <div class="drawing-tools"><fieldset><legend>Ink colour</legend><div class="swatches">${colors.map((color) => `<button type="button" class="swatch" data-color="${color}" aria-label="Use ${color} ink" aria-pressed="${editorColor === color}" style="--swatch:${color}"></button>`).join('')}</div>${!paid ? '<small>4 bonus inks in Workshop Pack</small>' : ''}</fieldset>
      <label for="brush-size">Brush size <output id="brush-output">${editorSize}px</output></label><input id="brush-size" type="range" min="4" max="32" value="${editorSize}">
      <div class="tool-grid"><button type="button" class="secondary" data-action="eraser" aria-pressed="${erasing}">Eraser</button><button type="button" class="secondary" data-action="undo" ${editorHistory.length ? '' : 'disabled'}>Undo</button><button type="button" class="secondary" data-action="clear">Clear</button></div>
      <div class="photo-tool"><label class="button secondary file-button"><span>Use a photo</span><input id="photo-file" type="file" accept="image/*" capture="environment"></label><button type="button" class="secondary" data-action="remove-bg">Remove paper</button><small>Photos never leave this device. Background cleanup works best with a high-contrast drawing on plain paper.</small></div></div></div>
    <div class="stage-actions"><button type="button" class="text-button" data-back="choose">← Change game</button><button type="button" class="primary" data-action="save-art">Save drawing</button><button type="button" class="primary" data-next="tune">Tune rules <span aria-hidden="true">→</span></button></div>`;
};

const tuneMarkup = (): string => {
  const shortLabel = project.template === 'dodge' ? '15 seconds' : project.template === 'collect' ? '5 treasures' : 'Relaxed target';
  const longLabel = project.template === 'dodge' ? '30 seconds' : project.template === 'collect' ? '10 treasures' : 'Fewer moves';
  return `<div class="stage-intro"><p class="step-number">Step 3</p><div><h3>Tune three rules</h3><p>The game is ready. These are the three settings.</p></div></div>
    <div class="tune-grid"><fieldset><legend>Movement speed</legend><label><input type="radio" name="speed" value="gentle" ${project.speed === 'gentle' ? 'checked' : ''}><span><b>Gentle</b><small>More room to learn</small></span></label><label><input type="radio" name="speed" value="zippy" ${project.speed === 'zippy' ? 'checked' : ''}><span><b>Zippy</b><small>A lively challenge</small></span></label></fieldset>
    <fieldset><legend>Score goal</legend><label><input type="radio" name="score" value="short" ${project.score === 'short' ? 'checked' : ''}><span><b>${shortLabel}</b><small>Good for a first round</small></span></label><label><input type="radio" name="score" value="long" ${project.score === 'long' ? 'checked' : ''}><span><b>${longLabel}</b><small>Try a bigger challenge</small></span></label></fieldset>
    <fieldset><legend>Game sound</legend><label class="sound-toggle"><input type="checkbox" id="sound-toggle" ${project.sound ? 'checked' : ''}><span><b>${project.sound ? 'Sound on' : 'Sound off'}</b><small>Simple locally generated beeps</small></span></label></fieldset></div>
    <div class="stage-actions"><button type="button" class="text-button" data-back="draw">← Edit drawings</button><button type="button" class="primary play-button" data-next="play"><span aria-hidden="true">▶</span> Play game</button></div>`;
};

const playMarkup = (compact = false): string => `
  ${compact ? `<div class="demo-game-meta"><p>${templateCopy[project.template].title} · Use arrow keys, W, A, S, and D keys, or touch.</p><div class="hud"><strong id="game-score">Ready</strong><span id="game-detail">Press start</span></div></div>` : `<div class="stage-intro play-intro"><p class="step-number">Step 4</p><div><h3>${escapeHtml(project.title)}</h3><p>${templateCopy[project.template].title} · Use arrow keys, W, A, S, and D keys, or touch.</p></div><div class="hud"><strong id="game-score">Ready</strong><span id="game-detail">Press start</span></div></div>`}
  <div class="game-shell"><div class="game-screen"><canvas id="game-canvas" width="720" height="430" tabindex="0" aria-label="${templateCopy[project.template].title} play area. Use arrow keys or the W, A, S, and D keys.">Your browser needs canvas to play this game.</canvas><div id="game-message" class="game-message" role="status" aria-live="assertive" hidden></div>${paid ? '<div id="confetti" class="confetti" aria-hidden="true"></div>' : ''}</div>
  <div class="game-controls"><div class="dpad" aria-label="Touch direction controls"><span></span><button type="button" data-direction="up" aria-label="Move up">↑</button><span></span><button type="button" data-direction="left" aria-label="Move left">←</button><button type="button" data-direction="down" aria-label="Move down">↓</button><button type="button" data-direction="right" aria-label="Move right">→</button></div><div class="round-actions"><button type="button" class="primary" data-action="start-game">Start round</button><button type="button" class="secondary" data-action="reset-game">Reset round</button></div></div></div>
  <div class="stage-actions"><button type="button" class="text-button" data-back="tune">← Tune rules</button><button type="button" class="secondary" data-back="choose">Choose another game</button></div>`;

const saveEditor = async (): Promise<boolean> => {
  const canvas = document.querySelector<HTMLCanvasElement>('#draw-canvas');
  if (!canvas) return false;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return false;
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  if (!pixels.some((value, index) => index % 4 === 3 && value > 10)) { setStatus(`Add something to the ${activeSlot === 'hero' ? 'player' : templateCopy[project.template].object.toLowerCase()} drawing pad first.`, 'error'); return false; }
  project.assets[activeSlot] = canvas.toDataURL('image/webp', .84);
  dirty = false;
  await persist(`${activeSlot === 'hero' ? 'Player drawing' : `${templateCopy[project.template].object} drawing`} saved on this device.`);
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

const focusTemplate = (template: GameTemplate): void => {
  document.querySelector<HTMLButtonElement>(`[data-template="${template}"]`)?.focus();
};

const selectTemplate = async (template: GameTemplate): Promise<void> => {
  project.template = template;
  await persist('Game type saved.');
  renderStage();
  focusTemplate(template);
};

const demoRequested = (): boolean => location.pathname.replace(/\/+$/, '') === '/demo' || new URLSearchParams(location.search).get('demo') === '1';

const loadRouteProject = async (): Promise<void> => {
  const nextDemo = demoRequested();
  if (nextDemo !== isDemo) {
    if (isDemo) await discardDemoProject();
    isDemo = nextDemo;
    setDemoMode(isDemo);
    paid = isDemo ? true : hasOptimisticUnlock();
    project = await loadProject();
    if (isDemo) await saveProject(project);
    step = isDemo ? 'play' : 'choose';
    activeSlot = 'hero';
    dirty = false;
  }
};

const navigate = async (url: string, replace = false): Promise<void> => {
  if (replace) history.replaceState({}, '', url);
  else history.pushState({}, '', url);
  await loadRouteProject();
  renderRoute();
  focusRouteHeading();
};

const handleClick = async (event: MouseEvent): Promise<void> => {
  const target = event.target as HTMLElement;
  const route = target.closest<HTMLAnchorElement>('[data-route]');
  if (route) { event.preventDefault(); await navigate(route.href); return; }
  const stepButton = target.closest<HTMLButtonElement>('[data-step]');
  if (stepButton) { if (step === 'draw' && dirty) await saveEditor(); step = stepButton.dataset.step as Step; renderWorkshop(document.querySelector('#main') as HTMLElement); document.querySelector('#maker')?.scrollIntoView({ behavior: 'smooth' }); return; }
  const templateButton = target.closest<HTMLButtonElement>('[data-template]');
  if (templateButton) { await selectTemplate(templateButton.dataset.template as GameTemplate); return; }
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
  if (color) {
    editorColor = color.dataset.color ?? '#172033'; erasing = false;
    document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach((swatch) => swatch.setAttribute('aria-pressed', String(swatch === color)));
    const eraser = document.querySelector<HTMLButtonElement>('[data-action="eraser"]');
    eraser?.setAttribute('aria-pressed', 'false');
    if (eraser) eraser.textContent = 'Eraser';
    return;
  }
  const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'save-art') { await saveEditor(); renderStage(); }
  if (action === 'undo') { const canvas = document.querySelector<HTMLCanvasElement>('#draw-canvas'); const image = editorHistory.pop(); const context = canvas?.getContext('2d'); if (image && context) { context.putImageData(image, 0, 0); dirty = true; updateUndoButton(); } }
  if (action === 'clear') { const canvas = document.querySelector<HTMLCanvasElement>('#draw-canvas'); const context = canvas?.getContext('2d', { willReadFrequently: true }); if (canvas && context) { editorHistory.push(context.getImageData(0, 0, canvas.width, canvas.height)); context.clearRect(0, 0, canvas.width, canvas.height); dirty = true; updateUndoButton(); setStatus('Pad cleared. Use Undo if you want it back.'); } }
  if (action === 'eraser') { erasing = !erasing; const button = target.closest<HTMLButtonElement>('[data-action="eraser"]'); button?.setAttribute('aria-pressed', String(erasing)); if (button) button.textContent = erasing ? 'Eraser on' : 'Eraser'; }
  if (action === 'remove-bg') { const canvas = document.querySelector<HTMLCanvasElement>('#draw-canvas'); const context = canvas?.getContext('2d', { willReadFrequently: true }); if (canvas && context) { editorHistory.push(context.getImageData(0, 0, canvas.width, canvas.height)); removePaperBackground(canvas); dirty = true; updateUndoButton(); setStatus('Light paper softened. Use Undo if an edge disappeared.', 'success'); } }
  if (action === 'export') downloadProject();
  if (action === 'reset-demo') {
    project = await resetDemoProject(); step = 'play'; activeSlot = 'hero'; dirty = false;
    renderRoute(); setStatus('Fresh sample drawings are ready.', 'success');
  }
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
  if (isDemo) return;
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
  isDemo = demoRequested();
  setDemoMode(isDemo);
  const returnedLicense = isDemo ? false : captureReturnedLicense();
  paid = isDemo ? true : hasOptimisticUnlock();
  if (isDemo) { project = sampleProject(); step = 'play'; }
  shell(); renderRoute(); updateConnection();
  app.addEventListener('click', (event) => { void handleClick(event); });
  app.addEventListener('change', (event) => { void handleChange(event); });
  app.addEventListener('submit', (event) => { void handleSubmit(event as SubmitEvent); });
  app.addEventListener('keydown', (event) => {
    const keyEvent = event as KeyboardEvent;
    const card = (keyEvent.target as HTMLElement).closest<HTMLButtonElement>('[data-template]');
    if (!card || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(keyEvent.key)) return;
    const templates = [...document.querySelectorAll<HTMLButtonElement>('[data-template]')];
    const current = templates.indexOf(card);
    let next = current;
    if (keyEvent.key === 'ArrowLeft' || keyEvent.key === 'ArrowUp') next = (current + templates.length - 1) % templates.length;
    if (keyEvent.key === 'ArrowRight' || keyEvent.key === 'ArrowDown') next = (current + 1) % templates.length;
    if (keyEvent.key === 'Home') next = 0;
    if (keyEvent.key === 'End') next = templates.length - 1;
    keyEvent.preventDefault();
    const template = templates[next]?.dataset.template as GameTemplate | undefined;
    if (template) void selectTemplate(template);
  });
  window.addEventListener('popstate', () => { void loadRouteProject().then(() => { renderRoute(); focusRouteHeading(); }); }); window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection);
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && step === 'play' && location.pathname === '/') { step = 'tune'; renderWorkshop(document.querySelector('#main') as HTMLElement); } });
  registerServiceWorker();
  try { project = await loadProject(); if (isDemo) await saveProject(project); } catch { storageAvailable = false; }
  renderRoute();
  const verdict = isDemo ? null : await verifyLicense();
  if (returnedLicense && !verdict && !navigator.onLine) setStatus('Connect to the internet once to verify this license. Your free game is still ready.', 'plain');
  if (verdict && verdict.valid !== paid) { paid = verdict.valid; renderRoute(); if (!verdict.valid) setStatus('This license is no longer active. Free games and your drawings are unchanged.', 'error'); }
  else if (returnedLicense && verdict && !verdict.valid) setStatus('That license is not active. Check the token or buy the Workshop Pack.', 'error');
};

void init();
