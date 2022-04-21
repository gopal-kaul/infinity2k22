import '/node_modules/vite/dist/client/env.mjs';

const template = /*html*/ `
<style>
:host {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  margin: 0;
  background: rgba(0, 0, 0, 0.66);
  --monospace: 'SFMono-Regular', Consolas,
              'Liberation Mono', Menlo, Courier, monospace;
  --red: #ff5555;
  --yellow: #e2aa53;
  --purple: #cfa4ff;
  --cyan: #2dd9da;
  --dim: #c9c9c9;
}

.window {
  font-family: var(--monospace);
  line-height: 1.5;
  width: 800px;
  color: #d8d8d8;
  margin: 30px auto;
  padding: 25px 40px;
  position: relative;
  background: #181818;
  border-radius: 6px 6px 8px 8px;
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
  overflow: hidden;
  border-top: 8px solid var(--red);
  direction: ltr;
  text-align: left;
}

pre {
  font-family: var(--monospace);
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 1em;
  overflow-x: scroll;
  scrollbar-width: none;
}

pre::-webkit-scrollbar {
  display: none;
}

.message {
  line-height: 1.3;
  font-weight: 600;
  white-space: pre-wrap;
}

.message-body {
  color: var(--red);
}

.plugin {
  color: var(--purple);
}

.file {
  color: var(--cyan);
  margin-bottom: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.frame {
  color: var(--yellow);
}

.stack {
  font-size: 13px;
  color: var(--dim);
}

.tip {
  font-size: 13px;
  color: #999;
  border-top: 1px dotted #999;
  padding-top: 13px;
}

code {
  font-size: 13px;
  font-family: var(--monospace);
  color: var(--yellow);
}

.file-link {
  text-decoration: underline;
  cursor: pointer;
}
</style>
<div class="window">
  <pre class="message"><span class="plugin"></span><span class="message-body"></span></pre>
  <pre class="file"></pre>
  <pre class="frame"></pre>
  <pre class="stack"></pre>
  <div class="tip">
    Click outside or fix the code to dismiss.<br>
    You can also disable this overlay by setting
    <code>server.hmr.overlay</code> to <code>false</code> in <code>vite.config.js.</code>
  </div>
</div>
`;
const fileRE = /(?:[a-zA-Z]:\\|\/).*?:\d+:\d+/g;
const codeframeRE = /^(?:>?\s+\d+\s+\|.*|\s+\|\s*\^.*)\r?\n/gm;
class ErrorOverlay extends HTMLElement {
    constructor(err) {
        var _a;
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template;
        codeframeRE.lastIndex = 0;
        const hasFrame = err.frame && codeframeRE.test(err.frame);
        const message = hasFrame
            ? err.message.replace(codeframeRE, '')
            : err.message;
        if (err.plugin) {
            this.text('.plugin', `[plugin:${err.plugin}] `);
        }
        this.text('.message-body', message.trim());
        const [file] = (((_a = err.loc) === null || _a === void 0 ? void 0 : _a.file) || err.id || 'unknown file').split(`?`);
        if (err.loc) {
            this.text('.file', `${file}:${err.loc.line}:${err.loc.column}`, true);
        }
        else if (err.id) {
            this.text('.file', file);
        }
        if (hasFrame) {
            this.text('.frame', err.frame.trim());
        }
        this.text('.stack', err.stack, true);
        this.root.querySelector('.window').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        this.addEventListener('click', () => {
            this.close();
        });
    }
    text(selector, text, linkFiles = false) {
        const el = this.root.querySelector(selector);
        if (!linkFiles) {
            el.textContent = text;
        }
        else {
            let curIndex = 0;
            let match;
            while ((match = fileRE.exec(text))) {
                const { 0: file, index } = match;
                if (index != null) {
                    const frag = text.slice(curIndex, index);
                    el.appendChild(document.createTextNode(frag));
                    const link = document.createElement('a');
                    link.textContent = file;
                    link.className = 'file-link';
                    link.onclick = () => {
                        fetch('/__open-in-editor?file=' + encodeURIComponent(file));
                    };
                    el.appendChild(link);
                    curIndex += frag.length + file.length;
                }
            }
        }
    }
    close() {
        var _a;
        (_a = this.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this);
    }
}
const overlayId = 'vite-error-overlay';
if (customElements && !customElements.get(overlayId)) {
    customElements.define(overlayId, ErrorOverlay);
}

