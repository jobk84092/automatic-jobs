import { defineStore } from 'pinia';


const defaultState = {
    state: 'attached',
    windowId: 'panelWindowId',
    position: {
        x: 0,
        y: 0
    },
    size: {
        height: 600,
        width: 800
    }
}


// hydrate the state with localStorage values
await chrome.storage.local.get(['panelState', 'panelWindowId', 'panelWidth', 'panelHeight', 'panelXPos', 'panelYPos'])
    .then((result) => {
        if (typeof result.panelState !== 'undefined') {
            defaultState.state = result.panelState;
        }
        if (typeof result.panelWindowId !== 'undefined') {
            defaultState.windowId = result.panelWindowId;
        }
        if (typeof result.panelWidth !== 'undefined') {
            defaultState.size.width = result.panelWidth;
        }
        if (typeof result.panelHeight !== 'undefined') {
            defaultState.size.height = result.panelHeight;
        }
        if (typeof result.panelXPos !== 'undefined') {
            defaultState.position.x = result.panelXPos;
        }
        if (typeof result.panelYPos !== 'undefined') {
            defaultState.position.y = result.panelYPos;
        }
})

export const usePanelStore = defineStore('panel', {
    state: () => {
        return defaultState
    },
    actions: {
        setPanelState(state) {
            this.state = state;
        },
        setWindowId(id) {
            this.windowId = id;
        },
        setWidth(width) {
            this.size.width = width;
        },
        setHeight(height) {
            this.size.heigh = height;
        },
        setPosX(posX) {
            this.position.x = posX;
        },
        setPosY(posY) {
            this.position.y = posY;
        }
    }
})
