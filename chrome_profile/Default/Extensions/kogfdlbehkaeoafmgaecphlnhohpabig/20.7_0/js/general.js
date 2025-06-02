const handleTabsTilesMaxtabs = async (evt) => {
  let settings;

  // Only relevant for ...
  switch (evt.target.parentElement.dataset.generalType) {
    case "tiles":
    case "tabs":
      settings = myBreakout.settings;

      let items = [...document.querySelectorAll("[data-general-tabs-tiles] input")];
      let option = items.filter((el) => el.checked)[0];

      if (option.id == "breakout-tiles") {
        settings.tile = true;
      } else {
        settings.tile = false;
      }

      myBreakout.settings.tile = settings.tile;
      await myBreakout.saveBreakout();
      break;

    case "maxTabs":
      let arr = [...evt.target.parentElement.childNodes].filter((el) => el.nodeName == "A");

      arr.forEach((el) => el.classList.remove("active"));
      evt.target.classList.add("active");
      let maxTabs = evt.target.dataset.generalMaxtabs;

      let textSel = maxTabs == "0" ? "No Limit" : `${maxTabs} Tabs`;
      document.querySelector("#general-maxtabs-text").innerText = textSel;

      // Save it down
      myBreakout.settings.maxTabs = maxTabs;
      await myBreakout.saveBreakout();
      break;

    default:
      break;
  }
};

const handleThemes = async (evt) => {
  if (evt.target.nodeName !== "A") return;

  // Only relevant for ...
  let arr = [...evt.target.parentElement.childNodes].filter((el) => el.nodeName == "A");

  arr.forEach((el) => el.classList.remove("active"));
  evt.target.classList.add("active");
  console.log(evt.target);
  let themeId = evt.target.dataset.generalThemeId;
  let themeName = evt.target.innerText;

  document.querySelector("[data-general-theme-id-sel]").innerText = themeName;
  document.querySelector("[data-general-theme-id-sel]").dataset.generalThemeIdSel = themeId;

  updateThemeDisplay(themeId);

  myBreakout.settings.themeId = themeId;
  await myBreakout.saveBreakout();
};

const updateToolBarColorSettings = async () => {
  const RAINBOW = "linear-gradient(to right, red,orange,yellow,green,blue,indigo,violet)";
  let labelSolidColor = document.querySelector("#general-toolbar-solid-color");
  let labelSolidColorEx = document.querySelector("#general-toolbar-solid-color-ex");
  let labelGradLeftColor = document.querySelector("#general-toolbar-grad-left");
  let labelGradLeftColorEx = document.querySelector("#general-toolbar-grad-left-ex");
  let labelGradRightColor = document.querySelector("#general-toolbar-grad-right");
  let labelGradRightColorEx = document.querySelector("#general-toolbar-grad-right-ex");

  let colorSolid = myBreakout.settings.toolbarSolidColor;
  let colorLeft = myBreakout.settings.toolbarGradLeftColor;
  let colorRight = myBreakout.settings.toolbarGradRightColor;

  labelSolidColor.innerText = colorSolid;
  labelSolidColorEx.style.background = getColorRgb(colorSolid);

  labelGradLeftColor.innerText = colorLeft;
  labelGradLeftColorEx.style.background = getColorRgb(colorLeft);

  labelGradRightColor.innerText = colorRight;
  labelGradRightColorEx.style.background = getColorRgb(colorRight);

  updateContextToolbarColors();
};

const handleAutoEnter = async (evt) => {
  myBreakout.settings.autoEnter = document.querySelector("#auto-enter").checked;
  await myBreakout.saveBreakout();
};

const handleAutoJoin = async (evt) => {
  myBreakout.settings.autoJoinMain = document.querySelector("#auto-join-main").checked;

  myBreakout.settings.autoJoinBreakouts = document.querySelector("#auto-join-breakouts").checked;

  await myBreakout.saveBreakout();
};

const handleNewMute = async (evt) => {
  debugger;
  myBreakout.settings.newMute = document.querySelector("#new-mute").checked;
  await myBreakout.saveBreakout();
};

const handleAutoRefresh = async (evt) => {
  myBreakout.settings.autoRefreshMain = document.querySelector("#auto-refresh-main").checked;

  myBreakout.settings.autoRefreshBreakouts = document.querySelector("#auto-refresh-breakouts").checked;

  await myBreakout.saveBreakout();
};

// const handleAutoEnter = async (evt) => {
//   myBreakout.settings.autoEnter = document.querySelector("#auto-enter").checked;
//   await myBreakout.saveBreakout();
// };

const handleAllowSimult = async (evt) => {
  myBreakout.settings.allowSimult = document.querySelector("#allow-simult").checked;
  await myBreakout.saveBreakout();
};

const handleRadioGrad = async (evt) => {
  myBreakout.settings.toolbarSolid = false;
  await myBreakout.saveBreakout();

  updateContextToolbarColors();
};