console.log('[vite] connecting...');
// use server configuration, then fallback to inference
const socketProtocol = null || (location.protocol === 'https:' ? 'wss' : 'ws');
const socketHost = `${null || location.hostname}:${"3000"}`;
const socket = new WebSocket(`${socketProtocol}://${socketHost}`, 'vite-hmr');
const base = "/" || '/';
const messageBuffer = [];
function warnFailedFetch(err, path) {
    if (!err.message.match('fetch')) {
        console.error(err);
    }
    console.error(`[hmr] Failed to reload ${path}. ` +
        `This could be due to syntax errors or importing non-existent ` +
        `modules. (see errors above)`);
}
function cleanUrl(pathname) {
    const url = new URL(pathname, location.toString());
    url.searchParams.delete('direct');
    return url.pathname + url.search;
}
// Listen for messages
socket.addEventListener('message', async ({ data }) => {
    handleMessage(JSON.parse(data));
});
let isFirstUpdate = true;
async function handleMessage(payload) {
    switch (payload.type) {
        case 'connected':
            console.log(`[vite] connected.`);
            sendMessageBuffer();
            // proxy(nginx, docker) hmr ws maybe caused timeout,
            // so send ping package let ws keep alive.
            setInterval(() => socket.send('{"type":"ping"}'), 30000);
            break;
        case 'update':
            notifyListeners('vite:beforeUpdate', payload);
            // if this is the first update and there's already an error overlay, it
            // means the page opened with existing server compile error and the whole
            // module script failed to load (since one of the nested imports is 500).
            // in this case a normal update won't work and a full reload is needed.
            if (isFirstUpdate && hasErrorOverlay()) {
                window.location.reload();
                return;
            }
            else {
                clearErrorOverlay();
                isFirstUpdate = false;
            }
            payload.updates.forEach((update) => {
                if (update.type === 'js-update') {
                    queueUpdate(fetchUpdate(update));
                }
                else {
                    // css-update
                    // this is only sent when a css file referenced with <link> is updated
                    const { path, timestamp } = update;
                    const searchUrl = cleanUrl(path);
                    // can't use querySelector with `[href*=]` here since the link may be
                    // using relative paths so we need to use link.href to grab the full
                    // URL for the include check.
                    const el = Array.from(document.querySelectorAll('link')).find((e) => cleanUrl(e.href).includes(searchUrl));
                    if (el) {
                        const newPath = `${base}${searchUrl.slice(1)}${searchUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
                        el.href = new URL(newPath, el.href).href;
                    }
                    console.log(`[vite] css hot updated: ${searchUrl}`);
                }
            });
            break;
        case 'custom': {
            notifyListeners(payload.event, payload.data);
            break;
        }
        case 'full-reload':
            notifyListeners('vite:beforeFullReload', payload);
            if (payload.path && payload.path.endsWith('.html')) {
                // if html file is edited, only reload the page if the browser is
                // currently on that page.
                const pagePath = decodeURI(location.pathname);
                const payloadPath = base + payload.path.slice(1);
                if (pagePath === payloadPath ||
                    (pagePath.endsWith('/') && pagePath + 'index.html' === payloadPath)) {
                    location.reload();
                }
                return;
            }
            else {
                location.reload();
            }
            break;
        case 'prune':
            notifyListeners('vite:beforePrune', payload);
            // After an HMR update, some modules are no longer imported on the page
            // but they may have left behind side effects that need to be cleaned up
            // (.e.g style injections)
            // TODO Trigger their dispose callbacks.
            payload.paths.forEach((path) => {
                const fn = pruneMap.get(path);
                if (fn) {
                    fn(dataMap.get(path));
                }
            });
            break;
        case 'error': {
            notifyListeners('vite:error', payload);
            const err = payload.err;
            if (enableOverlay) {
                createErrorOverlay(err);
            }
            else {
                console.error(`[vite] Internal Server Error\n${err.message}\n${err.stack}`);
            }
            break;
        }
        default: {
            const check = payload;
            return check;
        }
    }
}
function notifyListeners(event, data) {
    const cbs = customListenersMap.get(event);
    if (cbs) {
        cbs.forEach((cb) => cb(data));
    }
}
const enableOverlay = true;
function createErrorOverlay(err) {
    if (!enableOverlay)
        return;
    clearErrorOverlay();
    document.body.appendChild(new ErrorOverlay(err));
}
function clearErrorOverlay() {
    document
        .querySelectorAll(overlayId)
        .forEach((n) => n.close());
}
function hasErrorOverlay() {
    return document.querySelectorAll(overlayId).length;
}
let pending = false;
let queued = [];
/**
 * buffer multiple hot updates triggered by the same src change
 * so that they are invoked in the same order they were sent.
 * (otherwise the order may be inconsistent because of the http request round trip)
 */
async function queueUpdate(p) {
    queued.push(p);
    if (!pending) {
        pending = true;
        await Promise.resolve();
        pending = false;
        const loading = [...queued];
        queued = [];
        (await Promise.all(loading)).forEach((fn) => fn && fn());
    }
}
async function waitForSuccessfulPing(ms = 1000) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const pingResponse = await fetch(`${base}__vite_ping`);
            // success - 2xx status code
            if (pingResponse.ok)
                break;
            // failure - non-2xx status code
            else
                throw new Error();
        }
        catch (e) {
            // wait ms before attempting to ping again
            await new Promise((resolve) => setTimeout(resolve, ms));
        }
    }
}
// ping server
socket.addEventListener('close', async ({ wasClean }) => {
    if (wasClean)
        return;
    console.log(`[vite] server connection lost. polling for restart...`);
    await waitForSuccessfulPing();
    location.reload();
});
const sheetsMap = new Map();
function updateStyle(id, content) {
    let style = sheetsMap.get(id);
    {
        if (style && !(style instanceof HTMLStyleElement)) {
            removeStyle(id);
            style = undefined;
        }
        if (!style) {
            style = document.createElement('style');
            style.setAttribute('type', 'text/css');
            style.innerHTML = content;
            document.head.appendChild(style);
        }
        else {
            style.innerHTML = content;
        }
    }
    sheetsMap.set(id, style);
}
function removeStyle(id) {
    const style = sheetsMap.get(id);
    if (style) {
        if (style instanceof CSSStyleSheet) {
            // @ts-expect-error: using experimental API
            document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== style);
        }
        else {
            document.head.removeChild(style);
        }
        sheetsMap.delete(id);
    }
}
async function fetchUpdate({ path, acceptedPath, timestamp }) {
    const mod = hotModulesMap.get(path);
    if (!mod) {
        // In a code-splitting project,
        // it is common that the hot-updating module is not loaded yet.
        // https://github.com/vitejs/vite/issues/721
        return;
    }
    const moduleMap = new Map();
    const isSelfUpdate = path === acceptedPath;
    // make sure we only import each dep once
    const modulesToUpdate = new Set();
    if (isSelfUpdate) {
        // self update - only update self
        modulesToUpdate.add(path);
    }
    else {
        // dep update
        for (const { deps } of mod.callbacks) {
            deps.forEach((dep) => {
                if (acceptedPath === dep) {
                    modulesToUpdate.add(dep);
                }
            });
        }
    }
    // determine the qualified callbacks before we re-import the modules
    const qualifiedCallbacks = mod.callbacks.filter(({ deps }) => {
        return deps.some((dep) => modulesToUpdate.has(dep));
    });
    await Promise.all(Array.from(modulesToUpdate).map(async (dep) => {
        const disposer = disposeMap.get(dep);
        if (disposer)
            await disposer(dataMap.get(dep));
        const [path, query] = dep.split(`?`);
        try {
            const newMod = await import(
            /* @vite-ignore */
            base +
                path.slice(1) +
                `?import&t=${timestamp}${query ? `&${query}` : ''}`);
            moduleMap.set(dep, newMod);
        }
        catch (e) {
            warnFailedFetch(e, dep);
        }
    }));
    return () => {
        for (const { deps, fn } of qualifiedCallbacks) {
            fn(deps.map((dep) => moduleMap.get(dep)));
        }
        const loggedPath = isSelfUpdate ? path : `${acceptedPath} via ${path}`;
        console.log(`[vite] hot updated: ${loggedPath}`);
    };
}
function sendMessageBuffer() {
    if (socket.readyState === 1) {
        messageBuffer.forEach((msg) => socket.send(msg));
        messageBuffer.length = 0;
    }
}
const hotModulesMap = new Map();
const disposeMap = new Map();
const pruneMap = new Map();
const dataMap = new Map();
const customListenersMap = new Map();
const ctxToListenersMap = new Map();
function createHotContext(ownerPath) {
    if (!dataMap.has(ownerPath)) {
        dataMap.set(ownerPath, {});
    }
    // when a file is hot updated, a new context is created
    // clear its stale callbacks
    const mod = hotModulesMap.get(ownerPath);
    if (mod) {
        mod.callbacks = [];
    }
    // clear stale custom event listeners
    const staleListeners = ctxToListenersMap.get(ownerPath);
    if (staleListeners) {
        for (const [event, staleFns] of staleListeners) {
            const listeners = customListenersMap.get(event);
            if (listeners) {
                customListenersMap.set(event, listeners.filter((l) => !staleFns.includes(l)));
            }
        }
    }
    const newListeners = new Map();
    ctxToListenersMap.set(ownerPath, newListeners);
    function acceptDeps(deps, callback = () => { }) {
        const mod = hotModulesMap.get(ownerPath) || {
            id: ownerPath,
            callbacks: []
        };
        mod.callbacks.push({
            deps,
            fn: callback
        });
        hotModulesMap.set(ownerPath, mod);
    }
    const hot = {
        get data() {
            return dataMap.get(ownerPath);
        },
        accept(deps, callback) {
            if (typeof deps === 'function' || !deps) {
                // self-accept: hot.accept(() => {})
                acceptDeps([ownerPath], ([mod]) => deps && deps(mod));
            }
            else if (typeof deps === 'string') {
                // explicit deps
                acceptDeps([deps], ([mod]) => callback && callback(mod));
            }
            else if (Array.isArray(deps)) {
                acceptDeps(deps, callback);
            }
            else {
                throw new Error(`invalid hot.accept() usage.`);
            }
        },
        acceptDeps() {
            throw new Error(`hot.acceptDeps() is deprecated. ` +
                `Use hot.accept() with the same signature instead.`);
        },
        dispose(cb) {
            disposeMap.set(ownerPath, cb);
        },
        // @ts-expect-error untyped
        prune(cb) {
            pruneMap.set(ownerPath, cb);
        },
        // TODO
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        decline() { },
        invalidate() {
            // TODO should tell the server to re-perform hmr propagation
            // from this module as root
            location.reload();
        },
        // custom events
        on(event, cb) {
            const addToMap = (map) => {
                const existing = map.get(event) || [];
                existing.push(cb);
                map.set(event, existing);
            };
            addToMap(customListenersMap);
            addToMap(newListeners);
        },
        send(event, data) {
            messageBuffer.push(JSON.stringify({ type: 'custom', event, data }));
            sendMessageBuffer();
        }
    };
    return hot;
}
/**
 * urls here are dynamic import() urls that couldn't be statically analyzed
 */
function injectQuery(url, queryToInject) {
    // skip urls that won't be handled by vite
    if (!url.startsWith('.') && !url.startsWith('/')) {
        return url;
    }
    // can't use pathname from URL since it may be relative like ../
    const pathname = url.replace(/#.*$/, '').replace(/\?.*$/, '');
    const { search, hash } = new URL(url, 'http://vitejs.dev');
    return `${pathname}?${queryToInject}${search ? `&` + search.slice(1) : ''}${hash || ''}`;
}

export { ErrorOverlay, createHotContext, injectQuery, removeStyle, updateStyle };
//# sourceMappingURL=client.mjs.map

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50Lm1qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaWVudC9vdmVybGF5LnRzIiwiLi4vLi4vc3JjL2NsaWVudC9jbGllbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFcnJvclBheWxvYWQgfSBmcm9tICd0eXBlcy9obXJQYXlsb2FkJ1xuXG5jb25zdCB0ZW1wbGF0ZSA9IC8qaHRtbCovIGBcbjxzdHlsZT5cbjpob3N0IHtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB6LWluZGV4OiA5OTk5OTtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuICBvdmVyZmxvdy15OiBzY3JvbGw7XG4gIG1hcmdpbjogMDtcbiAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjY2KTtcbiAgLS1tb25vc3BhY2U6ICdTRk1vbm8tUmVndWxhcicsIENvbnNvbGFzLFxuICAgICAgICAgICAgICAnTGliZXJhdGlvbiBNb25vJywgTWVubG8sIENvdXJpZXIsIG1vbm9zcGFjZTtcbiAgLS1yZWQ6ICNmZjU1NTU7XG4gIC0teWVsbG93OiAjZTJhYTUzO1xuICAtLXB1cnBsZTogI2NmYTRmZjtcbiAgLS1jeWFuOiAjMmRkOWRhO1xuICAtLWRpbTogI2M5YzljOTtcbn1cblxuLndpbmRvdyB7XG4gIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vc3BhY2UpO1xuICBsaW5lLWhlaWdodDogMS41O1xuICB3aWR0aDogODAwcHg7XG4gIGNvbG9yOiAjZDhkOGQ4O1xuICBtYXJnaW46IDMwcHggYXV0bztcbiAgcGFkZGluZzogMjVweCA0MHB4O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGJhY2tncm91bmQ6ICMxODE4MTg7XG4gIGJvcmRlci1yYWRpdXM6IDZweCA2cHggOHB4IDhweDtcbiAgYm94LXNoYWRvdzogMCAxOXB4IDM4cHggcmdiYSgwLDAsMCwwLjMwKSwgMCAxNXB4IDEycHggcmdiYSgwLDAsMCwwLjIyKTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgYm9yZGVyLXRvcDogOHB4IHNvbGlkIHZhcigtLXJlZCk7XG4gIGRpcmVjdGlvbjogbHRyO1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xufVxuXG5wcmUge1xuICBmb250LWZhbWlseTogdmFyKC0tbW9ub3NwYWNlKTtcbiAgZm9udC1zaXplOiAxNnB4O1xuICBtYXJnaW4tdG9wOiAwO1xuICBtYXJnaW4tYm90dG9tOiAxZW07XG4gIG92ZXJmbG93LXg6IHNjcm9sbDtcbiAgc2Nyb2xsYmFyLXdpZHRoOiBub25lO1xufVxuXG5wcmU6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuLm1lc3NhZ2Uge1xuICBsaW5lLWhlaWdodDogMS4zO1xuICBmb250LXdlaWdodDogNjAwO1xuICB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XG59XG5cbi5tZXNzYWdlLWJvZHkge1xuICBjb2xvcjogdmFyKC0tcmVkKTtcbn1cblxuLnBsdWdpbiB7XG4gIGNvbG9yOiB2YXIoLS1wdXJwbGUpO1xufVxuXG4uZmlsZSB7XG4gIGNvbG9yOiB2YXIoLS1jeWFuKTtcbiAgbWFyZ2luLWJvdHRvbTogMDtcbiAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1xuICB3b3JkLWJyZWFrOiBicmVhay1hbGw7XG59XG5cbi5mcmFtZSB7XG4gIGNvbG9yOiB2YXIoLS15ZWxsb3cpO1xufVxuXG4uc3RhY2sge1xuICBmb250LXNpemU6IDEzcHg7XG4gIGNvbG9yOiB2YXIoLS1kaW0pO1xufVxuXG4udGlwIHtcbiAgZm9udC1zaXplOiAxM3B4O1xuICBjb2xvcjogIzk5OTtcbiAgYm9yZGVyLXRvcDogMXB4IGRvdHRlZCAjOTk5O1xuICBwYWRkaW5nLXRvcDogMTNweDtcbn1cblxuY29kZSB7XG4gIGZvbnQtc2l6ZTogMTNweDtcbiAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm9zcGFjZSk7XG4gIGNvbG9yOiB2YXIoLS15ZWxsb3cpO1xufVxuXG4uZmlsZS1saW5rIHtcbiAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbjwvc3R5bGU+XG48ZGl2IGNsYXNzPVwid2luZG93XCI+XG4gIDxwcmUgY2xhc3M9XCJtZXNzYWdlXCI+PHNwYW4gY2xhc3M9XCJwbHVnaW5cIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJtZXNzYWdlLWJvZHlcIj48L3NwYW4+PC9wcmU+XG4gIDxwcmUgY2xhc3M9XCJmaWxlXCI+PC9wcmU+XG4gIDxwcmUgY2xhc3M9XCJmcmFtZVwiPjwvcHJlPlxuICA8cHJlIGNsYXNzPVwic3RhY2tcIj48L3ByZT5cbiAgPGRpdiBjbGFzcz1cInRpcFwiPlxuICAgIENsaWNrIG91dHNpZGUgb3IgZml4IHRoZSBjb2RlIHRvIGRpc21pc3MuPGJyPlxuICAgIFlvdSBjYW4gYWxzbyBkaXNhYmxlIHRoaXMgb3ZlcmxheSBieSBzZXR0aW5nXG4gICAgPGNvZGU+c2VydmVyLmhtci5vdmVybGF5PC9jb2RlPiB0byA8Y29kZT5mYWxzZTwvY29kZT4gaW4gPGNvZGU+dml0ZS5jb25maWcuanMuPC9jb2RlPlxuICA8L2Rpdj5cbjwvZGl2PlxuYFxuXG5jb25zdCBmaWxlUkUgPSAvKD86W2EtekEtWl06XFxcXHxcXC8pLio/OlxcZCs6XFxkKy9nXG5jb25zdCBjb2RlZnJhbWVSRSA9IC9eKD86Pj9cXHMrXFxkK1xccytcXHwuKnxcXHMrXFx8XFxzKlxcXi4qKVxccj9cXG4vZ21cblxuZXhwb3J0IGNsYXNzIEVycm9yT3ZlcmxheSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgcm9vdDogU2hhZG93Um9vdFxuXG4gIGNvbnN0cnVjdG9yKGVycjogRXJyb3JQYXlsb2FkWydlcnInXSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnJvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KVxuICAgIHRoaXMucm9vdC5pbm5lckhUTUwgPSB0ZW1wbGF0ZVxuXG4gICAgY29kZWZyYW1lUkUubGFzdEluZGV4ID0gMFxuICAgIGNvbnN0IGhhc0ZyYW1lID0gZXJyLmZyYW1lICYmIGNvZGVmcmFtZVJFLnRlc3QoZXJyLmZyYW1lKVxuICAgIGNvbnN0IG1lc3NhZ2UgPSBoYXNGcmFtZVxuICAgICAgPyBlcnIubWVzc2FnZS5yZXBsYWNlKGNvZGVmcmFtZVJFLCAnJylcbiAgICAgIDogZXJyLm1lc3NhZ2VcbiAgICBpZiAoZXJyLnBsdWdpbikge1xuICAgICAgdGhpcy50ZXh0KCcucGx1Z2luJywgYFtwbHVnaW46JHtlcnIucGx1Z2lufV0gYClcbiAgICB9XG4gICAgdGhpcy50ZXh0KCcubWVzc2FnZS1ib2R5JywgbWVzc2FnZS50cmltKCkpXG5cbiAgICBjb25zdCBbZmlsZV0gPSAoZXJyLmxvYz8uZmlsZSB8fCBlcnIuaWQgfHwgJ3Vua25vd24gZmlsZScpLnNwbGl0KGA/YClcbiAgICBpZiAoZXJyLmxvYykge1xuICAgICAgdGhpcy50ZXh0KCcuZmlsZScsIGAke2ZpbGV9OiR7ZXJyLmxvYy5saW5lfToke2Vyci5sb2MuY29sdW1ufWAsIHRydWUpXG4gICAgfSBlbHNlIGlmIChlcnIuaWQpIHtcbiAgICAgIHRoaXMudGV4dCgnLmZpbGUnLCBmaWxlKVxuICAgIH1cblxuICAgIGlmIChoYXNGcmFtZSkge1xuICAgICAgdGhpcy50ZXh0KCcuZnJhbWUnLCBlcnIuZnJhbWUhLnRyaW0oKSlcbiAgICB9XG4gICAgdGhpcy50ZXh0KCcuc3RhY2snLCBlcnIuc3RhY2ssIHRydWUpXG5cbiAgICB0aGlzLnJvb3QucXVlcnlTZWxlY3RvcignLndpbmRvdycpIS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgfSlcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGhpcy5jbG9zZSgpXG4gICAgfSlcbiAgfVxuXG4gIHRleHQoc2VsZWN0b3I6IHN0cmluZywgdGV4dDogc3RyaW5nLCBsaW5rRmlsZXMgPSBmYWxzZSk6IHZvaWQge1xuICAgIGNvbnN0IGVsID0gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIVxuICAgIGlmICghbGlua0ZpbGVzKSB7XG4gICAgICBlbC50ZXh0Q29udGVudCA9IHRleHRcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGN1ckluZGV4ID0gMFxuICAgICAgbGV0IG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsXG4gICAgICB3aGlsZSAoKG1hdGNoID0gZmlsZVJFLmV4ZWModGV4dCkpKSB7XG4gICAgICAgIGNvbnN0IHsgMDogZmlsZSwgaW5kZXggfSA9IG1hdGNoXG4gICAgICAgIGlmIChpbmRleCAhPSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgZnJhZyA9IHRleHQuc2xpY2UoY3VySW5kZXgsIGluZGV4KVxuICAgICAgICAgIGVsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGZyYWcpKVxuICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgICAgICAgICBsaW5rLnRleHRDb250ZW50ID0gZmlsZVxuICAgICAgICAgIGxpbmsuY2xhc3NOYW1lID0gJ2ZpbGUtbGluaydcbiAgICAgICAgICBsaW5rLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBmZXRjaCgnL19fb3Blbi1pbi1lZGl0b3I/ZmlsZT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGZpbGUpKVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbC5hcHBlbmRDaGlsZChsaW5rKVxuICAgICAgICAgIGN1ckluZGV4ICs9IGZyYWcubGVuZ3RoICsgZmlsZS5sZW5ndGhcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMucGFyZW50Tm9kZT8ucmVtb3ZlQ2hpbGQodGhpcylcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgb3ZlcmxheUlkID0gJ3ZpdGUtZXJyb3Itb3ZlcmxheSdcbmlmIChjdXN0b21FbGVtZW50cyAmJiAhY3VzdG9tRWxlbWVudHMuZ2V0KG92ZXJsYXlJZCkpIHtcbiAgY3VzdG9tRWxlbWVudHMuZGVmaW5lKG92ZXJsYXlJZCwgRXJyb3JPdmVybGF5KVxufVxuIiwiaW1wb3J0IHR5cGUgeyBFcnJvclBheWxvYWQsIEhNUlBheWxvYWQsIFVwZGF0ZSB9IGZyb20gJ3R5cGVzL2htclBheWxvYWQnXG5pbXBvcnQgdHlwZSB7IFZpdGVIb3RDb250ZXh0IH0gZnJvbSAndHlwZXMvaG90J1xuaW1wb3J0IHR5cGUgeyBJbmZlckN1c3RvbUV2ZW50UGF5bG9hZCB9IGZyb20gJ3R5cGVzL2N1c3RvbUV2ZW50J1xuaW1wb3J0IHsgRXJyb3JPdmVybGF5LCBvdmVybGF5SWQgfSBmcm9tICcuL292ZXJsYXknXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm9kZS9uby1taXNzaW5nLWltcG9ydFxuaW1wb3J0ICdAdml0ZS9lbnYnXG5cbi8vIGluamVjdGVkIGJ5IHRoZSBobXIgcGx1Z2luIHdoZW4gc2VydmVkXG5kZWNsYXJlIGNvbnN0IF9fQkFTRV9fOiBzdHJpbmdcbmRlY2xhcmUgY29uc3QgX19ITVJfUFJPVE9DT0xfXzogc3RyaW5nXG5kZWNsYXJlIGNvbnN0IF9fSE1SX0hPU1ROQU1FX186IHN0cmluZ1xuZGVjbGFyZSBjb25zdCBfX0hNUl9QT1JUX186IHN0cmluZ1xuZGVjbGFyZSBjb25zdCBfX0hNUl9USU1FT1VUX186IG51bWJlclxuZGVjbGFyZSBjb25zdCBfX0hNUl9FTkFCTEVfT1ZFUkxBWV9fOiBib29sZWFuXG5cbmNvbnNvbGUubG9nKCdbdml0ZV0gY29ubmVjdGluZy4uLicpXG5cbi8vIHVzZSBzZXJ2ZXIgY29uZmlndXJhdGlvbiwgdGhlbiBmYWxsYmFjayB0byBpbmZlcmVuY2VcbmNvbnN0IHNvY2tldFByb3RvY29sID1cbiAgX19ITVJfUFJPVE9DT0xfXyB8fCAobG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonID8gJ3dzcycgOiAnd3MnKVxuY29uc3Qgc29ja2V0SG9zdCA9IGAke19fSE1SX0hPU1ROQU1FX18gfHwgbG9jYXRpb24uaG9zdG5hbWV9OiR7X19ITVJfUE9SVF9ffWBcbmNvbnN0IHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoYCR7c29ja2V0UHJvdG9jb2x9Oi8vJHtzb2NrZXRIb3N0fWAsICd2aXRlLWhtcicpXG5jb25zdCBiYXNlID0gX19CQVNFX18gfHwgJy8nXG5jb25zdCBtZXNzYWdlQnVmZmVyOiBzdHJpbmdbXSA9IFtdXG5cbmZ1bmN0aW9uIHdhcm5GYWlsZWRGZXRjaChlcnI6IEVycm9yLCBwYXRoOiBzdHJpbmcgfCBzdHJpbmdbXSkge1xuICBpZiAoIWVyci5tZXNzYWdlLm1hdGNoKCdmZXRjaCcpKSB7XG4gICAgY29uc29sZS5lcnJvcihlcnIpXG4gIH1cbiAgY29uc29sZS5lcnJvcihcbiAgICBgW2htcl0gRmFpbGVkIHRvIHJlbG9hZCAke3BhdGh9LiBgICtcbiAgICAgIGBUaGlzIGNvdWxkIGJlIGR1ZSB0byBzeW50YXggZXJyb3JzIG9yIGltcG9ydGluZyBub24tZXhpc3RlbnQgYCArXG4gICAgICBgbW9kdWxlcy4gKHNlZSBlcnJvcnMgYWJvdmUpYFxuICApXG59XG5cbmZ1bmN0aW9uIGNsZWFuVXJsKHBhdGhuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB1cmwgPSBuZXcgVVJMKHBhdGhuYW1lLCBsb2NhdGlvbi50b1N0cmluZygpKVxuICB1cmwuc2VhcmNoUGFyYW1zLmRlbGV0ZSgnZGlyZWN0JylcbiAgcmV0dXJuIHVybC5wYXRobmFtZSArIHVybC5zZWFyY2hcbn1cblxuLy8gTGlzdGVuIGZvciBtZXNzYWdlc1xuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBhc3luYyAoeyBkYXRhIH0pID0+IHtcbiAgaGFuZGxlTWVzc2FnZShKU09OLnBhcnNlKGRhdGEpKVxufSlcblxubGV0IGlzRmlyc3RVcGRhdGUgPSB0cnVlXG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UocGF5bG9hZDogSE1SUGF5bG9hZCkge1xuICBzd2l0Y2ggKHBheWxvYWQudHlwZSkge1xuICAgIGNhc2UgJ2Nvbm5lY3RlZCc6XG4gICAgICBjb25zb2xlLmxvZyhgW3ZpdGVdIGNvbm5lY3RlZC5gKVxuICAgICAgc2VuZE1lc3NhZ2VCdWZmZXIoKVxuICAgICAgLy8gcHJveHkobmdpbngsIGRvY2tlcikgaG1yIHdzIG1heWJlIGNhdXNlZCB0aW1lb3V0LFxuICAgICAgLy8gc28gc2VuZCBwaW5nIHBhY2thZ2UgbGV0IHdzIGtlZXAgYWxpdmUuXG4gICAgICBzZXRJbnRlcnZhbCgoKSA9PiBzb2NrZXQuc2VuZCgne1widHlwZVwiOlwicGluZ1wifScpLCBfX0hNUl9USU1FT1VUX18pXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICBub3RpZnlMaXN0ZW5lcnMoJ3ZpdGU6YmVmb3JlVXBkYXRlJywgcGF5bG9hZClcbiAgICAgIC8vIGlmIHRoaXMgaXMgdGhlIGZpcnN0IHVwZGF0ZSBhbmQgdGhlcmUncyBhbHJlYWR5IGFuIGVycm9yIG92ZXJsYXksIGl0XG4gICAgICAvLyBtZWFucyB0aGUgcGFnZSBvcGVuZWQgd2l0aCBleGlzdGluZyBzZXJ2ZXIgY29tcGlsZSBlcnJvciBhbmQgdGhlIHdob2xlXG4gICAgICAvLyBtb2R1bGUgc2NyaXB0IGZhaWxlZCB0byBsb2FkIChzaW5jZSBvbmUgb2YgdGhlIG5lc3RlZCBpbXBvcnRzIGlzIDUwMCkuXG4gICAgICAvLyBpbiB0aGlzIGNhc2UgYSBub3JtYWwgdXBkYXRlIHdvbid0IHdvcmsgYW5kIGEgZnVsbCByZWxvYWQgaXMgbmVlZGVkLlxuICAgICAgaWYgKGlzRmlyc3RVcGRhdGUgJiYgaGFzRXJyb3JPdmVybGF5KCkpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xlYXJFcnJvck92ZXJsYXkoKVxuICAgICAgICBpc0ZpcnN0VXBkYXRlID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIHBheWxvYWQudXBkYXRlcy5mb3JFYWNoKCh1cGRhdGUpID0+IHtcbiAgICAgICAgaWYgKHVwZGF0ZS50eXBlID09PSAnanMtdXBkYXRlJykge1xuICAgICAgICAgIHF1ZXVlVXBkYXRlKGZldGNoVXBkYXRlKHVwZGF0ZSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gY3NzLXVwZGF0ZVxuICAgICAgICAgIC8vIHRoaXMgaXMgb25seSBzZW50IHdoZW4gYSBjc3MgZmlsZSByZWZlcmVuY2VkIHdpdGggPGxpbms+IGlzIHVwZGF0ZWRcbiAgICAgICAgICBjb25zdCB7IHBhdGgsIHRpbWVzdGFtcCB9ID0gdXBkYXRlXG4gICAgICAgICAgY29uc3Qgc2VhcmNoVXJsID0gY2xlYW5VcmwocGF0aClcbiAgICAgICAgICAvLyBjYW4ndCB1c2UgcXVlcnlTZWxlY3RvciB3aXRoIGBbaHJlZio9XWAgaGVyZSBzaW5jZSB0aGUgbGluayBtYXkgYmVcbiAgICAgICAgICAvLyB1c2luZyByZWxhdGl2ZSBwYXRocyBzbyB3ZSBuZWVkIHRvIHVzZSBsaW5rLmhyZWYgdG8gZ3JhYiB0aGUgZnVsbFxuICAgICAgICAgIC8vIFVSTCBmb3IgdGhlIGluY2x1ZGUgY2hlY2suXG4gICAgICAgICAgY29uc3QgZWwgPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MTGlua0VsZW1lbnQ+KCdsaW5rJylcbiAgICAgICAgICApLmZpbmQoKGUpID0+IGNsZWFuVXJsKGUuaHJlZikuaW5jbHVkZXMoc2VhcmNoVXJsKSlcbiAgICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1BhdGggPSBgJHtiYXNlfSR7c2VhcmNoVXJsLnNsaWNlKDEpfSR7XG4gICAgICAgICAgICAgIHNlYXJjaFVybC5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nXG4gICAgICAgICAgICB9dD0ke3RpbWVzdGFtcH1gXG4gICAgICAgICAgICBlbC5ocmVmID0gbmV3IFVSTChuZXdQYXRoLCBlbC5ocmVmKS5ocmVmXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKGBbdml0ZV0gY3NzIGhvdCB1cGRhdGVkOiAke3NlYXJjaFVybH1gKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdjdXN0b20nOiB7XG4gICAgICBub3RpZnlMaXN0ZW5lcnMocGF5bG9hZC5ldmVudCwgcGF5bG9hZC5kYXRhKVxuICAgICAgYnJlYWtcbiAgICB9XG4gICAgY2FzZSAnZnVsbC1yZWxvYWQnOlxuICAgICAgbm90aWZ5TGlzdGVuZXJzKCd2aXRlOmJlZm9yZUZ1bGxSZWxvYWQnLCBwYXlsb2FkKVxuICAgICAgaWYgKHBheWxvYWQucGF0aCAmJiBwYXlsb2FkLnBhdGguZW5kc1dpdGgoJy5odG1sJykpIHtcbiAgICAgICAgLy8gaWYgaHRtbCBmaWxlIGlzIGVkaXRlZCwgb25seSByZWxvYWQgdGhlIHBhZ2UgaWYgdGhlIGJyb3dzZXIgaXNcbiAgICAgICAgLy8gY3VycmVudGx5IG9uIHRoYXQgcGFnZS5cbiAgICAgICAgY29uc3QgcGFnZVBhdGggPSBkZWNvZGVVUkkobG9jYXRpb24ucGF0aG5hbWUpXG4gICAgICAgIGNvbnN0IHBheWxvYWRQYXRoID0gYmFzZSArIHBheWxvYWQucGF0aC5zbGljZSgxKVxuICAgICAgICBpZiAoXG4gICAgICAgICAgcGFnZVBhdGggPT09IHBheWxvYWRQYXRoIHx8XG4gICAgICAgICAgKHBhZ2VQYXRoLmVuZHNXaXRoKCcvJykgJiYgcGFnZVBhdGggKyAnaW5kZXguaHRtbCcgPT09IHBheWxvYWRQYXRoKVxuICAgICAgICApIHtcbiAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncHJ1bmUnOlxuICAgICAgbm90aWZ5TGlzdGVuZXJzKCd2aXRlOmJlZm9yZVBydW5lJywgcGF5bG9hZClcbiAgICAgIC8vIEFmdGVyIGFuIEhNUiB1cGRhdGUsIHNvbWUgbW9kdWxlcyBhcmUgbm8gbG9uZ2VyIGltcG9ydGVkIG9uIHRoZSBwYWdlXG4gICAgICAvLyBidXQgdGhleSBtYXkgaGF2ZSBsZWZ0IGJlaGluZCBzaWRlIGVmZmVjdHMgdGhhdCBuZWVkIHRvIGJlIGNsZWFuZWQgdXBcbiAgICAgIC8vICguZS5nIHN0eWxlIGluamVjdGlvbnMpXG4gICAgICAvLyBUT0RPIFRyaWdnZXIgdGhlaXIgZGlzcG9zZSBjYWxsYmFja3MuXG4gICAgICBwYXlsb2FkLnBhdGhzLmZvckVhY2goKHBhdGgpID0+IHtcbiAgICAgICAgY29uc3QgZm4gPSBwcnVuZU1hcC5nZXQocGF0aClcbiAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgZm4oZGF0YU1hcC5nZXQocGF0aCkpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Vycm9yJzoge1xuICAgICAgbm90aWZ5TGlzdGVuZXJzKCd2aXRlOmVycm9yJywgcGF5bG9hZClcbiAgICAgIGNvbnN0IGVyciA9IHBheWxvYWQuZXJyXG4gICAgICBpZiAoZW5hYmxlT3ZlcmxheSkge1xuICAgICAgICBjcmVhdGVFcnJvck92ZXJsYXkoZXJyKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBgW3ZpdGVdIEludGVybmFsIFNlcnZlciBFcnJvclxcbiR7ZXJyLm1lc3NhZ2V9XFxuJHtlcnIuc3RhY2t9YFxuICAgICAgICApXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICBjb25zdCBjaGVjazogbmV2ZXIgPSBwYXlsb2FkXG4gICAgICByZXR1cm4gY2hlY2tcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbm90aWZ5TGlzdGVuZXJzPFQgZXh0ZW5kcyBzdHJpbmc+KFxuICBldmVudDogVCxcbiAgZGF0YTogSW5mZXJDdXN0b21FdmVudFBheWxvYWQ8VD5cbik6IHZvaWRcbmZ1bmN0aW9uIG5vdGlmeUxpc3RlbmVycyhldmVudDogc3RyaW5nLCBkYXRhOiBhbnkpOiB2b2lkIHtcbiAgY29uc3QgY2JzID0gY3VzdG9tTGlzdGVuZXJzTWFwLmdldChldmVudClcbiAgaWYgKGNicykge1xuICAgIGNicy5mb3JFYWNoKChjYikgPT4gY2IoZGF0YSkpXG4gIH1cbn1cblxuY29uc3QgZW5hYmxlT3ZlcmxheSA9IF9fSE1SX0VOQUJMRV9PVkVSTEFZX19cblxuZnVuY3Rpb24gY3JlYXRlRXJyb3JPdmVybGF5KGVycjogRXJyb3JQYXlsb2FkWydlcnInXSkge1xuICBpZiAoIWVuYWJsZU92ZXJsYXkpIHJldHVyblxuICBjbGVhckVycm9yT3ZlcmxheSgpXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobmV3IEVycm9yT3ZlcmxheShlcnIpKVxufVxuXG5mdW5jdGlvbiBjbGVhckVycm9yT3ZlcmxheSgpIHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbChvdmVybGF5SWQpXG4gICAgLmZvckVhY2goKG4pID0+IChuIGFzIEVycm9yT3ZlcmxheSkuY2xvc2UoKSlcbn1cblxuZnVuY3Rpb24gaGFzRXJyb3JPdmVybGF5KCkge1xuICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChvdmVybGF5SWQpLmxlbmd0aFxufVxuXG5sZXQgcGVuZGluZyA9IGZhbHNlXG5sZXQgcXVldWVkOiBQcm9taXNlPCgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZD5bXSA9IFtdXG5cbi8qKlxuICogYnVmZmVyIG11bHRpcGxlIGhvdCB1cGRhdGVzIHRyaWdnZXJlZCBieSB0aGUgc2FtZSBzcmMgY2hhbmdlXG4gKiBzbyB0aGF0IHRoZXkgYXJlIGludm9rZWQgaW4gdGhlIHNhbWUgb3JkZXIgdGhleSB3ZXJlIHNlbnQuXG4gKiAob3RoZXJ3aXNlIHRoZSBvcmRlciBtYXkgYmUgaW5jb25zaXN0ZW50IGJlY2F1c2Ugb2YgdGhlIGh0dHAgcmVxdWVzdCByb3VuZCB0cmlwKVxuICovXG5hc3luYyBmdW5jdGlvbiBxdWV1ZVVwZGF0ZShwOiBQcm9taXNlPCgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZD4pIHtcbiAgcXVldWVkLnB1c2gocClcbiAgaWYgKCFwZW5kaW5nKSB7XG4gICAgcGVuZGluZyA9IHRydWVcbiAgICBhd2FpdCBQcm9taXNlLnJlc29sdmUoKVxuICAgIHBlbmRpbmcgPSBmYWxzZVxuICAgIGNvbnN0IGxvYWRpbmcgPSBbLi4ucXVldWVkXVxuICAgIHF1ZXVlZCA9IFtdXG4gICAgOyhhd2FpdCBQcm9taXNlLmFsbChsb2FkaW5nKSkuZm9yRWFjaCgoZm4pID0+IGZuICYmIGZuKCkpXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvclN1Y2Nlc3NmdWxQaW5nKG1zID0gMTAwMCkge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc3RhbnQtY29uZGl0aW9uXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBpbmdSZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2Jhc2V9X192aXRlX3BpbmdgKVxuXG4gICAgICAvLyBzdWNjZXNzIC0gMnh4IHN0YXR1cyBjb2RlXG4gICAgICBpZiAocGluZ1Jlc3BvbnNlLm9rKSBicmVha1xuICAgICAgLy8gZmFpbHVyZSAtIG5vbi0yeHggc3RhdHVzIGNvZGVcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yKClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyB3YWl0IG1zIGJlZm9yZSBhdHRlbXB0aW5nIHRvIHBpbmcgYWdhaW5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSlcbiAgICB9XG4gIH1cbn1cblxuLy8gcGluZyBzZXJ2ZXJcbnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGFzeW5jICh7IHdhc0NsZWFuIH0pID0+IHtcbiAgaWYgKHdhc0NsZWFuKSByZXR1cm5cbiAgY29uc29sZS5sb2coYFt2aXRlXSBzZXJ2ZXIgY29ubmVjdGlvbiBsb3N0LiBwb2xsaW5nIGZvciByZXN0YXJ0Li4uYClcbiAgYXdhaXQgd2FpdEZvclN1Y2Nlc3NmdWxQaW5nKClcbiAgbG9jYXRpb24ucmVsb2FkKClcbn0pXG5cbi8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzXG5jb25zdCBzdXBwb3J0c0NvbnN0cnVjdGVkU2hlZXQgPSAoKCkgPT4ge1xuICAvLyBUT0RPOiByZS1lbmFibGUgdGhpcyB0cnkgYmxvY2sgb25jZSBDaHJvbWUgZml4ZXMgdGhlIHBlcmZvcm1hbmNlIG9mXG4gIC8vIHJ1bGUgaW5zZXJ0aW9uIGluIHJlYWxseSBiaWcgc3R5bGVzaGVldHNcbiAgLy8gdHJ5IHtcbiAgLy8gICBuZXcgQ1NTU3R5bGVTaGVldCgpXG4gIC8vICAgcmV0dXJuIHRydWVcbiAgLy8gfSBjYXRjaCAoZSkge31cbiAgcmV0dXJuIGZhbHNlXG59KSgpXG5cbmNvbnN0IHNoZWV0c01hcCA9IG5ldyBNYXAoKVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU3R5bGUoaWQ6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogdm9pZCB7XG4gIGxldCBzdHlsZSA9IHNoZWV0c01hcC5nZXQoaWQpXG4gIGlmIChzdXBwb3J0c0NvbnN0cnVjdGVkU2hlZXQgJiYgIWNvbnRlbnQuaW5jbHVkZXMoJ0BpbXBvcnQnKSkge1xuICAgIGlmIChzdHlsZSAmJiAhKHN0eWxlIGluc3RhbmNlb2YgQ1NTU3R5bGVTaGVldCkpIHtcbiAgICAgIHJlbW92ZVN0eWxlKGlkKVxuICAgICAgc3R5bGUgPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBpZiAoIXN0eWxlKSB7XG4gICAgICBzdHlsZSA9IG5ldyBDU1NTdHlsZVNoZWV0KClcbiAgICAgIHN0eWxlLnJlcGxhY2VTeW5jKGNvbnRlbnQpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yOiB1c2luZyBleHBlcmltZW50YWwgQVBJXG4gICAgICBkb2N1bWVudC5hZG9wdGVkU3R5bGVTaGVldHMgPSBbLi4uZG9jdW1lbnQuYWRvcHRlZFN0eWxlU2hlZXRzLCBzdHlsZV1cbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUucmVwbGFjZVN5bmMoY29udGVudClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKHN0eWxlICYmICEoc3R5bGUgaW5zdGFuY2VvZiBIVE1MU3R5bGVFbGVtZW50KSkge1xuICAgICAgcmVtb3ZlU3R5bGUoaWQpXG4gICAgICBzdHlsZSA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIGlmICghc3R5bGUpIHtcbiAgICAgIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgICAgc3R5bGUuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJylcbiAgICAgIHN0eWxlLmlubmVySFRNTCA9IGNvbnRlbnRcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmlubmVySFRNTCA9IGNvbnRlbnRcbiAgICB9XG4gIH1cbiAgc2hlZXRzTWFwLnNldChpZCwgc3R5bGUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVTdHlsZShpZDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IHN0eWxlID0gc2hlZXRzTWFwLmdldChpZClcbiAgaWYgKHN0eWxlKSB7XG4gICAgaWYgKHN0eWxlIGluc3RhbmNlb2YgQ1NTU3R5bGVTaGVldCkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvcjogdXNpbmcgZXhwZXJpbWVudGFsIEFQSVxuICAgICAgZG9jdW1lbnQuYWRvcHRlZFN0eWxlU2hlZXRzID0gZG9jdW1lbnQuYWRvcHRlZFN0eWxlU2hlZXRzLmZpbHRlcihcbiAgICAgICAgKHM6IENTU1N0eWxlU2hlZXQpID0+IHMgIT09IHN0eWxlXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LmhlYWQucmVtb3ZlQ2hpbGQoc3R5bGUpXG4gICAgfVxuICAgIHNoZWV0c01hcC5kZWxldGUoaWQpXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hVcGRhdGUoeyBwYXRoLCBhY2NlcHRlZFBhdGgsIHRpbWVzdGFtcCB9OiBVcGRhdGUpIHtcbiAgY29uc3QgbW9kID0gaG90TW9kdWxlc01hcC5nZXQocGF0aClcbiAgaWYgKCFtb2QpIHtcbiAgICAvLyBJbiBhIGNvZGUtc3BsaXR0aW5nIHByb2plY3QsXG4gICAgLy8gaXQgaXMgY29tbW9uIHRoYXQgdGhlIGhvdC11cGRhdGluZyBtb2R1bGUgaXMgbm90IGxvYWRlZCB5ZXQuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZpdGVqcy92aXRlL2lzc3Vlcy83MjFcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IG1vZHVsZU1hcCA9IG5ldyBNYXAoKVxuICBjb25zdCBpc1NlbGZVcGRhdGUgPSBwYXRoID09PSBhY2NlcHRlZFBhdGhcblxuICAvLyBtYWtlIHN1cmUgd2Ugb25seSBpbXBvcnQgZWFjaCBkZXAgb25jZVxuICBjb25zdCBtb2R1bGVzVG9VcGRhdGUgPSBuZXcgU2V0PHN0cmluZz4oKVxuICBpZiAoaXNTZWxmVXBkYXRlKSB7XG4gICAgLy8gc2VsZiB1cGRhdGUgLSBvbmx5IHVwZGF0ZSBzZWxmXG4gICAgbW9kdWxlc1RvVXBkYXRlLmFkZChwYXRoKVxuICB9IGVsc2Uge1xuICAgIC8vIGRlcCB1cGRhdGVcbiAgICBmb3IgKGNvbnN0IHsgZGVwcyB9IG9mIG1vZC5jYWxsYmFja3MpIHtcbiAgICAgIGRlcHMuZm9yRWFjaCgoZGVwKSA9PiB7XG4gICAgICAgIGlmIChhY2NlcHRlZFBhdGggPT09IGRlcCkge1xuICAgICAgICAgIG1vZHVsZXNUb1VwZGF0ZS5hZGQoZGVwKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8vIGRldGVybWluZSB0aGUgcXVhbGlmaWVkIGNhbGxiYWNrcyBiZWZvcmUgd2UgcmUtaW1wb3J0IHRoZSBtb2R1bGVzXG4gIGNvbnN0IHF1YWxpZmllZENhbGxiYWNrcyA9IG1vZC5jYWxsYmFja3MuZmlsdGVyKCh7IGRlcHMgfSkgPT4ge1xuICAgIHJldHVybiBkZXBzLnNvbWUoKGRlcCkgPT4gbW9kdWxlc1RvVXBkYXRlLmhhcyhkZXApKVxuICB9KVxuXG4gIGF3YWl0IFByb21pc2UuYWxsKFxuICAgIEFycmF5LmZyb20obW9kdWxlc1RvVXBkYXRlKS5tYXAoYXN5bmMgKGRlcCkgPT4ge1xuICAgICAgY29uc3QgZGlzcG9zZXIgPSBkaXNwb3NlTWFwLmdldChkZXApXG4gICAgICBpZiAoZGlzcG9zZXIpIGF3YWl0IGRpc3Bvc2VyKGRhdGFNYXAuZ2V0KGRlcCkpXG4gICAgICBjb25zdCBbcGF0aCwgcXVlcnldID0gZGVwLnNwbGl0KGA/YClcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG5ld01vZCA9IGF3YWl0IGltcG9ydChcbiAgICAgICAgICAvKiBAdml0ZS1pZ25vcmUgKi9cbiAgICAgICAgICBiYXNlICtcbiAgICAgICAgICAgIHBhdGguc2xpY2UoMSkgK1xuICAgICAgICAgICAgYD9pbXBvcnQmdD0ke3RpbWVzdGFtcH0ke3F1ZXJ5ID8gYCYke3F1ZXJ5fWAgOiAnJ31gXG4gICAgICAgIClcbiAgICAgICAgbW9kdWxlTWFwLnNldChkZXAsIG5ld01vZClcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgd2FybkZhaWxlZEZldGNoKGUsIGRlcClcbiAgICAgIH1cbiAgICB9KVxuICApXG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICBmb3IgKGNvbnN0IHsgZGVwcywgZm4gfSBvZiBxdWFsaWZpZWRDYWxsYmFja3MpIHtcbiAgICAgIGZuKGRlcHMubWFwKChkZXApID0+IG1vZHVsZU1hcC5nZXQoZGVwKSkpXG4gICAgfVxuICAgIGNvbnN0IGxvZ2dlZFBhdGggPSBpc1NlbGZVcGRhdGUgPyBwYXRoIDogYCR7YWNjZXB0ZWRQYXRofSB2aWEgJHtwYXRofWBcbiAgICBjb25zb2xlLmxvZyhgW3ZpdGVdIGhvdCB1cGRhdGVkOiAke2xvZ2dlZFBhdGh9YClcbiAgfVxufVxuXG5mdW5jdGlvbiBzZW5kTWVzc2FnZUJ1ZmZlcigpIHtcbiAgaWYgKHNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XG4gICAgbWVzc2FnZUJ1ZmZlci5mb3JFYWNoKChtc2cpID0+IHNvY2tldC5zZW5kKG1zZykpXG4gICAgbWVzc2FnZUJ1ZmZlci5sZW5ndGggPSAwXG4gIH1cbn1cblxuaW50ZXJmYWNlIEhvdE1vZHVsZSB7XG4gIGlkOiBzdHJpbmdcbiAgY2FsbGJhY2tzOiBIb3RDYWxsYmFja1tdXG59XG5cbmludGVyZmFjZSBIb3RDYWxsYmFjayB7XG4gIC8vIHRoZSBkZXBlbmRlbmNpZXMgbXVzdCBiZSBmZXRjaGFibGUgcGF0aHNcbiAgZGVwczogc3RyaW5nW11cbiAgZm46IChtb2R1bGVzOiBvYmplY3RbXSkgPT4gdm9pZFxufVxuXG5jb25zdCBob3RNb2R1bGVzTWFwID0gbmV3IE1hcDxzdHJpbmcsIEhvdE1vZHVsZT4oKVxuY29uc3QgZGlzcG9zZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCAoZGF0YTogYW55KSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPj4oKVxuY29uc3QgcHJ1bmVNYXAgPSBuZXcgTWFwPHN0cmluZywgKGRhdGE6IGFueSkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD4+KClcbmNvbnN0IGRhdGFNYXAgPSBuZXcgTWFwPHN0cmluZywgYW55PigpXG5jb25zdCBjdXN0b21MaXN0ZW5lcnNNYXAgPSBuZXcgTWFwPHN0cmluZywgKChkYXRhOiBhbnkpID0+IHZvaWQpW10+KClcbmNvbnN0IGN0eFRvTGlzdGVuZXJzTWFwID0gbmV3IE1hcDxcbiAgc3RyaW5nLFxuICBNYXA8c3RyaW5nLCAoKGRhdGE6IGFueSkgPT4gdm9pZClbXT5cbj4oKVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSG90Q29udGV4dChvd25lclBhdGg6IHN0cmluZyk6IFZpdGVIb3RDb250ZXh0IHtcbiAgaWYgKCFkYXRhTWFwLmhhcyhvd25lclBhdGgpKSB7XG4gICAgZGF0YU1hcC5zZXQob3duZXJQYXRoLCB7fSlcbiAgfVxuXG4gIC8vIHdoZW4gYSBmaWxlIGlzIGhvdCB1cGRhdGVkLCBhIG5ldyBjb250ZXh0IGlzIGNyZWF0ZWRcbiAgLy8gY2xlYXIgaXRzIHN0YWxlIGNhbGxiYWNrc1xuICBjb25zdCBtb2QgPSBob3RNb2R1bGVzTWFwLmdldChvd25lclBhdGgpXG4gIGlmIChtb2QpIHtcbiAgICBtb2QuY2FsbGJhY2tzID0gW11cbiAgfVxuXG4gIC8vIGNsZWFyIHN0YWxlIGN1c3RvbSBldmVudCBsaXN0ZW5lcnNcbiAgY29uc3Qgc3RhbGVMaXN0ZW5lcnMgPSBjdHhUb0xpc3RlbmVyc01hcC5nZXQob3duZXJQYXRoKVxuICBpZiAoc3RhbGVMaXN0ZW5lcnMpIHtcbiAgICBmb3IgKGNvbnN0IFtldmVudCwgc3RhbGVGbnNdIG9mIHN0YWxlTGlzdGVuZXJzKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSBjdXN0b21MaXN0ZW5lcnNNYXAuZ2V0KGV2ZW50KVxuICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICBjdXN0b21MaXN0ZW5lcnNNYXAuc2V0KFxuICAgICAgICAgIGV2ZW50LFxuICAgICAgICAgIGxpc3RlbmVycy5maWx0ZXIoKGwpID0+ICFzdGFsZUZucy5pbmNsdWRlcyhsKSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG5ld0xpc3RlbmVycyA9IG5ldyBNYXAoKVxuICBjdHhUb0xpc3RlbmVyc01hcC5zZXQob3duZXJQYXRoLCBuZXdMaXN0ZW5lcnMpXG5cbiAgZnVuY3Rpb24gYWNjZXB0RGVwcyhkZXBzOiBzdHJpbmdbXSwgY2FsbGJhY2s6IEhvdENhbGxiYWNrWydmbiddID0gKCkgPT4ge30pIHtcbiAgICBjb25zdCBtb2Q6IEhvdE1vZHVsZSA9IGhvdE1vZHVsZXNNYXAuZ2V0KG93bmVyUGF0aCkgfHwge1xuICAgICAgaWQ6IG93bmVyUGF0aCxcbiAgICAgIGNhbGxiYWNrczogW11cbiAgICB9XG4gICAgbW9kLmNhbGxiYWNrcy5wdXNoKHtcbiAgICAgIGRlcHMsXG4gICAgICBmbjogY2FsbGJhY2tcbiAgICB9KVxuICAgIGhvdE1vZHVsZXNNYXAuc2V0KG93bmVyUGF0aCwgbW9kKVxuICB9XG5cbiAgY29uc3QgaG90OiBWaXRlSG90Q29udGV4dCA9IHtcbiAgICBnZXQgZGF0YSgpIHtcbiAgICAgIHJldHVybiBkYXRhTWFwLmdldChvd25lclBhdGgpXG4gICAgfSxcblxuICAgIGFjY2VwdChkZXBzPzogYW55LCBjYWxsYmFjaz86IGFueSkge1xuICAgICAgaWYgKHR5cGVvZiBkZXBzID09PSAnZnVuY3Rpb24nIHx8ICFkZXBzKSB7XG4gICAgICAgIC8vIHNlbGYtYWNjZXB0OiBob3QuYWNjZXB0KCgpID0+IHt9KVxuICAgICAgICBhY2NlcHREZXBzKFtvd25lclBhdGhdLCAoW21vZF0pID0+IGRlcHMgJiYgZGVwcyhtb2QpKVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGVwcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gZXhwbGljaXQgZGVwc1xuICAgICAgICBhY2NlcHREZXBzKFtkZXBzXSwgKFttb2RdKSA9PiBjYWxsYmFjayAmJiBjYWxsYmFjayhtb2QpKVxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRlcHMpKSB7XG4gICAgICAgIGFjY2VwdERlcHMoZGVwcywgY2FsbGJhY2spXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgaG90LmFjY2VwdCgpIHVzYWdlLmApXG4gICAgICB9XG4gICAgfSxcblxuICAgIGFjY2VwdERlcHMoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBob3QuYWNjZXB0RGVwcygpIGlzIGRlcHJlY2F0ZWQuIGAgK1xuICAgICAgICAgIGBVc2UgaG90LmFjY2VwdCgpIHdpdGggdGhlIHNhbWUgc2lnbmF0dXJlIGluc3RlYWQuYFxuICAgICAgKVxuICAgIH0sXG5cbiAgICBkaXNwb3NlKGNiKSB7XG4gICAgICBkaXNwb3NlTWFwLnNldChvd25lclBhdGgsIGNiKVxuICAgIH0sXG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHVudHlwZWRcbiAgICBwcnVuZShjYjogKGRhdGE6IGFueSkgPT4gdm9pZCkge1xuICAgICAgcHJ1bmVNYXAuc2V0KG93bmVyUGF0aCwgY2IpXG4gICAgfSxcblxuICAgIC8vIFRPRE9cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWZ1bmN0aW9uXG4gICAgZGVjbGluZSgpIHt9LFxuXG4gICAgaW52YWxpZGF0ZSgpIHtcbiAgICAgIC8vIFRPRE8gc2hvdWxkIHRlbGwgdGhlIHNlcnZlciB0byByZS1wZXJmb3JtIGhtciBwcm9wYWdhdGlvblxuICAgICAgLy8gZnJvbSB0aGlzIG1vZHVsZSBhcyByb290XG4gICAgICBsb2NhdGlvbi5yZWxvYWQoKVxuICAgIH0sXG5cbiAgICAvLyBjdXN0b20gZXZlbnRzXG4gICAgb24oZXZlbnQsIGNiKSB7XG4gICAgICBjb25zdCBhZGRUb01hcCA9IChtYXA6IE1hcDxzdHJpbmcsIGFueVtdPikgPT4ge1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IG1hcC5nZXQoZXZlbnQpIHx8IFtdXG4gICAgICAgIGV4aXN0aW5nLnB1c2goY2IpXG4gICAgICAgIG1hcC5zZXQoZXZlbnQsIGV4aXN0aW5nKVxuICAgICAgfVxuICAgICAgYWRkVG9NYXAoY3VzdG9tTGlzdGVuZXJzTWFwKVxuICAgICAgYWRkVG9NYXAobmV3TGlzdGVuZXJzKVxuICAgIH0sXG5cbiAgICBzZW5kKGV2ZW50LCBkYXRhKSB7XG4gICAgICBtZXNzYWdlQnVmZmVyLnB1c2goSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiAnY3VzdG9tJywgZXZlbnQsIGRhdGEgfSkpXG4gICAgICBzZW5kTWVzc2FnZUJ1ZmZlcigpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGhvdFxufVxuXG4vKipcbiAqIHVybHMgaGVyZSBhcmUgZHluYW1pYyBpbXBvcnQoKSB1cmxzIHRoYXQgY291bGRuJ3QgYmUgc3RhdGljYWxseSBhbmFseXplZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0UXVlcnkodXJsOiBzdHJpbmcsIHF1ZXJ5VG9JbmplY3Q6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIHNraXAgdXJscyB0aGF0IHdvbid0IGJlIGhhbmRsZWQgYnkgdml0ZVxuICBpZiAoIXVybC5zdGFydHNXaXRoKCcuJykgJiYgIXVybC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICByZXR1cm4gdXJsXG4gIH1cblxuICAvLyBjYW4ndCB1c2UgcGF0aG5hbWUgZnJvbSBVUkwgc2luY2UgaXQgbWF5IGJlIHJlbGF0aXZlIGxpa2UgLi4vXG4gIGNvbnN0IHBhdGhuYW1lID0gdXJsLnJlcGxhY2UoLyMuKiQvLCAnJykucmVwbGFjZSgvXFw/LiokLywgJycpXG4gIGNvbnN0IHsgc2VhcmNoLCBoYXNoIH0gPSBuZXcgVVJMKHVybCwgJ2h0dHA6Ly92aXRlanMuZGV2JylcblxuICByZXR1cm4gYCR7cGF0aG5hbWV9PyR7cXVlcnlUb0luamVjdH0ke3NlYXJjaCA/IGAmYCArIHNlYXJjaC5zbGljZSgxKSA6ICcnfSR7XG4gICAgaGFzaCB8fCAnJ1xuICB9YFxufVxuXG5leHBvcnQgeyBFcnJvck92ZXJsYXkgfVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsTUFBTSxRQUFRLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBOEd6QixDQUFBO0FBRUQsTUFBTSxNQUFNLEdBQUcsZ0NBQWdDLENBQUE7QUFDL0MsTUFBTSxXQUFXLEdBQUcsMENBQTBDLENBQUE7TUFFakQsWUFBYSxTQUFR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