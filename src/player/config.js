export default {
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