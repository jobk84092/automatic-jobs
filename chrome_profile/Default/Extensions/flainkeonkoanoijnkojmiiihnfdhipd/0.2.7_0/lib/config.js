var config = {};

config.page = {
  "audio-joiner": "https://webbrowsertools.com/audio-joiner/",
  "convert-to-mp3": "https://webbrowsertools.com/convert-to-mp3/"
};

config.addon = {
  set theme (val) {app.storage.write("theme", val)},
  set state (val) {app.storage.write("state", val)},
  get theme () {return app.storage.read("theme") !== undefined ? app.storage.read("theme") : "light"},
  get state () {return app.storage.read("state") !== undefined ? app.storage.read("state") : "active"}
};

config.welcome = {
  set open (val) {app.storage.write("support", val)},
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get open () {return app.storage.read("support") !== undefined ? app.storage.read("support") : true},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.download = {
  set path (val) {app.storage.write("download-filepath", val)},
  get path () {return app.storage.read("download-filepath") !== undefined ? app.storage.read("download-filepath") : ''},
  "permission": function (top, url) {
    let cond_1 = url.indexOf(".googlevideo.") !== -1;
    let cond_2 = top && top.indexOf("www.youtube.") !== -1;
    /*  */
    if (config.url.check.ad.test(url)) return false;
    if (cond_1 || cond_2) return false;
    return true;
  }
};

config.session = {
  "top": {
    set url (val) {app.session.write("top", val)},
    get url () {return app.session.read("top") !== undefined ? app.session.read("top") : ''}
  },
  "global": {
    set metadata (val) {app.session.write("metadata", val)},
    get metadata () {return app.session.read("metadata") !== undefined ? app.session.read("metadata") : ''}
  },
  "stack": {
    set top (val) {app.session.write("stack-top", val)},
    set url (val) {app.session.write("stack-url", val)},
    set audio (val) {app.session.write("stack-audio", val)},
    get top () {return app.session.read("stack-top") !== undefined ? app.session.read("stack-top") : {}},
    get url () {return app.session.read("stack-url") !== undefined ? app.session.read("stack-url") : {}},
    get audio () {return app.session.read("stack-audio") !== undefined ? app.session.read("stack-audio") : {}}
  }
};

config.item = {
  "extract": {
    "domain": function (url) {
      let key = url ? url.match(/:\/\/(?:www\.)?(.[^/]+)(.*)/) : [];
      return (key && key.length) ? key[1] : url;
    }
  },
  "add": function (top, obj) {
    let tmp = config.session.stack.audio;
    if (config.audio.use.url === false) top = config.item.extract.domain(top);
    //
    let list = tmp[top] || [];
    list.push(obj);
    tmp[top] = list;
    //
    config.session.stack.audio = tmp;
  },
  "is": {
    "valid": function (top, url, size) {
      let tmp = config.session.stack.audio;
      if (config.audio.use.url === false) top = config.item.extract.domain(top);
      //
      let list = tmp[top] || [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].url == url || list[i].size == size) return false;
      }
      //
      return true;
    }
  },
  "query": {
    "header": function (headers, name) {
      if (headers && headers.length) {
        for (let i = 0; i < headers.length; ++i) {
          let header = headers[i];
          if (header.name.toLowerCase() === name) {
            return header.value;
          }
        }
      }
      //
      return '';
    }
  }
};

