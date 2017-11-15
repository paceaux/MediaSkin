// MediaSkin, copyright (c) by Frank M. Taylor and others

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.MediaSkin = {})));
}(this, (function (exports) { 'use strict';

function exitFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	} else {
		console.log('Fullscreen API is not supported.');
	}
}

function requestFullscreen(el) {
	if (el.requestFullscreen) {
		el.requestFullscreen();
	} else if (el.webkitRequestFullscreen) {
		el.webkitRequestFullscreen();
	} else if (el.mozRequestFullScreen) {
		el.mozRequestFullScreen();
	} else if (el.msRequestFullscreen) {
		el.msRequestFullscreen();
	} else {
		console.log('Fullscreen API is not supported.');
	}
}

var config = {
    controlToggleButtons: {
        play: {
            content: {
                isOff: '►',
                isOn: '❚❚'
            },
            classes: {
                isOn: 'is-activated'
            }
        },
        mute: {
            content: {
                isOn: '🔇',
                isOff: '🔈'
            },
            classes: {
                isOn: 'is-activated'
            }
        },
        fullscreen: {
            content: {
                isOn: '⤩',
                isOff: '⤮'
            },
            classes: {
                isOn: 'is-activated'
            }
        }
        // skimUp: true,
        // skimDown: true,
    },
    controlSliders: {
        volume: true,
        progress: true
    },
    controlStatuses: {
        duration: true,
        loading: false,
        timeDisplay: true
    },
    uiTriggers: {
        play: 'video'
    }
};

var classNames = {
    wrapper: 'player',
    video: 'player__media',
    controls: 'player__controls controls controls--layout-grid',
    play: 'controls__toggle controls__toggle--play',
    skimUp: 'controls__toggle controls__toggle--skim controls__toggle--skim--up',
    skimDown: 'controls__toggle controls__toggle--skim controls__toggle--skim--down',
    pause: 'controls__toggle controls__toggle--pause',
    poster: 'player__poster',
    mute: 'controls__toggle controls__toggle--mute',
    volume: 'controls__slider controls__slider--volume controls__slider--vertical',
    duration: 'controls__status controls__status--duration',
    timeDisplay: 'controls__status controls__status--time-display time-display',
    timeDisplayCurrent: 'time-display__current',
    timeDisplaySeparator: 'time-display__separator',
    timeDisplayDuration: 'time-display__duration',
    loading: 'controls__status controls__status--loading',
    fullscreen: 'controls__toggle controls__toggle--fullscreen'
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var MediaPlayer = function () {
	function MediaPlayer(mediaEl) {
		classCallCheck(this, MediaPlayer);

		this.mediaEl = mediaEl;

		this.config = config;
		this.classNames = classNames;
		this.controlElements = {};

		//todo: figure out if we should use a setState function, instead of accessing these directly
		// see if can bind event to this, so things respond when state on object changes
		this.state = {
			hasInitalized: false,
			hasLoaded: false,
			hasEnded: false,
			hasStarted: true,
			isPlaying: false,
			get isPaused() {
				return !this.isPlaying;
			},
			isFullscreen: false,
			volume: 1,
			isMuted: false,
			isSeeking: false,
			playBackRate: 1,
			currentTime: 0,
			get isSkimming() {
				return this.playBackRate !== 1;
			}
		};
	}

	// props are the things on the player that can't change as result of user interaction


	createClass(MediaPlayer, [{
		key: 'updateStateClasses',
		value: function updateStateClasses() {

			for (var stateName in this.state) {
				if (stateName.indexOf('is') != -1 || stateName.indexOf('has') != -1) {
					if (this.state[stateName]) {
						this.wrapperEl.classList.add('player--' + stateName);
					} else {
						this.wrapperEl.classList.remove('player--' + stateName);
					}
				}
			}
		}
	}, {
		key: 'play',
		value: function play() {
			this.mediaEl.play();
		}
	}, {
		key: 'pause',
		value: function pause() {
			this.mediaEl.pause();
		}
	}, {
		key: 'mute',
		value: function mute() {
			this.mediaEl.muted = this.state.isMuted;
			this.updateStateClasses();
		}
	}, {
		key: 'setVolume',
		value: function setVolume(n) {
			this.state.volume = n;

			if (this.state.volume > 0) {
				this.mediaEl.volume = this.state.volume;
				this.mediaEl.muted = this.state.isMuted;
			} else {
				this.mediaEl.muted = this.state.isMuted;
			}

			this.updateStateClasses();
		}
	}, {
		key: 'getVolume',
		value: function getVolume() {
			return this.state.volume * 100;
		}
	}, {
		key: 'setPlaybackSpeed',
		value: function setPlaybackSpeed(n) {
			this.mediaEl.playbackRate = n;
			this.state.playBackRate = n;
			this.updateStateClasses();
		}
	}, {
		key: 'getPlaybackSpeed',
		value: function getPlaybackSpeed(n) {
			return this.state.playBackRate;
		}
	}, {
		key: 'skimUp',
		value: function skimUp() {

			if (this.state.playBackRate < 10) {
				this.setPlaybackSpeed(this.state.playBackRate += 1);
			}

			return this.state.playBackRate;
		}
	}, {
		key: 'skimDown',
		value: function skimDown() {
			if (this.state.playBackRate > 0.1) {
				this.setPlaybackSpeed(this.state.playBackRate -= 0.1);
			}
			return this.state.playBackRate;
		}
	}, {
		key: 'setDuration',
		value: function setDuration() {
			var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.mediaEl.duration;

			this.controlElements.duration.setAttribute('max', n);
			this.controlElements.timeDisplayDuration.innerText = Math.round(n * 100) / 100;
		}
	}, {
		key: 'setCurrentTime',
		value: function setCurrentTime() {
			var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.currentTime;


			this.controlElements.duration.value = n;
			this.controlElements.timeDisplayCurrent.innerText = Math.round(n * 100) / 100;
		}
	}, {
		key: 'fullscreen',
		value: function fullscreen() {
			var el = this.wrapperEl;

			if (this.state.isFullscreen) {
				requestFullscreen(this.wrapperEl);
			} else {
				exitFullscreen();
			}

			this.updateStateClasses();
		}

		/** Creates a wrapper for the media
   * @return {HTMLElement} <div>
   */

	}, {
		key: 'createPlayerWrapper',
		value: function createPlayerWrapper() {
			var el = document.createElement('div');
			el.classList.add(this.classNames.wrapper);

			return this.wrapper || el;
		}

		/** Creates a wrapper that will contain all of the media controls
   * @return {HTMLElement} <div>
   */

	}, {
		key: 'createControlsWrapper',
		value: function createControlsWrapper() {
			var el = document.createElement('div');

			el.setAttribute('class', this.classNames.controls);

			return this.controls || el;
		}

		/** Creates a button element
   * @param  {string} controlToggleName the key name to extract info from the config
   * @param  {string} content inner text to use
   * @param  {string} label inner text to use
   * @param  {function} callback Optional. callback to bind to the click event 
   * @return {HTMLButtonElement}
   */

	}, {
		key: 'createButton',
		value: function createButton(className, content, label, callback) {
			var el = document.createElement('button');

			el.innerText = content;
			el.setAttribute('aria-label', label);
			el.setAttribute('class', this.classNames[className]);
			el.dataset.controlToggleName = className;
			if (callback) el.addEventListener('click', callback.bind(this));

			return el;
		}

		/** Creates an input[type=range]
   * @param  {string} className the key used to extract full class name from classNames
   * @param  {string} text the text used for the title attribute
   * @param  {function} callback the callback to use for the change event
   * @param  {int} val initial value of the slider
   * @param  {float} min minimum value
   * @param  {float} max maximum value
   * @param  {float} step amount by which value can increase/decrease
   * @return {HTMLInputElement} <input type=range />
   */

	}, {
		key: 'createSlider',
		value: function createSlider(className, text, callback, val, min, max, step) {
			var el = document.createElement('input');

			el.val = val;
			el.setAttribute('title', text);
			el.setAttribute('type', 'range');
			el.setAttribute('min', min);
			el.setAttribute('max', max);
			el.setAttribute('step', step);
			el.setAttribute('class', this.classNames[className]);
			el.addEventListener('change', callback);

			return el;
		}

		/** Creates a progress element
   * @param  {string} className the keyname to use to extract the full class name from classNames
   * @param  {string} text the title text for the element
   * @param  {int} val initial value
   * @param  {float} min minimum value
   * @param  {float} max max value
   * @param  {float} step amount by which value can increase/decrease
   * @return {HTMLProgressElement} returns <progress> element
   */

	}, {
		key: 'createProgress',
		value: function createProgress(className, text, val, min, max, step) {
			var el = document.createElement('progress');

			el.val = val;
			el.setAttribute('title', text);
			el.setAttribute('min', min);
			el.setAttribute('max', max);
			el.setAttribute('step', step);
			el.setAttribute('value', val);
			el.setAttribute('class', this.classNames[className]);

			return el;
		}
	}, {
		key: 'createTimeDisplay',
		value: function createTimeDisplay(currentTime, duration) {
			var separator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '/';

			var el = document.createElement('span');
			var timeCurrentEl = document.createElement('span');
			var separatorEl = document.createElement('span');
			var durationEl = document.createElement('span');

			el.setAttribute('class', this.classNames.timeDisplay);
			timeCurrentEl.setAttribute('class', this.classNames.timeDisplayCurrent);
			separatorEl.setAttribute('class', this.classNames.timeDisplaySeparator);
			durationEl.setAttribute('class', this.classNames.timeDisplayDuration);

			timeCurrentEl.innerText = currentTime;
			durationEl.innerText = duration;
			separatorEl.innerText = separator;

			el.appendChild(timeCurrentEl);
			el.appendChild(separatorEl);
			el.appendChild(durationEl);

			this.controlElements.timeDisplayCurrent = timeCurrentEl;
			this.controlElements.timeDisplayDuration = durationEl;

			return el;
		}

		/** Creates a div with a background image
   * @param  {url} src
   * @return {HTMLElement} returns <div> with background-image
   */

	}, {
		key: 'createPoster',
		value: function createPoster(src) {
			var el = document.createElement('div');

			el.setAttribute('class', this.classNames.poster);
			el.style.backgroundImage = 'url(' + src + ')';

			return el;
		}

		/** Adds Control element to the controls wrapper
   * @return {void}
   */

	}, {
		key: 'addControls',
		value: function addControls() {
			for (var toggle in this.config.controlToggleButtons) {
				if (this.config.controlToggleButtons[toggle]) {
					var toggleData = this.config.controlToggleButtons[toggle];

					var el = this.createButton(toggle, toggleData.content.isOff, toggle, this.controlCallbacks[toggle]);

					this.controlsEl.append(el);
					this.controlElements[toggle] = el;
				}
			}

			if ('volume' in this.config.controlSliders) {
				var _el = this.createSlider('volume', 'volume', this.controlCallbacks.volume, 1, 0, 1, 0.1);

				this.controlsEl.append(_el);
				this.controlElements.volume = _el;
			}

			if ('duration' in this.config.controlStatuses) {
				var _el2 = this.createProgress('duration', 'duration', 0, 0, 0, 0.1);

				this.controlsEl.append(_el2);
				this.controlElements.duration = _el2;
			}

			if ('timeDisplay' in this.config.controlStatuses) {
				var _el3 = this.createTimeDisplay(0, 0);

				this.controlsEl.appendChild(_el3);
				this.controlElements.timeDisplay = _el3;
			}

			this.mediaEl.removeAttribute('controls');
		}
	}, {
		key: 'bindPlayerEvents',
		value: function bindPlayerEvents() {
			for (var playerEvent in this.playerCallbacks) {

				if (this.playerCallbacks[playerEvent]) this.mediaEl.addEventListener(playerEvent, this.playerCallbacks[playerEvent]);
			}
		}

		/** Binds a click event to an element and fires an event
   * @param  {string} evtName name of the event that should be fired on player
   * @param  {string} triggerSelector css selector
   */

	}, {
		key: 'bindUiTrigger',
		value: function bindUiTrigger(evtName, triggerSelector) {
			var _this = this;

			var triggerNodes = this.wrapperEl.querySelectorAll(triggerSelector);

			[].concat(toConsumableArray(triggerNodes)).forEach(function (triggerNode) {
				var triggerEl = triggerNode;
				triggerEl.dataset.controlToggleName = evtName;
				triggerEl.dataset.updatesControlElement = evtName;

				triggerEl.addEventListener('click', _this.controlCallbacks[evtName]);
			});
		}
	}, {
		key: 'bindUiTriggers',
		value: function bindUiTriggers(uiTriggersObj) {
			var _this2 = this;

			var _loop = function _loop(evtName) {
				if (_this2.controlCallbacks[evtName]) {
					var triggers = _this2.config.uiTriggers[evtName];

					if (Array.isArray(triggers)) {
						triggers.forEach(function (trigger) {
							_this2.bindUiTrigger(evtName, trigger);
						});
					}

					if (typeof triggers === 'string') {
						_this2.bindUiTrigger(evtName, triggers);
					}
				}
			};

			for (var evtName in uiTriggersObj) {
				_loop(evtName);
			}
		}
	}, {
		key: 'addControl',
		value: function addControl(element, controlType, eventType) {
			var el = element;
			el.dataset.controlToggleName = controlType;
			el.addEventListener(eventType, this.controlCallbacks[controlType].bind(this));
		}
	}, {
		key: 'wrapMedia',
		value: function wrapMedia() {
			var originalMediaEl = this.mediaEl;
			var clone = originalMediaEl.cloneNode(true);

			this.wrapperEl = this.createPlayerWrapper();
			this.mediaEl.parentNode.insertBefore(this.wrapperEl, originalMediaEl);

			this.wrapperEl.appendChild(clone);
			this.mediaEl.parentNode.removeChild(originalMediaEl);

			this.mediaEl = clone;
		}
	}, {
		key: 'init',
		value: function init() {
			if (this.state.hasInitalized) return;
			this.mediaEl.classList.add(this.classNames.video);
			this.wrapMedia();
			this.controlsEl = this.createControlsWrapper();

			this.addControls();
			this.wrapperEl.append(this.controlsEl);
			this.bindPlayerEvents();
			this.bindUiTriggers(this.config.uiTriggers);

			this.state.hasInitalized = true;
		}
	}, {
		key: 'props',
		get: function get$$1() {
			return {
				duration: this.mediaEl.duration,
				height: this.mediaEl.videoHeight,
				width: this.mediaEl.videoWidth,
				poster: this.mediaEl.poster,
				hasPoster: this.mediaEl.poster ? true : false,
				loop: this.mediaEl.loop
			};
		}

		// callbacks on elements that we create in the player

	}, {
		key: 'controlCallbacks',
		get: function get$$1() {
			var _this3 = this;

			return {
				play: function play(evt) {
					var target = evt.target;
					var buttonData = _this3.config.controlToggleButtons[target.dataset.controlToggleName];
					var updateElement = target.dataset.updatesControlElement ? _this3.controlElements[target.dataset.updatesControlElement] : evt.target;

					_this3.state.isPlaying = !_this3.state.isPlaying;
					if (_this3.state.isPlaying) {
						_this3.play();
						updateElement.classList.add(buttonData.classes.isOn);
						updateElement.innerText = buttonData.content.isOn;
					} else {
						_this3.pause();
						updateElement.classList.remove(buttonData.classes.isOn);
						updateElement.innerText = buttonData.content.isOff;
					}
				},
				mute: function mute(evt) {
					var buttonData = _this3.config.controlToggleButtons[evt.target.dataset.controlToggleName];
					var target = evt.target;
					var updateElement = target.dataset.updatesControlElement ? _this3.controlElements[target.dataset.updatesControlElement] : evt.target;

					_this3.state.isMuted = !_this3.state.isMuted;

					_this3.mute();
					updateElement.classList.toggle(buttonData.classes.isOn);
					updateElement.innerText = _this3.state.isMuted ? buttonData.content.isOn : buttonData.content.isOff;
				},
				fullscreen: function fullscreen(evt) {
					var buttonData = _this3.config.controlToggleButtons[evt.target.dataset.controlToggleName];
					var target = evt.target;
					var updateElement = target.dataset.updatesControlElement ? _this3.controlElements[target.dataset.updatesControlElement] : evt.target;

					_this3.state.isFullscreen = !_this3.state.isFullscreen;

					updateElement.classList.toggle(buttonData.classes.isOn);
					updateElement.innerText = _this3.state.isMuted ? buttonData.content.isOn : buttonData.content.isOff;

					_this3.fullscreen();
				},
				volume: function volume(evt) {
					_this3.setVolume(evt.target.value);
				},
				skimUp: function skimUp(evt) {
					_this3.skimUp();
				},
				skimDown: function skimDown(evt) {
					_this3.skimDown();
				}
			};
		}

		//EVENTS BOUND TO THE VIDEO PLAYER

	}, {
		key: 'playerCallbacks',
		get: function get$$1() {
			var _this4 = this;

			return {
				load: function load(evt) {
					_this4.state.hasLoaded = true;
					_this4.updateStateClasses();
				},
				ended: function ended(evt) {
					_this4.state.hasEnded = true;
					_this4.state.hasStarted = false;
					_this4.state.playBackRate = 1;
					_this4.updateStateClasses();
				},
				play: function play(evt) {
					// play is when the video has started to play, but is not in the process of playing
					_this4.state.hasStarted = true;
				},
				playing: function playing(evt) {
					// update state only when video is in act of playing
					_this4.state.isPlaying = true;
					_this4.state.hasEnded = false;
					_this4.updateStateClasses();
				},
				pause: function pause(evt) {
					if (_this4.mediaEl.currentTime !== _this4.props.duration) {
						_this4.state.isPlaying = false;
						_this4.updateStateClasses();
					}
				},
				progress: function progress(evt) {},
				durationchange: function durationchange(evt) {
					_this4.props.duration = _this4.mediaEl.duration;
					_this4.setDuration(_this4.props.duration);
				},
				timeupdate: function timeupdate(evt) {
					_this4.state.currentTime = _this4.mediaEl.currentTime;

					_this4.setCurrentTime();
				},
				seeking: function seeking() {
					_this4.state.isSeeking = true;
					_this4.updateStateClasses();
				},
				seeked: function seeked(evt) {
					_this4.state.isSeeking = false;
					_this4.updateStateClasses();
				},
				volumechange: function volumechange(evt) {
					console.log(evt);
				}
			};
		}
	}]);
	return MediaPlayer;
}();

exports.MediaPlayer = MediaPlayer;

Object.defineProperty(exports, '__esModule', { value: true });

})));