const handleRadioSolid = async (evt) => {
  myBreakout.settings.toolbarSolid = true;
  await myBreakout.saveBreakout();

  updateContextToolbarColors();
};

const updateContextToolbarColors = () => {
  chrome.tabs.query({}, (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      chrome.tabs.sendMessage(tabs[i].id, {
        action: "updateToolbarColors",
      });
    }
  });
};

const handleSliderBg = () => {
  myBreakout.settings.sliderBg.url = document.querySelector("#slider-bg-url").value;

  document.querySelector(".slider-section").style.backgroundImage = `url(${myBreakout.settings.sliderBg.url})`;

  updateSliderBG();
  // await myBreakout.saveBreakout();
};

const handleBroadcastBg = () => {
  myBreakout.settings.broadcastBg.url = document.querySelector("#broadcast-bg-url").value;

  document.querySelector(".broadcast-section").style.backgroundImage = `url(${myBreakout.settings.broadcastBg.url})`;

  updateBroadcastBG();
  // await myBreakout.saveBreakout();
};

const convertBgPosition = (code) => {
  switch (code) {
    case "rt":
      return "Right Top";
      break;
    case "rc":
      return "Right Center";
      break;
    case "rb":
      return "Right Bottom";
      break;
    case "ct":
      return "Center Top";
      break;
    case "cc":
      return "Center Center";
      break;
    case "cb":
      return "Center Bottom";
      break;
    case "lt":
      return "Left Top";
      break;
    case "lc":
      return "Left Center";
      break;
    case "lb":
      return "Left Bottom";
      break;

    default:
      return "Center Center";
      break;
  }
};

const convertBgSize = (code) => {
  switch (code) {
    case "Cover":
      return "cover";
      break;

    case "Contain No-Repeat":
    case "Contain Repeat":
      return "contain";
      break;

    default:
      return "cover";
      break;
  }
};

const convertBgRepeat = (code) => {
  switch (code) {
    case "Cover":
      return "no-repeat";
      break;

    case "Contain No-Repeat":
      return "no-repeat";
      break;

    case "Contain Repeat":
      return "repeat";
      break;

    default:
      return "no-repeat";
      break;
  }
};

const updateSliderBG = () => {
  let sliderBg = myBreakout.settings.sliderBg;

  document.querySelector("#slider-bg-url").value = sliderBg.url;
  document.querySelector(".slider-section").style.backgroundImage = `url(${sliderBg.url})`;
  document.querySelector(".slider-section").style.backgroundPosition = sliderBg.position;
  document.querySelector(".slider-section").style.backgroundSize = convertBgSize(sliderBg.size);
  document.querySelector(".slider-section").style.backgroundRepeat = convertBgRepeat(sliderBg.size);
  document.querySelector(".slider-section").style.color = sliderBg.fgcolor;
  document.querySelector(".slider-section").style.backgroundColor = sliderBg.bgcolor;

  bgColor = sliderBg.bgcolor;

  switch (sliderBg.bgcolor) {
    case "LightBlue":
      bgColor = "#BBDEFB";
      break;
    case "LightGreen":
      bgColor = "#B2DFDB";
      break;
    case "MaterialGreen":
      bgColor = "#69f0ae";
      break;
    case "Indigo":
      bgColor = "#3f51b5";
      break;
    case "DeepBlue":
      bgColor = "#1a237e";
      break;
    case "MaterialBlue":
      bgColor = "#2979ff";
      break;

    default:
      break;
  }

  document.querySelector(".slider-section").style.backgroundColor = bgColor;
};

const updateBroadcastBG = () => {
  let broadcastBg = myBreakout.settings.broadcastBg;

  document.querySelector("#broadcast-bg-url").value = broadcastBg.url;
  document.querySelector(".broadcast-section").style.backgroundImage = `url(${broadcastBg.url})`;
  document.querySelector(".broadcast-section").style.backgroundPosition = broadcastBg.position;
  document.querySelector(".broadcast-section").style.backgroundSize = convertBgSize(broadcastBg.size);
  document.querySelector(".broadcast-section").style.backgroundRepeat = convertBgRepeat(broadcastBg.size);
  document.querySelector(".broadcast-section .broadcast-label-off").style.color = broadcastBg.fgcolor;

  bgColor = broadcastBg.bgcolor;

  switch (broadcastBg.bgcolor) {
    case "LightBlue":
      bgColor = "#BBDEFB";
      break;
    case "LightGreen":
      bgColor = "#B2DFDB";
      break;
    case "MaterialGreen":
      bgColor = "#69f0ae";
      break;
    case "Indigo":
      bgColor = "#3f51b5";
      break;
    case "DeepBlue":
      bgColor = "#1a237e";
      break;
    case "MaterialBlue":
      bgColor = "#2979ff";
      break;

    default:
      break;
  }

  document.querySelector(".broadcast-section ").style.backgroundColor = bgColor;
};
