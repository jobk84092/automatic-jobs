import { defineStore } from 'pinia';


const defaultState = {
  categories: {
    people: 'Smileys & People',
    nature: 'Animals & Nature',
    food: 'Food & Drink',
    activity: 'Activity',
    travel: 'Travel & Places',
    objects: 'Objects',
    symbols: 'Symbols',
    flags: 'Flags'
  },
  currentCategory: 'people',
  currentSkintone: 0,
  containerRef: null,
  iconsContainerRef: null,
  categoryRefs: {
    recents: null,
    people: null,
    nature: null,
    food: null,
    activity: null,
    travel: null,
    objects: null,
    symbols: null,
    flags: null
  },
  categoryOffsets: {
    people: 0,
    nature: null,
    food: null,
    activity: null,
    travel: null,
    objects: null,
    symbols: null,
    flags: null
  },
  hoveredEmoji: null,
  hoveredEmojiString: null,
  hoveredEmojiType: null,
  withCursor: true,
  clickedEmoji: null,
  showSettings: false,
  autoClipboard: true, // true == 'on'
  autoInsert: true, // true == 'on'
  size: 'normal',
  sizeInPx: 32,
  numRecents: 10,
  recentIcons: [],
  previewIcons: [],
  previewIconsCopyString: '',
  copyText: 'Copy',
  searchString: '',
  searchResults: [],
  activeFilter: 'recents',
  iconsPerRow: 10
};

// hydrate the state with localStorage values
await chrome.storage.local.get(['autoClipboard', 'autoInsert', 'size', 'sizeInPx', 'numRecents', 'FreqIcons'])
  .then((result) => {
    if (typeof result.autoClipboard !== 'undefined') {
      defaultState.autoClipboard = result.autoClipboard;

      if (result.autoClipboard === true) {
        defaultState.copyText = '';
      }
    }

    if (typeof result.autoInsert !== 'undefined') {
      defaultState.autoInsert = result.autoInsert;
    }

    if (typeof result.size !== 'undefined') {
      defaultState.size = result.size;

      if (result.size === 'small') {
        defaultState.sizeInPx = 24;
      } else if (result.size === 'normal') {
        defaultState.sizeInPx = 32;
      } else {
        defaultState.sizeInPx = 40;
      }
    }

    if (typeof result.numRecents !== 'undefined') {
      defaultState.numRecents = result.numRecents;
    }

    if (typeof result.FreqIcons !== 'undefined') {
      defaultState.recentIcons = JSON.parse(result.FreqIcons);
    }
  });

export const useEmojiStore = defineStore('emoji', {
  state: () => {
    return defaultState
  },
  actions: {
    setContainerRef(ref) {
      this.containerRef = ref;
    },
    scrollToCategoryOffset(category) {
      if (this.containerRef !== null) {
        console.log('scroll to', category);
        if (category === 'search') {
          this.containerRef.scrollTo(0, 0);
          //TODO - focus cursor on search input, if possible
        } else if (category === 'recents' && this.categoryRefs['recents'] === null) { //if no recents visible
          console.log('no recents');
          this.categoryRefs['people'].scrollIntoView({ behavior: 'smooth' });
        } else {
          this.categoryRefs[category].scrollIntoView({ behavior: 'smooth' });
          console.log('not recents or are recents visible');
        }
      }
    },
    updateContainerRef(ref) {
      this.containerRef = ref;
    },
    updateIconsContainerRef(ref) {
      this.iconsContainerRef = ref;
    },
    updateCurrentCategory(category) {
      this.currentCategory = category;

      this.scrollToCategoryOffset(category);
    },
    updateCurrentSkintone(tone) {
      this.currentSkintone = tone;
    },
    updateCategoryOffsets(category, offset) {
      this.categoryOffsets[category] = offset;
    },
    updateCategoryRefs(category, ref) {
      this.categoryRefs[category] = ref;
    },
    updateHoveredEmoji(codepoint, displayString, type) {
      this.$patch({
        hoveredEmoji: codepoint,
        hoveredEmojiString: displayString,
        hoveredEmojiType: type
      });
    },
    updateWithCursor(val) {
      this.withCursor = val;
    },
    updateClickedEmoji(codepoint) {
      this.clickedEmoji = codepoint;

      setTimeout(() => {
        this.clickedEmoji = null;
      }, 150);
    },
    updateShowSettings() {
      this.showSettings = !this.showSettings;
    },
    updateAutoClipboard(val) {
      this.$patch({
        autoClipboard: val,
        copyText: (val === true) ? '' : 'Copy',
        previewIcons: [],
        previewIconsCopyString: ''
      });
    },
    updateAutoInsert(val) {
      this.autoInsert = val;
    },
    updateSize(size) {
      let sizeInPx = 24;

      if (size === 'normal') {
        sizeInPx = 32;
      } else if (size === 'large') {
        sizeInPx = 40;
      }

      this.$patch({
        size,
        sizeInPx
      });
    },
    updateNumRecents(num) {
      this.numRecents = num;
    },
    updateRecentIcons(list) {
      this.recentIcons = list;
    },
    addPreviewIcon(icon) {
      this.previewIcons.push(icon);
    },
    clearPreviewIcons() {
      this.previewIcons = [];
    },
    async updatePreviewIconsCopyString(str) {
      this.previewIconsCopyString = str;
    },
    updateCopyText(str) {
      this.copyText = str;
    },
    updateSearchString(str) {
      this.searchString = str;
    },
    async updateSearchResults(results) {
      this.searchResults = results;
    },
    setActiveFilter(category) {
      this.activeFilter = category
    },
    setIconsPerRow(num) {
      this.iconsPerRow = num;
    }
  },
  getters: {
    recentsList(state) {
      return state.recentIcons.slice(0, state.numRecents);
    }
  }
})