config.audio = {
  get list () {
    return config.session.stack.audio;
  },
  set list (o) {
    delete o["undefined"];
    let size = 0, maxSize = 1000;
    for (let m in o) {
      if (o.hasOwnProperty(m)) size++;
    }
    /*  */
    if (size > maxSize) {
      size = 0;
      let rand = Math.round(Math.random() * maxSize);
      for (let m in o) {
        if (o.hasOwnProperty(m)) {
          let item = size++;
          if (item === rand) {
            delete o[m];
            break;
          }
        }
      }
    }
    /*  */
    config.session.stack.audio = o;
    core.update.addon();
  },
  get ext () {
    let tmp = [
      "\\.3gp",
      "\\.aac",
      "\\.aax",
      "\\.aiff",
      "\\.flac",
      "\\.m4a",
      "\\.m4b",
      "\\.m4p",
      "\\.mmf",
      "\\.mp3",
      "\\.mpc",
      "\\.ogg",
      "\\.oga",
      "\\.tta",
      "\\.wav",
      "\\.wma"
    ];
    /*  */
    tmp = JSON.stringify(tmp);
    return app ? JSON.parse(app.storage.read("audio-ext") || tmp) : [];
  },
  set ext (arr) {app.storage.write("audio-ext", JSON.stringify(arr))},
  get description () {
    let tmp = [
      "Multimedia container format can contain proprietary formats as AMR, AMR-WB or AMR-WB+, but also some open formats",
      "The Advanced Audio Coding format is based on the MPEG-2 and MPEG-4 standards. AAC files are usually ADTS or ADIF containers.",
      "Audio-book format, which is a variable bit-rate (allowing high quality) M4B file encrypted with DRM. MPB contains AAC or ALAC encoded audio in an MPEG-4 container.",
      "Standard audio file format used by Apple. It could be considered the Apple equivalent of wav.",
      "File format for the Free Lossless Audio Codec, a lossless compression codec.",
      "An audio-only MPEG-4 file, used by Apple for unprotected music downloaded from their iTunes Music Store. Audio within the m4a file is typically encoded with AAC, although lossless ALAC may also be used.",
      "Audio-book / podcast extension with AAC or ALAC encoded audio in an MPEG-4 container.",
      "A version of AAC with proprietary Digital Rights Management developed by Apple for use in music downloaded from their iTunes Music Store.",
      "A Samsung audio format that is used in ring-tones. Developed by Yamaha.",
      "MPEG Layer III Audio. Is the most common sound file format used today.",
      "Musepack or MPC (formerly known as MPEGplus, MPEG+ or MP+) is an open source lossy audio codec, specifically optimized for transparent compression of stereo audio at bitrates of 160–180 kbit/s.",
      "A free, open source container format supporting a variety of formats, the most popular of which is the audio format Vorbis. Vorbis offers compression similar to MP3 but is less popular.",
      "A free, open source container format supporting a variety of formats, the most popular of which is the audio format Vorbis. Vorbis offers compression similar to MP3 but is less popular.",
      "The True Audio, real-time lossless audio codec.",
      "Standard audio file container format used mainly in Windows PCs. Commonly used for storing uncompressed (PCM), CD-quality sound files, which means that they can be large in size, around 10 MB per minute. Wav files use a RIFF structure.",
      "Windows Media Audio format, created by Microsoft. Designed with Digital Rights Management (DRM) abilities for copy protection."
    ];
    /*  */
    let arr = JSON.parse(app.storage.read("audio-ext-description") || "[]");
    return arr.length ? arr : tmp;
  },
  set description (arr) {app.storage.write("audio-ext-description", JSON.stringify(arr))},
  get state () {
    let tmp = [
      "active",
      "active",
      "active",
      "active",
      "active",
      "active",
      "active",
      "active",
      "active",
      "active",
      "active",
      "active",
      "active",
      "active",
      "active",
      "active"
    ];
    /*  */
    let arr = JSON.parse(app.storage.read("audio-ext-state") || "[]");
    return arr.length ? arr : tmp;
  },
  set state (arr) {app.storage.write("audio-ext-state", JSON.stringify(arr))},
  "use": {
    set url (val) {app.storage.write("captured", val)},
    get url () {return app.storage.read("captured") !== undefined ? app.storage.read("captured") : false}
  },
  "show": {
    set resolution (val) {app.storage.write("resolution", val)},
    get resolution () {return app.storage.read("resolution") !== undefined ? app.storage.read("resolution") : false}
  }
};

config.url = {
  "check": {
    "ad": new RegExp([
      "\\.js",
      "\\.css",
      "\\.png",
      "\\.jpg",
      "\\.jpeg",
      "\\.woff",
      "\\%22ad",
      "\\/adam\\/",
      "\\_adam\\-",
      "\\-adam\\_",
      "\\-adam\\-",
      "\\&adid\\=",
      "\\.2mdn\\.",
      "\\&adfmt\\=",
      "\\.atdmt\\.",
      "watch7ad\\_",
      "\\/adunit\\/",
      "\\=adhost\\&",
      "\\.innovid\\.",
      "\\/adsales\\/",
      "\\/adServer\\/",
      "\\.doubleclick\\.",
      "\\.serving\\-sys.\\",
      "\\.googlesyndication\\.",
      "\\.google\\-analytics\\.",
      "[\\.]php[\\=\\&\\_\\-\\.\\/\\?\\s\\%]",
      "[\\=\\&\\_\\-\\.\\/\\?\\s]ad[\\=\\&\\_\\-\\.\\/\\?\\s]",
      "[\\=\\&\\_\\-\\.\\/\\?\\s]ads[\\=\\&\\_\\-\\.\\/\\?\\s]",
      "[\\=\\&\\_\\-\\.\\/\\?\\s]pagead[\\=\\&\\_\\-\\.\\/\\?\\s\\d]"
    ].join('|'), 'i')
  },
  "get": {
    "audio": {
      "size": function (s) {
        if (s) {
          if (s >= Math.pow(2, 30)) {return (s / Math.pow(2, 30)).toFixed(1) + " GB"};
          if (s >= Math.pow(2, 20)) {return (s / Math.pow(2, 20)).toFixed(1) + " MB"};
          if (s >= Math.pow(2, 10)) {return (s / Math.pow(2, 10)).toFixed(1) + " KB"};
          return s + " B";
        } else return '';
      },
      "duration": function (s) {
        let date = new Date();
        date.setSeconds(s / 1000);
        return date.toISOString().slice(11, 19) || '';
      },
      "max": {
        set size(val) {app.storage.write("audio-max-size", val)},
        get size() {return app.storage.read("audio-max-size") !== undefined ? parseInt(app.storage.read("audio-max-size")) : 307200}
      },
      "ext": function (url, type) {
        let ext = ''
        let rgX = new RegExp(config.audio.ext.join("|"), "i");
        let ext1 = rgX.exec(url) || '';
        let ext2 = rgX.exec(type) || '';
        if (ext1 && ext1.length) ext = ext1[0];
        else if (ext2 && ext2.length) ext = ext2[0];
        else ext = '';
        /*  */
        let index = config.audio.ext.indexOf("\\" + ext);
        let state = index > -1 ? config.audio.state[index] : null;
        /*  */
        return {
          "ext": ext, 
          "state": state
        };
      }
    }
  }
};
