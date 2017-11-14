// MediaSkin, copyright (c) by Frank M. Taylor and others

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.MediaSkin = {})));
}(this, (function (exports) { 'use strict';

function exitFullscreen$1 () {
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

function requestFullscreen$1 (el) {
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
        },
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
        timeDisplay: true,
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

var MediaPlayer = function(mediaEl) {
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
			get isPaused () {
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

	};

var prototypeAccessors = { props: { configurable: true },controlCallbacks: { configurable: true },playerCallbacks: { configurable: true } };
	
	// props are the things on the player that can't change as result of user interaction
	prototypeAccessors.props.get = function () {
		return {
			duration: this.mediaEl.duration,
			height: this.mediaEl.videoHeight,
			width: this.mediaEl.videoWidth,
			poster: this.mediaEl.poster,
			hasPoster : this.mediaEl.poster ? true : false,
			loop: this.mediaEl.loop,
		};
	};
	
	// callbacks on elements that we create in the player
	prototypeAccessors.controlCallbacks.get = function () {
			var this$1 = this;

		return {
			play: function (evt) {
				var buttonData = this$1.config.controlToggleButtons[evt.target.dataset.controlToggleName];
				var target = evt.target;

				this$1.state.isPlaying = !this$1.state.isPlaying;
				if (this$1.state.isPlaying) {
					this$1.play();
					target.classList.add(buttonData.classes.isOn);
					target.innerText = buttonData.content.isOn;
						
				} else {
					this$1.pause();
					target.classList.remove(buttonData.classes.isOn);
					target.innerText = buttonData.content.isOff;
				}
			},
			mute: function (evt) {
				var buttonData = this$1.config.controlToggleButtons[evt.target.dataset.controlToggleName];
				var target = evt.target;
					
				this$1.state.isMuted = !this$1.state.isMuted;
					
				this$1.mute();
				target.classList.toggle(buttonData.classes.isOn);
				target.innerText = this$1.state.isMuted ? buttonData.content.isOn : buttonData.content.isOff;
			},
			fullscreen: function (evt) {
				var buttonData = this$1.config.controlToggleButtons[evt.target.dataset.controlToggleName];
				var target = evt.target;
					
				this$1.state.isFullscreen = !this$1.state.isFullscreen;

				target.classList.toggle(buttonData.classes.isOn);
				target.innerText = this$1.state.isMuted ? buttonData.content.isOn : buttonData.content.isOff;
					
				this$1.fullscreen();
			},
			volume: function (evt) {
				this$1.setVolume(evt.target.value);
			},
			skimUp: function (evt) {
				this$1.skimUp();
			},
			skimDown: function (evt) {
				this$1.skimDown();
			}
		};
	};
	
	//EVENTS BOUND TO THE VIDEO PLAYER
	prototypeAccessors.playerCallbacks.get = function () {
			var this$1 = this;

		return {
			load: function (evt) {
				this$1.state.hasLoaded = true;
				this$1.updateStateClasses();
			},
			ended: function (evt) {
				this$1.state.hasEnded = true;
				this$1.state.hasStarted = false;
				this$1.state.playBackRate = 1;
				this$1.updateStateClasses();
			},
			play: function (evt) {
				// play is when the video has started to play, but is not in the process of playing
				this$1.state.hasStarted = true;
			},
			playing: function (evt) {
				// update state only when video is in act of playing
				this$1.state.isPlaying = true;
				this$1.state.hasEnded = false;
				this$1.updateStateClasses();
					
			},
			pause: function (evt) {
				if (this$1.mediaEl.currentTime !== this$1.props.duration) {
					this$1.state.isPlaying = false;
					this$1.updateStateClasses();
				}
			},
			progress: function (evt) {

			},
			durationchange: function (evt) {
				this$1.props.duration = this$1.mediaEl.duration;
				this$1.setDuration(this$1.props.duration);
			},
			timeupdate: function (evt) {
				this$1.state.currentTime = this$1.mediaEl.currentTime;

				this$1.setCurrentTime();

			},
			seeking: function () {
				this$1.state.isSeeking = true;
				this$1.updateStateClasses();
					
			},
			seeked: function (evt) {
				this$1.state.isSeeking = false;
				this$1.updateStateClasses();
					
			},
			volumechange: function (evt) {
				console.log(evt);

			}
		};
	};
	
	MediaPlayer.prototype.updateStateClasses = function () {
			var this$1 = this;

			
		for (var stateName in this$1.state) {
			if (stateName.indexOf('is') != -1 || stateName.indexOf('has') != -1) {
				if (this$1.state[stateName]) {
					this$1.wrapperEl.classList.add(("player--" + stateName));
				} else {
					this$1.wrapperEl.classList.remove(("player--" + stateName));
				}
			}
		}
	};

	MediaPlayer.prototype.play = function () {
		this.mediaEl.play();
	};
	
	MediaPlayer.prototype.pause = function () {
		this.mediaEl.pause();
	};
	
	MediaPlayer.prototype.mute = function () {
		this.mediaEl.muted = this.state.isMuted;
		this.updateStateClasses();
	};
	
	MediaPlayer.prototype.setVolume = function (n) {
		this.state.volume = n;
	
		if (this.state.volume > 0) {
			this.mediaEl.volume = this.state.volume;
			this.mediaEl.muted = this.state.isMuted;
		} else {
			this.mediaEl.muted = this.state.isMuted;
		}
	
			this.updateStateClasses();
	};
	
	MediaPlayer.prototype.getVolume = function () {
		return this.state.volume * 100;
	};
	
	MediaPlayer.prototype.setPlaybackSpeed = function (n) {
		this.mediaEl.playbackRate = n;
		this.state.playBackRate = n;
		this.updateStateClasses();
	};

	MediaPlayer.prototype.getPlaybackSpeed = function (n) {
		return this.state.playBackRate;
	};
	
	MediaPlayer.prototype.skimUp = function () {
		
		if (this.state.playBackRate < 10) {
			this.setPlaybackSpeed(this.state.playBackRate+=1);
		}
			
		return this.state.playBackRate;
	};
	
	MediaPlayer.prototype.skimDown = function () {
		if (this.state.playBackRate > 0.1) {
			this.setPlaybackSpeed(this.state.playBackRate-=0.1);
		}
		return this.state.playBackRate;
	};

	MediaPlayer.prototype.setDuration = function (n) {
			if ( n === void 0 ) n = this.mediaEl.duration;

		this.controlElements.duration.setAttribute('max', n);
		this.controlElements.timeDisplayDuration.innerText = Math.round(n * 100) / 100;
	};

	MediaPlayer.prototype.setCurrentTime = function (n) {
			if ( n === void 0 ) n = this.state.currentTime;

			
		this.controlElements.duration.value = n;
		this.controlElements.timeDisplayCurrent.innerText = Math.round(n * 100) / 100;
	};
	
	MediaPlayer.prototype.fullscreen = function () {
		var el = this.wrapperEl;
	
		if (this.state.isFullscreen) {
			requestFullscreen(this.wrapperEl);
		} else {
			exitFullscreen();
		}

		this.updateStateClasses();
	};
	
	/** Creates a wrapper for the media
		 * @return {HTMLElement} <div>
		 */
	MediaPlayer.prototype.createPlayerWrapper = function () {
		var el = document.createElement('div');
		el.classList.add(this.classNames.wrapper);
	
		return this.wrapper || el;
	};
	
	/** Creates a wrapper that will contain all of the media controls
		 * @return {HTMLElement} <div>
		 */
	MediaPlayer.prototype.createControlsWrapper = function () {
		var el = document.createElement('div');
	
		el.setAttribute('class',this.classNames.controls);
	
		return this.controls || el;
	};
	
	/** Creates a button element
		 * @param  {string} controlToggleName the key name to extract info from the config
		 * @param  {string} content inner text to use
		 * @param  {string} label inner text to use
		 * @param  {function} callback Optional. callback to bind to the click event 
		 * @return {HTMLButtonElement}
		 */
	MediaPlayer.prototype.createButton = function (className, content, label, callback) {
		var el = document.createElement('button');
	
		el.innerText = content;
		el.setAttribute('aria-label', label);
		el.setAttribute('class',this.classNames[className]);
		el.dataset.controlToggleName = className;
		if (callback) { el.addEventListener('click', callback.bind(this)); }
	
		return el;
	};
	
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
	MediaPlayer.prototype.createSlider = function (className, text, callback, val, min, max, step) {
		var el = document.createElement('input');
	
		el.val = val;
		el.setAttribute('title', text);
		el.setAttribute('type', 'range');
		el.setAttribute('min', min);
		el.setAttribute('max', max);
		el.setAttribute('step', step);
		el.setAttribute('class',this.classNames[className]);
		el.addEventListener('change', callback);
	
		return el;
	};
		
	/** Creates a progress element
		 * @param  {string} className the keyname to use to extract the full class name from classNames
		 * @param  {string} text the title text for the element
		 * @param  {int} val initial value
		 * @param  {float} min minimum value
		 * @param  {float} max max value
		 * @param  {float} step amount by which value can increase/decrease
		 * @return {HTMLProgressElement} returns <progress> element
		 */
	MediaPlayer.prototype.createProgress = function (className, text, val, min, max, step) {
		var el = document.createElement('progress');
			
		el.val = val;
		el.setAttribute('title', text);
		el.setAttribute('min', min);
		el.setAttribute('max', max);
		el.setAttribute('step', step);
		el.setAttribute('value', val);
		el.setAttribute('class', this.classNames[className]);

		return el;
	};

	MediaPlayer.prototype.createTimeDisplay = function (currentTime, duration, separator) {
			if ( separator === void 0 ) separator = '/';

		var el = document.createElement('span');
		var timeCurrentEl = document.createElement('span');
		var separatorEl = document.createElement('span');
		var durationEl = document.createElement('span');


		el.setAttribute('class', this.classNames.timeDisplay);
		timeCurrentEl.setAttribute('class',this.classNames.timeDisplayCurrent);
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
	};
	
	/** Creates a div with a background image
		 * @param  {url} src
		 * @return {HTMLElement} returns <div> with background-image
		 */
	MediaPlayer.prototype.createPoster = function (src) {
		var el = document.createElement('div');
	
		el.setAttribute('class', this.classNames.poster);
		el.style.backgroundImage = "url(" + src + ")";
			
		return el;
	};
	
	/** Adds Control element to the controls wrapper
		 * @return {void}
		 */
	MediaPlayer.prototype.addControls = function () {
			var this$1 = this;

		for (var toggle in this$1.config.controlToggleButtons) {
			if (this$1.config.controlToggleButtons[toggle]) {
				var toggleData = this$1.config.controlToggleButtons[toggle];
					
				var el = this$1.createButton(toggle, toggleData.content.isOff, toggle,this$1.controlCallbacks[toggle]);
					
				this$1.controlsEl.append(el);
				this$1.controlElements[toggle] = el;
			}
		}
	
		if ('volume' in this.config.controlSliders) {
			var el$1 = this.createSlider('volume', 'volume', this.controlCallbacks.volume, 1, 0, 1, 0.1);
	
			this.controlsEl.append(el$1);
			this.controlElements.volume = el$1;
		}

		if ('duration' in this.config.controlStatuses) {
			var el$2 = this.createProgress('duration', 'duration', 0, 0, 0, 0.1);
				
			this.controlsEl.append(el$2);
			this.controlElements.duration = el$2;
		}

		if ('timeDisplay' in this.config.controlStatuses) {
			var el$3 = this.createTimeDisplay(0, 0);

			this.controlsEl.appendChild(el$3);
			this.controlElements.timeDisplay = el$3;

		}
	
		this.mediaEl.removeAttribute('controls');
	
	};
	
	MediaPlayer.prototype.bindPlayerEvents = function () {
			var this$1 = this;

		for (var playerEvent in this$1.playerCallbacks) {
	
			if (this$1.playerCallbacks[playerEvent]) { this$1.mediaEl.addEventListener(playerEvent, this$1.playerCallbacks[playerEvent]); }
		}
	};
	
	MediaPlayer.prototype.addControl = function (element, controlType, eventType) {
		var el = element;
		el.dataset.controlToggleName = controlType;
		el.addEventListener(eventType, this.controlCallbacks[controlType].bind(this));
	};

	MediaPlayer.prototype.wrapMedia = function () {
		var originalMediaEl = this.mediaEl;
		var clone = originalMediaEl.cloneNode(true);

		this.wrapperEl = this.createPlayerWrapper();
		this.mediaEl.parentNode.insertBefore(this.wrapperEl, originalMediaEl);

		this.wrapperEl.appendChild(clone);
		this.mediaEl.parentNode.removeChild(originalMediaEl);

		this.mediaEl = clone;
	};

	MediaPlayer.prototype.init = function () {
		if(this.state.hasInitalized) { return; }
		this.mediaEl.classList.add(this.classNames.video);
		this.wrapMedia();
		this.controlsEl = this.createControlsWrapper();

		this.addControls();
		this.wrapperEl.append(this.controlsEl);
		this.bindPlayerEvents();

		this.state.hasInitalized = true;
	};

Object.defineProperties( MediaPlayer.prototype, prototypeAccessors );

exports.MediaPlayer = MediaPlayer;
exports.exitFullscreen = exitFullscreen$1;
exports.requestFullscreen = requestFullscreen$1;

Object.defineProperty(exports, '__esModule', { value: true });

})));
