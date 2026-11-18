// \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) {
		__defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	}
	if (!no_symbols) {
		__defProp(target, Symbol.toStringTag, { value: "Module" });
	}
	return target;
};

// src/environment.ts
var hasDOM;
function init_environment() {
	return (init_environment = __esmMin((() => {
		hasDOM = typeof window !== "undefined" && typeof document !== "undefined";
	})))();
}

// src/nanoid.ts
function nanoid(size = 21) {
	const source = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" ? crypto : null;
	if (source) {
		const bytes = new Uint8Array(size);
		source.getRandomValues(bytes);
		let id = "";
		for (let i = 0; i < size; i++) id += urlAlphabet[bytes[i] & 63];
		return id;
	}
	let id = "";
	let i = size | 0;
	while (i--) id += urlAlphabet[Math.random() * 64 | 0];
	return id;
}
var urlAlphabet;
function init_nanoid() {
	return (init_nanoid = __esmMin((() => {
		urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
function init_typeof() {
	return (init_typeof = __esmMin((() => {})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
function init_toPrimitive() {
	return (init_toPrimitive = __esmMin((() => {
		/* @__PURE__ */ init_typeof();
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}
function init_toPropertyKey() {
	return (init_toPropertyKey = __esmMin((() => {
		/* @__PURE__ */ init_typeof();
		init_toPrimitive();
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}
function init_defineProperty() {
	return (init_defineProperty = __esmMin((() => {
		init_toPropertyKey();
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/objectSpread2.js
function ownKeys(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r) {
			return Object.getOwnPropertyDescriptor(e, r).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread2(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
			_defineProperty(e, r, t[r]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
			Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
		});
	}
	return e;
}
function init_objectSpread2() {
	return (init_objectSpread2 = __esmMin((() => {
		init_defineProperty();
	})))();
}

// src/runtime.ts
function runtimeURL() {
	return window.location.origin + "/wails/runtime";
}
function setTransport(transport) {
	customTransport = transport;
}
function getTransport() {
	return customTransport;
}
function newRuntimeCaller(object, windowName = "") {
	return function(method, args = null) {
		return runtimeCallWithID(object, method, windowName, args);
	};
}
async function runtimeCallWithID(objectID, method, windowName, args) {
	var _response$headers$get, _response$headers$get2;
	if (customTransport) return customTransport.call(objectID, method, windowName, args);
	let url = new URL(runtimeURL());
	let body = {
		object: objectID,
		method
	};
	if (args !== null && args !== void 0) body.args = args;
	let headers = {
		["x-wails-client-id"]: clientId,
		["Content-Type"]: "application/json"
	};
	if (windowName) headers["x-wails-window-name"] = windowName;
	const bodyStr = JSON.stringify(body);
	let response;
	if (bodyStr.length > CHUNK_THRESHOLD$1) response = await sendChunked(url, headers, bodyStr);
	else response = await fetch(url, {
		method: "POST",
		headers,
		body: bodyStr
	});
	if (!response.ok) {
		const ct = response.headers.get("Content-Type");
		if (ct === null || ct === void 0 ? void 0 : ct.includes("application/json")) {
			const json = await response.json();
			let err;
			switch (json.kind) {
				case "ReferenceError":
					err = new ReferenceError(json.message);
					break;
				case "TypeError":
					err = new TypeError(json.message);
					break;
				case "RuntimeError":
					err = new RuntimeError(json.message);
					break;
				default: err = new Error(json.message);
			}
			err.cause = json.cause;
			throw err;
		}
		throw new Error(await response.text());
	}
	if (((_response$headers$get = (_response$headers$get2 = response.headers.get("Content-Type")) === null || _response$headers$get2 === void 0 ? void 0 : _response$headers$get2.indexOf("application/json")) !== null && _response$headers$get !== void 0 ? _response$headers$get : -1) !== -1) return response.json();
	else return response.text();
}
async function sendChunked(url, headers, bodyStr) {
	const chunkId = nanoid();
	const bodyBytes = new TextEncoder().encode(bodyStr);
	const totalChunks = Math.ceil(bodyBytes.length / CHUNK_THRESHOLD$1);
	for (let i = 0; i < totalChunks - 1; i++) {
		const chunk = bodyBytes.subarray(i * CHUNK_THRESHOLD$1, (i + 1) * CHUNK_THRESHOLD$1);
		const resp = await fetch(url, {
			method: "POST",
			headers: _objectSpread2(_objectSpread2({}, headers), {}, {
				"x-wails-chunk-id": chunkId,
				"x-wails-chunk-index": String(i),
				"x-wails-chunk-total": String(totalChunks)
			}),
			body: chunk
		});
		if (!resp.ok) throw new Error(await resp.text());
	}
	return fetch(url, {
		method: "POST",
		headers: _objectSpread2(_objectSpread2({}, headers), {}, {
			"x-wails-chunk-id": chunkId,
			"x-wails-chunk-index": String(totalChunks - 1),
			"x-wails-chunk-total": String(totalChunks)
		}),
		body: bodyBytes.subarray((totalChunks - 1) * CHUNK_THRESHOLD$1)
	});
}
var _window$wails, CHUNK_THRESHOLD$1, RuntimeError, objectNames, clientId, customTransport, androidBridge;
function init_runtime() {
	return (init_runtime = __esmMin((() => {
		init_nanoid();
		init_environment();
		init_objectSpread2();
		;
		CHUNK_THRESHOLD$1 = 524288;
		RuntimeError = class extends Error {
			constructor(message, options) {
				super(message, options);
				this.name = "RuntimeError";
			}
		};
		objectNames = Object.freeze({
			Call: 0,
			Clipboard: 1,
			Application: 2,
			Events: 3,
			ContextMenu: 4,
			Dialog: 5,
			Window: 6,
			Screens: 7,
			System: 8,
			Browser: 9,
			CancelCall: 10,
			IOS: 11,
			Android: 12
		});
		clientId = nanoid();
		customTransport = null;
		androidBridge = hasDOM && typeof ((_window$wails = window.wails) === null || _window$wails === void 0 ? void 0 : _window$wails.invokeAsync) === "function" ? window.wails : null;
		if (androidBridge) {
			const pending = /* @__PURE__ */ new Map();
			window._wailsAndroidCallback = (id, response, error) => {
				const promise = pending.get(id);
				if (!promise) return;
				pending.delete(id);
				if (error) {
					promise.reject(new Error(error));
					return;
				}
				try {
					const envelope = JSON.parse(response !== null && response !== void 0 ? response : "{}");
					if (!envelope.ok) {
						var _envelope$error;
						promise.reject(new Error((_envelope$error = envelope.error) !== null && _envelope$error !== void 0 ? _envelope$error : "unknown runtime call error"));
						return;
					}
					promise.resolve("text" in envelope ? envelope.text : envelope.data);
				} catch (e) {
					promise.reject(e);
				}
			};
			customTransport = { call(objectID, method, windowName, args) {
				return new Promise((resolve, reject) => {
					const id = nanoid();
					pending.set(id, {
						resolve,
						reject
					});
					try {
						androidBridge.invokeAsync(id, JSON.stringify({
							object: objectID,
							method,
							windowName,
							args: args !== null && args !== void 0 ? args : null,
							clientId
						}));
					} catch (e) {
						pending.delete(id);
						reject(e);
					}
				});
			} };
		}
	})))();
}

// src/system.ts
var system_exports = /* @__PURE__ */ __exportAll({
	Capabilities: () => Capabilities,
	Environment: () => Environment,
	IsAMD64: () => IsAMD64,
	IsARM: () => IsARM,
	IsARM64: () => IsARM64,
	IsAndroid: () => IsAndroid,
	IsDarkMode: () => IsDarkMode,
	IsDebug: () => IsDebug,
	IsDesktop: () => IsDesktop,
	IsIOS: () => IsIOS,
	IsLinux: () => IsLinux,
	IsMac: () => IsMac,
	IsMobile: () => IsMobile,
	IsWindows: () => IsWindows,
	invoke: () => invoke
});
function invoke(msg) {
	_invoke === null || _invoke === void 0 || _invoke(msg);
}
function IsDarkMode() {
	return call$10(SystemIsDarkMode);
}
async function Capabilities() {
	return call$10(SystemCapabilities);
}
function Environment() {
	return call$10(SystemEnvironment);
}
function IsWindows() {
	var _window$_wails;
	return ((_window$_wails = window._wails) === null || _window$_wails === void 0 || (_window$_wails = _window$_wails.environment) === null || _window$_wails === void 0 ? void 0 : _window$_wails.OS) === "windows";
}
function IsLinux() {
	var _window$_wails2;
	return ((_window$_wails2 = window._wails) === null || _window$_wails2 === void 0 || (_window$_wails2 = _window$_wails2.environment) === null || _window$_wails2 === void 0 ? void 0 : _window$_wails2.OS) === "linux";
}
function IsMac() {
	var _window$_wails3;
	return ((_window$_wails3 = window._wails) === null || _window$_wails3 === void 0 || (_window$_wails3 = _window$_wails3.environment) === null || _window$_wails3 === void 0 ? void 0 : _window$_wails3.OS) === "darwin";
}
function IsIOS() {
	var _window$_wails4;
	return ((_window$_wails4 = window._wails) === null || _window$_wails4 === void 0 || (_window$_wails4 = _window$_wails4.environment) === null || _window$_wails4 === void 0 ? void 0 : _window$_wails4.OS) === "ios";
}
function IsAndroid() {
	var _window$_wails5;
	return ((_window$_wails5 = window._wails) === null || _window$_wails5 === void 0 || (_window$_wails5 = _window$_wails5.environment) === null || _window$_wails5 === void 0 ? void 0 : _window$_wails5.OS) === "android";
}
function IsMobile() {
	return IsIOS() || IsAndroid();
}
function IsDesktop() {
	return IsMac() || IsWindows() || IsLinux();
}
function IsAMD64() {
	var _window$_wails6;
	return ((_window$_wails6 = window._wails) === null || _window$_wails6 === void 0 || (_window$_wails6 = _window$_wails6.environment) === null || _window$_wails6 === void 0 ? void 0 : _window$_wails6.Arch) === "amd64";
}
function IsARM() {
	var _window$_wails7;
	return ((_window$_wails7 = window._wails) === null || _window$_wails7 === void 0 || (_window$_wails7 = _window$_wails7.environment) === null || _window$_wails7 === void 0 ? void 0 : _window$_wails7.Arch) === "arm";
}
function IsARM64() {
	var _window$_wails8;
	return ((_window$_wails8 = window._wails) === null || _window$_wails8 === void 0 || (_window$_wails8 = _window$_wails8.environment) === null || _window$_wails8 === void 0 ? void 0 : _window$_wails8.Arch) === "arm64";
}
function IsDebug() {
	var _window$_wails9;
	return Boolean((_window$_wails9 = window._wails) === null || _window$_wails9 === void 0 || (_window$_wails9 = _window$_wails9.environment) === null || _window$_wails9 === void 0 ? void 0 : _window$_wails9.Debug);
}
var call$10, SystemIsDarkMode, SystemEnvironment, SystemCapabilities, _invoke;
function init_system() {
	return (init_system = __esmMin((() => {
		init_runtime();
		call$10 = newRuntimeCaller(objectNames.System);
		SystemIsDarkMode = 0;
		SystemEnvironment = 1;
		SystemCapabilities = 2;
		_invoke = (function() {
			try {
				var _window$chrome, _window$webkit, _window$wails;
				if ((_window$chrome = window.chrome) === null || _window$chrome === void 0 || (_window$chrome = _window$chrome.webview) === null || _window$chrome === void 0 ? void 0 : _window$chrome.postMessage) return window.chrome.webview.postMessage.bind(window.chrome.webview);
				else if ((_window$webkit = window.webkit) === null || _window$webkit === void 0 || (_window$webkit = _window$webkit.messageHandlers) === null || _window$webkit === void 0 || (_window$webkit = _window$webkit["external"]) === null || _window$webkit === void 0 ? void 0 : _window$webkit.postMessage) return window.webkit.messageHandlers["external"].postMessage.bind(window.webkit.messageHandlers["external"]);
				else if ((_window$wails = window.wails) === null || _window$wails === void 0 ? void 0 : _window$wails.invoke) {
					const bridge = window.wails;
					return (msg) => bridge.invoke(typeof msg === "string" ? msg : JSON.stringify(msg));
				}
			} catch (e) {}
			console.warn("\n%c⚠️ Browser Environment Detected %c\n\n%cOnly UI previews are available in the browser. For full functionality, please run the application in desktop mode.\nMore information at: https://v3.wails.io/learn/build/#using-a-browser-for-development\n", "background: #ffffff; color: #000000; font-weight: bold; padding: 4px 8px; border-radius: 4px; border: 2px solid #000000;", "background: transparent;", "color: #ffffff; font-style: italic; font-weight: bold;");
			return null;
		})();
	})))();
}

// src/utils.ts
function debugLog(message) {
	console.log("%c wails3 %c " + message + " ", "background: #aa0000; color: #fff; border-radius: 3px 0px 0px 3px; padding: 1px; font-size: 0.7rem", "background: #009900; color: #fff; border-radius: 0px 3px 3px 0px; padding: 1px; font-size: 0.7rem");
}
function canTrackButtons() {
	return new MouseEvent("mousedown").buttons === 0;
}
function canAbortListeners() {
	if (!EventTarget || !AbortSignal || !AbortController) return false;
	let result = true;
	const target = new EventTarget();
	const controller = new AbortController();
	target.addEventListener("test", () => {
		result = false;
	}, { signal: controller.signal });
	controller.abort();
	target.dispatchEvent(new CustomEvent("test"));
	return result;
}
function eventTarget(event) {
	if (event.target instanceof HTMLElement) return event.target;
	else if (!(event.target instanceof HTMLElement) && event.target instanceof Node) {
		var _event$target$parentE;
		return (_event$target$parentE = event.target.parentElement) !== null && _event$target$parentE !== void 0 ? _event$target$parentE : document.body;
	} else return document.body;
}
function whenReady(callback) {
	if (isReady || document.readyState === "complete") callback();
	else document.addEventListener("DOMContentLoaded", callback);
}
var isReady;
function init_utils() {
	return (init_utils = __esmMin((() => {
		init_environment();
		isReady = false;
		if (hasDOM) document.addEventListener("DOMContentLoaded", () => {
			isReady = true;
		});
	})))();
}

// src/contextmenu.ts
function openContextMenu(id, x, y, data) {
	call$9(ContextMenuOpen, {
		id,
		x,
		y,
		data
	});
}
function contextMenuHandler(event) {
	const target = eventTarget(event);
	const customContextMenu = window.getComputedStyle(target).getPropertyValue("--custom-contextmenu").trim();
	if (customContextMenu) {
		event.preventDefault();
		const data = window.getComputedStyle(target).getPropertyValue("--custom-contextmenu-data");
		openContextMenu(customContextMenu, event.clientX, event.clientY, data);
	} else processDefaultContextMenu(event, target);
}
function processDefaultContextMenu(event, target) {
	if (IsDebug()) return;
	switch (window.getComputedStyle(target).getPropertyValue("--default-contextmenu").trim()) {
		case "show": return;
		case "hide":
			event.preventDefault();
			return;
	}
	if (target.isContentEditable) return;
	const selection = window.getSelection();
	const hasSelection = selection && selection.toString().length > 0;
	if (hasSelection) for (let i = 0; i < selection.rangeCount; i++) {
		const rects = selection.getRangeAt(i).getClientRects();
		for (let j = 0; j < rects.length; j++) {
			const rect = rects[j];
			if (document.elementFromPoint(rect.left, rect.top) === target) return;
		}
	}
	if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
		if (hasSelection || !target.readOnly && !target.disabled) return;
	}
	event.preventDefault();
}
var call$9, ContextMenuOpen;
function init_contextmenu() {
	return (init_contextmenu = __esmMin((() => {
		init_runtime();
		init_system();
		init_utils();
		init_environment();
		if (hasDOM) window.addEventListener("contextmenu", contextMenuHandler);
		call$9 = newRuntimeCaller(objectNames.ContextMenu);
		ContextMenuOpen = 0;
	})))();
}

// src/flags.ts
var flags_exports = /* @__PURE__ */ __exportAll({ GetFlag: () => GetFlag });
function GetFlag(key) {
	try {
		return window._wails.flags[key];
	} catch (e) {
		throw new Error("Unable to retrieve flag '" + key + "': " + e, { cause: e });
	}
}
function init_flags() {
	return (init_flags = __esmMin((() => {})))();
}

// src/drag.ts
function isMobile() {
	var _window$_wails;
	const os = (_window$_wails = window._wails) === null || _window$_wails === void 0 || (_window$_wails = _window$_wails.environment) === null || _window$_wails === void 0 ? void 0 : _window$_wails.OS;
	if (os === "ios" || os === "android") return true;
	const ua = navigator.userAgent || navigator.vendor || window.opera || "";
	return /android|iphone|ipad|ipod|iemobile|wpdesktop/i.test(ua);
}
function tryInitDragHandlers() {
	if (dragInitDone) return;
	if (isMobile()) return;
	window.addEventListener("mousedown", update, { capture: true });
	window.addEventListener("mousemove", update, { capture: true });
	window.addEventListener("mouseup", update, { capture: true });
	for (const ev of [
		"click",
		"contextmenu",
		"dblclick"
	]) window.addEventListener(ev, suppressEvent, { capture: true });
	dragInitDone = true;
}
function suppressEvent(event) {
	if (event.type === "dblclick" && IsMac() && window === window.top && isDraggableEvent(event)) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
		invoke("wails:drag:doubleclick");
		return;
	}
	if (dragging || resizing) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
	}
}
function isDraggableEvent(event) {
	const target = eventTarget(event);
	return window.getComputedStyle(target).getPropertyValue("--wails-draggable").trim() === "drag" && event.offsetX >= 0 && event.offsetX < target.clientWidth && event.offsetY >= 0 && event.offsetY < target.clientHeight;
}
function update(event) {
	let eventType, eventButtons = event.buttons;
	switch (event.type) {
		case "mousedown":
			eventType = MouseDown;
			if (!buttonsTracked) eventButtons = buttons | 1 << event.button;
			break;
		case "mouseup":
			eventType = MouseUp;
			if (!buttonsTracked) eventButtons = buttons & ~(1 << event.button);
			break;
		default:
			eventType = MouseMove;
			if (!buttonsTracked) eventButtons = buttons;
	}
	let released = buttons & ~eventButtons;
	let pressed = eventButtons & ~buttons;
	buttons = eventButtons;
	if (eventType === MouseDown && !(pressed & event.button)) {
		released |= 1 << event.button;
		pressed |= 1 << event.button;
	}
	if (eventType !== MouseMove && resizing || dragging && (eventType === MouseDown || event.button !== 0)) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
	}
	if (released & 1) primaryUp(event);
	if (pressed & 1) primaryDown(event);
	if (eventType === MouseMove) onMouseMove(event);
}
function primaryDown(event) {
	canDrag = false;
	canResize = false;
	if (!IsWindows()) {
		if (event.type === "mousedown" && event.button === 0 && event.detail !== 1) return;
	}
	if (resizeEdge) {
		if (event.type !== "mousedown") return;
		canResize = true;
		return;
	}
	canDrag = isDraggableEvent(event);
}
function primaryUp(event) {
	canDrag = false;
	dragging = false;
	canResize = false;
	resizing = false;
}
function setResize(edge) {
	if (edge) {
		if (!resizeEdge) defaultCursor = document.body.style.cursor;
		document.body.style.cursor = cursorForEdge[edge];
	} else if (!edge && resizeEdge) document.body.style.cursor = defaultCursor;
	resizeEdge = edge || "";
}
function onMouseMove(event) {
	if (canResize && resizeEdge) {
		resizing = true;
		invoke("wails:resize:" + resizeEdge);
	} else if (canDrag) {
		dragging = true;
		invoke("wails:drag");
	}
	if (dragging || resizing) {
		canDrag = canResize = false;
		return;
	}
	if (!resizable || !IsWindows() && !(IsLinux() && GetFlag("frameless"))) {
		if (resizeEdge) setResize();
		return;
	}
	const resizeHandleHeight = GetFlag("system.resizeHandleHeight") || 5;
	const resizeHandleWidth = GetFlag("system.resizeHandleWidth") || 5;
	const cornerExtra = GetFlag("resizeCornerExtra") || 10;
	const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
	const scrollbarHeight = Math.max(0, window.innerHeight - document.documentElement.clientHeight);
	const rightContentEdge = window.innerWidth - scrollbarWidth;
	const bottomContentEdge = window.innerHeight - scrollbarHeight;
	const rightBorder = event.clientX < rightContentEdge && rightContentEdge - event.clientX < resizeHandleWidth;
	const leftBorder = event.clientX < resizeHandleWidth;
	const topBorder = event.clientY < resizeHandleHeight;
	const bottomBorder = event.clientY < bottomContentEdge && bottomContentEdge - event.clientY < resizeHandleHeight;
	const rightCorner = event.clientX < rightContentEdge && rightContentEdge - event.clientX < resizeHandleWidth + cornerExtra;
	const leftCorner = event.clientX < resizeHandleWidth + cornerExtra;
	const topCorner = event.clientY < resizeHandleHeight + cornerExtra;
	const bottomCorner = event.clientY < bottomContentEdge && bottomContentEdge - event.clientY < resizeHandleHeight + cornerExtra;
	if (!leftCorner && !topCorner && !bottomCorner && !rightCorner) setResize();
	else if (rightCorner && bottomCorner) setResize("se-resize");
	else if (leftCorner && bottomCorner) setResize("sw-resize");
	else if (leftCorner && topCorner) setResize("nw-resize");
	else if (topCorner && rightCorner) setResize("ne-resize");
	else if (leftBorder) setResize("w-resize");
	else if (topBorder) setResize("n-resize");
	else if (bottomBorder) setResize("s-resize");
	else if (rightBorder) setResize("e-resize");
	else setResize();
}
var canDrag, dragging, resizable, canResize, resizing, resizeEdge, defaultCursor, buttons, buttonsTracked, dragInitDone, MouseDown, MouseUp, MouseMove, cursorForEdge;
function init_drag() {
	return (init_drag = __esmMin((() => {
		init_system();
		/* @__PURE__ */ init_flags();
		init_utils();
		init_environment();
		canDrag = false;
		dragging = false;
		resizable = false;
		canResize = false;
		resizing = false;
		resizeEdge = "";
		defaultCursor = "auto";
		buttons = 0;
		buttonsTracked = false;
		if (hasDOM) {
			buttonsTracked = canTrackButtons();
			window._wails = window._wails || {};
			window._wails.setResizable = (value) => {
				resizable = value;
				if (!resizable) {
					canResize = resizing = false;
					setResize();
				}
			};
		}
		dragInitDone = false;
		if (hasDOM) {
			tryInitDragHandlers();
			document.addEventListener("DOMContentLoaded", tryInitDragHandlers, { once: true });
			let dragEnvPolls = 0;
			const dragEnvPoll = window.setInterval(() => {
				if (dragInitDone) {
					window.clearInterval(dragEnvPoll);
					return;
				}
				tryInitDragHandlers();
				if (++dragEnvPolls > 100) window.clearInterval(dragEnvPoll);
			}, 50);
		}
		MouseDown = 0;
		MouseUp = 1;
		MouseMove = 2;
		cursorForEdge = Object.freeze({
			"se-resize": "nwse-resize",
			"sw-resize": "nesw-resize",
			"nw-resize": "nwse-resize",
			"ne-resize": "nesw-resize",
			"w-resize": "ew-resize",
			"n-resize": "ns-resize",
			"s-resize": "ns-resize",
			"e-resize": "ew-resize"
		});
	})))();
}

// src/appregion.ts
function normaliseRegionKind(value) {
	const region = value.trim().toLowerCase();
	if (validRegions.has(region)) return region;
}
function nonClientRegionForElement(element) {
	if (!(element instanceof HTMLElement)) return;
	const region = normaliseRegionKind(window.getComputedStyle(element).getPropertyValue(regionProperty));
	if (!region) return;
	const parent = element.parentElement;
	if (parent) {
		if (normaliseRegionKind(window.getComputedStyle(parent).getPropertyValue(regionProperty)) === region) return;
	}
	return region;
}
function isVisible(element) {
	const style = window.getComputedStyle(element);
	return style.display !== "none" && style.visibility !== "hidden" && style.contentVisibility !== "hidden";
}
function elementRegion(element) {
	if (!(element instanceof HTMLElement)) return;
	const kind = nonClientRegionForElement(element);
	if (!kind || !isVisible(element)) return;
	const rect = element.getBoundingClientRect();
	if (rect.width <= 0 || rect.height <= 0) return;
	const scale = window.devicePixelRatio || 1;
	const left = Math.floor(rect.left * scale);
	const top = Math.floor(rect.top * scale);
	const right = Math.ceil(rect.right * scale);
	const bottom = Math.ceil(rect.bottom * scale);
	if (right <= left || bottom <= top) return;
	return {
		kind,
		left,
		top,
		right,
		bottom
	};
}
function regionElements() {
	const elements = [];
	if (document.documentElement) elements.push(document.documentElement);
	if (document.body) {
		elements.push(document.body);
		for (const element of document.body.querySelectorAll("*")) elements.push(element);
	}
	return elements;
}
function observeRegionElements(elements) {
	var _resizeObserver;
	if (typeof ResizeObserver === "undefined") return;
	(_resizeObserver = resizeObserver) !== null && _resizeObserver !== void 0 || (resizeObserver = new ResizeObserver(scheduleUpdate));
	const nextElements = new Set(elements);
	for (const element of observedElements) if (!nextElements.has(element)) resizeObserver.unobserve(element);
	for (const element of nextElements) if (!observedElements.has(element)) resizeObserver.observe(element);
	observedElements = nextElements;
}
function updateNonClientRegions() {
	updatePending = false;
	const elements = regionElements();
	const regions = [];
	const activeElements = [];
	for (const element of elements) {
		const region = elementRegion(element);
		if (region) {
			regions.push(region);
			activeElements.push(element);
		}
	}
	observeRegionElements(activeElements);
	const payload = JSON.stringify({
		version: 1,
		regions
	});
	if (payload === lastPayload) return;
	lastPayload = payload;
	invoke("wails:non-client-region:" + payload);
}
function scheduleUpdate() {
	if (updatePending) return;
	updatePending = true;
	window.requestAnimationFrame(updateNonClientRegions);
}
function startNonClientRegionTracking() {
	var _window$visualViewpor, _window$visualViewpor2;
	if (trackingStarted) return;
	trackingStarted = true;
	scheduleUpdate();
	new MutationObserver(scheduleUpdate).observe(document.documentElement, {
		attributes: true,
		childList: true,
		subtree: true
	});
	window.addEventListener("resize", scheduleUpdate);
	window.addEventListener("scroll", scheduleUpdate, true);
	(_window$visualViewpor = window.visualViewport) === null || _window$visualViewpor === void 0 || _window$visualViewpor.addEventListener("resize", scheduleUpdate);
	(_window$visualViewpor2 = window.visualViewport) === null || _window$visualViewpor2 === void 0 || _window$visualViewpor2.addEventListener("scroll", scheduleUpdate);
}
function tryStartNonClientRegionTracking() {
	var _window$_wails$enviro, _window$_wails$flags;
	const os = (_window$_wails$enviro = window._wails.environment) === null || _window$_wails$enviro === void 0 ? void 0 : _window$_wails$enviro.OS;
	if (os === void 0) return false;
	const enabled = (_window$_wails$flags = window._wails.flags) === null || _window$_wails$flags === void 0 ? void 0 : _window$_wails$flags.nonClientRegionTracking;
	if (os === "windows") {
		if (enabled === true) whenReady(startNonClientRegionTracking);
		return true;
	}
	return true;
}
var regionProperty, runtimeConfigReadyEvent, validRegions, updatePending, lastPayload, observedElements, resizeObserver, trackingStarted;
function init_appregion() {
	return (init_appregion = __esmMin((() => {
		init_system();
		init_utils();
		init_environment();
		regionProperty = "--wails-non-client-region";
		runtimeConfigReadyEvent = "wails:runtime-config-ready";
		validRegions = /* @__PURE__ */ new Set([
			"caption",
			"minimize",
			"maximize",
			"close"
		]);
		if (hasDOM) window._wails = window._wails || {};
		updatePending = false;
		lastPayload = "";
		observedElements = /* @__PURE__ */ new Set();
		;
		trackingStarted = false;
		if (hasDOM && !tryStartNonClientRegionTracking()) window.addEventListener(runtimeConfigReadyEvent, tryStartNonClientRegionTracking, { once: true });
	})))();
}

// src/application.ts
var application_exports = /* @__PURE__ */ __exportAll({
	Hide: () => Hide,
	Quit: () => Quit,
	Show: () => Show
});
function Hide() {
	return call$8(HideMethod$1);
}
function Show() {
	return call$8(ShowMethod$1);
}
function Quit() {
	return call$8(QuitMethod);
}
var call$8, HideMethod$1, ShowMethod$1, QuitMethod;
function init_application() {
	return (init_application = __esmMin((() => {
		init_runtime();
		call$8 = newRuntimeCaller(objectNames.Application);
		HideMethod$1 = 0;
		ShowMethod$1 = 1;
		QuitMethod = 2;
	})))();
}

// src/browser.ts
var browser_exports = /* @__PURE__ */ __exportAll({ OpenURL: () => OpenURL });
function OpenURL(url) {
	return call$7(BrowserOpenURL, { url: url.toString() });
}
var call$7, BrowserOpenURL;
function init_browser() {
	return (init_browser = __esmMin((() => {
		init_runtime();
		call$7 = newRuntimeCaller(objectNames.Browser);
		BrowserOpenURL = 0;
	})))();
}

// src/callable.ts
function isCallableRefApply(value) {
	if (isDDA(value)) return true;
	if (!value) return false;
	if (typeof value !== "function" && typeof value !== "object") return false;
	try {
		reflectApply(value, null, badArrayLike);
	} catch (e) {
		if (e !== isCallableMarker) return false;
	}
	return !isES6ClassFn(value) && tryFunctionObject(value);
}
function isCallableNoRefApply(value) {
	if (isDDA(value)) return true;
	if (!value) return false;
	if (typeof value !== "function" && typeof value !== "object") return false;
	if (hasToStringTag) return tryFunctionObject(value);
	if (isES6ClassFn(value)) return false;
	var strClass = toStr.call(value);
	if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) return false;
	return tryFunctionObject(value);
}
var fnToStr, reflectApply, badArrayLike, isCallableMarker, constructorRegex, isES6ClassFn, tryFunctionObject, toStr, objectClass, fnClass, genClass, ddaClass, ddaClass2, ddaClass3, hasToStringTag, isIE68, isDDA, all, callable_default;
function init_callable() {
	return (init_callable = __esmMin((() => {
		fnToStr = Function.prototype.toString;
		reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
		;
		;
		if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") try {
			badArrayLike = Object.defineProperty({}, "length", { get: function() {
				throw isCallableMarker;
			} });
			isCallableMarker = {};
			reflectApply(function() {
				throw 42;
			}, null, badArrayLike);
		} catch (_) {
			if (_ !== isCallableMarker) reflectApply = null;
		}
		else reflectApply = null;
		constructorRegex = /^\s*class\b/;
		isES6ClassFn = function isES6ClassFunction(value) {
			try {
				var fnStr = fnToStr.call(value);
				return constructorRegex.test(fnStr);
			} catch (e) {
				return false;
			}
		};
		tryFunctionObject = function tryFunctionToStr(value) {
			try {
				if (isES6ClassFn(value)) return false;
				fnToStr.call(value);
				return true;
			} catch (e) {
				return false;
			}
		};
		toStr = Object.prototype.toString;
		objectClass = "[object Object]";
		fnClass = "[object Function]";
		genClass = "[object GeneratorFunction]";
		ddaClass = "[object HTMLAllCollection]";
		ddaClass2 = "[object HTML document.all class]";
		ddaClass3 = "[object HTMLCollection]";
		hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
		isIE68 = !(0 in [,]);
		isDDA = function isDocumentDotAll() {
			return false;
		};
		if (typeof document === "object") {
			all = document.all;
			if (toStr.call(all) === toStr.call(document.all)) isDDA = function isDocumentDotAll(value) {
				if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) try {
					var str = toStr.call(value);
					return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
				} catch (e) {}
				return false;
			};
		}
		callable_default = reflectApply ? isCallableRefApply : isCallableNoRefApply;
	})))();
}

// src/cancellable.ts
function cancellerFor(promise, state) {
	let cancellationPromise = void 0;
	return (reason) => {
		if (!state.settled) {
			state.settled = true;
			state.reason = reason;
			promise.reject(reason);
			Promise.prototype.then.call(promise.promise, void 0, (err) => {
				if (err !== reason) throw err;
			});
		}
		if (!state.reason || !promise.oncancelled) return;
		cancellationPromise = new Promise((resolve) => {
			try {
				resolve(promise.oncancelled(state.reason.cause));
			} catch (err) {
				Promise.reject(new CancelledRejectionError(promise.promise, err, "Unhandled exception in oncancelled callback."));
			}
		}).catch((reason) => {
			Promise.reject(new CancelledRejectionError(promise.promise, reason, "Unhandled rejection in oncancelled callback."));
		});
		promise.oncancelled = null;
		return cancellationPromise;
	};
}
function resolverFor(promise, state) {
	return (value) => {
		if (state.resolving) return;
		state.resolving = true;
		if (value === promise.promise) {
			if (state.settled) return;
			state.settled = true;
			promise.reject(/* @__PURE__ */ new TypeError("A promise cannot be resolved with itself."));
			return;
		}
		if (value != null && (typeof value === "object" || typeof value === "function")) {
			let then;
			try {
				then = value.then;
			} catch (err) {
				state.settled = true;
				promise.reject(err);
				return;
			}
			if (callable_default(then)) {
				try {
					let cancel = value.cancel;
					if (callable_default(cancel)) {
						const oncancelled = (cause) => {
							Reflect.apply(cancel, value, [cause]);
						};
						if (state.reason) cancellerFor(_objectSpread2(_objectSpread2({}, promise), {}, { oncancelled }), state)(state.reason);
						else promise.oncancelled = oncancelled;
					}
				} catch (_unused) {}
				const newState = {
					root: state.root,
					resolving: false,
					get settled() {
						return this.root.settled;
					},
					set settled(value) {
						this.root.settled = value;
					},
					get reason() {
						return this.root.reason;
					}
				};
				const rejector = rejectorFor(promise, newState);
				try {
					Reflect.apply(then, value, [resolverFor(promise, newState), rejector]);
				} catch (err) {
					rejector(err);
				}
				return;
			}
		}
		if (state.settled) return;
		state.settled = true;
		promise.resolve(value);
	};
}
function rejectorFor(promise, state) {
	return (reason) => {
		if (state.resolving) return;
		state.resolving = true;
		if (state.settled) {
			try {
				if (reason instanceof CancelError && state.reason instanceof CancelError && Object.is(reason.cause, state.reason.cause)) return;
			} catch (_unused2) {}
			Promise.reject(new CancelledRejectionError(promise.promise, reason));
		} else {
			state.settled = true;
			promise.reject(reason);
		}
	};
}
function cancelAll(parent, values, cause) {
	const results = [];
	for (const value of values) {
		let cancel;
		try {
			if (!callable_default(value.then)) continue;
			cancel = value.cancel;
			if (!callable_default(cancel)) continue;
		} catch (_unused3) {
			continue;
		}
		let result;
		try {
			result = Reflect.apply(cancel, value, [cause]);
		} catch (err) {
			Promise.reject(new CancelledRejectionError(parent, err, "Unhandled exception in cancel method."));
			continue;
		}
		if (!result) continue;
		results.push((result instanceof Promise ? result : Promise.resolve(result)).catch((reason) => {
			Promise.reject(new CancelledRejectionError(parent, reason, "Unhandled rejection in cancel method."));
		}));
	}
	return Promise.all(results);
}
function identity(x) {
	return x;
}
function thrower(reason) {
	throw reason;
}
function errorMessage(err) {
	try {
		if (err instanceof Error || typeof err !== "object" || err.toString !== Object.prototype.toString) return "" + err;
	} catch (_unused4) {}
	try {
		return JSON.stringify(err);
	} catch (_unused5) {}
	try {
		return Object.prototype.toString.call(err);
	} catch (_unused6) {}
	return "<could not convert error to string>";
}
function currentBarrier(promise) {
	var _promise$barrierSym;
	let pwr = (_promise$barrierSym = promise[barrierSym]) !== null && _promise$barrierSym !== void 0 ? _promise$barrierSym : {};
	if (!("promise" in pwr)) Object.assign(pwr, promiseWithResolvers());
	if (promise[barrierSym] == null) {
		pwr.resolve();
		promise[barrierSym] = pwr;
	}
	return pwr.promise;
}
var _Symbol$species, CancelError, CancelledRejectionError, barrierSym, cancelImplSym, species, CancellablePromise, promiseWithResolvers;
function init_cancellable() {
	return (init_cancellable = __esmMin((() => {
		init_callable();
		init_objectSpread2();
		;
		CancelError = class extends Error {
			constructor(message, options) {
				super(message, options);
				this.name = "CancelError";
			}
		};
		CancelledRejectionError = class extends Error {
			constructor(promise, reason, info) {
				super((info !== null && info !== void 0 ? info : "Unhandled rejection in cancelled promise.") + " Reason: " + errorMessage(reason), { cause: reason });
				this.promise = promise;
				this.name = "CancelledRejectionError";
			}
		};
		barrierSym = Symbol("barrier");
		cancelImplSym = Symbol("cancelImpl");
		species = (_Symbol$species = Symbol.species) !== null && _Symbol$species !== void 0 ? _Symbol$species : Symbol("speciesPolyfill");
		CancellablePromise = class CancellablePromise extends Promise {
			constructor(executor, oncancelled) {
				let resolve;
				let reject;
				super((res, rej) => {
					resolve = res;
					reject = rej;
				});
				if (this.constructor[species] !== Promise) throw new TypeError("CancellablePromise does not support transparent subclassing. Please refrain from overriding the [Symbol.species] static property.");
				let promise = {
					promise: this,
					resolve,
					reject,
					get oncancelled() {
						var _oncancelled;
						return (_oncancelled = oncancelled) !== null && _oncancelled !== void 0 ? _oncancelled : null;
					},
					set oncancelled(cb) {
						oncancelled = cb !== null && cb !== void 0 ? cb : void 0;
					}
				};
				const state = {
					get root() {
						return state;
					},
					resolving: false,
					settled: false
				};
				Object.defineProperties(this, {
					[barrierSym]: {
						configurable: false,
						enumerable: false,
						writable: true,
						value: null
					},
					[cancelImplSym]: {
						configurable: false,
						enumerable: false,
						writable: false,
						value: cancellerFor(promise, state)
					}
				});
				const rejector = rejectorFor(promise, state);
				try {
					executor(resolverFor(promise, state), rejector);
				} catch (err) {
					if (state.resolving) console.log("Unhandled exception in CancellablePromise executor.", err);
					else rejector(err);
				}
			}
			cancel(cause) {
				return new CancellablePromise((resolve) => {
					Promise.all([this[cancelImplSym](new CancelError("Promise cancelled.", { cause })), currentBarrier(this)]).then(() => resolve(), () => resolve());
				});
			}
			cancelOn(signal) {
				if (signal.aborted) this.cancel(signal.reason);
				else signal.addEventListener("abort", () => void this.cancel(signal.reason), { capture: true });
				return this;
			}
			then(onfulfilled, onrejected, oncancelled) {
				if (!(this instanceof CancellablePromise)) throw new TypeError("CancellablePromise.prototype.then called on an invalid object.");
				if (!callable_default(onfulfilled)) onfulfilled = identity;
				if (!callable_default(onrejected)) onrejected = thrower;
				if (onfulfilled === identity && onrejected == thrower) return new CancellablePromise((resolve) => resolve(this));
				const barrier = {};
				this[barrierSym] = barrier;
				return new CancellablePromise((resolve, reject) => {
					super.then((value) => {
						var _barrier$resolve;
						if (this[barrierSym] === barrier) this[barrierSym] = null;
						(_barrier$resolve = barrier.resolve) === null || _barrier$resolve === void 0 || _barrier$resolve.call(barrier);
						try {
							resolve(onfulfilled(value));
						} catch (err) {
							reject(err);
						}
					}, (reason) => {
						var _barrier$resolve2;
						if (this[barrierSym] === barrier) this[barrierSym] = null;
						(_barrier$resolve2 = barrier.resolve) === null || _barrier$resolve2 === void 0 || _barrier$resolve2.call(barrier);
						try {
							resolve(onrejected(reason));
						} catch (err) {
							reject(err);
						}
					});
				}, async (cause) => {
					try {
						return oncancelled === null || oncancelled === void 0 ? void 0 : oncancelled(cause);
					} finally {
						await this.cancel(cause);
					}
				});
			}
			catch(onrejected, oncancelled) {
				return this.then(void 0, onrejected, oncancelled);
			}
			finally(onfinally, oncancelled) {
				if (!(this instanceof CancellablePromise)) throw new TypeError("CancellablePromise.prototype.finally called on an invalid object.");
				if (!callable_default(onfinally)) return this.then(onfinally, onfinally, oncancelled);
				return this.then((value) => CancellablePromise.resolve(onfinally()).then(() => value), (reason) => CancellablePromise.resolve(onfinally()).then(() => {
					throw reason;
				}), oncancelled);
			}
			static get [species]() {
				return Promise;
			}
			static all(values) {
				let collected = Array.from(values);
				const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
					Promise.all(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static allSettled(values) {
				let collected = Array.from(values);
				const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
					Promise.allSettled(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static any(values) {
				let collected = Array.from(values);
				const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
					Promise.any(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static race(values) {
				let collected = Array.from(values);
				const promise = new CancellablePromise((resolve, reject) => {
					Promise.race(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static cancel(cause) {
				const p = new CancellablePromise(() => {});
				p.cancel(cause);
				return p;
			}
			static timeout(milliseconds, cause) {
				const promise = new CancellablePromise(() => {});
				if (AbortSignal && typeof AbortSignal === "function" && AbortSignal.timeout && typeof AbortSignal.timeout === "function") AbortSignal.timeout(milliseconds).addEventListener("abort", () => void promise.cancel(cause));
				else setTimeout(() => void promise.cancel(cause), milliseconds);
				return promise;
			}
			static sleep(milliseconds, value) {
				return new CancellablePromise((resolve) => {
					setTimeout(() => resolve(value), milliseconds);
				});
			}
			static reject(reason) {
				return new CancellablePromise((_, reject) => reject(reason));
			}
			static resolve(value) {
				if (value instanceof CancellablePromise) return value;
				return new CancellablePromise((resolve) => resolve(value));
			}
			static withResolvers() {
				let result = { oncancelled: null };
				result.promise = new CancellablePromise((resolve, reject) => {
					result.resolve = resolve;
					result.reject = reject;
				}, (cause) => {
					var _result$oncancelled;
					(_result$oncancelled = result.oncancelled) === null || _result$oncancelled === void 0 || _result$oncancelled.call(result, cause);
				});
				return result;
			}
		};
		promiseWithResolvers = Promise.withResolvers;
		if (promiseWithResolvers && typeof promiseWithResolvers === "function") promiseWithResolvers = promiseWithResolvers.bind(Promise);
		else promiseWithResolvers = function() {
			let resolve;
			let reject;
			return {
				promise: new Promise((res, rej) => {
					resolve = res;
					reject = rej;
				}),
				resolve,
				reject
			};
		};
	})))();
}

// src/calls.ts
var calls_exports = /* @__PURE__ */ __exportAll({
	ByID: () => ByID,
	ByName: () => ByName,
	Call: () => Call,
	RuntimeError: () => RuntimeError
});
function generateID() {
	let result;
	do
		result = nanoid();
	while (callResponses.has(result));
	return result;
}
function Call(options) {
	const id = generateID();
	const result = CancellablePromise.withResolvers();
	callResponses.set(id, {
		resolve: result.resolve,
		reject: result.reject
	});
	const request = call$6(CallBinding, Object.assign({ "call-id": id }, options));
	let running = true;
	request.then((res) => {
		running = false;
		callResponses.delete(id);
		result.resolve(res);
	}, (err) => {
		running = false;
		callResponses.delete(id);
		result.reject(err);
	});
	const cancel = () => {
		callResponses.delete(id);
		return cancelCall(CancelMethod, { "call-id": id }).catch((err) => {
			console.error("Error while requesting binding call cancellation:", err);
		});
	};
	result.oncancelled = () => {
		if (running) return cancel();
		else return request.then(cancel);
	};
	return result.promise;
}
function ByName(methodName, ...args) {
	return Call({
		methodName,
		args
	});
}
function ByID(methodID, ...args) {
	return Call({
		methodID,
		args
	});
}
var call$6, cancelCall, callResponses, CallBinding, CancelMethod;
function init_calls() {
	return (init_calls = __esmMin((() => {
		init_cancellable();
		init_runtime();
		init_nanoid();
		init_environment();
		if (hasDOM) window._wails = window._wails || {};
		call$6 = newRuntimeCaller(objectNames.Call);
		cancelCall = newRuntimeCaller(objectNames.CancelCall);
		callResponses = /* @__PURE__ */ new Map();
		CallBinding = 0;
		CancelMethod = 0;
	})))();
}

// src/clipboard.ts
var clipboard_exports = /* @__PURE__ */ __exportAll({
	SetText: () => SetText,
	Text: () => Text
});
function SetText(text) {
	return call$5(ClipboardSetText, { text });
}
function Text() {
	return call$5(ClipboardText);
}
var call$5, ClipboardSetText, ClipboardText;
function init_clipboard() {
	return (init_clipboard = __esmMin((() => {
		init_runtime();
		call$5 = newRuntimeCaller(objectNames.Clipboard);
		ClipboardSetText = 0;
		ClipboardText = 1;
	})))();
}

// src/create.ts
var create_exports = /* @__PURE__ */ __exportAll({
	Any: () => Any,
	Array: () => Array$1,
	ByteSlice: () => ByteSlice,
	DateFromTime: () => DateFromTime,
	Events: () => Events$1,
	Map: () => Map$1,
	Nullable: () => Nullable,
	Struct: () => Struct
});
function Any(source) {
	return source;
}
function ByteSlice(source) {
	return source == null ? "" : source;
}
function Array$1(element) {
	if (element === Any) return (source) => source === null ? [] : source;
	return (source) => {
		if (source === null) return [];
		for (let i = 0; i < source.length; i++) source[i] = element(source[i]);
		return source;
	};
}
function Map$1(key, value) {
	if (value === Any) return (source) => source === null ? {} : source;
	return (source) => {
		if (source === null) return {};
		for (const key in source) source[key] = value(source[key]);
		return source;
	};
}
function Nullable(element) {
	if (element === Any) return Any;
	return (source) => source === null ? null : element(source);
}
function Struct(createField) {
	let allAny = true;
	for (const name in createField) if (createField[name] !== Any) {
		allAny = false;
		break;
	}
	if (allAny) return Any;
	return (source) => {
		for (const name in createField) if (name in source) source[name] = createField[name](source[name]);
		return source;
	};
}
function DateFromTime(source) {
	return new Date(source);
}
var Events$1;
function init_create() {
	return (init_create = __esmMin((() => {
		Events$1 = {};
	})))();
}

// src/dialogs.ts
var dialogs_exports = /* @__PURE__ */ __exportAll({
	Error: () => Error$1,
	Info: () => Info,
	OpenFile: () => OpenFile,
	Question: () => Question,
	SaveFile: () => SaveFile,
	TextInput: () => TextInput,
	Warning: () => Warning
});
function dialog(type, options = {}) {
	return call$4(type, options);
}
function Info(options) {
	return dialog(DialogInfo, options);
}
function Warning(options) {
	return dialog(DialogWarning, options);
}
function Error$1(options) {
	return dialog(DialogError, options);
}
function Question(options) {
	return dialog(DialogQuestion, options);
}
function OpenFile(options) {
	var _dialog;
	return (_dialog = dialog(DialogOpenFile, options)) !== null && _dialog !== void 0 ? _dialog : [];
}
function SaveFile(options) {
	return dialog(DialogSaveFile, options);
}
function TextInput(options = {}) {
	return dialog(DialogTextInput, options);
}
var call$4, DialogInfo, DialogWarning, DialogError, DialogQuestion, DialogOpenFile, DialogSaveFile, DialogTextInput;
function init_dialogs() {
	return (init_dialogs = __esmMin((() => {
		init_runtime();
		init_environment();
		if (hasDOM) window._wails = window._wails || {};
		call$4 = newRuntimeCaller(objectNames.Dialog);
		DialogInfo = 0;
		DialogWarning = 1;
		DialogError = 2;
		DialogQuestion = 3;
		DialogOpenFile = 4;
		DialogSaveFile = 5;
		DialogTextInput = 6;
	})))();
}

// src/listener.ts
function listenerOff(listener) {
	let listeners = eventListeners.get(listener.eventName);
	if (!listeners) return;
	listeners = listeners.filter((l) => l !== listener);
	if (listeners.length === 0) eventListeners.delete(listener.eventName);
	else eventListeners.set(listener.eventName, listeners);
}
var eventListeners, Listener;
function init_listener() {
	return (init_listener = __esmMin((() => {
		eventListeners = /* @__PURE__ */ new Map();
		Listener = class {
			constructor(eventName, callback, maxCallbacks) {
				this.eventName = eventName;
				this.callback = callback;
				this.maxCallbacks = maxCallbacks || -1;
			}
			dispatch(data) {
				try {
					this.callback(data);
				} catch (err) {
					console.error(err);
				}
				if (this.maxCallbacks === -1) return false;
				this.maxCallbacks -= 1;
				return this.maxCallbacks === 0;
			}
		};
	})))();
}

// src/event_types.ts
var Types;
function init_event_types() {
	return (init_event_types = __esmMin((() => {
		Types = Object.freeze({
			Windows: Object.freeze({
				APMPowerSettingChange: "windows:APMPowerSettingChange",
				APMPowerStatusChange: "windows:APMPowerStatusChange",
				APMResumeAutomatic: "windows:APMResumeAutomatic",
				APMResumeSuspend: "windows:APMResumeSuspend",
				APMSuspend: "windows:APMSuspend",
				ApplicationStarted: "windows:ApplicationStarted",
				SystemThemeChanged: "windows:SystemThemeChanged",
				WebViewNavigationCompleted: "windows:WebViewNavigationCompleted",
				WindowActive: "windows:WindowActive",
				WindowBackgroundErase: "windows:WindowBackgroundErase",
				WindowClickActive: "windows:WindowClickActive",
				WindowClosing: "windows:WindowClosing",
				WindowDidMove: "windows:WindowDidMove",
				WindowDidResize: "windows:WindowDidResize",
				WindowDPIChanged: "windows:WindowDPIChanged",
				WindowDragDrop: "windows:WindowDragDrop",
				WindowDragEnter: "windows:WindowDragEnter",
				WindowDragLeave: "windows:WindowDragLeave",
				WindowDragOver: "windows:WindowDragOver",
				WindowEndMove: "windows:WindowEndMove",
				WindowEndResize: "windows:WindowEndResize",
				WindowFullscreen: "windows:WindowFullscreen",
				WindowHide: "windows:WindowHide",
				WindowInactive: "windows:WindowInactive",
				WindowKeyDown: "windows:WindowKeyDown",
				WindowKeyUp: "windows:WindowKeyUp",
				WindowKillFocus: "windows:WindowKillFocus",
				WindowNonClientHit: "windows:WindowNonClientHit",
				WindowNonClientMouseDown: "windows:WindowNonClientMouseDown",
				WindowNonClientMouseLeave: "windows:WindowNonClientMouseLeave",
				WindowNonClientMouseMove: "windows:WindowNonClientMouseMove",
				WindowNonClientMouseUp: "windows:WindowNonClientMouseUp",
				WindowPaint: "windows:WindowPaint",
				WindowRestore: "windows:WindowRestore",
				WindowSetFocus: "windows:WindowSetFocus",
				WindowShow: "windows:WindowShow",
				WindowStartMove: "windows:WindowStartMove",
				WindowStartResize: "windows:WindowStartResize",
				WindowUnFullscreen: "windows:WindowUnFullscreen",
				WindowZOrderChanged: "windows:WindowZOrderChanged",
				WindowMinimise: "windows:WindowMinimise",
				WindowUnMinimise: "windows:WindowUnMinimise",
				WindowMaximise: "windows:WindowMaximise",
				WindowUnMaximise: "windows:WindowUnMaximise"
			}),
			Mac: Object.freeze({
				ApplicationDidBecomeActive: "mac:ApplicationDidBecomeActive",
				ApplicationDidChangeBackingProperties: "mac:ApplicationDidChangeBackingProperties",
				ApplicationDidChangeEffectiveAppearance: "mac:ApplicationDidChangeEffectiveAppearance",
				ApplicationDidChangeIcon: "mac:ApplicationDidChangeIcon",
				ApplicationDidChangeOcclusionState: "mac:ApplicationDidChangeOcclusionState",
				ApplicationDidChangeScreenParameters: "mac:ApplicationDidChangeScreenParameters",
				ApplicationDidChangeStatusBarFrame: "mac:ApplicationDidChangeStatusBarFrame",
				ApplicationDidChangeStatusBarOrientation: "mac:ApplicationDidChangeStatusBarOrientation",
				ApplicationDidChangeTheme: "mac:ApplicationDidChangeTheme",
				ApplicationDidFinishLaunching: "mac:ApplicationDidFinishLaunching",
				ApplicationDidHide: "mac:ApplicationDidHide",
				ApplicationDidResignActive: "mac:ApplicationDidResignActive",
				ApplicationDidUnhide: "mac:ApplicationDidUnhide",
				ApplicationDidUpdate: "mac:ApplicationDidUpdate",
				ApplicationDidWake: "mac:ApplicationDidWake",
				ApplicationScreensDidSleep: "mac:ApplicationScreensDidSleep",
				ApplicationScreensDidWake: "mac:ApplicationScreensDidWake",
				ApplicationShouldHandleReopen: "mac:ApplicationShouldHandleReopen",
				ApplicationWillBecomeActive: "mac:ApplicationWillBecomeActive",
				ApplicationWillFinishLaunching: "mac:ApplicationWillFinishLaunching",
				ApplicationWillHide: "mac:ApplicationWillHide",
				ApplicationWillResignActive: "mac:ApplicationWillResignActive",
				ApplicationWillSleep: "mac:ApplicationWillSleep",
				ApplicationWillTerminate: "mac:ApplicationWillTerminate",
				ApplicationWillUnhide: "mac:ApplicationWillUnhide",
				ApplicationWillUpdate: "mac:ApplicationWillUpdate",
				MenuDidAddItem: "mac:MenuDidAddItem",
				MenuDidBeginTracking: "mac:MenuDidBeginTracking",
				MenuDidClose: "mac:MenuDidClose",
				MenuDidDisplayItem: "mac:MenuDidDisplayItem",
				MenuDidEndTracking: "mac:MenuDidEndTracking",
				MenuDidHighlightItem: "mac:MenuDidHighlightItem",
				MenuDidOpen: "mac:MenuDidOpen",
				MenuDidPopUp: "mac:MenuDidPopUp",
				MenuDidRemoveItem: "mac:MenuDidRemoveItem",
				MenuDidSendAction: "mac:MenuDidSendAction",
				MenuDidSendActionToItem: "mac:MenuDidSendActionToItem",
				MenuDidUpdate: "mac:MenuDidUpdate",
				MenuWillAddItem: "mac:MenuWillAddItem",
				MenuWillBeginTracking: "mac:MenuWillBeginTracking",
				MenuWillDisplayItem: "mac:MenuWillDisplayItem",
				MenuWillEndTracking: "mac:MenuWillEndTracking",
				MenuWillHighlightItem: "mac:MenuWillHighlightItem",
				MenuWillOpen: "mac:MenuWillOpen",
				MenuWillPopUp: "mac:MenuWillPopUp",
				MenuWillRemoveItem: "mac:MenuWillRemoveItem",
				MenuWillSendAction: "mac:MenuWillSendAction",
				MenuWillSendActionToItem: "mac:MenuWillSendActionToItem",
				MenuWillUpdate: "mac:MenuWillUpdate",
				WebViewDidCommitNavigation: "mac:WebViewDidCommitNavigation",
				WebViewDidFinishNavigation: "mac:WebViewDidFinishNavigation",
				WebViewDidReceiveServerRedirectForProvisionalNavigation: "mac:WebViewDidReceiveServerRedirectForProvisionalNavigation",
				WebViewDidStartProvisionalNavigation: "mac:WebViewDidStartProvisionalNavigation",
				WindowDidBecomeKey: "mac:WindowDidBecomeKey",
				WindowDidBecomeMain: "mac:WindowDidBecomeMain",
				WindowDidBeginSheet: "mac:WindowDidBeginSheet",
				WindowDidChangeAlpha: "mac:WindowDidChangeAlpha",
				WindowDidChangeBackingLocation: "mac:WindowDidChangeBackingLocation",
				WindowDidChangeBackingProperties: "mac:WindowDidChangeBackingProperties",
				WindowDidChangeCollectionBehavior: "mac:WindowDidChangeCollectionBehavior",
				WindowDidChangeEffectiveAppearance: "mac:WindowDidChangeEffectiveAppearance",
				WindowDidChangeOcclusionState: "mac:WindowDidChangeOcclusionState",
				WindowDidChangeOrderingMode: "mac:WindowDidChangeOrderingMode",
				WindowDidChangeScreen: "mac:WindowDidChangeScreen",
				WindowDidChangeScreenParameters: "mac:WindowDidChangeScreenParameters",
				WindowDidChangeScreenProfile: "mac:WindowDidChangeScreenProfile",
				WindowDidChangeScreenSpace: "mac:WindowDidChangeScreenSpace",
				WindowDidChangeScreenSpaceProperties: "mac:WindowDidChangeScreenSpaceProperties",
				WindowDidChangeSharingType: "mac:WindowDidChangeSharingType",
				WindowDidChangeSpace: "mac:WindowDidChangeSpace",
				WindowDidChangeSpaceOrderingMode: "mac:WindowDidChangeSpaceOrderingMode",
				WindowDidChangeTitle: "mac:WindowDidChangeTitle",
				WindowDidChangeToolbar: "mac:WindowDidChangeToolbar",
				WindowDidDeminiaturize: "mac:WindowDidDeminiaturize",
				WindowDidEndSheet: "mac:WindowDidEndSheet",
				WindowDidEnterFullScreen: "mac:WindowDidEnterFullScreen",
				WindowDidEnterVersionBrowser: "mac:WindowDidEnterVersionBrowser",
				WindowDidExitFullScreen: "mac:WindowDidExitFullScreen",
				WindowDidExitVersionBrowser: "mac:WindowDidExitVersionBrowser",
				WindowDidExpose: "mac:WindowDidExpose",
				WindowDidFocus: "mac:WindowDidFocus",
				WindowDidMiniaturize: "mac:WindowDidMiniaturize",
				WindowDidMove: "mac:WindowDidMove",
				WindowDidOrderOffScreen: "mac:WindowDidOrderOffScreen",
				WindowDidOrderOnScreen: "mac:WindowDidOrderOnScreen",
				WindowDidResignKey: "mac:WindowDidResignKey",
				WindowDidResignMain: "mac:WindowDidResignMain",
				WindowDidResize: "mac:WindowDidResize",
				WindowDidUpdate: "mac:WindowDidUpdate",
				WindowDidUpdateAlpha: "mac:WindowDidUpdateAlpha",
				WindowDidUpdateCollectionBehavior: "mac:WindowDidUpdateCollectionBehavior",
				WindowDidUpdateCollectionProperties: "mac:WindowDidUpdateCollectionProperties",
				WindowDidUpdateShadow: "mac:WindowDidUpdateShadow",
				WindowDidUpdateTitle: "mac:WindowDidUpdateTitle",
				WindowDidUpdateToolbar: "mac:WindowDidUpdateToolbar",
				WindowDidZoom: "mac:WindowDidZoom",
				WindowFileDraggingEntered: "mac:WindowFileDraggingEntered",
				WindowFileDraggingExited: "mac:WindowFileDraggingExited",
				WindowFileDraggingPerformed: "mac:WindowFileDraggingPerformed",
				WindowHide: "mac:WindowHide",
				WindowMaximise: "mac:WindowMaximise",
				WindowUnMaximise: "mac:WindowUnMaximise",
				WindowMinimise: "mac:WindowMinimise",
				WindowUnMinimise: "mac:WindowUnMinimise",
				WindowShouldClose: "mac:WindowShouldClose",
				WindowShow: "mac:WindowShow",
				WindowWillBecomeKey: "mac:WindowWillBecomeKey",
				WindowWillBecomeMain: "mac:WindowWillBecomeMain",
				WindowWillBeginSheet: "mac:WindowWillBeginSheet",
				WindowWillChangeOrderingMode: "mac:WindowWillChangeOrderingMode",
				WindowWillClose: "mac:WindowWillClose",
				WindowWillDeminiaturize: "mac:WindowWillDeminiaturize",
				WindowWillEnterFullScreen: "mac:WindowWillEnterFullScreen",
				WindowWillEnterVersionBrowser: "mac:WindowWillEnterVersionBrowser",
				WindowWillExitFullScreen: "mac:WindowWillExitFullScreen",
				WindowWillExitVersionBrowser: "mac:WindowWillExitVersionBrowser",
				WindowWillFocus: "mac:WindowWillFocus",
				WindowWillMiniaturize: "mac:WindowWillMiniaturize",
				WindowWillMove: "mac:WindowWillMove",
				WindowWillOrderOffScreen: "mac:WindowWillOrderOffScreen",
				WindowWillOrderOnScreen: "mac:WindowWillOrderOnScreen",
				WindowWillResignMain: "mac:WindowWillResignMain",
				WindowWillResize: "mac:WindowWillResize",
				WindowWillUnfocus: "mac:WindowWillUnfocus",
				WindowWillUpdate: "mac:WindowWillUpdate",
				WindowWillUpdateAlpha: "mac:WindowWillUpdateAlpha",
				WindowWillUpdateCollectionBehavior: "mac:WindowWillUpdateCollectionBehavior",
				WindowWillUpdateCollectionProperties: "mac:WindowWillUpdateCollectionProperties",
				WindowWillUpdateShadow: "mac:WindowWillUpdateShadow",
				WindowWillUpdateTitle: "mac:WindowWillUpdateTitle",
				WindowWillUpdateToolbar: "mac:WindowWillUpdateToolbar",
				WindowWillUpdateVisibility: "mac:WindowWillUpdateVisibility",
				WindowWillUseStandardFrame: "mac:WindowWillUseStandardFrame",
				WindowZoomIn: "mac:WindowZoomIn",
				WindowZoomOut: "mac:WindowZoomOut",
				WindowZoomReset: "mac:WindowZoomReset",
				WebViewWebContentProcessDidTerminate: "mac:WebViewWebContentProcessDidTerminate"
			}),
			Linux: Object.freeze({
				ApplicationStartup: "linux:ApplicationStartup",
				SystemDidWake: "linux:SystemDidWake",
				SystemThemeChanged: "linux:SystemThemeChanged",
				SystemWillSleep: "linux:SystemWillSleep",
				WindowDeleteEvent: "linux:WindowDeleteEvent",
				WindowDidMove: "linux:WindowDidMove",
				WindowDidResize: "linux:WindowDidResize",
				WindowFocusIn: "linux:WindowFocusIn",
				WindowFocusOut: "linux:WindowFocusOut",
				WindowLoadStarted: "linux:WindowLoadStarted",
				WindowLoadRedirected: "linux:WindowLoadRedirected",
				WindowLoadCommitted: "linux:WindowLoadCommitted",
				WindowLoadFinished: "linux:WindowLoadFinished"
			}),
			iOS: Object.freeze({
				ApplicationDidBecomeActive: "ios:ApplicationDidBecomeActive",
				ApplicationDidEnterBackground: "ios:ApplicationDidEnterBackground",
				ApplicationDidFinishLaunching: "ios:ApplicationDidFinishLaunching",
				ApplicationDidReceiveMemoryWarning: "ios:ApplicationDidReceiveMemoryWarning",
				ApplicationWillEnterForeground: "ios:ApplicationWillEnterForeground",
				ApplicationWillResignActive: "ios:ApplicationWillResignActive",
				ApplicationWillTerminate: "ios:ApplicationWillTerminate",
				WindowDidLoad: "ios:WindowDidLoad",
				WindowWillAppear: "ios:WindowWillAppear",
				WindowDidAppear: "ios:WindowDidAppear",
				WindowWillDisappear: "ios:WindowWillDisappear",
				WindowDidDisappear: "ios:WindowDidDisappear",
				WindowSafeAreaInsetsChanged: "ios:WindowSafeAreaInsetsChanged",
				WindowOrientationChanged: "ios:WindowOrientationChanged",
				WindowTouchBegan: "ios:WindowTouchBegan",
				WindowTouchMoved: "ios:WindowTouchMoved",
				WindowTouchEnded: "ios:WindowTouchEnded",
				WindowTouchCancelled: "ios:WindowTouchCancelled",
				WebViewDidStartNavigation: "ios:WebViewDidStartNavigation",
				WebViewDidFinishNavigation: "ios:WebViewDidFinishNavigation",
				WebViewDidFailNavigation: "ios:WebViewDidFailNavigation",
				WebViewDecidePolicyForNavigationAction: "ios:WebViewDecidePolicyForNavigationAction",
				BatteryChanged: "ios:BatteryChanged",
				NetworkChanged: "ios:NetworkChanged",
				ThemeChanged: "ios:ThemeChanged",
				ScreenLocked: "ios:ScreenLocked",
				ScreenUnlocked: "ios:ScreenUnlocked"
			}),
			Android: Object.freeze({
				ActivityCreated: "android:ActivityCreated",
				ActivityStarted: "android:ActivityStarted",
				ActivityResumed: "android:ActivityResumed",
				ActivityPaused: "android:ActivityPaused",
				ActivityStopped: "android:ActivityStopped",
				ActivityDestroyed: "android:ActivityDestroyed",
				ApplicationLowMemory: "android:ApplicationLowMemory",
				WebViewPageStarted: "android:WebViewPageStarted",
				WebViewPageFinished: "android:WebViewPageFinished",
				BatteryChanged: "android:BatteryChanged",
				NetworkChanged: "android:NetworkChanged",
				ThemeChanged: "android:ThemeChanged",
				ScreenLocked: "android:ScreenLocked",
				ScreenUnlocked: "android:ScreenUnlocked"
			}),
			Common: Object.freeze({
				ApplicationOpenedWithFile: "common:ApplicationOpenedWithFile",
				ApplicationStarted: "common:ApplicationStarted",
				ApplicationLaunchedWithUrl: "common:ApplicationLaunchedWithUrl",
				ThemeChanged: "common:ThemeChanged",
				SystemDidWake: "common:SystemDidWake",
				SystemWillSleep: "common:SystemWillSleep",
				WindowClosing: "common:WindowClosing",
				WindowDidMove: "common:WindowDidMove",
				WindowDidResize: "common:WindowDidResize",
				WindowDPIChanged: "common:WindowDPIChanged",
				WindowFilesDropped: "common:WindowFilesDropped",
				WindowFocus: "common:WindowFocus",
				WindowFullscreen: "common:WindowFullscreen",
				WindowHide: "common:WindowHide",
				WindowLostFocus: "common:WindowLostFocus",
				WindowMaximise: "common:WindowMaximise",
				WindowMinimise: "common:WindowMinimise",
				WindowToggleFrameless: "common:WindowToggleFrameless",
				WindowRestore: "common:WindowRestore",
				WindowRuntimeReady: "common:WindowRuntimeReady",
				WindowShow: "common:WindowShow",
				WindowUnFullscreen: "common:WindowUnFullscreen",
				WindowUnMaximise: "common:WindowUnMaximise",
				WindowUnMinimise: "common:WindowUnMinimise",
				WindowZoom: "common:WindowZoom",
				WindowZoomIn: "common:WindowZoomIn",
				WindowZoomOut: "common:WindowZoomOut",
				WindowZoomReset: "common:WindowZoomReset",
				BatteryChanged: "common:BatteryChanged",
				NetworkChanged: "common:NetworkChanged",
				ScreenLocked: "common:ScreenLocked",
				ScreenUnlocked: "common:ScreenUnlocked",
				LowMemory: "common:LowMemory"
			})
		});
	})))();
}

// src/events.ts
var events_exports = /* @__PURE__ */ __exportAll({
	Emit: () => Emit,
	Off: () => Off,
	OffAll: () => OffAll,
	On: () => On,
	OnMultiple: () => OnMultiple,
	Once: () => Once,
	Types: () => Types,
	WailsEvent: () => WailsEvent
});
function dispatchWailsEvent(event) {
	let listeners = eventListeners.get(event.name);
	if (!listeners) return;
	let wailsEvent = new WailsEvent(event.name, event.name in Events$1 ? Events$1[event.name](event.data) : event.data);
	if ("sender" in event) wailsEvent.sender = event.sender;
	const expired = /* @__PURE__ */ new Set();
	for (const listener of listeners.slice()) if (listener.dispatch(wailsEvent)) expired.add(listener);
	if (expired.size > 0) {
		const live = eventListeners.get(event.name);
		if (live) {
			const remaining = live.filter((l) => !expired.has(l));
			if (remaining.length === 0) eventListeners.delete(event.name);
			else eventListeners.set(event.name, remaining);
		}
	}
}
function OnMultiple(eventName, callback, maxCallbacks) {
	let listeners = eventListeners.get(eventName) || [];
	const thisListener = new Listener(eventName, callback, maxCallbacks);
	listeners.push(thisListener);
	eventListeners.set(eventName, listeners);
	return () => listenerOff(thisListener);
}
function On(eventName, callback) {
	return OnMultiple(eventName, callback, -1);
}
function Once(eventName, callback) {
	return OnMultiple(eventName, callback, 1);
}
function Off(...eventNames) {
	eventNames.forEach((eventName) => eventListeners.delete(eventName));
}
function OffAll() {
	eventListeners.clear();
}
function Emit(name, data) {
	return call$3(EmitMethod, new WailsEvent(name, data));
}
var call$3, EmitMethod, WailsEvent;
function init_events() {
	return (init_events = __esmMin((() => {
		init_runtime();
		init_listener();
		init_create();
		init_event_types();
		init_environment();
		if (hasDOM) {
			window._wails = window._wails || {};
			window._wails.dispatchWailsEvent = dispatchWailsEvent;
		}
		call$3 = newRuntimeCaller(objectNames.Events);
		EmitMethod = 0;
		WailsEvent = class {
			constructor(name, data) {
				this.name = name;
				this.data = data !== null && data !== void 0 ? data : null;
			}
		};
	})))();
}

// src/screens.ts
var screens_exports = /* @__PURE__ */ __exportAll({
	GetAll: () => GetAll,
	GetByID: () => GetByID,
	GetByIndex: () => GetByIndex,
	GetCurrent: () => GetCurrent,
	GetPrimary: () => GetPrimary
});
function GetAll() {
	return call$2(getAll);
}
function GetPrimary() {
	return call$2(getPrimary);
}
function GetCurrent() {
	return call$2(getCurrent);
}
function GetByID(id) {
	return call$2(getByID, { id });
}
function GetByIndex(index) {
	return call$2(getByIndex, { index });
}
var call$2, getAll, getPrimary, getCurrent, getByID, getByIndex;
function init_screens() {
	return (init_screens = __esmMin((() => {
		init_runtime();
		call$2 = newRuntimeCaller(objectNames.Screens);
		getAll = 0;
		getPrimary = 1;
		getCurrent = 2;
		getByID = 3;
		getByIndex = 4;
	})))();
}

// src/ios.ts
var ios_exports = /* @__PURE__ */ __exportAll({
	Device: () => Device$1,
	Haptics: () => Haptics$1
});
var call$1, HapticsImpact, DeviceInfo$1, Haptics$1, Device$1;
function init_ios() {
	return (init_ios = __esmMin((() => {
		init_runtime();
		call$1 = newRuntimeCaller(objectNames.IOS);
		HapticsImpact = 0;
		DeviceInfo$1 = 1;
		;
		(function(_Haptics) {
			function Impact(style = "medium") {
				return call$1(HapticsImpact, { style });
			}
			_Haptics.Impact = Impact;
		})(Haptics$1 || (Haptics$1 = {}));
		;
		(function(_Device) {
			function Info() {
				return call$1(DeviceInfo$1);
			}
			_Device.Info = Info;
		})(Device$1 || (Device$1 = {}));
	})))();
}

// src/android.ts
var android_exports = /* @__PURE__ */ __exportAll({
	Device: () => Device,
	Haptics: () => Haptics,
	Toast: () => Toast
});
var call, HapticsVibrate, DeviceInfo, ToastShow, Haptics, Device, Toast;
function init_android() {
	return (init_android = __esmMin((() => {
		init_runtime();
		call = newRuntimeCaller(objectNames.Android);
		HapticsVibrate = 0;
		DeviceInfo = 1;
		ToastShow = 2;
		;
		(function(_Haptics) {
			function Vibrate(durationMs = 100) {
				return call(HapticsVibrate, { duration: durationMs });
			}
			_Haptics.Vibrate = Vibrate;
		})(Haptics || (Haptics = {}));
		;
		(function(_Device) {
			function Info() {
				return call(DeviceInfo);
			}
			_Device.Info = Info;
		})(Device || (Device = {}));
		;
		(function(_Toast) {
			function Show(message) {
				return call(ToastShow, { message });
			}
			_Toast.Show = Show;
		})(Toast || (Toast = {}));
	})))();
}

// src/updater.ts
var updater_exports = /* @__PURE__ */ __exportAll({ Events: () => Events });
var Events;
function init_updater() {
	return (init_updater = __esmMin((() => {
		Events = Object.freeze({
			CheckStarted: "wails:updater:check-started",
			UpdateAvailable: "wails:updater:update-available",
			NoUpdate: "wails:updater:no-update",
			DownloadStarted: "wails:updater:download-started",
			DownloadProgress: "wails:updater:download-progress",
			DownloadComplete: "wails:updater:download-complete",
			Verifying: "wails:updater:verifying",
			Installing: "wails:updater:installing",
			UpdateReady: "wails:updater:update-ready",
			Error: "wails:updater:error",
			Meta: "wails:updater:meta",
			User: Object.freeze({
				Install: "wails:updater:user:install",
				Restart: "wails:updater:user:restart",
				Skip: "wails:updater:user:skip",
				Remind: "wails:updater:user:remind",
				Cancel: "wails:updater:user:cancel"
			}),
			Window: Object.freeze({ Ready: "wails:updater:window:ready" })
		});
	})))();
}

// src/window.ts
function getDropTargetElement(element) {
	if (!element) return null;
	return element.closest(`[${DROP_TARGET_ATTRIBUTE}]`);
}
function canResolveFilePaths() {
	var _window$chrome, _window$_wails;
	if (((_window$chrome = window.chrome) === null || _window$chrome === void 0 || (_window$chrome = _window$chrome.webview) === null || _window$chrome === void 0 ? void 0 : _window$chrome.postMessageWithAdditionalObjects) == null) return false;
	return ((_window$_wails = window._wails) === null || _window$_wails === void 0 || (_window$_wails = _window$_wails.flags) === null || _window$_wails === void 0 ? void 0 : _window$_wails.enableFileDrop) === true;
}
function resolveFilePaths(x, y, files) {
	var _window$chrome2;
	if ((_window$chrome2 = window.chrome) === null || _window$chrome2 === void 0 || (_window$chrome2 = _window$chrome2.webview) === null || _window$chrome2 === void 0 ? void 0 : _window$chrome2.postMessageWithAdditionalObjects) window.chrome.webview.postMessageWithAdditionalObjects(`file:drop:${x}:${y}`, files);
}
function cleanupNativeDrag() {
	nativeDragActive = false;
	if (currentDropTarget) {
		currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		currentDropTarget = null;
	}
}
function handleDragEnter() {
	var _window$_wails2;
	if (((_window$_wails2 = window._wails) === null || _window$_wails2 === void 0 || (_window$_wails2 = _window$_wails2.flags) === null || _window$_wails2 === void 0 ? void 0 : _window$_wails2.enableFileDrop) === false) return;
	nativeDragActive = true;
}
function handleDragLeave() {
	cleanupNativeDrag();
}
function handleDragOver(x, y) {
	var _window$_wails3;
	if (!nativeDragActive) return;
	if (((_window$_wails3 = window._wails) === null || _window$_wails3 === void 0 || (_window$_wails3 = _window$_wails3.flags) === null || _window$_wails3 === void 0 ? void 0 : _window$_wails3.enableFileDrop) === false) return;
	const dropTarget = getDropTargetElement(document.elementFromPoint(x, y));
	if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
	if (dropTarget) {
		dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
		currentDropTarget = dropTarget;
	} else currentDropTarget = null;
}
function setupDropTargetListeners() {
	const docElement = document.documentElement;
	let dragEnterCounter = 0;
	docElement.addEventListener("dragenter", (event) => {
		var _event$dataTransfer, _window$_wails5;
		if (!((_event$dataTransfer = event.dataTransfer) === null || _event$dataTransfer === void 0 ? void 0 : _event$dataTransfer.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_wails5 = window._wails) === null || _window$_wails5 === void 0 || (_window$_wails5 = _window$_wails5.flags) === null || _window$_wails5 === void 0 ? void 0 : _window$_wails5.enableFileDrop) === false) {
			event.dataTransfer.dropEffect = "none";
			return;
		}
		dragEnterCounter++;
		const dropTarget = getDropTargetElement(document.elementFromPoint(event.clientX, event.clientY));
		if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		if (dropTarget) {
			dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
			event.dataTransfer.dropEffect = "copy";
			currentDropTarget = dropTarget;
		} else {
			event.dataTransfer.dropEffect = "none";
			currentDropTarget = null;
		}
	}, false);
	docElement.addEventListener("dragover", (event) => {
		var _event$dataTransfer2, _window$_wails6;
		if (!((_event$dataTransfer2 = event.dataTransfer) === null || _event$dataTransfer2 === void 0 ? void 0 : _event$dataTransfer2.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_wails6 = window._wails) === null || _window$_wails6 === void 0 || (_window$_wails6 = _window$_wails6.flags) === null || _window$_wails6 === void 0 ? void 0 : _window$_wails6.enableFileDrop) === false) {
			event.dataTransfer.dropEffect = "none";
			return;
		}
		const dropTarget = getDropTargetElement(document.elementFromPoint(event.clientX, event.clientY));
		if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		if (dropTarget) {
			if (!dropTarget.classList.contains(DROP_TARGET_ACTIVE_CLASS)) dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
			event.dataTransfer.dropEffect = "copy";
			currentDropTarget = dropTarget;
		} else {
			event.dataTransfer.dropEffect = "none";
			currentDropTarget = null;
		}
	}, false);
	docElement.addEventListener("dragleave", (event) => {
		var _event$dataTransfer3, _window$_wails7;
		if (!((_event$dataTransfer3 = event.dataTransfer) === null || _event$dataTransfer3 === void 0 ? void 0 : _event$dataTransfer3.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_wails7 = window._wails) === null || _window$_wails7 === void 0 || (_window$_wails7 = _window$_wails7.flags) === null || _window$_wails7 === void 0 ? void 0 : _window$_wails7.enableFileDrop) === false) return;
		if (event.relatedTarget === null) return;
		dragEnterCounter--;
		if (dragEnterCounter === 0 || currentDropTarget && !currentDropTarget.contains(event.relatedTarget)) {
			if (currentDropTarget) {
				currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
				currentDropTarget = null;
			}
			dragEnterCounter = 0;
		}
	}, false);
	docElement.addEventListener("drop", (event) => {
		var _event$dataTransfer4, _window$_wails8;
		if (!((_event$dataTransfer4 = event.dataTransfer) === null || _event$dataTransfer4 === void 0 ? void 0 : _event$dataTransfer4.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_wails8 = window._wails) === null || _window$_wails8 === void 0 || (_window$_wails8 = _window$_wails8.flags) === null || _window$_wails8 === void 0 ? void 0 : _window$_wails8.enableFileDrop) === false) return;
		dragEnterCounter = 0;
		if (currentDropTarget) {
			currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
			currentDropTarget = null;
		}
		if (canResolveFilePaths()) {
			const files = [];
			if (event.dataTransfer.items) {
				for (const item of event.dataTransfer.items) if (item.kind === "file") {
					const file = item.getAsFile();
					if (file) files.push(file);
				}
			} else if (event.dataTransfer.files) for (const file of event.dataTransfer.files) files.push(file);
			if (files.length > 0) resolveFilePaths(event.clientX, event.clientY, files);
		}
	}, false);
}
var DROP_TARGET_ATTRIBUTE, DROP_TARGET_ACTIVE_CLASS, currentDropTarget, PositionMethod, CenterMethod, CloseMethod, DisableSizeConstraintsMethod, EnableSizeConstraintsMethod, FocusMethod, ForceReloadMethod, FullscreenMethod, GetScreenMethod, GetZoomMethod, HeightMethod, HideMethod, IsFocusedMethod, IsFullscreenMethod, IsMaximisedMethod, IsMinimisedMethod, MaximiseMethod, MinimiseMethod, NameMethod, OpenDevToolsMethod, RelativePositionMethod, ReloadMethod, ResizableMethod, RestoreMethod, SetPositionMethod, SetAlwaysOnTopMethod, SetBackgroundColourMethod, SetFramelessMethod, SetFullscreenButtonEnabledMethod, SetMaxSizeMethod, SetMinSizeMethod, SetRelativePositionMethod, SetResizableMethod, SetSizeMethod, SetTitleMethod, SetZoomMethod, ShowMethod, SizeMethod, ToggleFullscreenMethod, ToggleMaximiseMethod, ToggleFramelessMethod, UnFullscreenMethod, UnMaximiseMethod, UnMinimiseMethod, WidthMethod, ZoomMethod, ZoomInMethod, ZoomOutMethod, ZoomResetMethod, SnapAssistMethod, FilesDropped, PrintMethod, SetScreenMethod, nativeDragActive, callerSym, Window, thisWindow;
function init_window() {
	return (init_window = __esmMin((() => {
		init_runtime();
		DROP_TARGET_ATTRIBUTE = "data-file-drop-target";
		DROP_TARGET_ACTIVE_CLASS = "file-drop-target-active";
		currentDropTarget = null;
		PositionMethod = 0;
		CenterMethod = 1;
		CloseMethod = 2;
		DisableSizeConstraintsMethod = 3;
		EnableSizeConstraintsMethod = 4;
		FocusMethod = 5;
		ForceReloadMethod = 6;
		FullscreenMethod = 7;
		GetScreenMethod = 8;
		GetZoomMethod = 9;
		HeightMethod = 10;
		HideMethod = 11;
		IsFocusedMethod = 12;
		IsFullscreenMethod = 13;
		IsMaximisedMethod = 14;
		IsMinimisedMethod = 15;
		MaximiseMethod = 16;
		MinimiseMethod = 17;
		NameMethod = 18;
		OpenDevToolsMethod = 19;
		RelativePositionMethod = 20;
		ReloadMethod = 21;
		ResizableMethod = 22;
		RestoreMethod = 23;
		SetPositionMethod = 24;
		SetAlwaysOnTopMethod = 25;
		SetBackgroundColourMethod = 26;
		SetFramelessMethod = 27;
		SetFullscreenButtonEnabledMethod = 28;
		SetMaxSizeMethod = 29;
		SetMinSizeMethod = 30;
		SetRelativePositionMethod = 31;
		SetResizableMethod = 32;
		SetSizeMethod = 33;
		SetTitleMethod = 34;
		SetZoomMethod = 35;
		ShowMethod = 36;
		SizeMethod = 37;
		ToggleFullscreenMethod = 38;
		ToggleMaximiseMethod = 39;
		ToggleFramelessMethod = 40;
		UnFullscreenMethod = 41;
		UnMaximiseMethod = 42;
		UnMinimiseMethod = 43;
		WidthMethod = 44;
		ZoomMethod = 45;
		ZoomInMethod = 46;
		ZoomOutMethod = 47;
		ZoomResetMethod = 48;
		SnapAssistMethod = 49;
		FilesDropped = 50;
		PrintMethod = 51;
		SetScreenMethod = 52;
		nativeDragActive = false;
		callerSym = Symbol("caller");
		Window = class Window {
			constructor(name = "") {
				this[callerSym] = newRuntimeCaller(objectNames.Window, name);
				for (const method of Object.getOwnPropertyNames(Window.prototype)) if (method !== "constructor" && typeof this[method] === "function") this[method] = this[method].bind(this);
			}
			Get(name) {
				return new Window(name);
			}
			Position() {
				return this[callerSym](PositionMethod);
			}
			Center() {
				return this[callerSym](CenterMethod);
			}
			Close() {
				return this[callerSym](CloseMethod);
			}
			DisableSizeConstraints() {
				return this[callerSym](DisableSizeConstraintsMethod);
			}
			EnableSizeConstraints() {
				return this[callerSym](EnableSizeConstraintsMethod);
			}
			Focus() {
				return this[callerSym](FocusMethod);
			}
			ForceReload() {
				return this[callerSym](ForceReloadMethod);
			}
			Fullscreen() {
				return this[callerSym](FullscreenMethod);
			}
			GetScreen() {
				return this[callerSym](GetScreenMethod);
			}
			GetZoom() {
				return this[callerSym](GetZoomMethod);
			}
			Height() {
				return this[callerSym](HeightMethod);
			}
			Hide() {
				return this[callerSym](HideMethod);
			}
			IsFocused() {
				return this[callerSym](IsFocusedMethod);
			}
			IsFullscreen() {
				return this[callerSym](IsFullscreenMethod);
			}
			IsMaximised() {
				return this[callerSym](IsMaximisedMethod);
			}
			IsMinimised() {
				return this[callerSym](IsMinimisedMethod);
			}
			Maximise() {
				return this[callerSym](MaximiseMethod);
			}
			Minimise() {
				return this[callerSym](MinimiseMethod);
			}
			Name() {
				return this[callerSym](NameMethod);
			}
			OpenDevTools() {
				return this[callerSym](OpenDevToolsMethod);
			}
			RelativePosition() {
				return this[callerSym](RelativePositionMethod);
			}
			Reload() {
				return this[callerSym](ReloadMethod);
			}
			Resizable() {
				return this[callerSym](ResizableMethod);
			}
			Restore() {
				return this[callerSym](RestoreMethod);
			}
			SetPosition(x, y) {
				return this[callerSym](SetPositionMethod, {
					x,
					y
				});
			}
			SetAlwaysOnTop(alwaysOnTop) {
				return this[callerSym](SetAlwaysOnTopMethod, { alwaysOnTop });
			}
			SetBackgroundColour(r, g, b, a) {
				return this[callerSym](SetBackgroundColourMethod, {
					r,
					g,
					b,
					a
				});
			}
			SetFrameless(frameless) {
				return this[callerSym](SetFramelessMethod, { frameless });
			}
			SetFullscreenButtonEnabled(enabled) {
				return this[callerSym](SetFullscreenButtonEnabledMethod, { enabled });
			}
			SetMaxSize(width, height) {
				return this[callerSym](SetMaxSizeMethod, {
					width,
					height
				});
			}
			SetMinSize(width, height) {
				return this[callerSym](SetMinSizeMethod, {
					width,
					height
				});
			}
			SetRelativePosition(x, y) {
				return this[callerSym](SetRelativePositionMethod, {
					x,
					y
				});
			}
			SetResizable(resizable) {
				return this[callerSym](SetResizableMethod, { resizable });
			}
			SetSize(width, height) {
				return this[callerSym](SetSizeMethod, {
					width,
					height
				});
			}
			SetTitle(title) {
				return this[callerSym](SetTitleMethod, { title });
			}
			SetZoom(zoom) {
				return this[callerSym](SetZoomMethod, { zoom });
			}
			Show() {
				return this[callerSym](ShowMethod);
			}
			Size() {
				return this[callerSym](SizeMethod);
			}
			ToggleFullscreen() {
				return this[callerSym](ToggleFullscreenMethod);
			}
			ToggleMaximise() {
				return this[callerSym](ToggleMaximiseMethod);
			}
			ToggleFrameless() {
				return this[callerSym](ToggleFramelessMethod);
			}
			UnFullscreen() {
				return this[callerSym](UnFullscreenMethod);
			}
			UnMaximise() {
				return this[callerSym](UnMaximiseMethod);
			}
			UnMinimise() {
				return this[callerSym](UnMinimiseMethod);
			}
			Width() {
				return this[callerSym](WidthMethod);
			}
			Zoom() {
				return this[callerSym](ZoomMethod);
			}
			ZoomIn() {
				return this[callerSym](ZoomInMethod);
			}
			ZoomOut() {
				return this[callerSym](ZoomOutMethod);
			}
			ZoomReset() {
				return this[callerSym](ZoomResetMethod);
			}
			HandlePlatformFileDrop(filenames, x, y) {
				var _window$_wails4;
				if (((_window$_wails4 = window._wails) === null || _window$_wails4 === void 0 || (_window$_wails4 = _window$_wails4.flags) === null || _window$_wails4 === void 0 ? void 0 : _window$_wails4.enableFileDrop) === false) return;
				const dropTarget = getDropTargetElement(document.elementFromPoint(x, y));
				if (!dropTarget) return;
				const elementDetails = {
					id: dropTarget.id,
					classList: Array.from(dropTarget.classList),
					attributes: {}
				};
				for (let i = 0; i < dropTarget.attributes.length; i++) {
					const attr = dropTarget.attributes[i];
					elementDetails.attributes[attr.name] = attr.value;
				}
				const payload = {
					filenames,
					x,
					y,
					elementDetails
				};
				this[callerSym](FilesDropped, payload);
				cleanupNativeDrag();
			}
			SetScreen(screenID) {
				return this[callerSym](SetScreenMethod, { screenID });
			}
			SnapAssist() {
				return this[callerSym](SnapAssistMethod);
			}
			Print() {
				return this[callerSym](PrintMethod);
			}
		};
		thisWindow = new Window("");
		if (typeof window !== "undefined" && typeof document !== "undefined") setupDropTargetListeners();
	})))();
}

// src/wml.ts
var wml_exports = /* @__PURE__ */ __exportAll({
	Enable: () => Enable,
	Reload: () => Reload
});
function sendEvent(eventName, data = null) {
	Emit(eventName, data);
}
function callWindowMethod(windowName, methodName) {
	const targetWindow = thisWindow.Get(windowName);
	const method = targetWindow[methodName];
	if (typeof method !== "function") {
		console.error(`Window method '${methodName}' not found`);
		return;
	}
	try {
		method.call(targetWindow);
	} catch (e) {
		console.error(`Error calling window method '${methodName}': `, e);
	}
}
function onWMLTriggered(ev) {
	const element = ev.currentTarget;
	function runEffect(choice = "Yes") {
		if (choice !== "Yes") return;
		const eventType = element.getAttribute("wml-event") || element.getAttribute("data-wml-event");
		const targetWindow = element.getAttribute("wml-target-window") || element.getAttribute("data-wml-target-window") || "";
		const windowMethod = element.getAttribute("wml-window") || element.getAttribute("data-wml-window");
		const url = element.getAttribute("wml-openurl") || element.getAttribute("data-wml-openurl");
		if (eventType !== null) sendEvent(eventType);
		if (windowMethod !== null) callWindowMethod(targetWindow, windowMethod);
		if (url !== null) OpenURL(url);
	}
	const confirm = element.getAttribute("wml-confirm") || element.getAttribute("data-wml-confirm");
	if (confirm) Question({
		Title: "Confirm",
		Message: confirm,
		Detached: false,
		Buttons: [{ Label: "Yes" }, {
			Label: "No",
			IsDefault: true
		}]
	}).then(runEffect);
	else runEffect();
}
function addWMLListeners(element) {
	const triggerRegExp = /\S+/g;
	const triggerAttr = element.getAttribute("wml-trigger") || element.getAttribute("data-wml-trigger") || "click";
	const triggers = [];
	let match;
	while ((match = triggerRegExp.exec(triggerAttr)) !== null) triggers.push(match[0]);
	const options = triggerRegistry.set(element, triggers);
	for (const trigger of triggers) element.addEventListener(trigger, onWMLTriggered, options);
}
function Enable() {
	whenReady(Reload);
}
function Reload() {
	triggerRegistry.reset();
	document.body.querySelectorAll("[wml-event], [wml-window], [wml-openurl], [data-wml-event], [data-wml-window], [data-wml-openurl]").forEach(addWMLListeners);
}
var controllerSym, triggerMapSym, elementCountSym, AbortControllerRegistry, WeakMapRegistry, triggerRegistry;
function init_wml() {
	return (init_wml = __esmMin((() => {
		init_browser();
		init_dialogs();
		init_events();
		init_utils();
		init_window();
		controllerSym = Symbol("controller");
		triggerMapSym = Symbol("triggerMap");
		elementCountSym = Symbol("elementCount");
		AbortControllerRegistry = class {
			constructor() {
				this[controllerSym] = new AbortController();
			}
			set(element, triggers) {
				return { signal: this[controllerSym].signal };
			}
			reset() {
				this[controllerSym].abort();
				this[controllerSym] = new AbortController();
			}
		};
		WeakMapRegistry = class {
			constructor() {
				this[triggerMapSym] = /* @__PURE__ */ new WeakMap();
				this[elementCountSym] = 0;
			}
			set(element, triggers) {
				if (!this[triggerMapSym].has(element)) this[elementCountSym]++;
				this[triggerMapSym].set(element, triggers);
				return {};
			}
			reset() {
				if (this[elementCountSym] <= 0) return;
				for (const element of document.body.querySelectorAll("*")) {
					if (this[elementCountSym] <= 0) break;
					const triggers = this[triggerMapSym].get(element);
					if (triggers != null) this[elementCountSym]--;
					for (const trigger of triggers || []) element.removeEventListener(trigger, onWMLTriggered);
				}
				this[triggerMapSym] = /* @__PURE__ */ new WeakMap();
				this[elementCountSym] = 0;
			}
		};
		triggerRegistry = canAbortListeners() ? new AbortControllerRegistry() : new WeakMapRegistry();
	})))();
}

// src/stream.ts
function namedPageGeneration() {
	try {
		const marker = window.name.lastIndexOf(GENERATION_NAME_MARKER);
		if (marker < 0) return 0;
		const value = Number(window.name.slice(marker + 29));
		return Number.isSafeInteger(value) && value > 0 ? value : 0;
	} catch (_unused) {
		return 0;
	}
}
function rememberNamedPageGeneration(generation) {
	try {
		const marker = window.name.lastIndexOf(GENERATION_NAME_MARKER);
		const applicationName = marker < 0 ? window.name : window.name.slice(0, marker);
		window.name = applicationName + GENERATION_NAME_MARKER + generation;
	} catch (_unused2) {}
}
function nextPageGeneration() {
	if (!hasDOM) return 1;
	const origin = typeof performance !== "undefined" && Number.isFinite(performance.timeOrigin) ? performance.timeOrigin : Date.now();
	const pageTime = Math.max(1, Math.floor(origin * 1e3));
	let current = namedPageGeneration();
	try {
		const raw = window.sessionStorage.getItem(GENERATION_KEY);
		const stored = raw === null ? 0 : Number(raw);
		if (Number.isSafeInteger(stored) && stored > current) current = stored;
	} catch (_unused3) {}
	const next = Number.isSafeInteger(current) && current >= 0 && current < Number.MAX_SAFE_INTEGER ? Math.max(current + 1, pageTime) : pageTime;
	try {
		window.sessionStorage.setItem(GENERATION_KEY, String(next));
	} catch (_unused4) {}
	rememberNamedPageGeneration(next);
	return next;
}
function streamGlobals() {
	const fresh = () => ({
		session: nanoid(),
		generation: nextPageGeneration(),
		nextConnID: 1,
		connections: /* @__PURE__ */ new Map(),
		polling: false
	});
	if (!hasDOM) return fresh();
	const w = window._wails = window._wails || {};
	return w.__stream = w.__stream || fresh();
}
function streamURL(endpoint) {
	return window.location.origin + "/wails/stream/" + endpoint;
}
function sleep(ms, signal) {
	if (!signal) return new Promise((resolve) => setTimeout(resolve, ms));
	if (signal.aborted) return Promise.reject(new StreamRequestCancelled());
	return new Promise((resolve, reject) => {
		const onAbort = () => {
			clearTimeout(timer);
			reject(new StreamRequestCancelled());
		};
		const timer = setTimeout(() => {
			signal.removeEventListener("abort", onAbort);
			resolve();
		}, ms);
		signal.addEventListener("abort", onAbort, { once: true });
	});
}
function Stream(name) {
	if (hasDOM) {
		var _window$_wails;
		const factory = (_window$_wails = window._wails) === null || _window$_wails === void 0 ? void 0 : _window$_wails.streamFactory;
		if (typeof factory === "function") return factory(name);
	}
	return new WailsSocket(name);
}
function defineHandlerProperty(target, type) {
	let current = null;
	Object.defineProperty(target, "on" + type, {
		get: () => current,
		set(fn) {
			if (current) target.removeEventListener(type, current);
			current = typeof fn === "function" ? fn : null;
			if (current) target.addEventListener(type, current);
		},
		configurable: true,
		enumerable: true
	});
}
function JSONStream(name) {
	const socket = Stream(name);
	const decoder = new TextDecoder();
	const parse = (payload) => JSON.parse(typeof payload === "string" ? payload : decoder.decode(payload));
	if (socket instanceof WailsSocket) socket._decode = (payload) => parse(payload);
	else {
		const native = socket;
		native.binaryType = "arraybuffer";
		const wrapped = /* @__PURE__ */ new WeakMap();
		const decodedEvents = /* @__PURE__ */ new WeakMap();
		const add = native.addEventListener.bind(native);
		const remove = native.removeEventListener.bind(native);
		const decodeEvent = (ev) => {
			var _decodedEvents$get;
			if (decodedEvents.has(ev)) return (_decodedEvents$get = decodedEvents.get(ev)) !== null && _decodedEvents$get !== void 0 ? _decodedEvents$get : null;
			try {
				const value = parse(ev.data);
				const decoded = new MessageEvent("message", { data: value });
				decodedEvents.set(ev, decoded);
				return decoded;
			} catch (_unused6) {
				decodedEvents.set(ev, null);
				native.dispatchEvent(new Event("error"));
				return null;
			}
		};
		const decode = (listener) => {
			const existing = wrapped.get(listener);
			if (existing) return existing;
			const fn = (ev) => {
				const decoded = decodeEvent(ev);
				if (!decoded) return;
				if (typeof listener === "function") listener.call(native, decoded);
				else listener.handleEvent(decoded);
			};
			wrapped.set(listener, fn);
			return fn;
		};
		native.addEventListener = ((type, listener, opts) => {
			add(type, type === "message" && listener ? decode(listener) : listener, opts);
		});
		native.removeEventListener = ((type, listener, opts) => {
			const fn = type === "message" && listener ? wrapped.get(listener) : void 0;
			remove(type, fn !== null && fn !== void 0 ? fn : listener, opts);
		});
		let handler = null;
		Object.defineProperty(native, "onmessage", {
			get: () => handler,
			set(fn) {
				if (handler) native.removeEventListener("message", handler);
				handler = typeof fn === "function" ? fn : null;
				if (handler) native.addEventListener("message", handler);
			},
			configurable: true,
			enumerable: true
		});
	}
	const send = socket.send.bind(socket);
	socket.send = (value) => send(JSON.stringify(value));
	return socket;
}
function toBytesSync(data) {
	if (typeof data === "string") return textEncoder.encode(data);
	if (typeof Blob !== "undefined" && data instanceof Blob) return null;
	if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
	return new Uint8Array(data).slice();
}
function abortable(promise, signal) {
	if (!signal) return promise;
	if (signal.aborted) return Promise.reject(new StreamRequestCancelled());
	return new Promise((resolve, reject) => {
		const onAbort = () => reject(new StreamRequestCancelled());
		signal.addEventListener("abort", onAbort, { once: true });
		promise.then((value) => {
			signal.removeEventListener("abort", onAbort);
			resolve(value);
		}, (err) => {
			signal.removeEventListener("abort", onAbort);
			reject(err);
		});
	});
}
async function toBytes(data, signal) {
	if (typeof data === "string") return textEncoder.encode(data);
	if (typeof Blob !== "undefined" && data instanceof Blob) return new Uint8Array(await abortable(data.arrayBuffer(), signal));
	if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
	return new Uint8Array(data).slice();
}
async function postFrame(connID, kind, body, name, signal) {
	const headers = {
		[HDR_SESSION]: G.session,
		[HDR_GENERATION]: String(G.generation),
		[HDR_CONN]: String(connID),
		[HDR_KIND]: String(kind),
		"Content-Type": "application/octet-stream"
	};
	if (name !== void 0) headers[HDR_NAME] = name;
	if (body.byteLength <= CHUNK_THRESHOLD) {
		await postWithRetry(headers, body, signal);
		return;
	}
	const chunkID = nanoid();
	const total = Math.ceil(body.byteLength / CHUNK_THRESHOLD);
	for (let i = 0; i < total; i++) {
		const slice = body.subarray(i * CHUNK_THRESHOLD, (i + 1) * CHUNK_THRESHOLD);
		await postWithRetry(_objectSpread2(_objectSpread2({}, headers), {}, {
			[HDR_CHUNK]: chunkID,
			[HDR_CHUNK_INDEX]: String(i),
			[HDR_CHUNK_TOTAL]: String(total)
		}), slice, signal);
	}
}
async function postWithRetry(headers, body, signal) {
	let wait = 1;
	for (;;) {
		if (signal === null || signal === void 0 ? void 0 : signal.aborted) throw new StreamRequestCancelled();
		const resp = await fetch(streamURL("send"), {
			method: "POST",
			headers,
			body,
			signal
		});
		if (resp.ok) return;
		if (resp.status !== 429) throw new Error(await resp.text());
		await sleep(wait, signal);
		wait = Math.min(wait * 2, 50);
	}
}
async function postBatch(connID, frames, signal) {
	let start = 0;
	while (start < frames.length) {
		if (frames[start].byteLength > CHUNK_THRESHOLD) {
			await postFrame(connID, KIND_DATA, frames[start], void 0, signal);
			start++;
			continue;
		}
		let end = start;
		let size = 4;
		while (end < frames.length && end - start < MAX_BATCH_FRAMES) {
			const frame = frames[end];
			if (frame.byteLength > CHUNK_THRESHOLD || size + 4 + frame.byteLength > CHUNK_THRESHOLD) break;
			size += 4 + frame.byteLength;
			end++;
		}
		if (end === start) {
			await postFrame(connID, KIND_DATA, frames[start], void 0, signal);
			start++;
			continue;
		}
		const group = frames.slice(start, end);
		if (group.length === 1) await postFrame(connID, KIND_DATA, group[0], void 0, signal);
		else await postBatchGroup(connID, group, signal);
		start = end;
	}
}
async function postBatchGroup(connID, frames, signal) {
	if (frames.length === 0 || frames.length > MAX_BATCH_FRAMES) throw new Error("invalid stream batch size");
	let body = buildBatch(frames);
	let sent = 0;
	let wait = 1;
	for (;;) {
		var _resp$headers$get;
		if (signal === null || signal === void 0 ? void 0 : signal.aborted) throw new StreamRequestCancelled();
		const resp = await fetch(streamURL("send"), {
			method: "POST",
			headers: {
				[HDR_SESSION]: G.session,
				[HDR_GENERATION]: String(G.generation),
				[HDR_CONN]: String(connID),
				[HDR_KIND]: String(KIND_DATA),
				[HDR_BATCH]: String(frames.length - sent),
				"Content-Type": "application/octet-stream"
			},
			body,
			signal
		});
		if (resp.ok) return;
		if (resp.status !== 429) throw new Error(await resp.text());
		const accepted = Number((_resp$headers$get = resp.headers.get(HDR_BATCH)) !== null && _resp$headers$get !== void 0 ? _resp$headers$get : 0);
		const remaining = frames.length - sent;
		if (!Number.isInteger(accepted) || accepted < 0 || accepted >= remaining) {
			if (accepted !== 0) throw new Error("invalid stream batch acknowledgement");
		}
		sent += accepted;
		body = buildBatch(frames.slice(sent));
		await sleep(wait, signal);
		wait = Math.min(wait * 2, 50);
	}
}
function buildBatch(frames) {
	let size = 4;
	for (const f of frames) size += 4 + f.byteLength;
	const out = new Uint8Array(size);
	const view = new DataView(out.buffer);
	view.setUint32(0, frames.length);
	let off = 4;
	for (const f of frames) {
		view.setUint32(off, f.byteLength);
		off += 4;
		out.set(f, off);
		off += f.byteLength;
	}
	return out;
}
function startPolling() {
	if (G.polling || !hasDOM) return;
	G.polling = true;
	pollLoop();
}
async function pollLoop() {
	let backoff = 0;
	const abort = new AbortController();
	G.pollAbort = abort;
	while (G.connections.size > 0) try {
		const resp = await fetch(streamURL("poll"), {
			method: "GET",
			headers: {
				[HDR_SESSION]: G.session,
				[HDR_GENERATION]: String(G.generation)
			},
			cache: "no-store",
			signal: abort.signal
		});
		if (resp.status === 410) {
			closeAll(1001, "session closed");
			break;
		}
		if (!resp.ok && resp.status !== 204) {
			if (!isRetryablePollStatus(resp.status)) {
				failAll("stream poll failed: " + resp.status);
				break;
			}
			throw new Error("retryable stream poll failure: " + resp.status);
		}
		backoff = 0;
		if (resp.status !== 204) {
			let buf;
			try {
				buf = await resp.arrayBuffer();
			} catch (_unused7) {
				failAll("stream poll response body failed");
				break;
			}
			const frames = decodeFrames(buf);
			if (frames === null) {
				closeAll(1002, "unrecognised stream framing");
				break;
			}
			deliver(frames);
		}
	} catch (err) {
		if (abort.signal.aborted || G.connections.size === 0) break;
		backoff = backoff ? Math.min(backoff * 2, BACKOFF_MAX) : BACKOFF_MIN;
		try {
			await sleep(backoff, abort.signal);
		} catch (_unused8) {
			break;
		}
	}
	if (G.pollAbort === abort) G.pollAbort = void 0;
	G.polling = false;
	if (G.connections.size > 0) startPolling();
}
function isRetryablePollStatus(status) {
	return status === 408 || status === 425 || status === 429 || status >= 500 && status <= 599;
}
function decodeFrames(buf) {
	if (buf.byteLength < 9) return null;
	const dv = new DataView(buf);
	if (dv.getUint8(0) !== 87 || dv.getUint8(1) !== 83 || dv.getUint8(2) !== 49 || dv.getUint8(3) !== 0 || (dv.getUint8(4) & -2) !== 0) return null;
	const count = dv.getUint32(5);
	const frames = [];
	let off = 9;
	for (let i = 0; i < count; i++) {
		if (off + 9 > buf.byteLength) return null;
		const connID = dv.getUint32(off);
		off += 4;
		const kind = dv.getUint8(off);
		off += 1;
		const len = dv.getUint32(off);
		off += 4;
		if (kind > KIND_ERROR || len > buf.byteLength - off) return null;
		const payload = buf.slice(off, off + len);
		off += len;
		frames.push({
			connID,
			kind,
			payload
		});
	}
	return off === buf.byteLength ? frames : null;
}
function deliver(frames) {
	for (const frame of frames) {
		const connID = frame.connID;
		const kind = frame.kind;
		const payload = frame.payload;
		const conn = G.connections.get(connID);
		if (!conn) continue;
		switch (kind) {
			case KIND_DATA:
				conn._message(payload);
				break;
			case KIND_OPEN:
				conn._opened();
				break;
			case KIND_CLOSE:
				conn._closed(1e3, "", true);
				break;
			case KIND_ERROR: conn._fail(new Error(new TextDecoder().decode(payload)));
		}
	}
}
function closeAll(code, reason) {
	for (const conn of [...G.connections.values()]) conn._closed(code, reason, false);
}
function failAll(reason) {
	for (const conn of [...G.connections.values()]) conn._fail(new Error(reason));
}
var _WailsSocket, GENERATION_KEY, GENERATION_NAME_MARKER, G, HDR_SESSION, HDR_GENERATION, HDR_CONN, HDR_KIND, HDR_NAME, HDR_CHUNK, HDR_CHUNK_INDEX, HDR_CHUNK_TOTAL, HDR_BATCH, KIND_DATA, KIND_OPEN, KIND_CLOSE, KIND_ERROR, CHUNK_THRESHOLD, MAX_BATCH_FRAMES, BACKOFF_MIN, BACKOFF_MAX, textEncoder, StreamRequestCancelled, WailsSocket;
function init_stream() {
	return (init_stream = __esmMin((() => {
		init_nanoid();
		init_environment();
		init_objectSpread2();
		;
		GENERATION_KEY = "__wails_stream_generation";
		GENERATION_NAME_MARKER = "__wails_stream_generation__:";
		G = streamGlobals();
		HDR_SESSION = "x-wails-stream-session";
		HDR_GENERATION = "x-wails-stream-generation";
		HDR_CONN = "x-wails-stream-conn";
		HDR_KIND = "x-wails-stream-kind";
		HDR_NAME = "x-wails-stream-name";
		HDR_CHUNK = "x-wails-stream-chunk";
		HDR_CHUNK_INDEX = "x-wails-stream-chunk-index";
		HDR_CHUNK_TOTAL = "x-wails-stream-chunk-total";
		HDR_BATCH = "x-wails-stream-batch";
		KIND_DATA = 0;
		KIND_OPEN = 1;
		KIND_CLOSE = 2;
		KIND_ERROR = 3;
		CHUNK_THRESHOLD = 524288;
		MAX_BATCH_FRAMES = 4096;
		BACKOFF_MIN = 250;
		BACKOFF_MAX = 5e3;
		textEncoder = new TextEncoder();
		StreamRequestCancelled = class extends Error {
			constructor() {
				super("stream request cancelled");
				this.name = "AbortError";
			}
		};
		WailsSocket = class WailsSocket extends EventTarget {
			get bufferedAmount() {
				return this._buffered;
			}
			constructor(name) {
				super();
				this.CONNECTING = 0;
				this.OPEN = 1;
				this.CLOSING = 2;
				this.CLOSED = 3;
				this.protocol = "";
				this.extensions = "";
				this.binaryType = "arraybuffer";
				this.readyState = WailsSocket.CONNECTING;
				this.onopen = null;
				this.onmessage = null;
				this.onclose = null;
				this.onerror = null;
				this._decode = (payload) => payload;
				this._buffered = 0;
				this._chain = Promise.resolve();
				this._pending = [];
				this._flushing = false;
				this._openAbort = new AbortController();
				this._sendAbort = new AbortController();
				this.name = name;
				this._id = G.nextConnID++;
				this.url = hasDOM ? streamURL("poll") + "#" + encodeURIComponent(name) : "";
				for (const type of [
					"open",
					"message",
					"close",
					"error"
				]) defineHandlerProperty(this, type);
				G.connections.set(this._id, this);
				this._chain = this._chain.then(() => postFrame(this._id, KIND_OPEN, /* @__PURE__ */ new Uint8Array(0), name, this._openAbort.signal)).catch((err) => {
					this._fail(err);
				});
				startPolling();
			}
			send(data) {
				if (this.readyState === WailsSocket.CONNECTING) throw new DOMException("Still in CONNECTING state.", "InvalidStateError");
				if (this.readyState !== WailsSocket.OPEN) return;
				const immediate = toBytesSync(data);
				const snapshot = immediate ? Promise.resolve(immediate) : toBytes(data, this._sendAbort.signal);
				snapshot.catch(() => {});
				const blobSize = !immediate && typeof Blob !== "undefined" && data instanceof Blob ? data.size : 0;
				if (blobSize) this._buffered += blobSize;
				if (immediate) this._buffered += immediate.byteLength;
				this._pending.push(snapshot);
				if (this._flushing) return;
				this._flushing = true;
				this._chain = this._chain.then(async () => {
					try {
						while (this._pending.length > 0) {
							const queued = this._pending.splice(0, MAX_BATCH_FRAMES);
							const batch = await Promise.all(queued);
							if (this.readyState === WailsSocket.CLOSED) break;
							const total = batch.reduce((n, b) => n + b.byteLength, 0);
							try {
								await postBatch(this._id, batch, this._sendAbort.signal);
							} finally {
								this._buffered = Math.max(0, this._buffered - total);
							}
						}
					} finally {
						this._flushing = false;
					}
				}).catch((err) => {
					this._flushing = false;
					this._fail(err);
				});
			}
			close(code = 1e3, reason = "") {
				if (this.readyState === WailsSocket.CLOSING || this.readyState === WailsSocket.CLOSED) return;
				this.readyState = WailsSocket.CLOSING;
				this._pending.length = 0;
				this._buffered = 0;
				this._openAbort.abort();
				this._sendAbort.abort();
				this._chain = this._chain.then(() => postFrame(this._id, KIND_CLOSE, /* @__PURE__ */ new Uint8Array(0))).catch(() => {}).then(() => {
					this._closed(code, reason, true);
				});
			}
			_opened() {
				if (this.readyState !== WailsSocket.CONNECTING) return;
				this.readyState = WailsSocket.OPEN;
				this.dispatchEvent(new Event("open"));
			}
			_message(payload) {
				if (this.readyState !== WailsSocket.OPEN) return;
				let data;
				try {
					data = this._decode(payload);
				} catch (_unused5) {
					this.dispatchEvent(new Event("error"));
					return;
				}
				if (data === payload && this.binaryType === "blob") data = new Blob([payload]);
				this.dispatchEvent(new MessageEvent("message", { data }));
			}
			_fail(err) {
				if (this.readyState === WailsSocket.CLOSED || this.readyState === WailsSocket.CLOSING) return;
				this.dispatchEvent(new Event("error"));
				this._closed(1006, err instanceof Error ? err.message : String(err), false);
			}
			_closed(code, reason, wasClean) {
				var _G$pollAbort;
				if (this.readyState === WailsSocket.CLOSED) return;
				this.readyState = WailsSocket.CLOSED;
				this._openAbort.abort();
				this._sendAbort.abort();
				G.connections.delete(this._id);
				if (G.connections.size === 0) (_G$pollAbort = G.pollAbort) === null || _G$pollAbort === void 0 || _G$pollAbort.abort();
				this._pending.length = 0;
				this._buffered = 0;
				const ev = typeof CloseEvent === "function" ? new CloseEvent("close", {
					code,
					reason,
					wasClean
				}) : Object.assign(new Event("close"), {
					code,
					reason,
					wasClean
				});
				this.dispatchEvent(ev);
			}
		};
		_WailsSocket = WailsSocket;
		_WailsSocket.CONNECTING = 0;
		_WailsSocket.OPEN = 1;
		_WailsSocket.CLOSING = 2;
		_WailsSocket.CLOSED = 3;
	})))();
}

// ../../compiled/main.js
function init_main() {
	return (init_main = __esmMin((() => {
		init_src();
		init_wml();
		init_utils();
		window.wails = src_exports;
		Enable();
		debugLog("Wails Runtime Loaded");
	})))();
}

// src/index.ts
var src_exports = /* @__PURE__ */ __exportAll({
	Android: () => android_exports,
	Application: () => application_exports,
	Browser: () => browser_exports,
	Call: () => calls_exports,
	CancelError: () => CancelError,
	CancellablePromise: () => CancellablePromise,
	CancelledRejectionError: () => CancelledRejectionError,
	Clipboard: () => clipboard_exports,
	Create: () => create_exports,
	Dialogs: () => dialogs_exports,
	Events: () => events_exports,
	Flags: () => flags_exports,
	IOS: () => ios_exports,
	JSONStream: () => JSONStream,
	Screens: () => screens_exports,
	Stream: () => Stream,
	System: () => system_exports,
	Updater: () => updater_exports,
	WML: () => wml_exports,
	WailsSocket: () => WailsSocket,
	Window: () => thisWindow,
	clientId: () => clientId,
	getTransport: () => getTransport,
	loadOptionalScript: () => loadOptionalScript,
	objectNames: () => objectNames,
	setTransport: () => setTransport
});
function loadOptionalScript(url) {
	return fetch(url, { method: "HEAD" }).then((response) => {
		if (response.ok) {
			if ((response.headers.get("content-type") || "").toLowerCase().includes("javascript")) {
				const script = document.createElement("script");
				script.src = url;
				document.head.appendChild(script);
			}
		}
	}).catch(() => {});
}
function init_src() {
	return (init_src = __esmMin((() => {
		init_environment();
		init_contextmenu();
		init_drag();
		init_appregion();
		init_application();
		init_browser();
		init_calls();
		init_clipboard();
		init_create();
		init_dialogs();
		init_events();
		/* @__PURE__ */ init_flags();
		init_screens();
		init_system();
		init_ios();
		init_android();
		init_updater();
		init_window();
		init_wml();
		init_stream();
		init_cancellable();
		init_runtime();
		init_main();
		if (hasDOM) window._wails = window._wails || {};
		if (hasDOM) {
			window._wails.invoke = invoke;
			window._wails.clientId = clientId;
		}
		if (hasDOM) window._wails.handlePlatformFileDrop = thisWindow.HandlePlatformFileDrop.bind(thisWindow);
		if (hasDOM) {
			window._wails.handleDragEnter = handleDragEnter;
			window._wails.handleDragLeave = handleDragLeave;
			window._wails.handleDragOver = handleDragOver;
		}
		if (hasDOM) invoke("wails:runtime:ready");
		if (hasDOM) loadOptionalScript("/wails/custom.js");
	})))();
}

init_src();
export { android_exports as Android, application_exports as Application, browser_exports as Browser, calls_exports as Call, CancelError, CancellablePromise, CancelledRejectionError, clipboard_exports as Clipboard, create_exports as Create, dialogs_exports as Dialogs, events_exports as Events, flags_exports as Flags, ios_exports as IOS, JSONStream, screens_exports as Screens, Stream, system_exports as System, updater_exports as Updater, wml_exports as WML, WailsSocket, thisWindow as Window, clientId, getTransport, loadOptionalScript, objectNames, setTransport };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5kZWJ1Zy5qcyIsIm5hbWVzIjpbIkNIVU5LX1RIUkVTSE9MRCIsImNhbGwiLCJjYWxsIiwiY2FsbCIsIkhpZGVNZXRob2QiLCJTaG93TWV0aG9kIiwiY2FsbCIsImlzQ2FsbGFibGUiLCJjYWxsIiwiY2FsbCIsIkFycmF5IiwiTWFwIiwiRXZlbnRzIiwiY2FsbCIsIkVycm9yIiwiQ3JlYXRlIiwiY2FsbCIsImNhbGwiLCJjYWxsIiwiRGV2aWNlSW5mbyIsIkhhcHRpY3MiLCJEZXZpY2UiLCJXaW5kb3ciLCJSdW50aW1lIiwiU3lzdGVtLmludm9rZSIsIldpbmRvdyJdLCJzb3VyY2VzIjpbIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9lbnZpcm9ubWVudC50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9uYW5vaWQudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvcnVudGltZS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9zeXN0ZW0udHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvdXRpbHMudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvY29udGV4dG1lbnUudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvZmxhZ3MudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvZHJhZy50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9hcHByZWdpb24udHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvYXBwbGljYXRpb24udHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvYnJvd3Nlci50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9jYWxsYWJsZS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9jYW5jZWxsYWJsZS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9jYWxscy50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy9jbGlwYm9hcmQudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvY3JlYXRlLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2RpYWxvZ3MudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvbGlzdGVuZXIudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvZXZlbnRfdHlwZXMudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvZXZlbnRzLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL3NjcmVlbnMudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvaW9zLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2FuZHJvaWQudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvdXBkYXRlci50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9Ad2FpbHNpby9ydW50aW1lL3NyYy93aW5kb3cudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQHdhaWxzaW8vcnVudGltZS9zcmMvd21sLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL3N0cmVhbS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9jb21waWxlZC9tYWluLmpzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0B3YWlsc2lvL3J1bnRpbWUvc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gXyAgICAgX18gICAgIF8gX19cbnwgfCAgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIGluc2lkZSBhIGJyb3dzZXIvd2VidmlldyB3aXRoIGEgRE9NIGF2YWlsYWJsZS5cbiAqIEZhbHNlIHVuZGVyIHNlcnZlci1zaWRlIHJlbmRlcmluZyAoZS5nLiBgbmV4dCBidWlsZGAgcHJlcmVuZGVyaW5nKSxcbiAqIHdoZXJlIGFwcGxpY2F0aW9uIGNvZGUgbWF5IGltcG9ydCB0aGUgcnVudGltZSBtb2R1bGUgZXZlbiB0aG91Z2ggbm9cbiAqIFdhaWxzIEFQSXMgY2FuIGFjdHVhbGx5IGJlIHVzZWQgKCM0Njc5KS4gTW9kdWxlcyBtdXN0IG5vdCB0b3VjaFxuICogYHdpbmRvd2AvYGRvY3VtZW50YCBhdCBpbXBvcnQgdGltZSBleGNlcHQgYmVoaW5kIHRoaXMgZ3VhcmQuXG4gKi9cbmV4cG9ydCBjb25zdCBoYXNET00gPSB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gXCJ1bmRlZmluZWRcIjtcbiIsIi8vIFNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL2FpL25hbm9pZFxuXG4vLyBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbi8vXG4vLyBDb3B5cmlnaHQgMjAxNyBBbmRyZXkgU2l0bmlrIDxhbmRyZXlAc2l0bmlrLnJ1PlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2Zcbi8vIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW5cbi8vIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG9cbi8vIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mXG4vLyB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sXG4vLyAgICAgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuLy8gY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyAgICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1Ncbi8vIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUlxuLy8gQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSXG4vLyBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTlxuLy8gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gVGhpcyBhbHBoYWJldCB1c2VzIGBBLVphLXowLTlfLWAgc3ltYm9scy5cbi8vIFRoZSBvcmRlciBvZiBjaGFyYWN0ZXJzIGlzIG9wdGltaXplZCBmb3IgYmV0dGVyIGd6aXAgYW5kIGJyb3RsaSBjb21wcmVzc2lvbi5cbi8vIFJlZmVyZW5jZXMgdG8gdGhlIHNhbWUgZmlsZSAod29ya3MgYm90aCBmb3IgZ3ppcCBhbmQgYnJvdGxpKTpcbi8vIGAndXNlYCwgYGFuZG9tYCwgYW5kIGByaWN0J2Bcbi8vIFJlZmVyZW5jZXMgdG8gdGhlIGJyb3RsaSBkZWZhdWx0IGRpY3Rpb25hcnk6XG4vLyBgLTI2VGAsIGAxOTgzYCwgYDQwcHhgLCBgNzVweGAsIGBidXNoYCwgYGphY2tgLCBgbWluZGAsIGB2ZXJ5YCwgYW5kIGB3b2xmYFxuY29uc3QgdXJsQWxwaGFiZXQgPVxuICAgICd1c2VhbmRvbS0yNlQxOTgzNDBQWDc1cHhKQUNLVkVSWU1JTkRCVVNIV09MRl9HUVpiZmdoamtscXZ3eXpyaWN0J1xuXG4vLyBNT0RJRklFRCBGT1IgV0FJTFM6IHRoZSB1cHN0cmVhbSBpbXBsZW1lbnRhdGlvbiBkcmF3cyBmcm9tIE1hdGgucmFuZG9tKCksXG4vLyB3aGljaCBpcyBub3QgYSBjcnlwdG9ncmFwaGljIHNvdXJjZS4gVGhlc2UgaWRzIGFyZSB1c2VkIGZvciB0aGUgcnVudGltZVxuLy8gY2xpZW50IGlkLCBiaW5kaW5nIGNhbGwgaWRzLCBjaHVuayBpZHMsIGFuZCBkZXNrdG9wIHN0cmVhbSBzZXNzaW9uIGlkcy4gVGhleVxuLy8gYXJlIGNvcnJlbGF0aW9uIGlkZW50aWZpZXJzIHJhdGhlciB0aGFuIGF1dGhlbnRpY2F0aW9uIGNhcGFiaWxpdGllcywgYnV0IGFcbi8vIHN0cm9uZ2VyIHNvdXJjZSBtYWtlcyBhY2NpZGVudGFsIGNvbGxpc2lvbnMgbmVnbGlnaWJsZSBldmVuIGFjcm9zcyBtYW55XG4vLyBjb25jdXJyZW50bHkgbG9hZGVkIHJ1bnRpbWVzLiBUaGUgYWxwaGFiZXQgaXMgNjQgY2hhcmFjdGVycywgc28gbWFza2luZyBhXG4vLyByYW5kb20gYnl0ZSB3aXRoIDYzIGlzIHVuaWZvcm0g4oCUIG5vIHJlamVjdGlvbiBzYW1wbGluZyBuZWVkZWQuXG5leHBvcnQgZnVuY3Rpb24gbmFub2lkKHNpemU6IG51bWJlciA9IDIxKTogc3RyaW5nIHtcbiAgICBjb25zdCBzb3VyY2UgPSB0eXBlb2YgY3J5cHRvICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgPyBjcnlwdG9cbiAgICAgICAgOiBudWxsO1xuXG4gICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KHNpemUpO1xuICAgICAgICBzb3VyY2UuZ2V0UmFuZG9tVmFsdWVzKGJ5dGVzKTtcbiAgICAgICAgbGV0IGlkID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgICBpZCArPSB1cmxBbHBoYWJldFtieXRlc1tpXSAmIDYzXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfVxuXG4gICAgLy8gRmFsbGJhY2sgZm9yIGVudmlyb25tZW50cyB3aXRob3V0IFdlYiBDcnlwdG8gKHZlcnkgb2xkIGVuZ2luZXMsIHNvbWVcbiAgICAvLyBzZXJ2ZXItc2lkZSByZW5kZXJpbmcgY29udGV4dHMpLiBJZHMgcmVtYWluIHVuaXF1ZSBidXQgbm90IHVuZ3Vlc3NhYmxlLlxuICAgIGxldCBpZCA9ICcnO1xuICAgIGxldCBpID0gc2l6ZSB8IDA7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBpZCArPSB1cmxBbHBoYWJldFsoTWF0aC5yYW5kb20oKSAqIDY0KSB8IDBdO1xuICAgIH1cbiAgICByZXR1cm4gaWQ7XG59XG4iLCIvKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHsgbmFub2lkIH0gZnJvbSBcIi4vbmFub2lkLmpzXCI7XG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xuXG4vLyBSZXNvbHZlZCBsYXppbHk6IHdpbmRvdyBkb2VzIG5vdCBleGlzdCB3aGVuIHRoZSBtb2R1bGUgaXMgaW1wb3J0ZWQgZHVyaW5nXG4vLyBzZXJ2ZXItc2lkZSByZW5kZXJpbmcgKCM0Njc5KSwgYW5kIG5vdGhpbmcgY2FuIGNhbGwgdGhlIHJ1bnRpbWUgdGhlcmUuXG5mdW5jdGlvbiBydW50aW1lVVJMKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyBcIi93YWlscy9ydW50aW1lXCI7XG59XG5cbi8vIFN0YXkgdW5kZXIgV2ViVmlldzIncyB+Mk1CIHJlcXVlc3QgYm9keSBidWZmZXJpbmcgbGltaXQgaW4gV2ViUmVzb3VyY2VSZXF1ZXN0ZWQuXG5jb25zdCBDSFVOS19USFJFU0hPTEQgPSA1MTIgKiAxMDI0O1xuXG4vLyBSZS1leHBvcnQgbmFub2lkIGZvciBjdXN0b20gdHJhbnNwb3J0IGltcGxlbWVudGF0aW9uc1xuZXhwb3J0IHsgbmFub2lkIH07XG5cbnR5cGUgQ2FsbEVycm9yVHlwZSA9IHtcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgY2F1c2U/OiB1bmtub3duLFxuICAgIGtpbmQ6IFwiUmVmZXJlbmNlRXJyb3JcIiB8IFwiVHlwZUVycm9yXCIgfCBcIlJ1bnRpbWVFcnJvclwiXG59XG5cbi8qKlxuICogRXhjZXB0aW9uIGNsYXNzIHRoYXQgd2lsbCBiZSB0aHJvd24gaW4gY2FzZSB0aGUgYm91bmQgbWV0aG9kIHJldHVybnMgYW4gZXJyb3IuXG4gKiBUaGUgdmFsdWUgb2YgdGhlIHtAbGluayBSdW50aW1lRXJyb3IjbmFtZX0gcHJvcGVydHkgaXMgXCJSdW50aW1lRXJyb3JcIi5cbiAqL1xuZXhwb3J0IGNsYXNzIFJ1bnRpbWVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IFJ1bnRpbWVFcnJvciBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyB0byBiZSBmb3J3YXJkZWQgdG8gdGhlIEVycm9yIGNvbnN0cnVjdG9yLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIG9wdGlvbnM/OiBFcnJvck9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMubmFtZSA9IFwiUnVudGltZUVycm9yXCI7XG4gICAgfVxufVxuXG4vLyBPYmplY3QgTmFtZXNcbmV4cG9ydCBjb25zdCBvYmplY3ROYW1lcyA9IE9iamVjdC5mcmVlemUoe1xuICAgIENhbGw6IDAsXG4gICAgQ2xpcGJvYXJkOiAxLFxuICAgIEFwcGxpY2F0aW9uOiAyLFxuICAgIEV2ZW50czogMyxcbiAgICBDb250ZXh0TWVudTogNCxcbiAgICBEaWFsb2c6IDUsXG4gICAgV2luZG93OiA2LFxuICAgIFNjcmVlbnM6IDcsXG4gICAgU3lzdGVtOiA4LFxuICAgIEJyb3dzZXI6IDksXG4gICAgQ2FuY2VsQ2FsbDogMTAsXG4gICAgSU9TOiAxMSxcbiAgICBBbmRyb2lkOiAxMixcbn0pO1xuZXhwb3J0IGxldCBjbGllbnRJZCA9IG5hbm9pZCgpO1xuXG4vKipcbiAqIFJ1bnRpbWVUcmFuc3BvcnQgZGVmaW5lcyB0aGUgaW50ZXJmYWNlIGZvciBjdXN0b20gSVBDIHRyYW5zcG9ydCBpbXBsZW1lbnRhdGlvbnMuXG4gKiBJbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgdG8gdXNlIFdlYlNvY2tldHMsIGN1c3RvbSBwcm90b2NvbHMsIG9yIGFueSBvdGhlclxuICogdHJhbnNwb3J0IG1lY2hhbmlzbSBpbnN0ZWFkIG9mIHRoZSBkZWZhdWx0IEhUVFAgZmV0Y2guXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUnVudGltZVRyYW5zcG9ydCB7XG4gICAgLyoqXG4gICAgICogU2VuZCBhIHJ1bnRpbWUgY2FsbCBhbmQgcmV0dXJuIHRoZSByZXNwb25zZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvYmplY3RJRCAtIFRoZSBXYWlscyBvYmplY3QgSUQgKDA9Q2FsbCwgMT1DbGlwYm9hcmQsIGV0Yy4pXG4gICAgICogQHBhcmFtIG1ldGhvZCAtIFRoZSBtZXRob2QgSUQgdG8gY2FsbFxuICAgICAqIEBwYXJhbSB3aW5kb3dOYW1lIC0gT3B0aW9uYWwgd2luZG93IG5hbWVcbiAgICAgKiBAcGFyYW0gYXJncyAtIEFyZ3VtZW50cyB0byBwYXNzICh3aWxsIGJlIEpTT04gc3RyaW5naWZpZWQgaWYgcHJlc2VudClcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcmVzcG9uc2UgZGF0YVxuICAgICAqL1xuICAgIGNhbGwob2JqZWN0SUQ6IG51bWJlciwgbWV0aG9kOiBudW1iZXIsIHdpbmRvd05hbWU6IHN0cmluZywgYXJnczogYW55KTogUHJvbWlzZTxhbnk+O1xufVxuXG4vKipcbiAqIEN1c3RvbSB0cmFuc3BvcnQgaW1wbGVtZW50YXRpb24gKGNhbiBiZSBzZXQgYnkgdXNlcilcbiAqL1xubGV0IGN1c3RvbVRyYW5zcG9ydDogUnVudGltZVRyYW5zcG9ydCB8IG51bGwgPSBudWxsO1xuXG4vKipcbiAqIFNldCBhIGN1c3RvbSB0cmFuc3BvcnQgZm9yIGFsbCBXYWlscyBydW50aW1lIGNhbGxzLlxuICogVGhpcyBhbGxvd3MgeW91IHRvIHJlcGxhY2UgdGhlIGRlZmF1bHQgSFRUUCBmZXRjaCB0cmFuc3BvcnQgd2l0aFxuICogV2ViU29ja2V0cywgY3VzdG9tIHByb3RvY29scywgb3IgYW55IG90aGVyIG1lY2hhbmlzbS5cbiAqXG4gKiBAcGFyYW0gdHJhbnNwb3J0IC0gWW91ciBjdXN0b20gdHJhbnNwb3J0IGltcGxlbWVudGF0aW9uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IHNldFRyYW5zcG9ydCB9IGZyb20gJy93YWlscy9ydW50aW1lLmpzJztcbiAqXG4gKiBjb25zdCB3c1RyYW5zcG9ydCA9IHtcbiAqICAgY2FsbDogYXN5bmMgKG9iamVjdElELCBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpID0+IHtcbiAqICAgICAvLyBZb3VyIFdlYlNvY2tldCBpbXBsZW1lbnRhdGlvblxuICogICB9XG4gKiB9O1xuICpcbiAqIHNldFRyYW5zcG9ydCh3c1RyYW5zcG9ydCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFRyYW5zcG9ydCh0cmFuc3BvcnQ6IFJ1bnRpbWVUcmFuc3BvcnQgfCBudWxsKTogdm9pZCB7XG4gICAgY3VzdG9tVHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xufVxuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCB0cmFuc3BvcnQgKHVzZWZ1bCBmb3IgZXh0ZW5kaW5nL3dyYXBwaW5nKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNwb3J0KCk6IFJ1bnRpbWVUcmFuc3BvcnQgfCBudWxsIHtcbiAgICByZXR1cm4gY3VzdG9tVHJhbnNwb3J0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcnVudGltZSBjYWxsZXIgd2l0aCBzcGVjaWZpZWQgSUQuXG4gKlxuICogQHBhcmFtIG9iamVjdCAtIFRoZSBvYmplY3QgdG8gaW52b2tlIHRoZSBtZXRob2Qgb24uXG4gKiBAcGFyYW0gd2luZG93TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJuIFRoZSBuZXcgcnVudGltZSBjYWxsZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdDogbnVtYmVyLCB3aW5kb3dOYW1lOiBzdHJpbmcgPSAnJykge1xuICAgIHJldHVybiBmdW5jdGlvbiAobWV0aG9kOiBudW1iZXIsIGFyZ3M6IGFueSA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHJ1bnRpbWVDYWxsV2l0aElEKG9iamVjdCwgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKTtcbiAgICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBydW50aW1lQ2FsbFdpdGhJRChvYmplY3RJRDogbnVtYmVyLCBtZXRob2Q6IG51bWJlciwgd2luZG93TmFtZTogc3RyaW5nLCBhcmdzOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIFVzZSBjdXN0b20gdHJhbnNwb3J0IGlmIGF2YWlsYWJsZVxuICAgIGlmIChjdXN0b21UcmFuc3BvcnQpIHtcbiAgICAgICAgcmV0dXJuIGN1c3RvbVRyYW5zcG9ydC5jYWxsKG9iamVjdElELCBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpO1xuICAgIH1cblxuICAgIC8vIERlZmF1bHQgSFRUUCBmZXRjaCB0cmFuc3BvcnRcbiAgICBsZXQgdXJsID0gbmV3IFVSTChydW50aW1lVVJMKCkpO1xuXG4gICAgbGV0IGJvZHk6IHsgb2JqZWN0OiBudW1iZXI7IG1ldGhvZDogbnVtYmVyLCBhcmdzPzogYW55IH0gPSB7XG4gICAgICBvYmplY3Q6IG9iamVjdElELFxuICAgICAgbWV0aG9kXG4gICAgfVxuICAgIGlmIChhcmdzICE9PSBudWxsICYmIGFyZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYm9keS5hcmdzID0gYXJncztcbiAgICB9XG5cbiAgICBsZXQgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgW1wieC13YWlscy1jbGllbnQtaWRcIl06IGNsaWVudElkLFxuICAgICAgICBbXCJDb250ZW50LVR5cGVcIl06IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgfVxuICAgIGlmICh3aW5kb3dOYW1lKSB7XG4gICAgICAgIGhlYWRlcnNbXCJ4LXdhaWxzLXdpbmRvdy1uYW1lXCJdID0gd2luZG93TmFtZTtcbiAgICB9XG5cbiAgICBjb25zdCBib2R5U3RyID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XG4gICAgbGV0IHJlc3BvbnNlOiBSZXNwb25zZTtcbiAgICBpZiAoYm9keVN0ci5sZW5ndGggPiBDSFVOS19USFJFU0hPTEQpIHtcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBzZW5kQ2h1bmtlZCh1cmwsIGhlYWRlcnMsIGJvZHlTdHIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IG1ldGhvZDogJ1BPU1QnLCBoZWFkZXJzLCBib2R5OiBib2R5U3RyIH0pO1xuICAgIH1cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICBjb25zdCBjdCA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpO1xuICAgICAgaWYgKGN0Py5pbmNsdWRlcyhcImFwcGxpY2F0aW9uL2pzb25cIikpIHtcbiAgICAgICAgICBjb25zdCBqc29uOiBDYWxsRXJyb3JUeXBlID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgIGxldCBlcnI7XG4gICAgICAgICAgc3dpdGNoIChqc29uLmtpbmQpIHtcbiAgICAgICAgICAgICAgY2FzZSBcIlJlZmVyZW5jZUVycm9yXCI6IGVyciA9IG5ldyBSZWZlcmVuY2VFcnJvcihqc29uLm1lc3NhZ2UpOyBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBcIlR5cGVFcnJvclwiOiAgICAgIGVyciA9IG5ldyBUeXBlRXJyb3IoanNvbi5tZXNzYWdlKTsgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJSdW50aW1lRXJyb3JcIjogICBlcnIgPSBuZXcgUnVudGltZUVycm9yKGpzb24ubWVzc2FnZSk7IGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OiAgICAgICAgICAgICAgIGVyciA9IG5ldyBFcnJvcihqc29uLm1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlcnIuY2F1c2UgPSBqc29uLmNhdXNlO1xuICAgICAgICAgIHRocm93IGVyclxuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGF3YWl0IHJlc3BvbnNlLnRleHQoKSk7XG4gICAgfVxuXG4gICAgaWYgKChyZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKT8uaW5kZXhPZihcImFwcGxpY2F0aW9uL2pzb25cIikgPz8gLTEpICE9PSAtMSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgfVxufVxuXG4vLyBzZW5kQ2h1bmtlZCBzcGxpdHMgYSBsYXJnZSBzZXJpYWxpc2VkIHJlcXVlc3QgYm9keSBpbnRvIENIVU5LX1RIUkVTSE9MRC1zaXplZFxuLy8gYnl0ZSBjaHVua3MgYW5kIHNlbmRzIHRoZW0gc2VyaWFsbHkuICBFbmNvZGluZyB0byBVVEYtOCBieXRlcyBiZWZvcmUgc2xpY2luZ1xuLy8gcHJldmVudHMgY29ycnVwdGlvbiBvZiBub24tQk1QIGNoYXJhY3RlcnMgKHN1cnJvZ2F0ZSBwYWlycykgdGhhdCB3b3VsZCBvY2N1clxuLy8gd2hlbiBzcGxpdHRpbmcgYXQgSmF2YVNjcmlwdCBzdHJpbmcgaW5kaWNlcy4gIFRoZSBHbyB0cmFuc3BvcnQgYXNzZW1ibGVzIHRoZVxuLy8gcmF3IGJ5dGVzIGJlZm9yZSBwcm9jZXNzaW5nLiAgT25seSB0aGUgZmluYWwgY2h1bmsncyByZXNwb25zZSBjYXJyaWVzIHRoZSBSUEMgcmVzdWx0LlxuYXN5bmMgZnVuY3Rpb24gc2VuZENodW5rZWQodXJsOiBVUkwsIGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sIGJvZHlTdHI6IHN0cmluZyk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICBjb25zdCBjaHVua0lkID0gbmFub2lkKCk7XG4gICAgY29uc3QgYm9keUJ5dGVzID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGJvZHlTdHIpO1xuICAgIGNvbnN0IHRvdGFsQ2h1bmtzID0gTWF0aC5jZWlsKGJvZHlCeXRlcy5sZW5ndGggLyBDSFVOS19USFJFU0hPTEQpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3RhbENodW5rcyAtIDE7IGkrKykge1xuICAgICAgICBjb25zdCBjaHVuayA9IGJvZHlCeXRlcy5zdWJhcnJheShpICogQ0hVTktfVEhSRVNIT0xELCAoaSArIDEpICogQ0hVTktfVEhSRVNIT0xEKTtcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgICAgICAgICAneC13YWlscy1jaHVuay1pZCc6IGNodW5rSWQsXG4gICAgICAgICAgICAgICAgJ3gtd2FpbHMtY2h1bmstaW5kZXgnOiBTdHJpbmcoaSksXG4gICAgICAgICAgICAgICAgJ3gtd2FpbHMtY2h1bmstdG90YWwnOiBTdHJpbmcodG90YWxDaHVua3MpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IGNodW5rLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwLm9rKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYXdhaXQgcmVzcC50ZXh0KCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgICAgICd4LXdhaWxzLWNodW5rLWlkJzogY2h1bmtJZCxcbiAgICAgICAgICAgICd4LXdhaWxzLWNodW5rLWluZGV4JzogU3RyaW5nKHRvdGFsQ2h1bmtzIC0gMSksXG4gICAgICAgICAgICAneC13YWlscy1jaHVuay10b3RhbCc6IFN0cmluZyh0b3RhbENodW5rcyksXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IGJvZHlCeXRlcy5zdWJhcnJheSgodG90YWxDaHVua3MgLSAxKSAqIENIVU5LX1RIUkVTSE9MRCksXG4gICAgfSk7XG59XG5cbi8qKlxuICogQW5kcm9pZCBXZWJWaWV3IGNhbm5vdCBkZWxpdmVyIGZldGNoKCkgUE9TVCBib2RpZXMgdG9cbiAqIHNob3VsZEludGVyY2VwdFJlcXVlc3QsIHNvIHRoZSBkZWZhdWx0IEhUVFAgdHJhbnNwb3J0IGNhbm5vdCByZWFjaCBHby5cbiAqIFdoZW4gdGhlIEFuZHJvaWQgSmF2YXNjcmlwdEludGVyZmFjZSBicmlkZ2UgKHdpbmRvdy53YWlscykgaXMgcHJlc2VudCxcbiAqIHJvdXRlIHJ1bnRpbWUgY2FsbHMgdGhyb3VnaCBpdCBpbnN0ZWFkLiBSZXNwb25zZXMgYXJyaXZlIHZpYVxuICogd2luZG93Ll93YWlsc0FuZHJvaWRDYWxsYmFjaywgaW52b2tlZCBieSB0aGUgSmF2YSBzaWRlLlxuICovXG5pbnRlcmZhY2UgQW5kcm9pZEpTQnJpZGdlIHtcbiAgICBpbnZva2VBc3luYyhjYWxsYmFja0lEOiBzdHJpbmcsIHBheWxvYWQ6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmNvbnN0IGFuZHJvaWRCcmlkZ2U6IEFuZHJvaWRKU0JyaWRnZSB8IG51bGwgPSBoYXNET00gJiZcbiAgICB0eXBlb2YgKHdpbmRvdyBhcyBhbnkpLndhaWxzPy5pbnZva2VBc3luYyA9PT0gXCJmdW5jdGlvblwiID8gKHdpbmRvdyBhcyBhbnkpLndhaWxzIDogbnVsbDtcblxuaWYgKGFuZHJvaWRCcmlkZ2UpIHtcbiAgICBjb25zdCBwZW5kaW5nID0gbmV3IE1hcDxzdHJpbmcsIHsgcmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQ7IHJlamVjdDogKHJlYXNvbjogYW55KSA9PiB2b2lkIH0+KCk7XG5cbiAgICAod2luZG93IGFzIGFueSkuX3dhaWxzQW5kcm9pZENhbGxiYWNrID0gKGlkOiBzdHJpbmcsIHJlc3BvbnNlOiBzdHJpbmcgfCBudWxsLCBlcnJvcjogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gcGVuZGluZy5nZXQoaWQpO1xuICAgICAgICBpZiAoIXByb21pc2UpIHJldHVybjtcbiAgICAgICAgcGVuZGluZy5kZWxldGUoaWQpO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KG5ldyBFcnJvcihlcnJvcikpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlbnZlbG9wZSA9IEpTT04ucGFyc2UocmVzcG9uc2UgPz8gXCJ7fVwiKTtcbiAgICAgICAgICAgIGlmICghZW52ZWxvcGUub2spIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZW52ZWxvcGUuZXJyb3IgPz8gXCJ1bmtub3duIHJ1bnRpbWUgY2FsbCBlcnJvclwiKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKFwidGV4dFwiIGluIGVudmVsb3BlID8gZW52ZWxvcGUudGV4dCA6IGVudmVsb3BlLmRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjdXN0b21UcmFuc3BvcnQgPSB7XG4gICAgICAgIGNhbGwob2JqZWN0SUQ6IG51bWJlciwgbWV0aG9kOiBudW1iZXIsIHdpbmRvd05hbWU6IHN0cmluZywgYXJnczogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBuYW5vaWQoKTtcbiAgICAgICAgICAgICAgICBwZW5kaW5nLnNldChpZCwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYW5kcm9pZEJyaWRnZS5pbnZva2VBc3luYyhpZCwgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBvYmplY3RJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93TmFtZTogd2luZG93TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3MgPz8gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudElkOiBjbGllbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3QgbGVhayB0aGUgcGVuZGluZyBlbnRyeSBpZiBkaXNwYXRjaCB0aHJvd3Mgc3luY2hyb25vdXNseVxuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICB9O1xufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5TeXN0ZW0pO1xuXG5jb25zdCBTeXN0ZW1Jc0RhcmtNb2RlID0gMDtcbmNvbnN0IFN5c3RlbUVudmlyb25tZW50ID0gMTtcbmNvbnN0IFN5c3RlbUNhcGFiaWxpdGllcyA9IDI7XG5cbmNvbnN0IF9pbnZva2UgPSAoZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIFdpbmRvd3MgV2ViVmlldzJcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5jaHJvbWU/LndlYnZpZXc/LnBvc3RNZXNzYWdlKSB7XG4gICAgICAgICAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLmNocm9tZS53ZWJ2aWV3LnBvc3RNZXNzYWdlLmJpbmQoKHdpbmRvdyBhcyBhbnkpLmNocm9tZS53ZWJ2aWV3KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBtYWNPUy9pT1MgV0tXZWJWaWV3XG4gICAgICAgIGVsc2UgaWYgKCh3aW5kb3cgYXMgYW55KS53ZWJraXQ/Lm1lc3NhZ2VIYW5kbGVycz8uWydleHRlcm5hbCddPy5wb3N0TWVzc2FnZSkge1xuICAgICAgICAgICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS53ZWJraXQubWVzc2FnZUhhbmRsZXJzWydleHRlcm5hbCddLnBvc3RNZXNzYWdlLmJpbmQoKHdpbmRvdyBhcyBhbnkpLndlYmtpdC5tZXNzYWdlSGFuZGxlcnNbJ2V4dGVybmFsJ10pO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFuZHJvaWQgV2ViVmlldyAtIHVzZXMgYWRkSmF2YXNjcmlwdEludGVyZmFjZSB3aGljaCBleHBvc2VzIHdpbmRvdy53YWlscy5pbnZva2VcbiAgICAgICAgZWxzZSBpZiAoKHdpbmRvdyBhcyBhbnkpLndhaWxzPy5pbnZva2UpIHtcbiAgICAgICAgICAgIGNvbnN0IGJyaWRnZSA9ICh3aW5kb3cgYXMgYW55KS53YWlscztcbiAgICAgICAgICAgIHJldHVybiAobXNnOiBhbnkpID0+IGJyaWRnZS5pbnZva2UodHlwZW9mIG1zZyA9PT0gJ3N0cmluZycgPyBtc2cgOiBKU09OLnN0cmluZ2lmeShtc2cpKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2goZSkge31cblxuICAgIGNvbnNvbGUud2FybignXFxuJWPimqDvuI8gQnJvd3NlciBFbnZpcm9ubWVudCBEZXRlY3RlZCAlY1xcblxcbiVjT25seSBVSSBwcmV2aWV3cyBhcmUgYXZhaWxhYmxlIGluIHRoZSBicm93c2VyLiBGb3IgZnVsbCBmdW5jdGlvbmFsaXR5LCBwbGVhc2UgcnVuIHRoZSBhcHBsaWNhdGlvbiBpbiBkZXNrdG9wIG1vZGUuXFxuTW9yZSBpbmZvcm1hdGlvbiBhdDogaHR0cHM6Ly92My53YWlscy5pby9sZWFybi9idWlsZC8jdXNpbmctYS1icm93c2VyLWZvci1kZXZlbG9wbWVudFxcbicsXG4gICAgICAgICdiYWNrZ3JvdW5kOiAjZmZmZmZmOyBjb2xvcjogIzAwMDAwMDsgZm9udC13ZWlnaHQ6IGJvbGQ7IHBhZGRpbmc6IDRweCA4cHg7IGJvcmRlci1yYWRpdXM6IDRweDsgYm9yZGVyOiAycHggc29saWQgIzAwMDAwMDsnLFxuICAgICAgICAnYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7JyxcbiAgICAgICAgJ2NvbG9yOiAjZmZmZmZmOyBmb250LXN0eWxlOiBpdGFsaWM7IGZvbnQtd2VpZ2h0OiBib2xkOycpO1xuICAgIHJldHVybiBudWxsO1xufSkoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGludm9rZShtc2c6IGFueSk6IHZvaWQge1xuICAgIF9pbnZva2U/Lihtc2cpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgc3lzdGVtIGRhcmsgbW9kZSBzdGF0dXMuXG4gKlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgaWYgdGhlIHN5c3RlbSBpcyBpbiBkYXJrIG1vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0RhcmtNb2RlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBjYWxsKFN5c3RlbUlzRGFya01vZGUpO1xufVxuXG4vKipcbiAqIEZldGNoZXMgdGhlIGNhcGFiaWxpdGllcyBvZiB0aGUgYXBwbGljYXRpb24gZnJvbSB0aGUgc2VydmVyLlxuICpcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBjYXBhYmlsaXRpZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBDYXBhYmlsaXRpZXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XG4gICAgcmV0dXJuIGNhbGwoU3lzdGVtQ2FwYWJpbGl0aWVzKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPU0luZm8ge1xuICAgIC8qKiBUaGUgYnJhbmRpbmcgb2YgdGhlIE9TLiAqL1xuICAgIEJyYW5kaW5nOiBzdHJpbmc7XG4gICAgLyoqIFRoZSBJRCBvZiB0aGUgT1MuICovXG4gICAgSUQ6IHN0cmluZztcbiAgICAvKiogVGhlIG5hbWUgb2YgdGhlIE9TLiAqL1xuICAgIE5hbWU6IHN0cmluZztcbiAgICAvKiogVGhlIHZlcnNpb24gb2YgdGhlIE9TLiAqL1xuICAgIFZlcnNpb246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnZpcm9ubWVudEluZm8ge1xuICAgIC8qKiBUaGUgYXJjaGl0ZWN0dXJlIG9mIHRoZSBzeXN0ZW0uICovXG4gICAgQXJjaDogc3RyaW5nO1xuICAgIC8qKiBUcnVlIGlmIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGRlYnVnIG1vZGUsIG90aGVyd2lzZSBmYWxzZS4gKi9cbiAgICBEZWJ1ZzogYm9vbGVhbjtcbiAgICAvKiogVGhlIG9wZXJhdGluZyBzeXN0ZW0gaW4gdXNlLiAqL1xuICAgIE9TOiBzdHJpbmc7XG4gICAgLyoqIERldGFpbHMgb2YgdGhlIG9wZXJhdGluZyBzeXN0ZW0uICovXG4gICAgT1NJbmZvOiBPU0luZm87XG4gICAgLyoqIEFkZGl0aW9uYWwgcGxhdGZvcm0gaW5mb3JtYXRpb24uICovXG4gICAgUGxhdGZvcm1JbmZvOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBlbnZpcm9ubWVudCBkZXRhaWxzLlxuICpcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIG9iamVjdCBjb250YWluaW5nIE9TIGFuZCBzeXN0ZW0gYXJjaGl0ZWN0dXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gRW52aXJvbm1lbnQoKTogUHJvbWlzZTxFbnZpcm9ubWVudEluZm8+IHtcbiAgICByZXR1cm4gY2FsbChTeXN0ZW1FbnZpcm9ubWVudCk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgV2luZG93cy5cbiAqXG4gKiBAcmV0dXJuIFRydWUgaWYgdGhlIG9wZXJhdGluZyBzeXN0ZW0gaXMgV2luZG93cywgb3RoZXJ3aXNlIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNXaW5kb3dzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uT1MgPT09IFwid2luZG93c1wiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIExpbnV4LlxuICpcbiAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIExpbnV4LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0xpbnV4KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uT1MgPT09IFwibGludXhcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgYSBtYWNPUyBvcGVyYXRpbmcgc3lzdGVtLlxuICpcbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIG1hY09TLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc01hYygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZW52aXJvbm1lbnQ/Lk9TID09PSBcImRhcndpblwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIGlPUy5cbiAqXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlzIGlPUywgb3RoZXJ3aXNlIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNJT1MoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmVudmlyb25tZW50Py5PUyA9PT0gXCJpb3NcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBBbmRyb2lkLlxuICpcbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIG9wZXJhdGluZyBzeXN0ZW0gaXMgQW5kcm9pZCwgb3RoZXJ3aXNlIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNBbmRyb2lkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uT1MgPT09IFwiYW5kcm9pZFwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgYXBwIGlzIHJ1bm5pbmcgb24gYSBtb2JpbGUgT1MgKGlPUyBvciBBbmRyb2lkKS5cbiAqXG4gKiBAcmV0dXJucyBUcnVlIG9uIGlPUyBvciBBbmRyb2lkLCBvdGhlcndpc2UgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc01vYmlsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gSXNJT1MoKSB8fCBJc0FuZHJvaWQoKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGFwcCBpcyBydW5uaW5nIG9uIGEgZGVza3RvcCBPUyAobWFjT1MsIFdpbmRvd3Mgb3IgTGludXgpLlxuICpcbiAqIEByZXR1cm5zIFRydWUgb24gbWFjT1MsIFdpbmRvd3Mgb3IgTGludXgsIG90aGVyd2lzZSBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRGVza3RvcCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gSXNNYWMoKSB8fCBJc1dpbmRvd3MoKSB8fCBJc0xpbnV4KCk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGFyY2hpdGVjdHVyZSBpcyBBTUQ2NC5cbiAqXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGFyY2hpdGVjdHVyZSBpcyBBTUQ2NCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNBTUQ2NCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZW52aXJvbm1lbnQ/LkFyY2ggPT09IFwiYW1kNjRcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgYXJjaGl0ZWN0dXJlIGlzIEFSTS5cbiAqXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBjdXJyZW50IGFyY2hpdGVjdHVyZSBpcyBBUk0sIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQVJNKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uQXJjaCA9PT0gXCJhcm1cIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgQVJNNjQgYXJjaGl0ZWN0dXJlLlxuICpcbiAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiB0aGUgZW52aXJvbm1lbnQgaXMgQVJNNjQgYXJjaGl0ZWN0dXJlLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQVJNNjQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmVudmlyb25tZW50Py5BcmNoID09PSBcImFybTY0XCI7XG59XG5cbi8qKlxuICogUmVwb3J0cyB3aGV0aGVyIHRoZSBhcHAgaXMgYmVpbmcgcnVuIGluIGRlYnVnIG1vZGUuXG4gKlxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgYXBwIGlzIGJlaW5nIHJ1biBpbiBkZWJ1ZyBtb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNEZWJ1ZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gQm9vbGVhbigod2luZG93IGFzIGFueSkuX3dhaWxzPy5lbnZpcm9ubWVudD8uRGVidWcpO1xufVxuXG4iLCIvKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoqXG4gKiBMb2dzIGEgbWVzc2FnZSB0byB0aGUgY29uc29sZSB3aXRoIGN1c3RvbSBmb3JtYXR0aW5nLlxuICpcbiAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gYmUgbG9nZ2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVidWdMb2cobWVzc2FnZTogYW55KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgY29uc29sZS5sb2coXG4gICAgICAgICclYyB3YWlsczMgJWMgJyArIG1lc3NhZ2UgKyAnICcsXG4gICAgICAgICdiYWNrZ3JvdW5kOiAjYWEwMDAwOyBjb2xvcjogI2ZmZjsgYm9yZGVyLXJhZGl1czogM3B4IDBweCAwcHggM3B4OyBwYWRkaW5nOiAxcHg7IGZvbnQtc2l6ZTogMC43cmVtJyxcbiAgICAgICAgJ2JhY2tncm91bmQ6ICMwMDk5MDA7IGNvbG9yOiAjZmZmOyBib3JkZXItcmFkaXVzOiAwcHggM3B4IDNweCAwcHg7IHBhZGRpbmc6IDFweDsgZm9udC1zaXplOiAwLjdyZW0nXG4gICAgKTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgd2VidmlldyBzdXBwb3J0cyB0aGUge0BsaW5rIE1vdXNlRXZlbnQjYnV0dG9uc30gcHJvcGVydHkuXG4gKiBMb29raW5nIGF0IHlvdSBtYWNPUyBIaWdoIFNpZXJyYSFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhblRyYWNrQnV0dG9ucygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKG5ldyBNb3VzZUV2ZW50KCdtb3VzZWRvd24nKSkuYnV0dG9ucyA9PT0gMDtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYnJvd3NlciBzdXBwb3J0cyByZW1vdmluZyBsaXN0ZW5lcnMgYnkgdHJpZ2dlcmluZyBhbiBBYm9ydFNpZ25hbFxuICogKHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRXZlbnRUYXJnZXQvYWRkRXZlbnRMaXN0ZW5lciNzaWduYWwpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FuQWJvcnRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKCFFdmVudFRhcmdldCB8fCAhQWJvcnRTaWduYWwgfHwgIUFib3J0Q29udHJvbGxlcilcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XG5cbiAgICBjb25zdCB0YXJnZXQgPSBuZXcgRXZlbnRUYXJnZXQoKTtcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgKCkgPT4geyByZXN1bHQgPSBmYWxzZTsgfSwgeyBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0pO1xuICAgIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3Rlc3QnKSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJlc29sdmVzIHRoZSBjbG9zZXN0IEhUTUxFbGVtZW50IGFuY2VzdG9yIG9mIGFuIGV2ZW50J3MgdGFyZ2V0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRUYXJnZXQoZXZlbnQ6IEV2ZW50KTogSFRNTEVsZW1lbnQge1xuICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZXZlbnQudGFyZ2V0O1xuICAgIH0gZWxzZSBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgJiYgZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICByZXR1cm4gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQgPz8gZG9jdW1lbnQuYm9keTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuYm9keTtcbiAgICB9XG59XG5cbi8qKipcbiBUaGlzIHRlY2huaXF1ZSBmb3IgcHJvcGVyIGxvYWQgZGV0ZWN0aW9uIGlzIHRha2VuIGZyb20gSFRNWDpcblxuIEJTRCAyLUNsYXVzZSBMaWNlbnNlXG5cbiBDb3B5cmlnaHQgKGMpIDIwMjAsIEJpZyBTa3kgU29mdHdhcmVcbiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG4gUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAxLiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cblxuIDIuIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cbiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFXG4gRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUxcbiBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUlxuIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSXG4gQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSxcbiBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG5cbiAqKiovXG5cbmxldCBpc1JlYWR5ID0gZmFsc2U7XG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xuXG5pZiAoaGFzRE9NKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHsgaXNSZWFkeSA9IHRydWUgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuUmVhZHkoY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgICBpZiAoaXNSZWFkeSB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGNhbGxiYWNrKTtcbiAgICB9XG59XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHsgbmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXMgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQgeyBJc0RlYnVnIH0gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5pbXBvcnQgeyBldmVudFRhcmdldCB9IGZyb20gXCIuL3V0aWxzLmpzXCI7XG5cbi8vIHNldHVwXG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xuXG5pZiAoaGFzRE9NKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgY29udGV4dE1lbnVIYW5kbGVyKTtcbn1cblxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQ29udGV4dE1lbnUpO1xuXG5jb25zdCBDb250ZXh0TWVudU9wZW4gPSAwO1xuXG5mdW5jdGlvbiBvcGVuQ29udGV4dE1lbnUoaWQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIGRhdGE6IGFueSk6IHZvaWQge1xuICAgIHZvaWQgY2FsbChDb250ZXh0TWVudU9wZW4sIHtpZCwgeCwgeSwgZGF0YX0pO1xufVxuXG5mdW5jdGlvbiBjb250ZXh0TWVudUhhbmRsZXIoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBldmVudFRhcmdldChldmVudCk7XG5cbiAgICAvLyBDaGVjayBmb3IgY3VzdG9tIGNvbnRleHQgbWVudVxuICAgIGNvbnN0IGN1c3RvbUNvbnRleHRNZW51ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1jdXN0b20tY29udGV4dG1lbnVcIikudHJpbSgpO1xuXG4gICAgaWYgKGN1c3RvbUNvbnRleHRNZW51KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudS1kYXRhXCIpO1xuICAgICAgICBvcGVuQ29udGV4dE1lbnUoY3VzdG9tQ29udGV4dE1lbnUsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQsIHRhcmdldCk7XG4gICAgfVxufVxuXG5cbi8qXG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IGF1dG87IChkZWZhdWx0KSB3aWxsIHNob3cgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51IGlmIGNvbnRlbnRFZGl0YWJsZSBpcyB0cnVlIE9SIHRleHQgaGFzIGJlZW4gc2VsZWN0ZWQgT1IgZWxlbWVudCBpcyBpbnB1dCBvciB0ZXh0YXJlYVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBzaG93OyB3aWxsIGFsd2F5cyBzaG93IHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBoaWRlOyB3aWxsIGFsd2F5cyBoaWRlIHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuXG5UaGlzIHJ1bGUgaXMgaW5oZXJpdGVkIGxpa2Ugbm9ybWFsIENTUyBydWxlcywgc28gbmVzdGluZyB3b3JrcyBhcyBleHBlY3RlZFxuKi9cbmZ1bmN0aW9uIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQ6IE1vdXNlRXZlbnQsIHRhcmdldDogSFRNTEVsZW1lbnQpIHtcbiAgICAvLyBEZWJ1ZyBidWlsZHMgYWx3YXlzIHNob3cgdGhlIG1lbnVcbiAgICBpZiAoSXNEZWJ1ZygpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQcm9jZXNzIGRlZmF1bHQgY29udGV4dCBtZW51XG4gICAgc3dpdGNoICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLWRlZmF1bHQtY29udGV4dG1lbnVcIikudHJpbSgpKSB7XG4gICAgICAgIGNhc2UgJ3Nob3cnOlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYXNlICdoaWRlJzpcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgY29udGVudEVkaXRhYmxlIGlzIHRydWVcbiAgICBpZiAodGFyZ2V0LmlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB0ZXh0IGhhcyBiZWVuIHNlbGVjdGVkXG4gICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIGNvbnN0IGhhc1NlbGVjdGlvbiA9IHNlbGVjdGlvbiAmJiBzZWxlY3Rpb24udG9TdHJpbmcoKS5sZW5ndGggPiAwO1xuICAgIGlmIChoYXNTZWxlY3Rpb24pIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rpb24ucmFuZ2VDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KGkpO1xuICAgICAgICAgICAgY29uc3QgcmVjdHMgPSByYW5nZS5nZXRDbGllbnRSZWN0cygpO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWN0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlY3QgPSByZWN0c1tqXTtcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChyZWN0LmxlZnQsIHJlY3QudG9wKSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB0YWcgaXMgaW5wdXQgb3IgdGV4dGFyZWEuXG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgfHwgdGFyZ2V0IGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCkge1xuICAgICAgICBpZiAoaGFzU2VsZWN0aW9uIHx8ICghdGFyZ2V0LnJlYWRPbmx5ICYmICF0YXJnZXQuZGlzYWJsZWQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBoaWRlIGRlZmF1bHQgY29udGV4dCBtZW51XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn1cbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGZyb20gdGhlIGZsYWcgbWFwLlxuICpcbiAqIEBwYXJhbSBrZXkgLSBUaGUga2V5IHRvIHJldHJpZXZlIHRoZSB2YWx1ZSBmb3IuXG4gKiBAcmV0dXJuIFRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRGbGFnKGtleTogc3RyaW5nKTogYW55IHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gd2luZG93Ll93YWlscy5mbGFnc1trZXldO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJldHJpZXZlIGZsYWcgJ1wiICsga2V5ICsgXCInOiBcIiArIGUsIHsgY2F1c2U6IGUgfSk7XG4gICAgfVxufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7IGludm9rZSwgSXNXaW5kb3dzLCBJc0xpbnV4LCBJc01hYyB9IGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuaW1wb3J0IHsgR2V0RmxhZyB9IGZyb20gXCIuL2ZsYWdzLmpzXCI7XG5pbXBvcnQgeyBjYW5UcmFja0J1dHRvbnMsIGV2ZW50VGFyZ2V0IH0gZnJvbSBcIi4vdXRpbHMuanNcIjtcblxuLy8gU2V0dXBcbmxldCBjYW5EcmFnID0gZmFsc2U7XG5sZXQgZHJhZ2dpbmcgPSBmYWxzZTtcblxubGV0IHJlc2l6YWJsZSA9IGZhbHNlO1xubGV0IGNhblJlc2l6ZSA9IGZhbHNlO1xubGV0IHJlc2l6aW5nID0gZmFsc2U7XG5sZXQgcmVzaXplRWRnZTogc3RyaW5nID0gXCJcIjtcbmxldCBkZWZhdWx0Q3Vyc29yID0gXCJhdXRvXCI7XG5cbmxldCBidXR0b25zID0gMDtcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XG5cbmxldCBidXR0b25zVHJhY2tlZCA9IGZhbHNlO1xuXG5pZiAoaGFzRE9NKSB7XG4gICAgYnV0dG9uc1RyYWNrZWQgPSBjYW5UcmFja0J1dHRvbnMoKTtcbiAgICB3aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcbiAgICB3aW5kb3cuX3dhaWxzLnNldFJlc2l6YWJsZSA9ICh2YWx1ZTogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICByZXNpemFibGUgPSB2YWx1ZTtcbiAgICAgICAgaWYgKCFyZXNpemFibGUpIHtcbiAgICAgICAgICAgIC8vIFN0b3AgcmVzaXppbmcgaWYgaW4gcHJvZ3Jlc3MuXG4gICAgICAgICAgICBjYW5SZXNpemUgPSByZXNpemluZyA9IGZhbHNlO1xuICAgICAgICAgICAgc2V0UmVzaXplKCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG4vLyBEZWZlciBhdHRhY2hpbmcgbW91c2UgbGlzdGVuZXJzIHVudGlsIHdlIGtub3cgd2UncmUgbm90IG9uIG1vYmlsZS5cbmxldCBkcmFnSW5pdERvbmUgPSBmYWxzZTtcbmZ1bmN0aW9uIGlzTW9iaWxlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG9zID0gKHdpbmRvdyBhcyBhbnkpLl93YWlscz8uZW52aXJvbm1lbnQ/Lk9TO1xuICAgIGlmIChvcyA9PT0gXCJpb3NcIiB8fCBvcyA9PT0gXCJhbmRyb2lkXCIpIHJldHVybiB0cnVlO1xuICAgIC8vIEZhbGxiYWNrIGhldXJpc3RpYyBpZiBlbnZpcm9ubWVudCBub3QgeWV0IHNldFxuICAgIGNvbnN0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudmVuZG9yIHx8ICh3aW5kb3cgYXMgYW55KS5vcGVyYSB8fCBcIlwiO1xuICAgIHJldHVybiAvYW5kcm9pZHxpcGhvbmV8aXBhZHxpcG9kfGllbW9iaWxlfHdwZGVza3RvcC9pLnRlc3QodWEpO1xufVxuZnVuY3Rpb24gdHJ5SW5pdERyYWdIYW5kbGVycygpOiB2b2lkIHtcbiAgICBpZiAoZHJhZ0luaXREb25lKSByZXR1cm47XG4gICAgaWYgKGlzTW9iaWxlKCkpIHJldHVybjtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdXBkYXRlLCB7IGNhcHR1cmU6IHRydWUgfSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHVwZGF0ZSwgeyBjYXB0dXJlOiB0cnVlIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdXBkYXRlLCB7IGNhcHR1cmU6IHRydWUgfSk7XG4gICAgZm9yIChjb25zdCBldiBvZiBbJ2NsaWNrJywgJ2NvbnRleHRtZW51JywgJ2RibGNsaWNrJ10pIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXYsIHN1cHByZXNzRXZlbnQsIHsgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICB9XG4gICAgZHJhZ0luaXREb25lID0gdHJ1ZTtcbn1cbmlmIChoYXNET00pIHtcbiAgICAvLyBBdHRlbXB0IGltbWVkaWF0ZSBpbml0IChpbiBjYXNlIGVudmlyb25tZW50IGFscmVhZHkgcHJlc2VudClcbiAgICB0cnlJbml0RHJhZ0hhbmRsZXJzKCk7XG4gICAgLy8gQWxzbyBhdHRlbXB0IG9uIERPTSByZWFkeVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCB0cnlJbml0RHJhZ0hhbmRsZXJzLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgLy8gQXMgYSBsYXN0IHJlc29ydCwgcG9sbCBmb3IgZW52aXJvbm1lbnQgZm9yIGEgc2hvcnQgcGVyaW9kXG4gICAgbGV0IGRyYWdFbnZQb2xscyA9IDA7XG4gICAgY29uc3QgZHJhZ0VudlBvbGwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAoZHJhZ0luaXREb25lKSB7IHdpbmRvdy5jbGVhckludGVydmFsKGRyYWdFbnZQb2xsKTsgcmV0dXJuOyB9XG4gICAgICAgIHRyeUluaXREcmFnSGFuZGxlcnMoKTtcbiAgICAgICAgaWYgKCsrZHJhZ0VudlBvbGxzID4gMTAwKSB7IHdpbmRvdy5jbGVhckludGVydmFsKGRyYWdFbnZQb2xsKTsgfVxuICAgIH0sIDUwKTtcbn1cblxuZnVuY3Rpb24gc3VwcHJlc3NFdmVudChldmVudDogRXZlbnQpIHtcbiAgICBpZiAoXG4gICAgICAgIGV2ZW50LnR5cGUgPT09IFwiZGJsY2xpY2tcIlxuICAgICAgICAmJiBJc01hYygpXG4gICAgICAgICYmIHdpbmRvdyA9PT0gd2luZG93LnRvcFxuICAgICAgICAmJiBpc0RyYWdnYWJsZUV2ZW50KGV2ZW50IGFzIE1vdXNlRXZlbnQpXG4gICAgKSB7XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaW52b2tlKFwid2FpbHM6ZHJhZzpkb3VibGVjbGlja1wiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFN1cHByZXNzIGNsaWNrIGV2ZW50cyB3aGlsZSByZXNpemluZyBvciBkcmFnZ2luZy5cbiAgICBpZiAoZHJhZ2dpbmcgfHwgcmVzaXppbmcpIHtcbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNEcmFnZ2FibGVFdmVudChldmVudDogTW91c2VFdmVudCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50VGFyZ2V0KGV2ZW50KTtcbiAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldCk7XG4gICAgcmV0dXJuIChcbiAgICAgICAgc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShcIi0td2FpbHMtZHJhZ2dhYmxlXCIpLnRyaW0oKSA9PT0gXCJkcmFnXCJcbiAgICAgICAgJiYgZXZlbnQub2Zmc2V0WCA+PSAwXG4gICAgICAgICYmIGV2ZW50Lm9mZnNldFggPCB0YXJnZXQuY2xpZW50V2lkdGhcbiAgICAgICAgJiYgZXZlbnQub2Zmc2V0WSA+PSAwXG4gICAgICAgICYmIGV2ZW50Lm9mZnNldFkgPCB0YXJnZXQuY2xpZW50SGVpZ2h0XG4gICAgKTtcbn1cblxuLy8gVXNlIGNvbnN0YW50cyB0byBhdm9pZCBjb21wYXJpbmcgc3RyaW5ncyBtdWx0aXBsZSB0aW1lcy5cbmNvbnN0IE1vdXNlRG93biA9IDA7XG5jb25zdCBNb3VzZVVwICAgPSAxO1xuY29uc3QgTW91c2VNb3ZlID0gMjtcblxuZnVuY3Rpb24gdXBkYXRlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gV2luZG93cyBzdXBwcmVzc2VzIG1vdXNlIGV2ZW50cyBhdCB0aGUgZW5kIG9mIGRyYWdnaW5nIG9yIHJlc2l6aW5nLFxuICAgIC8vIHNvIHdlIG5lZWQgdG8gYmUgc21hcnQgYW5kIHN5bnRoZXNpemUgYnV0dG9uIGV2ZW50cy5cblxuICAgIGxldCBldmVudFR5cGU6IG51bWJlciwgZXZlbnRCdXR0b25zID0gZXZlbnQuYnV0dG9ucztcbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbW91c2Vkb3duJzpcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9IE1vdXNlRG93bjtcbiAgICAgICAgICAgIGlmICghYnV0dG9uc1RyYWNrZWQpIHsgZXZlbnRCdXR0b25zID0gYnV0dG9ucyB8ICgxIDw8IGV2ZW50LmJ1dHRvbik7IH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb3VzZXVwJzpcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9IE1vdXNlVXA7XG4gICAgICAgICAgICBpZiAoIWJ1dHRvbnNUcmFja2VkKSB7IGV2ZW50QnV0dG9ucyA9IGJ1dHRvbnMgJiB+KDEgPDwgZXZlbnQuYnV0dG9uKTsgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBldmVudFR5cGUgPSBNb3VzZU1vdmU7XG4gICAgICAgICAgICBpZiAoIWJ1dHRvbnNUcmFja2VkKSB7IGV2ZW50QnV0dG9ucyA9IGJ1dHRvbnM7IH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCByZWxlYXNlZCA9IGJ1dHRvbnMgJiB+ZXZlbnRCdXR0b25zO1xuICAgIGxldCBwcmVzc2VkID0gZXZlbnRCdXR0b25zICYgfmJ1dHRvbnM7XG5cbiAgICBidXR0b25zID0gZXZlbnRCdXR0b25zO1xuXG4gICAgLy8gU3ludGhlc2l6ZSBhIHJlbGVhc2UtcHJlc3Mgc2VxdWVuY2UgaWYgd2UgZGV0ZWN0IGEgcHJlc3Mgb2YgYW4gYWxyZWFkeSBwcmVzc2VkIGJ1dHRvbi5cbiAgICBpZiAoZXZlbnRUeXBlID09PSBNb3VzZURvd24gJiYgIShwcmVzc2VkICYgZXZlbnQuYnV0dG9uKSkge1xuICAgICAgICByZWxlYXNlZCB8PSAoMSA8PCBldmVudC5idXR0b24pO1xuICAgICAgICBwcmVzc2VkIHw9ICgxIDw8IGV2ZW50LmJ1dHRvbik7XG4gICAgfVxuXG4gICAgLy8gU3VwcHJlc3MgYWxsIGJ1dHRvbiBldmVudHMgZHVyaW5nIGRyYWdnaW5nIGFuZCByZXNpemluZyxcbiAgICAvLyB1bmxlc3MgdGhpcyBpcyBhIG1vdXNldXAgZXZlbnQgdGhhdCBpcyBlbmRpbmcgYSBkcmFnIGFjdGlvbi5cbiAgICBpZiAoXG4gICAgICAgIGV2ZW50VHlwZSAhPT0gTW91c2VNb3ZlIC8vIEZhc3QgcGF0aCBmb3IgbW91c2Vtb3ZlXG4gICAgICAgICYmIHJlc2l6aW5nXG4gICAgICAgIHx8IChcbiAgICAgICAgICAgIGRyYWdnaW5nXG4gICAgICAgICAgICAmJiAoXG4gICAgICAgICAgICAgICAgZXZlbnRUeXBlID09PSBNb3VzZURvd25cbiAgICAgICAgICAgICAgICB8fCBldmVudC5idXR0b24gIT09IDBcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICkge1xuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHJlbGVhc2VzXG4gICAgaWYgKHJlbGVhc2VkICYgMSkgeyBwcmltYXJ5VXAoZXZlbnQpOyB9XG4gICAgLy8gSGFuZGxlIHByZXNzZXNcbiAgICBpZiAocHJlc3NlZCAmIDEpIHsgcHJpbWFyeURvd24oZXZlbnQpOyB9XG5cbiAgICAvLyBIYW5kbGUgbW91c2Vtb3ZlXG4gICAgaWYgKGV2ZW50VHlwZSA9PT0gTW91c2VNb3ZlKSB7IG9uTW91c2VNb3ZlKGV2ZW50KTsgfTtcbn1cblxuZnVuY3Rpb24gcHJpbWFyeURvd24oZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBSZXNldCByZWFkaW5lc3Mgc3RhdGUuXG4gICAgY2FuRHJhZyA9IGZhbHNlO1xuICAgIGNhblJlc2l6ZSA9IGZhbHNlO1xuXG4gICAgLy8gSWdub3JlIHJlcGVhdGVkIGNsaWNrcyBvbiBtYWNPUyBhbmQgTGludXguXG4gICAgaWYgKCFJc1dpbmRvd3MoKSkge1xuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uID09PSAwICYmIGV2ZW50LmRldGFpbCAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlc2l6ZUVkZ2UpIHtcbiAgICAgICAgLy8gRG8gbm90IGFybSBlZGdlIHJlc2l6ZSBmcm9tIHN5bnRoZXNpemVkIHByZXNzZXMgb2JzZXJ2ZWQgb24gbW92ZS91cDpcbiAgICAgICAgLy8gZW50ZXJpbmcgdGhlIHdpbmRvdyB3aXRoIHRoZSBwcmltYXJ5IGJ1dHRvbiBhbHJlYWR5IGhlbGQgc2hvdWxkIG5vdFxuICAgICAgICAvLyBzdGVhbCBhbm90aGVyIGdlc3R1cmUgaW50byBhIHJlc2l6ZS5cbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgIT09ICdtb3VzZWRvd24nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWFkeSB0byByZXNpemUgaWYgdGhlIHByaW1hcnkgYnV0dG9uIHdhcyBwcmVzc2VkIGZvciB0aGUgZmlyc3QgdGltZS5cbiAgICAgICAgY2FuUmVzaXplID0gdHJ1ZTtcbiAgICAgICAgLy8gRG8gbm90IHN0YXJ0IGRyYWcgb3BlcmF0aW9ucyB3aGVuIG9uIHJlc2l6ZSBlZGdlcy5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJldHJpZXZlIHRhcmdldCBlbGVtZW50XG4gICAgLy8gUmVhZHkgdG8gZHJhZyBpZiB0aGUgcHJpbWFyeSBidXR0b24gd2FzIHByZXNzZWQgZm9yIHRoZSBmaXJzdCB0aW1lIG9uIGEgZHJhZ2dhYmxlIGVsZW1lbnQuXG4gICAgLy8gSWdub3JlIGNsaWNrcyBvbiB0aGUgc2Nyb2xsYmFyLlxuICAgIGNhbkRyYWcgPSBpc0RyYWdnYWJsZUV2ZW50KGV2ZW50KTtcbn1cblxuZnVuY3Rpb24gcHJpbWFyeVVwKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gU3RvcCBkcmFnZ2luZyBhbmQgcmVzaXppbmcuXG4gICAgY2FuRHJhZyA9IGZhbHNlO1xuICAgIGRyYWdnaW5nID0gZmFsc2U7XG4gICAgY2FuUmVzaXplID0gZmFsc2U7XG4gICAgcmVzaXppbmcgPSBmYWxzZTtcbn1cblxuY29uc3QgY3Vyc29yRm9yRWRnZSA9IE9iamVjdC5mcmVlemUoe1xuICAgIFwic2UtcmVzaXplXCI6IFwibndzZS1yZXNpemVcIixcbiAgICBcInN3LXJlc2l6ZVwiOiBcIm5lc3ctcmVzaXplXCIsXG4gICAgXCJudy1yZXNpemVcIjogXCJud3NlLXJlc2l6ZVwiLFxuICAgIFwibmUtcmVzaXplXCI6IFwibmVzdy1yZXNpemVcIixcbiAgICBcInctcmVzaXplXCI6IFwiZXctcmVzaXplXCIsXG4gICAgXCJuLXJlc2l6ZVwiOiBcIm5zLXJlc2l6ZVwiLFxuICAgIFwicy1yZXNpemVcIjogXCJucy1yZXNpemVcIixcbiAgICBcImUtcmVzaXplXCI6IFwiZXctcmVzaXplXCIsXG59KVxuXG5mdW5jdGlvbiBzZXRSZXNpemUoZWRnZT86IGtleW9mIHR5cGVvZiBjdXJzb3JGb3JFZGdlKTogdm9pZCB7XG4gICAgaWYgKGVkZ2UpIHtcbiAgICAgICAgaWYgKCFyZXNpemVFZGdlKSB7IGRlZmF1bHRDdXJzb3IgPSBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvcjsgfVxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IGN1cnNvckZvckVkZ2VbZWRnZV07XG4gICAgfSBlbHNlIGlmICghZWRnZSAmJiByZXNpemVFZGdlKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gZGVmYXVsdEN1cnNvcjtcbiAgICB9XG5cbiAgICByZXNpemVFZGdlID0gZWRnZSB8fCBcIlwiO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmIChjYW5SZXNpemUgJiYgcmVzaXplRWRnZSkge1xuICAgICAgICAvLyBTdGFydCByZXNpemluZy5cbiAgICAgICAgcmVzaXppbmcgPSB0cnVlO1xuICAgICAgICBpbnZva2UoXCJ3YWlsczpyZXNpemU6XCIgKyByZXNpemVFZGdlKTtcbiAgICB9IGVsc2UgaWYgKGNhbkRyYWcpIHtcbiAgICAgICAgLy8gU3RhcnQgZHJhZ2dpbmcuXG4gICAgICAgIGRyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgaW52b2tlKFwid2FpbHM6ZHJhZ1wiKTtcbiAgICB9XG5cbiAgICBpZiAoZHJhZ2dpbmcgfHwgcmVzaXppbmcpIHtcbiAgICAgICAgLy8gRWl0aGVyIGRyYWcgb3IgcmVzaXplIGlzIG9uZ29pbmcsXG4gICAgICAgIC8vIHJlc2V0IHJlYWRpbmVzcyBhbmQgc3RvcCBwcm9jZXNzaW5nLlxuICAgICAgICBjYW5EcmFnID0gY2FuUmVzaXplID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXJlc2l6YWJsZSB8fCAoIUlzV2luZG93cygpICYmICEoSXNMaW51eCgpICYmIEdldEZsYWcoXCJmcmFtZWxlc3NcIikpKSkge1xuICAgICAgICBpZiAocmVzaXplRWRnZSkgeyBzZXRSZXNpemUoKTsgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVzaXplSGFuZGxlSGVpZ2h0ID0gR2V0RmxhZyhcInN5c3RlbS5yZXNpemVIYW5kbGVIZWlnaHRcIikgfHwgNTtcbiAgICBjb25zdCByZXNpemVIYW5kbGVXaWR0aCA9IEdldEZsYWcoXCJzeXN0ZW0ucmVzaXplSGFuZGxlV2lkdGhcIikgfHwgNTtcblxuICAgIC8vIEV4dHJhIHBpeGVscyBmb3IgdGhlIGNvcm5lciBhcmVhcy5cbiAgICBjb25zdCBjb3JuZXJFeHRyYSA9IEdldEZsYWcoXCJyZXNpemVDb3JuZXJFeHRyYVwiKSB8fCAxMDtcblxuICAgIC8vIFdoZW4gYSBzY3JvbGxiYXIgaXMgcHJlc2VudCBhdCB0aGUgd2luZG93IGVkZ2UgaXQgY29uc3VtZXMgbW91c2UgZXZlbnRzIGluIHRoYXQgc3RyaXAuXG4gICAgLy8gU2hpZnQgdGhlIGVmZmVjdGl2ZSBjb250ZW50IGVkZ2UgaW53YXJkIHNvIHRoZSByZXNpemUgem9uZSBzaXRzIGp1c3QgYmVmb3JlIHRoZSBzY3JvbGxiYXIuXG4gICAgY29uc3Qgc2Nyb2xsYmFyV2lkdGggPSBNYXRoLm1heCgwLCB3aW5kb3cuaW5uZXJXaWR0aCAtIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCk7XG4gICAgY29uc3Qgc2Nyb2xsYmFySGVpZ2h0ID0gTWF0aC5tYXgoMCwgd2luZG93LmlubmVySGVpZ2h0IC0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgY29uc3QgcmlnaHRDb250ZW50RWRnZSA9IHdpbmRvdy5pbm5lcldpZHRoIC0gc2Nyb2xsYmFyV2lkdGg7XG4gICAgY29uc3QgYm90dG9tQ29udGVudEVkZ2UgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBzY3JvbGxiYXJIZWlnaHQ7XG5cbiAgICBjb25zdCByaWdodEJvcmRlciA9IGV2ZW50LmNsaWVudFggPCByaWdodENvbnRlbnRFZGdlICYmIChyaWdodENvbnRlbnRFZGdlIC0gZXZlbnQuY2xpZW50WCkgPCByZXNpemVIYW5kbGVXaWR0aDtcbiAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZXZlbnQuY2xpZW50WCA8IHJlc2l6ZUhhbmRsZVdpZHRoO1xuICAgIGNvbnN0IHRvcEJvcmRlciA9IGV2ZW50LmNsaWVudFkgPCByZXNpemVIYW5kbGVIZWlnaHQ7XG4gICAgY29uc3QgYm90dG9tQm9yZGVyID0gZXZlbnQuY2xpZW50WSA8IGJvdHRvbUNvbnRlbnRFZGdlICYmIChib3R0b21Db250ZW50RWRnZSAtIGV2ZW50LmNsaWVudFkpIDwgcmVzaXplSGFuZGxlSGVpZ2h0O1xuXG4gICAgLy8gQWRqdXN0IGZvciBjb3JuZXIgYXJlYXMuXG4gICAgY29uc3QgcmlnaHRDb3JuZXIgPSBldmVudC5jbGllbnRYIDwgcmlnaHRDb250ZW50RWRnZSAmJiAocmlnaHRDb250ZW50RWRnZSAtIGV2ZW50LmNsaWVudFgpIDwgKHJlc2l6ZUhhbmRsZVdpZHRoICsgY29ybmVyRXh0cmEpO1xuICAgIGNvbnN0IGxlZnRDb3JuZXIgPSBldmVudC5jbGllbnRYIDwgKHJlc2l6ZUhhbmRsZVdpZHRoICsgY29ybmVyRXh0cmEpO1xuICAgIGNvbnN0IHRvcENvcm5lciA9IGV2ZW50LmNsaWVudFkgPCAocmVzaXplSGFuZGxlSGVpZ2h0ICsgY29ybmVyRXh0cmEpO1xuICAgIGNvbnN0IGJvdHRvbUNvcm5lciA9IGV2ZW50LmNsaWVudFkgPCBib3R0b21Db250ZW50RWRnZSAmJiAoYm90dG9tQ29udGVudEVkZ2UgLSBldmVudC5jbGllbnRZKSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XG5cbiAgICBpZiAoIWxlZnRDb3JuZXIgJiYgIXRvcENvcm5lciAmJiAhYm90dG9tQ29ybmVyICYmICFyaWdodENvcm5lcikge1xuICAgICAgICAvLyBPcHRpbWlzYXRpb246IG91dCBvZiBhbGwgY29ybmVyIGFyZWFzIGltcGxpZXMgb3V0IG9mIGJvcmRlcnMuXG4gICAgICAgIHNldFJlc2l6ZSgpO1xuICAgIH1cbiAgICAvLyBEZXRlY3QgY29ybmVycy5cbiAgICBlbHNlIGlmIChyaWdodENvcm5lciAmJiBib3R0b21Db3JuZXIpIHNldFJlc2l6ZShcInNlLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChsZWZ0Q29ybmVyICYmIGJvdHRvbUNvcm5lcikgc2V0UmVzaXplKFwic3ctcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGxlZnRDb3JuZXIgJiYgdG9wQ29ybmVyKSBzZXRSZXNpemUoXCJudy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAodG9wQ29ybmVyICYmIHJpZ2h0Q29ybmVyKSBzZXRSZXNpemUoXCJuZS1yZXNpemVcIik7XG4gICAgLy8gRGV0ZWN0IGJvcmRlcnMuXG4gICAgZWxzZSBpZiAobGVmdEJvcmRlcikgc2V0UmVzaXplKFwidy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAodG9wQm9yZGVyKSBzZXRSZXNpemUoXCJuLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChib3R0b21Cb3JkZXIpIHNldFJlc2l6ZShcInMtcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKHJpZ2h0Qm9yZGVyKSBzZXRSZXNpemUoXCJlLXJlc2l6ZVwiKTtcbiAgICAvLyBPdXQgb2YgYm9yZGVyIGFyZWEuXG4gICAgZWxzZSBzZXRSZXNpemUoKTtcbn1cbiIsIi8qXG4gXyAgICAgX18gICAgXyBfX1xufCB8ICAgLyAvX19fKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHsgaW52b2tlIH0gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5pbXBvcnQgeyB3aGVuUmVhZHkgfSBmcm9tIFwiLi91dGlscy5qc1wiO1xuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcblxudHlwZSBOb25DbGllbnRSZWdpb25LaW5kID0gXCJjYXB0aW9uXCIgfCBcIm1pbmltaXplXCIgfCBcIm1heGltaXplXCIgfCBcImNsb3NlXCI7XG5cbmludGVyZmFjZSBOb25DbGllbnRSZWdpb24ge1xuICAgIGtpbmQ6IE5vbkNsaWVudFJlZ2lvbktpbmQ7XG4gICAgbGVmdDogbnVtYmVyO1xuICAgIHRvcDogbnVtYmVyO1xuICAgIHJpZ2h0OiBudW1iZXI7XG4gICAgYm90dG9tOiBudW1iZXI7XG59XG5cbi8qXG4tLXdhaWxzLW5vbi1jbGllbnQtcmVnaW9uOiBjYXB0aW9uOyAgbWFya3MgYW4gYXJlYSB0aGF0IGNhbiBkcmFnIHRoZSB3aW5kb3dcbi0td2FpbHMtbm9uLWNsaWVudC1yZWdpb246IG1pbmltaXplOyBtYXJrcyBhIGN1c3RvbSBtaW5pbWl6ZSBidXR0b25cbi0td2FpbHMtbm9uLWNsaWVudC1yZWdpb246IG1heGltaXplOyBtYXJrcyBhIGN1c3RvbSBtYXhpbWl6ZSBidXR0b25cbi0td2FpbHMtbm9uLWNsaWVudC1yZWdpb246IGNsb3NlOyAgICBtYXJrcyBhIGN1c3RvbSBjbG9zZSBidXR0b25cbiovXG5jb25zdCByZWdpb25Qcm9wZXJ0eSA9IFwiLS13YWlscy1ub24tY2xpZW50LXJlZ2lvblwiO1xuY29uc3QgcnVudGltZUNvbmZpZ1JlYWR5RXZlbnQgPSBcIndhaWxzOnJ1bnRpbWUtY29uZmlnLXJlYWR5XCI7XG5jb25zdCB2YWxpZFJlZ2lvbnMgPSBuZXcgU2V0PE5vbkNsaWVudFJlZ2lvbktpbmQ+KFtcImNhcHRpb25cIiwgXCJtaW5pbWl6ZVwiLCBcIm1heGltaXplXCIsIFwiY2xvc2VcIl0pO1xuXG4vLyBTZXR1cFxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xufVxuXG5sZXQgdXBkYXRlUGVuZGluZyA9IGZhbHNlO1xubGV0IGxhc3RQYXlsb2FkID0gXCJcIjtcbmxldCBvYnNlcnZlZEVsZW1lbnRzID0gbmV3IFNldDxFbGVtZW50PigpO1xubGV0IHJlc2l6ZU9ic2VydmVyOiBSZXNpemVPYnNlcnZlciB8IHVuZGVmaW5lZDtcbmxldCB0cmFja2luZ1N0YXJ0ZWQgPSBmYWxzZTtcblxuZnVuY3Rpb24gbm9ybWFsaXNlUmVnaW9uS2luZCh2YWx1ZTogc3RyaW5nKTogTm9uQ2xpZW50UmVnaW9uS2luZCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgcmVnaW9uID0gdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHZhbGlkUmVnaW9ucy5oYXMocmVnaW9uIGFzIE5vbkNsaWVudFJlZ2lvbktpbmQpKSB7XG4gICAgICAgIHJldHVybiByZWdpb24gYXMgTm9uQ2xpZW50UmVnaW9uS2luZDtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gbm9uQ2xpZW50UmVnaW9uRm9yRWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogTm9uQ2xpZW50UmVnaW9uS2luZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG4gICAgY29uc3QgcmVnaW9uID0gbm9ybWFsaXNlUmVnaW9uS2luZChzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHJlZ2lvblByb3BlcnR5KSk7XG4gICAgaWYgKCFyZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJlbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgICBjb25zdCBwYXJlbnRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHBhcmVudCk7XG4gICAgICAgIC8vIFRoZSBDU1MgcHJvcGVydHkgaXMgaW5oZXJpdGVkLiBPbmx5IHJlcG9ydCB0aGUgb3V0ZXJtb3N0IGVsZW1lbnQgZm9yXG4gICAgICAgIC8vIGVhY2ggY29udGlndW91cyByZWdpb24gc28gbmF0aXZlIGhpdCB0ZXN0aW5nIHNlZXMgc3RhYmxlIHJlY3RhbmdsZXMuXG4gICAgICAgIGlmIChub3JtYWxpc2VSZWdpb25LaW5kKHBhcmVudFN0eWxlLmdldFByb3BlcnR5VmFsdWUocmVnaW9uUHJvcGVydHkpKSA9PT0gcmVnaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZ2lvbjtcbn1cblxuZnVuY3Rpb24gaXNWaXNpYmxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcbiAgICByZXR1cm4gc3R5bGUuZGlzcGxheSAhPT0gXCJub25lXCIgJiZcbiAgICAgICAgc3R5bGUudmlzaWJpbGl0eSAhPT0gXCJoaWRkZW5cIiAmJlxuICAgICAgICBzdHlsZS5jb250ZW50VmlzaWJpbGl0eSAhPT0gXCJoaWRkZW5cIjtcbn1cblxuZnVuY3Rpb24gZWxlbWVudFJlZ2lvbihlbGVtZW50OiBFbGVtZW50KTogTm9uQ2xpZW50UmVnaW9uIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3Qga2luZCA9IG5vbkNsaWVudFJlZ2lvbkZvckVsZW1lbnQoZWxlbWVudCk7XG4gICAgaWYgKCFraW5kIHx8ICFpc1Zpc2libGUoZWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAocmVjdC53aWR0aCA8PSAwIHx8IHJlY3QuaGVpZ2h0IDw9IDApIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBOYXRpdmUgaGl0IHRlc3RpbmcgcnVucyBpbiBwaHlzaWNhbCBwaXhlbHMsIHdoaWxlIERPTSBnZW9tZXRyeSBpcyBpbiBDU1MgcGl4ZWxzLlxuICAgIGNvbnN0IHNjYWxlID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICBjb25zdCBsZWZ0ID0gTWF0aC5mbG9vcihyZWN0LmxlZnQgKiBzY2FsZSk7XG4gICAgY29uc3QgdG9wID0gTWF0aC5mbG9vcihyZWN0LnRvcCAqIHNjYWxlKTtcbiAgICBjb25zdCByaWdodCA9IE1hdGguY2VpbChyZWN0LnJpZ2h0ICogc2NhbGUpO1xuICAgIGNvbnN0IGJvdHRvbSA9IE1hdGguY2VpbChyZWN0LmJvdHRvbSAqIHNjYWxlKTtcblxuICAgIGlmIChyaWdodCA8PSBsZWZ0IHx8IGJvdHRvbSA8PSB0b3ApIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4geyBraW5kLCBsZWZ0LCB0b3AsIHJpZ2h0LCBib3R0b20gfTtcbn1cblxuZnVuY3Rpb24gcmVnaW9uRWxlbWVudHMoKTogRWxlbWVudFtdIHtcbiAgICBjb25zdCBlbGVtZW50czogRWxlbWVudFtdID0gW107XG5cbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnRzLnB1c2goZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgZWxlbWVudHMucHVzaChkb2N1bWVudC5ib2R5KTtcbiAgICAgICAgLy8gQXBwZW5kIHZpYSBhIGxvb3A6IHNwcmVhZGluZyBhIGh1Z2UgTm9kZUxpc3QgaW50byBwdXNoKCkgb3ZlcmZsb3dzXG4gICAgICAgIC8vIHRoZSBlbmdpbmUncyBhcmd1bWVudCBsaW1pdCBvbiB2ZXJ5IGxhcmdlIGRvY3VtZW50cy5cbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbChcIipcIikpIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudHM7XG59XG5cbmZ1bmN0aW9uIG9ic2VydmVSZWdpb25FbGVtZW50cyhlbGVtZW50czogRWxlbWVudFtdKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVHJhY2sgc2l6ZSBjaGFuZ2VzIG9ubHkgZm9yIGFjdGl2ZSByZWdpb24gZWxlbWVudHMuIERPTSBzdHJ1Y3R1cmUgYW5kIHN0eWxlXG4gICAgLy8gY2hhbmdlcyBhcmUgY292ZXJlZCBieSBNdXRhdGlvbk9ic2VydmVyIGluIHN0YXJ0Tm9uQ2xpZW50UmVnaW9uVHJhY2tpbmcoKS5cbiAgICByZXNpemVPYnNlcnZlciA/Pz0gbmV3IFJlc2l6ZU9ic2VydmVyKHNjaGVkdWxlVXBkYXRlKTtcbiAgICBjb25zdCBuZXh0RWxlbWVudHMgPSBuZXcgU2V0KGVsZW1lbnRzKTtcblxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBvYnNlcnZlZEVsZW1lbnRzKSB7XG4gICAgICAgIGlmICghbmV4dEVsZW1lbnRzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICAgICAgcmVzaXplT2JzZXJ2ZXIudW5vYnNlcnZlKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5leHRFbGVtZW50cykge1xuICAgICAgICBpZiAoIW9ic2VydmVkRWxlbWVudHMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb2JzZXJ2ZWRFbGVtZW50cyA9IG5leHRFbGVtZW50cztcbn1cblxuZnVuY3Rpb24gdXBkYXRlTm9uQ2xpZW50UmVnaW9ucygpOiB2b2lkIHtcbiAgICB1cGRhdGVQZW5kaW5nID0gZmFsc2U7XG5cbiAgICBjb25zdCBlbGVtZW50cyA9IHJlZ2lvbkVsZW1lbnRzKCk7XG4gICAgY29uc3QgcmVnaW9uczogTm9uQ2xpZW50UmVnaW9uW10gPSBbXTtcbiAgICBjb25zdCBhY3RpdmVFbGVtZW50czogRWxlbWVudFtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgY29uc3QgcmVnaW9uID0gZWxlbWVudFJlZ2lvbihlbGVtZW50KTtcbiAgICAgICAgaWYgKHJlZ2lvbikge1xuICAgICAgICAgICAgcmVnaW9ucy5wdXNoKHJlZ2lvbik7XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb2JzZXJ2ZVJlZ2lvbkVsZW1lbnRzKGFjdGl2ZUVsZW1lbnRzKTtcblxuICAgIGNvbnN0IHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeSh7IHZlcnNpb246IDEsIHJlZ2lvbnMgfSk7XG4gICAgaWYgKHBheWxvYWQgPT09IGxhc3RQYXlsb2FkKSB7XG4gICAgICAgIC8vIEF2b2lkIHNlbmRpbmcgZHVwbGljYXRlIG5hdGl2ZSBtZXNzYWdlcyBkdXJpbmcgcmVzaXplIG9yIHN0eWxlIGNodXJuLlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGFzdFBheWxvYWQgPSBwYXlsb2FkO1xuICAgIGludm9rZShcIndhaWxzOm5vbi1jbGllbnQtcmVnaW9uOlwiICsgcGF5bG9hZCk7XG59XG5cbmZ1bmN0aW9uIHNjaGVkdWxlVXBkYXRlKCk6IHZvaWQge1xuICAgIGlmICh1cGRhdGVQZW5kaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBCYXRjaCByZWdpb24gdXBkYXRlcyB0byBhbmltYXRpb24gZnJhbWVzIHNvIGxheW91dCBpcyBtZWFzdXJlZCBvbmNlIHBlciBmcmFtZS5cbiAgICB1cGRhdGVQZW5kaW5nID0gdHJ1ZTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZU5vbkNsaWVudFJlZ2lvbnMpO1xufVxuXG5mdW5jdGlvbiBzdGFydE5vbkNsaWVudFJlZ2lvblRyYWNraW5nKCk6IHZvaWQge1xuICAgIGlmICh0cmFja2luZ1N0YXJ0ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyYWNraW5nU3RhcnRlZCA9IHRydWU7XG4gICAgLy8gU2VuZCBhbiBpbml0aWFsIGVtcHR5IG9yIHBvcHVsYXRlZCByZWdpb24gbGlzdCBvbmNlIHRoZSBET00gaXMgcmVhZHkuXG4gICAgc2NoZWR1bGVVcGRhdGUoKTtcblxuICAgIGNvbnN0IG11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihzY2hlZHVsZVVwZGF0ZSk7XG4gICAgbXV0YXRpb25PYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBzY2hlZHVsZVVwZGF0ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgc2NoZWR1bGVVcGRhdGUsIHRydWUpO1xuICAgIHdpbmRvdy52aXN1YWxWaWV3cG9ydD8uYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBzY2hlZHVsZVVwZGF0ZSk7XG4gICAgd2luZG93LnZpc3VhbFZpZXdwb3J0Py5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHNjaGVkdWxlVXBkYXRlKTtcbn1cblxuZnVuY3Rpb24gdHJ5U3RhcnROb25DbGllbnRSZWdpb25UcmFja2luZygpOiBib29sZWFuIHtcbiAgICBjb25zdCBvcyA9IHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQ/Lk9TO1xuICAgIGlmIChvcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmFibGVkID0gd2luZG93Ll93YWlscy5mbGFncz8ubm9uQ2xpZW50UmVnaW9uVHJhY2tpbmc7XG4gICAgaWYgKG9zID09PSBcIndpbmRvd3NcIikge1xuICAgICAgICBpZiAoZW5hYmxlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgd2hlblJlYWR5KHN0YXJ0Tm9uQ2xpZW50UmVnaW9uVHJhY2tpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xufVxuXG5pZiAoaGFzRE9NICYmICF0cnlTdGFydE5vbkNsaWVudFJlZ2lvblRyYWNraW5nKCkpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihydW50aW1lQ29uZmlnUmVhZHlFdmVudCwgdHJ5U3RhcnROb25DbGllbnRSZWdpb25UcmFja2luZywgeyBvbmNlOiB0cnVlIH0pO1xufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQXBwbGljYXRpb24pO1xuXG5jb25zdCBIaWRlTWV0aG9kID0gMDtcbmNvbnN0IFNob3dNZXRob2QgPSAxO1xuY29uc3QgUXVpdE1ldGhvZCA9IDI7XG5cbi8qKlxuICogSGlkZXMgYSBjZXJ0YWluIG1ldGhvZCBieSBjYWxsaW5nIHRoZSBIaWRlTWV0aG9kIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSGlkZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gY2FsbChIaWRlTWV0aG9kKTtcbn1cblxuLyoqXG4gKiBDYWxscyB0aGUgU2hvd01ldGhvZCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gU2hvdygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gY2FsbChTaG93TWV0aG9kKTtcbn1cblxuLyoqXG4gKiBDYWxscyB0aGUgUXVpdE1ldGhvZCB0byB0ZXJtaW5hdGUgdGhlIHByb2dyYW0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWl0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBjYWxsKFF1aXRNZXRob2QpO1xufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5Ccm93c2VyKTtcblxuY29uc3QgQnJvd3Nlck9wZW5VUkwgPSAwO1xuXG4vKipcbiAqIE9wZW4gYSBicm93c2VyIHdpbmRvdyB0byB0aGUgZ2l2ZW4gVVJMLlxuICpcbiAqIEBwYXJhbSB1cmwgLSBUaGUgVVJMIHRvIG9wZW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9wZW5VUkwodXJsOiBzdHJpbmcgfCBVUkwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gY2FsbChCcm93c2VyT3BlblVSTCwge3VybDogdXJsLnRvU3RyaW5nKCl9KTtcbn1cbiIsIi8vIFNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL2luc3BlY3QtanMvaXMtY2FsbGFibGVcblxuLy8gVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDE1IEpvcmRhbiBIYXJiYW5kXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuLy8gY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4vLyBTT0ZUV0FSRS5cblxudmFyIGZuVG9TdHIgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgcmVmbGVjdEFwcGx5OiB0eXBlb2YgUmVmbGVjdC5hcHBseSB8IGZhbHNlIHwgbnVsbCA9IHR5cGVvZiBSZWZsZWN0ID09PSAnb2JqZWN0JyAmJiBSZWZsZWN0ICE9PSBudWxsICYmIFJlZmxlY3QuYXBwbHk7XG52YXIgYmFkQXJyYXlMaWtlOiBhbnk7XG52YXIgaXNDYWxsYWJsZU1hcmtlcjogYW55O1xuaWYgKHR5cGVvZiByZWZsZWN0QXBwbHkgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICAgIGJhZEFycmF5TGlrZSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2xlbmd0aCcsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRocm93IGlzQ2FsbGFibGVNYXJrZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpc0NhbGxhYmxlTWFya2VyID0ge307XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10aHJvdy1saXRlcmFsXG4gICAgICAgIHJlZmxlY3RBcHBseShmdW5jdGlvbiAoKSB7IHRocm93IDQyOyB9LCBudWxsLCBiYWRBcnJheUxpa2UpO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgaWYgKF8gIT09IGlzQ2FsbGFibGVNYXJrZXIpIHtcbiAgICAgICAgICAgIHJlZmxlY3RBcHBseSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59IGVsc2Uge1xuICAgIHJlZmxlY3RBcHBseSA9IG51bGw7XG59XG5cbnZhciBjb25zdHJ1Y3RvclJlZ2V4ID0gL15cXHMqY2xhc3NcXGIvO1xudmFyIGlzRVM2Q2xhc3NGbiA9IGZ1bmN0aW9uIGlzRVM2Q2xhc3NGdW5jdGlvbih2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIGZuU3RyID0gZm5Ub1N0ci5jYWxsKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yUmVnZXgudGVzdChmblN0cik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIG5vdCBhIGZ1bmN0aW9uXG4gICAgfVxufTtcblxudmFyIHRyeUZ1bmN0aW9uT2JqZWN0ID0gZnVuY3Rpb24gdHJ5RnVuY3Rpb25Ub1N0cih2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKGlzRVM2Q2xhc3NGbih2YWx1ZSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIGZuVG9TdHIuY2FsbCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIG9iamVjdENsYXNzID0gJ1tvYmplY3QgT2JqZWN0XSc7XG52YXIgZm5DbGFzcyA9ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG52YXIgZ2VuQ2xhc3MgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nO1xudmFyIGRkYUNsYXNzID0gJ1tvYmplY3QgSFRNTEFsbENvbGxlY3Rpb25dJzsgLy8gSUUgMTFcbnZhciBkZGFDbGFzczIgPSAnW29iamVjdCBIVE1MIGRvY3VtZW50LmFsbCBjbGFzc10nO1xudmFyIGRkYUNsYXNzMyA9ICdbb2JqZWN0IEhUTUxDb2xsZWN0aW9uXSc7IC8vIElFIDktMTBcbnZhciBoYXNUb1N0cmluZ1RhZyA9IHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgISFTeW1ib2wudG9TdHJpbmdUYWc7IC8vIGJldHRlcjogdXNlIGBoYXMtdG9zdHJpbmd0YWdgXG5cbnZhciBpc0lFNjggPSAhKDAgaW4gWyxdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zcGFyc2UtYXJyYXlzLCBjb21tYS1zcGFjaW5nXG5cbnZhciBpc0REQTogKHZhbHVlOiBhbnkpID0+IGJvb2xlYW4gPSBmdW5jdGlvbiBpc0RvY3VtZW50RG90QWxsKCkgeyByZXR1cm4gZmFsc2U7IH07XG5pZiAodHlwZW9mIGRvY3VtZW50ID09PSAnb2JqZWN0Jykge1xuICAgIC8vIEZpcmVmb3ggMyBjYW5vbmljYWxpemVzIEREQSB0byB1bmRlZmluZWQgd2hlbiBpdCdzIG5vdCBhY2Nlc3NlZCBkaXJlY3RseVxuICAgIHZhciBhbGwgPSBkb2N1bWVudC5hbGw7XG4gICAgaWYgKHRvU3RyLmNhbGwoYWxsKSA9PT0gdG9TdHIuY2FsbChkb2N1bWVudC5hbGwpKSB7XG4gICAgICAgIGlzRERBID0gZnVuY3Rpb24gaXNEb2N1bWVudERvdEFsbCh2YWx1ZSkge1xuICAgICAgICAgICAgLyogZ2xvYmFscyBkb2N1bWVudDogZmFsc2UgKi9cbiAgICAgICAgICAgIC8vIGluIElFIDYtOCwgdHlwZW9mIGRvY3VtZW50LmFsbCBpcyBcIm9iamVjdFwiIGFuZCBpdCdzIHRydXRoeVxuICAgICAgICAgICAgaWYgKChpc0lFNjggfHwgIXZhbHVlKSAmJiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHIgPSB0b1N0ci5jYWxsKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciA9PT0gZGRhQ2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IHN0ciA9PT0gZGRhQ2xhc3MyXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBzdHIgPT09IGRkYUNsYXNzMyAvLyBvcGVyYSAxMi4xNlxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgc3RyID09PSBvYmplY3RDbGFzcyAvLyBJRSA2LThcbiAgICAgICAgICAgICAgICAgICAgKSAmJiB2YWx1ZSgnJykgPT0gbnVsbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7IC8qKi8gfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNDYWxsYWJsZVJlZkFwcGx5PFQ+KHZhbHVlOiBUIHwgdW5rbm93bik6IHZhbHVlIGlzICguLi5hcmdzOiBhbnlbXSkgPT4gYW55ICB7XG4gICAgaWYgKGlzRERBKHZhbHVlKSkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIGlmICghdmFsdWUpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIHRyeSB7XG4gICAgICAgIChyZWZsZWN0QXBwbHkgYXMgYW55KSh2YWx1ZSwgbnVsbCwgYmFkQXJyYXlMaWtlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlICE9PSBpc0NhbGxhYmxlTWFya2VyKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIH1cbiAgICByZXR1cm4gIWlzRVM2Q2xhc3NGbih2YWx1ZSkgJiYgdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpO1xufVxuXG5mdW5jdGlvbiBpc0NhbGxhYmxlTm9SZWZBcHBseTxUPih2YWx1ZTogVCB8IHVua25vd24pOiB2YWx1ZSBpcyAoLi4uYXJnczogYW55W10pID0+IGFueSB7XG4gICAgaWYgKGlzRERBKHZhbHVlKSkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIGlmICghdmFsdWUpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIGlmIChoYXNUb1N0cmluZ1RhZykgeyByZXR1cm4gdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpOyB9XG4gICAgaWYgKGlzRVM2Q2xhc3NGbih2YWx1ZSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdmFyIHN0ckNsYXNzID0gdG9TdHIuY2FsbCh2YWx1ZSk7XG4gICAgaWYgKHN0ckNsYXNzICE9PSBmbkNsYXNzICYmIHN0ckNsYXNzICE9PSBnZW5DbGFzcyAmJiAhKC9eXFxbb2JqZWN0IEhUTUwvKS50ZXN0KHN0ckNsYXNzKSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICByZXR1cm4gdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgcmVmbGVjdEFwcGx5ID8gaXNDYWxsYWJsZVJlZkFwcGx5IDogaXNDYWxsYWJsZU5vUmVmQXBwbHk7XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IGlzQ2FsbGFibGUgZnJvbSBcIi4vY2FsbGFibGUuanNcIjtcblxuLyoqXG4gKiBFeGNlcHRpb24gY2xhc3MgdGhhdCB3aWxsIGJlIHVzZWQgYXMgcmVqZWN0aW9uIHJlYXNvblxuICogaW4gY2FzZSBhIHtAbGluayBDYW5jZWxsYWJsZVByb21pc2V9IGlzIGNhbmNlbGxlZCBzdWNjZXNzZnVsbHkuXG4gKlxuICogVGhlIHZhbHVlIG9mIHRoZSB7QGxpbmsgbmFtZX0gcHJvcGVydHkgaXMgdGhlIHN0cmluZyBgXCJDYW5jZWxFcnJvclwiYC5cbiAqIFRoZSB2YWx1ZSBvZiB0aGUge0BsaW5rIGNhdXNlfSBwcm9wZXJ0eSBpcyB0aGUgY2F1c2UgcGFzc2VkIHRvIHRoZSBjYW5jZWwgbWV0aG9kLCBpZiBhbnkuXG4gKi9cbmV4cG9ydCBjbGFzcyBDYW5jZWxFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGBDYW5jZWxFcnJvcmAgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBFcnJvciBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBvcHRpb25zPzogRXJyb3JPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm5hbWUgPSBcIkNhbmNlbEVycm9yXCI7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4Y2VwdGlvbiBjbGFzcyB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgYXMgYW4gdW5oYW5kbGVkIHJlamVjdGlvblxuICogaW4gY2FzZSBhIHtAbGluayBDYW5jZWxsYWJsZVByb21pc2V9IHJlamVjdHMgYWZ0ZXIgYmVpbmcgY2FuY2VsbGVkLFxuICogb3Igd2hlbiB0aGUgYG9uY2FuY2VsbGVkYCBjYWxsYmFjayB0aHJvd3Mgb3IgcmVqZWN0cy5cbiAqXG4gKiBUaGUgdmFsdWUgb2YgdGhlIHtAbGluayBuYW1lfSBwcm9wZXJ0eSBpcyB0aGUgc3RyaW5nIGBcIkNhbmNlbGxlZFJlamVjdGlvbkVycm9yXCJgLlxuICogVGhlIHZhbHVlIG9mIHRoZSB7QGxpbmsgY2F1c2V9IHByb3BlcnR5IGlzIHRoZSByZWFzb24gdGhlIHByb21pc2UgcmVqZWN0ZWQgd2l0aC5cbiAqXG4gKiBCZWNhdXNlIHRoZSBvcmlnaW5hbCBwcm9taXNlIHdhcyBjYW5jZWxsZWQsXG4gKiBhIHdyYXBwZXIgcHJvbWlzZSB3aWxsIGJlIHBhc3NlZCB0byB0aGUgdW5oYW5kbGVkIHJlamVjdGlvbiBsaXN0ZW5lciBpbnN0ZWFkLlxuICogVGhlIHtAbGluayBwcm9taXNlfSBwcm9wZXJ0eSBob2xkcyBhIHJlZmVyZW5jZSB0byB0aGUgb3JpZ2luYWwgcHJvbWlzZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENhbmNlbGxlZFJlamVjdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIC8qKlxuICAgICAqIEhvbGRzIGEgcmVmZXJlbmNlIHRvIHRoZSBwcm9taXNlIHRoYXQgd2FzIGNhbmNlbGxlZCBhbmQgdGhlbiByZWplY3RlZC5cbiAgICAgKi9cbiAgICBwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj47XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcmAgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHByb21pc2UgLSBUaGUgcHJvbWlzZSB0aGF0IGNhdXNlZCB0aGUgZXJyb3Igb3JpZ2luYWxseS5cbiAgICAgKiBAcGFyYW0gcmVhc29uIC0gVGhlIHJlamVjdGlvbiByZWFzb24uXG4gICAgICogQHBhcmFtIGluZm8gLSBBbiBvcHRpb25hbCBpbmZvcm1hdGl2ZSBtZXNzYWdlIHNwZWNpZnlpbmcgdGhlIGNpcmN1bXN0YW5jZXMgaW4gd2hpY2ggdGhlIGVycm9yIHdhcyB0aHJvd24uXG4gICAgICogICAgICAgICAgICAgICBEZWZhdWx0cyB0byB0aGUgc3RyaW5nIGBcIlVuaGFuZGxlZCByZWplY3Rpb24gaW4gY2FuY2VsbGVkIHByb21pc2UuXCJgLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByb21pc2U6IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPiwgcmVhc29uPzogYW55LCBpbmZvPzogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKChpbmZvID8/IFwiVW5oYW5kbGVkIHJlamVjdGlvbiBpbiBjYW5jZWxsZWQgcHJvbWlzZS5cIikgKyBcIiBSZWFzb246IFwiICsgZXJyb3JNZXNzYWdlKHJlYXNvbiksIHsgY2F1c2U6IHJlYXNvbiB9KTtcbiAgICAgICAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgdGhpcy5uYW1lID0gXCJDYW5jZWxsZWRSZWplY3Rpb25FcnJvclwiO1xuICAgIH1cbn1cblxudHlwZSBDYW5jZWxsYWJsZVByb21pc2VSZXNvbHZlcjxUPiA9ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+IHwgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUPikgPT4gdm9pZDtcbnR5cGUgQ2FuY2VsbGFibGVQcm9taXNlUmVqZWN0b3IgPSAocmVhc29uPzogYW55KSA9PiB2b2lkO1xudHlwZSBDYW5jZWxsYWJsZVByb21pc2VDYW5jZWxsZXIgPSAoY2F1c2U/OiBhbnkpID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPjtcbnR5cGUgQ2FuY2VsbGFibGVQcm9taXNlRXhlY3V0b3I8VD4gPSAocmVzb2x2ZTogQ2FuY2VsbGFibGVQcm9taXNlUmVzb2x2ZXI8VD4sIHJlamVjdDogQ2FuY2VsbGFibGVQcm9taXNlUmVqZWN0b3IpID0+IHZvaWQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUPiB7XG4gICAgdGhlbjxUUmVzdWx0MSA9IFQsIFRSZXN1bHQyID0gbmV2ZXI+KG9uZnVsZmlsbGVkPzogKCh2YWx1ZTogVCkgPT4gVFJlc3VsdDEgfCBQcm9taXNlTGlrZTxUUmVzdWx0MT4gfCBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFRSZXN1bHQxPikgfCB1bmRlZmluZWQgfCBudWxsLCBvbnJlamVjdGVkPzogKChyZWFzb246IGFueSkgPT4gVFJlc3VsdDIgfCBQcm9taXNlTGlrZTxUUmVzdWx0Mj4gfCBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFRSZXN1bHQyPikgfCB1bmRlZmluZWQgfCBudWxsKTogQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUUmVzdWx0MSB8IFRSZXN1bHQyPjtcbiAgICBjYW5jZWwoY2F1c2U/OiBhbnkpOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD47XG59XG5cbi8qKlxuICogV3JhcHMgYSBjYW5jZWxsYWJsZSBwcm9taXNlIGFsb25nIHdpdGggaXRzIHJlc29sdXRpb24gbWV0aG9kcy5cbiAqIFRoZSBgb25jYW5jZWxsZWRgIGZpZWxkIHdpbGwgYmUgbnVsbCBpbml0aWFsbHkgYnV0IG1heSBiZSBzZXQgdG8gcHJvdmlkZSBhIGN1c3RvbSBjYW5jZWxsYXRpb24gZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiB7XG4gICAgcHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+O1xuICAgIHJlc29sdmU6IENhbmNlbGxhYmxlUHJvbWlzZVJlc29sdmVyPFQ+O1xuICAgIHJlamVjdDogQ2FuY2VsbGFibGVQcm9taXNlUmVqZWN0b3I7XG4gICAgb25jYW5jZWxsZWQ6IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlciB8IG51bGw7XG59XG5cbmludGVyZmFjZSBDYW5jZWxsYWJsZVByb21pc2VTdGF0ZSB7XG4gICAgcmVhZG9ubHkgcm9vdDogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGU7XG4gICAgcmVzb2x2aW5nOiBib29sZWFuO1xuICAgIHNldHRsZWQ6IGJvb2xlYW47XG4gICAgcmVhc29uPzogQ2FuY2VsRXJyb3I7XG59XG5cbi8vIFByaXZhdGUgZmllbGQgbmFtZXMuXG5jb25zdCBiYXJyaWVyU3ltID0gU3ltYm9sKFwiYmFycmllclwiKTtcbmNvbnN0IGNhbmNlbEltcGxTeW0gPSBTeW1ib2woXCJjYW5jZWxJbXBsXCIpO1xuY29uc3Qgc3BlY2llczogdHlwZW9mIFN5bWJvbC5zcGVjaWVzID0gU3ltYm9sLnNwZWNpZXMgPz8gU3ltYm9sKFwic3BlY2llc1BvbHlmaWxsXCIpO1xuXG4vKipcbiAqIEEgcHJvbWlzZSB3aXRoIGFuIGF0dGFjaGVkIG1ldGhvZCBmb3IgY2FuY2VsbGluZyBsb25nLXJ1bm5pbmcgb3BlcmF0aW9ucyAoc2VlIHtAbGluayBDYW5jZWxsYWJsZVByb21pc2UjY2FuY2VsfSkuXG4gKiBDYW5jZWxsYXRpb24gY2FuIG9wdGlvbmFsbHkgYmUgYm91bmQgdG8gYW4ge0BsaW5rIEFib3J0U2lnbmFsfVxuICogZm9yIGJldHRlciBjb21wb3NhYmlsaXR5IChzZWUge0BsaW5rIENhbmNlbGxhYmxlUHJvbWlzZSNjYW5jZWxPbn0pLlxuICpcbiAqIENhbmNlbGxpbmcgYSBwZW5kaW5nIHByb21pc2Ugd2lsbCByZXN1bHQgaW4gYW4gaW1tZWRpYXRlIHJlamVjdGlvblxuICogd2l0aCBhbiBpbnN0YW5jZSBvZiB7QGxpbmsgQ2FuY2VsRXJyb3J9IGFzIHJlYXNvbixcbiAqIGJ1dCB3aG9ldmVyIHN0YXJ0ZWQgdGhlIHByb21pc2Ugd2lsbCBiZSByZXNwb25zaWJsZVxuICogZm9yIGFjdHVhbGx5IGFib3J0aW5nIHRoZSB1bmRlcmx5aW5nIG9wZXJhdGlvbi5cbiAqIFRvIHRoaXMgcHVycG9zZSwgdGhlIGNvbnN0cnVjdG9yIGFuZCBhbGwgY2hhaW5pbmcgbWV0aG9kc1xuICogYWNjZXB0IG9wdGlvbmFsIGNhbmNlbGxhdGlvbiBjYWxsYmFja3MuXG4gKlxuICogSWYgYSBgQ2FuY2VsbGFibGVQcm9taXNlYCBzdGlsbCByZXNvbHZlcyBhZnRlciBoYXZpbmcgYmVlbiBjYW5jZWxsZWQsXG4gKiB0aGUgcmVzdWx0IHdpbGwgYmUgZGlzY2FyZGVkLiBJZiBpdCByZWplY3RzLCB0aGUgcmVhc29uXG4gKiB3aWxsIGJlIHJlcG9ydGVkIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24sXG4gKiB3cmFwcGVkIGluIGEge0BsaW5rIENhbmNlbGxlZFJlamVjdGlvbkVycm9yfSBpbnN0YW5jZS5cbiAqIFRvIGZhY2lsaXRhdGUgdGhlIGhhbmRsaW5nIG9mIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyxcbiAqIGNhbmNlbGxlZCBgQ2FuY2VsbGFibGVQcm9taXNlYHMgd2lsbCBfbm90XyByZXBvcnQgdW5oYW5kbGVkIGBDYW5jZWxFcnJvcmBzXG4gKiB3aG9zZSBgY2F1c2VgIGZpZWxkIGlzIHRoZSBzYW1lIGFzIHRoZSBvbmUgd2l0aCB3aGljaCB0aGUgY3VycmVudCBwcm9taXNlIHdhcyBjYW5jZWxsZWQuXG4gKlxuICogQWxsIHVzdWFsIHByb21pc2UgbWV0aG9kcyBhcmUgZGVmaW5lZCBhbmQgcmV0dXJuIGEgYENhbmNlbGxhYmxlUHJvbWlzZWBcbiAqIHdob3NlIGNhbmNlbCBtZXRob2Qgd2lsbCBjYW5jZWwgdGhlIHBhcmVudCBvcGVyYXRpb24gYXMgd2VsbCwgcHJvcGFnYXRpbmcgdGhlIGNhbmNlbGxhdGlvbiByZWFzb25cbiAqIHVwd2FyZHMgdGhyb3VnaCBwcm9taXNlIGNoYWlucy5cbiAqIENvbnZlcnNlbHksIGNhbmNlbGxpbmcgYSBwcm9taXNlIHdpbGwgbm90IGF1dG9tYXRpY2FsbHkgY2FuY2VsIGRlcGVuZGVudCBwcm9taXNlcyBkb3duc3RyZWFtOlxuICogYGBgdHNcbiAqIGxldCByb290ID0gbmV3IENhbmNlbGxhYmxlUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7IC4uLiB9KTtcbiAqIGxldCBjaGlsZDEgPSByb290LnRoZW4oKCkgPT4geyAuLi4gfSk7XG4gKiBsZXQgY2hpbGQyID0gY2hpbGQxLnRoZW4oKCkgPT4geyAuLi4gfSk7XG4gKiBsZXQgY2hpbGQzID0gcm9vdC5jYXRjaCgoKSA9PiB7IC4uLiB9KTtcbiAqIGNoaWxkMS5jYW5jZWwoKTsgLy8gQ2FuY2VscyBjaGlsZDEgYW5kIHJvb3QsIGJ1dCBub3QgY2hpbGQyIG9yIGNoaWxkM1xuICogYGBgXG4gKiBDYW5jZWxsaW5nIGEgcHJvbWlzZSB0aGF0IGhhcyBhbHJlYWR5IHNldHRsZWQgaXMgc2FmZSBhbmQgaGFzIG5vIGNvbnNlcXVlbmNlLlxuICpcbiAqIFRoZSBgY2FuY2VsYCBtZXRob2QgcmV0dXJucyBhIHByb21pc2UgdGhhdCBfYWx3YXlzIGZ1bGZpbGxzX1xuICogYWZ0ZXIgdGhlIHdob2xlIGNoYWluIGhhcyBwcm9jZXNzZWQgdGhlIGNhbmNlbCByZXF1ZXN0XG4gKiBhbmQgYWxsIGF0dGFjaGVkIGNhbGxiYWNrcyB1cCB0byB0aGF0IG1vbWVudCBoYXZlIHJ1bi5cbiAqXG4gKiBBbGwgRVMyMDI0IHByb21pc2UgbWV0aG9kcyAoc3RhdGljIGFuZCBpbnN0YW5jZSkgYXJlIGRlZmluZWQgb24gQ2FuY2VsbGFibGVQcm9taXNlLFxuICogYnV0IGFjdHVhbCBhdmFpbGFiaWxpdHkgbWF5IHZhcnkgd2l0aCBPUy93ZWJ2aWV3IHZlcnNpb24uXG4gKlxuICogSW4gbGluZSB3aXRoIHRoZSBwcm9wb3NhbCBhdCBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1ybS1idWlsdGluLXN1YmNsYXNzaW5nLFxuICogYENhbmNlbGxhYmxlUHJvbWlzZWAgZG9lcyBub3Qgc3VwcG9ydCB0cmFuc3BhcmVudCBzdWJjbGFzc2luZy5cbiAqIEV4dGVuZGVycyBzaG91bGQgdGFrZSBjYXJlIHRvIHByb3ZpZGUgdGhlaXIgb3duIG1ldGhvZCBpbXBsZW1lbnRhdGlvbnMuXG4gKiBUaGlzIG1pZ2h0IGJlIHJlY29uc2lkZXJlZCBpbiBjYXNlIHRoZSBwcm9wb3NhbCBpcyByZXRpcmVkLlxuICpcbiAqIENhbmNlbGxhYmxlUHJvbWlzZSBpcyBhIHdyYXBwZXIgYXJvdW5kIHRoZSBET00gUHJvbWlzZSBvYmplY3RcbiAqIGFuZCBpcyBjb21wbGlhbnQgd2l0aCB0aGUgW1Byb21pc2VzL0ErIHNwZWNpZmljYXRpb25dKGh0dHBzOi8vcHJvbWlzZXNhcGx1cy5jb20vKVxuICogKGl0IHBhc3NlcyB0aGUgW2NvbXBsaWFuY2Ugc3VpdGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy10ZXN0cykpXG4gKiBpZiBzbyBpcyB0aGUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIENhbmNlbGxhYmxlUHJvbWlzZTxUPiBleHRlbmRzIFByb21pc2U8VD4gaW1wbGVtZW50cyBQcm9taXNlTGlrZTxUPiwgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUPiB7XG4gICAgLy8gUHJpdmF0ZSBmaWVsZHMuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByaXZhdGUgW2JhcnJpZXJTeW1dITogUGFydGlhbDxQcm9taXNlV2l0aFJlc29sdmVyczx2b2lkPj4gfCBudWxsO1xuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIHJlYWRvbmx5IFtjYW5jZWxJbXBsU3ltXSE6IChyZWFzb246IENhbmNlbEVycm9yKSA9PiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD47XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGBDYW5jZWxsYWJsZVByb21pc2VgLlxuICAgICAqXG4gICAgICogQHBhcmFtIGV4ZWN1dG9yIC0gQSBjYWxsYmFjayB1c2VkIHRvIGluaXRpYWxpemUgdGhlIHByb21pc2UuIFRoaXMgY2FsbGJhY2sgaXMgcGFzc2VkIHR3byBhcmd1bWVudHM6XG4gICAgICogICAgICAgICAgICAgICAgICAgYSBgcmVzb2x2ZWAgY2FsbGJhY2sgdXNlZCB0byByZXNvbHZlIHRoZSBwcm9taXNlIHdpdGggYSB2YWx1ZVxuICAgICAqICAgICAgICAgICAgICAgICAgIG9yIHRoZSByZXN1bHQgb2YgYW5vdGhlciBwcm9taXNlIChwb3NzaWJseSBjYW5jZWxsYWJsZSksXG4gICAgICogICAgICAgICAgICAgICAgICAgYW5kIGEgYHJlamVjdGAgY2FsbGJhY2sgdXNlZCB0byByZWplY3QgdGhlIHByb21pc2Ugd2l0aCBhIHByb3ZpZGVkIHJlYXNvbiBvciBlcnJvci5cbiAgICAgKiAgICAgICAgICAgICAgICAgICBJZiB0aGUgdmFsdWUgcHJvdmlkZWQgdG8gdGhlIGByZXNvbHZlYCBjYWxsYmFjayBpcyBhIHRoZW5hYmxlIF9hbmRfIGNhbmNlbGxhYmxlIG9iamVjdFxuICAgICAqICAgICAgICAgICAgICAgICAgIChpdCBoYXMgYSBgdGhlbmAgX2FuZF8gYSBgY2FuY2VsYCBtZXRob2QpLFxuICAgICAqICAgICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGF0IG9iamVjdCBhbmQgdGhlIG9uY2FuY2VsbGVkIHdpbGwgbm90IGJlIGludm9rZWQgYW55bW9yZS5cbiAgICAgKiAgICAgICAgICAgICAgICAgICBJZiBhbnkgb25lIG9mIHRoZSB0d28gY2FsbGJhY2tzIGlzIGNhbGxlZCBfYWZ0ZXJfIHRoZSBwcm9taXNlIGhhcyBiZWVuIGNhbmNlbGxlZCxcbiAgICAgKiAgICAgICAgICAgICAgICAgICB0aGUgcHJvdmlkZWQgdmFsdWVzIHdpbGwgYmUgY2FuY2VsbGVkIGFuZCByZXNvbHZlZCBhcyB1c3VhbCxcbiAgICAgKiAgICAgICAgICAgICAgICAgICBidXQgdGhlaXIgcmVzdWx0cyB3aWxsIGJlIGRpc2NhcmRlZC5cbiAgICAgKiAgICAgICAgICAgICAgICAgICBIb3dldmVyLCBpZiB0aGUgcmVzb2x1dGlvbiBwcm9jZXNzIHVsdGltYXRlbHkgZW5kcyB1cCBpbiBhIHJlamVjdGlvblxuICAgICAqICAgICAgICAgICAgICAgICAgIHRoYXQgaXMgbm90IGR1ZSB0byBjYW5jZWxsYXRpb24sIHRoZSByZWplY3Rpb24gcmVhc29uXG4gICAgICogICAgICAgICAgICAgICAgICAgd2lsbCBiZSB3cmFwcGVkIGluIGEge0BsaW5rIENhbmNlbGxlZFJlamVjdGlvbkVycm9yfVxuICAgICAqICAgICAgICAgICAgICAgICAgIGFuZCBidWJibGVkIHVwIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXG4gICAgICogQHBhcmFtIG9uY2FuY2VsbGVkIC0gSXQgaXMgdGhlIGNhbGxlcidzIHJlc3BvbnNpYmlsaXR5IHRvIGVuc3VyZSB0aGF0IGFueSBvcGVyYXRpb25cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICBzdGFydGVkIGJ5IHRoZSBleGVjdXRvciBpcyBwcm9wZXJseSBoYWx0ZWQgdXBvbiBjYW5jZWxsYXRpb24uXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgVGhpcyBvcHRpb25hbCBjYWxsYmFjayBjYW4gYmUgdXNlZCB0byB0aGF0IHB1cnBvc2UuXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgSXQgd2lsbCBiZSBjYWxsZWQgX3N5bmNocm9ub3VzbHlfIHdpdGggYSBjYW5jZWxsYXRpb24gY2F1c2VcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICB3aGVuIGNhbmNlbGxhdGlvbiBpcyByZXF1ZXN0ZWQsIF9hZnRlcl8gdGhlIHByb21pc2UgaGFzIGFscmVhZHkgcmVqZWN0ZWRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICB3aXRoIGEge0BsaW5rIENhbmNlbEVycm9yfSwgYnV0IF9iZWZvcmVfXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgYW55IHtAbGluayB0aGVufS97QGxpbmsgY2F0Y2h9L3tAbGluayBmaW5hbGx5fSBjYWxsYmFjayBydW5zLlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIElmIHRoZSBjYWxsYmFjayByZXR1cm5zIGEgdGhlbmFibGUsIHRoZSBwcm9taXNlIHJldHVybmVkIGZyb20ge0BsaW5rIGNhbmNlbH1cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICB3aWxsIG9ubHkgZnVsZmlsbCBhZnRlciB0aGUgZm9ybWVyIGhhcyBzZXR0bGVkLlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIFVuaGFuZGxlZCBleGNlcHRpb25zIG9yIHJlamVjdGlvbnMgZnJvbSB0aGUgY2FsbGJhY2sgd2lsbCBiZSB3cmFwcGVkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGFuZCBidWJibGVkIHVwIGFzIHVuaGFuZGxlZCByZWplY3Rpb25zLlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIElmIHRoZSBgcmVzb2x2ZWAgY2FsbGJhY2sgaXMgY2FsbGVkIGJlZm9yZSBjYW5jZWxsYXRpb24gd2l0aCBhIGNhbmNlbGxhYmxlIHByb21pc2UsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIG9uIHRoaXMgcHJvbWlzZSB3aWxsIGJlIGRpdmVydGVkIHRvIHRoYXQgcHJvbWlzZSxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICBhbmQgdGhlIG9yaWdpbmFsIGBvbmNhbmNlbGxlZGAgY2FsbGJhY2sgd2lsbCBiZSBkaXNjYXJkZWQuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZXhlY3V0b3I6IENhbmNlbGxhYmxlUHJvbWlzZUV4ZWN1dG9yPFQ+LCBvbmNhbmNlbGxlZD86IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlcikge1xuICAgICAgICBsZXQgcmVzb2x2ZSE6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICAgICAgICBsZXQgcmVqZWN0ITogKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcbiAgICAgICAgc3VwZXIoKHJlcywgcmVqKSA9PiB7IHJlc29sdmUgPSByZXM7IHJlamVjdCA9IHJlajsgfSk7XG5cbiAgICAgICAgaWYgKCh0aGlzLmNvbnN0cnVjdG9yIGFzIGFueSlbc3BlY2llc10gIT09IFByb21pc2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5jZWxsYWJsZVByb21pc2UgZG9lcyBub3Qgc3VwcG9ydCB0cmFuc3BhcmVudCBzdWJjbGFzc2luZy4gUGxlYXNlIHJlZnJhaW4gZnJvbSBvdmVycmlkaW5nIHRoZSBbU3ltYm9sLnNwZWNpZXNdIHN0YXRpYyBwcm9wZXJ0eS5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiA9IHtcbiAgICAgICAgICAgIHByb21pc2U6IHRoaXMsXG4gICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgcmVqZWN0LFxuICAgICAgICAgICAgZ2V0IG9uY2FuY2VsbGVkKCkgeyByZXR1cm4gb25jYW5jZWxsZWQgPz8gbnVsbDsgfSxcbiAgICAgICAgICAgIHNldCBvbmNhbmNlbGxlZChjYikgeyBvbmNhbmNlbGxlZCA9IGNiID8/IHVuZGVmaW5lZDsgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHN0YXRlOiBDYW5jZWxsYWJsZVByb21pc2VTdGF0ZSA9IHtcbiAgICAgICAgICAgIGdldCByb290KCkgeyByZXR1cm4gc3RhdGU7IH0sXG4gICAgICAgICAgICByZXNvbHZpbmc6IGZhbHNlLFxuICAgICAgICAgICAgc2V0dGxlZDogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTZXR1cCBjYW5jZWxsYXRpb24gc3lzdGVtLlxuICAgICAgICB2b2lkIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgICAgIFtiYXJyaWVyU3ltXToge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbY2FuY2VsSW1wbFN5bV06IHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2FuY2VsbGVyRm9yKHByb21pc2UsIHN0YXRlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSdW4gdGhlIGFjdHVhbCBleGVjdXRvci5cbiAgICAgICAgY29uc3QgcmVqZWN0b3IgPSByZWplY3RvckZvcihwcm9taXNlLCBzdGF0ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBleGVjdXRvcihyZXNvbHZlckZvcihwcm9taXNlLCBzdGF0ZSksIHJlamVjdG9yKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoc3RhdGUucmVzb2x2aW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmhhbmRsZWQgZXhjZXB0aW9uIGluIENhbmNlbGxhYmxlUHJvbWlzZSBleGVjdXRvci5cIiwgZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0b3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbmNlbHMgaW1tZWRpYXRlbHkgdGhlIGV4ZWN1dGlvbiBvZiB0aGUgb3BlcmF0aW9uIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHByb21pc2UuXG4gICAgICogVGhlIHByb21pc2UgcmVqZWN0cyB3aXRoIGEge0BsaW5rIENhbmNlbEVycm9yfSBpbnN0YW5jZSBhcyByZWFzb24sXG4gICAgICogd2l0aCB0aGUge0BsaW5rIENhbmNlbEVycm9yI2NhdXNlfSBwcm9wZXJ0eSBzZXQgdG8gdGhlIGdpdmVuIGFyZ3VtZW50LCBpZiBhbnkuXG4gICAgICpcbiAgICAgKiBIYXMgbm8gZWZmZWN0IGlmIGNhbGxlZCBhZnRlciB0aGUgcHJvbWlzZSBoYXMgYWxyZWFkeSBzZXR0bGVkO1xuICAgICAqIHJlcGVhdGVkIGNhbGxzIGluIHBhcnRpY3VsYXIgYXJlIHNhZmUsIGJ1dCBvbmx5IHRoZSBmaXJzdCBvbmVcbiAgICAgKiB3aWxsIHNldCB0aGUgY2FuY2VsbGF0aW9uIGNhdXNlLlxuICAgICAqXG4gICAgICogVGhlIGBDYW5jZWxFcnJvcmAgZXhjZXB0aW9uIF9uZWVkIG5vdF8gYmUgaGFuZGxlZCBleHBsaWNpdGx5IF9vbiB0aGUgcHJvbWlzZXMgdGhhdCBhcmUgYmVpbmcgY2FuY2VsbGVkOl9cbiAgICAgKiBjYW5jZWxsaW5nIGEgcHJvbWlzZSB3aXRoIG5vIGF0dGFjaGVkIHJlamVjdGlvbiBoYW5kbGVyIGRvZXMgbm90IHRyaWdnZXIgYW4gdW5oYW5kbGVkIHJlamVjdGlvbiBldmVudC5cbiAgICAgKiBUaGVyZWZvcmUsIHRoZSBmb2xsb3dpbmcgaWRpb21zIGFyZSBhbGwgZXF1YWxseSBjb3JyZWN0OlxuICAgICAqIGBgYHRzXG4gICAgICogbmV3IENhbmNlbGxhYmxlUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7IC4uLiB9KS5jYW5jZWwoKTtcbiAgICAgKiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgLi4uIH0pLnRoZW4oLi4uKS5jYW5jZWwoKTtcbiAgICAgKiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgLi4uIH0pLnRoZW4oLi4uKS5jYXRjaCguLi4pLmNhbmNlbCgpO1xuICAgICAqIGBgYFxuICAgICAqIFdoZW5ldmVyIHNvbWUgY2FuY2VsbGVkIHByb21pc2UgaW4gYSBjaGFpbiByZWplY3RzIHdpdGggYSBgQ2FuY2VsRXJyb3JgXG4gICAgICogd2l0aCB0aGUgc2FtZSBjYW5jZWxsYXRpb24gY2F1c2UgYXMgaXRzZWxmLCB0aGUgZXJyb3Igd2lsbCBiZSBkaXNjYXJkZWQgc2lsZW50bHkuXG4gICAgICogSG93ZXZlciwgdGhlIGBDYW5jZWxFcnJvcmAgX3dpbGwgc3RpbGwgYmUgZGVsaXZlcmVkXyB0byBhbGwgYXR0YWNoZWQgcmVqZWN0aW9uIGhhbmRsZXJzXG4gICAgICogYWRkZWQgYnkge0BsaW5rIHRoZW59IGFuZCByZWxhdGVkIG1ldGhvZHM6XG4gICAgICogYGBgdHNcbiAgICAgKiBsZXQgY2FuY2VsbGFibGUgPSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgLi4uIH0pO1xuICAgICAqIGNhbmNlbGxhYmxlLnRoZW4oKCkgPT4geyAuLi4gfSkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAqIGNhbmNlbGxhYmxlLmNhbmNlbCgpOyAvLyBBIENhbmNlbEVycm9yIGlzIHByaW50ZWQgdG8gdGhlIGNvbnNvbGUuXG4gICAgICogYGBgXG4gICAgICogSWYgdGhlIGBDYW5jZWxFcnJvcmAgaXMgbm90IGhhbmRsZWQgZG93bnN0cmVhbSBieSB0aGUgdGltZSBpdCByZWFjaGVzXG4gICAgICogYSBfbm9uLWNhbmNlbGxlZF8gcHJvbWlzZSwgaXQgX3dpbGxfIHRyaWdnZXIgYW4gdW5oYW5kbGVkIHJlamVjdGlvbiBldmVudCxcbiAgICAgKiBqdXN0IGxpa2Ugbm9ybWFsIHJlamVjdGlvbnMgd291bGQ6XG4gICAgICogYGBgdHNcbiAgICAgKiBsZXQgY2FuY2VsbGFibGUgPSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgLi4uIH0pO1xuICAgICAqIGxldCBjaGFpbmVkID0gY2FuY2VsbGFibGUudGhlbigoKSA9PiB7IC4uLiB9KS50aGVuKCgpID0+IHsgLi4uIH0pOyAvLyBObyBjYXRjaC4uLlxuICAgICAqIGNhbmNlbGxhYmxlLmNhbmNlbCgpOyAvLyBVbmhhbmRsZWQgcmVqZWN0aW9uIGV2ZW50IG9uIGNoYWluZWQhXG4gICAgICogYGBgXG4gICAgICogVGhlcmVmb3JlLCBpdCBpcyBpbXBvcnRhbnQgdG8gZWl0aGVyIGNhbmNlbCB3aG9sZSBwcm9taXNlIGNoYWlucyBmcm9tIHRoZWlyIHRhaWwsXG4gICAgICogYXMgc2hvd24gaW4gdGhlIGNvcnJlY3QgaWRpb21zIGFib3ZlLCBvciB0YWtlIGNhcmUgb2YgaGFuZGxpbmcgZXJyb3JzIGV2ZXJ5d2hlcmUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIGNhbmNlbGxhYmxlIHByb21pc2UgdGhhdCBfZnVsZmlsbHNfIGFmdGVyIHRoZSBjYW5jZWwgY2FsbGJhY2sgKGlmIGFueSlcbiAgICAgKiBhbmQgYWxsIGhhbmRsZXJzIGF0dGFjaGVkIHVwIHRvIHRoZSBjYWxsIHRvIGNhbmNlbCBoYXZlIHJ1bi5cbiAgICAgKiBJZiB0aGUgY2FuY2VsIGNhbGxiYWNrIHJldHVybnMgYSB0aGVuYWJsZSwgdGhlIHByb21pc2UgcmV0dXJuZWQgYnkgYGNhbmNlbGBcbiAgICAgKiB3aWxsIGFsc28gd2FpdCBmb3IgdGhhdCB0aGVuYWJsZSB0byBzZXR0bGUuXG4gICAgICogVGhpcyBlbmFibGVzIGNhbGxlcnMgdG8gd2FpdCBmb3IgdGhlIGNhbmNlbGxlZCBvcGVyYXRpb24gdG8gdGVybWluYXRlXG4gICAgICogd2l0aG91dCBiZWluZyBmb3JjZWQgdG8gaGFuZGxlIHBvdGVudGlhbCBlcnJvcnMgYXQgdGhlIGNhbGwgc2l0ZS5cbiAgICAgKiBgYGB0c1xuICAgICAqIGNhbmNlbGxhYmxlLmNhbmNlbCgpLnRoZW4oKCkgPT4ge1xuICAgICAqICAgICAvLyBDbGVhbnVwIGZpbmlzaGVkLCBpdCdzIHNhZmUgdG8gZG8gc29tZXRoaW5nIGVsc2UuXG4gICAgICogfSwgKGVycikgPT4ge1xuICAgICAqICAgICAvLyBVbnJlYWNoYWJsZTogdGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSBjYW5jZWwgd2lsbCBuZXZlciByZWplY3QuXG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICogTm90ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgX25vdF8gaGFuZGxlIGltcGxpY2l0bHkgYW55IHJlamVjdGlvblxuICAgICAqIHRoYXQgbWlnaHQgaGF2ZSBvY2N1cnJlZCBhbHJlYWR5IGluIHRoZSBjYW5jZWxsZWQgY2hhaW4uXG4gICAgICogSXQgd2lsbCBqdXN0IHRyYWNrIHdoZXRoZXIgcmVnaXN0ZXJlZCBoYW5kbGVycyBoYXZlIGJlZW4gZXhlY3V0ZWQgb3Igbm90LlxuICAgICAqIFRoZXJlZm9yZSwgdW5oYW5kbGVkIHJlamVjdGlvbnMgd2lsbCBuZXZlciBiZSBzaWxlbnRseSBoYW5kbGVkIGJ5IGNhbGxpbmcgY2FuY2VsLlxuICAgICAqL1xuICAgIGNhbmNlbChjYXVzZT86IGFueSk6IENhbmNlbGxhYmxlUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyBJTlZBUklBTlQ6IHRoZSByZXN1bHQgb2YgdGhpc1tjYW5jZWxJbXBsU3ltXSBhbmQgdGhlIGJhcnJpZXIgZG8gbm90IGV2ZXIgcmVqZWN0LlxuICAgICAgICAgICAgLy8gVW5mb3J0dW5hdGVseSBtYWNPUyBIaWdoIFNpZXJyYSBkb2VzIG5vdCBzdXBwb3J0IFByb21pc2UuYWxsU2V0dGxlZC5cbiAgICAgICAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICB0aGlzW2NhbmNlbEltcGxTeW1dKG5ldyBDYW5jZWxFcnJvcihcIlByb21pc2UgY2FuY2VsbGVkLlwiLCB7IGNhdXNlIH0pKSxcbiAgICAgICAgICAgICAgICBjdXJyZW50QmFycmllcih0aGlzKVxuICAgICAgICAgICAgXSkudGhlbigoKSA9PiByZXNvbHZlKCksICgpID0+IHJlc29sdmUoKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmRzIHByb21pc2UgY2FuY2VsbGF0aW9uIHRvIHRoZSBhYm9ydCBldmVudCBvZiB0aGUgZ2l2ZW4ge0BsaW5rIEFib3J0U2lnbmFsfS5cbiAgICAgKiBJZiB0aGUgc2lnbmFsIGhhcyBhbHJlYWR5IGFib3J0ZWQsIHRoZSBwcm9taXNlIHdpbGwgYmUgY2FuY2VsbGVkIGltbWVkaWF0ZWx5LlxuICAgICAqIFdoZW4gZWl0aGVyIGNvbmRpdGlvbiBpcyB2ZXJpZmllZCwgdGhlIGNhbmNlbGxhdGlvbiBjYXVzZSB3aWxsIGJlIHNldFxuICAgICAqIHRvIHRoZSBzaWduYWwncyBhYm9ydCByZWFzb24gKHNlZSB7QGxpbmsgQWJvcnRTaWduYWwjcmVhc29ufSkuXG4gICAgICpcbiAgICAgKiBIYXMgbm8gZWZmZWN0IGlmIGNhbGxlZCAob3IgaWYgdGhlIHNpZ25hbCBhYm9ydHMpIF9hZnRlcl8gdGhlIHByb21pc2UgaGFzIGFscmVhZHkgc2V0dGxlZC5cbiAgICAgKiBPbmx5IHRoZSBmaXJzdCBzaWduYWwgdG8gYWJvcnQgd2lsbCBzZXQgdGhlIGNhbmNlbGxhdGlvbiBjYXVzZS5cbiAgICAgKlxuICAgICAqIEZvciBtb3JlIGRldGFpbHMgYWJvdXQgdGhlIGNhbmNlbGxhdGlvbiBwcm9jZXNzLFxuICAgICAqIHNlZSB7QGxpbmsgY2FuY2VsfSBhbmQgdGhlIGBDYW5jZWxsYWJsZVByb21pc2VgIGNvbnN0cnVjdG9yLlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgZW5hYmxlcyBgYXdhaXRgaW5nIGNhbmNlbGxhYmxlIHByb21pc2VzIHdpdGhvdXQgaGF2aW5nXG4gICAgICogdG8gc3RvcmUgdGhlbSBmb3IgZnV0dXJlIGNhbmNlbGxhdGlvbiwgZS5nLjpcbiAgICAgKiBgYGB0c1xuICAgICAqIGF3YWl0IGxvbmdSdW5uaW5nT3BlcmF0aW9uKCkuY2FuY2VsT24oc2lnbmFsKTtcbiAgICAgKiBgYGBcbiAgICAgKiBpbnN0ZWFkIG9mOlxuICAgICAqIGBgYHRzXG4gICAgICogbGV0IHByb21pc2VUb0JlQ2FuY2VsbGVkID0gbG9uZ1J1bm5pbmdPcGVyYXRpb24oKTtcbiAgICAgKiBhd2FpdCBwcm9taXNlVG9CZUNhbmNlbGxlZDtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoaXMgcHJvbWlzZSwgZm9yIG1ldGhvZCBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBjYW5jZWxPbihzaWduYWw6IEFib3J0U2lnbmFsKTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcbiAgICAgICAgaWYgKHNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICB2b2lkIHRoaXMuY2FuY2VsKHNpZ25hbC5yZWFzb24pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCAoKSA9PiB2b2lkIHRoaXMuY2FuY2VsKHNpZ25hbC5yZWFzb24pLCB7Y2FwdHVyZTogdHJ1ZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoZXMgY2FsbGJhY2tzIGZvciB0aGUgcmVzb2x1dGlvbiBhbmQvb3IgcmVqZWN0aW9uIG9mIHRoZSBgQ2FuY2VsbGFibGVQcm9taXNlYC5cbiAgICAgKlxuICAgICAqIFRoZSBvcHRpb25hbCBgb25jYW5jZWxsZWRgIGFyZ3VtZW50IHdpbGwgYmUgaW52b2tlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCxcbiAgICAgKiB3aXRoIHRoZSBzYW1lIHNlbWFudGljcyBhcyB0aGUgYG9uY2FuY2VsbGVkYCBhcmd1bWVudCBvZiB0aGUgY29uc3RydWN0b3IuXG4gICAgICogV2hlbiB0aGUgcGFyZW50IHByb21pc2UgcmVqZWN0cyBvciBpcyBjYW5jZWxsZWQsIHRoZSBgb25yZWplY3RlZGAgY2FsbGJhY2sgd2lsbCBydW4sXG4gICAgICogX2V2ZW4gYWZ0ZXIgdGhlIHJldHVybmVkIHByb21pc2UgaGFzIGJlZW4gY2FuY2VsbGVkOl9cbiAgICAgKiBpbiB0aGF0IGNhc2UsIHNob3VsZCBpdCByZWplY3Qgb3IgdGhyb3csIHRoZSByZWFzb24gd2lsbCBiZSB3cmFwcGVkXG4gICAgICogaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGFuZCBidWJibGVkIHVwIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb25mdWxmaWxsZWQgVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiB0aGUgUHJvbWlzZSBpcyByZXNvbHZlZC5cbiAgICAgKiBAcGFyYW0gb25yZWplY3RlZCBUaGUgY2FsbGJhY2sgdG8gZXhlY3V0ZSB3aGVuIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkLlxuICAgICAqIEByZXR1cm5zIEEgYENhbmNlbGxhYmxlUHJvbWlzZWAgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHdoaWNoZXZlciBjYWxsYmFjayBpcyBleGVjdXRlZC5cbiAgICAgKiBUaGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBob29rZWQgdXAgdG8gcHJvcGFnYXRlIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyB1cCB0aGUgY2hhaW4sIGJ1dCBub3QgZG93bjpcbiAgICAgKlxuICAgICAqICAgLSBpZiB0aGUgcGFyZW50IHByb21pc2UgaXMgY2FuY2VsbGVkLCB0aGUgYG9ucmVqZWN0ZWRgIGhhbmRsZXIgd2lsbCBiZSBpbnZva2VkIHdpdGggYSBgQ2FuY2VsRXJyb3JgXG4gICAgICogICAgIGFuZCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBfd2lsbCByZXNvbHZlIHJlZ3VsYXJseV8gd2l0aCBpdHMgcmVzdWx0O1xuICAgICAqICAgLSBjb252ZXJzZWx5LCBpZiB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBjYW5jZWxsZWQsIF90aGUgcGFyZW50IHByb21pc2UgaXMgY2FuY2VsbGVkIHRvbztfXG4gICAgICogICAgIHRoZSBgb25yZWplY3RlZGAgaGFuZGxlciB3aWxsIHN0aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgcGFyZW50J3MgYENhbmNlbEVycm9yYCxcbiAgICAgKiAgICAgYnV0IGl0cyByZXN1bHQgd2lsbCBiZSBkaXNjYXJkZWRcbiAgICAgKiAgICAgYW5kIHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgcmVqZWN0IHdpdGggYSBgQ2FuY2VsRXJyb3JgIGFzIHdlbGwuXG4gICAgICpcbiAgICAgKiBUaGUgcHJvbWlzZSByZXR1cm5lZCBmcm9tIHtAbGluayBjYW5jZWx9IHdpbGwgZnVsZmlsbCBvbmx5IGFmdGVyIGFsbCBhdHRhY2hlZCBoYW5kbGVyc1xuICAgICAqIHVwIHRoZSBlbnRpcmUgcHJvbWlzZSBjaGFpbiBoYXZlIGJlZW4gcnVuLlxuICAgICAqXG4gICAgICogSWYgZWl0aGVyIGNhbGxiYWNrIHJldHVybnMgYSBjYW5jZWxsYWJsZSBwcm9taXNlLFxuICAgICAqIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyB3aWxsIGJlIGRpdmVydGVkIHRvIGl0LFxuICAgICAqIGFuZCB0aGUgc3BlY2lmaWVkIGBvbmNhbmNlbGxlZGAgY2FsbGJhY2sgd2lsbCBiZSBkaXNjYXJkZWQuXG4gICAgICovXG4gICAgdGhlbjxUUmVzdWx0MSA9IFQsIFRSZXN1bHQyID0gbmV2ZXI+KG9uZnVsZmlsbGVkPzogKCh2YWx1ZTogVCkgPT4gVFJlc3VsdDEgfCBQcm9taXNlTGlrZTxUUmVzdWx0MT4gfCBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFRSZXN1bHQxPikgfCB1bmRlZmluZWQgfCBudWxsLCBvbnJlamVjdGVkPzogKChyZWFzb246IGFueSkgPT4gVFJlc3VsdDIgfCBQcm9taXNlTGlrZTxUUmVzdWx0Mj4gfCBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFRSZXN1bHQyPikgfCB1bmRlZmluZWQgfCBudWxsLCBvbmNhbmNlbGxlZD86IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlcik6IENhbmNlbGxhYmxlUHJvbWlzZTxUUmVzdWx0MSB8IFRSZXN1bHQyPiB7XG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDYW5jZWxsYWJsZVByb21pc2UpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2FuY2VsbGFibGVQcm9taXNlLnByb3RvdHlwZS50aGVuIGNhbGxlZCBvbiBhbiBpbnZhbGlkIG9iamVjdC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOT1RFOiBUeXBlU2NyaXB0J3MgYnVpbHQtaW4gdHlwZSBmb3IgdGhlbiBpcyBicm9rZW4sXG4gICAgICAgIC8vIGFzIGl0IGFsbG93cyBzcGVjaWZ5aW5nIGFuIGFyYml0cmFyeSBUUmVzdWx0MSAhPSBUIGV2ZW4gd2hlbiBvbmZ1bGZpbGxlZCBpcyBub3QgYSBmdW5jdGlvbi5cbiAgICAgICAgLy8gV2UgY2Fubm90IGZpeCBpdCBpZiB3ZSB3YW50IHRvIENhbmNlbGxhYmxlUHJvbWlzZSB0byBpbXBsZW1lbnQgUHJvbWlzZUxpa2U8VD4uXG5cbiAgICAgICAgaWYgKCFpc0NhbGxhYmxlKG9uZnVsZmlsbGVkKSkgeyBvbmZ1bGZpbGxlZCA9IGlkZW50aXR5IGFzIGFueTsgfVxuICAgICAgICBpZiAoIWlzQ2FsbGFibGUob25yZWplY3RlZCkpIHsgb25yZWplY3RlZCA9IHRocm93ZXI7IH1cblxuICAgICAgICBpZiAob25mdWxmaWxsZWQgPT09IGlkZW50aXR5ICYmIG9ucmVqZWN0ZWQgPT0gdGhyb3dlcikge1xuICAgICAgICAgICAgLy8gU2hvcnRjdXQgZm9yIHRyaXZpYWwgYXJndW1lbnRzLlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDYW5jZWxsYWJsZVByb21pc2UoKHJlc29sdmUpID0+IHJlc29sdmUodGhpcyBhcyBhbnkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJhcnJpZXI6IFBhcnRpYWw8UHJvbWlzZVdpdGhSZXNvbHZlcnM8dm9pZD4+ID0ge307XG4gICAgICAgIHRoaXNbYmFycmllclN5bV0gPSBiYXJyaWVyO1xuXG4gICAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPFRSZXN1bHQxIHwgVFJlc3VsdDI+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZvaWQgc3VwZXIudGhlbihcbiAgICAgICAgICAgICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNbYmFycmllclN5bV0gPT09IGJhcnJpZXIpIHsgdGhpc1tiYXJyaWVyU3ltXSA9IG51bGw7IH1cbiAgICAgICAgICAgICAgICAgICAgYmFycmllci5yZXNvbHZlPy4oKTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvbmZ1bGZpbGxlZCEodmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKHJlYXNvbj8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNbYmFycmllclN5bV0gPT09IGJhcnJpZXIpIHsgdGhpc1tiYXJyaWVyU3ltXSA9IG51bGw7IH1cbiAgICAgICAgICAgICAgICAgICAgYmFycmllci5yZXNvbHZlPy4oKTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvbnJlamVjdGVkIShyZWFzb24pKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sIGFzeW5jIChjYXVzZT8pID0+IHtcbiAgICAgICAgICAgIC8vY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9uY2FuY2VsbGVkPy4oY2F1c2UpO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNhbmNlbChjYXVzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIGEgY2FsbGJhY2sgZm9yIG9ubHkgdGhlIHJlamVjdGlvbiBvZiB0aGUgUHJvbWlzZS5cbiAgICAgKlxuICAgICAqIFRoZSBvcHRpb25hbCBgb25jYW5jZWxsZWRgIGFyZ3VtZW50IHdpbGwgYmUgaW52b2tlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCxcbiAgICAgKiB3aXRoIHRoZSBzYW1lIHNlbWFudGljcyBhcyB0aGUgYG9uY2FuY2VsbGVkYCBhcmd1bWVudCBvZiB0aGUgY29uc3RydWN0b3IuXG4gICAgICogV2hlbiB0aGUgcGFyZW50IHByb21pc2UgcmVqZWN0cyBvciBpcyBjYW5jZWxsZWQsIHRoZSBgb25yZWplY3RlZGAgY2FsbGJhY2sgd2lsbCBydW4sXG4gICAgICogX2V2ZW4gYWZ0ZXIgdGhlIHJldHVybmVkIHByb21pc2UgaGFzIGJlZW4gY2FuY2VsbGVkOl9cbiAgICAgKiBpbiB0aGF0IGNhc2UsIHNob3VsZCBpdCByZWplY3Qgb3IgdGhyb3csIHRoZSByZWFzb24gd2lsbCBiZSB3cmFwcGVkXG4gICAgICogaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGFuZCBidWJibGVkIHVwIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXG4gICAgICpcbiAgICAgKiBJdCBpcyBlcXVpdmFsZW50IHRvXG4gICAgICogYGBgdHNcbiAgICAgKiBjYW5jZWxsYWJsZVByb21pc2UudGhlbih1bmRlZmluZWQsIG9ucmVqZWN0ZWQsIG9uY2FuY2VsbGVkKTtcbiAgICAgKiBgYGBcbiAgICAgKiBhbmQgdGhlIHNhbWUgY2F2ZWF0cyBhcHBseS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSBmb3IgdGhlIGNvbXBsZXRpb24gb2YgdGhlIGNhbGxiYWNrLlxuICAgICAqIENhbmNlbGxhdGlvbiByZXF1ZXN0cyBvbiB0aGUgcmV0dXJuZWQgcHJvbWlzZVxuICAgICAqIHdpbGwgcHJvcGFnYXRlIHVwIHRoZSBjaGFpbiB0byB0aGUgcGFyZW50IHByb21pc2UsXG4gICAgICogYnV0IG5vdCBpbiB0aGUgb3RoZXIgZGlyZWN0aW9uLlxuICAgICAqXG4gICAgICogVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB7QGxpbmsgY2FuY2VsfSB3aWxsIGZ1bGZpbGwgb25seSBhZnRlciBhbGwgYXR0YWNoZWQgaGFuZGxlcnNcbiAgICAgKiB1cCB0aGUgZW50aXJlIHByb21pc2UgY2hhaW4gaGF2ZSBiZWVuIHJ1bi5cbiAgICAgKlxuICAgICAqIElmIGBvbnJlamVjdGVkYCByZXR1cm5zIGEgY2FuY2VsbGFibGUgcHJvbWlzZSxcbiAgICAgKiBjYW5jZWxsYXRpb24gcmVxdWVzdHMgd2lsbCBiZSBkaXZlcnRlZCB0byBpdCxcbiAgICAgKiBhbmQgdGhlIHNwZWNpZmllZCBgb25jYW5jZWxsZWRgIGNhbGxiYWNrIHdpbGwgYmUgZGlzY2FyZGVkLlxuICAgICAqIFNlZSB7QGxpbmsgdGhlbn0gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKi9cbiAgICBjYXRjaDxUUmVzdWx0ID0gbmV2ZXI+KG9ucmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiAoUHJvbWlzZUxpa2U8VFJlc3VsdD4gfCBUUmVzdWx0KSkgfCB1bmRlZmluZWQgfCBudWxsLCBvbmNhbmNlbGxlZD86IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlcik6IENhbmNlbGxhYmxlUHJvbWlzZTxUIHwgVFJlc3VsdD4ge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25yZWplY3RlZCwgb25jYW5jZWxsZWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIGEgY2FsbGJhY2sgdGhhdCBpcyBpbnZva2VkIHdoZW4gdGhlIENhbmNlbGxhYmxlUHJvbWlzZSBpcyBzZXR0bGVkIChmdWxmaWxsZWQgb3IgcmVqZWN0ZWQpLiBUaGVcbiAgICAgKiByZXNvbHZlZCB2YWx1ZSBjYW5ub3QgYmUgYWNjZXNzZWQgb3IgbW9kaWZpZWQgZnJvbSB0aGUgY2FsbGJhY2suXG4gICAgICogVGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBzZXR0bGUgaW4gdGhlIHNhbWUgc3RhdGUgYXMgdGhlIG9yaWdpbmFsIG9uZVxuICAgICAqIGFmdGVyIHRoZSBwcm92aWRlZCBjYWxsYmFjayBoYXMgY29tcGxldGVkIGV4ZWN1dGlvbixcbiAgICAgKiB1bmxlc3MgdGhlIGNhbGxiYWNrIHRocm93cyBvciByZXR1cm5zIGEgcmVqZWN0aW5nIHByb21pc2UsXG4gICAgICogaW4gd2hpY2ggY2FzZSB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIHJlamVjdCBhcyB3ZWxsLlxuICAgICAqXG4gICAgICogVGhlIG9wdGlvbmFsIGBvbmNhbmNlbGxlZGAgYXJndW1lbnQgd2lsbCBiZSBpbnZva2VkIHdoZW4gdGhlIHJldHVybmVkIHByb21pc2UgaXMgY2FuY2VsbGVkLFxuICAgICAqIHdpdGggdGhlIHNhbWUgc2VtYW50aWNzIGFzIHRoZSBgb25jYW5jZWxsZWRgIGFyZ3VtZW50IG9mIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgKiBPbmNlIHRoZSBwYXJlbnQgcHJvbWlzZSBzZXR0bGVzLCB0aGUgYG9uZmluYWxseWAgY2FsbGJhY2sgd2lsbCBydW4sXG4gICAgICogX2V2ZW4gYWZ0ZXIgdGhlIHJldHVybmVkIHByb21pc2UgaGFzIGJlZW4gY2FuY2VsbGVkOl9cbiAgICAgKiBpbiB0aGF0IGNhc2UsIHNob3VsZCBpdCByZWplY3Qgb3IgdGhyb3csIHRoZSByZWFzb24gd2lsbCBiZSB3cmFwcGVkXG4gICAgICogaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGFuZCBidWJibGVkIHVwIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXG4gICAgICpcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBpbXBsZW1lbnRlZCBpbiB0ZXJtcyBvZiB7QGxpbmsgdGhlbn0gYW5kIHRoZSBzYW1lIGNhdmVhdHMgYXBwbHkuXG4gICAgICogSXQgaXMgcG9seWZpbGxlZCwgaGVuY2UgYXZhaWxhYmxlIGluIGV2ZXJ5IE9TL3dlYnZpZXcgdmVyc2lvbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSBmb3IgdGhlIGNvbXBsZXRpb24gb2YgdGhlIGNhbGxiYWNrLlxuICAgICAqIENhbmNlbGxhdGlvbiByZXF1ZXN0cyBvbiB0aGUgcmV0dXJuZWQgcHJvbWlzZVxuICAgICAqIHdpbGwgcHJvcGFnYXRlIHVwIHRoZSBjaGFpbiB0byB0aGUgcGFyZW50IHByb21pc2UsXG4gICAgICogYnV0IG5vdCBpbiB0aGUgb3RoZXIgZGlyZWN0aW9uLlxuICAgICAqXG4gICAgICogVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB7QGxpbmsgY2FuY2VsfSB3aWxsIGZ1bGZpbGwgb25seSBhZnRlciBhbGwgYXR0YWNoZWQgaGFuZGxlcnNcbiAgICAgKiB1cCB0aGUgZW50aXJlIHByb21pc2UgY2hhaW4gaGF2ZSBiZWVuIHJ1bi5cbiAgICAgKlxuICAgICAqIElmIGBvbmZpbmFsbHlgIHJldHVybnMgYSBjYW5jZWxsYWJsZSBwcm9taXNlLFxuICAgICAqIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyB3aWxsIGJlIGRpdmVydGVkIHRvIGl0LFxuICAgICAqIGFuZCB0aGUgc3BlY2lmaWVkIGBvbmNhbmNlbGxlZGAgY2FsbGJhY2sgd2lsbCBiZSBkaXNjYXJkZWQuXG4gICAgICogU2VlIHtAbGluayB0aGVufSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAqL1xuICAgIGZpbmFsbHkob25maW5hbGx5PzogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkIHwgbnVsbCwgb25jYW5jZWxsZWQ/OiBDYW5jZWxsYWJsZVByb21pc2VDYW5jZWxsZXIpOiBDYW5jZWxsYWJsZVByb21pc2U8VD4ge1xuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ2FuY2VsbGFibGVQcm9taXNlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbmNlbGxhYmxlUHJvbWlzZS5wcm90b3R5cGUuZmluYWxseSBjYWxsZWQgb24gYW4gaW52YWxpZCBvYmplY3QuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0NhbGxhYmxlKG9uZmluYWxseSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRoZW4ob25maW5hbGx5LCBvbmZpbmFsbHksIG9uY2FuY2VsbGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4oXG4gICAgICAgICAgICAodmFsdWUpID0+IENhbmNlbGxhYmxlUHJvbWlzZS5yZXNvbHZlKG9uZmluYWxseSgpKS50aGVuKCgpID0+IHZhbHVlKSxcbiAgICAgICAgICAgIChyZWFzb24/KSA9PiBDYW5jZWxsYWJsZVByb21pc2UucmVzb2x2ZShvbmZpbmFsbHkoKSkudGhlbigoKSA9PiB7IHRocm93IHJlYXNvbjsgfSksXG4gICAgICAgICAgICBvbmNhbmNlbGxlZCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXZSB1c2UgdGhlIGBbU3ltYm9sLnNwZWNpZXNdYCBzdGF0aWMgcHJvcGVydHksIGlmIGF2YWlsYWJsZSxcbiAgICAgKiB0byBkaXNhYmxlIHRoZSBidWlsdC1pbiBhdXRvbWF0aWMgc3ViY2xhc3NpbmcgZmVhdHVyZXMgZnJvbSB7QGxpbmsgUHJvbWlzZX0uXG4gICAgICogSXQgaXMgY3JpdGljYWwgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgdGhhdCBleHRlbmRlcnMgZG8gbm90IG92ZXJyaWRlIHRoaXMuXG4gICAgICogT25jZSB0aGUgcHJvcG9zYWwgYXQgaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtcm0tYnVpbHRpbi1zdWJjbGFzc2luZ1xuICAgICAqIGlzIGVpdGhlciBhY2NlcHRlZCBvciByZXRpcmVkLCB0aGlzIGltcGxlbWVudGF0aW9uIHdpbGwgaGF2ZSB0byBiZSByZXZpc2VkIGFjY29yZGluZ2x5LlxuICAgICAqXG4gICAgICogQGlnbm9yZVxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgW3NwZWNpZXNdKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgQ2FuY2VsbGFibGVQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCBhbiBhcnJheSBvZiByZXN1bHRzXG4gICAgICogd2hlbiBhbGwgb2YgdGhlIHByb3ZpZGVkIFByb21pc2VzIHJlc29sdmUsIG9yIHJlamVjdGVkIHdoZW4gYW55IFByb21pc2UgaXMgcmVqZWN0ZWQuXG4gICAgICpcbiAgICAgKiBFdmVyeSBvbmUgb2YgdGhlIHByb3ZpZGVkIG9iamVjdHMgdGhhdCBpcyBhIHRoZW5hYmxlIF9hbmRfIGNhbmNlbGxhYmxlIG9iamVjdFxuICAgICAqIHdpbGwgYmUgY2FuY2VsbGVkIHdoZW4gdGhlIHJldHVybmVkIHByb21pc2UgaXMgY2FuY2VsbGVkLCB3aXRoIHRoZSBzYW1lIGNhdXNlLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIGFsbDxUPih2YWx1ZXM6IEl0ZXJhYmxlPFQgfCBQcm9taXNlTGlrZTxUPj4pOiBDYW5jZWxsYWJsZVByb21pc2U8QXdhaXRlZDxUPltdPjtcbiAgICBzdGF0aWMgYWxsPFQgZXh0ZW5kcyByZWFkb25seSB1bmtub3duW10gfCBbXT4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHsgLXJlYWRvbmx5IFtQIGluIGtleW9mIFRdOiBBd2FpdGVkPFRbUF0+OyB9PjtcbiAgICBzdGF0aWMgYWxsPFQgZXh0ZW5kcyBJdGVyYWJsZTx1bmtub3duPiB8IEFycmF5TGlrZTx1bmtub3duPj4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgbGV0IGNvbGxlY3RlZCA9IEFycmF5LmZyb20odmFsdWVzKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGNvbGxlY3RlZC5sZW5ndGggPT09IDBcbiAgICAgICAgICAgID8gQ2FuY2VsbGFibGVQcm9taXNlLnJlc29sdmUoY29sbGVjdGVkKVxuICAgICAgICAgICAgOiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB2b2lkIFByb21pc2UuYWxsKGNvbGxlY3RlZCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSwgKGNhdXNlPyk6IFByb21pc2U8dm9pZD4gPT4gY2FuY2VsQWxsKHByb21pc2UsIGNvbGxlY3RlZCwgY2F1c2UpKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIENhbmNlbGxhYmxlUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYW4gYXJyYXkgb2YgcmVzdWx0c1xuICAgICAqIHdoZW4gYWxsIG9mIHRoZSBwcm92aWRlZCBQcm9taXNlcyByZXNvbHZlIG9yIHJlamVjdC5cbiAgICAgKlxuICAgICAqIEV2ZXJ5IG9uZSBvZiB0aGUgcHJvdmlkZWQgb2JqZWN0cyB0aGF0IGlzIGEgdGhlbmFibGUgX2FuZF8gY2FuY2VsbGFibGUgb2JqZWN0XG4gICAgICogd2lsbCBiZSBjYW5jZWxsZWQgd2hlbiB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBjYW5jZWxsZWQsIHdpdGggdGhlIHNhbWUgY2F1c2UuXG4gICAgICpcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcbiAgICAgKi9cbiAgICBzdGF0aWMgYWxsU2V0dGxlZDxUPih2YWx1ZXM6IEl0ZXJhYmxlPFQgfCBQcm9taXNlTGlrZTxUPj4pOiBDYW5jZWxsYWJsZVByb21pc2U8UHJvbWlzZVNldHRsZWRSZXN1bHQ8QXdhaXRlZDxUPj5bXT47XG4gICAgc3RhdGljIGFsbFNldHRsZWQ8VCBleHRlbmRzIHJlYWRvbmx5IHVua25vd25bXSB8IFtdPih2YWx1ZXM6IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8eyAtcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFByb21pc2VTZXR0bGVkUmVzdWx0PEF3YWl0ZWQ8VFtQXT4+OyB9PjtcbiAgICBzdGF0aWMgYWxsU2V0dGxlZDxUIGV4dGVuZHMgSXRlcmFibGU8dW5rbm93bj4gfCBBcnJheUxpa2U8dW5rbm93bj4+KHZhbHVlczogVCk6IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPiB7XG4gICAgICAgIGxldCBjb2xsZWN0ZWQgPSBBcnJheS5mcm9tKHZhbHVlcyk7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBjb2xsZWN0ZWQubGVuZ3RoID09PSAwXG4gICAgICAgICAgICA/IENhbmNlbGxhYmxlUHJvbWlzZS5yZXNvbHZlKGNvbGxlY3RlZClcbiAgICAgICAgICAgIDogbmV3IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgdm9pZCBQcm9taXNlLmFsbFNldHRsZWQoY29sbGVjdGVkKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICB9LCAoY2F1c2U/KTogUHJvbWlzZTx2b2lkPiA9PiBjYW5jZWxBbGwocHJvbWlzZSwgY29sbGVjdGVkLCBjYXVzZSkpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYW55IGZ1bmN0aW9uIHJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIGJ5IHRoZSBmaXJzdCBnaXZlbiBwcm9taXNlIHRvIGJlIGZ1bGZpbGxlZCxcbiAgICAgKiBvciByZWplY3RlZCB3aXRoIGFuIEFnZ3JlZ2F0ZUVycm9yIGNvbnRhaW5pbmcgYW4gYXJyYXkgb2YgcmVqZWN0aW9uIHJlYXNvbnNcbiAgICAgKiBpZiBhbGwgb2YgdGhlIGdpdmVuIHByb21pc2VzIGFyZSByZWplY3RlZC5cbiAgICAgKiBJdCByZXNvbHZlcyBhbGwgZWxlbWVudHMgb2YgdGhlIHBhc3NlZCBpdGVyYWJsZSB0byBwcm9taXNlcyBhcyBpdCBydW5zIHRoaXMgYWxnb3JpdGhtLlxuICAgICAqXG4gICAgICogRXZlcnkgb25lIG9mIHRoZSBwcm92aWRlZCBvYmplY3RzIHRoYXQgaXMgYSB0aGVuYWJsZSBfYW5kXyBjYW5jZWxsYWJsZSBvYmplY3RcbiAgICAgKiB3aWxsIGJlIGNhbmNlbGxlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCwgd2l0aCB0aGUgc2FtZSBjYXVzZS5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyBhbnk8VD4odmFsdWVzOiBJdGVyYWJsZTxUIHwgUHJvbWlzZUxpa2U8VD4+KTogQ2FuY2VsbGFibGVQcm9taXNlPEF3YWl0ZWQ8VD4+O1xuICAgIHN0YXRpYyBhbnk8VCBleHRlbmRzIHJlYWRvbmx5IHVua25vd25bXSB8IFtdPih2YWx1ZXM6IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8QXdhaXRlZDxUW251bWJlcl0+PjtcbiAgICBzdGF0aWMgYW55PFQgZXh0ZW5kcyBJdGVyYWJsZTx1bmtub3duPiB8IEFycmF5TGlrZTx1bmtub3duPj4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgbGV0IGNvbGxlY3RlZCA9IEFycmF5LmZyb20odmFsdWVzKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGNvbGxlY3RlZC5sZW5ndGggPT09IDBcbiAgICAgICAgICAgID8gQ2FuY2VsbGFibGVQcm9taXNlLnJlc29sdmUoY29sbGVjdGVkKVxuICAgICAgICAgICAgOiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB2b2lkIFByb21pc2UuYW55KGNvbGxlY3RlZCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSwgKGNhdXNlPyk6IFByb21pc2U8dm9pZD4gPT4gY2FuY2VsQWxsKHByb21pc2UsIGNvbGxlY3RlZCwgY2F1c2UpKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCBvciByZWplY3RlZCB3aGVuIGFueSBvZiB0aGUgcHJvdmlkZWQgUHJvbWlzZXMgYXJlIHJlc29sdmVkIG9yIHJlamVjdGVkLlxuICAgICAqXG4gICAgICogRXZlcnkgb25lIG9mIHRoZSBwcm92aWRlZCBvYmplY3RzIHRoYXQgaXMgYSB0aGVuYWJsZSBfYW5kXyBjYW5jZWxsYWJsZSBvYmplY3RcbiAgICAgKiB3aWxsIGJlIGNhbmNlbGxlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCwgd2l0aCB0aGUgc2FtZSBjYXVzZS5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyByYWNlPFQ+KHZhbHVlczogSXRlcmFibGU8VCB8IFByb21pc2VMaWtlPFQ+Pik6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFQ+PjtcbiAgICBzdGF0aWMgcmFjZTxUIGV4dGVuZHMgcmVhZG9ubHkgdW5rbm93bltdIHwgW10+KHZhbHVlczogVCk6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFRbbnVtYmVyXT4+O1xuICAgIHN0YXRpYyByYWNlPFQgZXh0ZW5kcyBJdGVyYWJsZTx1bmtub3duPiB8IEFycmF5TGlrZTx1bmtub3duPj4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgbGV0IGNvbGxlY3RlZCA9IEFycmF5LmZyb20odmFsdWVzKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdm9pZCBQcm9taXNlLnJhY2UoY29sbGVjdGVkKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0sIChjYXVzZT8pOiBQcm9taXNlPHZvaWQ+ID0+IGNhbmNlbEFsbChwcm9taXNlLCBjb2xsZWN0ZWQsIGNhdXNlKSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgY2FuY2VsbGVkIENhbmNlbGxhYmxlUHJvbWlzZSBmb3IgdGhlIHByb3ZpZGVkIGNhdXNlLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIGNhbmNlbDxUID0gbmV2ZXI+KGNhdXNlPzogYW55KTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcbiAgICAgICAgY29uc3QgcCA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8VD4oKCkgPT4ge30pO1xuICAgICAgICBwLmNhbmNlbChjYXVzZSk7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlIHRoYXQgY2FuY2Vsc1xuICAgICAqIGFmdGVyIHRoZSBzcGVjaWZpZWQgdGltZW91dCwgd2l0aCB0aGUgcHJvdmlkZWQgY2F1c2UuXG4gICAgICpcbiAgICAgKiBJZiB0aGUge0BsaW5rIEFib3J0U2lnbmFsLnRpbWVvdXR9IGZhY3RvcnkgbWV0aG9kIGlzIGF2YWlsYWJsZSxcbiAgICAgKiBpdCBpcyB1c2VkIHRvIGJhc2UgdGhlIHRpbWVvdXQgb24gX2FjdGl2ZV8gdGltZSByYXRoZXIgdGhhbiBfZWxhcHNlZF8gdGltZS5cbiAgICAgKiBPdGhlcndpc2UsIGB0aW1lb3V0YCBmYWxscyBiYWNrIHRvIHtAbGluayBzZXRUaW1lb3V0fS5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyB0aW1lb3V0PFQgPSBuZXZlcj4obWlsbGlzZWNvbmRzOiBudW1iZXIsIGNhdXNlPzogYW55KTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8VD4oKCkgPT4ge30pO1xuICAgICAgICBpZiAoQWJvcnRTaWduYWwgJiYgdHlwZW9mIEFib3J0U2lnbmFsID09PSAnZnVuY3Rpb24nICYmIEFib3J0U2lnbmFsLnRpbWVvdXQgJiYgdHlwZW9mIEFib3J0U2lnbmFsLnRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIEFib3J0U2lnbmFsLnRpbWVvdXQobWlsbGlzZWNvbmRzKS5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsICgpID0+IHZvaWQgcHJvbWlzZS5jYW5jZWwoY2F1c2UpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdm9pZCBwcm9taXNlLmNhbmNlbChjYXVzZSksIG1pbGxpc2Vjb25kcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBDYW5jZWxsYWJsZVByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciB0aGUgc3BlY2lmaWVkIHRpbWVvdXQuXG4gICAgICogVGhlIHJldHVybmVkIHByb21pc2UgY2FuIGJlIGNhbmNlbGxlZCB3aXRob3V0IGNvbnNlcXVlbmNlcy5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyBzbGVlcChtaWxsaXNlY29uZHM6IG51bWJlcik6IENhbmNlbGxhYmxlUHJvbWlzZTx2b2lkPjtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IENhbmNlbGxhYmxlUHJvbWlzZSB0aGF0IHJlc29sdmVzIGFmdGVyXG4gICAgICogdGhlIHNwZWNpZmllZCB0aW1lb3V0LCB3aXRoIHRoZSBwcm92aWRlZCB2YWx1ZS5cbiAgICAgKiBUaGUgcmV0dXJuZWQgcHJvbWlzZSBjYW4gYmUgY2FuY2VsbGVkIHdpdGhvdXQgY29uc2VxdWVuY2VzLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIHNsZWVwPFQ+KG1pbGxpc2Vjb25kczogbnVtYmVyLCB2YWx1ZTogVCk6IENhbmNlbGxhYmxlUHJvbWlzZTxUPjtcbiAgICBzdGF0aWMgc2xlZXA8VCA9IHZvaWQ+KG1pbGxpc2Vjb25kczogbnVtYmVyLCB2YWx1ZT86IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8VD4ge1xuICAgICAgICByZXR1cm4gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTxUPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKHZhbHVlISksIG1pbGxpc2Vjb25kcyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmVqZWN0ZWQgQ2FuY2VsbGFibGVQcm9taXNlIGZvciB0aGUgcHJvdmlkZWQgcmVhc29uLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIHJlamVjdDxUID0gbmV2ZXI+KHJlYXNvbj86IGFueSk6IENhbmNlbGxhYmxlUHJvbWlzZTxUPiB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPFQ+KChfLCByZWplY3QpID0+IHJlamVjdChyZWFzb24pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJlc29sdmVkIENhbmNlbGxhYmxlUHJvbWlzZS5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlKCk6IENhbmNlbGxhYmxlUHJvbWlzZTx2b2lkPjtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJlc29sdmVkIENhbmNlbGxhYmxlUHJvbWlzZSBmb3IgdGhlIHByb3ZpZGVkIHZhbHVlLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmU8VD4odmFsdWU6IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8QXdhaXRlZDxUPj47XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyByZXNvbHZlZCBDYW5jZWxsYWJsZVByb21pc2UgZm9yIHRoZSBwcm92aWRlZCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlPFQ+KHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pOiBDYW5jZWxsYWJsZVByb21pc2U8QXdhaXRlZDxUPj47XG4gICAgc3RhdGljIHJlc29sdmU8VCA9IHZvaWQ+KHZhbHVlPzogVCB8IFByb21pc2VMaWtlPFQ+KTogQ2FuY2VsbGFibGVQcm9taXNlPEF3YWl0ZWQ8VD4+IHtcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQ2FuY2VsbGFibGVQcm9taXNlKSB7XG4gICAgICAgICAgICAvLyBPcHRpbWlzZSBmb3IgY2FuY2VsbGFibGUgcHJvbWlzZXMuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBDYW5jZWxsYWJsZVByb21pc2U8YW55PigocmVzb2x2ZSkgPT4gcmVzb2x2ZSh2YWx1ZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlIGFuZCByZXR1cm5zIGl0IGluIGFuIG9iamVjdCwgYWxvbmcgd2l0aCBpdHMgcmVzb2x2ZSBhbmQgcmVqZWN0IGZ1bmN0aW9uc1xuICAgICAqIGFuZCBhIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBjYW5jZWxsYXRpb24gY2FsbGJhY2suXG4gICAgICpcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBwb2x5ZmlsbGVkLCBoZW5jZSBhdmFpbGFibGUgaW4gZXZlcnkgT1Mvd2VidmlldyB2ZXJzaW9uLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIHdpdGhSZXNvbHZlcnM8VD4oKTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiB7XG4gICAgICAgIGxldCByZXN1bHQ6IENhbmNlbGxhYmxlUHJvbWlzZVdpdGhSZXNvbHZlcnM8VD4gPSB7IG9uY2FuY2VsbGVkOiBudWxsIH0gYXMgYW55O1xuICAgICAgICByZXN1bHQucHJvbWlzZSA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0LnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICAgICAgcmVzdWx0LnJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgfSwgKGNhdXNlPzogYW55KSA9PiB7IHJlc3VsdC5vbmNhbmNlbGxlZD8uKGNhdXNlKTsgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBjYWxsYmFjayB0aGF0IGltcGxlbWVudHMgdGhlIGNhbmNlbGxhdGlvbiBhbGdvcml0aG0gZm9yIHRoZSBnaXZlbiBjYW5jZWxsYWJsZSBwcm9taXNlLlxuICogVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB0aGUgcmVzdWx0aW5nIGZ1bmN0aW9uIGRvZXMgbm90IHJlamVjdC5cbiAqL1xuZnVuY3Rpb24gY2FuY2VsbGVyRm9yPFQ+KHByb21pc2U6IENhbmNlbGxhYmxlUHJvbWlzZVdpdGhSZXNvbHZlcnM8VD4sIHN0YXRlOiBDYW5jZWxsYWJsZVByb21pc2VTdGF0ZSkge1xuICAgIGxldCBjYW5jZWxsYXRpb25Qcm9taXNlOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPSB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gKHJlYXNvbjogQ2FuY2VsRXJyb3IpOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLnNldHRsZWQpIHtcbiAgICAgICAgICAgIHN0YXRlLnNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgc3RhdGUucmVhc29uID0gcmVhc29uO1xuICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QocmVhc29uKTtcblxuICAgICAgICAgICAgLy8gQXR0YWNoIGFuIGVycm9yIGhhbmRsZXIgdGhhdCBpZ25vcmVzIHRoaXMgc3BlY2lmaWMgcmVqZWN0aW9uIHJlYXNvbiBhbmQgbm90aGluZyBlbHNlLlxuICAgICAgICAgICAgLy8gSW4gdGhlb3J5LCBhIHNhbmUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBhdCB0aGlzIHBvaW50XG4gICAgICAgICAgICAvLyBzaG91bGQgYWx3YXlzIHJlamVjdCB3aXRoIG91ciBjYW5jZWxsYXRpb24gcmVhc29uLFxuICAgICAgICAgICAgLy8gaGVuY2UgdGhlIGhhbmRsZXIgd2lsbCBuZXZlciB0aHJvdy5cbiAgICAgICAgICAgIHZvaWQgUHJvbWlzZS5wcm90b3R5cGUudGhlbi5jYWxsKHByb21pc2UucHJvbWlzZSwgdW5kZWZpbmVkLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciAhPT0gcmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHJlYXNvbiBpcyBub3Qgc2V0LCB0aGUgcHJvbWlzZSByZXNvbHZlZCByZWd1bGFybHksIGhlbmNlIHdlIG11c3Qgbm90IGNhbGwgb25jYW5jZWxsZWQuXG4gICAgICAgIC8vIElmIG9uY2FuY2VsbGVkIGlzIHVuc2V0LCBubyBuZWVkIHRvIGdvIGFueSBmdXJ0aGVyLlxuICAgICAgICBpZiAoIXN0YXRlLnJlYXNvbiB8fCAhcHJvbWlzZS5vbmNhbmNlbGxlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBjYW5jZWxsYXRpb25Qcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShwcm9taXNlLm9uY2FuY2VsbGVkIShzdGF0ZS5yZWFzb24hLmNhdXNlKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3IocHJvbWlzZS5wcm9taXNlLCBlcnIsIFwiVW5oYW5kbGVkIGV4Y2VwdGlvbiBpbiBvbmNhbmNlbGxlZCBjYWxsYmFjay5cIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgocmVhc29uPykgPT4ge1xuICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IENhbmNlbGxlZFJlamVjdGlvbkVycm9yKHByb21pc2UucHJvbWlzZSwgcmVhc29uLCBcIlVuaGFuZGxlZCByZWplY3Rpb24gaW4gb25jYW5jZWxsZWQgY2FsbGJhY2suXCIpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVW5zZXQgb25jYW5jZWxsZWQgdG8gcHJldmVudCByZXBlYXRlZCBjYWxscy5cbiAgICAgICAgcHJvbWlzZS5vbmNhbmNlbGxlZCA9IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIGNhbmNlbGxhdGlvblByb21pc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBjYWxsYmFjayB0aGF0IGltcGxlbWVudHMgdGhlIHJlc29sdXRpb24gYWxnb3JpdGhtIGZvciB0aGUgZ2l2ZW4gY2FuY2VsbGFibGUgcHJvbWlzZS5cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZXJGb3I8VD4ocHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiwgc3RhdGU6IENhbmNlbGxhYmxlUHJvbWlzZVN0YXRlKTogQ2FuY2VsbGFibGVQcm9taXNlUmVzb2x2ZXI8VD4ge1xuICAgIHJldHVybiAodmFsdWUpID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLnJlc29sdmluZykgeyByZXR1cm47IH1cbiAgICAgICAgc3RhdGUucmVzb2x2aW5nID0gdHJ1ZTtcblxuICAgICAgICBpZiAodmFsdWUgPT09IHByb21pc2UucHJvbWlzZSkge1xuICAgICAgICAgICAgaWYgKHN0YXRlLnNldHRsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICBzdGF0ZS5zZXR0bGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2UgY2Fubm90IGJlIHJlc29sdmVkIHdpdGggaXRzZWxmLlwiKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgICBsZXQgdGhlbjogYW55O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGVuID0gKHZhbHVlIGFzIGFueSkudGhlbjtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHN0YXRlLnNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNDYWxsYWJsZSh0aGVuKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjYW5jZWwgPSAodmFsdWUgYXMgYW55KS5jYW5jZWw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0NhbGxhYmxlKGNhbmNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9uY2FuY2VsbGVkID0gKGNhdXNlPzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmbGVjdC5hcHBseShjYW5jZWwsIHZhbHVlLCBbY2F1c2VdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUucmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgYWxyZWFkeSBjYW5jZWxsZWQsIHByb3BhZ2F0ZSBjYW5jZWxsYXRpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB0aGUgY2FuY2VsbGVyIGFsZ29yaXRobSBkb2VzIG5vdCByZWplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyBpdCBjYW4gYmUgZGlzY2FyZGVkIHNhZmVseS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIGNhbmNlbGxlckZvcih7IC4uLnByb21pc2UsIG9uY2FuY2VsbGVkIH0sIHN0YXRlKShzdGF0ZS5yZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlLm9uY2FuY2VsbGVkID0gb25jYW5jZWxsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIHt9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXdTdGF0ZTogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJvb3Q6IHN0YXRlLnJvb3QsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGdldCBzZXR0bGVkKCkgeyByZXR1cm4gdGhpcy5yb290LnNldHRsZWQgfSxcbiAgICAgICAgICAgICAgICAgICAgc2V0IHNldHRsZWQodmFsdWUpIHsgdGhpcy5yb290LnNldHRsZWQgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0IHJlYXNvbigpIHsgcmV0dXJuIHRoaXMucm9vdC5yZWFzb24gfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCByZWplY3RvciA9IHJlamVjdG9yRm9yKHByb21pc2UsIG5ld1N0YXRlKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBSZWZsZWN0LmFwcGx5KHRoZW4sIHZhbHVlLCBbcmVzb2x2ZXJGb3IocHJvbWlzZSwgbmV3U3RhdGUpLCByZWplY3Rvcl0pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3RvcihlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIElNUE9SVEFOVCFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZS5zZXR0bGVkKSB7IHJldHVybjsgfVxuICAgICAgICBzdGF0ZS5zZXR0bGVkID0gdHJ1ZTtcbiAgICAgICAgcHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBjYWxsYmFjayB0aGF0IGltcGxlbWVudHMgdGhlIHJlamVjdGlvbiBhbGdvcml0aG0gZm9yIHRoZSBnaXZlbiBjYW5jZWxsYWJsZSBwcm9taXNlLlxuICovXG5mdW5jdGlvbiByZWplY3RvckZvcjxUPihwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2VXaXRoUmVzb2x2ZXJzPFQ+LCBzdGF0ZTogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGUpOiBDYW5jZWxsYWJsZVByb21pc2VSZWplY3RvciB7XG4gICAgcmV0dXJuIChyZWFzb24/KSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZS5yZXNvbHZpbmcpIHsgcmV0dXJuOyB9XG4gICAgICAgIHN0YXRlLnJlc29sdmluZyA9IHRydWU7XG5cbiAgICAgICAgaWYgKHN0YXRlLnNldHRsZWQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlYXNvbiBpbnN0YW5jZW9mIENhbmNlbEVycm9yICYmIHN0YXRlLnJlYXNvbiBpbnN0YW5jZW9mIENhbmNlbEVycm9yICYmIE9iamVjdC5pcyhyZWFzb24uY2F1c2UsIHN0YXRlLnJlYXNvbi5jYXVzZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3dhbGxvdyBsYXRlIHJlamVjdGlvbnMgdGhhdCBhcmUgQ2FuY2VsRXJyb3JzIHdob3NlIGNhbmNlbGxhdGlvbiBjYXVzZSBpcyB0aGUgc2FtZSBhcyBvdXJzLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7fVxuXG4gICAgICAgICAgICB2b2lkIFByb21pc2UucmVqZWN0KG5ldyBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcihwcm9taXNlLnByb21pc2UsIHJlYXNvbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUuc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChyZWFzb24pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENhbmNlbHMgYWxsIHZhbHVlcyBpbiBhbiBhcnJheSB0aGF0IGxvb2sgbGlrZSBjYW5jZWxsYWJsZSB0aGVuYWJsZXMuXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIG9uY2UgYWxsIGNhbmNlbGxhdGlvbiBwcm9jZWR1cmVzIGZvciB0aGUgZ2l2ZW4gdmFsdWVzIGhhdmUgc2V0dGxlZC5cbiAqL1xuZnVuY3Rpb24gY2FuY2VsQWxsKHBhcmVudDogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+LCB2YWx1ZXM6IGFueVtdLCBjYXVzZT86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgICAgbGV0IGNhbmNlbDogQ2FuY2VsbGFibGVQcm9taXNlQ2FuY2VsbGVyO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFpc0NhbGxhYmxlKHZhbHVlLnRoZW4pKSB7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICBjYW5jZWwgPSB2YWx1ZS5jYW5jZWw7XG4gICAgICAgICAgICBpZiAoIWlzQ2FsbGFibGUoY2FuY2VsKSkgeyBjb250aW51ZTsgfVxuICAgICAgICB9IGNhdGNoIHsgY29udGludWU7IH1cblxuICAgICAgICBsZXQgcmVzdWx0OiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSBSZWZsZWN0LmFwcGx5KGNhbmNlbCwgdmFsdWUsIFtjYXVzZV0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcihwYXJlbnQsIGVyciwgXCJVbmhhbmRsZWQgZXhjZXB0aW9uIGluIGNhbmNlbCBtZXRob2QuXCIpKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyZXN1bHQpIHsgY29udGludWU7IH1cbiAgICAgICAgcmVzdWx0cy5wdXNoKFxuICAgICAgICAgICAgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UgID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkpLmNhdGNoKChyZWFzb24/KSA9PiB7XG4gICAgICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IENhbmNlbGxlZFJlamVjdGlvbkVycm9yKHBhcmVudCwgcmVhc29uLCBcIlVuaGFuZGxlZCByZWplY3Rpb24gaW4gY2FuY2VsIG1ldGhvZC5cIikpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cykgYXMgYW55O1xufVxuXG4vKipcbiAqIFJldHVybnMgaXRzIGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBpZGVudGl0eTxUPih4OiBUKTogVCB7XG4gICAgcmV0dXJuIHg7XG59XG5cbi8qKlxuICogVGhyb3dzIGl0cyBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dlcihyZWFzb24/OiBhbnkpOiBuZXZlciB7XG4gICAgdGhyb3cgcmVhc29uO1xufVxuXG4vKipcbiAqIEF0dGVtcHRzIHZhcmlvdXMgc3RyYXRlZ2llcyB0byBjb252ZXJ0IGFuIGVycm9yIHRvIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBlcnJvck1lc3NhZ2UoZXJyOiBhbnkpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvciB8fCB0eXBlb2YgZXJyICE9PSAnb2JqZWN0JyB8fCBlcnIudG9TdHJpbmcgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiICsgZXJyO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCB7fVxuXG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgfSBjYXRjaCB7fVxuXG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlcnIpO1xuICAgIH0gY2F0Y2gge31cblxuICAgIHJldHVybiBcIjxjb3VsZCBub3QgY29udmVydCBlcnJvciB0byBzdHJpbmc+XCI7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgY3VycmVudCBiYXJyaWVyIHByb21pc2UgZm9yIHRoZSBnaXZlbiBjYW5jZWxsYWJsZSBwcm9taXNlLiBJZiBuZWNlc3NhcnksIGluaXRpYWxpc2VzIHRoZSBiYXJyaWVyLlxuICovXG5mdW5jdGlvbiBjdXJyZW50QmFycmllcjxUPihwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2U8VD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgcHdyOiBQYXJ0aWFsPFByb21pc2VXaXRoUmVzb2x2ZXJzPHZvaWQ+PiA9IHByb21pc2VbYmFycmllclN5bV0gPz8ge307XG4gICAgaWYgKCEoJ3Byb21pc2UnIGluIHB3cikpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihwd3IsIHByb21pc2VXaXRoUmVzb2x2ZXJzPHZvaWQ+KCkpO1xuICAgIH1cbiAgICBpZiAocHJvbWlzZVtiYXJyaWVyU3ltXSA9PSBudWxsKSB7XG4gICAgICAgIHB3ci5yZXNvbHZlISgpO1xuICAgICAgICBwcm9taXNlW2JhcnJpZXJTeW1dID0gcHdyO1xuICAgIH1cbiAgICByZXR1cm4gcHdyLnByb21pc2UhO1xufVxuXG4vLyBQb2x5ZmlsbCBQcm9taXNlLndpdGhSZXNvbHZlcnMuXG5sZXQgcHJvbWlzZVdpdGhSZXNvbHZlcnMgPSBQcm9taXNlLndpdGhSZXNvbHZlcnM7XG5pZiAocHJvbWlzZVdpdGhSZXNvbHZlcnMgJiYgdHlwZW9mIHByb21pc2VXaXRoUmVzb2x2ZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcHJvbWlzZVdpdGhSZXNvbHZlcnMgPSBwcm9taXNlV2l0aFJlc29sdmVycy5iaW5kKFByb21pc2UpO1xufSBlbHNlIHtcbiAgICBwcm9taXNlV2l0aFJlc29sdmVycyA9IGZ1bmN0aW9uIDxUPigpOiBQcm9taXNlV2l0aFJlc29sdmVyczxUPiB7XG4gICAgICAgIGxldCByZXNvbHZlITogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gICAgICAgIGxldCByZWplY3QhOiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xuICAgICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8VD4oKHJlcywgcmVqKSA9PiB7IHJlc29sdmUgPSByZXM7IHJlamVjdCA9IHJlajsgfSk7XG4gICAgICAgIHJldHVybiB7IHByb21pc2UsIHJlc29sdmUsIHJlamVjdCB9O1xuICAgIH1cbn1cbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG5pbXBvcnQgeyBDYW5jZWxsYWJsZVByb21pc2UsIHR5cGUgQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVycyB9IGZyb20gXCIuL2NhbmNlbGxhYmxlLmpzXCI7XG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7IG5hbm9pZCB9IGZyb20gXCIuL25hbm9pZC5qc1wiO1xuXG4vLyBTZXR1cFxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcblxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xufVxuXG50eXBlIFByb21pc2VSZXNvbHZlcnMgPSBPbWl0PENhbmNlbGxhYmxlUHJvbWlzZVdpdGhSZXNvbHZlcnM8YW55PiwgXCJwcm9taXNlXCIgfCBcIm9uY2FuY2VsbGVkXCI+XG5cbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLkNhbGwpO1xuY29uc3QgY2FuY2VsQ2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQ2FuY2VsQ2FsbCk7XG5jb25zdCBjYWxsUmVzcG9uc2VzID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2VSZXNvbHZlcnM+KCk7XG5cbmNvbnN0IENhbGxCaW5kaW5nID0gMDtcbmNvbnN0IENhbmNlbE1ldGhvZCA9IDBcblxuLyoqXG4gKiBIb2xkcyBhbGwgcmVxdWlyZWQgaW5mb3JtYXRpb24gZm9yIGEgYmluZGluZyBjYWxsLlxuICogTWF5IHByb3ZpZGUgZWl0aGVyIGEgbWV0aG9kIElEIG9yIGEgbWV0aG9kIG5hbWUsIGJ1dCBub3QgYm90aC5cbiAqL1xuZXhwb3J0IHR5cGUgQ2FsbE9wdGlvbnMgPSB7XG4gICAgLyoqIFRoZSBudW1lcmljIElEIG9mIHRoZSBib3VuZCBtZXRob2QgdG8gY2FsbC4gKi9cbiAgICBtZXRob2RJRDogbnVtYmVyO1xuICAgIC8qKiBUaGUgZnVsbHkgcXVhbGlmaWVkIG5hbWUgb2YgdGhlIGJvdW5kIG1ldGhvZCB0byBjYWxsLiAqL1xuICAgIG1ldGhvZE5hbWU/OiBuZXZlcjtcbiAgICAvKiogQXJndW1lbnRzIHRvIGJlIHBhc3NlZCBpbnRvIHRoZSBib3VuZCBtZXRob2QuICovXG4gICAgYXJnczogYW55W107XG59IHwge1xuICAgIC8qKiBUaGUgbnVtZXJpYyBJRCBvZiB0aGUgYm91bmQgbWV0aG9kIHRvIGNhbGwuICovXG4gICAgbWV0aG9kSUQ/OiBuZXZlcjtcbiAgICAvKiogVGhlIGZ1bGx5IHF1YWxpZmllZCBuYW1lIG9mIHRoZSBib3VuZCBtZXRob2QgdG8gY2FsbC4gKi9cbiAgICBtZXRob2ROYW1lOiBzdHJpbmc7XG4gICAgLyoqIEFyZ3VtZW50cyB0byBiZSBwYXNzZWQgaW50byB0aGUgYm91bmQgbWV0aG9kLiAqL1xuICAgIGFyZ3M6IGFueVtdO1xufTtcblxuLy8gcnVudGltZS5qcyBuZWVkcyB0byB1c2UgUnVudGltZUVycm9yIGludGVybmFsbHkgdG8gcHJvcGVybHkgcGFyc2UgYW5kIHJldHVyblxuLy8gZXJyb3JzIGZvciBiaW5kaW5nIGNhbGxzLCBzbyBpdCBoYWQgdG8gbW92ZSB0aGVyZS4gRXhwb3J0aW5nIGhlcmUgYWdhaW4gdG9cbi8vIGtlZXAgZnJvbSBicmVha2luZyB0aGUgcHVibGljIENhbGwgaW50ZXJmYWNlLlxuZXhwb3J0IHsgUnVudGltZUVycm9yIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBJRCB1c2luZyB0aGUgbmFub2lkIGxpYnJhcnkuXG4gKlxuICogQHJldHVybnMgQSB1bmlxdWUgSUQgdGhhdCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgY2FsbFJlc3BvbnNlcyBzZXQuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlSUQoKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGRvIHtcbiAgICAgICAgcmVzdWx0ID0gbmFub2lkKCk7XG4gICAgfSB3aGlsZSAoY2FsbFJlc3BvbnNlcy5oYXMocmVzdWx0KSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDYWxsIGEgYm91bmQgbWV0aG9kIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gY2FsbCBvcHRpb25zLlxuICpcbiAqIEluIGNhc2Ugb2YgZmFpbHVyZSwgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCByZWplY3Qgd2l0aCBhbiBleGNlcHRpb25cbiAqIGFtb25nIFJlZmVyZW5jZUVycm9yICh1bmtub3duIG1ldGhvZCksIFR5cGVFcnJvciAod3JvbmcgYXJndW1lbnQgY291bnQgb3IgdHlwZSksXG4gKiB7QGxpbmsgUnVudGltZUVycm9yfSAobWV0aG9kIHJldHVybmVkIGFuIGVycm9yKSwgb3Igb3RoZXIgKG5ldHdvcmsgb3IgaW50ZXJuYWwgZXJyb3JzKS5cbiAqIFRoZSBleGNlcHRpb24gbWlnaHQgaGF2ZSBhIFwiY2F1c2VcIiBmaWVsZCB3aXRoIHRoZSB2YWx1ZSByZXR1cm5lZFxuICogYnkgdGhlIGFwcGxpY2F0aW9uLSBvciBzZXJ2aWNlLWxldmVsIGVycm9yIG1hcnNoYWxpbmcgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBvcHRpb25zIC0gQSBtZXRob2QgY2FsbCBkZXNjcmlwdG9yLlxuICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgY2FsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENhbGwob3B0aW9uczogQ2FsbE9wdGlvbnMpOiBDYW5jZWxsYWJsZVByb21pc2U8YW55PiB7XG4gICAgY29uc3QgaWQgPSBnZW5lcmF0ZUlEKCk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBDYW5jZWxsYWJsZVByb21pc2Uud2l0aFJlc29sdmVyczxhbnk+KCk7XG4gICAgY2FsbFJlc3BvbnNlcy5zZXQoaWQsIHsgcmVzb2x2ZTogcmVzdWx0LnJlc29sdmUsIHJlamVjdDogcmVzdWx0LnJlamVjdCB9KTtcblxuICAgIGNvbnN0IHJlcXVlc3QgPSBjYWxsKENhbGxCaW5kaW5nLCBPYmplY3QuYXNzaWduKHsgXCJjYWxsLWlkXCI6IGlkIH0sIG9wdGlvbnMpKTtcbiAgICBsZXQgcnVubmluZyA9IHRydWU7XG5cbiAgICByZXF1ZXN0LnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIGNhbGxSZXNwb25zZXMuZGVsZXRlKGlkKTtcbiAgICAgICAgcmVzdWx0LnJlc29sdmUocmVzKTtcbiAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgY2FsbFJlc3BvbnNlcy5kZWxldGUoaWQpO1xuICAgICAgICByZXN1bHQucmVqZWN0KGVycik7XG4gICAgfSk7XG5cbiAgICBjb25zdCBjYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIGNhbGxSZXNwb25zZXMuZGVsZXRlKGlkKTtcbiAgICAgICAgcmV0dXJuIGNhbmNlbENhbGwoQ2FuY2VsTWV0aG9kLCB7XCJjYWxsLWlkXCI6IGlkfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoaWxlIHJlcXVlc3RpbmcgYmluZGluZyBjYWxsIGNhbmNlbGxhdGlvbjpcIiwgZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlc3VsdC5vbmNhbmNlbGxlZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBjYW5jZWwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnRoZW4oY2FuY2VsKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0LnByb21pc2U7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBib3VuZCBtZXRob2QgYnkgbmFtZSB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzLlxuICogU2VlIHtAbGluayBDYWxsfSBmb3IgZGV0YWlscy5cbiAqXG4gKiBAcGFyYW0gbWV0aG9kTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgaW4gdGhlIGZvcm1hdCAncGFja2FnZS5zdHJ1Y3QubWV0aG9kJy5cbiAqIEBwYXJhbSBhcmdzIC0gVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2QuXG4gKiBAcmV0dXJucyBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgY2FsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJ5TmFtZShtZXRob2ROYW1lOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogQ2FuY2VsbGFibGVQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBDYWxsKHsgbWV0aG9kTmFtZSwgYXJncyB9KTtcbn1cblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBieSBpdHMgbnVtZXJpYyBJRCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzLlxuICogU2VlIHtAbGluayBDYWxsfSBmb3IgZGV0YWlscy5cbiAqXG4gKiBAcGFyYW0gbWV0aG9kSUQgLSBUaGUgSUQgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICogQHBhcmFtIGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCeUlEKG1ldGhvZElEOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogQ2FuY2VsbGFibGVQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBDYWxsKHsgbWV0aG9kSUQsIGFyZ3MgfSk7XG59XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHtuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lc30gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5DbGlwYm9hcmQpO1xuXG5jb25zdCBDbGlwYm9hcmRTZXRUZXh0ID0gMDtcbmNvbnN0IENsaXBib2FyZFRleHQgPSAxO1xuXG4vKipcbiAqIFNldHMgdGhlIHRleHQgdG8gdGhlIENsaXBib2FyZC5cbiAqXG4gKiBAcGFyYW0gdGV4dCAtIFRoZSB0ZXh0IHRvIGJlIHNldCB0byB0aGUgQ2xpcGJvYXJkLlxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBvcGVyYXRpb24gaXMgc3VjY2Vzc2Z1bC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFRleHQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIGNhbGwoQ2xpcGJvYXJkU2V0VGV4dCwge3RleHR9KTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIENsaXBib2FyZCB0ZXh0XG4gKlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgdGV4dCBmcm9tIHRoZSBDbGlwYm9hcmQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIGNhbGwoQ2xpcGJvYXJkVGV4dCk7XG59XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoqXG4gKiBBbnkgaXMgYSBkdW1teSBjcmVhdGlvbiBmdW5jdGlvbiBmb3Igc2ltcGxlIG9yIHVua25vd24gdHlwZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBbnk8VCA9IGFueT4oc291cmNlOiBhbnkpOiBUIHtcbiAgICByZXR1cm4gc291cmNlO1xufVxuXG4vKipcbiAqIEJ5dGVTbGljZSBpcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIHRoYXQgcmVwbGFjZXNcbiAqIG51bGwgc3RyaW5ncyB3aXRoIGVtcHR5IHN0cmluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCeXRlU2xpY2Uoc291cmNlOiBhbnkpOiBzdHJpbmcge1xuICAgIHJldHVybiAoKHNvdXJjZSA9PSBudWxsKSA/IFwiXCIgOiBzb3VyY2UpO1xufVxuXG4vKipcbiAqIEFycmF5IHRha2VzIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIGFyYml0cmFyeSB0eXBlXG4gKiBhbmQgcmV0dXJucyBhbiBpbi1wbGFjZSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJyYXlcbiAqIHdob3NlIGVsZW1lbnRzIGFyZSBvZiB0aGF0IHR5cGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheTxUID0gYW55PihlbGVtZW50OiAoc291cmNlOiBhbnkpID0+IFQpOiAoc291cmNlOiBhbnkpID0+IFRbXSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IEFueSkge1xuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IFtdIDogc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvdXJjZVtpXSA9IGVsZW1lbnQoc291cmNlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG5cbi8qKlxuICogTWFwIHRha2VzIGNyZWF0aW9uIGZ1bmN0aW9ucyBmb3IgdHdvIGFyYml0cmFyeSB0eXBlc1xuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIG9iamVjdFxuICogd2hvc2Uga2V5cyBhbmQgdmFsdWVzIGFyZSBvZiB0aG9zZSB0eXBlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1hcDxLIGV4dGVuZHMgUHJvcGVydHlLZXkgPSBhbnksIFYgPSBhbnk+KGtleTogKHNvdXJjZTogYW55KSA9PiBLLCB2YWx1ZTogKHNvdXJjZTogYW55KSA9PiBWKTogKHNvdXJjZTogYW55KSA9PiBSZWNvcmQ8SywgVj4ge1xuICAgIGlmICh2YWx1ZSA9PT0gQW55KSB7XG4gICAgICAgIHJldHVybiAoc291cmNlKSA9PiAoc291cmNlID09PSBudWxsID8ge30gOiBzb3VyY2UpO1xuICAgIH1cblxuICAgIHJldHVybiAoc291cmNlKSA9PiB7XG4gICAgICAgIGlmIChzb3VyY2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIHNvdXJjZVtrZXldID0gdmFsdWUoc291cmNlW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBOdWxsYWJsZSB0YWtlcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBhcmJpdHJhcnkgdHlwZVxuICogYW5kIHJldHVybnMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYSBudWxsYWJsZSB2YWx1ZSBvZiB0aGF0IHR5cGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdWxsYWJsZTxUID0gYW55PihlbGVtZW50OiAoc291cmNlOiBhbnkpID0+IFQpOiAoc291cmNlOiBhbnkpID0+IChUIHwgbnVsbCkge1xuICAgIGlmIChlbGVtZW50ID09PSBBbnkpIHtcbiAgICAgICAgcmV0dXJuIEFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IG51bGwgOiBlbGVtZW50KHNvdXJjZSkpO1xufVxuXG4vKipcbiAqIFN0cnVjdCB0YWtlcyBhbiBvYmplY3QgbWFwcGluZyBmaWVsZCBuYW1lcyB0byBjcmVhdGlvbiBmdW5jdGlvbnNcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhIHN0cnVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cnVjdChjcmVhdGVGaWVsZDogUmVjb3JkPHN0cmluZywgKHNvdXJjZTogYW55KSA9PiBhbnk+KTpcbiAgICA8VSBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSBhbnk+KHNvdXJjZTogYW55KSA9PiBVXG57XG4gICAgbGV0IGFsbEFueSA9IHRydWU7XG4gICAgZm9yIChjb25zdCBuYW1lIGluIGNyZWF0ZUZpZWxkKSB7XG4gICAgICAgIGlmIChjcmVhdGVGaWVsZFtuYW1lXSAhPT0gQW55KSB7XG4gICAgICAgICAgICBhbGxBbnkgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhbGxBbnkpIHtcbiAgICAgICAgcmV0dXJuIEFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gY3JlYXRlRmllbGQpIHtcbiAgICAgICAgICAgIGlmIChuYW1lIGluIHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHNvdXJjZVtuYW1lXSA9IGNyZWF0ZUZpZWxkW25hbWVdKHNvdXJjZVtuYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9O1xufVxuXG4vKipcbiAqIERhdGVGcm9tVGltZSBpcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIHRoYXQgY29udmVydHMgUkZDMzMzOSBzdHJpbmdzXG4gKiAoZnJvbSBHbydzIHRpbWUuVGltZSBKU09OIG1hcnNoYWxpbmcpIHRvIEphdmFTY3JpcHQgRGF0ZSBvYmplY3RzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gRGF0ZUZyb21UaW1lKHNvdXJjZTogYW55KTogRGF0ZSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHNvdXJjZSk7XG59XG5cbi8qKlxuICogTWFwcyBrbm93biBldmVudCBuYW1lcyB0byBjcmVhdGlvbiBmdW5jdGlvbnMgZm9yIHRoZWlyIGRhdGEgdHlwZXMuXG4gKiBXaWxsIGJlIG1vbmtleS1wYXRjaGVkIGJ5IHRoZSBiaW5kaW5nIGdlbmVyYXRvci5cbiAqL1xuZXhwb3J0IGNvbnN0IEV2ZW50czogUmVjb3JkPHN0cmluZywgKHNvdXJjZTogYW55KSA9PiBhbnk+ID0ge307XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHtuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lc30gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG4vLyBzZXR1cFxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcblxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xufVxuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5EaWFsb2cpO1xuXG4vLyBEZWZpbmUgY29uc3RhbnRzIGZyb20gdGhlIGBtZXRob2RzYCBvYmplY3QgaW4gVGl0bGUgQ2FzZVxuY29uc3QgRGlhbG9nSW5mbyA9IDA7XG5jb25zdCBEaWFsb2dXYXJuaW5nID0gMTtcbmNvbnN0IERpYWxvZ0Vycm9yID0gMjtcbmNvbnN0IERpYWxvZ1F1ZXN0aW9uID0gMztcbmNvbnN0IERpYWxvZ09wZW5GaWxlID0gNDtcbmNvbnN0IERpYWxvZ1NhdmVGaWxlID0gNTtcbmNvbnN0IERpYWxvZ1RleHRJbnB1dCA9IDY7XG5cbi8qKiBPcHRpb25zIGZvciBhIG5hdGl2ZSB0ZXh0IG9yIHBhc3N3b3JkIHByb21wdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGV4dElucHV0RGlhbG9nT3B0aW9ucyB7XG4gICAgVGl0bGU/OiBzdHJpbmc7XG4gICAgTWVzc2FnZT86IHN0cmluZztcbiAgICBEZWZhdWx0VGV4dD86IHN0cmluZztcbiAgICBQbGFjZWhvbGRlcj86IHN0cmluZztcbiAgICBQYXNzd29yZD86IGJvb2xlYW47XG4gICAgT0tCdXR0b25UZXh0Pzogc3RyaW5nO1xuICAgIENhbmNlbEJ1dHRvblRleHQ/OiBzdHJpbmc7XG4gICAgLyoqIFRydWUgdG8gc2hvdyB0aGUgZGlhbG9nIHdpdGhvdXQgYXR0YWNoaW5nIGl0IHRvIHRoZSBjYWxsaW5nIHdpbmRvdy4gKi9cbiAgICBEZXRhY2hlZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3BlbkZpbGVEaWFsb2dPcHRpb25zIHtcbiAgICAvKiogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjaG9zZW4uICovXG4gICAgQ2FuQ2hvb3NlRGlyZWN0b3JpZXM/OiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgZmlsZXMgY2FuIGJlIGNob3Nlbi4gKi9cbiAgICBDYW5DaG9vc2VGaWxlcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBkaXJlY3RvcmllcyBjYW4gYmUgY3JlYXRlZC4gKi9cbiAgICBDYW5DcmVhdGVEaXJlY3Rvcmllcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBoaWRkZW4gZmlsZXMgc2hvdWxkIGJlIHNob3duLiAqL1xuICAgIFNob3dIaWRkZW5GaWxlcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBhbGlhc2VzIHNob3VsZCBiZSByZXNvbHZlZC4gKi9cbiAgICBSZXNvbHZlc0FsaWFzZXM/OiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgbXVsdGlwbGUgc2VsZWN0aW9uIGlzIGFsbG93ZWQuICovXG4gICAgQWxsb3dzTXVsdGlwbGVTZWxlY3Rpb24/OiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgdGhlIGV4dGVuc2lvbiBzaG91bGQgYmUgaGlkZGVuLiAqL1xuICAgIEhpZGVFeHRlbnNpb24/OiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgaGlkZGVuIGV4dGVuc2lvbnMgY2FuIGJlIHNlbGVjdGVkLiAqL1xuICAgIENhblNlbGVjdEhpZGRlbkV4dGVuc2lvbj86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBmaWxlIHBhY2thZ2VzIHNob3VsZCBiZSB0cmVhdGVkIGFzIGRpcmVjdG9yaWVzLiAqL1xuICAgIFRyZWF0c0ZpbGVQYWNrYWdlc0FzRGlyZWN0b3JpZXM/OiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgb3RoZXIgZmlsZSB0eXBlcyBhcmUgYWxsb3dlZC4gKi9cbiAgICBBbGxvd3NPdGhlckZpbGV0eXBlcz86IGJvb2xlYW47XG4gICAgLyoqIEFycmF5IG9mIGZpbGUgZmlsdGVycy4gKi9cbiAgICBGaWx0ZXJzPzogRmlsZUZpbHRlcltdO1xuICAgIC8qKiBUaXRsZSBvZiB0aGUgZGlhbG9nLiAqL1xuICAgIFRpdGxlPzogc3RyaW5nO1xuICAgIC8qKiBNZXNzYWdlIHRvIHNob3cgaW4gdGhlIGRpYWxvZy4gKi9cbiAgICBNZXNzYWdlPzogc3RyaW5nO1xuICAgIC8qKiBUZXh0IHRvIGRpc3BsYXkgb24gdGhlIGJ1dHRvbi4gKi9cbiAgICBCdXR0b25UZXh0Pzogc3RyaW5nO1xuICAgIC8qKiBEaXJlY3RvcnkgdG8gb3BlbiBpbiB0aGUgZGlhbG9nLiAqL1xuICAgIERpcmVjdG9yeT86IHN0cmluZztcbiAgICAvKiogSW5kaWNhdGVzIGlmIHRoZSBkaWFsb2cgc2hvdWxkIGFwcGVhciBkZXRhY2hlZCBmcm9tIHRoZSBtYWluIHdpbmRvdy4gKi9cbiAgICBEZXRhY2hlZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2F2ZUZpbGVEaWFsb2dPcHRpb25zIHtcbiAgICAvKiogRGVmYXVsdCBmaWxlbmFtZSB0byB1c2UgaW4gdGhlIGRpYWxvZy4gKi9cbiAgICBGaWxlbmFtZT86IHN0cmluZztcbiAgICAvKiogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjaG9zZW4uICovXG4gICAgQ2FuQ2hvb3NlRGlyZWN0b3JpZXM/OiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgZmlsZXMgY2FuIGJlIGNob3Nlbi4gKi9cbiAgICBDYW5DaG9vc2VGaWxlcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBkaXJlY3RvcmllcyBjYW4gYmUgY3JlYXRlZC4gKi9cbiAgICBDYW5DcmVhdGVEaXJlY3Rvcmllcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBoaWRkZW4gZmlsZXMgc2hvdWxkIGJlIHNob3duLiAqL1xuICAgIFNob3dIaWRkZW5GaWxlcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBhbGlhc2VzIHNob3VsZCBiZSByZXNvbHZlZC4gKi9cbiAgICBSZXNvbHZlc0FsaWFzZXM/OiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgdGhlIGV4dGVuc2lvbiBzaG91bGQgYmUgaGlkZGVuLiAqL1xuICAgIEhpZGVFeHRlbnNpb24/OiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgaGlkZGVuIGV4dGVuc2lvbnMgY2FuIGJlIHNlbGVjdGVkLiAqL1xuICAgIENhblNlbGVjdEhpZGRlbkV4dGVuc2lvbj86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBmaWxlIHBhY2thZ2VzIHNob3VsZCBiZSB0cmVhdGVkIGFzIGRpcmVjdG9yaWVzLiAqL1xuICAgIFRyZWF0c0ZpbGVQYWNrYWdlc0FzRGlyZWN0b3JpZXM/OiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgb3RoZXIgZmlsZSB0eXBlcyBhcmUgYWxsb3dlZC4gKi9cbiAgICBBbGxvd3NPdGhlckZpbGV0eXBlcz86IGJvb2xlYW47XG4gICAgLyoqIEFycmF5IG9mIGZpbGUgZmlsdGVycy4gKi9cbiAgICBGaWx0ZXJzPzogRmlsZUZpbHRlcltdO1xuICAgIC8qKiBUaXRsZSBvZiB0aGUgZGlhbG9nLiAqL1xuICAgIFRpdGxlPzogc3RyaW5nO1xuICAgIC8qKiBNZXNzYWdlIHRvIHNob3cgaW4gdGhlIGRpYWxvZy4gKi9cbiAgICBNZXNzYWdlPzogc3RyaW5nO1xuICAgIC8qKiBUZXh0IHRvIGRpc3BsYXkgb24gdGhlIGJ1dHRvbi4gKi9cbiAgICBCdXR0b25UZXh0Pzogc3RyaW5nO1xuICAgIC8qKiBEaXJlY3RvcnkgdG8gb3BlbiBpbiB0aGUgZGlhbG9nLiAqL1xuICAgIERpcmVjdG9yeT86IHN0cmluZztcbiAgICAvKiogSW5kaWNhdGVzIGlmIHRoZSBkaWFsb2cgc2hvdWxkIGFwcGVhciBkZXRhY2hlZCBmcm9tIHRoZSBtYWluIHdpbmRvdy4gKi9cbiAgICBEZXRhY2hlZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVzc2FnZURpYWxvZ09wdGlvbnMge1xuICAgIC8qKiBUaGUgdGl0bGUgb2YgdGhlIGRpYWxvZyB3aW5kb3cuICovXG4gICAgVGl0bGU/OiBzdHJpbmc7XG4gICAgLyoqIFRoZSBtYWluIG1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLiAqL1xuICAgIE1lc3NhZ2U/OiBzdHJpbmc7XG4gICAgLyoqIEFycmF5IG9mIGJ1dHRvbiBvcHRpb25zIHRvIHNob3cgaW4gdGhlIGRpYWxvZy4gKi9cbiAgICBCdXR0b25zPzogQnV0dG9uW107XG4gICAgLyoqIFRydWUgaWYgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93IChpZiBhcHBsaWNhYmxlKS4gKi9cbiAgICBEZXRhY2hlZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnV0dG9uIHtcbiAgICAvKiogVGV4dCB0aGF0IGFwcGVhcnMgd2l0aGluIHRoZSBidXR0b24uICovXG4gICAgTGFiZWw/OiBzdHJpbmc7XG4gICAgLyoqIFRydWUgaWYgdGhlIGJ1dHRvbiBzaG91bGQgY2FuY2VsIGFuIG9wZXJhdGlvbiB3aGVuIGNsaWNrZWQuICovXG4gICAgSXNDYW5jZWw/OiBib29sZWFuO1xuICAgIC8qKiBUcnVlIGlmIHRoZSBidXR0b24gc2hvdWxkIGJlIHRoZSBkZWZhdWx0IGFjdGlvbiB3aGVuIHRoZSB1c2VyIHByZXNzZXMgZW50ZXIuICovXG4gICAgSXNEZWZhdWx0PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaWxlRmlsdGVyIHtcbiAgICAvKiogRGlzcGxheSBuYW1lIGZvciB0aGUgZmlsdGVyLCBpdCBjb3VsZCBiZSBcIlRleHQgRmlsZXNcIiwgXCJJbWFnZXNcIiBldGMuICovXG4gICAgRGlzcGxheU5hbWU/OiBzdHJpbmc7XG4gICAgLyoqIFBhdHRlcm4gdG8gbWF0Y2ggZm9yIHRoZSBmaWx0ZXIsIGUuZy4gXCIqLnR4dDsqLm1kXCIgZm9yIHRleHQgbWFya2Rvd24gZmlsZXMuICovXG4gICAgUGF0dGVybj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBQcmVzZW50cyBhIGRpYWxvZyBvZiBzcGVjaWZpZWQgdHlwZSB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSB0eXBlIC0gRGlhbG9nIHR5cGUuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBkaWFsb2cuXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHJlc3VsdCBvZiBkaWFsb2cuXG4gKi9cbmZ1bmN0aW9uIGRpYWxvZyh0eXBlOiBudW1iZXIsIG9wdGlvbnM6IE1lc3NhZ2VEaWFsb2dPcHRpb25zIHwgT3BlbkZpbGVEaWFsb2dPcHRpb25zIHwgU2F2ZUZpbGVEaWFsb2dPcHRpb25zIHwgVGV4dElucHV0RGlhbG9nT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gY2FsbCh0eXBlLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBQcmVzZW50cyBhbiBpbmZvIGRpYWxvZy5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyAtIERpYWxvZyBvcHRpb25zXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBsYWJlbCBvZiB0aGUgY2hvc2VuIGJ1dHRvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEluZm8ob3B0aW9uczogTWVzc2FnZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4geyByZXR1cm4gZGlhbG9nKERpYWxvZ0luZm8sIG9wdGlvbnMpOyB9XG5cbi8qKlxuICogUHJlc2VudHMgYSB3YXJuaW5nIGRpYWxvZy5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyAtIERpYWxvZyBvcHRpb25zLlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgbGFiZWwgb2YgdGhlIGNob3NlbiBidXR0b24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBXYXJuaW5nKG9wdGlvbnM6IE1lc3NhZ2VEaWFsb2dPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHsgcmV0dXJuIGRpYWxvZyhEaWFsb2dXYXJuaW5nLCBvcHRpb25zKTsgfVxuXG4vKipcbiAqIFByZXNlbnRzIGFuIGVycm9yIGRpYWxvZy5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyAtIERpYWxvZyBvcHRpb25zLlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgbGFiZWwgb2YgdGhlIGNob3NlbiBidXR0b24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFcnJvcihvcHRpb25zOiBNZXNzYWdlRGlhbG9nT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7IHJldHVybiBkaWFsb2coRGlhbG9nRXJyb3IsIG9wdGlvbnMpOyB9XG5cbi8qKlxuICogUHJlc2VudHMgYSBxdWVzdGlvbiBkaWFsb2cuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBEaWFsb2cgb3B0aW9ucy5cbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGxhYmVsIG9mIHRoZSBjaG9zZW4gYnV0dG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gUXVlc3Rpb24ob3B0aW9uczogTWVzc2FnZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4geyByZXR1cm4gZGlhbG9nKERpYWxvZ1F1ZXN0aW9uLCBvcHRpb25zKTsgfVxuXG4vKipcbiAqIFByZXNlbnRzIGEgZmlsZSBzZWxlY3Rpb24gZGlhbG9nIHRvIHBpY2sgb25lIG9yIG1vcmUgZmlsZXMgdG8gb3Blbi5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyAtIERpYWxvZyBvcHRpb25zLlxuICogQHJldHVybnMgU2VsZWN0ZWQgZmlsZSBvciBsaXN0IG9mIGZpbGVzLCBvciBhIGJsYW5rIHN0cmluZy9lbXB0eSBsaXN0IGlmIG5vIGZpbGUgaGFzIGJlZW4gc2VsZWN0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPcGVuRmlsZShvcHRpb25zOiBPcGVuRmlsZURpYWxvZ09wdGlvbnMgJiB7IEFsbG93c011bHRpcGxlU2VsZWN0aW9uOiB0cnVlIH0pOiBQcm9taXNlPHN0cmluZ1tdPjtcbmV4cG9ydCBmdW5jdGlvbiBPcGVuRmlsZShvcHRpb25zOiBPcGVuRmlsZURpYWxvZ09wdGlvbnMgJiB7IEFsbG93c011bHRpcGxlU2VsZWN0aW9uPzogZmFsc2UgfCB1bmRlZmluZWQgfSk6IFByb21pc2U8c3RyaW5nPjtcbmV4cG9ydCBmdW5jdGlvbiBPcGVuRmlsZShvcHRpb25zOiBPcGVuRmlsZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZyB8IHN0cmluZ1tdPjtcbmV4cG9ydCBmdW5jdGlvbiBPcGVuRmlsZShvcHRpb25zOiBPcGVuRmlsZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZyB8IHN0cmluZ1tdPiB7IHJldHVybiBkaWFsb2coRGlhbG9nT3BlbkZpbGUsIG9wdGlvbnMpID8/IFtdOyB9XG5cbi8qKlxuICogUHJlc2VudHMgYSBmaWxlIHNlbGVjdGlvbiBkaWFsb2cgdG8gcGljayBhIGZpbGUgdG8gc2F2ZS5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyAtIERpYWxvZyBvcHRpb25zLlxuICogQHJldHVybnMgU2VsZWN0ZWQgZmlsZSwgb3IgYSBibGFuayBzdHJpbmcgaWYgbm8gZmlsZSBoYXMgYmVlbiBzZWxlY3RlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNhdmVGaWxlKG9wdGlvbnM6IFNhdmVGaWxlRGlhbG9nT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7IHJldHVybiBkaWFsb2coRGlhbG9nU2F2ZUZpbGUsIG9wdGlvbnMpOyB9XG5cbi8qKlxuICogUHJlc2VudHMgYSBuYXRpdmUgdGV4dCBpbnB1dCBkaWFsb2csIG9wdGlvbmFsbHkgbWFza2luZyBpbnB1dCBhcyBhIHBhc3N3b3JkLlxuICogUmVzb2x2ZXMgd2l0aCB0aGUgZW50ZXJlZCB0ZXh0LCBvciBhbiBlbXB0eSBzdHJpbmcgd2hlbiBjYW5jZWxsZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUZXh0SW5wdXQob3B0aW9uczogVGV4dElucHV0RGlhbG9nT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gZGlhbG9nKERpYWxvZ1RleHRJbnB1dCwgb3B0aW9ucyk7XG59XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLy8gVGhlIGZvbGxvd2luZyB1dGlsaXRpZXMgaGF2ZSBiZWVuIGZhY3RvcmVkIG91dCBvZiAuL2V2ZW50cy50c1xuLy8gZm9yIHRlc3RpbmcgcHVycG9zZXMuXG5cbmV4cG9ydCBjb25zdCBldmVudExpc3RlbmVycyA9IG5ldyBNYXA8c3RyaW5nLCBMaXN0ZW5lcltdPigpO1xuXG5leHBvcnQgY2xhc3MgTGlzdGVuZXIge1xuICAgIGV2ZW50TmFtZTogc3RyaW5nO1xuICAgIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiB2b2lkO1xuICAgIG1heENhbGxiYWNrczogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiB2b2lkLCBtYXhDYWxsYmFja3M6IG51bWJlcikge1xuICAgICAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLm1heENhbGxiYWNrcyA9IG1heENhbGxiYWNrcyB8fCAtMTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaChkYXRhOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubWF4Q2FsbGJhY2tzID09PSAtMSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLm1heENhbGxiYWNrcyAtPSAxO1xuICAgICAgICByZXR1cm4gdGhpcy5tYXhDYWxsYmFja3MgPT09IDA7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuZXJPZmYobGlzdGVuZXI6IExpc3RlbmVyKTogdm9pZCB7XG4gICAgbGV0IGxpc3RlbmVycyA9IGV2ZW50TGlzdGVuZXJzLmdldChsaXN0ZW5lci5ldmVudE5hbWUpO1xuICAgIGlmICghbGlzdGVuZXJzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuZmlsdGVyKGwgPT4gbCAhPT0gbGlzdGVuZXIpO1xuICAgIGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGV2ZW50TGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lci5ldmVudE5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGV2ZW50TGlzdGVuZXJzLnNldChsaXN0ZW5lci5ldmVudE5hbWUsIGxpc3RlbmVycyk7XG4gICAgfVxufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggw4IgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmV4cG9ydCBjb25zdCBUeXBlcyA9IE9iamVjdC5mcmVlemUoe1xuXHRXaW5kb3dzOiBPYmplY3QuZnJlZXplKHtcblx0XHRBUE1Qb3dlclNldHRpbmdDaGFuZ2U6IFwid2luZG93czpBUE1Qb3dlclNldHRpbmdDaGFuZ2VcIixcblx0XHRBUE1Qb3dlclN0YXR1c0NoYW5nZTogXCJ3aW5kb3dzOkFQTVBvd2VyU3RhdHVzQ2hhbmdlXCIsXG5cdFx0QVBNUmVzdW1lQXV0b21hdGljOiBcIndpbmRvd3M6QVBNUmVzdW1lQXV0b21hdGljXCIsXG5cdFx0QVBNUmVzdW1lU3VzcGVuZDogXCJ3aW5kb3dzOkFQTVJlc3VtZVN1c3BlbmRcIixcblx0XHRBUE1TdXNwZW5kOiBcIndpbmRvd3M6QVBNU3VzcGVuZFwiLFxuXHRcdEFwcGxpY2F0aW9uU3RhcnRlZDogXCJ3aW5kb3dzOkFwcGxpY2F0aW9uU3RhcnRlZFwiLFxuXHRcdFN5c3RlbVRoZW1lQ2hhbmdlZDogXCJ3aW5kb3dzOlN5c3RlbVRoZW1lQ2hhbmdlZFwiLFxuXHRcdFdlYlZpZXdOYXZpZ2F0aW9uQ29tcGxldGVkOiBcIndpbmRvd3M6V2ViVmlld05hdmlnYXRpb25Db21wbGV0ZWRcIixcblx0XHRXaW5kb3dBY3RpdmU6IFwid2luZG93czpXaW5kb3dBY3RpdmVcIixcblx0XHRXaW5kb3dCYWNrZ3JvdW5kRXJhc2U6IFwid2luZG93czpXaW5kb3dCYWNrZ3JvdW5kRXJhc2VcIixcblx0XHRXaW5kb3dDbGlja0FjdGl2ZTogXCJ3aW5kb3dzOldpbmRvd0NsaWNrQWN0aXZlXCIsXG5cdFx0V2luZG93Q2xvc2luZzogXCJ3aW5kb3dzOldpbmRvd0Nsb3NpbmdcIixcblx0XHRXaW5kb3dEaWRNb3ZlOiBcIndpbmRvd3M6V2luZG93RGlkTW92ZVwiLFxuXHRcdFdpbmRvd0RpZFJlc2l6ZTogXCJ3aW5kb3dzOldpbmRvd0RpZFJlc2l6ZVwiLFxuXHRcdFdpbmRvd0RQSUNoYW5nZWQ6IFwid2luZG93czpXaW5kb3dEUElDaGFuZ2VkXCIsXG5cdFx0V2luZG93RHJhZ0Ryb3A6IFwid2luZG93czpXaW5kb3dEcmFnRHJvcFwiLFxuXHRcdFdpbmRvd0RyYWdFbnRlcjogXCJ3aW5kb3dzOldpbmRvd0RyYWdFbnRlclwiLFxuXHRcdFdpbmRvd0RyYWdMZWF2ZTogXCJ3aW5kb3dzOldpbmRvd0RyYWdMZWF2ZVwiLFxuXHRcdFdpbmRvd0RyYWdPdmVyOiBcIndpbmRvd3M6V2luZG93RHJhZ092ZXJcIixcblx0XHRXaW5kb3dFbmRNb3ZlOiBcIndpbmRvd3M6V2luZG93RW5kTW92ZVwiLFxuXHRcdFdpbmRvd0VuZFJlc2l6ZTogXCJ3aW5kb3dzOldpbmRvd0VuZFJlc2l6ZVwiLFxuXHRcdFdpbmRvd0Z1bGxzY3JlZW46IFwid2luZG93czpXaW5kb3dGdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93SGlkZTogXCJ3aW5kb3dzOldpbmRvd0hpZGVcIixcblx0XHRXaW5kb3dJbmFjdGl2ZTogXCJ3aW5kb3dzOldpbmRvd0luYWN0aXZlXCIsXG5cdFx0V2luZG93S2V5RG93bjogXCJ3aW5kb3dzOldpbmRvd0tleURvd25cIixcblx0XHRXaW5kb3dLZXlVcDogXCJ3aW5kb3dzOldpbmRvd0tleVVwXCIsXG5cdFx0V2luZG93S2lsbEZvY3VzOiBcIndpbmRvd3M6V2luZG93S2lsbEZvY3VzXCIsXG5cdFx0V2luZG93Tm9uQ2xpZW50SGl0OiBcIndpbmRvd3M6V2luZG93Tm9uQ2xpZW50SGl0XCIsXG5cdFx0V2luZG93Tm9uQ2xpZW50TW91c2VEb3duOiBcIndpbmRvd3M6V2luZG93Tm9uQ2xpZW50TW91c2VEb3duXCIsXG5cdFx0V2luZG93Tm9uQ2xpZW50TW91c2VMZWF2ZTogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlTGVhdmVcIixcblx0XHRXaW5kb3dOb25DbGllbnRNb3VzZU1vdmU6IFwid2luZG93czpXaW5kb3dOb25DbGllbnRNb3VzZU1vdmVcIixcblx0XHRXaW5kb3dOb25DbGllbnRNb3VzZVVwOiBcIndpbmRvd3M6V2luZG93Tm9uQ2xpZW50TW91c2VVcFwiLFxuXHRcdFdpbmRvd1BhaW50OiBcIndpbmRvd3M6V2luZG93UGFpbnRcIixcblx0XHRXaW5kb3dSZXN0b3JlOiBcIndpbmRvd3M6V2luZG93UmVzdG9yZVwiLFxuXHRcdFdpbmRvd1NldEZvY3VzOiBcIndpbmRvd3M6V2luZG93U2V0Rm9jdXNcIixcblx0XHRXaW5kb3dTaG93OiBcIndpbmRvd3M6V2luZG93U2hvd1wiLFxuXHRcdFdpbmRvd1N0YXJ0TW92ZTogXCJ3aW5kb3dzOldpbmRvd1N0YXJ0TW92ZVwiLFxuXHRcdFdpbmRvd1N0YXJ0UmVzaXplOiBcIndpbmRvd3M6V2luZG93U3RhcnRSZXNpemVcIixcblx0XHRXaW5kb3dVbkZ1bGxzY3JlZW46IFwid2luZG93czpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcblx0XHRXaW5kb3daT3JkZXJDaGFuZ2VkOiBcIndpbmRvd3M6V2luZG93Wk9yZGVyQ2hhbmdlZFwiLFxuXHRcdFdpbmRvd01pbmltaXNlOiBcIndpbmRvd3M6V2luZG93TWluaW1pc2VcIixcblx0XHRXaW5kb3dVbk1pbmltaXNlOiBcIndpbmRvd3M6V2luZG93VW5NaW5pbWlzZVwiLFxuXHRcdFdpbmRvd01heGltaXNlOiBcIndpbmRvd3M6V2luZG93TWF4aW1pc2VcIixcblx0XHRXaW5kb3dVbk1heGltaXNlOiBcIndpbmRvd3M6V2luZG93VW5NYXhpbWlzZVwiLFxuXHR9KSxcblx0TWFjOiBPYmplY3QuZnJlZXplKHtcblx0XHRBcHBsaWNhdGlvbkRpZEJlY29tZUFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUVmZmVjdGl2ZUFwcGVhcmFuY2VcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUljb246IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlSWNvblwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGVcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVNjcmVlblBhcmFtZXRlcnM6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlU2NyZWVuUGFyYW1ldGVyc1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlU3RhdHVzQmFyRnJhbWU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlU3RhdHVzQmFyRnJhbWVcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0Jhck9yaWVudGF0aW9uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0Jhck9yaWVudGF0aW9uXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VUaGVtZTogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VUaGVtZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiBcIm1hYzpBcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZ1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkSGlkZTogXCJtYWM6QXBwbGljYXRpb25EaWRIaWRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRSZXNpZ25BY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uRGlkUmVzaWduQWN0aXZlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRVbmhpZGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkVW5oaWRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkVXBkYXRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRXYWtlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZFdha2VcIixcblx0XHRBcHBsaWNhdGlvblNjcmVlbnNEaWRTbGVlcDogXCJtYWM6QXBwbGljYXRpb25TY3JlZW5zRGlkU2xlZXBcIixcblx0XHRBcHBsaWNhdGlvblNjcmVlbnNEaWRXYWtlOiBcIm1hYzpBcHBsaWNhdGlvblNjcmVlbnNEaWRXYWtlXCIsXG5cdFx0QXBwbGljYXRpb25TaG91bGRIYW5kbGVSZW9wZW46IFwibWFjOkFwcGxpY2F0aW9uU2hvdWxkSGFuZGxlUmVvcGVuXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsQmVjb21lQWN0aXZlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxCZWNvbWVBY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxGaW5pc2hMYXVuY2hpbmc6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEZpbmlzaExhdW5jaGluZ1wiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbEhpZGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEhpZGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFJlc2lnbkFjdGl2ZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFNsZWVwOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxTbGVlcFwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFRlcm1pbmF0ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsVGVybWluYXRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsVW5oaWRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxVbmhpZGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFVwZGF0ZVwiLFxuXHRcdE1lbnVEaWRBZGRJdGVtOiBcIm1hYzpNZW51RGlkQWRkSXRlbVwiLFxuXHRcdE1lbnVEaWRCZWdpblRyYWNraW5nOiBcIm1hYzpNZW51RGlkQmVnaW5UcmFja2luZ1wiLFxuXHRcdE1lbnVEaWRDbG9zZTogXCJtYWM6TWVudURpZENsb3NlXCIsXG5cdFx0TWVudURpZERpc3BsYXlJdGVtOiBcIm1hYzpNZW51RGlkRGlzcGxheUl0ZW1cIixcblx0XHRNZW51RGlkRW5kVHJhY2tpbmc6IFwibWFjOk1lbnVEaWRFbmRUcmFja2luZ1wiLFxuXHRcdE1lbnVEaWRIaWdobGlnaHRJdGVtOiBcIm1hYzpNZW51RGlkSGlnaGxpZ2h0SXRlbVwiLFxuXHRcdE1lbnVEaWRPcGVuOiBcIm1hYzpNZW51RGlkT3BlblwiLFxuXHRcdE1lbnVEaWRQb3BVcDogXCJtYWM6TWVudURpZFBvcFVwXCIsXG5cdFx0TWVudURpZFJlbW92ZUl0ZW06IFwibWFjOk1lbnVEaWRSZW1vdmVJdGVtXCIsXG5cdFx0TWVudURpZFNlbmRBY3Rpb246IFwibWFjOk1lbnVEaWRTZW5kQWN0aW9uXCIsXG5cdFx0TWVudURpZFNlbmRBY3Rpb25Ub0l0ZW06IFwibWFjOk1lbnVEaWRTZW5kQWN0aW9uVG9JdGVtXCIsXG5cdFx0TWVudURpZFVwZGF0ZTogXCJtYWM6TWVudURpZFVwZGF0ZVwiLFxuXHRcdE1lbnVXaWxsQWRkSXRlbTogXCJtYWM6TWVudVdpbGxBZGRJdGVtXCIsXG5cdFx0TWVudVdpbGxCZWdpblRyYWNraW5nOiBcIm1hYzpNZW51V2lsbEJlZ2luVHJhY2tpbmdcIixcblx0XHRNZW51V2lsbERpc3BsYXlJdGVtOiBcIm1hYzpNZW51V2lsbERpc3BsYXlJdGVtXCIsXG5cdFx0TWVudVdpbGxFbmRUcmFja2luZzogXCJtYWM6TWVudVdpbGxFbmRUcmFja2luZ1wiLFxuXHRcdE1lbnVXaWxsSGlnaGxpZ2h0SXRlbTogXCJtYWM6TWVudVdpbGxIaWdobGlnaHRJdGVtXCIsXG5cdFx0TWVudVdpbGxPcGVuOiBcIm1hYzpNZW51V2lsbE9wZW5cIixcblx0XHRNZW51V2lsbFBvcFVwOiBcIm1hYzpNZW51V2lsbFBvcFVwXCIsXG5cdFx0TWVudVdpbGxSZW1vdmVJdGVtOiBcIm1hYzpNZW51V2lsbFJlbW92ZUl0ZW1cIixcblx0XHRNZW51V2lsbFNlbmRBY3Rpb246IFwibWFjOk1lbnVXaWxsU2VuZEFjdGlvblwiLFxuXHRcdE1lbnVXaWxsU2VuZEFjdGlvblRvSXRlbTogXCJtYWM6TWVudVdpbGxTZW5kQWN0aW9uVG9JdGVtXCIsXG5cdFx0TWVudVdpbGxVcGRhdGU6IFwibWFjOk1lbnVXaWxsVXBkYXRlXCIsXG5cdFx0V2ViVmlld0RpZENvbW1pdE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRDb21taXROYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZEZpbmlzaE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRGaW5pc2hOYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZFJlY2VpdmVTZXJ2ZXJSZWRpcmVjdEZvclByb3Zpc2lvbmFsTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZFJlY2VpdmVTZXJ2ZXJSZWRpcmVjdEZvclByb3Zpc2lvbmFsTmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRTdGFydFByb3Zpc2lvbmFsTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZFN0YXJ0UHJvdmlzaW9uYWxOYXZpZ2F0aW9uXCIsXG5cdFx0V2luZG93RGlkQmVjb21lS2V5OiBcIm1hYzpXaW5kb3dEaWRCZWNvbWVLZXlcIixcblx0XHRXaW5kb3dEaWRCZWNvbWVNYWluOiBcIm1hYzpXaW5kb3dEaWRCZWNvbWVNYWluXCIsXG5cdFx0V2luZG93RGlkQmVnaW5TaGVldDogXCJtYWM6V2luZG93RGlkQmVnaW5TaGVldFwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUFscGhhOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VBbHBoYVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUJhY2tpbmdMb2NhdGlvbjogXCJtYWM6V2luZG93RGlkQ2hhbmdlQmFja2luZ0xvY2F0aW9uXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlQmFja2luZ1Byb3BlcnRpZXM6IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VDb2xsZWN0aW9uQmVoYXZpb3JcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGU6IFwibWFjOldpbmRvd0RpZENoYW5nZU9jY2x1c2lvblN0YXRlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlT3JkZXJpbmdNb2RlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VPcmRlcmluZ01vZGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW46IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblBhcmFtZXRlcnM6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblBhcmFtZXRlcnNcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW5Qcm9maWxlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5Qcm9maWxlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2U6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2VQcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVByb3BlcnRpZXNcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTaGFyaW5nVHlwZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2hhcmluZ1R5cGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTcGFjZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU3BhY2VcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTcGFjZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU3BhY2VPcmRlcmluZ01vZGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VUaXRsZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlVGl0bGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VUb29sYmFyOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VUb29sYmFyXCIsXG5cdFx0V2luZG93RGlkRGVtaW5pYXR1cml6ZTogXCJtYWM6V2luZG93RGlkRGVtaW5pYXR1cml6ZVwiLFxuXHRcdFdpbmRvd0RpZEVuZFNoZWV0OiBcIm1hYzpXaW5kb3dEaWRFbmRTaGVldFwiLFxuXHRcdFdpbmRvd0RpZEVudGVyRnVsbFNjcmVlbjogXCJtYWM6V2luZG93RGlkRW50ZXJGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkRW50ZXJWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93RGlkRW50ZXJWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd0RpZEV4aXRGdWxsU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRFeGl0RnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZEV4aXRWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93RGlkRXhpdFZlcnNpb25Ccm93c2VyXCIsXG5cdFx0V2luZG93RGlkRXhwb3NlOiBcIm1hYzpXaW5kb3dEaWRFeHBvc2VcIixcblx0XHRXaW5kb3dEaWRGb2N1czogXCJtYWM6V2luZG93RGlkRm9jdXNcIixcblx0XHRXaW5kb3dEaWRNaW5pYXR1cml6ZTogXCJtYWM6V2luZG93RGlkTWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dEaWRNb3ZlOiBcIm1hYzpXaW5kb3dEaWRNb3ZlXCIsXG5cdFx0V2luZG93RGlkT3JkZXJPZmZTY3JlZW46IFwibWFjOldpbmRvd0RpZE9yZGVyT2ZmU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkT3JkZXJPblNjcmVlbjogXCJtYWM6V2luZG93RGlkT3JkZXJPblNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZFJlc2lnbktleTogXCJtYWM6V2luZG93RGlkUmVzaWduS2V5XCIsXG5cdFx0V2luZG93RGlkUmVzaWduTWFpbjogXCJtYWM6V2luZG93RGlkUmVzaWduTWFpblwiLFxuXHRcdFdpbmRvd0RpZFJlc2l6ZTogXCJtYWM6V2luZG93RGlkUmVzaXplXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVBbHBoYTogXCJtYWM6V2luZG93RGlkVXBkYXRlQWxwaGFcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3I6IFwibWFjOldpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvclwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllc1wiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZVNoYWRvdzogXCJtYWM6V2luZG93RGlkVXBkYXRlU2hhZG93XCIsXG5cdFx0V2luZG93RGlkVXBkYXRlVGl0bGU6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVRpdGxlXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlVG9vbGJhcjogXCJtYWM6V2luZG93RGlkVXBkYXRlVG9vbGJhclwiLFxuXHRcdFdpbmRvd0RpZFpvb206IFwibWFjOldpbmRvd0RpZFpvb21cIixcblx0XHRXaW5kb3dGaWxlRHJhZ2dpbmdFbnRlcmVkOiBcIm1hYzpXaW5kb3dGaWxlRHJhZ2dpbmdFbnRlcmVkXCIsXG5cdFx0V2luZG93RmlsZURyYWdnaW5nRXhpdGVkOiBcIm1hYzpXaW5kb3dGaWxlRHJhZ2dpbmdFeGl0ZWRcIixcblx0XHRXaW5kb3dGaWxlRHJhZ2dpbmdQZXJmb3JtZWQ6IFwibWFjOldpbmRvd0ZpbGVEcmFnZ2luZ1BlcmZvcm1lZFwiLFxuXHRcdFdpbmRvd0hpZGU6IFwibWFjOldpbmRvd0hpZGVcIixcblx0XHRXaW5kb3dNYXhpbWlzZTogXCJtYWM6V2luZG93TWF4aW1pc2VcIixcblx0XHRXaW5kb3dVbk1heGltaXNlOiBcIm1hYzpXaW5kb3dVbk1heGltaXNlXCIsXG5cdFx0V2luZG93TWluaW1pc2U6IFwibWFjOldpbmRvd01pbmltaXNlXCIsXG5cdFx0V2luZG93VW5NaW5pbWlzZTogXCJtYWM6V2luZG93VW5NaW5pbWlzZVwiLFxuXHRcdFdpbmRvd1Nob3VsZENsb3NlOiBcIm1hYzpXaW5kb3dTaG91bGRDbG9zZVwiLFxuXHRcdFdpbmRvd1Nob3c6IFwibWFjOldpbmRvd1Nob3dcIixcblx0XHRXaW5kb3dXaWxsQmVjb21lS2V5OiBcIm1hYzpXaW5kb3dXaWxsQmVjb21lS2V5XCIsXG5cdFx0V2luZG93V2lsbEJlY29tZU1haW46IFwibWFjOldpbmRvd1dpbGxCZWNvbWVNYWluXCIsXG5cdFx0V2luZG93V2lsbEJlZ2luU2hlZXQ6IFwibWFjOldpbmRvd1dpbGxCZWdpblNoZWV0XCIsXG5cdFx0V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZVwiLFxuXHRcdFdpbmRvd1dpbGxDbG9zZTogXCJtYWM6V2luZG93V2lsbENsb3NlXCIsXG5cdFx0V2luZG93V2lsbERlbWluaWF0dXJpemU6IFwibWFjOldpbmRvd1dpbGxEZW1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93V2lsbEVudGVyRnVsbFNjcmVlbjogXCJtYWM6V2luZG93V2lsbEVudGVyRnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxFbnRlclZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dXaWxsRW50ZXJWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd1dpbGxFeGl0RnVsbFNjcmVlbjogXCJtYWM6V2luZG93V2lsbEV4aXRGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd1dpbGxGb2N1czogXCJtYWM6V2luZG93V2lsbEZvY3VzXCIsXG5cdFx0V2luZG93V2lsbE1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dXaWxsTWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dXaWxsTW92ZTogXCJtYWM6V2luZG93V2lsbE1vdmVcIixcblx0XHRXaW5kb3dXaWxsT3JkZXJPZmZTY3JlZW46IFwibWFjOldpbmRvd1dpbGxPcmRlck9mZlNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxPcmRlck9uU2NyZWVuOiBcIm1hYzpXaW5kb3dXaWxsT3JkZXJPblNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dXaWxsUmVzaWduTWFpblwiLFxuXHRcdFdpbmRvd1dpbGxSZXNpemU6IFwibWFjOldpbmRvd1dpbGxSZXNpemVcIixcblx0XHRXaW5kb3dXaWxsVW5mb2N1czogXCJtYWM6V2luZG93V2lsbFVuZm9jdXNcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZUFscGhhOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQWxwaGFcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXNcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlU2hhZG93OiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlU2hhZG93XCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZVRpdGxlOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlVGl0bGVcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlVG9vbGJhcjogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVRvb2xiYXJcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlVmlzaWJpbGl0eTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVZpc2liaWxpdHlcIixcblx0XHRXaW5kb3dXaWxsVXNlU3RhbmRhcmRGcmFtZTogXCJtYWM6V2luZG93V2lsbFVzZVN0YW5kYXJkRnJhbWVcIixcblx0XHRXaW5kb3dab29tSW46IFwibWFjOldpbmRvd1pvb21JblwiLFxuXHRcdFdpbmRvd1pvb21PdXQ6IFwibWFjOldpbmRvd1pvb21PdXRcIixcblx0XHRXaW5kb3dab29tUmVzZXQ6IFwibWFjOldpbmRvd1pvb21SZXNldFwiLFxuXHRcdFdlYlZpZXdXZWJDb250ZW50UHJvY2Vzc0RpZFRlcm1pbmF0ZTogXCJtYWM6V2ViVmlld1dlYkNvbnRlbnRQcm9jZXNzRGlkVGVybWluYXRlXCIsXG5cdH0pLFxuXHRMaW51eDogT2JqZWN0LmZyZWV6ZSh7XG5cdFx0QXBwbGljYXRpb25TdGFydHVwOiBcImxpbnV4OkFwcGxpY2F0aW9uU3RhcnR1cFwiLFxuXHRcdFN5c3RlbURpZFdha2U6IFwibGludXg6U3lzdGVtRGlkV2FrZVwiLFxuXHRcdFN5c3RlbVRoZW1lQ2hhbmdlZDogXCJsaW51eDpTeXN0ZW1UaGVtZUNoYW5nZWRcIixcblx0XHRTeXN0ZW1XaWxsU2xlZXA6IFwibGludXg6U3lzdGVtV2lsbFNsZWVwXCIsXG5cdFx0V2luZG93RGVsZXRlRXZlbnQ6IFwibGludXg6V2luZG93RGVsZXRlRXZlbnRcIixcblx0XHRXaW5kb3dEaWRNb3ZlOiBcImxpbnV4OldpbmRvd0RpZE1vdmVcIixcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwibGludXg6V2luZG93RGlkUmVzaXplXCIsXG5cdFx0V2luZG93Rm9jdXNJbjogXCJsaW51eDpXaW5kb3dGb2N1c0luXCIsXG5cdFx0V2luZG93Rm9jdXNPdXQ6IFwibGludXg6V2luZG93Rm9jdXNPdXRcIixcblx0XHRXaW5kb3dMb2FkU3RhcnRlZDogXCJsaW51eDpXaW5kb3dMb2FkU3RhcnRlZFwiLFxuXHRcdFdpbmRvd0xvYWRSZWRpcmVjdGVkOiBcImxpbnV4OldpbmRvd0xvYWRSZWRpcmVjdGVkXCIsXG5cdFx0V2luZG93TG9hZENvbW1pdHRlZDogXCJsaW51eDpXaW5kb3dMb2FkQ29tbWl0dGVkXCIsXG5cdFx0V2luZG93TG9hZEZpbmlzaGVkOiBcImxpbnV4OldpbmRvd0xvYWRGaW5pc2hlZFwiLFxuXHR9KSxcblx0aU9TOiBPYmplY3QuZnJlZXplKHtcblx0XHRBcHBsaWNhdGlvbkRpZEJlY29tZUFjdGl2ZTogXCJpb3M6QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbkRpZEVudGVyQmFja2dyb3VuZDogXCJpb3M6QXBwbGljYXRpb25EaWRFbnRlckJhY2tncm91bmRcIixcblx0XHRBcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZzogXCJpb3M6QXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmdcIixcblx0XHRBcHBsaWNhdGlvbkRpZFJlY2VpdmVNZW1vcnlXYXJuaW5nOiBcImlvczpBcHBsaWNhdGlvbkRpZFJlY2VpdmVNZW1vcnlXYXJuaW5nXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsRW50ZXJGb3JlZ3JvdW5kOiBcImlvczpBcHBsaWNhdGlvbldpbGxFbnRlckZvcmVncm91bmRcIixcblx0XHRBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmU6IFwiaW9zOkFwcGxpY2F0aW9uV2lsbFJlc2lnbkFjdGl2ZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFRlcm1pbmF0ZTogXCJpb3M6QXBwbGljYXRpb25XaWxsVGVybWluYXRlXCIsXG5cdFx0V2luZG93RGlkTG9hZDogXCJpb3M6V2luZG93RGlkTG9hZFwiLFxuXHRcdFdpbmRvd1dpbGxBcHBlYXI6IFwiaW9zOldpbmRvd1dpbGxBcHBlYXJcIixcblx0XHRXaW5kb3dEaWRBcHBlYXI6IFwiaW9zOldpbmRvd0RpZEFwcGVhclwiLFxuXHRcdFdpbmRvd1dpbGxEaXNhcHBlYXI6IFwiaW9zOldpbmRvd1dpbGxEaXNhcHBlYXJcIixcblx0XHRXaW5kb3dEaWREaXNhcHBlYXI6IFwiaW9zOldpbmRvd0RpZERpc2FwcGVhclwiLFxuXHRcdFdpbmRvd1NhZmVBcmVhSW5zZXRzQ2hhbmdlZDogXCJpb3M6V2luZG93U2FmZUFyZWFJbnNldHNDaGFuZ2VkXCIsXG5cdFx0V2luZG93T3JpZW50YXRpb25DaGFuZ2VkOiBcImlvczpXaW5kb3dPcmllbnRhdGlvbkNoYW5nZWRcIixcblx0XHRXaW5kb3dUb3VjaEJlZ2FuOiBcImlvczpXaW5kb3dUb3VjaEJlZ2FuXCIsXG5cdFx0V2luZG93VG91Y2hNb3ZlZDogXCJpb3M6V2luZG93VG91Y2hNb3ZlZFwiLFxuXHRcdFdpbmRvd1RvdWNoRW5kZWQ6IFwiaW9zOldpbmRvd1RvdWNoRW5kZWRcIixcblx0XHRXaW5kb3dUb3VjaENhbmNlbGxlZDogXCJpb3M6V2luZG93VG91Y2hDYW5jZWxsZWRcIixcblx0XHRXZWJWaWV3RGlkU3RhcnROYXZpZ2F0aW9uOiBcImlvczpXZWJWaWV3RGlkU3RhcnROYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZEZpbmlzaE5hdmlnYXRpb246IFwiaW9zOldlYlZpZXdEaWRGaW5pc2hOYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZEZhaWxOYXZpZ2F0aW9uOiBcImlvczpXZWJWaWV3RGlkRmFpbE5hdmlnYXRpb25cIixcblx0XHRXZWJWaWV3RGVjaWRlUG9saWN5Rm9yTmF2aWdhdGlvbkFjdGlvbjogXCJpb3M6V2ViVmlld0RlY2lkZVBvbGljeUZvck5hdmlnYXRpb25BY3Rpb25cIixcblx0XHRCYXR0ZXJ5Q2hhbmdlZDogXCJpb3M6QmF0dGVyeUNoYW5nZWRcIixcblx0XHROZXR3b3JrQ2hhbmdlZDogXCJpb3M6TmV0d29ya0NoYW5nZWRcIixcblx0XHRUaGVtZUNoYW5nZWQ6IFwiaW9zOlRoZW1lQ2hhbmdlZFwiLFxuXHRcdFNjcmVlbkxvY2tlZDogXCJpb3M6U2NyZWVuTG9ja2VkXCIsXG5cdFx0U2NyZWVuVW5sb2NrZWQ6IFwiaW9zOlNjcmVlblVubG9ja2VkXCIsXG5cdH0pLFxuXHRBbmRyb2lkOiBPYmplY3QuZnJlZXplKHtcblx0XHRBY3Rpdml0eUNyZWF0ZWQ6IFwiYW5kcm9pZDpBY3Rpdml0eUNyZWF0ZWRcIixcblx0XHRBY3Rpdml0eVN0YXJ0ZWQ6IFwiYW5kcm9pZDpBY3Rpdml0eVN0YXJ0ZWRcIixcblx0XHRBY3Rpdml0eVJlc3VtZWQ6IFwiYW5kcm9pZDpBY3Rpdml0eVJlc3VtZWRcIixcblx0XHRBY3Rpdml0eVBhdXNlZDogXCJhbmRyb2lkOkFjdGl2aXR5UGF1c2VkXCIsXG5cdFx0QWN0aXZpdHlTdG9wcGVkOiBcImFuZHJvaWQ6QWN0aXZpdHlTdG9wcGVkXCIsXG5cdFx0QWN0aXZpdHlEZXN0cm95ZWQ6IFwiYW5kcm9pZDpBY3Rpdml0eURlc3Ryb3llZFwiLFxuXHRcdEFwcGxpY2F0aW9uTG93TWVtb3J5OiBcImFuZHJvaWQ6QXBwbGljYXRpb25Mb3dNZW1vcnlcIixcblx0XHRXZWJWaWV3UGFnZVN0YXJ0ZWQ6IFwiYW5kcm9pZDpXZWJWaWV3UGFnZVN0YXJ0ZWRcIixcblx0XHRXZWJWaWV3UGFnZUZpbmlzaGVkOiBcImFuZHJvaWQ6V2ViVmlld1BhZ2VGaW5pc2hlZFwiLFxuXHRcdEJhdHRlcnlDaGFuZ2VkOiBcImFuZHJvaWQ6QmF0dGVyeUNoYW5nZWRcIixcblx0XHROZXR3b3JrQ2hhbmdlZDogXCJhbmRyb2lkOk5ldHdvcmtDaGFuZ2VkXCIsXG5cdFx0VGhlbWVDaGFuZ2VkOiBcImFuZHJvaWQ6VGhlbWVDaGFuZ2VkXCIsXG5cdFx0U2NyZWVuTG9ja2VkOiBcImFuZHJvaWQ6U2NyZWVuTG9ja2VkXCIsXG5cdFx0U2NyZWVuVW5sb2NrZWQ6IFwiYW5kcm9pZDpTY3JlZW5VbmxvY2tlZFwiLFxuXHR9KSxcblx0Q29tbW9uOiBPYmplY3QuZnJlZXplKHtcblx0XHRBcHBsaWNhdGlvbk9wZW5lZFdpdGhGaWxlOiBcImNvbW1vbjpBcHBsaWNhdGlvbk9wZW5lZFdpdGhGaWxlXCIsXG5cdFx0QXBwbGljYXRpb25TdGFydGVkOiBcImNvbW1vbjpBcHBsaWNhdGlvblN0YXJ0ZWRcIixcblx0XHRBcHBsaWNhdGlvbkxhdW5jaGVkV2l0aFVybDogXCJjb21tb246QXBwbGljYXRpb25MYXVuY2hlZFdpdGhVcmxcIixcblx0XHRUaGVtZUNoYW5nZWQ6IFwiY29tbW9uOlRoZW1lQ2hhbmdlZFwiLFxuXHRcdFN5c3RlbURpZFdha2U6IFwiY29tbW9uOlN5c3RlbURpZFdha2VcIixcblx0XHRTeXN0ZW1XaWxsU2xlZXA6IFwiY29tbW9uOlN5c3RlbVdpbGxTbGVlcFwiLFxuXHRcdFdpbmRvd0Nsb3Npbmc6IFwiY29tbW9uOldpbmRvd0Nsb3NpbmdcIixcblx0XHRXaW5kb3dEaWRNb3ZlOiBcImNvbW1vbjpXaW5kb3dEaWRNb3ZlXCIsXG5cdFx0V2luZG93RGlkUmVzaXplOiBcImNvbW1vbjpXaW5kb3dEaWRSZXNpemVcIixcblx0XHRXaW5kb3dEUElDaGFuZ2VkOiBcImNvbW1vbjpXaW5kb3dEUElDaGFuZ2VkXCIsXG5cdFx0V2luZG93RmlsZXNEcm9wcGVkOiBcImNvbW1vbjpXaW5kb3dGaWxlc0Ryb3BwZWRcIixcblx0XHRXaW5kb3dGb2N1czogXCJjb21tb246V2luZG93Rm9jdXNcIixcblx0XHRXaW5kb3dGdWxsc2NyZWVuOiBcImNvbW1vbjpXaW5kb3dGdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93SGlkZTogXCJjb21tb246V2luZG93SGlkZVwiLFxuXHRcdFdpbmRvd0xvc3RGb2N1czogXCJjb21tb246V2luZG93TG9zdEZvY3VzXCIsXG5cdFx0V2luZG93TWF4aW1pc2U6IFwiY29tbW9uOldpbmRvd01heGltaXNlXCIsXG5cdFx0V2luZG93TWluaW1pc2U6IFwiY29tbW9uOldpbmRvd01pbmltaXNlXCIsXG5cdFx0V2luZG93VG9nZ2xlRnJhbWVsZXNzOiBcImNvbW1vbjpXaW5kb3dUb2dnbGVGcmFtZWxlc3NcIixcblx0XHRXaW5kb3dSZXN0b3JlOiBcImNvbW1vbjpXaW5kb3dSZXN0b3JlXCIsXG5cdFx0V2luZG93UnVudGltZVJlYWR5OiBcImNvbW1vbjpXaW5kb3dSdW50aW1lUmVhZHlcIixcblx0XHRXaW5kb3dTaG93OiBcImNvbW1vbjpXaW5kb3dTaG93XCIsXG5cdFx0V2luZG93VW5GdWxsc2NyZWVuOiBcImNvbW1vbjpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcblx0XHRXaW5kb3dVbk1heGltaXNlOiBcImNvbW1vbjpXaW5kb3dVbk1heGltaXNlXCIsXG5cdFx0V2luZG93VW5NaW5pbWlzZTogXCJjb21tb246V2luZG93VW5NaW5pbWlzZVwiLFxuXHRcdFdpbmRvd1pvb206IFwiY29tbW9uOldpbmRvd1pvb21cIixcblx0XHRXaW5kb3dab29tSW46IFwiY29tbW9uOldpbmRvd1pvb21JblwiLFxuXHRcdFdpbmRvd1pvb21PdXQ6IFwiY29tbW9uOldpbmRvd1pvb21PdXRcIixcblx0XHRXaW5kb3dab29tUmVzZXQ6IFwiY29tbW9uOldpbmRvd1pvb21SZXNldFwiLFxuXHRcdEJhdHRlcnlDaGFuZ2VkOiBcImNvbW1vbjpCYXR0ZXJ5Q2hhbmdlZFwiLFxuXHRcdE5ldHdvcmtDaGFuZ2VkOiBcImNvbW1vbjpOZXR3b3JrQ2hhbmdlZFwiLFxuXHRcdFNjcmVlbkxvY2tlZDogXCJjb21tb246U2NyZWVuTG9ja2VkXCIsXG5cdFx0U2NyZWVuVW5sb2NrZWQ6IFwiY29tbW9uOlNjcmVlblVubG9ja2VkXCIsXG5cdFx0TG93TWVtb3J5OiBcImNvbW1vbjpMb3dNZW1vcnlcIixcblx0fSksXG59KTtcbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7IGV2ZW50TGlzdGVuZXJzLCBMaXN0ZW5lciwgbGlzdGVuZXJPZmYgfSBmcm9tIFwiLi9saXN0ZW5lci5qc1wiO1xuaW1wb3J0IHsgRXZlbnRzIGFzIENyZWF0ZSB9IGZyb20gXCIuL2NyZWF0ZS5qc1wiO1xuaW1wb3J0IHsgVHlwZXMgfSBmcm9tIFwiLi9ldmVudF90eXBlcy5qc1wiO1xuXG4vLyBTZXR1cFxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcblxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xuICAgIHdpbmRvdy5fd2FpbHMuZGlzcGF0Y2hXYWlsc0V2ZW50ID0gZGlzcGF0Y2hXYWlsc0V2ZW50O1xufVxuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5FdmVudHMpO1xuY29uc3QgRW1pdE1ldGhvZCA9IDA7XG5cbmV4cG9ydCAqIGZyb20gXCIuL2V2ZW50X3R5cGVzLmpzXCI7XG5cbi8qKlxuICogQSB0YWJsZSBvZiBkYXRhIHR5cGVzIGZvciBhbGwga25vd24gZXZlbnRzLlxuICogV2lsbCBiZSBtb25rZXktcGF0Y2hlZCBieSB0aGUgYmluZGluZyBnZW5lcmF0b3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3VzdG9tRXZlbnRzIHt9XG5cbi8qKlxuICogRWl0aGVyIGEga25vd24gZXZlbnQgbmFtZSBvciBhbiBhcmJpdHJhcnkgc3RyaW5nLlxuICovXG5leHBvcnQgdHlwZSBXYWlsc0V2ZW50TmFtZTxFIGV4dGVuZHMga2V5b2YgQ3VzdG9tRXZlbnRzID0ga2V5b2YgQ3VzdG9tRXZlbnRzPiA9IEUgfCAoc3RyaW5nICYge30pO1xuXG4vKipcbiAqIFVuaW9uIG9mIGFsbCBrbm93biBzeXN0ZW0gZXZlbnQgbmFtZXMuXG4gKi9cbnR5cGUgU3lzdGVtRXZlbnROYW1lID0ge1xuICAgIFtLIGluIGtleW9mICh0eXBlb2YgVHlwZXMpXTogKHR5cGVvZiBUeXBlcylbS11ba2V5b2YgKCh0eXBlb2YgVHlwZXMpW0tdKV1cbn0gZXh0ZW5kcyAoaW5mZXIgTSkgPyBNW2tleW9mIE1dIDogbmV2ZXI7XG5cbi8qKlxuICogVGhlIGRhdGEgdHlwZSBhc3NvY2lhdGVkIHRvIGEgZ2l2ZW4gZXZlbnQuXG4gKi9cbmV4cG9ydCB0eXBlIFdhaWxzRXZlbnREYXRhPEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPiA9XG4gICAgRSBleHRlbmRzIGtleW9mIEN1c3RvbUV2ZW50cyA/IEN1c3RvbUV2ZW50c1tFXSA6IChFIGV4dGVuZHMgU3lzdGVtRXZlbnROYW1lID8gdm9pZCA6IGFueSk7XG5cbi8qKlxuICogVGhlIHR5cGUgb2YgaGFuZGxlcnMgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKi9cbmV4cG9ydCB0eXBlIFdhaWxzRXZlbnRDYWxsYmFjazxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4gPSAoZXY6IFdhaWxzRXZlbnQ8RT4pID0+IHZvaWQ7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHN5c3RlbSBldmVudCBvciBhIGN1c3RvbSBldmVudCBlbWl0dGVkIHRocm91Z2ggd2FpbHMtcHJvdmlkZWQgZmFjaWxpdGllcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFdhaWxzRXZlbnQ8RSBleHRlbmRzIFdhaWxzRXZlbnROYW1lID0gV2FpbHNFdmVudE5hbWU+IHtcbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gICAgICovXG4gICAgbmFtZTogRTtcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsIGRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoZSBlbWl0dGVkIGV2ZW50LlxuICAgICAqL1xuICAgIGRhdGE6IFdhaWxzRXZlbnREYXRhPEU+O1xuXG4gICAgLyoqXG4gICAgICogTmFtZSBvZiB0aGUgb3JpZ2luYXRpbmcgd2luZG93LiBPbWl0dGVkIGZvciBhcHBsaWNhdGlvbiBldmVudHMuXG4gICAgICogV2lsbCBiZSBvdmVycmlkZGVuIGlmIHNldCBtYW51YWxseS5cbiAgICAgKi9cbiAgICBzZW5kZXI/OiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBFLCBkYXRhOiBXYWlsc0V2ZW50RGF0YTxFPik7XG4gICAgY29uc3RydWN0b3IobmFtZTogV2FpbHNFdmVudERhdGE8RT4gZXh0ZW5kcyBudWxsIHwgdm9pZCA/IEUgOiBuZXZlcilcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBFLCBkYXRhPzogYW55KSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGEgPz8gbnVsbDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoV2FpbHNFdmVudChldmVudDogYW55KSB7XG4gICAgbGV0IGxpc3RlbmVycyA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudC5uYW1lKTtcbiAgICBpZiAoIWxpc3RlbmVycykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHdhaWxzRXZlbnQgPSBuZXcgV2FpbHNFdmVudChcbiAgICAgICAgZXZlbnQubmFtZSxcbiAgICAgICAgKGV2ZW50Lm5hbWUgaW4gQ3JlYXRlKSA/IENyZWF0ZVtldmVudC5uYW1lXShldmVudC5kYXRhKSA6IGV2ZW50LmRhdGFcbiAgICApO1xuICAgIGlmICgnc2VuZGVyJyBpbiBldmVudCkge1xuICAgICAgICB3YWlsc0V2ZW50LnNlbmRlciA9IGV2ZW50LnNlbmRlcjtcbiAgICB9XG5cbiAgICAvLyBEaXNwYXRjaCB0byBhIHNuYXBzaG90LCB0aGVuIHJlbW92ZSBhbGwgZXhwaXJlZCBsaXN0ZW5lcnMgaW4gYSBzaW5nbGVcbiAgICAvLyBwb3N0LWRpc3BhdGNoIGZpbHRlciBvZiB0aGUgbGl2ZSBtYXAuXG4gICAgLy8gLSBXcml0aW5nIHRoZSBzbmFwc2hvdCBiYWNrIHdob2xlc2FsZSB3b3VsZCB1bmRvIHN1YnNjcmlwdGlvbiBjaGFuZ2VzXG4gICAgLy8gICBtYWRlIGluc2lkZSBhIGhhbmRsZXIgKCM0MzkzKS5cbiAgICAvLyAtIENhbGxpbmcgbGlzdGVuZXJPZmYoKSBwZXIgZXhwaXJlZCBsaXN0ZW5lciBpbnNpZGUgdGhlIGxvb3AgaXMgTyhuwrIpXG4gICAgLy8gICB3aGVuIG1hbnkgbGlzdGVuZXJzIGV4cGlyZSBvbiB0aGUgc2FtZSBldmVudC5cbiAgICAvLyBGaWx0ZXJpbmcgdGhlIGxpdmUgYXJyYXkgb25jZSBhZnRlciBkaXNwYXRjaCBpcyBPKG4pIGFuZCBzdGlsbCBob25vdXJzXG4gICAgLy8gYW55IGxpc3RlbmVycyBhZGRlZCBvciByZW1vdmVkIGJ5IGhhbmRsZXJzIGR1cmluZyBkaXNwYXRjaC5cbiAgICBjb25zdCBleHBpcmVkID0gbmV3IFNldDxMaXN0ZW5lcj4oKTtcbiAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIGxpc3RlbmVycy5zbGljZSgpKSB7XG4gICAgICAgIGlmIChsaXN0ZW5lci5kaXNwYXRjaCh3YWlsc0V2ZW50KSkge1xuICAgICAgICAgICAgZXhwaXJlZC5hZGQobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChleHBpcmVkLnNpemUgPiAwKSB7XG4gICAgICAgIGNvbnN0IGxpdmUgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnQubmFtZSk7XG4gICAgICAgIGlmIChsaXZlKSB7XG4gICAgICAgICAgICBjb25zdCByZW1haW5pbmcgPSBsaXZlLmZpbHRlcihsID0+ICFleHBpcmVkLmhhcyhsKSk7XG4gICAgICAgICAgICBpZiAocmVtYWluaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJzLmRlbGV0ZShldmVudC5uYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcnMuc2V0KGV2ZW50Lm5hbWUsIHJlbWFpbmluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZm9yIGEgc3BlY2lmaWMgZXZlbnQuXG4gKlxuICogQHBhcmFtIGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byByZWdpc3RlciB0aGUgY2FsbGJhY2sgZm9yLlxuICogQHBhcmFtIGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuXG4gKiBAcGFyYW0gbWF4Q2FsbGJhY2tzIC0gVGhlIG1heGltdW0gbnVtYmVyIG9mIHRpbWVzIHRoZSBjYWxsYmFjayBjYW4gYmUgY2FsbGVkIGZvciB0aGUgZXZlbnQuIE9uY2UgdGhlIG1heGltdW0gbnVtYmVyIGlzIHJlYWNoZWQsIHRoZSBjYWxsYmFjayB3aWxsIG5vIGxvbmdlciBiZSBjYWxsZWQuXG4gKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gT25NdWx0aXBsZTxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4oZXZlbnROYW1lOiBFLCBjYWxsYmFjazogV2FpbHNFdmVudENhbGxiYWNrPEU+LCBtYXhDYWxsYmFja3M6IG51bWJlcikge1xuICAgIGxldCBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnROYW1lKSB8fCBbXTtcbiAgICBjb25zdCB0aGlzTGlzdGVuZXIgPSBuZXcgTGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaywgbWF4Q2FsbGJhY2tzKTtcbiAgICBsaXN0ZW5lcnMucHVzaCh0aGlzTGlzdGVuZXIpO1xuICAgIGV2ZW50TGlzdGVuZXJzLnNldChldmVudE5hbWUsIGxpc3RlbmVycyk7XG4gICAgcmV0dXJuICgpID0+IGxpc3RlbmVyT2ZmKHRoaXNMaXN0ZW5lcik7XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgc3BlY2lmaWVkIGV2ZW50IG9jY3Vycy5cbiAqXG4gKiBAcGFyYW0gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmb3IuXG4gKiBAcGFyYW0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5cbiAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIHdpbGwgdW5yZWdpc3RlciB0aGUgY2FsbGJhY2sgZnJvbSB0aGUgZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPbjxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4oZXZlbnROYW1lOiBFLCBjYWxsYmFjazogV2FpbHNFdmVudENhbGxiYWNrPEU+KTogKCkgPT4gdm9pZCB7XG4gICAgcmV0dXJuIE9uTXVsdGlwbGUoZXZlbnROYW1lLCBjYWxsYmFjaywgLTEpO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIG9ubHkgb25jZSBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmb3IuXG4gKiBAcGFyYW0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5cbiAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIHdpbGwgdW5yZWdpc3RlciB0aGUgY2FsbGJhY2sgZnJvbSB0aGUgZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPbmNlPEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPihldmVudE5hbWU6IEUsIGNhbGxiYWNrOiBXYWlsc0V2ZW50Q2FsbGJhY2s8RT4pOiAoKSA9PiB2b2lkIHtcbiAgICByZXR1cm4gT25NdWx0aXBsZShldmVudE5hbWUsIGNhbGxiYWNrLCAxKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBuYW1lcy5cbiAqXG4gKiBAcGFyYW0gZXZlbnROYW1lcyAtIFRoZSBuYW1lIG9mIHRoZSBldmVudHMgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPZmYoLi4uZXZlbnROYW1lczogW1dhaWxzRXZlbnROYW1lLCAuLi5XYWlsc0V2ZW50TmFtZVtdXSk6IHZvaWQge1xuICAgIGV2ZW50TmFtZXMuZm9yRWFjaChldmVudE5hbWUgPT4gZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGV2ZW50TmFtZSkpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9mZkFsbCgpOiB2b2lkIHtcbiAgICBldmVudExpc3RlbmVycy5jbGVhcigpO1xufVxuXG4vKipcbiAqIEVtaXRzIGFuIGV2ZW50LlxuICpcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgZnVsZmlsbGVkIG9uY2UgdGhlIGV2ZW50IGhhcyBiZWVuIGVtaXR0ZWQuICBSZXNvbHZlcyB0byB0cnVlIGlmIHRoZSBldmVudCB3YXMgY2FuY2VsbGVkLlxuICogQHBhcmFtIG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gZW1pdFxuICogQHBhcmFtIGRhdGEgLSBUaGUgZGF0YSB0aGF0IHdpbGwgYmUgc2VudCB3aXRoIHRoZSBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gRW1pdDxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4obmFtZTogRSwgZGF0YTogV2FpbHNFdmVudERhdGE8RT4pOiBQcm9taXNlPGJvb2xlYW4+XG5leHBvcnQgZnVuY3Rpb24gRW1pdDxFIGV4dGVuZHMgV2FpbHNFdmVudE5hbWUgPSBXYWlsc0V2ZW50TmFtZT4obmFtZTogV2FpbHNFdmVudERhdGE8RT4gZXh0ZW5kcyBudWxsIHwgdm9pZCA/IEUgOiBuZXZlcik6IFByb21pc2U8Ym9vbGVhbj5cbmV4cG9ydCBmdW5jdGlvbiBFbWl0PEUgZXh0ZW5kcyBXYWlsc0V2ZW50TmFtZSA9IFdhaWxzRXZlbnROYW1lPihuYW1lOiBXYWlsc0V2ZW50RGF0YTxFPiwgZGF0YT86IGFueSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBjYWxsKEVtaXRNZXRob2QsICBuZXcgV2FpbHNFdmVudChuYW1lLCBkYXRhKSlcbn1cblxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmV4cG9ydCBpbnRlcmZhY2UgU2l6ZSB7XG4gICAgLyoqIFRoZSB3aWR0aCBvZiBhIHJlY3Rhbmd1bGFyIGFyZWEuICovXG4gICAgV2lkdGg6IG51bWJlcjtcbiAgICAvKiogVGhlIGhlaWdodCBvZiBhIHJlY3Rhbmd1bGFyIGFyZWEuICovXG4gICAgSGVpZ2h0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjdCB7XG4gICAgLyoqIFRoZSBYIGNvb3JkaW5hdGUgb2YgdGhlIG9yaWdpbi4gKi9cbiAgICBYOiBudW1iZXI7XG4gICAgLyoqIFRoZSBZIGNvb3JkaW5hdGUgb2YgdGhlIG9yaWdpbi4gKi9cbiAgICBZOiBudW1iZXI7XG4gICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgcmVjdGFuZ2xlLiAqL1xuICAgIFdpZHRoOiBudW1iZXI7XG4gICAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIHJlY3RhbmdsZS4gKi9cbiAgICBIZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTY3JlZW4ge1xuICAgIC8qKiBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIHNjcmVlbi4gKi9cbiAgICBJRDogc3RyaW5nO1xuICAgIC8qKiBIdW1hbi1yZWFkYWJsZSBuYW1lIG9mIHRoZSBzY3JlZW4uICovXG4gICAgTmFtZTogc3RyaW5nO1xuICAgIC8qKiBUaGUgc2NhbGUgZmFjdG9yIG9mIHRoZSBzY3JlZW4gKERQSS85NikuIDEgPSBzdGFuZGFyZCBEUEksIDIgPSBIaURQSSAoUmV0aW5hKSwgZXRjLiAqL1xuICAgIFNjYWxlRmFjdG9yOiBudW1iZXI7XG4gICAgLyoqIFRoZSBYIGNvb3JkaW5hdGUgb2YgdGhlIHNjcmVlbi4gKi9cbiAgICBYOiBudW1iZXI7XG4gICAgLyoqIFRoZSBZIGNvb3JkaW5hdGUgb2YgdGhlIHNjcmVlbi4gKi9cbiAgICBZOiBudW1iZXI7XG4gICAgLyoqIENvbnRhaW5zIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBzY3JlZW4uICovXG4gICAgU2l6ZTogU2l6ZTtcbiAgICAvKiogQ29udGFpbnMgdGhlIGJvdW5kcyBvZiB0aGUgc2NyZWVuIGluIHRlcm1zIG9mIFgsIFksIFdpZHRoLCBhbmQgSGVpZ2h0LiAqL1xuICAgIEJvdW5kczogUmVjdDtcbiAgICAvKiogQ29udGFpbnMgdGhlIHBoeXNpY2FsIGJvdW5kcyBvZiB0aGUgc2NyZWVuIGluIHRlcm1zIG9mIFgsIFksIFdpZHRoLCBhbmQgSGVpZ2h0IChiZWZvcmUgc2NhbGluZykuICovXG4gICAgUGh5c2ljYWxCb3VuZHM6IFJlY3Q7XG4gICAgLyoqIENvbnRhaW5zIHRoZSBhcmVhIG9mIHRoZSBzY3JlZW4gdGhhdCBpcyBhY3R1YWxseSB1c2FibGUgKGV4Y2x1ZGluZyB0YXNrYmFyIGFuZCBvdGhlciBzeXN0ZW0gVUkpLiAqL1xuICAgIFdvcmtBcmVhOiBSZWN0O1xuICAgIC8qKiBDb250YWlucyB0aGUgcGh5c2ljYWwgV29ya0FyZWEgb2YgdGhlIHNjcmVlbiAoYmVmb3JlIHNjYWxpbmcpLiAqL1xuICAgIFBoeXNpY2FsV29ya0FyZWE6IFJlY3Q7XG4gICAgLyoqIFRydWUgaWYgdGhpcyBpcyB0aGUgcHJpbWFyeSBtb25pdG9yIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIGluIHRoZSBvcGVyYXRpbmcgc3lzdGVtLiAqL1xuICAgIElzUHJpbWFyeTogYm9vbGVhbjtcbiAgICAvKiogVGhlIHJvdGF0aW9uIG9mIHRoZSBzY3JlZW4uICovXG4gICAgUm90YXRpb246IG51bWJlcjtcbn1cblxuaW1wb3J0IHsgbmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXMgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5TY3JlZW5zKTtcblxuY29uc3QgZ2V0QWxsID0gMDtcbmNvbnN0IGdldFByaW1hcnkgPSAxO1xuY29uc3QgZ2V0Q3VycmVudCA9IDI7XG5jb25zdCBnZXRCeUlEID0gMztcbmNvbnN0IGdldEJ5SW5kZXggPSA0O1xuXG4vKipcbiAqIEdldHMgYWxsIHNjcmVlbnMuXG4gKlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gYXJyYXkgb2YgU2NyZWVuIG9iamVjdHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRBbGwoKTogUHJvbWlzZTxTY3JlZW5bXT4ge1xuICAgIHJldHVybiBjYWxsKGdldEFsbCk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcHJpbWFyeSBzY3JlZW4uXG4gKlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHByaW1hcnkgc2NyZWVuLlxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0UHJpbWFyeSgpOiBQcm9taXNlPFNjcmVlbj4ge1xuICAgIHJldHVybiBjYWxsKGdldFByaW1hcnkpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGN1cnJlbnQgYWN0aXZlIHNjcmVlbi5cbiAqXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBjdXJyZW50IGFjdGl2ZSBzY3JlZW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRDdXJyZW50KCk6IFByb21pc2U8U2NyZWVuPiB7XG4gICAgcmV0dXJuIGNhbGwoZ2V0Q3VycmVudCk7XG59XG5cbi8qKlxuICogR2V0cyBhIHNjcmVlbiBieSBpdHMgdW5pcXVlIGRpc3BsYXkgSUQuXG4gKlxuICogQHBhcmFtIGlkIC0gVGhlIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBzY3JlZW4uXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgbWF0Y2hpbmcgU2NyZWVuLlxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0QnlJRChpZDogc3RyaW5nKTogUHJvbWlzZTxTY3JlZW4+IHtcbiAgICByZXR1cm4gY2FsbChnZXRCeUlELCB7IGlkIH0pO1xufVxuXG4vKipcbiAqIEdldHMgYSBzY3JlZW4gYnkgaXRzIGluZGV4IGluIHRoZSBzY3JlZW4gbGlzdC5cbiAqXG4gKiBAcGFyYW0gaW5kZXggLSBUaGUgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgc2NyZWVuLlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIG1hdGNoaW5nIFNjcmVlbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEJ5SW5kZXgoaW5kZXg6IG51bWJlcik6IFByb21pc2U8U2NyZWVuPiB7XG4gICAgcmV0dXJuIGNhbGwoZ2V0QnlJbmRleCwgeyBpbmRleCB9KTtcbn1cbiIsIi8qXG4gXyAgICAgX18gICAgIF8gX19cbnwgfCAgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcblxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuSU9TKTtcblxuLy8gTWV0aG9kIElEc1xuY29uc3QgSGFwdGljc0ltcGFjdCA9IDA7XG5jb25zdCBEZXZpY2VJbmZvID0gMTtcblxuZXhwb3J0IG5hbWVzcGFjZSBIYXB0aWNzIHtcbiAgICBleHBvcnQgdHlwZSBJbXBhY3RTdHlsZSA9IFwibGlnaHRcInxcIm1lZGl1bVwifFwiaGVhdnlcInxcInNvZnRcInxcInJpZ2lkXCI7XG4gICAgZXhwb3J0IGZ1bmN0aW9uIEltcGFjdChzdHlsZTogSW1wYWN0U3R5bGUgPSBcIm1lZGl1bVwiKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBjYWxsKEhhcHRpY3NJbXBhY3QsIHsgc3R5bGUgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgbmFtZXNwYWNlIERldmljZSB7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJbmZvIHtcbiAgICAgICAgbW9kZWw6IHN0cmluZztcbiAgICAgICAgc3lzdGVtTmFtZTogc3RyaW5nO1xuICAgICAgICBzeXN0ZW1WZXJzaW9uOiBzdHJpbmc7XG4gICAgICAgIGlzU2ltdWxhdG9yOiBib29sZWFuO1xuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gSW5mbygpOiBQcm9taXNlPEluZm8+IHtcbiAgICAgICAgcmV0dXJuIGNhbGwoRGV2aWNlSW5mbyk7XG4gICAgfVxufVxuIiwiLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5BbmRyb2lkKTtcblxuLy8gTWV0aG9kIElEcyAobXVzdCBtYXRjaCBtZXNzYWdlcHJvY2Vzc29yX2FuZHJvaWQuZ28pXG5jb25zdCBIYXB0aWNzVmlicmF0ZSA9IDA7XG5jb25zdCBEZXZpY2VJbmZvID0gMTtcbmNvbnN0IFRvYXN0U2hvdyA9IDI7XG5cbmV4cG9ydCBuYW1lc3BhY2UgSGFwdGljcyB7XG4gICAgLyoqIFZpYnJhdGUgdGhlIGRldmljZSBmb3IgdGhlIGdpdmVuIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcy4gKi9cbiAgICBleHBvcnQgZnVuY3Rpb24gVmlicmF0ZShkdXJhdGlvbk1zOiBudW1iZXIgPSAxMDApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIGNhbGwoSGFwdGljc1ZpYnJhdGUsIHsgZHVyYXRpb246IGR1cmF0aW9uTXMgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgbmFtZXNwYWNlIERldmljZSB7XG4gICAgZXhwb3J0IGludGVyZmFjZSBJbmZvIHtcbiAgICAgICAgcGxhdGZvcm06IHN0cmluZztcbiAgICAgICAgbWFudWZhY3R1cmVyOiBzdHJpbmc7XG4gICAgICAgIGJyYW5kOiBzdHJpbmc7XG4gICAgICAgIG1vZGVsOiBzdHJpbmc7XG4gICAgICAgIGRldmljZTogc3RyaW5nO1xuICAgICAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgICAgIHNka0ludDogbnVtYmVyO1xuICAgIH1cbiAgICAvKiogUmV0dXJuIGluZm9ybWF0aW9uIGFib3V0IHRoZSBBbmRyb2lkIGRldmljZS4gKi9cbiAgICBleHBvcnQgZnVuY3Rpb24gSW5mbygpOiBQcm9taXNlPEluZm8+IHtcbiAgICAgICAgcmV0dXJuIGNhbGwoRGV2aWNlSW5mbyk7XG4gICAgfVxufVxuXG5leHBvcnQgbmFtZXNwYWNlIFRvYXN0IHtcbiAgICAvKiogU2hvdyBhIHNob3J0IEFuZHJvaWQgdG9hc3QgbWVzc2FnZS4gKi9cbiAgICBleHBvcnQgZnVuY3Rpb24gU2hvdyhtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIGNhbGwoVG9hc3RTaG93LCB7IG1lc3NhZ2UgfSk7XG4gICAgfVxufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qKlxuICogVXBkYXRlciBldmVudCBuYW1lIGNvbnN0YW50cy5cbiAqXG4gKiBVc2UgdGhlc2UgaW5zdGVhZCBvZiBoYXJkLWNvZGluZyBzdHJpbmcgbGl0ZXJhbHMgd2hlbiBzdWJzY3JpYmluZyB0b1xuICogdXBkYXRlciBldmVudHMgZnJvbSBKYXZhU2NyaXB0OlxuICpcbiAqICAgICBpbXBvcnQgeyBFdmVudHMsIFVwZGF0ZXIgfSBmcm9tIFwiQHdhaWxzaW8vcnVudGltZVwiO1xuICpcbiAqICAgICBFdmVudHMuT24oVXBkYXRlci5FdmVudHMuVXBkYXRlQXZhaWxhYmxlLCAoZSkgPT4ge1xuICogICAgICAgICBjb25zb2xlLmxvZyhcInVwZGF0ZSBmb3VuZDpcIiwgZS5kYXRhLnZlcnNpb24pO1xuICogICAgIH0pO1xuICpcbiAqICAgICBFdmVudHMuT24oVXBkYXRlci5FdmVudHMuRG93bmxvYWRQcm9ncmVzcywgKGUpID0+IHtcbiAqICAgICAgICAgY29uc3QgcCA9IGUuZGF0YTtcbiAqICAgICAgICAgY29uc29sZS5sb2coYCR7cC53cml0dGVufSAvICR7cC50b3RhbH0gYnl0ZXNgKTtcbiAqICAgICB9KTtcbiAqXG4gKiBNaXJyb3JzIHRoZSBHby1zaWRlIGNvbnN0YW50cyBpbiBgcGtnL3VwZGF0ZXIvZXZlbnRzLmdvYCBhbmQgdGhlXG4gKiB1c2VyLWFjdGlvbiBjb25zdGFudHMgaW4gYHBrZy91cGRhdGVyL3dpbmRvd19saWZlY3ljbGUuZ29gLiBBbnlcbiAqIGNoYW5nZXMgaGVyZSBtdXN0IHN0YXkgaW4gc3luYyB3aXRoIHRob3NlIGZpbGVzIOKAlCB0aGVyZSdzIGFuXG4gKiBpbnRlZ3JhdGlvbiB0ZXN0IHRoYXQgYXNzZXJ0cyB0aGUgc3RyaW5ncyBtYXRjaC5cbiAqL1xuZXhwb3J0IGNvbnN0IEV2ZW50cyA9IE9iamVjdC5mcmVlemUoe1xuICAgIC8qKiBBIENoZWNrIHJvdW5kLXRyaXAgaXMgc3RhcnRpbmcuIFBheWxvYWQ6IG51bGwuICovXG4gICAgQ2hlY2tTdGFydGVkOiBcIndhaWxzOnVwZGF0ZXI6Y2hlY2stc3RhcnRlZFwiLFxuICAgIC8qKiBDaGVjayBmb3VuZCBhIG5ld2VyIHJlbGVhc2UuIFBheWxvYWQ6IFJlbGVhc2UuICovXG4gICAgVXBkYXRlQXZhaWxhYmxlOiBcIndhaWxzOnVwZGF0ZXI6dXBkYXRlLWF2YWlsYWJsZVwiLFxuICAgIC8qKiBDaGVjayBjb25maXJtZWQgdGhlIGNhbGxlciBpcyB1cCB0byBkYXRlLiBQYXlsb2FkOiBudWxsLiAqL1xuICAgIE5vVXBkYXRlOiBcIndhaWxzOnVwZGF0ZXI6bm8tdXBkYXRlXCIsXG4gICAgLyoqIERvd25sb2FkIGlzIHN0YXJ0aW5nLiBQYXlsb2FkOiBSZWxlYXNlLiAqL1xuICAgIERvd25sb2FkU3RhcnRlZDogXCJ3YWlsczp1cGRhdGVyOmRvd25sb2FkLXN0YXJ0ZWRcIixcbiAgICAvKiogUGVyaW9kaWMgcHJvZ3Jlc3MgdGljayBkdXJpbmcgZG93bmxvYWQgKH4xMCBIeikuIFBheWxvYWQ6IFByb2dyZXNzLiAqL1xuICAgIERvd25sb2FkUHJvZ3Jlc3M6IFwid2FpbHM6dXBkYXRlcjpkb3dubG9hZC1wcm9ncmVzc1wiLFxuICAgIC8qKiBBbGwgYnl0ZXMgYXJlIG9uIGRpc2ssIGJ1dCB2ZXJpZmljYXRpb24gaGFzIG5vdCB5ZXQgc3RhcnRlZC4gUGF5bG9hZDogUmVsZWFzZS4gKi9cbiAgICBEb3dubG9hZENvbXBsZXRlOiBcIndhaWxzOnVwZGF0ZXI6ZG93bmxvYWQtY29tcGxldGVcIixcbiAgICAvKiogU2lnbmF0dXJlIC8gZGlnZXN0IHZlcmlmaWNhdGlvbiBoYXMgc3RhcnRlZC4gUGF5bG9hZDogUmVsZWFzZS4gKi9cbiAgICBWZXJpZnlpbmc6IFwid2FpbHM6dXBkYXRlcjp2ZXJpZnlpbmdcIixcbiAgICAvKiogVGhlIFVwZGF0ZXIgaXMgc3dhcHBpbmcgdGhlIGJpbmFyeSBpbnRvIHBsYWNlLiBQYXlsb2FkOiBSZWxlYXNlLiAqL1xuICAgIEluc3RhbGxpbmc6IFwid2FpbHM6dXBkYXRlcjppbnN0YWxsaW5nXCIsXG4gICAgLyoqIFVwZGF0ZSBpcyBzdGFnZWQgYW5kIGEgcmVzdGFydCBpcyBwZW5kaW5nLiBQYXlsb2FkOiBSZWxlYXNlLiAqL1xuICAgIFVwZGF0ZVJlYWR5OiBcIndhaWxzOnVwZGF0ZXI6dXBkYXRlLXJlYWR5XCIsXG4gICAgLyoqIFNvbWV0aGluZyBmYWlsZWQuIFBheWxvYWQ6IEVycm9ySW5mbyB7IHN0YWdlLCBtZXNzYWdlLCBwcm92aWRlciB9LiAqL1xuICAgIEVycm9yOiBcIndhaWxzOnVwZGF0ZXI6ZXJyb3JcIixcbiAgICAvKiogSG9zdC1zaWRlIGNvbnRleHQgZGVsaXZlcmVkIG9uY2UgcGVyIHNlc3Npb24uIFBheWxvYWQ6IE1ldGEgeyBjdXJyZW50VmVyc2lvbiwgc2tpcHBlZFZlcnNpb24gfS4gKi9cbiAgICBNZXRhOiBcIndhaWxzOnVwZGF0ZXI6bWV0YVwiLFxuXG4gICAgLyoqIFN1Yi1uYW1lc3BhY2U6IHVzZXItYWN0aW9uIGV2ZW50cyB0aGF0IHRoZSBVSSBlbWl0cyBCQUNLIHRvIHRoZSBob3N0LiAqL1xuICAgIFVzZXI6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAvKiogVXNlciBjbGlja2VkIEluc3RhbGwgb24gYW4gQXZhaWxhYmxlIHVwZGF0ZS4gKi9cbiAgICAgICAgSW5zdGFsbDogXCJ3YWlsczp1cGRhdGVyOnVzZXI6aW5zdGFsbFwiLFxuICAgICAgICAvKiogVXNlciBjbGlja2VkIFJlc3RhcnQgJiBBcHBseSBvbiBhIFJlYWR5IHVwZGF0ZS4gKi9cbiAgICAgICAgUmVzdGFydDogXCJ3YWlsczp1cGRhdGVyOnVzZXI6cmVzdGFydFwiLFxuICAgICAgICAvKiogVXNlciBjbGlja2VkIFNraXAgVGhpcyBWZXJzaW9uLiAqL1xuICAgICAgICBTa2lwOiBcIndhaWxzOnVwZGF0ZXI6dXNlcjpza2lwXCIsXG4gICAgICAgIC8qKiBVc2VyIGNsaWNrZWQgUmVtaW5kIE1lIExhdGVyLiAqL1xuICAgICAgICBSZW1pbmQ6IFwid2FpbHM6dXBkYXRlcjp1c2VyOnJlbWluZFwiLFxuICAgICAgICAvKiogVXNlciBjbGlja2VkIENsb3NlIC8gQ2FuY2VsLiAqL1xuICAgICAgICBDYW5jZWw6IFwid2FpbHM6dXBkYXRlcjp1c2VyOmNhbmNlbFwiLFxuICAgIH0pLFxuXG4gICAgLyoqIFN1Yi1uYW1lc3BhY2U6IGZyYW1ld29yay1pbnRlcm5hbCBldmVudHMgdGhlIFVJIGVtaXRzIHRvIGNvb3JkaW5hdGVcbiAgICAgKiAgd2l0aCB0aGUgaG9zdC4gTW9zdCBhcHAgY29kZSBjYW4gaWdub3JlIHRoZXNlLiAqL1xuICAgIFdpbmRvdzogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgIC8qKiBUaGUgd2luZG93IGZpbmlzaGVkIGxvYWRpbmcgYW5kIGFza3MgdGhlIGhvc3QgdG8gcmVwbGF5IGN1cnJlbnQgc3RhdGUuICovXG4gICAgICAgIFJlYWR5OiBcIndhaWxzOnVwZGF0ZXI6d2luZG93OnJlYWR5XCIsXG4gICAgfSksXG59KTtcbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG5pbXBvcnQge25ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQgdHlwZSB7IFNjcmVlbiB9IGZyb20gXCIuL3NjcmVlbnMuanNcIjtcblxuLy8gRHJvcCB0YXJnZXQgY29uc3RhbnRzXG5jb25zdCBEUk9QX1RBUkdFVF9BVFRSSUJVVEUgPSAnZGF0YS1maWxlLWRyb3AtdGFyZ2V0JztcbmNvbnN0IERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyA9ICdmaWxlLWRyb3AtdGFyZ2V0LWFjdGl2ZSc7XG5sZXQgY3VycmVudERyb3BUYXJnZXQ6IEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuY29uc3QgUG9zaXRpb25NZXRob2QgICAgICAgICAgICAgICAgICAgID0gMDtcbmNvbnN0IENlbnRlck1ldGhvZCAgICAgICAgICAgICAgICAgICAgICA9IDE7XG5jb25zdCBDbG9zZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgPSAyO1xuY29uc3QgRGlzYWJsZVNpemVDb25zdHJhaW50c01ldGhvZCAgICAgID0gMztcbmNvbnN0IEVuYWJsZVNpemVDb25zdHJhaW50c01ldGhvZCAgICAgICA9IDQ7XG5jb25zdCBGb2N1c01ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgPSA1O1xuY29uc3QgRm9yY2VSZWxvYWRNZXRob2QgICAgICAgICAgICAgICAgID0gNjtcbmNvbnN0IEZ1bGxzY3JlZW5NZXRob2QgICAgICAgICAgICAgICAgICA9IDc7XG5jb25zdCBHZXRTY3JlZW5NZXRob2QgICAgICAgICAgICAgICAgICAgPSA4O1xuY29uc3QgR2V0Wm9vbU1ldGhvZCAgICAgICAgICAgICAgICAgICAgID0gOTtcbmNvbnN0IEhlaWdodE1ldGhvZCAgICAgICAgICAgICAgICAgICAgICA9IDEwO1xuY29uc3QgSGlkZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgID0gMTE7XG5jb25zdCBJc0ZvY3VzZWRNZXRob2QgICAgICAgICAgICAgICAgICAgPSAxMjtcbmNvbnN0IElzRnVsbHNjcmVlbk1ldGhvZCAgICAgICAgICAgICAgICA9IDEzO1xuY29uc3QgSXNNYXhpbWlzZWRNZXRob2QgICAgICAgICAgICAgICAgID0gMTQ7XG5jb25zdCBJc01pbmltaXNlZE1ldGhvZCAgICAgICAgICAgICAgICAgPSAxNTtcbmNvbnN0IE1heGltaXNlTWV0aG9kICAgICAgICAgICAgICAgICAgICA9IDE2O1xuY29uc3QgTWluaW1pc2VNZXRob2QgICAgICAgICAgICAgICAgICAgID0gMTc7XG5jb25zdCBOYW1lTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICAgPSAxODtcbmNvbnN0IE9wZW5EZXZUb29sc01ldGhvZCAgICAgICAgICAgICAgICA9IDE5O1xuY29uc3QgUmVsYXRpdmVQb3NpdGlvbk1ldGhvZCAgICAgICAgICAgID0gMjA7XG5jb25zdCBSZWxvYWRNZXRob2QgICAgICAgICAgICAgICAgICAgICAgPSAyMTtcbmNvbnN0IFJlc2l6YWJsZU1ldGhvZCAgICAgICAgICAgICAgICAgICA9IDIyO1xuY29uc3QgUmVzdG9yZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgID0gMjM7XG5jb25zdCBTZXRQb3NpdGlvbk1ldGhvZCAgICAgICAgICAgICAgICAgPSAyNDtcbmNvbnN0IFNldEFsd2F5c09uVG9wTWV0aG9kICAgICAgICAgICAgICA9IDI1O1xuY29uc3QgU2V0QmFja2dyb3VuZENvbG91ck1ldGhvZCAgICAgICAgID0gMjY7XG5jb25zdCBTZXRGcmFtZWxlc3NNZXRob2QgICAgICAgICAgICAgICAgPSAyNztcbmNvbnN0IFNldEZ1bGxzY3JlZW5CdXR0b25FbmFibGVkTWV0aG9kICA9IDI4O1xuY29uc3QgU2V0TWF4U2l6ZU1ldGhvZCAgICAgICAgICAgICAgICAgID0gMjk7XG5jb25zdCBTZXRNaW5TaXplTWV0aG9kICAgICAgICAgICAgICAgICAgPSAzMDtcbmNvbnN0IFNldFJlbGF0aXZlUG9zaXRpb25NZXRob2QgICAgICAgICA9IDMxO1xuY29uc3QgU2V0UmVzaXphYmxlTWV0aG9kICAgICAgICAgICAgICAgID0gMzI7XG5jb25zdCBTZXRTaXplTWV0aG9kICAgICAgICAgICAgICAgICAgICAgPSAzMztcbmNvbnN0IFNldFRpdGxlTWV0aG9kICAgICAgICAgICAgICAgICAgICA9IDM0O1xuY29uc3QgU2V0Wm9vbU1ldGhvZCAgICAgICAgICAgICAgICAgICAgID0gMzU7XG5jb25zdCBTaG93TWV0aG9kICAgICAgICAgICAgICAgICAgICAgICAgPSAzNjtcbmNvbnN0IFNpemVNZXRob2QgICAgICAgICAgICAgICAgICAgICAgICA9IDM3O1xuY29uc3QgVG9nZ2xlRnVsbHNjcmVlbk1ldGhvZCAgICAgICAgICAgID0gMzg7XG5jb25zdCBUb2dnbGVNYXhpbWlzZU1ldGhvZCAgICAgICAgICAgICAgPSAzOTtcbmNvbnN0IFRvZ2dsZUZyYW1lbGVzc01ldGhvZCAgICAgICAgICAgICA9IDQwOyBcbmNvbnN0IFVuRnVsbHNjcmVlbk1ldGhvZCAgICAgICAgICAgICAgICA9IDQxO1xuY29uc3QgVW5NYXhpbWlzZU1ldGhvZCAgICAgICAgICAgICAgICAgID0gNDI7XG5jb25zdCBVbk1pbmltaXNlTWV0aG9kICAgICAgICAgICAgICAgICAgPSA0MztcbmNvbnN0IFdpZHRoTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICA9IDQ0O1xuY29uc3QgWm9vbU1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgID0gNDU7XG5jb25zdCBab29tSW5NZXRob2QgICAgICAgICAgICAgICAgICAgICAgPSA0NjtcbmNvbnN0IFpvb21PdXRNZXRob2QgICAgICAgICAgICAgICAgICAgICA9IDQ3O1xuY29uc3QgWm9vbVJlc2V0TWV0aG9kICAgICAgICAgICAgICAgICAgID0gNDg7XG5jb25zdCBTbmFwQXNzaXN0TWV0aG9kICAgICAgICAgICAgICAgICAgPSA0OTtcbmNvbnN0IEZpbGVzRHJvcHBlZCAgICAgICAgICAgICAgICAgICAgICA9IDUwO1xuY29uc3QgUHJpbnRNZXRob2QgICAgICAgICAgICAgICAgICAgICAgID0gNTE7XG5jb25zdCBTZXRTY3JlZW5NZXRob2QgICAgICAgICAgICAgICAgICAgPSA1MjtcblxuLyoqXG4gKiBGaW5kcyB0aGUgbmVhcmVzdCBkcm9wIHRhcmdldCBlbGVtZW50IGJ5IHdhbGtpbmcgdXAgdGhlIERPTSB0cmVlLlxuICovXG5mdW5jdGlvbiBnZXREcm9wVGFyZ2V0RWxlbWVudChlbGVtZW50OiBFbGVtZW50IHwgbnVsbCk6IEVsZW1lbnQgfCBudWxsIHtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50LmNsb3Nlc3QoYFske0RST1BfVEFSR0VUX0FUVFJJQlVURX1dYCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgd2UgY2FuIHVzZSBXZWJWaWV3MidzIHBvc3RNZXNzYWdlV2l0aEFkZGl0aW9uYWxPYmplY3RzIChXaW5kb3dzKVxuICogQWxzbyBjaGVja3MgdGhhdCBFbmFibGVGaWxlRHJvcCBpcyB0cnVlIGZvciB0aGlzIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gY2FuUmVzb2x2ZUZpbGVQYXRocygpOiBib29sZWFuIHtcbiAgICAvLyBNdXN0IGhhdmUgV2ViVmlldzIncyBwb3N0TWVzc2FnZVdpdGhBZGRpdGlvbmFsT2JqZWN0cyBBUEkgKFdpbmRvd3Mgb25seSlcbiAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLmNocm9tZT8ud2Vidmlldz8ucG9zdE1lc3NhZ2VXaXRoQWRkaXRpb25hbE9iamVjdHMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIE11c3QgaGF2ZSBFbmFibGVGaWxlRHJvcCBzZXQgdG8gdHJ1ZSBmb3IgdGhpcyB3aW5kb3dcbiAgICAvLyBUaGlzIGZsYWcgaXMgc2V0IGJ5IHRoZSBHbyBiYWNrZW5kIGR1cmluZyBydW50aW1lIGluaXRpYWxpemF0aW9uXG4gICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBTZW5kIGZpbGUgZHJvcCB0byBiYWNrZW5kIHZpYSBXZWJWaWV3MiAoV2luZG93cyBvbmx5KVxuICovXG5mdW5jdGlvbiByZXNvbHZlRmlsZVBhdGhzKHg6IG51bWJlciwgeTogbnVtYmVyLCBmaWxlczogRmlsZVtdKTogdm9pZCB7XG4gICAgaWYgKCh3aW5kb3cgYXMgYW55KS5jaHJvbWU/LndlYnZpZXc/LnBvc3RNZXNzYWdlV2l0aEFkZGl0aW9uYWxPYmplY3RzKSB7XG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5jaHJvbWUud2Vidmlldy5wb3N0TWVzc2FnZVdpdGhBZGRpdGlvbmFsT2JqZWN0cyhgZmlsZTpkcm9wOiR7eH06JHt5fWAsIGZpbGVzKTtcbiAgICB9XG59XG5cbi8vIE5hdGl2ZSBkcmFnIHN0YXRlIChMaW51eC9tYWNPUyBpbnRlcmNlcHQgRE9NIGRyYWcgZXZlbnRzKVxubGV0IG5hdGl2ZURyYWdBY3RpdmUgPSBmYWxzZTtcblxuLyoqXG4gKiBDbGVhbnMgdXAgbmF0aXZlIGRyYWcgc3RhdGUgYW5kIGhvdmVyIGVmZmVjdHMuXG4gKiBDYWxsZWQgb24gZHJvcCBvciB3aGVuIGRyYWcgbGVhdmVzIHRoZSB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIGNsZWFudXBOYXRpdmVEcmFnKCk6IHZvaWQge1xuICAgIG5hdGl2ZURyYWdBY3RpdmUgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudERyb3BUYXJnZXQpIHtcbiAgICAgICAgY3VycmVudERyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XG4gICAgfVxufVxuXG4vKipcbiAqIENhbGxlZCBmcm9tIEdvIHdoZW4gYSBmaWxlIGRyYWcgZW50ZXJzIHRoZSB3aW5kb3cgb24gTGludXgvbWFjT1MuXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZURyYWdFbnRlcigpOiB2b2lkIHtcbiAgICAvLyBDaGVjayBpZiBmaWxlIGRyb3BzIGFyZSBlbmFibGVkIGZvciB0aGlzIHdpbmRvd1xuICAgIGlmICgod2luZG93IGFzIGFueSkuX3dhaWxzPy5mbGFncz8uZW5hYmxlRmlsZURyb3AgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjsgLy8gRmlsZSBkcm9wcyBkaXNhYmxlZCwgZG9uJ3QgYWN0aXZhdGUgZHJhZyBzdGF0ZVxuICAgIH1cbiAgICBuYXRpdmVEcmFnQWN0aXZlID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBDYWxsZWQgZnJvbSBHbyB3aGVuIGEgZmlsZSBkcmFnIGxlYXZlcyB0aGUgd2luZG93IG9uIExpbnV4L21hY09TLlxuICovXG5mdW5jdGlvbiBoYW5kbGVEcmFnTGVhdmUoKTogdm9pZCB7XG4gICAgY2xlYW51cE5hdGl2ZURyYWcoKTtcbn1cblxuLyoqXG4gKiBDYWxsZWQgZnJvbSBHbyBkdXJpbmcgZmlsZSBkcmFnIHRvIHVwZGF0ZSBob3ZlciBzdGF0ZSBvbiBMaW51eC9tYWNPUy5cbiAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlIGluIENTUyBwaXhlbHNcbiAqIEBwYXJhbSB5IC0gWSBjb29yZGluYXRlIGluIENTUyBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gaGFuZGxlRHJhZ092ZXIoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoIW5hdGl2ZURyYWdBY3RpdmUpIHJldHVybjtcbiAgICBcbiAgICAvLyBDaGVjayBpZiBmaWxlIGRyb3BzIGFyZSBlbmFibGVkIGZvciB0aGlzIHdpbmRvd1xuICAgIGlmICgod2luZG93IGFzIGFueSkuX3dhaWxzPy5mbGFncz8uZW5hYmxlRmlsZURyb3AgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjsgLy8gRmlsZSBkcm9wcyBkaXNhYmxlZCwgZG9uJ3Qgc2hvdyBob3ZlciBlZmZlY3RzXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBnZXREcm9wVGFyZ2V0RWxlbWVudCh0YXJnZXRFbGVtZW50KTtcbiAgICBcbiAgICBpZiAoY3VycmVudERyb3BUYXJnZXQgJiYgY3VycmVudERyb3BUYXJnZXQgIT09IGRyb3BUYXJnZXQpIHtcbiAgICAgICAgY3VycmVudERyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xuICAgIH1cbiAgICBcbiAgICBpZiAoZHJvcFRhcmdldCkge1xuICAgICAgICBkcm9wVGFyZ2V0LmNsYXNzTGlzdC5hZGQoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKTtcbiAgICAgICAgY3VycmVudERyb3BUYXJnZXQgPSBkcm9wVGFyZ2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gbnVsbDtcbiAgICB9XG59XG5cblxuXG4vLyBFeHBvcnQgdGhlIGhhbmRsZXJzIGZvciB1c2UgYnkgR28gdmlhIGluZGV4LnRzXG5leHBvcnQgeyBoYW5kbGVEcmFnRW50ZXIsIGhhbmRsZURyYWdMZWF2ZSwgaGFuZGxlRHJhZ092ZXIgfTtcblxuLyoqXG4gKiBBIHJlY29yZCBkZXNjcmliaW5nIHRoZSBwb3NpdGlvbiBvZiBhIHdpbmRvdy5cbiAqL1xuaW50ZXJmYWNlIFBvc2l0aW9uIHtcbiAgICAvKiogVGhlIGhvcml6b250YWwgcG9zaXRpb24gb2YgdGhlIHdpbmRvdy4gKi9cbiAgICB4OiBudW1iZXI7XG4gICAgLyoqIFRoZSB2ZXJ0aWNhbCBwb3NpdGlvbiBvZiB0aGUgd2luZG93LiAqL1xuICAgIHk6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBBIHJlY29yZCBkZXNjcmliaW5nIHRoZSBzaXplIG9mIGEgd2luZG93LlxuICovXG5pbnRlcmZhY2UgU2l6ZSB7XG4gICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgd2luZG93LiAqL1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIHdpbmRvdy4gKi9cbiAgICBoZWlnaHQ6IG51bWJlcjtcbn1cblxuLy8gUHJpdmF0ZSBmaWVsZCBuYW1lcy5cbmNvbnN0IGNhbGxlclN5bSA9IFN5bWJvbChcImNhbGxlclwiKTtcblxuY2xhc3MgV2luZG93IHtcbiAgICAvLyBQcml2YXRlIGZpZWxkcy5cbiAgICBwcml2YXRlIFtjYWxsZXJTeW1dOiAobWVzc2FnZTogbnVtYmVyLCBhcmdzPzogYW55KSA9PiBQcm9taXNlPGFueT47XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXNlcyBhIHdpbmRvdyBvYmplY3Qgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHRhcmdldCB3aW5kb3cuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gJycpIHtcbiAgICAgICAgdGhpc1tjYWxsZXJTeW1dID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5XaW5kb3csIG5hbWUpXG5cbiAgICAgICAgLy8gYmluZCBpbnN0YW5jZSBtZXRob2QgdG8gbWFrZSB0aGVtIGVhc2lseSB1c2FibGUgaW4gZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgZm9yIChjb25zdCBtZXRob2Qgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoV2luZG93LnByb3RvdHlwZSkpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBtZXRob2QgIT09IFwiY29uc3RydWN0b3JcIlxuICAgICAgICAgICAgICAgICYmIHR5cGVvZiAodGhpcyBhcyBhbnkpW21ldGhvZF0gPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgKHRoaXMgYXMgYW55KVttZXRob2RdID0gKHRoaXMgYXMgYW55KVttZXRob2RdLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBzcGVjaWZpZWQgd2luZG93LlxuICAgICAqXG4gICAgICogQHBhcmFtIG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IHRvIGdldC5cbiAgICAgKiBAcmV0dXJucyBUaGUgY29ycmVzcG9uZGluZyB3aW5kb3cgb2JqZWN0LlxuICAgICAqL1xuICAgIEdldChuYW1lOiBzdHJpbmcpOiBXaW5kb3cge1xuICAgICAgICByZXR1cm4gbmV3IFdpbmRvdyhuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBQb3NpdGlvbigpOiBQcm9taXNlPFBvc2l0aW9uPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oUG9zaXRpb25NZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENlbnRlcnMgdGhlIHdpbmRvdyBvbiB0aGUgc2NyZWVuLlxuICAgICAqL1xuICAgIENlbnRlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShDZW50ZXJNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlcyB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIENsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKENsb3NlTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNhYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gICAgICovXG4gICAgRGlzYWJsZVNpemVDb25zdHJhaW50cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGVzIG1pbi9tYXggc2l6ZSBjb25zdHJhaW50cy5cbiAgICAgKi9cbiAgICBFbmFibGVTaXplQ29uc3RyYWludHMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oRW5hYmxlU2l6ZUNvbnN0cmFpbnRzTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGb2N1c2VzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgRm9jdXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oRm9jdXNNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZvcmNlcyB0aGUgd2luZG93IHRvIHJlbG9hZCB0aGUgcGFnZSBhc3NldHMuXG4gICAgICovXG4gICAgRm9yY2VSZWxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oRm9yY2VSZWxvYWRNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN3aXRjaGVzIHRoZSB3aW5kb3cgdG8gZnVsbHNjcmVlbiBtb2RlLlxuICAgICAqL1xuICAgIEZ1bGxzY3JlZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oRnVsbHNjcmVlbk1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc2NyZWVuIHRoYXQgdGhlIHdpbmRvdyBpcyBvbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoZSBzY3JlZW4gdGhlIHdpbmRvdyBpcyBjdXJyZW50bHkgb24uXG4gICAgICovXG4gICAgR2V0U2NyZWVuKCk6IFByb21pc2U8U2NyZWVuPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oR2V0U2NyZWVuTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHpvb20gbGV2ZWwgb2YgdGhlIHdpbmRvdy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHpvb20gbGV2ZWwuXG4gICAgICovXG4gICAgR2V0Wm9vbSgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKEdldFpvb21NZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgSGVpZ2h0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oSGVpZ2h0TWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIaWRlcyB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIEhpZGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oSGlkZU1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgZm9jdXNlZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHdpbmRvdyBpcyBjdXJyZW50bHkgZm9jdXNlZC5cbiAgICAgKi9cbiAgICBJc0ZvY3VzZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oSXNGb2N1c2VkTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmdWxsc2NyZWVuLlxuICAgICAqXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgd2luZG93IGlzIGN1cnJlbnRseSBmdWxsc2NyZWVuLlxuICAgICAqL1xuICAgIElzRnVsbHNjcmVlbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShJc0Z1bGxzY3JlZW5NZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIG1heGltaXNlZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHdpbmRvdyBpcyBjdXJyZW50bHkgbWF4aW1pc2VkLlxuICAgICAqL1xuICAgIElzTWF4aW1pc2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKElzTWF4aW1pc2VkTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBtaW5pbWlzZWQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB3aW5kb3cgaXMgY3VycmVudGx5IG1pbmltaXNlZC5cbiAgICAgKi9cbiAgICBJc01pbmltaXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShJc01pbmltaXNlZE1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWF4aW1pc2VzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgTWF4aW1pc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oTWF4aW1pc2VNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1pbmltaXNlcyB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIE1pbmltaXNlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKE1pbmltaXNlTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUgbmFtZSBvZiB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIE5hbWUoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShOYW1lTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPcGVucyB0aGUgZGV2ZWxvcG1lbnQgdG9vbHMgcGFuZS5cbiAgICAgKi9cbiAgICBPcGVuRGV2VG9vbHMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oT3BlbkRldlRvb2xzTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIFJlbGF0aXZlUG9zaXRpb24oKTogUHJvbWlzZTxQb3NpdGlvbj4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFJlbGF0aXZlUG9zaXRpb25NZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbG9hZHMgdGhlIHBhZ2UgYXNzZXRzLlxuICAgICAqL1xuICAgIFJlbG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShSZWxvYWRNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIHJlc2l6YWJsZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHdpbmRvdyBpcyBjdXJyZW50bHkgcmVzaXphYmxlLlxuICAgICAqL1xuICAgIFJlc2l6YWJsZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShSZXNpemFibGVNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc3RvcmVzIHRoZSB3aW5kb3cgdG8gaXRzIHByZXZpb3VzIHN0YXRlIGlmIGl0IHdhcyBwcmV2aW91c2x5IG1pbmltaXNlZCwgbWF4aW1pc2VkIG9yIGZ1bGxzY3JlZW4uXG4gICAgICovXG4gICAgUmVzdG9yZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShSZXN0b3JlTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHBhcmFtIHggLSBUaGUgZGVzaXJlZCBob3Jpem9udGFsIGFic29sdXRlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuXG4gICAgICogQHBhcmFtIHkgLSBUaGUgZGVzaXJlZCB2ZXJ0aWNhbCBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIFNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0UG9zaXRpb25NZXRob2QsIHsgeCwgeSB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB3aW5kb3cgdG8gYmUgYWx3YXlzIG9uIHRvcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhbHdheXNPblRvcCAtIFdoZXRoZXIgdGhlIHdpbmRvdyBzaG91bGQgc3RheSBvbiB0b3AuXG4gICAgICovXG4gICAgU2V0QWx3YXlzT25Ub3AoYWx3YXlzT25Ub3A6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRBbHdheXNPblRvcE1ldGhvZCwgeyBhbHdheXNPblRvcCB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBiYWNrZ3JvdW5kIGNvbG91ciBvZiB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHBhcmFtIHIgLSBUaGUgZGVzaXJlZCByZWQgY29tcG9uZW50IG9mIHRoZSB3aW5kb3cgYmFja2dyb3VuZC5cbiAgICAgKiBAcGFyYW0gZyAtIFRoZSBkZXNpcmVkIGdyZWVuIGNvbXBvbmVudCBvZiB0aGUgd2luZG93IGJhY2tncm91bmQuXG4gICAgICogQHBhcmFtIGIgLSBUaGUgZGVzaXJlZCBibHVlIGNvbXBvbmVudCBvZiB0aGUgd2luZG93IGJhY2tncm91bmQuXG4gICAgICogQHBhcmFtIGEgLSBUaGUgZGVzaXJlZCBhbHBoYSBjb21wb25lbnQgb2YgdGhlIHdpbmRvdyBiYWNrZ3JvdW5kLlxuICAgICAqL1xuICAgIFNldEJhY2tncm91bmRDb2xvdXIocjogbnVtYmVyLCBnOiBudW1iZXIsIGI6IG51bWJlciwgYTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0QmFja2dyb3VuZENvbG91ck1ldGhvZCwgeyByLCBnLCBiLCBhIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIHdpbmRvdyBmcmFtZSBhbmQgdGl0bGUgYmFyLlxuICAgICAqXG4gICAgICogQHBhcmFtIGZyYW1lbGVzcyAtIFdoZXRoZXIgdGhlIHdpbmRvdyBzaG91bGQgYmUgZnJhbWVsZXNzLlxuICAgICAqL1xuICAgIFNldEZyYW1lbGVzcyhmcmFtZWxlc3M6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRGcmFtZWxlc3NNZXRob2QsIHsgZnJhbWVsZXNzIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc2FibGVzIHRoZSBzeXN0ZW0gZnVsbHNjcmVlbiBidXR0b24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW5hYmxlZCAtIFdoZXRoZXIgdGhlIGZ1bGxzY3JlZW4gYnV0dG9uIHNob3VsZCBiZSBlbmFibGVkLlxuICAgICAqL1xuICAgIFNldEZ1bGxzY3JlZW5CdXR0b25FbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRGdWxsc2NyZWVuQnV0dG9uRW5hYmxlZE1ldGhvZCwgeyBlbmFibGVkIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIG1heGltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHBhcmFtIHdpZHRoIC0gVGhlIGRlc2lyZWQgbWF4aW11bSB3aWR0aCBvZiB0aGUgd2luZG93LlxuICAgICAqIEBwYXJhbSBoZWlnaHQgLSBUaGUgZGVzaXJlZCBtYXhpbXVtIGhlaWdodCBvZiB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIFNldE1heFNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRNYXhTaXplTWV0aG9kLCB7IHdpZHRoLCBoZWlnaHQgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbWluaW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gd2lkdGggLSBUaGUgZGVzaXJlZCBtaW5pbXVtIHdpZHRoIG9mIHRoZSB3aW5kb3cuXG4gICAgICogQHBhcmFtIGhlaWdodCAtIFRoZSBkZXNpcmVkIG1pbmltdW0gaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgU2V0TWluU2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldE1pblNpemVNZXRob2QsIHsgd2lkdGgsIGhlaWdodCB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0geCAtIFRoZSBkZXNpcmVkIGhvcml6b250YWwgcmVsYXRpdmUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdy5cbiAgICAgKiBAcGFyYW0geSAtIFRoZSBkZXNpcmVkIHZlcnRpY2FsIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgU2V0UmVsYXRpdmVQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldFJlbGF0aXZlUG9zaXRpb25NZXRob2QsIHsgeCwgeSB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHdoZXRoZXIgdGhlIHdpbmRvdyBpcyByZXNpemFibGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcmVzaXphYmxlIC0gV2hldGhlciB0aGUgd2luZG93IHNob3VsZCBiZSByZXNpemFibGUuXG4gICAgICovXG4gICAgU2V0UmVzaXphYmxlKHJlc2l6YWJsZTogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldFJlc2l6YWJsZU1ldGhvZCwgeyByZXNpemFibGUgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHBhcmFtIHdpZHRoIC0gVGhlIGRlc2lyZWQgd2lkdGggb2YgdGhlIHdpbmRvdy5cbiAgICAgKiBAcGFyYW0gaGVpZ2h0IC0gVGhlIGRlc2lyZWQgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgU2V0U2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldFNpemVNZXRob2QsIHsgd2lkdGgsIGhlaWdodCB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB0aXRsZSBvZiB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHBhcmFtIHRpdGxlIC0gVGhlIGRlc2lyZWQgdGl0bGUgb2YgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBTZXRUaXRsZSh0aXRsZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0VGl0bGVNZXRob2QsIHsgdGl0bGUgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHBhcmFtIHpvb20gLSBUaGUgZGVzaXJlZCB6b29tIGxldmVsLlxuICAgICAqL1xuICAgIFNldFpvb20oem9vbTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0Wm9vbU1ldGhvZCwgeyB6b29tIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3dzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgU2hvdygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTaG93TWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCBzaXplIG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgU2l6ZSgpOiBQcm9taXNlPFNpemU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTaXplTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBmdWxsc2NyZWVuIGFuZCBub3JtYWwuXG4gICAgICovXG4gICAgVG9nZ2xlRnVsbHNjcmVlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShUb2dnbGVGdWxsc2NyZWVuTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBtYXhpbWlzZWQgYW5kIG5vcm1hbC5cbiAgICAgKi9cbiAgICBUb2dnbGVNYXhpbWlzZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShUb2dnbGVNYXhpbWlzZU1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlcyB0aGUgd2luZG93IGJldHdlZW4gZnJhbWVsZXNzIGFuZCBub3JtYWwuXG4gICAgICovXG4gICAgVG9nZ2xlRnJhbWVsZXNzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFRvZ2dsZUZyYW1lbGVzc01ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW4tZnVsbHNjcmVlbnMgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBVbkZ1bGxzY3JlZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oVW5GdWxsc2NyZWVuTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbi1tYXhpbWlzZXMgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBVbk1heGltaXNlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFVuTWF4aW1pc2VNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVuLW1pbmltaXNlcyB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIFVuTWluaW1pc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oVW5NaW5pbWlzZU1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIHdpbmRvdy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHdpZHRoIG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgV2lkdGgoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShXaWR0aE1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogWm9vbXMgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBab29tKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21NZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluY3JlYXNlcyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2VidmlldyBjb250ZW50LlxuICAgICAqL1xuICAgIFpvb21JbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShab29tSW5NZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlY3JlYXNlcyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2VidmlldyBjb250ZW50LlxuICAgICAqL1xuICAgIFpvb21PdXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oWm9vbU91dE1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gICAgICovXG4gICAgWm9vbVJlc2V0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21SZXNldE1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBmaWxlIGRyb3BzIG9yaWdpbmF0aW5nIGZyb20gcGxhdGZvcm0tc3BlY2lmaWMgY29kZSAoZS5nLiwgbWFjT1MvTGludXggbmF0aXZlIGRyYWctYW5kLWRyb3ApLlxuICAgICAqIEdhdGhlcnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGRyb3AgdGFyZ2V0IGVsZW1lbnQgYW5kIHNlbmRzIGl0IGJhY2sgdG8gdGhlIEdvIGJhY2tlbmQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWVzIC0gQW4gYXJyYXkgb2YgZmlsZSBwYXRocyAoc3RyaW5ncykgdGhhdCB3ZXJlIGRyb3BwZWQuXG4gICAgICogQHBhcmFtIHggLSBUaGUgeC1jb29yZGluYXRlIG9mIHRoZSBkcm9wIGV2ZW50LCBpbiBsb2dpY2FsIChDU1MpIHBpeGVscyByZWxhdGl2ZSB0byB0aGUgd2Vidmlldy5cbiAgICAgKiBAcGFyYW0geSAtIFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIGRyb3AgZXZlbnQsIGluIGxvZ2ljYWwgKENTUykgcGl4ZWxzIHJlbGF0aXZlIHRvIHRoZSB3ZWJ2aWV3LlxuICAgICAqL1xuICAgIEhhbmRsZVBsYXRmb3JtRmlsZURyb3AoZmlsZW5hbWVzOiBzdHJpbmdbXSwgeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gRmlsZSBkcm9wcyBkaXNhYmxlZCwgaWdub3JlIHRoZSBkcm9wXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICAgICAgICBjb25zdCBkcm9wVGFyZ2V0ID0gZ2V0RHJvcFRhcmdldEVsZW1lbnQoZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKCFkcm9wVGFyZ2V0KSB7XG4gICAgICAgICAgICAvLyBEcm9wIHdhcyBub3Qgb24gYSBkZXNpZ25hdGVkIGRyb3AgdGFyZ2V0IC0gaWdub3JlXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlbGVtZW50RGV0YWlscyA9IHtcbiAgICAgICAgICAgIGlkOiBkcm9wVGFyZ2V0LmlkLFxuICAgICAgICAgICAgY2xhc3NMaXN0OiBBcnJheS5mcm9tKGRyb3BUYXJnZXQuY2xhc3NMaXN0KSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHt9IGFzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZHJvcFRhcmdldC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBhdHRyID0gZHJvcFRhcmdldC5hdHRyaWJ1dGVzW2ldO1xuICAgICAgICAgICAgZWxlbWVudERldGFpbHMuYXR0cmlidXRlc1thdHRyLm5hbWVdID0gYXR0ci52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAgICAgICBmaWxlbmFtZXMsXG4gICAgICAgICAgICB4LFxuICAgICAgICAgICAgeSxcbiAgICAgICAgICAgIGVsZW1lbnREZXRhaWxzLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXNbY2FsbGVyU3ltXShGaWxlc0Ryb3BwZWQsIHBheWxvYWQpO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2xlYW4gdXAgbmF0aXZlIGRyYWcgc3RhdGUgYWZ0ZXIgZHJvcFxuICAgICAgICBjbGVhbnVwTmF0aXZlRHJhZygpO1xuICAgIH1cbiAgXG4gICAgLyoqXG4gICAgICogTW92ZXMgdGhlIHdpbmRvdyB0byB0aGUgY2VudGVyIG9mIHRoZSBzcGVjaWZpZWQgc2NyZWVuJ3Mgd29yayBhcmVhLlxuICAgICAqXG4gICAgICogQHBhcmFtIHNjcmVlbklEIC0gVGhlIElEIG9mIHRoZSB0YXJnZXQgc2NyZWVuLlxuICAgICAqL1xuICAgIFNldFNjcmVlbihzY3JlZW5JRDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0U2NyZWVuTWV0aG9kLCB7IHNjcmVlbklEIH0pO1xuICAgIH1cblxuICAgIC8qIFRyaWdnZXJzIFdpbmRvd3MgMTEgU25hcCBBc3Npc3QgZmVhdHVyZSAoV2luZG93cyBvbmx5KS5cbiAgICAgKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gcHJlc3NpbmcgV2luK1ogYW5kIHNob3dzIHNuYXAgbGF5b3V0IG9wdGlvbnMuXG4gICAgICovXG4gICAgU25hcEFzc2lzdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTbmFwQXNzaXN0TWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPcGVucyB0aGUgcHJpbnQgZGlhbG9nIGZvciB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIFByaW50KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFByaW50TWV0aG9kKTtcbiAgICB9XG59XG5cbi8qKlxuICogVGhlIHdpbmRvdyB3aXRoaW4gd2hpY2ggdGhlIHNjcmlwdCBpcyBydW5uaW5nLlxuICovXG5jb25zdCB0aGlzV2luZG93ID0gbmV3IFdpbmRvdygnJyk7XG5cbi8qKlxuICogU2V0cyB1cCBnbG9iYWwgZHJhZyBhbmQgZHJvcCBldmVudCBsaXN0ZW5lcnMgZm9yIGZpbGUgZHJvcHMuXG4gKiBIYW5kbGVzIHZpc3VhbCBmZWVkYmFjayAoaG92ZXIgc3RhdGUpIGFuZCBmaWxlIGRyb3AgcHJvY2Vzc2luZy5cbiAqL1xuZnVuY3Rpb24gc2V0dXBEcm9wVGFyZ2V0TGlzdGVuZXJzKCkge1xuICAgIGNvbnN0IGRvY0VsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgbGV0IGRyYWdFbnRlckNvdW50ZXIgPSAwO1xuXG4gICAgZG9jRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFldmVudC5kYXRhVHJhbnNmZXI/LnR5cGVzLmluY2x1ZGVzKCdGaWxlcycpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIE9ubHkgaGFuZGxlIGZpbGUgZHJhZ3MsIGxldCBvdGhlciBkcmFncyBwYXNzIHRocm91Z2hcbiAgICAgICAgfVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBBbHdheXMgcHJldmVudCBkZWZhdWx0IHRvIHN0b3AgYnJvd3NlciBuYXZpZ2F0aW9uXG4gICAgICAgIC8vIE9uIFdpbmRvd3MsIGNoZWNrIGlmIGZpbGUgZHJvcHMgYXJlIGVuYWJsZWQgZm9yIHRoaXMgd2luZG93XG4gICAgICAgIGlmICgod2luZG93IGFzIGFueSkuX3dhaWxzPy5mbGFncz8uZW5hYmxlRmlsZURyb3AgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBldmVudC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdub25lJzsgLy8gU2hvdyBcIm5vIGRyb3BcIiBjdXJzb3JcbiAgICAgICAgICAgIHJldHVybjsgLy8gRmlsZSBkcm9wcyBkaXNhYmxlZCwgZG9uJ3Qgc2hvdyBob3ZlciBlZmZlY3RzXG4gICAgICAgIH1cbiAgICAgICAgZHJhZ0VudGVyQ291bnRlcisrO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG4gICAgICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBnZXREcm9wVGFyZ2V0RWxlbWVudCh0YXJnZXRFbGVtZW50KTtcblxuICAgICAgICAvLyBVcGRhdGUgaG92ZXIgc3RhdGVcbiAgICAgICAgaWYgKGN1cnJlbnREcm9wVGFyZ2V0ICYmIGN1cnJlbnREcm9wVGFyZ2V0ICE9PSBkcm9wVGFyZ2V0KSB7XG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZHJvcFRhcmdldCkge1xuICAgICAgICAgICAgZHJvcFRhcmdldC5jbGFzc0xpc3QuYWRkKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyk7XG4gICAgICAgICAgICBldmVudC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdjb3B5JztcbiAgICAgICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gZHJvcFRhcmdldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ25vbmUnO1xuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgZG9jRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoIWV2ZW50LmRhdGFUcmFuc2Zlcj8udHlwZXMuaW5jbHVkZXMoJ0ZpbGVzJykpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gT25seSBoYW5kbGUgZmlsZSBkcmFnc1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IC8vIEFsd2F5cyBwcmV2ZW50IGRlZmF1bHQgdG8gc3RvcCBicm93c2VyIG5hdmlnYXRpb25cbiAgICAgICAgLy8gT24gV2luZG93cywgY2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ25vbmUnOyAvLyBTaG93IFwibm8gZHJvcFwiIGN1cnNvclxuICAgICAgICAgICAgcmV0dXJuOyAvLyBGaWxlIGRyb3BzIGRpc2FibGVkLCBkb24ndCBzaG93IGhvdmVyIGVmZmVjdHNcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gVXBkYXRlIGRyb3AgdGFyZ2V0IGFzIGN1cnNvciBtb3Zlc1xuICAgICAgICBjb25zdCB0YXJnZXRFbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgICAgICAgY29uc3QgZHJvcFRhcmdldCA9IGdldERyb3BUYXJnZXRFbGVtZW50KHRhcmdldEVsZW1lbnQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGN1cnJlbnREcm9wVGFyZ2V0ICYmIGN1cnJlbnREcm9wVGFyZ2V0ICE9PSBkcm9wVGFyZ2V0KSB7XG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChkcm9wVGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAoIWRyb3BUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUykpIHtcbiAgICAgICAgICAgICAgICBkcm9wVGFyZ2V0LmNsYXNzTGlzdC5hZGQoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknO1xuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQgPSBkcm9wVGFyZ2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbm9uZSc7XG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9LCBmYWxzZSk7XG5cbiAgICBkb2NFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoIWV2ZW50LmRhdGFUcmFuc2Zlcj8udHlwZXMuaW5jbHVkZXMoJ0ZpbGVzJykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBBbHdheXMgcHJldmVudCBkZWZhdWx0IHRvIHN0b3AgYnJvd3NlciBuYXZpZ2F0aW9uXG4gICAgICAgIC8vIE9uIFdpbmRvd3MsIGNoZWNrIGlmIGZpbGUgZHJvcHMgYXJlIGVuYWJsZWQgZm9yIHRoaXMgd2luZG93XG4gICAgICAgIGlmICgod2luZG93IGFzIGFueSkuX3dhaWxzPy5mbGFncz8uZW5hYmxlRmlsZURyb3AgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIE9uIExpbnV4L1dlYktpdEdUSyBhbmQgbWFjT1MsIGRyYWdsZWF2ZSBmaXJlcyBpbW1lZGlhdGVseSB3aXRoIHJlbGF0ZWRUYXJnZXQ9bnVsbCB3aGVuIG5hdGl2ZVxuICAgICAgICAvLyBkcmFnIGhhbmRsaW5nIGlzIGludm9sdmVkLiBJZ25vcmUgdGhlc2Ugc3B1cmlvdXMgZXZlbnRzIC0gd2UnbGwgY2xlYW4gdXAgb24gZHJvcCBpbnN0ZWFkLlxuICAgICAgICBpZiAoZXZlbnQucmVsYXRlZFRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkcmFnRW50ZXJDb3VudGVyLS07XG4gICAgICAgIFxuICAgICAgICBpZiAoZHJhZ0VudGVyQ291bnRlciA9PT0gMCB8fCBcbiAgICAgICAgICAgIChjdXJyZW50RHJvcFRhcmdldCAmJiAhY3VycmVudERyb3BUYXJnZXQuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCBhcyBOb2RlKSkpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50RHJvcFRhcmdldCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKTtcbiAgICAgICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkcmFnRW50ZXJDb3VudGVyID0gMDtcbiAgICAgICAgfVxuICAgIH0sIGZhbHNlKTtcblxuICAgIGRvY0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoIWV2ZW50LmRhdGFUcmFuc2Zlcj8udHlwZXMuaW5jbHVkZXMoJ0ZpbGVzJykpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gT25seSBoYW5kbGUgZmlsZSBkcm9wc1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IC8vIEFsd2F5cyBwcmV2ZW50IGRlZmF1bHQgdG8gc3RvcCBicm93c2VyIG5hdmlnYXRpb25cbiAgICAgICAgLy8gT24gV2luZG93cywgY2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fd2FpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkcmFnRW50ZXJDb3VudGVyID0gMDtcbiAgICAgICAgXG4gICAgICAgIGlmIChjdXJyZW50RHJvcFRhcmdldCkge1xuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT24gV2luZG93cywgaGFuZGxlIGZpbGUgZHJvcHMgdmlhIEphdmFTY3JpcHRcbiAgICAgICAgLy8gT24gbWFjT1MvTGludXgsIG5hdGl2ZSBjb2RlIHdpbGwgY2FsbCBIYW5kbGVQbGF0Zm9ybUZpbGVEcm9wXG4gICAgICAgIGlmIChjYW5SZXNvbHZlRmlsZVBhdGhzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzOiBGaWxlW10gPSBbXTtcbiAgICAgICAgICAgIGlmIChldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgZXZlbnQuZGF0YVRyYW5zZmVyLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmtpbmQgPT09ICdmaWxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IGl0ZW0uZ2V0QXNGaWxlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZSkgZmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGV2ZW50LmRhdGFUcmFuc2Zlci5maWxlcykge1xuICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlRmlsZVBhdGhzKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGZpbGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIGZhbHNlKTtcbn1cblxuLy8gSW5pdGlhbGl6ZSBsaXN0ZW5lcnMgd2hlbiB0aGUgc2NyaXB0IGxvYWRzXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgZG9jdW1lbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBzZXR1cERyb3BUYXJnZXRMaXN0ZW5lcnMoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdGhpc1dpbmRvdztcbiIsIi8qXG4gXyAgICAgX18gICAgIF8gX19cbnwgfCAgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG5pbXBvcnQgeyBPcGVuVVJMIH0gZnJvbSBcIi4vYnJvd3Nlci5qc1wiO1xuaW1wb3J0IHsgUXVlc3Rpb24gfSBmcm9tIFwiLi9kaWFsb2dzLmpzXCI7XG5pbXBvcnQgeyBFbWl0IH0gZnJvbSBcIi4vZXZlbnRzLmpzXCI7XG5pbXBvcnQgeyBjYW5BYm9ydExpc3RlbmVycywgd2hlblJlYWR5IH0gZnJvbSBcIi4vdXRpbHMuanNcIjtcbmltcG9ydCBXaW5kb3cgZnJvbSBcIi4vd2luZG93LmpzXCI7XG5cbi8qKlxuICogU2VuZHMgYW4gZXZlbnQgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgb3B0aW9uYWwgZGF0YS5cbiAqXG4gKiBAcGFyYW0gZXZlbnROYW1lIC0gLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gc2VuZC5cbiAqIEBwYXJhbSBbZGF0YT1udWxsXSAtIC0gT3B0aW9uYWwgZGF0YSB0byBzZW5kIGFsb25nIHdpdGggdGhlIGV2ZW50LlxuICovXG5mdW5jdGlvbiBzZW5kRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIGRhdGE6IGFueSA9IG51bGwpOiB2b2lkIHtcbiAgICBFbWl0KGV2ZW50TmFtZSwgZGF0YSk7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb24gYSBzcGVjaWZpZWQgd2luZG93LlxuICpcbiAqIEBwYXJhbSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdyB0byBjYWxsIHRoZSBtZXRob2Qgb24uXG4gKiBAcGFyYW0gbWV0aG9kTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgdG8gY2FsbC5cbiAqL1xuZnVuY3Rpb24gY2FsbFdpbmRvd01ldGhvZCh3aW5kb3dOYW1lOiBzdHJpbmcsIG1ldGhvZE5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHRhcmdldFdpbmRvdyA9IFdpbmRvdy5HZXQod2luZG93TmFtZSk7XG4gICAgY29uc3QgbWV0aG9kID0gKHRhcmdldFdpbmRvdyBhcyBhbnkpW21ldGhvZE5hbWVdO1xuXG4gICAgaWYgKHR5cGVvZiBtZXRob2QgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBXaW5kb3cgbWV0aG9kICcke21ldGhvZE5hbWV9JyBub3QgZm91bmRgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIG1ldGhvZC5jYWxsKHRhcmdldFdpbmRvdyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBjYWxsaW5nIHdpbmRvdyBtZXRob2QgJyR7bWV0aG9kTmFtZX0nOiBgLCBlKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmVzcG9uZHMgdG8gYSB0cmlnZ2VyaW5nIGV2ZW50IGJ5IHJ1bm5pbmcgYXBwcm9wcmlhdGUgV01MIGFjdGlvbnMgZm9yIHRoZSBjdXJyZW50IHRhcmdldC5cbiAqL1xuZnVuY3Rpb24gb25XTUxUcmlnZ2VyZWQoZXY6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZWxlbWVudCA9IGV2LmN1cnJlbnRUYXJnZXQgYXMgRWxlbWVudDtcblxuICAgIGZ1bmN0aW9uIHJ1bkVmZmVjdChjaG9pY2UgPSBcIlllc1wiKSB7XG4gICAgICAgIGlmIChjaG9pY2UgIT09IFwiWWVzXCIpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1ldmVudCcpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC1ldmVudCcpO1xuICAgICAgICBjb25zdCB0YXJnZXRXaW5kb3cgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLXRhcmdldC13aW5kb3cnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS13bWwtdGFyZ2V0LXdpbmRvdycpIHx8IFwiXCI7XG4gICAgICAgIGNvbnN0IHdpbmRvd01ldGhvZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtd2luZG93JykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd21sLXdpbmRvdycpO1xuICAgICAgICBjb25zdCB1cmwgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLW9wZW51cmwnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS13bWwtb3BlbnVybCcpO1xuXG4gICAgICAgIGlmIChldmVudFR5cGUgIT09IG51bGwpXG4gICAgICAgICAgICBzZW5kRXZlbnQoZXZlbnRUeXBlKTtcbiAgICAgICAgaWYgKHdpbmRvd01ldGhvZCAhPT0gbnVsbClcbiAgICAgICAgICAgIGNhbGxXaW5kb3dNZXRob2QodGFyZ2V0V2luZG93LCB3aW5kb3dNZXRob2QpO1xuICAgICAgICBpZiAodXJsICE9PSBudWxsKVxuICAgICAgICAgICAgdm9pZCBPcGVuVVJMKHVybCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29uZmlybSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtY29uZmlybScpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC1jb25maXJtJyk7XG5cbiAgICBpZiAoY29uZmlybSkge1xuICAgICAgICBRdWVzdGlvbih7XG4gICAgICAgICAgICBUaXRsZTogXCJDb25maXJtXCIsXG4gICAgICAgICAgICBNZXNzYWdlOiBjb25maXJtLFxuICAgICAgICAgICAgRGV0YWNoZWQ6IGZhbHNlLFxuICAgICAgICAgICAgQnV0dG9uczogW1xuICAgICAgICAgICAgICAgIHsgTGFiZWw6IFwiWWVzXCIgfSxcbiAgICAgICAgICAgICAgICB7IExhYmVsOiBcIk5vXCIsIElzRGVmYXVsdDogdHJ1ZSB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pLnRoZW4ocnVuRWZmZWN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBydW5FZmZlY3QoKTtcbiAgICB9XG59XG5cbi8vIFByaXZhdGUgZmllbGQgbmFtZXMuXG5jb25zdCBjb250cm9sbGVyU3ltID0gU3ltYm9sKFwiY29udHJvbGxlclwiKTtcbmNvbnN0IHRyaWdnZXJNYXBTeW0gPSBTeW1ib2woXCJ0cmlnZ2VyTWFwXCIpO1xuY29uc3QgZWxlbWVudENvdW50U3ltID0gU3ltYm9sKFwiZWxlbWVudENvdW50XCIpO1xuXG4vKipcbiAqIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IGRvZXMgbm90IGFjdHVhbGx5IHJlbWVtYmVyIGFjdGl2ZSBldmVudCBsaXN0ZW5lcnM6IGluc3RlYWRcbiAqIGl0IHRpZXMgdGhlbSB0byBhbiBBYm9ydFNpZ25hbCBhbmQgdXNlcyBhbiBBYm9ydENvbnRyb2xsZXIgdG8gcmVtb3ZlIHRoZW0gYWxsIGF0IG9uY2UuXG4gKi9cbmNsYXNzIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IHtcbiAgICAvLyBQcml2YXRlIGZpZWxkcy5cbiAgICBbY29udHJvbGxlclN5bV06IEFib3J0Q29udHJvbGxlcjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzW2NvbnRyb2xsZXJTeW1dID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gb3B0aW9ucyBvYmplY3QgZm9yIGFkZEV2ZW50TGlzdGVuZXIgdGhhdCB0aWVzIHRoZSBsaXN0ZW5lclxuICAgICAqIHRvIHRoZSBBYm9ydFNpZ25hbCBmcm9tIHRoZSBjdXJyZW50IEFib3J0Q29udHJvbGxlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gQW4gSFRNTCBlbGVtZW50XG4gICAgICogQHBhcmFtIHRyaWdnZXJzIC0gVGhlIGxpc3Qgb2YgYWN0aXZlIFdNTCB0cmlnZ2VyIGV2ZW50cyBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50c1xuICAgICAqL1xuICAgIHNldChlbGVtZW50OiBFbGVtZW50LCB0cmlnZ2Vyczogc3RyaW5nW10pOiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyB7XG4gICAgICAgIHJldHVybiB7IHNpZ25hbDogdGhpc1tjb250cm9sbGVyU3ltXS5zaWduYWwgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycyBhbmQgcmVzZXRzIHRoZSByZWdpc3RyeS5cbiAgICAgKi9cbiAgICByZXNldCgpOiB2b2lkIHtcbiAgICAgICAgdGhpc1tjb250cm9sbGVyU3ltXS5hYm9ydCgpO1xuICAgICAgICB0aGlzW2NvbnRyb2xsZXJTeW1dID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBXZWFrTWFwUmVnaXN0cnkgbWFwcyBhY3RpdmUgdHJpZ2dlciBldmVudHMgdG8gZWFjaCBET00gZWxlbWVudCB0aHJvdWdoIGEgV2Vha01hcC5cbiAqIFRoaXMgZW5zdXJlcyB0aGF0IHRoZSBtYXBwaW5nIHJlbWFpbnMgcHJpdmF0ZSB0byB0aGlzIG1vZHVsZSwgd2hpbGUgc3RpbGwgYWxsb3dpbmcgZ2FyYmFnZVxuICogY29sbGVjdGlvbiBvZiB0aGUgaW52b2x2ZWQgZWxlbWVudHMuXG4gKi9cbmNsYXNzIFdlYWtNYXBSZWdpc3RyeSB7XG4gICAgLyoqIFN0b3JlcyB0aGUgY3VycmVudCBlbGVtZW50LXRvLXRyaWdnZXIgbWFwcGluZy4gKi9cbiAgICBbdHJpZ2dlck1hcFN5bV06IFdlYWtNYXA8RWxlbWVudCwgc3RyaW5nW10+O1xuICAgIC8qKiBDb3VudHMgdGhlIG51bWJlciBvZiBlbGVtZW50cyB3aXRoIGFjdGl2ZSBXTUwgdHJpZ2dlcnMuICovXG4gICAgW2VsZW1lbnRDb3VudFN5bV06IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzW3RyaWdnZXJNYXBTeW1dID0gbmV3IFdlYWtNYXAoKTtcbiAgICAgICAgdGhpc1tlbGVtZW50Q291bnRTeW1dID0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGFjdGl2ZSB0cmlnZ2VycyBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBBbiBIVE1MIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gdHJpZ2dlcnMgLSBUaGUgbGlzdCBvZiBhY3RpdmUgV01MIHRyaWdnZXIgZXZlbnRzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBzZXQoZWxlbWVudDogRWxlbWVudCwgdHJpZ2dlcnM6IHN0cmluZ1tdKTogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMge1xuICAgICAgICBpZiAoIXRoaXNbdHJpZ2dlck1hcFN5bV0uaGFzKGVsZW1lbnQpKSB7IHRoaXNbZWxlbWVudENvdW50U3ltXSsrOyB9XG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcFN5bV0uc2V0KGVsZW1lbnQsIHRyaWdnZXJzKTtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAqL1xuICAgIHJlc2V0KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpc1tlbGVtZW50Q291bnRTeW1dIDw9IDApXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XG4gICAgICAgICAgICBpZiAodGhpc1tlbGVtZW50Q291bnRTeW1dIDw9IDApXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IHRyaWdnZXJzID0gdGhpc1t0cmlnZ2VyTWFwU3ltXS5nZXQoZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAodHJpZ2dlcnMgIT0gbnVsbCkgeyB0aGlzW2VsZW1lbnRDb3VudFN5bV0tLTsgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRyaWdnZXIgb2YgdHJpZ2dlcnMgfHwgW10pXG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRyaWdnZXIsIG9uV01MVHJpZ2dlcmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcFN5bV0gPSBuZXcgV2Vha01hcCgpO1xuICAgICAgICB0aGlzW2VsZW1lbnRDb3VudFN5bV0gPSAwO1xuICAgIH1cbn1cblxuY29uc3QgdHJpZ2dlclJlZ2lzdHJ5ID0gY2FuQWJvcnRMaXN0ZW5lcnMoKSA/IG5ldyBBYm9ydENvbnRyb2xsZXJSZWdpc3RyeSgpIDogbmV3IFdlYWtNYXBSZWdpc3RyeSgpO1xuXG4vKipcbiAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYWRkV01MTGlzdGVuZXJzKGVsZW1lbnQ6IEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCB0cmlnZ2VyUmVnRXhwID0gL1xcUysvZztcbiAgICBjb25zdCB0cmlnZ2VyQXR0ciA9IChlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLXRyaWdnZXInKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS13bWwtdHJpZ2dlcicpIHx8IFwiY2xpY2tcIik7XG4gICAgY29uc3QgdHJpZ2dlcnM6IHN0cmluZ1tdID0gW107XG5cbiAgICBsZXQgbWF0Y2g7XG4gICAgd2hpbGUgKChtYXRjaCA9IHRyaWdnZXJSZWdFeHAuZXhlYyh0cmlnZ2VyQXR0cikpICE9PSBudWxsKVxuICAgICAgICB0cmlnZ2Vycy5wdXNoKG1hdGNoWzBdKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0cmlnZ2VyUmVnaXN0cnkuc2V0KGVsZW1lbnQsIHRyaWdnZXJzKTtcbiAgICBmb3IgKGNvbnN0IHRyaWdnZXIgb2YgdHJpZ2dlcnMpXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0cmlnZ2VyLCBvbldNTFRyaWdnZXJlZCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogU2NoZWR1bGVzIGFuIGF1dG9tYXRpYyByZWxvYWQgb2YgV01MIHRvIGJlIHBlcmZvcm1lZCBhcyBzb29uIGFzIHRoZSBkb2N1bWVudCBpcyBmdWxseSBsb2FkZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbmFibGUoKTogdm9pZCB7XG4gICAgd2hlblJlYWR5KFJlbG9hZCk7XG59XG5cbi8qKlxuICogUmVsb2FkcyB0aGUgV01MIHBhZ2UgYnkgYWRkaW5nIG5lY2Vzc2FyeSBldmVudCBsaXN0ZW5lcnMgYW5kIGJyb3dzZXIgbGlzdGVuZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gUmVsb2FkKCk6IHZvaWQge1xuICAgIHRyaWdnZXJSZWdpc3RyeS5yZXNldCgpO1xuICAgIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbCgnW3dtbC1ldmVudF0sIFt3bWwtd2luZG93XSwgW3dtbC1vcGVudXJsXSwgW2RhdGEtd21sLWV2ZW50XSwgW2RhdGEtd21sLXdpbmRvd10sIFtkYXRhLXdtbC1vcGVudXJsXScpLmZvckVhY2goYWRkV01MTGlzdGVuZXJzKTtcbn1cbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKipcbiAqIEdvU3RyZWFtIOKAlCB0aGUgV2ViU29ja2V0IHByb2dyYW1taW5nIG1vZGVsIHdpdGhvdXQgYSBsaXN0ZW5pbmcgc29ja2V0LlxuICpcbiAqIEEgV2ViU29ja2V0IGNhbm5vdCBiZSBzcG9rZW4gb3ZlciBhIGN1c3RvbSBVUkwgc2NoZW1lLCBzbyBnZXR0aW5nIG9uZSBpbnNpZGVcbiAqIGEgd2VidmlldyBtZWFucyBiaW5kaW5nIGEgcmVhbCBUQ1AgcG9ydC4gVGhpcyBzcGVha3MgdGhlIHNhbWUgc2hhcGUgb3ZlciB0aGVcbiAqIGFzc2V0IHNlcnZlciB0aGUgYXBwIGFscmVhZHkgc2VydmVzOiBHb+KGkkpTIG92ZXIgb25lIGhlbGQgcG9sbCBwZXIgcGFnZSwgSlPihpJHb1xuICogb3ZlciBhIG5vcm1hbCBQT1NULlxuICpcbiAqIHtAbGluayBTdHJlYW19IHJldHVybnMgc3luY2hyb25vdXNseSB3aXRoIGByZWFkeVN0YXRlID09PSBDT05ORUNUSU5HYCwgdGhlIHdheVxuICogYG5ldyBXZWJTb2NrZXQodXJsKWAgZG9lcywgc28gYSBjb25uZWN0aW9uIGNhbiBiZSBjcmVhdGVkIGF0IG1vZHVsZSBzY29wZTpcbiAqXG4gKiBgYGBqc1xuICogZXhwb3J0IGNvbnN0IFRlbGVtZXRyeSA9IFN0cmVhbShcInRlbGVtZXRyeVwiKTsgICAvLyBjb25uZWN0cyBpbiB0aGUgYmFja2dyb3VuZFxuICogYGBgXG4gKi9cblxuaW1wb3J0IHsgbmFub2lkIH0gZnJvbSBcIi4vbmFub2lkLmpzXCI7XG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xuXG4vLyBFdmVyeSBwaWVjZSBvZiBzdGF0ZSB0aGF0IHR3byBydW50aW1lIGluc3RhbmNlcyBtdXN0IGFncmVlIG9uIGxpdmVzIGhlcmUsIG9uXG4vLyB3aW5kb3csIG5vdCBpbiBtb2R1bGUgc2NvcGUuIFRoZSBydW50aW1lIGNhbiBiZSBldmFsdWF0ZWQgbW9yZSB0aGFuIG9uY2UgaW4gYVxuLy8gcGFnZSDigJQgdGhlIHBsYXRmb3JtIGluamVjdHMgYSBjb3B5IGFuZCBhbiBhcHAgbWF5IGltcG9ydCBpdCB0b28g4oCUIGFuZCBhXG4vLyBwZXItbW9kdWxlIHJlZ2lzdHJ5IG1lYW50IGJvdGggaW5zdGFuY2VzIGFsbG9jYXRlZCBjb25uZWN0aW9uIGlkIDEsIHJhblxuLy8gY29tcGV0aW5nIHBvbGxzIGFnYWluc3Qgb25lIHNlc3Npb24sIGFuZCBkaXNjYXJkZWQgZnJhbWVzIGFkZHJlc3NlZCB0byBpZHNcbi8vIG9ubHkgdGhlIG90aGVyIGluc3RhbmNlIGtuZXcgYWJvdXQuIFRoZSBzZXNzaW9uIGlkIGFsb25lIHdhcyBub3QgZW5vdWdoLlxuaW50ZXJmYWNlIFN0cmVhbUdsb2JhbHMge1xuICAgIHNlc3Npb246IHN0cmluZztcbiAgICBnZW5lcmF0aW9uOiBudW1iZXI7XG4gICAgbmV4dENvbm5JRDogbnVtYmVyO1xuICAgIGNvbm5lY3Rpb25zOiBNYXA8bnVtYmVyLCBXYWlsc1NvY2tldD47XG4gICAgcG9sbGluZzogYm9vbGVhbjtcbiAgICBwb2xsQWJvcnQ/OiBBYm9ydENvbnRyb2xsZXI7XG59XG5cbmNvbnN0IEdFTkVSQVRJT05fS0VZID0gXCJfX3dhaWxzX3N0cmVhbV9nZW5lcmF0aW9uXCI7XG5jb25zdCBHRU5FUkFUSU9OX05BTUVfTUFSS0VSID0gXCJcXHUwMDFmX193YWlsc19zdHJlYW1fZ2VuZXJhdGlvbl9fOlwiO1xuXG4vLyB3aW5kb3cubmFtZSBiZWxvbmdzIHRvIHRoZSBicm93c2luZyBjb250ZXh0IHJhdGhlciB0aGFuIHRoZSBEb2N1bWVudCwgc28gaXRcbi8vIHN1cnZpdmVzIGEgcmVsb2FkIGV2ZW4gd2hlbiBXZWIgU3RvcmFnZSBpcyBkaXNhYmxlZC4gUHJlc2VydmUgYW55IG5hbWUgdGhlXG4vLyBhcHBsaWNhdGlvbiBhc3NpZ25lZCBhbmQgcmVzZXJ2ZSBvbmx5IGEgc3VmZml4IGZvciB0aGUgU3RyZWFtIGdlbmVyYXRpb24uXG5mdW5jdGlvbiBuYW1lZFBhZ2VHZW5lcmF0aW9uKCk6IG51bWJlciB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWFya2VyID0gd2luZG93Lm5hbWUubGFzdEluZGV4T2YoR0VORVJBVElPTl9OQU1FX01BUktFUik7XG4gICAgICAgIGlmIChtYXJrZXIgPCAwKSByZXR1cm4gMDtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBOdW1iZXIod2luZG93Lm5hbWUuc2xpY2UobWFya2VyICsgR0VORVJBVElPTl9OQU1FX01BUktFUi5sZW5ndGgpKTtcbiAgICAgICAgcmV0dXJuIE51bWJlci5pc1NhZmVJbnRlZ2VyKHZhbHVlKSAmJiB2YWx1ZSA+IDAgPyB2YWx1ZSA6IDA7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtZW1iZXJOYW1lZFBhZ2VHZW5lcmF0aW9uKGdlbmVyYXRpb246IG51bWJlcik6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1hcmtlciA9IHdpbmRvdy5uYW1lLmxhc3RJbmRleE9mKEdFTkVSQVRJT05fTkFNRV9NQVJLRVIpO1xuICAgICAgICBjb25zdCBhcHBsaWNhdGlvbk5hbWUgPSBtYXJrZXIgPCAwID8gd2luZG93Lm5hbWUgOiB3aW5kb3cubmFtZS5zbGljZSgwLCBtYXJrZXIpO1xuICAgICAgICB3aW5kb3cubmFtZSA9IGFwcGxpY2F0aW9uTmFtZSArIEdFTkVSQVRJT05fTkFNRV9NQVJLRVIgKyBnZW5lcmF0aW9uO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBTb21lIGVtYmVkZGVkIGJyb3dzZXIgcG9saWNpZXMgY2FuIGRlbnkgYWNjZXNzIHRvIHRoZSBicm93c2luZ1xuICAgICAgICAvLyBjb250ZXh0IG5hbWUuIFRoZSB0aW1lIG9yaWdpbiByZW1haW5zIHRoZSBsYXN0LXJlc29ydCBmYWxsYmFjay5cbiAgICB9XG59XG5cbi8vIFJlcXVlc3QgYXJyaXZhbCBvcmRlciBpcyBub3QgcGFnZSBvcmRlcjogYSByZXF1ZXN0IHN0YXJ0ZWQganVzdCBiZWZvcmUgYVxuLy8gbmF2aWdhdGlvbiBjYW4gcmVhY2ggR28gYWZ0ZXIgdGhlIHJlcGxhY2VtZW50IHBhZ2UncyBmaXJzdCByZXF1ZXN0LiBLZWVwIGFcbi8vIG1vbm90b25pYyBjb3VudGVyIGluIHRoaXMgdG9wLWxldmVsIGJyb3dzaW5nIGNvbnRleHQgc28gR28gY2FuIGRpc3Rpbmd1aXNoXG4vLyB0aG9zZSBwYWdlIGluY2FybmF0aW9ucyB3aXRob3V0IHRydXN0aW5nIHNlcnZlciBzY2hlZHVsaW5nIG9yZGVyLlxuZnVuY3Rpb24gbmV4dFBhZ2VHZW5lcmF0aW9uKCk6IG51bWJlciB7XG4gICAgaWYgKCFoYXNET00pIHJldHVybiAxO1xuICAgIC8vIEFuY2hvciB0aGUgdmFsdWUgdG8gdGhlIHBhZ2UncyBjcmVhdGlvbiB0aW1lIGFzIHdlbGwgYXMgdGhlIHN0b3JlZFxuICAgIC8vIGNvdW50ZXIuIElmIGFwcGxpY2F0aW9uIGNvZGUgY2xlYXJzIHNlc3Npb25TdG9yYWdlLCB0aGUgbmV4dCByZWxvYWQgbXVzdFxuICAgIC8vIHN0aWxsIGJlIG5ld2VyIHRoYW4gdGhlIGdlbmVyYXRpb24gR28gaGFzIGFscmVhZHkgcmV0aXJlZDsgcmVzdGFydGluZ1xuICAgIC8vIGZyb20gMSB3b3VsZCBtYWtlIGV2ZXJ5IHN0cmVhbSByZXF1ZXN0IHJlY2VpdmUgNDEwIHVudGlsIHRoZSBob3N0IGV4aXRzLlxuICAgIC8vIFBlcmZvcm1hbmNlLnRpbWVPcmlnaW4gaXMgYWJzZW50IG9uIG9sZGVyIFdlYktpdCByZWxlYXNlcyB0aGF0IFdhaWxzXG4gICAgLy8gc3RpbGwgdGFyZ2V0cy4gRGF0ZS5ub3cga2VlcHMgdGhvc2UgZW5naW5lcyBvbiB0aGUgcHJvdG9jb2w7IHRoZSBzdG9yZWRcbiAgICAvLyBjb3VudGVyIGRpc2FtYmlndWF0ZXMgcmVsb2FkcyB0aGF0IGhhcHBlbiB3aXRoaW4gdGhlIHNhbWUgbWlsbGlzZWNvbmQuXG4gICAgY29uc3Qgb3JpZ2luID0gdHlwZW9mIHBlcmZvcm1hbmNlICE9PSBcInVuZGVmaW5lZFwiICYmIE51bWJlci5pc0Zpbml0ZShwZXJmb3JtYW5jZS50aW1lT3JpZ2luKVxuICAgICAgICA/IHBlcmZvcm1hbmNlLnRpbWVPcmlnaW5cbiAgICAgICAgOiBEYXRlLm5vdygpO1xuICAgIGNvbnN0IHBhZ2VUaW1lID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihvcmlnaW4gKiAxMDAwKSk7XG4gICAgbGV0IGN1cnJlbnQgPSBuYW1lZFBhZ2VHZW5lcmF0aW9uKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oR0VORVJBVElPTl9LRVkpO1xuICAgICAgICBjb25zdCBzdG9yZWQgPSByYXcgPT09IG51bGwgPyAwIDogTnVtYmVyKHJhdyk7XG4gICAgICAgIGlmIChOdW1iZXIuaXNTYWZlSW50ZWdlcihzdG9yZWQpICYmIHN0b3JlZCA+IGN1cnJlbnQpIGN1cnJlbnQgPSBzdG9yZWQ7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIFN0b3JhZ2UgY2FuIGJlIGRpc2FibGVkIGJ5IHBvbGljeS4gd2luZG93Lm5hbWUgc3VwcGxpZXMgdGhlXG4gICAgICAgIC8vIGJyb3dzaW5nLWNvbnRleHQgY291bnRlciBpbiB0aGF0IGNhc2UuXG4gICAgfVxuXG4gICAgY29uc3QgbmV4dCA9IE51bWJlci5pc1NhZmVJbnRlZ2VyKGN1cnJlbnQpICYmIGN1cnJlbnQgPj0gMCAmJiBjdXJyZW50IDwgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcbiAgICAgICAgPyBNYXRoLm1heChjdXJyZW50ICsgMSwgcGFnZVRpbWUpXG4gICAgICAgIDogcGFnZVRpbWU7XG4gICAgdHJ5IHtcbiAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oR0VORVJBVElPTl9LRVksIFN0cmluZyhuZXh0KSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIFRoZSBicm93c2luZy1jb250ZXh0IGZhbGxiYWNrIGJlbG93IGlzIHN1ZmZpY2llbnQgd2hlbiBzdG9yYWdlIGlzXG4gICAgICAgIC8vIHVuYXZhaWxhYmxlLlxuICAgIH1cbiAgICByZW1lbWJlck5hbWVkUGFnZUdlbmVyYXRpb24obmV4dCk7XG4gICAgcmV0dXJuIG5leHQ7XG59XG5cbmZ1bmN0aW9uIHN0cmVhbUdsb2JhbHMoKTogU3RyZWFtR2xvYmFscyB7XG4gICAgY29uc3QgZnJlc2ggPSAoKTogU3RyZWFtR2xvYmFscyA9PiAoe1xuICAgICAgICBzZXNzaW9uOiBuYW5vaWQoKSxcbiAgICAgICAgZ2VuZXJhdGlvbjogbmV4dFBhZ2VHZW5lcmF0aW9uKCksXG4gICAgICAgIG5leHRDb25uSUQ6IDEsXG4gICAgICAgIGNvbm5lY3Rpb25zOiBuZXcgTWFwPG51bWJlciwgV2FpbHNTb2NrZXQ+KCksXG4gICAgICAgIHBvbGxpbmc6IGZhbHNlLFxuICAgIH0pO1xuICAgIGlmICghaGFzRE9NKSByZXR1cm4gZnJlc2goKTtcbiAgICBjb25zdCB3ID0gKHdpbmRvdyBhcyBhbnkpLl93YWlscyA9ICh3aW5kb3cgYXMgYW55KS5fd2FpbHMgfHwge307XG4gICAgcmV0dXJuICh3Ll9fc3RyZWFtID0gdy5fX3N0cmVhbSB8fCBmcmVzaCgpKTtcbn1cblxuY29uc3QgRyA9IHN0cmVhbUdsb2JhbHMoKTtcblxuY29uc3QgSERSX1NFU1NJT04gPSBcIngtd2FpbHMtc3RyZWFtLXNlc3Npb25cIjtcbmNvbnN0IEhEUl9HRU5FUkFUSU9OID0gXCJ4LXdhaWxzLXN0cmVhbS1nZW5lcmF0aW9uXCI7XG5jb25zdCBIRFJfQ09OTiA9IFwieC13YWlscy1zdHJlYW0tY29ublwiO1xuY29uc3QgSERSX0tJTkQgPSBcIngtd2FpbHMtc3RyZWFtLWtpbmRcIjtcbmNvbnN0IEhEUl9OQU1FID0gXCJ4LXdhaWxzLXN0cmVhbS1uYW1lXCI7XG5jb25zdCBIRFJfQ0hVTksgPSBcIngtd2FpbHMtc3RyZWFtLWNodW5rXCI7XG5jb25zdCBIRFJfQ0hVTktfSU5ERVggPSBcIngtd2FpbHMtc3RyZWFtLWNodW5rLWluZGV4XCI7XG5jb25zdCBIRFJfQ0hVTktfVE9UQUwgPSBcIngtd2FpbHMtc3RyZWFtLWNodW5rLXRvdGFsXCI7XG5jb25zdCBIRFJfQkFUQ0ggPSBcIngtd2FpbHMtc3RyZWFtLWJhdGNoXCI7XG5cbmNvbnN0IEtJTkRfREFUQSA9IDA7XG5jb25zdCBLSU5EX09QRU4gPSAxO1xuY29uc3QgS0lORF9DTE9TRSA9IDI7XG5jb25zdCBLSU5EX0VSUk9SID0gMztcblxuLy8gTWF0Y2hlcyB0aGUgcnVudGltZSdzIG93biBsaW1pdDogc3RheSB1bmRlciBXZWJWaWV3MidzIH4yTUIgcmVxdWVzdCBib2R5XG4vLyBidWZmZXJpbmcgbGltaXQgaW4gV2ViUmVzb3VyY2VSZXF1ZXN0ZWQuXG5jb25zdCBDSFVOS19USFJFU0hPTEQgPSA1MTIgKiAxMDI0O1xuY29uc3QgTUFYX0JBVENIX0ZSQU1FUyA9IDQwOTY7XG5cbi8vIEJhY2tvZmYgZmxvb3IgYW5kIGNlaWxpbmcgZm9yIGEgZmFpbGluZyBwb2xsLiBUaGlzIGlzIHRoZSBcInJlYXNvbmFibGUgbG93ZXJcbi8vIGxpbWl0XCIgb24gcG9sbGluZyDigJQgYW4gZXJyb3IgYmFja29mZiwgbm90IGEgc3RlYWR5LXN0YXRlIGludGVydmFsLiBJbiBub3JtYWxcbi8vIG9wZXJhdGlvbiB0aGUgcG9sbCByZS1pc3N1ZXMgaW1tZWRpYXRlbHksIGJlY2F1c2UgdGhlIHNlcnZlciBob2xkIGhhcyBhbHJlYWR5XG4vLyBwcm92aWRlZCB3aGF0ZXZlciBkZWxheSB3YXMgYXBwcm9wcmlhdGUuXG5jb25zdCBCQUNLT0ZGX01JTiA9IDI1MDtcbmNvbnN0IEJBQ0tPRkZfTUFYID0gNTAwMDtcbmNvbnN0IHRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5cbmZ1bmN0aW9uIHN0cmVhbVVSTChlbmRwb2ludDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIFwiL3dhaWxzL3N0cmVhbS9cIiArIGVuZHBvaW50O1xufVxuXG5cbmNsYXNzIFN0cmVhbVJlcXVlc3RDYW5jZWxsZWQgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKFwic3RyZWFtIHJlcXVlc3QgY2FuY2VsbGVkXCIpO1xuICAgICAgICB0aGlzLm5hbWUgPSBcIkFib3J0RXJyb3JcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNsZWVwKG1zOiBudW1iZXIsIHNpZ25hbD86IEFib3J0U2lnbmFsKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFzaWduYWwpIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuICAgIGlmIChzaWduYWwuYWJvcnRlZCkgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBTdHJlYW1SZXF1ZXN0Q2FuY2VsbGVkKCkpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgb25BYm9ydCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICByZWplY3QobmV3IFN0cmVhbVJlcXVlc3RDYW5jZWxsZWQoKSk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIG9uQWJvcnQpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9LCBtcyk7XG4gICAgICAgIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEEgc3RyZWFtIGNvbm5lY3Rpb24uIEltcGxlbWVudHMgdGhlIHVzZWZ1bCBzdWJzZXQgb2YgdGhlIGBXZWJTb2NrZXRgXG4gKiBpbnRlcmZhY2UsIHNvIHRoZSBzYW1lIGFwcGxpY2F0aW9uIGNvZGUgd29ya3MgYWdhaW5zdCBhIHJlYWwgV2ViU29ja2V0IGluXG4gKiBzZXJ2ZXIgYnVpbGRzLlxuICpcbiAqIE9uZSBkZWxpYmVyYXRlIGRpdmVyZ2VuY2UgZnJvbSB0aGUgc3RhbmRhcmQ6IGBiaW5hcnlUeXBlYCBkZWZhdWx0cyB0b1xuICogYFwiYXJyYXlidWZmZXJcImAgcmF0aGVyIHRoYW4gYFwiYmxvYlwiYCwgYmVjYXVzZSBzdHJlYW0gZnJhbWVzIGFyZSBhbHdheXNcbiAqIGJpbmFyeSBhbmQgYSBCbG9iIHdvdWxkIGZvcmNlIGFuIGV4dHJhIGFzeW5jIGhvcCB0byByZWFkIGV2ZXJ5IG1lc3NhZ2UuXG4gKiBTZXR0aW5nIGl0IHRvIGBcImJsb2JcImAgYmVoYXZlcyBhcyB0aGUgc3RhbmRhcmQgZGVzY3JpYmVzLlxuICovXG5leHBvcnQgY2xhc3MgV2FpbHNTb2NrZXQgZXh0ZW5kcyBFdmVudFRhcmdldCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IENPTk5FQ1RJTkcgPSAwO1xuICAgIHN0YXRpYyByZWFkb25seSBPUEVOID0gMTtcbiAgICBzdGF0aWMgcmVhZG9ubHkgQ0xPU0lORyA9IDI7XG4gICAgc3RhdGljIHJlYWRvbmx5IENMT1NFRCA9IDM7XG5cbiAgICByZWFkb25seSBDT05ORUNUSU5HID0gMDtcbiAgICByZWFkb25seSBPUEVOID0gMTtcbiAgICByZWFkb25seSBDTE9TSU5HID0gMjtcbiAgICByZWFkb25seSBDTE9TRUQgPSAzO1xuXG4gICAgLyoqIFRoZSBzdHJlYW0gbmFtZSB0aGlzIGNvbm5lY3Rpb24gd2FzIG9wZW5lZCBhZ2FpbnN0LiAqL1xuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgICByZWFkb25seSB1cmw6IHN0cmluZztcblxuICAgIC8qKiBBbHdheXMgZW1wdHk6IHN1YnByb3RvY29scyBhbmQgZXh0ZW5zaW9ucyBhcmUgbm90IG5lZ290aWF0ZWQuICovXG4gICAgcmVhZG9ubHkgcHJvdG9jb2wgPSBcIlwiO1xuICAgIHJlYWRvbmx5IGV4dGVuc2lvbnMgPSBcIlwiO1xuXG4gICAgYmluYXJ5VHlwZTogXCJhcnJheWJ1ZmZlclwiIHwgXCJibG9iXCIgPSBcImFycmF5YnVmZmVyXCI7XG4gICAgcmVhZHlTdGF0ZTogbnVtYmVyID0gV2FpbHNTb2NrZXQuQ09OTkVDVElORztcblxuICAgIC8vIERlY2xhcmVkIGZvciB0aGUgdHlwZTsgdGhlIGNvbnN0cnVjdG9yIHJlcGxhY2VzIGVhY2ggd2l0aCBhbiBhY2Nlc3NvclxuICAgIC8vIHRoYXQgcmVnaXN0ZXJzIGEgcmVhbCBsaXN0ZW5lci4gQ2FsbGluZyB0aGVtIGRpcmVjdGx5IGluc3RlYWQgd291bGQgbWFrZVxuICAgIC8vIGFueSB3cmFwcGVyIChzZWUgSlNPTlN0cmVhbSkgcmVjZWl2ZSBib3RoIHRoZSByYXcgYW5kIHRoZSBkZWNvZGVkIGV2ZW50LlxuICAgIG9ub3BlbjogKChldjogRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgb25tZXNzYWdlOiAoKGV2OiBNZXNzYWdlRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgb25jbG9zZTogKChldjogQ2xvc2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBvbmVycm9yOiAoKGV2OiBFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbCBBcHBsaWVkIHRvIGV2ZXJ5IGluYm91bmQgcGF5bG9hZCBiZWZvcmUgZGlzcGF0Y2guIEpTT05TdHJlYW1cbiAgICAgKiByZXBsYWNlcyBpdCwgc28gYG9ubWVzc2FnZWAgYW5kIGBhZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCDigKYpYCBzZWUgdGhlXG4gICAgICogc2FtZSBkZWNvZGVkIHZhbHVlIOKAlCBpbnRlcmNlcHRpbmcgb25seSBgb25tZXNzYWdlYCBtYWRlIHRoZSB0d28gZGlzYWdyZWUuXG4gICAgICovXG4gICAgX2RlY29kZTogKHBheWxvYWQ6IEFycmF5QnVmZmVyKSA9PiB1bmtub3duID0gKHBheWxvYWQpID0+IHBheWxvYWQ7XG5cbiAgICAvKiogQGludGVybmFsICovIHJlYWRvbmx5IF9pZDogbnVtYmVyO1xuICAgIHByaXZhdGUgX2J1ZmZlcmVkID0gMDtcbiAgICAvLyBTZW5kcyBhcmUgc2VyaWFsaXNlZCBwZXIgY29ubmVjdGlvbjogY29uY3VycmVudCBmZXRjaCgpIFBPU1RzIGRvIG5vdFxuICAgIC8vIHByZXNlcnZlIG9yZGVyLCBhbmQgR28gcmVsaWVzIG9uIHNlbmQgb3JkZXIgYmVpbmcgdGhlIG9yZGVyIGl0IG9ic2VydmVzLlxuICAgIHByaXZhdGUgX2NoYWluOiBQcm9taXNlPHZvaWQ+ID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgcHJpdmF0ZSBfcGVuZGluZzogUHJvbWlzZTxVaW50OEFycmF5PltdID0gW107XG4gICAgcHJpdmF0ZSBfZmx1c2hpbmcgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9vcGVuQWJvcnQgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgcHJpdmF0ZSBfc2VuZEFib3J0ID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuXG4gICAgLyoqIEJ5dGVzIHF1ZXVlZCBieSBzZW5kKCkgdGhhdCBoYXZlIG5vdCB5ZXQgcmVhY2hlZCBHby4gKi9cbiAgICBnZXQgYnVmZmVyZWRBbW91bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1ZmZlcmVkO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLl9pZCA9IEcubmV4dENvbm5JRCsrO1xuICAgICAgICB0aGlzLnVybCA9IGhhc0RPTSA/IHN0cmVhbVVSTChcInBvbGxcIikgKyBcIiNcIiArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSA6IFwiXCI7XG5cbiAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIFtcIm9wZW5cIiwgXCJtZXNzYWdlXCIsIFwiY2xvc2VcIiwgXCJlcnJvclwiXSkge1xuICAgICAgICAgICAgZGVmaW5lSGFuZGxlclByb3BlcnR5KHRoaXMsIHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgRy5jb25uZWN0aW9ucy5zZXQodGhpcy5faWQsIHRoaXMpO1xuXG4gICAgICAgIC8vIEZpcmUgYW5kIGZvcmdldDogdGhlIGFjayBhcnJpdmVzIGFzIGFuIG9wZW4gZnJhbWUgb24gdGhlIHBvbGwsIHdoaWNoXG4gICAgICAgIC8vIGlzIHdoYXQgbW92ZXMgcmVhZHlTdGF0ZSB0byBPUEVOLlxuICAgICAgICB0aGlzLl9jaGFpbiA9IHRoaXMuX2NoYWluLnRoZW4oKCkgPT5cbiAgICAgICAgICAgIHBvc3RGcmFtZSh0aGlzLl9pZCwgS0lORF9PUEVOLCBuZXcgVWludDhBcnJheSgwKSwgbmFtZSwgdGhpcy5fb3BlbkFib3J0LnNpZ25hbClcbiAgICAgICAgKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9mYWlsKGVycik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN0YXJ0UG9sbGluZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBmcmFtZSB0byBHby4gQWNjZXB0cyBhbnl0aGluZyBhIFdlYlNvY2tldCBkb2VzOyBzdHJpbmdzIGFyZVxuICAgICAqIGVuY29kZWQgYXMgVVRGLTgsIHNpbmNlIEdvIHJlY2VpdmVzIGV2ZXJ5IGZyYW1lIGFzIGEgYnl0ZSBzbGljZS5cbiAgICAgKi9cbiAgICBzZW5kKGRhdGE6IHN0cmluZyB8IEFycmF5QnVmZmVyTGlrZSB8IEFycmF5QnVmZmVyVmlldyB8IEJsb2IpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gV2FpbHNTb2NrZXQuQ09OTkVDVElORykge1xuICAgICAgICAgICAgLy8gTWF0Y2hlcyB0aGUgV2ViU29ja2V0IHNwZWNpZmljYXRpb24uXG4gICAgICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFwiU3RpbGwgaW4gQ09OTkVDVElORyBzdGF0ZS5cIiwgXCJJbnZhbGlkU3RhdGVFcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBXYWlsc1NvY2tldC5PUEVOKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIG5vdyByYXRoZXIgdGhhbiBpbnNpZGUgdGhlIGNoYWluLiBNdXRhYmxlIGJpbmFyeSBpbnB1dHMgYXJlXG4gICAgICAgIC8vIGNvcGllZCBzeW5jaHJvbm91c2x5IHNvIHNlbmQoKSBzbmFwc2hvdHMgdGhlaXIgYnl0ZXMgbGlrZSBhIG5hdGl2ZVxuICAgICAgICAvLyBXZWJTb2NrZXQsIGV2ZW4gd2hlbiBhIGJhdGNoIHdhaXRzIGJlaGluZCBhbiBpbi1mbGlnaHQgcmVxdWVzdC4gQVxuICAgICAgICAvLyBCbG9iIGlzIGltbXV0YWJsZSBhbmQgaXMgdGhlcmVmb3JlIHNhZmUgdG8gcmVhZCBhc3luY2hyb25vdXNseSBvbmNlLlxuICAgICAgICBjb25zdCBpbW1lZGlhdGUgPSB0b0J5dGVzU3luYyhkYXRhKTtcbiAgICAgICAgY29uc3Qgc25hcHNob3QgPSBpbW1lZGlhdGVcbiAgICAgICAgICAgID8gUHJvbWlzZS5yZXNvbHZlKGltbWVkaWF0ZSlcbiAgICAgICAgICAgIDogdG9CeXRlcyhkYXRhLCB0aGlzLl9zZW5kQWJvcnQuc2lnbmFsKTtcbiAgICAgICAgLy8gY2xvc2UoKSBtYXkgZGlzY2FyZCB0aGlzIHByb21pc2UgYmVmb3JlIHRoZSBmbHVzaCBoYXMgZGVxdWV1ZWQgaXQuXG4gICAgICAgIC8vIEF0dGFjaCBhIHJlamVjdGlvbiBvYnNlcnZlciBpbW1lZGlhdGVseSBzbyBjYW5jZWxsaW5nIGFuIGFzeW5jaHJvbm91c1xuICAgICAgICAvLyBCbG9iIHJlYWQgY2Fubm90IGJlY29tZSBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uOyBQcm9taXNlLmFsbCBzdGlsbFxuICAgICAgICAvLyBvYnNlcnZlcyB0aGUgb3JpZ2luYWwgcmVqZWN0aW9uIHdoZW4gdGhlIGZsdXNoIGFscmVhZHkgb3ducyBpdC5cbiAgICAgICAgdm9pZCBzbmFwc2hvdC5jYXRjaCgoKSA9PiB7fSk7XG5cbiAgICAgICAgLy8gQSBCbG9iIGNhbm5vdCBiZSBjb252ZXJ0ZWQgc3luY2hyb25vdXNseSwgYnV0IEJsb2Iuc2l6ZSBpcyBhdmFpbGFibGVcbiAgICAgICAgLy8gbm93LCBzbyBpdHMgYnl0ZXMgYXJlIHN0aWxsIGNvdW50ZWQgdGhlIG1vbWVudCBzZW5kKCkgcmV0dXJucy4gV2FpdGluZ1xuICAgICAgICAvLyBmb3IgYXJyYXlCdWZmZXIoKSB0byByZXNvbHZlIGxldCBhIGxhcmdlIEJsb2Igc2xpcCBwYXN0IGNvZGUgdXNpbmdcbiAgICAgICAgLy8gYnVmZmVyZWRBbW91bnQgZm9yIGJhY2twcmVzc3VyZS5cbiAgICAgICAgY29uc3QgYmxvYlNpemUgPVxuICAgICAgICAgICAgIWltbWVkaWF0ZSAmJiB0eXBlb2YgQmxvYiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgQmxvYiA/IGRhdGEuc2l6ZSA6IDA7XG4gICAgICAgIGlmIChibG9iU2l6ZSkge1xuICAgICAgICAgICAgdGhpcy5fYnVmZmVyZWQgKz0gYmxvYlNpemU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBY2NvdW50IGZvciB0aGUgYnl0ZXMgbm93LCBub3Qgd2hlbiB0aGUgY2hhaW4gcmVhY2hlcyB0aGVtLiBSZXBvcnRpbmdcbiAgICAgICAgLy8gemVybyB3aGlsZSBmcmFtZXMgd2FpdCBiZWhpbmQgYW4gaW4tZmxpZ2h0IGJhdGNoIHdvdWxkIHRlbGwgYW5cbiAgICAgICAgLy8gYXBwbGljYXRpb24gdXNpbmcgYnVmZmVyZWRBbW91bnQgZm9yIGJhY2twcmVzc3VyZSB0aGF0IGl0IG1heSBrZWVwXG4gICAgICAgIC8vIHNlbmRpbmcuXG4gICAgICAgIGlmIChpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlcmVkICs9IGltbWVkaWF0ZS5ieXRlTGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3BlbmRpbmcucHVzaChzbmFwc2hvdCk7XG5cbiAgICAgICAgLy8gUXVldWUgcmF0aGVyIHRoYW4gcG9zdC4gV2hhdGV2ZXIgYWNjdW11bGF0ZXMgd2hpbGUgYSByZXF1ZXN0IGlzIGluXG4gICAgICAgIC8vIGZsaWdodCBnb2VzIG91dCB0b2dldGhlciBpbiB0aGUgbmV4dCBvbmUsIHNvIHRoZSBwZXItcmVxdWVzdCBjb3N0IOKAlFxuICAgICAgICAvLyBhIHNjaGVtZS1oYW5kbGVyIHJvdW5kIHRyaXAsIGFib3V0IGVsZXZlbiBjZ28gY2FsbHMgb24gbWFjT1Mg4oCUIGlzXG4gICAgICAgIC8vIGRpdmlkZWQgYWNyb3NzIHRoZSBiYXRjaC4gVW5kZXIgbGlnaHQgbG9hZCBhIGJhdGNoIGlzIG9uZSBmcmFtZSBhbmRcbiAgICAgICAgLy8gdGhpcyBiZWhhdmVzIGV4YWN0bHkgYXMgYmVmb3JlOyB0aGUgYmF0Y2hpbmcgb25seSBhcHBlYXJzIHdoZW4gdGhlXG4gICAgICAgIC8vIHNlbmRlciBpcyBvdXRydW5uaW5nIHRoZSB0cmFuc3BvcnQsIHdoaWNoIGlzIHdoZW4gaXQgaXMgbmVlZGVkLlxuICAgICAgICBpZiAodGhpcy5fZmx1c2hpbmcpIHJldHVybjtcbiAgICAgICAgdGhpcy5fZmx1c2hpbmcgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuX2NoYWluID0gdGhpcy5fY2hhaW4udGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wZW5kaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQm91bmQgdGhlIHdvcmsgYW5kIHRlbXBvcmFyeSBwcm9taXNlIGFycmF5IGZvciBvbmUgcGFzcy5cbiAgICAgICAgICAgICAgICAgICAgLy8gcG9zdEJhdGNoIGFwcGxpZXMgdGhlIHdpcmUtc2l6ZSBib3VuZCBhZnRlciByZXNvbHV0aW9uLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBxdWV1ZWQgPSB0aGlzLl9wZW5kaW5nLnNwbGljZSgwLCBNQVhfQkFUQ0hfRlJBTUVTKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmF0Y2ggPSBhd2FpdCBQcm9taXNlLmFsbChxdWV1ZWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcmVtb3RlIGNsb3NlIG1heSBhcnJpdmUgd2hpbGUgYSBCbG9iIGlzIGJlaW5nIHJlYWQuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjb25uZWN0aW9uIGlzIGFscmVhZHkgZ29uZSBpbiB0aGF0IGNhc2UsIHNvIGRvIG5vdFxuICAgICAgICAgICAgICAgICAgICAvLyBpc3N1ZSBhIGxhdGUgUE9TVCBmb3IgYnl0ZXMgdGhlIHBlZXIgY2FuIG5vIGxvbmdlciB0YWtlLlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBXYWlsc1NvY2tldC5DTE9TRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG90YWwgPSBiYXRjaC5yZWR1Y2UoKG4sIGIpID0+IG4gKyBiLmJ5dGVMZW5ndGgsIDApO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcG9zdEJhdGNoKHRoaXMuX2lkLCBiYXRjaCwgdGhpcy5fc2VuZEFib3J0LnNpZ25hbCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBfY2xvc2VkIHJlc2V0cyB0aGUgY291bnRlciBpbW1lZGlhdGVseS4gQSByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbHJlYWR5IGluIGZsaWdodCBtYXkgZmluaXNoIGFmdGVyd2FyZHMsIGFuZCBtdXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBub3QgZHJpdmUgYnVmZmVyZWRBbW91bnQgYmVsb3cgemVyby5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2J1ZmZlcmVkID0gTWF0aC5tYXgoMCwgdGhpcy5fYnVmZmVyZWQgLSB0b3RhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZsdXNoaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9mYWlsKGVycik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBDbG9zZSB0aGUgY29ubmVjdGlvbi4gR28ncyBoYW5kbGVyIHNlZXMgUmVjZWl2ZSBmYWlsIGFuZCByZXR1cm5zLiAqL1xuICAgIGNsb3NlKGNvZGU6IG51bWJlciA9IDEwMDAsIHJlYXNvbjogc3RyaW5nID0gXCJcIik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBXYWlsc1NvY2tldC5DTE9TSU5HIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gV2FpbHNTb2NrZXQuQ0xPU0VEKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gV2FpbHNTb2NrZXQuQ0xPU0lORztcbiAgICAgICAgdGhpcy5fcGVuZGluZy5sZW5ndGggPSAwO1xuICAgICAgICB0aGlzLl9idWZmZXJlZCA9IDA7XG4gICAgICAgIHRoaXMuX29wZW5BYm9ydC5hYm9ydCgpO1xuXG4gICAgICAgIC8vIEEgZGF0YSBmcmFtZSB3YWl0aW5nIGZvciByZWNlaXZlciBjYXBhY2l0eSBtdXN0IG5vdCBwcmV2ZW50IHRoZVxuICAgICAgICAvLyByZXNlcnZlZCBjbG9zZSBjb250cm9sIGZyb20gZXZlciByZWFjaGluZyBHby4gQ2FuY2VsIG9ubHkgdGhlIGRhdGFcbiAgICAgICAgLy8gcmV0cnkgcGF0aDsgdGhlIGNoYWluIGJlbG93IHN0aWxsIG9yZGVycyB0aGUgY2xvc2UgYWZ0ZXIgdGhhdCBwYXRoXG4gICAgICAgIC8vIGhhcyB1bndvdW5kLCBwcmVzZXJ2aW5nIG5vcm1hbCBzZW5kLWJlZm9yZS1jbG9zZSBvcmRlcmluZy5cbiAgICAgICAgdGhpcy5fc2VuZEFib3J0LmFib3J0KCk7XG4gICAgICAgIHRoaXMuX2NoYWluID0gdGhpcy5fY2hhaW4udGhlbigoKSA9PlxuICAgICAgICAgICAgcG9zdEZyYW1lKHRoaXMuX2lkLCBLSU5EX0NMT1NFLCBuZXcgVWludDhBcnJheSgwKSlcbiAgICAgICAgKS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAvLyBUaGUgcGVlciBpcyBhbHJlYWR5IGdvbmU7IHRoZSBsb2NhbCBjbG9zZSBiZWxvdyBpcyB3aGF0IG1hdHRlcnMuXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fY2xvc2VkKGNvZGUsIHJlYXNvbiwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgQ2FsbGVkIHdoZW4gdGhlIG9wZW4gZnJhbWUgY29tZXMgYmFjayBmcm9tIEdvLiAqL1xuICAgIF9vcGVuZWQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IFdhaWxzU29ja2V0LkNPTk5FQ1RJTkcpIHJldHVybjtcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gV2FpbHNTb2NrZXQuT1BFTjtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcIm9wZW5cIikpO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgQ2FsbGVkIGZvciBlYWNoIGRhdGEgZnJhbWUgYWRkcmVzc2VkIHRvIHRoaXMgY29ubmVjdGlvbi4gKi9cbiAgICBfbWVzc2FnZShwYXlsb2FkOiBBcnJheUJ1ZmZlcik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBXYWlsc1NvY2tldC5PUEVOKSByZXR1cm47XG4gICAgICAgIGxldCBkYXRhOiB1bmtub3duO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGF0YSA9IHRoaXMuX2RlY29kZShwYXlsb2FkKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiZXJyb3JcIikpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhID09PSBwYXlsb2FkICYmIHRoaXMuYmluYXJ5VHlwZSA9PT0gXCJibG9iXCIpIHtcbiAgICAgICAgICAgIGRhdGEgPSBuZXcgQmxvYihbcGF5bG9hZF0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgTWVzc2FnZUV2ZW50KFwibWVzc2FnZVwiLCB7IGRhdGEgfSkpO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBfZmFpbChlcnI6IHVua25vd24pOiB2b2lkIHtcbiAgICAgICAgLy8gQW4gaW4tZmxpZ2h0IHNlbmQgY2FuIHJlamVjdCBhZnRlciBhIGNsZWFuIGNsb3NlIGhhcyBhbHJlYWR5IGFycml2ZWQuXG4gICAgICAgIC8vIFRoZSBzb2NrZXQncyBsaWZlY3ljbGUgaXMgY29tcGxldGUgdGhlbjogZW1pdHRpbmcgZXJyb3IgYWZ0ZXIgY2xvc2VcbiAgICAgICAgLy8gcmV2ZXJzZXMgdGhlIFdlYlNvY2tldCBldmVudCBvcmRlciBhbmQgcmVwb3J0cyBhIGZhbHNlIGZhaWx1cmUuXG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NFRCB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NJTkcpIHJldHVybjtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImVycm9yXCIpKTtcbiAgICAgICAgLy8gMTAwNjogY2xvc2VkIGFibm9ybWFsbHksIG5vIGNsb3NlIGZyYW1lLiBTYW1lIGNvZGUgYSByZWFsIFdlYlNvY2tldFxuICAgICAgICAvLyByZXBvcnRzIHdoZW4gdGhlIGNvbm5lY3Rpb24gZHJvcHMgd2l0aG91dCBhIGhhbmRzaGFrZS5cbiAgICAgICAgdGhpcy5fY2xvc2VkKDEwMDYsIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSwgZmFsc2UpO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBfY2xvc2VkKGNvZGU6IG51bWJlciwgcmVhc29uOiBzdHJpbmcsIHdhc0NsZWFuOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdhaWxzU29ja2V0LkNMT1NFRCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBXYWlsc1NvY2tldC5DTE9TRUQ7XG4gICAgICAgIHRoaXMuX29wZW5BYm9ydC5hYm9ydCgpO1xuICAgICAgICB0aGlzLl9zZW5kQWJvcnQuYWJvcnQoKTtcbiAgICAgICAgRy5jb25uZWN0aW9ucy5kZWxldGUodGhpcy5faWQpO1xuICAgICAgICBpZiAoRy5jb25uZWN0aW9ucy5zaXplID09PSAwKSBHLnBvbGxBYm9ydD8uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5fcGVuZGluZy5sZW5ndGggPSAwO1xuICAgICAgICB0aGlzLl9idWZmZXJlZCA9IDA7XG5cbiAgICAgICAgY29uc3QgZXYgPSB0eXBlb2YgQ2xvc2VFdmVudCA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICA/IG5ldyBDbG9zZUV2ZW50KFwiY2xvc2VcIiwgeyBjb2RlLCByZWFzb24sIHdhc0NsZWFuIH0pXG4gICAgICAgICAgICA6IE9iamVjdC5hc3NpZ24obmV3IEV2ZW50KFwiY2xvc2VcIiksIHsgY29kZSwgcmVhc29uLCB3YXNDbGVhbiB9KSBhcyBDbG9zZUV2ZW50O1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXYpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDb25uZWN0IHRvIGEgc3RyZWFtIGRlY2xhcmVkIGluIEdvIHdpdGggYGFwcC5IYW5kbGVTdHJlYW0obmFtZSwgaGFuZGxlcilgLlxuICpcbiAqIFJldHVybnMgaW1tZWRpYXRlbHkgd2l0aCBgcmVhZHlTdGF0ZSA9PT0gQ09OTkVDVElOR2A7IGxpc3RlbiBmb3IgYG9wZW5gLCBvclxuICoganVzdCBjYWxsIHtAbGluayBXYWlsc1NvY2tldC5zZW5kfSBvbmNlIG9wZW4uIENyZWF0aW5nIGEgY29ubmVjdGlvbiBhdCBtb2R1bGVcbiAqIHNjb3BlIGlzIHN1cHBvcnRlZCBhbmQgaXMgdGhlIGludGVuZGVkIHNoYXBlIGZvciBnZW5lcmF0ZWQgYmluZGluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJlYW0obmFtZTogc3RyaW5nKTogV2FpbHNTb2NrZXQgfCBXZWJTb2NrZXQge1xuICAgIC8vIFNlcnZlciBidWlsZHMgaW5zdGFsbCBhIGZhY3RvcnkgcmV0dXJuaW5nIGEgcmVhbCBXZWJTb2NrZXQsIHNpbmNlIHRoZXJlXG4gICAgLy8gaXMgYSBsaXN0ZW5lciB0aGVyZSB0byB1cGdyYWRlIG9uIGFuZCBub3RoaW5nIHRvIGVtdWxhdGUuIEJvdGggb2JqZWN0c1xuICAgIC8vIHByZXNlbnQgdGhlIHNhbWUgaW50ZXJmYWNlLCBzbyBub3RoaW5nIGFib3ZlIHRoaXMgbGluZSBjYXJlcyB3aGljaCBpdCBpcy5cbiAgICBpZiAoaGFzRE9NKSB7XG4gICAgICAgIGNvbnN0IGZhY3RvcnkgPSAod2luZG93IGFzIGFueSkuX3dhaWxzPy5zdHJlYW1GYWN0b3J5O1xuICAgICAgICBpZiAodHlwZW9mIGZhY3RvcnkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIGZhY3RvcnkobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBXYWlsc1NvY2tldChuYW1lKTtcbn1cblxuLy8gRGVmaW5lcyBhbiBgb248dHlwZT5gIHByb3BlcnR5IHRoYXQgcmVnaXN0ZXJzIGFuZCB1bnJlZ2lzdGVycyBhIHJlYWwgZXZlbnRcbi8vIGxpc3RlbmVyLCB0aGUgd2F5IHRoZSBET00gZGVmaW5lcyB0aGVtLiBBc3NpZ25pbmcgcmVwbGFjZXMgdGhlIHByZXZpb3VzXG4vLyBoYW5kbGVyOyByZWFkaW5nIHJldHVybnMgaXQuXG5mdW5jdGlvbiBkZWZpbmVIYW5kbGVyUHJvcGVydHkodGFyZ2V0OiBFdmVudFRhcmdldCwgdHlwZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGN1cnJlbnQ6ICgoZXY6IGFueSkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBcIm9uXCIgKyB0eXBlLCB7XG4gICAgICAgIGdldDogKCkgPT4gY3VycmVudCxcbiAgICAgICAgc2V0KGZuOiAoKGV2OiBhbnkpID0+IHZvaWQpIHwgbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQpIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGN1cnJlbnQpO1xuICAgICAgICAgICAgY3VycmVudCA9IHR5cGVvZiBmbiA9PT0gXCJmdW5jdGlvblwiID8gZm4gOiBudWxsO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQpIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGN1cnJlbnQpO1xuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgfSk7XG59XG5cbi8qKlxuICogVGhlIG9iamVjdC1zaGFwZWQgdmlldyBvZiBhIHN0cmVhbSByZXR1cm5lZCBieSB7QGxpbmsgSlNPTlN0cmVhbX06IGBzZW5kYFxuICogdGFrZXMgYSB2YWx1ZSB0byBzdHJpbmdpZnksIGFuZCBgZXYuZGF0YWAgb24gYSBtZXNzYWdlIGlzIHRoZSBwYXJzZWQgcmVzdWx0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEpTT05Tb2NrZXQgZXh0ZW5kcyBPbWl0PFdhaWxzU29ja2V0LCBcInNlbmRcIiB8IFwib25tZXNzYWdlXCIgfCBcImFkZEV2ZW50TGlzdGVuZXJcIiB8IFwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiPiB7XG4gICAgc2VuZCh2YWx1ZTogdW5rbm93bik6IHZvaWQ7XG4gICAgb25tZXNzYWdlOiAoKGV2OiBNZXNzYWdlRXZlbnQ8YW55PikgPT4gdm9pZCkgfCBudWxsO1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBsaXN0ZW5lcjogKCh0aGlzOiBKU09OU29ja2V0LCBldjogTWVzc2FnZUV2ZW50PGFueT4pID0+IGFueSkgfCBFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyxcbiAgICApOiB2b2lkO1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHR5cGU6IHN0cmluZyxcbiAgICAgICAgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgICk6IHZvaWQ7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGxpc3RlbmVyOiAoKHRoaXM6IEpTT05Tb2NrZXQsIGV2OiBNZXNzYWdlRXZlbnQ8YW55PikgPT4gYW55KSB8IEV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgICk6IHZvaWQ7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsXG4gICAgICAgIG9wdGlvbnM/OiBib29sZWFuIHwgRXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4gICAgKTogdm9pZDtcbn1cblxuLyoqXG4gKiBBIHtAbGluayBTdHJlYW19IHRoYXQgc3BlYWtzIG9iamVjdHMgaW5zdGVhZCBvZiBieXRlcy5cbiAqXG4gKiBgc2VuZCh2YWx1ZSlgIG1hcnNoYWxzIHdpdGggYEpTT04uc3RyaW5naWZ5YCwgYW5kIGBldi5kYXRhYCBpbiBhbiBgb25tZXNzYWdlYFxuICogaGFuZGxlciBpcyB0aGUgcGFyc2VkIG9iamVjdCByYXRoZXIgdGhhbiBhbiBgQXJyYXlCdWZmZXJgLiBQYWlycyB3aXRoXG4gKiBgU3RyZWFtQ29ubi5TZW5kSlNPTmAgLyBgUmVjZWl2ZUpTT05gIG9uIHRoZSBHbyBzaWRlLlxuICpcbiAqIGBgYGpzXG4gKiBjb25zdCBzID0gSlNPTlN0cmVhbShcInRlbGVtZXRyeVwiKTtcbiAqIHMub25tZXNzYWdlID0gKGV2KSA9PiBjb25zb2xlLmxvZyhldi5kYXRhLnRlbXBlcmF0dXJlKTtcbiAqIHMub25vcGVuICAgID0gKCkgPT4gcy5zZW5kKHsgc3Vic2NyaWJlOiBcInNlbnNvcnNcIiB9KTtcbiAqIGBgYFxuICpcbiAqIEEgZnJhbWUgdGhhdCBpcyBub3QgdmFsaWQgSlNPTiByYWlzZXMgYW4gYGVycm9yYCBldmVudCBhbmQgaXMgZHJvcHBlZCwgcmF0aGVyXG4gKiB0aGFuIHRocm93aW5nIGZyb20gdGhlIHBvbGwgbG9vcCBhbmQgdGFraW5nIHRoZSBjb25uZWN0aW9uIGRvd24gd2l0aCBpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpTT05TdHJlYW0obmFtZTogc3RyaW5nKTogSlNPTlNvY2tldCB7XG4gICAgY29uc3Qgc29ja2V0ID0gU3RyZWFtKG5hbWUpO1xuICAgIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICBjb25zdCBwYXJzZSA9IChwYXlsb2FkOiBBcnJheUJ1ZmZlciB8IHN0cmluZykgPT5cbiAgICAgICAgSlNPTi5wYXJzZSh0eXBlb2YgcGF5bG9hZCA9PT0gXCJzdHJpbmdcIiA/IHBheWxvYWQgOiBkZWNvZGVyLmRlY29kZShwYXlsb2FkKSk7XG5cbiAgICBpZiAoc29ja2V0IGluc3RhbmNlb2YgV2FpbHNTb2NrZXQpIHtcbiAgICAgICAgLy8gRGVjb2RpbmcgdGhyb3VnaCB0aGUgaG9vayByYXRoZXIgdGhhbiBieSB3cmFwcGluZyBvbm1lc3NhZ2UgbWVhbnNcbiAgICAgICAgLy8gYWRkRXZlbnRMaXN0ZW5lciBsaXN0ZW5lcnMgc2VlIHRoZSBwYXJzZWQgb2JqZWN0IHRvby5cbiAgICAgICAgc29ja2V0Ll9kZWNvZGUgPSAocGF5bG9hZCkgPT4gcGFyc2UocGF5bG9hZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2VydmVyIGJ1aWxkcyBnZXQgYSBuYXRpdmUgV2ViU29ja2V0LCB3aG9zZSBkaXNwYXRjaCBuZXZlciBjb25zdWx0c1xuICAgICAgICAvLyBfZGVjb2RlLiBQYXRjaCBib3RoIGxpc3RlbmVyIHN0eWxlcyBvbiB0aGlzIGluc3RhbmNlIHNvIEpTT05TdHJlYW1cbiAgICAgICAgLy8gbWVhbnMgdGhlIHNhbWUgdGhpbmcgb24gZWl0aGVyIHRyYW5zcG9ydCwgd2hpY2ggaXMgdGhlIHBvaW50IG9mIHRoZVxuICAgICAgICAvLyBzaGFyZWQgQVBJLlxuICAgICAgICBjb25zdCBuYXRpdmUgPSBzb2NrZXQgYXMgV2ViU29ja2V0O1xuICAgICAgICBuYXRpdmUuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcblxuICAgICAgICBjb25zdCB3cmFwcGVkID0gbmV3IFdlYWtNYXA8b2JqZWN0LCBFdmVudExpc3RlbmVyPigpO1xuICAgICAgICBjb25zdCBkZWNvZGVkRXZlbnRzID0gbmV3IFdlYWtNYXA8RXZlbnQsIE1lc3NhZ2VFdmVudCB8IG51bGw+KCk7XG4gICAgICAgIGNvbnN0IGFkZCA9IG5hdGl2ZS5hZGRFdmVudExpc3RlbmVyLmJpbmQobmF0aXZlKTtcbiAgICAgICAgY29uc3QgcmVtb3ZlID0gbmF0aXZlLnJlbW92ZUV2ZW50TGlzdGVuZXIuYmluZChuYXRpdmUpO1xuXG4gICAgICAgIGNvbnN0IGRlY29kZUV2ZW50ID0gKGV2OiBFdmVudCk6IE1lc3NhZ2VFdmVudCB8IG51bGwgPT4ge1xuICAgICAgICAgICAgaWYgKGRlY29kZWRFdmVudHMuaGFzKGV2KSkgcmV0dXJuIGRlY29kZWRFdmVudHMuZ2V0KGV2KSA/PyBudWxsO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlKChldiBhcyBNZXNzYWdlRXZlbnQpLmRhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlY29kZWQgPSBuZXcgTWVzc2FnZUV2ZW50KFwibWVzc2FnZVwiLCB7IGRhdGE6IHZhbHVlIH0pO1xuICAgICAgICAgICAgICAgIGRlY29kZWRFdmVudHMuc2V0KGV2LCBkZWNvZGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlZDtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIGRlY29kZWRFdmVudHMuc2V0KGV2LCBudWxsKTtcbiAgICAgICAgICAgICAgICBuYXRpdmUuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJlcnJvclwiKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZGVjb2RlID0gKGxpc3RlbmVyOiBhbnkpOiBFdmVudExpc3RlbmVyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gd3JhcHBlZC5nZXQobGlzdGVuZXIgYXMgb2JqZWN0KTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZykgcmV0dXJuIGV4aXN0aW5nO1xuXG4gICAgICAgICAgICBjb25zdCBmbjogRXZlbnRMaXN0ZW5lciA9IChldikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlY29kZWQgPSBkZWNvZGVFdmVudChldik7XG4gICAgICAgICAgICAgICAgaWYgKCFkZWNvZGVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gXCJmdW5jdGlvblwiKSBsaXN0ZW5lci5jYWxsKG5hdGl2ZSwgZGVjb2RlZCk7XG4gICAgICAgICAgICAgICAgZWxzZSBsaXN0ZW5lci5oYW5kbGVFdmVudChkZWNvZGVkKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3cmFwcGVkLnNldChsaXN0ZW5lciBhcyBvYmplY3QsIGZuKTtcbiAgICAgICAgICAgIHJldHVybiBmbjtcbiAgICAgICAgfTtcblxuICAgICAgICBuYXRpdmUuYWRkRXZlbnRMaXN0ZW5lciA9ICgodHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogYW55LCBvcHRzPzogYW55KSA9PiB7XG4gICAgICAgICAgICBhZGQodHlwZSwgdHlwZSA9PT0gXCJtZXNzYWdlXCIgJiYgbGlzdGVuZXIgPyBkZWNvZGUobGlzdGVuZXIpIDogbGlzdGVuZXIsIG9wdHMpO1xuICAgICAgICB9KSBhcyB0eXBlb2YgbmF0aXZlLmFkZEV2ZW50TGlzdGVuZXI7XG5cbiAgICAgICAgbmF0aXZlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSAoKHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IGFueSwgb3B0cz86IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZm4gPSB0eXBlID09PSBcIm1lc3NhZ2VcIiAmJiBsaXN0ZW5lciA/IHdyYXBwZWQuZ2V0KGxpc3RlbmVyKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJlbW92ZSh0eXBlLCBmbiA/PyBsaXN0ZW5lciwgb3B0cyk7XG4gICAgICAgIH0pIGFzIHR5cGVvZiBuYXRpdmUucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblxuICAgICAgICBsZXQgaGFuZGxlcjogKChldjogTWVzc2FnZUV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobmF0aXZlLCBcIm9ubWVzc2FnZVwiLCB7XG4gICAgICAgICAgICBnZXQ6ICgpID0+IGhhbmRsZXIsXG4gICAgICAgICAgICBzZXQoZm4pIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlcikgbmF0aXZlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGhhbmRsZXIgYXMgRXZlbnRMaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IHR5cGVvZiBmbiA9PT0gXCJmdW5jdGlvblwiID8gZm4gOiBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyKSBuYXRpdmUuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgaGFuZGxlciBhcyBFdmVudExpc3RlbmVyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzZW5kID0gc29ja2V0LnNlbmQuYmluZChzb2NrZXQpO1xuICAgIChzb2NrZXQgYXMgdW5rbm93biBhcyBKU09OU29ja2V0KS5zZW5kID0gKHZhbHVlOiB1bmtub3duKSA9PiBzZW5kKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG5cbiAgICByZXR1cm4gc29ja2V0IGFzIHVua25vd24gYXMgSlNPTlNvY2tldDtcbn1cblxuLy8gU3luY2hyb25vdXMgY29udmVyc2lvbiBmb3IgZXZlcnl0aGluZyBidXQgYSBCbG9iLiBBdm9pZHMgYSBwcm9taXNlIHBlciBzZW5kXG4vLyBhbmQsIG1vcmUgaW1wb3J0YW50bHksIGxldHMgYnVmZmVyZWRBbW91bnQgYmUgZXhhY3QgdGhlIG1vbWVudCBzZW5kKCkgcmV0dXJucy5cbmZ1bmN0aW9uIHRvQnl0ZXNTeW5jKGRhdGE6IHN0cmluZyB8IEFycmF5QnVmZmVyTGlrZSB8IEFycmF5QnVmZmVyVmlldyB8IEJsb2IpOiBVaW50OEFycmF5IHwgbnVsbCB7XG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiB0ZXh0RW5jb2Rlci5lbmNvZGUoZGF0YSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgQmxvYiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgQmxvYikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSkge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YSBhcyBBcnJheUJ1ZmZlckxpa2UpLnNsaWNlKCk7XG59XG5cbmZ1bmN0aW9uIGFib3J0YWJsZTxUPihwcm9taXNlOiBQcm9taXNlPFQ+LCBzaWduYWw/OiBBYm9ydFNpZ25hbCk6IFByb21pc2U8VD4ge1xuICAgIGlmICghc2lnbmFsKSByZXR1cm4gcHJvbWlzZTtcbiAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgU3RyZWFtUmVxdWVzdENhbmNlbGxlZCgpKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IG9uQWJvcnQgPSAoKSA9PiByZWplY3QobmV3IFN0cmVhbVJlcXVlc3RDYW5jZWxsZWQoKSk7XG4gICAgICAgIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICBwcm9taXNlLnRoZW4oXG4gICAgICAgICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIG9uQWJvcnQpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIG9uQWJvcnQpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdG9CeXRlcyhcbiAgICBkYXRhOiBzdHJpbmcgfCBBcnJheUJ1ZmZlckxpa2UgfCBBcnJheUJ1ZmZlclZpZXcgfCBCbG9iLFxuICAgIHNpZ25hbD86IEFib3J0U2lnbmFsLFxuKTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiB0ZXh0RW5jb2Rlci5lbmNvZGUoZGF0YSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgQmxvYiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgQmxvYikge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgYWJvcnRhYmxlKGRhdGEuYXJyYXlCdWZmZXIoKSwgc2lnbmFsKSk7XG4gICAgfVxuICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCkuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGRhdGEgYXMgQXJyYXlCdWZmZXJMaWtlKS5zbGljZSgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBwb3N0RnJhbWUoY29ubklEOiBudW1iZXIsIGtpbmQ6IG51bWJlciwgYm9keTogVWludDhBcnJheSwgbmFtZT86IHN0cmluZywgc2lnbmFsPzogQWJvcnRTaWduYWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICBbSERSX1NFU1NJT05dOiBHLnNlc3Npb24sXG4gICAgICAgIFtIRFJfR0VORVJBVElPTl06IFN0cmluZyhHLmdlbmVyYXRpb24pLFxuICAgICAgICBbSERSX0NPTk5dOiBTdHJpbmcoY29ubklEKSxcbiAgICAgICAgW0hEUl9LSU5EXTogU3RyaW5nKGtpbmQpLFxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIH07XG4gICAgaWYgKG5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBoZWFkZXJzW0hEUl9OQU1FXSA9IG5hbWU7XG4gICAgfVxuXG4gICAgaWYgKGJvZHkuYnl0ZUxlbmd0aCA8PSBDSFVOS19USFJFU0hPTEQpIHtcbiAgICAgICAgYXdhaXQgcG9zdFdpdGhSZXRyeShoZWFkZXJzLCBib2R5LCBzaWduYWwpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU3BsaXQgb3ZlcnNpemVkIGZyYW1lcyB0aGUgc2FtZSB3YXkgdGhlIHJ1bnRpbWUgc3BsaXRzIG92ZXJzaXplZCBjYWxscy5cbiAgICBjb25zdCBjaHVua0lEID0gbmFub2lkKCk7XG4gICAgY29uc3QgdG90YWwgPSBNYXRoLmNlaWwoYm9keS5ieXRlTGVuZ3RoIC8gQ0hVTktfVEhSRVNIT0xEKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRvdGFsOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc2xpY2UgPSBib2R5LnN1YmFycmF5KGkgKiBDSFVOS19USFJFU0hPTEQsIChpICsgMSkgKiBDSFVOS19USFJFU0hPTEQpO1xuICAgICAgICBhd2FpdCBwb3N0V2l0aFJldHJ5KHtcbiAgICAgICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICAgICAgICBbSERSX0NIVU5LXTogY2h1bmtJRCxcbiAgICAgICAgICAgIFtIRFJfQ0hVTktfSU5ERVhdOiBTdHJpbmcoaSksXG4gICAgICAgICAgICBbSERSX0NIVU5LX1RPVEFMXTogU3RyaW5nKHRvdGFsKSxcbiAgICAgICAgfSwgc2xpY2UsIHNpZ25hbCk7XG4gICAgfVxufVxuXG4vLyBBIDQyOSBtZWFucyB0aGUgR28gaGFuZGxlciBoYXMgbm90IHRha2VuIGRlbGl2ZXJ5IG9mIHdoYXQgaXMgYWxyZWFkeSBxdWV1ZWQuXG4vLyBSZXRyeWluZyB0aGUgc2FtZSBmcmFtZSBrZWVwcyBvcmRlcmluZyAodGhlIHNlbmQgY2hhaW4gaGFzIG5vdCBtb3ZlZCBvbikgYW5kXG4vLyBsZWF2ZXMgdGhlIHJlcXVlc3Qgc2xvdCBmcmVlLCB3aGljaCBpcyB3aGF0IHN0b3BzIGEgYmFja2VkLXVwIGNvbm5lY3Rpb24gZnJvbVxuLy8gc3RhcnZpbmcgdGhlIHdpbmRvdydzIHBvbGwuXG5hc3luYyBmdW5jdGlvbiBwb3N0V2l0aFJldHJ5KGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sIGJvZHk6IFVpbnQ4QXJyYXksIHNpZ25hbD86IEFib3J0U2lnbmFsKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gTmV2ZXIgcmV0cnkgd2l0aCB6ZXJvIGRlbGF5LiBUaGUgcmVjZWl2ZXIgYmVpbmcgYmVoaW5kIGlzIGEgY29uZGl0aW9uXG4gICAgLy8gdGhhdCB0YWtlcyB0aW1lIHRvIGNsZWFyLCBhbmQgYW4gaW1tZWRpYXRlIHJldHJ5IGlzIGEgYnVzeSBsb29wIG9mXG4gICAgLy8gZmV0Y2hlcyDigJQgZWFjaCBvbmUgYSBzY2hlbWUtaGFuZGxlciByb3VuZCB0cmlwLCBhbmQgb24gdGhlIGhvc3QgYSBjZ29cbiAgICAvLyBjYWxsLiBTdGFydCBhdCAxIG1zIGFuZCByYW1wLlxuICAgIGxldCB3YWl0ID0gMTtcbiAgICBmb3IgKDs7KSB7XG4gICAgICAgIGlmIChzaWduYWw/LmFib3J0ZWQpIHRocm93IG5ldyBTdHJlYW1SZXF1ZXN0Q2FuY2VsbGVkKCk7XG4gICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChzdHJlYW1VUkwoXCJzZW5kXCIpLCB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICAgIGJvZHk6IGJvZHkgYXMgQm9keUluaXQsXG4gICAgICAgICAgICBzaWduYWwsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzcC5vaykgcmV0dXJuO1xuICAgICAgICBpZiAocmVzcC5zdGF0dXMgIT09IDQyOSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGF3YWl0IHJlc3AudGV4dCgpKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBzbGVlcCh3YWl0LCBzaWduYWwpO1xuICAgICAgICB3YWl0ID0gTWF0aC5taW4od2FpdCAqIDIsIDUwKTtcbiAgICB9XG59XG5cbi8vIHBvc3RCYXRjaCBzZW5kcyBzZXZlcmFsIGRhdGEgZnJhbWVzIGZvciBvbmUgY29ubmVjdGlvbiBpbiBib3VuZGVkIHJlcXVlc3RzLlxuLy8gQm9keTogY291bnQgdTMyLCB0aGVuIGNvdW50IHggKCBsZW4gdTMyIHwgcGF5bG9hZCApLiBUaGUgY29tYmluZWQgYm9keSBzdGF5c1xuLy8gd2l0aGluIENIVU5LX1RIUkVTSE9MRDogc2V2ZXJhbCBpbmRpdmlkdWFsbHkgc21hbGwgZnJhbWVzIG11c3Qgbm90IHJlY3JlYXRlXG4vLyB0aGUgV2ViVmlldzIgYm9keS1zaXplIHByb2JsZW0gdGhhdCBjaHVua2luZyBzaW5nbGUgbGFyZ2UgZnJhbWVzIGF2b2lkcy5cbmFzeW5jIGZ1bmN0aW9uIHBvc3RCYXRjaChjb25uSUQ6IG51bWJlciwgZnJhbWVzOiBVaW50OEFycmF5W10sIHNpZ25hbD86IEFib3J0U2lnbmFsKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHN0YXJ0ID0gMDtcbiAgICB3aGlsZSAoc3RhcnQgPCBmcmFtZXMubGVuZ3RoKSB7XG4gICAgICAgIGlmIChmcmFtZXNbc3RhcnRdLmJ5dGVMZW5ndGggPiBDSFVOS19USFJFU0hPTEQpIHtcbiAgICAgICAgICAgIGF3YWl0IHBvc3RGcmFtZShjb25uSUQsIEtJTkRfREFUQSwgZnJhbWVzW3N0YXJ0XSwgdW5kZWZpbmVkLCBzaWduYWwpO1xuICAgICAgICAgICAgc3RhcnQrKztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVuZCA9IHN0YXJ0O1xuICAgICAgICBsZXQgc2l6ZSA9IDQ7IC8vIGZyYW1lIGNvdW50XG4gICAgICAgIHdoaWxlIChlbmQgPCBmcmFtZXMubGVuZ3RoICYmIGVuZCAtIHN0YXJ0IDwgTUFYX0JBVENIX0ZSQU1FUykge1xuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBmcmFtZXNbZW5kXTtcbiAgICAgICAgICAgIGlmIChmcmFtZS5ieXRlTGVuZ3RoID4gQ0hVTktfVEhSRVNIT0xEIHx8IHNpemUgKyA0ICsgZnJhbWUuYnl0ZUxlbmd0aCA+IENIVU5LX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2l6ZSArPSA0ICsgZnJhbWUuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgIGVuZCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQSBuZWFyLXRocmVzaG9sZCBmcmFtZSBmaXRzIGFzIGEgbm9ybWFsIFBPU1QgYm9keSBidXQgbm90IGluc2lkZSBhXG4gICAgICAgIC8vIGJhdGNoIG9uY2UgaXRzIGNvdW50IGFuZCBsZW5ndGggaGVhZGVycyBhcmUgaW5jbHVkZWQuXG4gICAgICAgIGlmIChlbmQgPT09IHN0YXJ0KSB7XG4gICAgICAgICAgICBhd2FpdCBwb3N0RnJhbWUoY29ubklELCBLSU5EX0RBVEEsIGZyYW1lc1tzdGFydF0sIHVuZGVmaW5lZCwgc2lnbmFsKTtcbiAgICAgICAgICAgIHN0YXJ0Kys7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGdyb3VwID0gZnJhbWVzLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgICAgICBpZiAoZ3JvdXAubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBhd2FpdCBwb3N0RnJhbWUoY29ubklELCBLSU5EX0RBVEEsIGdyb3VwWzBdLCB1bmRlZmluZWQsIHNpZ25hbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCBwb3N0QmF0Y2hHcm91cChjb25uSUQsIGdyb3VwLCBzaWduYWwpO1xuICAgICAgICB9XG4gICAgICAgIHN0YXJ0ID0gZW5kO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcG9zdEJhdGNoR3JvdXAoY29ubklEOiBudW1iZXIsIGZyYW1lczogVWludDhBcnJheVtdLCBzaWduYWw/OiBBYm9ydFNpZ25hbCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChmcmFtZXMubGVuZ3RoID09PSAwIHx8IGZyYW1lcy5sZW5ndGggPiBNQVhfQkFUQ0hfRlJBTUVTKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgc3RyZWFtIGJhdGNoIHNpemVcIik7XG4gICAgfVxuXG4gICAgbGV0IGJvZHkgPSBidWlsZEJhdGNoKGZyYW1lcyk7XG4gICAgbGV0IHNlbnQgPSAwO1xuICAgIGxldCB3YWl0ID0gMTtcbiAgICBmb3IgKDs7KSB7XG4gICAgICAgIGlmIChzaWduYWw/LmFib3J0ZWQpIHRocm93IG5ldyBTdHJlYW1SZXF1ZXN0Q2FuY2VsbGVkKCk7XG4gICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChzdHJlYW1VUkwoXCJzZW5kXCIpLCB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFtIRFJfU0VTU0lPTl06IEcuc2Vzc2lvbixcbiAgICAgICAgICAgICAgICBbSERSX0dFTkVSQVRJT05dOiBTdHJpbmcoRy5nZW5lcmF0aW9uKSxcbiAgICAgICAgICAgICAgICBbSERSX0NPTk5dOiBTdHJpbmcoY29ubklEKSxcbiAgICAgICAgICAgICAgICBbSERSX0tJTkRdOiBTdHJpbmcoS0lORF9EQVRBKSxcbiAgICAgICAgICAgICAgICBbSERSX0JBVENIXTogU3RyaW5nKGZyYW1lcy5sZW5ndGggLSBzZW50KSxcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IGJvZHkgYXMgQm9keUluaXQsXG4gICAgICAgICAgICBzaWduYWwsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzcC5vaykgcmV0dXJuO1xuICAgICAgICBpZiAocmVzcC5zdGF0dXMgIT09IDQyOSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGF3YWl0IHJlc3AudGV4dCgpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGUgcmVjZWl2ZXIgdG9vayBhIHByZWZpeCBvZiB0aGUgYmF0Y2guIFJlc2VuZCBvbmx5IHdoYXQgaXMgbGVmdCxcbiAgICAgICAgLy8gd2hpY2gga2VlcHMgb3JkZXJpbmcgd2l0aG91dCByZS1kZWxpdmVyaW5nIGFueXRoaW5nLlxuICAgICAgICBjb25zdCBhY2NlcHRlZCA9IE51bWJlcihyZXNwLmhlYWRlcnMuZ2V0KEhEUl9CQVRDSCkgPz8gMCk7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IGZyYW1lcy5sZW5ndGggLSBzZW50O1xuICAgICAgICBpZiAoIU51bWJlci5pc0ludGVnZXIoYWNjZXB0ZWQpIHx8IGFjY2VwdGVkIDwgMCB8fCBhY2NlcHRlZCA+PSByZW1haW5pbmcpIHtcbiAgICAgICAgICAgIC8vIFplcm8gaXMgdmFsaWQgKG5vIHByb2dyZXNzKSwgYnV0IGFuIG91dC1vZi1yYW5nZSBhY2tub3dsZWRnZW1lbnRcbiAgICAgICAgICAgIC8vIGlzIGEgcHJvdG9jb2wgZXJyb3IuIEtlZXAgemVybyBvbiB0aGUgcmV0cnkgcGF0aCBiZWxvdy5cbiAgICAgICAgICAgIGlmIChhY2NlcHRlZCAhPT0gMCkgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBzdHJlYW0gYmF0Y2ggYWNrbm93bGVkZ2VtZW50XCIpO1xuICAgICAgICB9XG4gICAgICAgIHNlbnQgKz0gYWNjZXB0ZWQ7XG4gICAgICAgIGJvZHkgPSBidWlsZEJhdGNoKGZyYW1lcy5zbGljZShzZW50KSk7XG4gICAgICAgIGF3YWl0IHNsZWVwKHdhaXQsIHNpZ25hbCk7XG4gICAgICAgIHdhaXQgPSBNYXRoLm1pbih3YWl0ICogMiwgNTApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYnVpbGRCYXRjaChmcmFtZXM6IFVpbnQ4QXJyYXlbXSk6IFVpbnQ4QXJyYXkge1xuICAgIGxldCBzaXplID0gNDtcbiAgICBmb3IgKGNvbnN0IGYgb2YgZnJhbWVzKSBzaXplICs9IDQgKyBmLmJ5dGVMZW5ndGg7XG4gICAgY29uc3Qgb3V0ID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSk7XG4gICAgY29uc3QgdmlldyA9IG5ldyBEYXRhVmlldyhvdXQuYnVmZmVyKTtcbiAgICB2aWV3LnNldFVpbnQzMigwLCBmcmFtZXMubGVuZ3RoKTtcbiAgICBsZXQgb2ZmID0gNDtcbiAgICBmb3IgKGNvbnN0IGYgb2YgZnJhbWVzKSB7XG4gICAgICAgIHZpZXcuc2V0VWludDMyKG9mZiwgZi5ieXRlTGVuZ3RoKTtcbiAgICAgICAgb2ZmICs9IDQ7XG4gICAgICAgIG91dC5zZXQoZiwgb2ZmKTtcbiAgICAgICAgb2ZmICs9IGYuYnl0ZUxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gc3RhcnRQb2xsaW5nKCk6IHZvaWQge1xuICAgIGlmIChHLnBvbGxpbmcgfHwgIWhhc0RPTSkgcmV0dXJuO1xuICAgIEcucG9sbGluZyA9IHRydWU7XG4gICAgdm9pZCBwb2xsTG9vcCgpO1xufVxuXG4vKipcbiAqIE9uZSBwb2xsIGZvciB0aGUgd2hvbGUgcGFnZSwgc2hhcmVkIGJ5IGV2ZXJ5IGNvbm5lY3Rpb24uXG4gKlxuICogVGhlcmUgaXMgbm8gcG9sbGluZyBpbnRlcnZhbCBhbmQgbm90aGluZyBhZGFwdGl2ZSBoZXJlIG9uIHB1cnBvc2UuIFRoZSBzZXJ2ZXJcbiAqIGhvbGRzIHRoZSByZXF1ZXN0IHVudGlsIGEgZnJhbWUgZXhpc3RzLCBzbyBkZWxpdmVyeSBsYXRlbmN5IGlzIGFscmVhZHkgfjAgYW5kXG4gKiBhIGNsaWVudC1zaWRlIGludGVydmFsIGNvdWxkIG9ubHkgYWRkIHRvIGl0LiBGcmFtZXMgdGhhdCBhcnJpdmUgd2hpbGUgYVxuICogcmVzcG9uc2UgaXMgaW4gZmxpZ2h0IHNpbXBseSBhY2N1bXVsYXRlIGFuZCByaWRlIHRoZSBuZXh0IG9uZSwgd2hpY2ggbWFrZXNcbiAqIHRoZSByb3VuZCB0cmlwIGl0c2VsZiB0aGUgYmF0Y2hpbmcgd2luZG93IOKAlCBpdCB3aWRlbnMgYXMgbG9hZCByaXNlcyB3aXRob3V0XG4gKiBhbnl0aGluZyBoYXZpbmcgdG8gbWVhc3VyZSBpdC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcG9sbExvb3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGJhY2tvZmYgPSAwO1xuICAgIGNvbnN0IGFib3J0ID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIEcucG9sbEFib3J0ID0gYWJvcnQ7XG5cbiAgICB3aGlsZSAoRy5jb25uZWN0aW9ucy5zaXplID4gMCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKHN0cmVhbVVSTChcInBvbGxcIiksIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBbSERSX1NFU1NJT05dOiBHLnNlc3Npb24sXG4gICAgICAgICAgICAgICAgICAgIFtIRFJfR0VORVJBVElPTl06IFN0cmluZyhHLmdlbmVyYXRpb24pLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2FjaGU6IFwibm8tc3RvcmVcIixcbiAgICAgICAgICAgICAgICBzaWduYWw6IGFib3J0LnNpZ25hbCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT09IDQxMCkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBzZXNzaW9uIGlzIGdvbmU6IGFwcCBzaHV0dGluZyBkb3duLCB3aW5kb3cgY2xvc2VkLCBvciB3ZVxuICAgICAgICAgICAgICAgIC8vIHdlcmUgcmVhcGVkIGFzIHVucmVhY2hhYmxlLiBOb3RoaW5nIHRvIHJldHJ5LlxuICAgICAgICAgICAgICAgIGNsb3NlQWxsKDEwMDEsIFwic2Vzc2lvbiBjbG9zZWRcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXJlc3Aub2sgJiYgcmVzcC5zdGF0dXMgIT09IDIwNCkge1xuICAgICAgICAgICAgICAgIGlmICghaXNSZXRyeWFibGVQb2xsU3RhdHVzKHJlc3Auc3RhdHVzKSkge1xuICAgICAgICAgICAgICAgICAgICBmYWlsQWxsKFwic3RyZWFtIHBvbGwgZmFpbGVkOiBcIiArIHJlc3Auc3RhdHVzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInJldHJ5YWJsZSBzdHJlYW0gcG9sbCBmYWlsdXJlOiBcIiArIHJlc3Auc3RhdHVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmFja29mZiA9IDA7XG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgIT09IDIwNCkge1xuICAgICAgICAgICAgICAgIGxldCBidWY6IEFycmF5QnVmZmVyO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZiA9IGF3YWl0IHJlc3AuYXJyYXlCdWZmZXIoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIEdvIHF1ZXVlIHdhcyBjb25zdW1lZCB3aGVuIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIC8vIHdhcyBwcm9kdWNlZC4gUmV0cnlpbmcgY2Fubm90IHJlY292ZXIgYSBib2R5IHRoYXQgd2FzXG4gICAgICAgICAgICAgICAgICAgIC8vIGludGVycnVwdGVkIGFmdGVyIHRoYXQgcG9pbnQsIHNvIHN1cmZhY2UgdGhlIGxvc3MgYW5kXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3AgaW5zdGVhZCBvZiBzaWxlbnRseSBjb250aW51aW5nIHdpdGggbWlzc2luZyBmcmFtZXMuXG4gICAgICAgICAgICAgICAgICAgIGZhaWxBbGwoXCJzdHJlYW0gcG9sbCByZXNwb25zZSBib2R5IGZhaWxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGZyYW1lcyA9IGRlY29kZUZyYW1lcyhidWYpO1xuICAgICAgICAgICAgICAgIGlmIChmcmFtZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBmcmFtaW5nIG1pc21hdGNoIG1lYW5zIGEgc3RhbGUgY2FjaGVkIHJ1bnRpbWUgYWdhaW5zdCBhXG4gICAgICAgICAgICAgICAgICAgIC8vIG5ld2VyIEdvIHNpZGUuIFJldHJ5aW5nIGNhbm5vdCBmaXggdGhhdCwgYW5kIGxldHRpbmcgaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gZmFsbCBpbnRvIHRoZSBiYWNrb2ZmIGJlbG93IHdvdWxkIHNwaW4gc2lsZW50bHkgZm9yZXZlcixcbiAgICAgICAgICAgICAgICAgICAgLy8gc28gZmFpbCBldmVyeSBjb25uZWN0aW9uIHdpdGggYSByZWFzb24gaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAgICAgY2xvc2VBbGwoMTAwMiwgXCJ1bnJlY29nbmlzZWQgc3RyZWFtIGZyYW1pbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxpdmVyKGZyYW1lcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZS1wb2xsIGltbWVkaWF0ZWx5LCBvbiBkYXRhIGFuZCBvbiBhbiBleHBpcmVkIGhvbGQgYWxpa2UuXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGFib3J0LnNpZ25hbC5hYm9ydGVkIHx8IEcuY29ubmVjdGlvbnMuc2l6ZSA9PT0gMCkgYnJlYWs7XG4gICAgICAgICAgICBiYWNrb2ZmID0gYmFja29mZiA/IE1hdGgubWluKGJhY2tvZmYgKiAyLCBCQUNLT0ZGX01BWCkgOiBCQUNLT0ZGX01JTjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgc2xlZXAoYmFja29mZiwgYWJvcnQuc2lnbmFsKTtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKEcucG9sbEFib3J0ID09PSBhYm9ydCkgRy5wb2xsQWJvcnQgPSB1bmRlZmluZWQ7XG4gICAgRy5wb2xsaW5nID0gZmFsc2U7XG5cbiAgICAvLyBBIGNvbm5lY3Rpb24gb3BlbmVkIHdoaWxlIHdlIHdlcmUgd2luZGluZyBkb3duOiBwaWNrIHRoZSBsb29wIGJhY2sgdXAuXG4gICAgaWYgKEcuY29ubmVjdGlvbnMuc2l6ZSA+IDApIHtcbiAgICAgICAgc3RhcnRQb2xsaW5nKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc1JldHJ5YWJsZVBvbGxTdGF0dXMoc3RhdHVzOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc3RhdHVzID09PSA0MDggfHwgc3RhdHVzID09PSA0MjUgfHwgc3RhdHVzID09PSA0MjkgfHwgKHN0YXR1cyA+PSA1MDAgJiYgc3RhdHVzIDw9IDU5OSk7XG59XG5cbmludGVyZmFjZSBJbkZyYW1lIHtcbiAgICBjb25uSUQ6IG51bWJlcjtcbiAgICBraW5kOiBudW1iZXI7XG4gICAgcGF5bG9hZDogQXJyYXlCdWZmZXI7XG59XG5cbi8vIFZhbGlkYXRlIHRoZSBjb21wbGV0ZSByZXNwb25zZSBiZWZvcmUgZGlzcGF0Y2hpbmcgYW55IHBhcnQgb2YgaXQuIEEgc2hvcnRcbi8vIHBsYXRmb3JtIHJlc3BvbnNlIG11c3Qgbm90IGRlbGl2ZXIgYSB2YWxpZCBwcmVmaXggYW5kIHRoZW4gdGhyb3cgUmFuZ2VFcnJvcjpcbi8vIHRoZSBHbyBxdWV1ZSBoYXMgYWxyZWFkeSBiZWVuIGRyYWluZWQsIHNvIHJldHJ5aW5nIGNhbm5vdCByZWNvdmVyIHRob3NlXG4vLyBmcmFtZXMuIFRyZWF0IHRoZSB3aG9sZSByZXNwb25zZSBhcyBhIHByb3RvY29sIGVycm9yIGluc3RlYWQuXG5mdW5jdGlvbiBkZWNvZGVGcmFtZXMoYnVmOiBBcnJheUJ1ZmZlcik6IEluRnJhbWVbXSB8IG51bGwge1xuICAgIGlmIChidWYuYnl0ZUxlbmd0aCA8IDkpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGR2ID0gbmV3IERhdGFWaWV3KGJ1Zik7XG4gICAgaWYgKGR2LmdldFVpbnQ4KDApICE9PSAweDU3IHx8IGR2LmdldFVpbnQ4KDEpICE9PSAweDUzIHx8XG4gICAgICAgIGR2LmdldFVpbnQ4KDIpICE9PSAweDMxIHx8IGR2LmdldFVpbnQ4KDMpICE9PSAweDAwIHx8XG4gICAgICAgIChkdi5nZXRVaW50OCg0KSAmIH4xKSAhPT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjb3VudCA9IGR2LmdldFVpbnQzMig1KTtcbiAgICBjb25zdCBmcmFtZXM6IEluRnJhbWVbXSA9IFtdO1xuICAgIGxldCBvZmYgPSA5O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIGlmIChvZmYgKyA5ID4gYnVmLmJ5dGVMZW5ndGgpIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBjb25uSUQgPSBkdi5nZXRVaW50MzIob2ZmKTsgb2ZmICs9IDQ7XG4gICAgICAgIGNvbnN0IGtpbmQgPSBkdi5nZXRVaW50OChvZmYpOyBvZmYgKz0gMTtcbiAgICAgICAgY29uc3QgbGVuID0gZHYuZ2V0VWludDMyKG9mZik7IG9mZiArPSA0O1xuICAgICAgICBpZiAoa2luZCA+IEtJTkRfRVJST1IgfHwgbGVuID4gYnVmLmJ5dGVMZW5ndGggLSBvZmYpIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBwYXlsb2FkID0gYnVmLnNsaWNlKG9mZiwgb2ZmICsgbGVuKTsgb2ZmICs9IGxlbjtcbiAgICAgICAgZnJhbWVzLnB1c2goeyBjb25uSUQsIGtpbmQsIHBheWxvYWQgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9mZiA9PT0gYnVmLmJ5dGVMZW5ndGggPyBmcmFtZXMgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBkZWxpdmVyKGZyYW1lczogSW5GcmFtZVtdKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBmcmFtZSBvZiBmcmFtZXMpIHtcbiAgICAgICAgY29uc3QgY29ubklEID0gZnJhbWUuY29ubklEO1xuICAgICAgICBjb25zdCBraW5kID0gZnJhbWUua2luZDtcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGZyYW1lLnBheWxvYWQ7XG4gICAgICAgIGNvbnN0IGNvbm4gPSBHLmNvbm5lY3Rpb25zLmdldChjb25uSUQpO1xuICAgICAgICBpZiAoIWNvbm4pIGNvbnRpbnVlO1xuXG4gICAgICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgICAgICAgY2FzZSBLSU5EX0RBVEE6XG4gICAgICAgICAgICAgICAgY29ubi5fbWVzc2FnZShwYXlsb2FkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS0lORF9PUEVOOlxuICAgICAgICAgICAgICAgIGNvbm4uX29wZW5lZCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLSU5EX0NMT1NFOlxuICAgICAgICAgICAgICAgIGNvbm4uX2Nsb3NlZCgxMDAwLCBcIlwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS0lORF9FUlJPUjpcbiAgICAgICAgICAgICAgICBjb25uLl9mYWlsKG5ldyBFcnJvcihuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGF5bG9hZCkpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VBbGwoY29kZTogbnVtYmVyLCByZWFzb246IHN0cmluZyk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgY29ubiBvZiBbLi4uRy5jb25uZWN0aW9ucy52YWx1ZXMoKV0pIHtcbiAgICAgICAgY29ubi5fY2xvc2VkKGNvZGUsIHJlYXNvbiwgZmFsc2UpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZmFpbEFsbChyZWFzb246IHN0cmluZyk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgY29ubiBvZiBbLi4uRy5jb25uZWN0aW9ucy52YWx1ZXMoKV0pIHtcbiAgICAgICAgY29ubi5fZmFpbChuZXcgRXJyb3IocmVhc29uKSk7XG4gICAgfVxufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCAqIGFzIFJ1bnRpbWUgZnJvbSBcIi4uL0B3YWlsc2lvL3J1bnRpbWUvc3JjXCI7XG5cbmltcG9ydCB7IEVuYWJsZSBhcyBFbmFibGVXTUwgfSBmcm9tIFwiLi4vQHdhaWxzaW8vcnVudGltZS9zcmMvd21sXCI7XG5pbXBvcnQgeyBkZWJ1Z0xvZyB9IGZyb20gXCIuLi9Ad2FpbHNpby9ydW50aW1lL3NyYy91dGlsc1wiO1xuXG53aW5kb3cud2FpbHMgPSBSdW50aW1lO1xuRW5hYmxlV01MKCk7XG5cbmlmIChERUJVRykge1xuICAgIGRlYnVnTG9nKFwiV2FpbHMgUnVudGltZSBMb2FkZWRcIilcbn1cbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vLyBTZXR1cFxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcblxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xufVxuXG5pbXBvcnQgXCIuL2NvbnRleHRtZW51LmpzXCI7XG5pbXBvcnQgXCIuL2RyYWcuanNcIjtcbmltcG9ydCBcIi4vYXBwcmVnaW9uLmpzXCI7XG5cbi8vIFJlLWV4cG9ydCBwdWJsaWMgQVBJXG5pbXBvcnQgKiBhcyBBcHBsaWNhdGlvbiBmcm9tIFwiLi9hcHBsaWNhdGlvbi5qc1wiO1xuaW1wb3J0ICogYXMgQnJvd3NlciBmcm9tIFwiLi9icm93c2VyLmpzXCI7XG5pbXBvcnQgKiBhcyBDYWxsIGZyb20gXCIuL2NhbGxzLmpzXCI7XG5pbXBvcnQgKiBhcyBDbGlwYm9hcmQgZnJvbSBcIi4vY2xpcGJvYXJkLmpzXCI7XG5pbXBvcnQgKiBhcyBDcmVhdGUgZnJvbSBcIi4vY3JlYXRlLmpzXCI7XG5pbXBvcnQgKiBhcyBEaWFsb2dzIGZyb20gXCIuL2RpYWxvZ3MuanNcIjtcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tIFwiLi9ldmVudHMuanNcIjtcbmltcG9ydCAqIGFzIEZsYWdzIGZyb20gXCIuL2ZsYWdzLmpzXCI7XG5pbXBvcnQgKiBhcyBTY3JlZW5zIGZyb20gXCIuL3NjcmVlbnMuanNcIjtcbmltcG9ydCAqIGFzIFN5c3RlbSBmcm9tIFwiLi9zeXN0ZW0uanNcIjtcbmltcG9ydCAqIGFzIElPUyBmcm9tIFwiLi9pb3MuanNcIjtcbmltcG9ydCAqIGFzIEFuZHJvaWQgZnJvbSBcIi4vYW5kcm9pZC5qc1wiO1xuaW1wb3J0ICogYXMgVXBkYXRlciBmcm9tIFwiLi91cGRhdGVyLmpzXCI7XG5pbXBvcnQgV2luZG93LCB7IGhhbmRsZURyYWdFbnRlciwgaGFuZGxlRHJhZ0xlYXZlLCBoYW5kbGVEcmFnT3ZlciB9IGZyb20gXCIuL3dpbmRvdy5qc1wiO1xuaW1wb3J0ICogYXMgV01MIGZyb20gXCIuL3dtbC5qc1wiO1xuaW1wb3J0IHsgU3RyZWFtLCBKU09OU3RyZWFtLCBXYWlsc1NvY2tldCwgdHlwZSBKU09OU29ja2V0IH0gZnJvbSBcIi4vc3RyZWFtLmpzXCI7XG5cbmV4cG9ydCB7XG4gICAgQXBwbGljYXRpb24sXG4gICAgQnJvd3NlcixcbiAgICBDYWxsLFxuICAgIENsaXBib2FyZCxcbiAgICBEaWFsb2dzLFxuICAgIEV2ZW50cyxcbiAgICBGbGFncyxcbiAgICBTY3JlZW5zLFxuICAgIFN5c3RlbSxcbiAgICBJT1MsXG4gICAgQW5kcm9pZCxcbiAgICBVcGRhdGVyLFxuICAgIFdpbmRvdyxcbiAgICBXTUwsXG4gICAgU3RyZWFtLFxuICAgIEpTT05TdHJlYW0sXG4gICAgV2FpbHNTb2NrZXQsXG4gICAgdHlwZSBKU09OU29ja2V0XG59O1xuXG4vKipcbiAqIEFuIGludGVybmFsIHV0aWxpdHkgY29uc3VtZWQgYnkgdGhlIGJpbmRpbmcgZ2VuZXJhdG9yLlxuICpcbiAqIEBpZ25vcmVcbiAqL1xuZXhwb3J0IHsgQ3JlYXRlIH07XG5cbmV4cG9ydCAqIGZyb20gXCIuL2NhbmNlbGxhYmxlLmpzXCI7XG5cbi8vIEV4cG9ydCB0cmFuc3BvcnQgaW50ZXJmYWNlcyBhbmQgdXRpbGl0aWVzXG5leHBvcnQge1xuICAgIHNldFRyYW5zcG9ydCxcbiAgICBnZXRUcmFuc3BvcnQsXG4gICAgdHlwZSBSdW50aW1lVHJhbnNwb3J0LFxuICAgIG9iamVjdE5hbWVzLFxuICAgIGNsaWVudElkLFxufSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5cbmltcG9ydCB7IGNsaWVudElkIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG4vLyBOb3RpZnkgYmFja2VuZFxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fd2FpbHMuaW52b2tlID0gU3lzdGVtLmludm9rZTtcbiAgICB3aW5kb3cuX3dhaWxzLmNsaWVudElkID0gY2xpZW50SWQ7XG59XG5cbi8vIFJlZ2lzdGVyIHBsYXRmb3JtIGhhbmRsZXJzIChpbnRlcm5hbCBBUEkpXG4vLyBOb3RlOiBXaW5kb3cgaXMgdGhlIHRoaXNXaW5kb3cgaW5zdGFuY2UgKGRlZmF1bHQgZXhwb3J0IGZyb20gd2luZG93LnRzKVxuLy8gQmluZGluZyBlbnN1cmVzICd0aGlzJyBjb3JyZWN0bHkgcmVmZXJzIHRvIHRoZSBjdXJyZW50IHdpbmRvdyBpbnN0YW5jZVxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fd2FpbHMuaGFuZGxlUGxhdGZvcm1GaWxlRHJvcCA9IFdpbmRvdy5IYW5kbGVQbGF0Zm9ybUZpbGVEcm9wLmJpbmQoV2luZG93KTtcbn1cblxuLy8gTGludXgtc3BlY2lmaWMgZHJhZyBoYW5kbGVycyAoR1RLIGludGVyY2VwdHMgRE9NIGRyYWcgZXZlbnRzKVxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fd2FpbHMuaGFuZGxlRHJhZ0VudGVyID0gaGFuZGxlRHJhZ0VudGVyO1xuICAgIHdpbmRvdy5fd2FpbHMuaGFuZGxlRHJhZ0xlYXZlID0gaGFuZGxlRHJhZ0xlYXZlO1xuICAgIHdpbmRvdy5fd2FpbHMuaGFuZGxlRHJhZ092ZXIgPSBoYW5kbGVEcmFnT3Zlcjtcbn1cblxuaWYgKGhhc0RPTSkge1xuICAgIFN5c3RlbS5pbnZva2UoXCJ3YWlsczpydW50aW1lOnJlYWR5XCIpO1xufVxuXG4vKipcbiAqIExvYWRzIGEgc2NyaXB0IGZyb20gdGhlIGdpdmVuIFVSTCBpZiBpdCBleGlzdHMuXG4gKiBVc2VzIEhFQUQgcmVxdWVzdCB0byBjaGVjayBleGlzdGVuY2UsIHRoZW4gaW5qZWN0cyBhIHNjcmlwdCB0YWcuXG4gKiBTaWxlbnRseSBpZ25vcmVzIGlmIHRoZSBzY3JpcHQgZG9lc24ndCBleGlzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRPcHRpb25hbFNjcmlwdCh1cmw6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHsgbWV0aG9kOiAnSEVBRCcgfSlcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgLy8gVmVyaWZ5IHRoZSByZXNwb25zZSBpcyBhY3R1YWxseSBKYXZhU2NyaXB0IGFuZCBub3QgYW4gSFRNTCBmYWxsYmFja1xuICAgICAgICAgICAgICAgIC8vIChlLmcuIFZpdGUgZGV2IHNlcnZlciByZXR1cm5zIGluZGV4Lmh0bWwgZm9yIHVua25vd24gcm91dGVzKVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGVudFR5cGUuaW5jbHVkZXMoJ2phdmFzY3JpcHQnKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHt9KTsgLy8gU2lsZW50bHkgaWdub3JlIC0gc2NyaXB0IGlzIG9wdGlvbmFsXG59XG5cbi8vIExvYWQgY3VzdG9tLmpzIGlmIGF2YWlsYWJsZSAodXNlZCBieSBzZXJ2ZXIgbW9kZSBmb3IgV2ViU29ja2V0IGV2ZW50cywgZXRjLilcbmlmIChoYXNET00pIHtcbiAgICBsb2FkT3B0aW9uYWxTY3JpcHQoJy93YWlscy9jdXN0b20uanMnKTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWlCYSxTQUFTLE9BQU8sV0FBVyxlQUFlLE9BQU8sYUFBYTs7Ozs7QUNzQjNFLFNBQWdCLE9BQU8sT0FBZSxJQUFZO0NBQzlDLE1BQU0sU0FBUyxPQUFPLFdBQVcsZUFBZSxPQUFPLE9BQU8sb0JBQW9CLGFBQzVFLFNBQ0E7Q0FFTixJQUFJLFFBQVE7RUFDUixNQUFNLFFBQVEsSUFBSSxXQUFXLElBQUk7RUFDakMsT0FBTyxnQkFBZ0IsS0FBSztFQUM1QixJQUFJLEtBQUs7RUFDVCxLQUFLLElBQUksSUFBSSxHQUFHLElBQUksTUFBTSxLQUN0QixNQUFNLFlBQVksTUFBTSxLQUFLO0VBRWpDLE9BQU87Q0FDWDtDQUlBLElBQUksS0FBSztDQUNULElBQUksSUFBSSxPQUFPO0NBQ2YsT0FBTyxLQUNILE1BQU0sWUFBYSxLQUFLLE9BQU8sSUFBSSxLQUFNO0NBRTdDLE9BQU87QUFDWDs7OztFQWpDTSxjQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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