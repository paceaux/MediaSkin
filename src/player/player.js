import config from './config.js';
import classNames from './classnames.js';

export default class MediaPlayer {
	
		constructor(mediaEl) {
			this.mediaEl = mediaEl;

			this.config = config;
			this.classNames = classNames;						
			this.controlElements = {};
	
			//todo: figure out if we should use a setState function, instead of accessing these directly
			// see if can bind event to this, so things respond when state on object changes
			this.state = {
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

		}
	
		// props are the things on the player that can't change as result of user interaction
		get props() {
			return {
				duration: this.mediaEl.duration,
				height: this.mediaEl.videoHeight,
				width: this.mediaEl.videoWidth,
				poster: this.mediaEl.poster,
				hasPoster : this.mediaEl.poster ? true : false,
				loop: this.mediaEl.loop,
			};
		}
	
		// callbacks on elements that we create in the player
		get controlCallbacks() {
			return {
				play: (evt) => {
					const buttonData = this.config.controlToggleButtons[evt.target.dataset.controlToggleName];
					const target = evt.target;

					this.state.isPlaying = !this.state.isPlaying;
					if (this.state.isPlaying) {
						this.play();
						target.classList.add(buttonData.classes.isOn);
						target.innerText = buttonData.content.isOn;
						
					} else {
						this.pause();
						target.classList.remove(buttonData.classes.isOn);
						target.innerText = buttonData.content.isOff;
					}
				},
				mute: (evt) => {
					const buttonData = this.config.controlToggleButtons[evt.target.dataset.controlToggleName];
					const target = evt.target;
					
					this.state.isMuted = !this.state.isMuted;
					
					this.mute();
					target.classList.toggle(buttonData.classes.isOn);
					target.innerText = this.state.isMuted ? buttonData.content.isOn : buttonData.content.isOff;
				},
				fullscreen: (evt) => {
					const buttonData = this.config.controlToggleButtons[evt.target.dataset.controlToggleName];
					const target = evt.target;
					
					this.state.isFullscreen = !this.state.isFullscreen;

					target.classList.toggle(buttonData.classes.isOn);
					target.innerText = this.state.isMuted ? buttonData.content.isOn : buttonData.content.isOff;
					
					this.fullscreen();
				},
				volume: (evt) => {
					this.setVolume(evt.target.value);
				},
				skimUp: (evt) => {
					this.skimUp();
				},
				skimDown: (evt) => {
					this.skimDown();
				}
			};
		}
	
		//EVENTS BOUND TO THE VIDEO PLAYER
		get playerCallbacks() {
			return {
				load: (evt) => {
					this.state.hasLoaded = true;
					this.updateStateClasses();
				},
				ended: (evt) => {
					this.state.hasEnded = true;
					this.state.hasStarted = false;
					this.state.playBackRate = 1;
					this.updateStateClasses();
				},
				play: (evt) => {
					// play is when the video has started to play, but is not in the process of playing
					this.state.hasStarted = true;
				},
				playing: (evt) => {
					// update state only when video is in act of playing
					this.state.isPlaying = true;
					this.state.hasEnded = false;
					this.updateStateClasses();
					
				},
				pause: (evt) => {
					if (this.mediaEl.currentTime !== this.props.duration) {
						this.state.isPlaying = false;
						this.updateStateClasses();
					}
				},
				progress: (evt) => {

				},
				durationchange: (evt) => {
					this.props.duration = this.mediaEl.duration;
					this.setDuration(this.props.duration);
				},
				timeupdate: (evt) => {
					this.state.currentTime = this.mediaEl.currentTime;

					this.setCurrentTime();

				},
				seeking: () => {
					this.state.isSeeking = true;
					this.updateStateClasses();
					
				},
				seeked: (evt) => {
					this.state.isSeeking = false;
					this.updateStateClasses();
					
				},
				volumechange: (evt) => {
					console.log(evt);

				}
			};
		}
	
		updateStateClasses() {
			
			for (let stateName in this.state) {
				if (stateName.indexOf('is') != -1 || stateName.indexOf('has') != -1) {
					if (this.state[stateName]) {
						this.wrapperEl.classList.add(`player--${stateName}`);
					} else {
						this.wrapperEl.classList.remove(`player--${stateName}`);
					}
				}
			}
		}

		play() {
			this.mediaEl.play();
		}
	
		pause() {
			this.mediaEl.pause();
		}
	
		mute() {
			this.mediaEl.muted = this.state.isMuted;
			this.updateStateClasses();
		}
	
		setVolume(n) {
			this.state.volume = n;
	
			if (this.state.volume > 0) {
				this.mediaEl.volume = this.state.volume;
				this.mediaEl.muted = this.state.isMuted;
			} else {
				this.mediaEl.muted = this.state.isMuted;
			}
	
				this.updateStateClasses();
		}
	
		getVolume() {
			return this.state.volume * 100;
		}
	
		setPlaybackSpeed(n) {
			this.mediaEl.playbackRate = n;
			this.state.playBackRate = n;
			this.updateStateClasses();
		}

		getPlaybackSpeed(n) {
			return this.state.playBackRate;
		}
	
		skimUp() {
		
			if (this.state.playBackRate < 10) {
				this.setPlaybackSpeed(this.state.playBackRate+=1);
			}
			
			return this.state.playBackRate;
		}
	
		skimDown() {
			if (this.state.playBackRate > 0.1) {
				this.setPlaybackSpeed(this.state.playBackRate-=0.1);
			}
			return this.state.playBackRate;
		}

		setDuration(n = this.mediaEl.duration) {
			this.controlElements.duration.setAttribute('max', n);
			this.controlElements.timeDisplayDuration.innerText = Math.round(n * 100) / 100;
		}

		setCurrentTime(n = this.state.currentTime) {
			
			this.controlElements.duration.value = n;
			this.controlElements.timeDisplayCurrent.innerText = Math.round(n * 100) / 100;
		}
	
		fullscreen() {
			const el = this.wrapperEl;
	
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
		createPlayerWrapper() {
			const el = document.createElement('div');
			el.classList.add(this.classNames.wrapper);
	
			return this.wrapper || el;
		}
	
		/** Creates a wrapper that will contain all of the media controls
		 * @return {HTMLElement} <div>
		 */
		createControlsWrapper() {
			const el = document.createElement('div');
	
			el.setAttribute('class',this.classNames.controls);
	
			return this.controls || el;
		}
	
		/** Creates a button element
		 * @param  {string} controlToggleName the key name to extract info from the config
		 * @param  {string} content inner text to use
		 * @param  {string} label inner text to use
		 * @param  {function} callback Optional. callback to bind to the click event 
		 * @return {HTMLButtonElement}
		 */
		createButton(className, content, label, callback) {
			const el = document.createElement('button');
	
			el.innerText = content;
			el.setAttribute('aria-label', label);
			el.setAttribute('class',this.classNames[className]);
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
		createSlider(className, text, callback, val, min, max, step) {
			const el = document.createElement('input');
	
			el.val = val;
			el.setAttribute('title', text);
			el.setAttribute('type', 'range');
			el.setAttribute('min', min);
			el.setAttribute('max', max);
			el.setAttribute('step', step);
			el.setAttribute('class',this.classNames[className]);
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
		createProgress(className, text, val, min, max, step) {
			const el = document.createElement('progress');
			
			el.val = val;
			el.setAttribute('title', text);
			el.setAttribute('min', min);
			el.setAttribute('max', max);
			el.setAttribute('step', step);
			el.setAttribute('value', val);
			el.setAttribute('class', this.classNames[className]);

			return el;
		}

		createTimeDisplay(currentTime, duration, separator = '/') {
			const el = document.createElement('span');
			const timeCurrentEl = document.createElement('span')
			const separatorEl = document.createElement('span');
			const durationEl = document.createElement('span');


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
		}
	
		/** Creates a div with a background image
		 * @param  {url} src
		 * @return {HTMLElement} returns <div> with background-image
		 */
		createPoster(src) {
			const el = document.createElement('div');
	
			el.setAttribute('class', this.classNames.poster);
			el.style.backgroundImage = `url(${src})`;
			
			return el;
		}
	
		/** Adds Control element to the controls wrapper
		 * @return {void}
		 */
		addControls() {
			for (let toggle in this.config.controlToggleButtons) {
				if (this.config.controlToggleButtons[toggle]) {
					let toggleData = this.config.controlToggleButtons[toggle];
					
					let el = this.createButton(toggle, toggleData.content.isOff, toggle,this.controlCallbacks[toggle]);
					
					this.controlsEl.append(el);
					this.controlElements[toggle] = el;
				}
			}
	
			if ('volume' in this.config.controlSliders) {
				let el = this.createSlider('volume', 'volume', this.controlCallbacks.volume, 1, 0, 1, 0.1);
	
				this.controlsEl.append(el);
				this.controlElements.volume = el;
			}

			if ('duration' in this.config.controlStatuses) {
				let el = this.createProgress('duration', 'duration', 0, 0, 0, 0.1);
				
				this.controlsEl.append(el);
				this.controlElements.duration = el;
			}

			if ('timeDisplay' in this.config.controlStatuses) {
				let el = this.createTimeDisplay(0, 0);

				this.controlsEl.appendChild(el);
				this.controlElements.timeDisplay = el;

			}
	
			this.mediaEl.removeAttribute('controls');
	
		}
	
		bindPlayerEvents() {
			for (let playerEvent in this.playerCallbacks) {
	
				if (this.playerCallbacks[playerEvent]) this.mediaEl.addEventListener(playerEvent, this.playerCallbacks[playerEvent]);
			}
		}
	
		addControl(element, controlType, eventType) {
			const el = element;
			el.dataset.controlToggleName = controlType;
			el.addEventListener(eventType, this.controlCallbacks[controlType].bind(this));
		}

		wrapMedia() {
			const originalMediaEl = this.mediaEl;
			const clone = originalMediaEl.cloneNode();

			this.wrapperEl = this.createPlayerWrapper();
			this.mediaEl.parentNode.insertBefore(this.wrapperEl, originalMediaEl);

			this.wrapperEl.appendChild(clone);
			this.mediaEl.parentNode.removeChild(originalMediaEl);

			this.mediaEl = clone;
		}

		init() {
			this.mediaEl.classList.add(this.classNames.video);
			this.wrapMedia();
			this.controlsEl = this.createControlsWrapper();

			this.addControls();
			this.wrapperEl.append(this.controlsEl);
			this.bindPlayerEvents();
		}
	}
	
	
