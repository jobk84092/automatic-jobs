const createTheme = (val) => {
  let newTheme = new Theme();
  return { ...newTheme, ...val };
};

const themeToggleClasses = (themeId) => {
  // get suffix

  try {
    let themeSplit = themeId.split("-");
    let type = themeSplit[themeSplit.length - 1];
    let arr1 = document.querySelectorAll(".nav-tabs");
    let arr2 = document.querySelectorAll(".nav-link");

    arr1.forEach((el) => {
      if (type === "light") {
        el.classList.remove("my-nav-tabs-dark");
      } else {
        el.classList.add("my-nav-tabs-dark");
      }
    });

    arr2.forEach((el) => {
      if (type === "light") {
        el.classList.remove("my-nav-link-dark");
      } else {
        el.classList.add("my-nav-link-dark");
      }
    });
  } catch (err) {}
};
class Theme {
  constructor() {
    this.background = "--dracula-white";
    this.backgroundText = "--dracula-dark-black";
    this.tabBorder = "--tab-border-black";
    this.tabBorderColor = "--tab-border-color-white";
    this.tabBorderBottom = "--dracula-white";
    this.tabActive = "--dracula-white";
    this.tabActiveText = "--dracula-black";
    this.tabInactive = "--dracula-white";
    this.tabInactiveText = "--dracula-pink";
    this.headline = "--dracula-cyan";
    this.headlineText = "--dracula-dark-black";

    this.courseListEven = "rgba(0, 0, 0, 0)";
    this.courseListOdd = "rgba(0, 0, 0, .1)";

    // Change these
    this.slider = "--dracula-orange";
    this.sliderText = "--dracula-dark-black";
    this.btn = "--dracula-yellow";
    this.btnText = "--dracula-dark-black";
  }
}

const setTheme = (theme) => {
  if (theme) {
    r.style.setProperty("--background", rs.getPropertyValue(theme.background));
    r.style.setProperty("--background-text", rs.getPropertyValue(theme.backgroundText));
    r.style.setProperty("--tab-border", rs.getPropertyValue(theme.tabBorder));
    r.style.setProperty("--tab-border-color", rs.getPropertyValue(theme.tabBorderColor));
    r.style.setProperty("--tab-border-bottom", rs.getPropertyValue(theme.tabBorderBottom));
    r.style.setProperty("--tab-active", rs.getPropertyValue(theme.tabActive));
    r.style.setProperty("--tab-active-text", rs.getPropertyValue(theme.tabActiveText));
    r.style.setProperty("--tab-inactive", rs.getPropertyValue(theme.tabInactive));
    r.style.setProperty("--tab-inactive-text", rs.getPropertyValue(theme.tabInactiveText));
    r.style.setProperty("--headline", rs.getPropertyValue(theme.headline));
    r.style.setProperty("--headline-text", rs.getPropertyValue(theme.headlineText));
    r.style.setProperty("--course-list-even", rs.getPropertyValue(theme.courseListEven));
    r.style.setProperty("--course-list-odd", rs.getPropertyValue(theme.courseListOdd));

    r.style.setProperty("--slider", rs.getPropertyValue(theme.slider));
    r.style.setProperty("--slider-text", rs.getPropertyValue(theme.sliderText));
    r.style.setProperty("--slider-dot", rs.getPropertyValue(theme.sliderDot));
    r.style.setProperty("--btn-account", rs.getPropertyValue(theme.btn));
    r.style.setProperty("--btn-account-text", rs.getPropertyValue(theme.btnText));
    r.style.setProperty("--btn-instructions", rs.getPropertyValue(theme.btn));
    r.style.setProperty("--btn-instructions-text", rs.getPropertyValue(theme.btnText));
    r.style.setProperty("--btn-start-class", rs.getPropertyValue(theme.btn));
    r.style.setProperty("--btn-start-class-text", rs.getPropertyValue(theme.btnText));
    r.style.setProperty("--btn-assign-adhoc", rs.getPropertyValue(theme.btn));
    r.style.setProperty("--btn-assign-adhoc-text", rs.getPropertyValue(theme.btnText));
    r.style.setProperty("--btn-assign-pre", rs.getPropertyValue(theme.btn));
    r.style.setProperty("--btn-assign-pre-text", rs.getPropertyValue(theme.btnText));
    r.style.setProperty("--btn-mute", rs.getPropertyValue(theme.btn));
    r.style.setProperty("--btn-mute-text", rs.getPropertyValue(theme.btnText));
    r.style.setProperty("--btn-reports", rs.getPropertyValue(theme.btn));
    r.style.setProperty("--btn-reports-text", rs.getPropertyValue(theme.btnText));
    r.style.setProperty("--list-report", rs.getPropertyValue(theme.background));
    r.style.setProperty("--list-report-text", rs.getPropertyValue(theme.backgroundText));
  }
};

// Iniitalize
let r = document.querySelector(":root");
let rs = getComputedStyle(r);

// alert
alertText = "--dracula-red";

// Background
background = "--dracula-white";
backgroundText = "--dracula-dark-black";

// Tab border
tabBorder = "--tab-border-black";
tabBorderColor = "--tab-border-color-white";
tabBorderBottom = "--dracula-black";

// Tab active
tabActive = "--dracula-white";
tabActiveText = "--dracula-black";

// Tab inactive
tabInactive = "--dracula-white";
tabInactiveText = "--dracula-pink";

// headline
headline = "--dracula-cyan";
headlineText = "--dracula-dark-black";

// course list
courseListEven = "--course-list-even";
courseListOdd = "--course-list-odd";

// Slider
slider = "--dracula-orange";
sliderText = "--dracula-dark-black";

// Buttons
btn = "--dracula-yellow";
btnText = "--dracula-dark-black";

// Re-assign CSS variables
let themeDark = {
  background: "--dracula-black",
  backgroundText: "--dracula-white",
  tabBorder: "",
  tabActive: "--dracula-black",
  tabActiveText: "--dracula-green",
  tabInactive: "--dracula-black",
  tabInactiveText: "--dracula-pink",
  courseListEven: "--course-list-even-dark",
  courseListOdd: "--course-list-odd-dark",
};

let themeLight = {};

// Theme objects

// White slate
let themeWhiteSlate = createTheme({
  slider: "--dracula-white",
  sliderText: "--dracula-black",
  btn: "--dracula-black",
  btnText: "--dracula-white",
});

// Draculas
let themeDraculaGreen = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-green",
  btn: "--dracula-black",
  btnText: "--dracula-green",
});
let themeDraculaOrange = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-orange",
  btn: "--dracula-black",
  btnText: "--dracula-orange",
});
let themeDraculaYellow = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-yellow",
  btn: "--dracula-black",
  btnText: "--dracula-yellow",
});
let themeDraculaRed = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-red",
  btn: "--dracula-black",
  btnText: "--dracula-red",
});
let themeDraculaPink = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-pink",
  btn: "--dracula-black",
  btnText: "--dracula-pink",
});
let themeDraculaWhite = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-white",
  btn: "--dracula-black",
  btnText: "--dracula-white",
});
let themeDraculaBlue = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-light-blue",
  btn: "--dracula-black",
  btnText: "--dracula-light-blue",
});

// Slates...
let themeSlateOrange = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-white",
  btn: "--dracula-orange",
  btnText: "--dracula-dark-black",
});
let themeSlateYellow = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-white",
  btn: "--dracula-yellow",
  btnText: "--dracula-dark-black",
});
let themeSlateBlue = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-white",
  btn: "--dracula-dark-blue",
  btnText: "--dracula-white",
});
let themeSlateRed = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-white",
  btn: "--dracula-red",
  btnText: "--dracula-dark-black",
});
let themeSlatePink = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-white",
  btn: "--dracula-pink",
  btnText: "--dracula-dark-black",
});
let themeSlateWhite = createTheme({
  slider: "--dracula-black",
  sliderText: "--dracula-white",
  btn: "--dracula-white",
  btnText: "--dracula-dark-black",
});

// Pure colors
let themeWhiteWhite = createTheme({
  slider: "--dracula-white",
  sliderText: "--dracula-black",
  btn: "--dracula-white",
  btnText: "--dracula-black",
});
let themeOrangeOrange = createTheme({
  slider: "--dracula-orange",
  sliderText: "--dracula-black",
  btn: "--dracula-orange",
  btnText: "--dracula-black",
});
let themeBlueYellow = createTheme({
  slider: "--dracula-dark-blue",
  sliderText: "--dracula-white",
  btn: "--dracula-yellow",
  btnText: "--dracula-black",
});

const updateThemeDisplay = (themeId) => {
  themeToggleClasses(themeId);

  switch (themeId) {
    case "classic-light":
      setTheme({});
      break;
    case "classic-dark":
      setTheme({ ...themeDark });
      break;
    case "white-slate-light":
      setTheme({ ...themeWhiteSlate });
      break;
    case "white-slate-dark":
      setTheme({ ...themeWhiteSlate, ...themeDark });
      break;
    case "dracula-green-light":
      setTheme({ ...themeDraculaGreen });
      break;
    case "dracula-green-dark":
      setTheme({ ...themeDraculaGreen, ...themeDark });
      break;
    case "dracula-orange-light":
      setTheme({ ...themeDraculaOrange });
      break;
    case "dracula-orange-dark":
      setTheme({ ...themeDraculaOrange, ...themeDark });
      break;
    case "dracula-yellow-light":
      setTheme({ ...themeDraculaYellow });
      break;
    case "dracula-yellow-dark":
      setTheme({ ...themeDraculaYellow, ...themeDark });
      break;
    case "dracula-pink-light":
      setTheme({ ...themeDraculaPink });
      break;
    case "dracula-pink-dark":
      setTheme({ ...themeDraculaPink, ...themeDark });
      break;
    case "dracula-white-dark":
      setTheme({ ...themeDraculaWhite, ...themeDark });
      break;
    case "dracula-white-light":
      setTheme({ ...themeDraculaWhite });
      break;
    case "dracula-blue-dark":
      setTheme({ ...themeDraculaBlue, ...themeDark });
      break;
    case "dracula-blue-light":
      setTheme({ ...themeDraculaBlue });
      break;
    case "dracula-red-light":
      setTheme({ ...themeDraculaRed });
      break;
    case "dracula-red-dark":
      setTheme({ ...themeDraculaRed, ...themeDark });
      break;
    case "slate-orange-light":
      setTheme({ ...themeSlateOrange });
      break;
    case "slate-orange-dark":
      setTheme({ ...themeSlateOrange, ...themeDark });
      break;
    case "slate-yellow-light":
      setTheme({ ...themeSlateYellow });
      break;
    case "slate-yellow-dark":
      setTheme({ ...themeSlateYellow, ...themeDark });
      break;
    case "slate-blue-light":
      setTheme({ ...themeSlateBlue });
      break;
    case "slate-blue-dark":
      setTheme({ ...themeSlateBlue, ...themeDark });
      break;
    case "slate-red-light":
      setTheme({ ...themeSlateRed });
      break;
    case "slate-red-dark":
      setTheme({ ...themeSlateRed, ...themeDark });
      break;
    case "slate-pink-light":
      setTheme({ ...themeSlatePink });
      break;
    case "slate-pink-dark":
      setTheme({ ...themeSlatePink, ...themeDark });
      break;
    case "slate-white-light":
      setTheme({ ...themeSlateWhite });
      break;
    case "slate-white-dark":
      setTheme({ ...themeSlateWhite, ...themeDark });
      break;
    case "blue-yellow-light":
      setTheme({ ...themeBlueYellow });
      break;
    case "blue-yellow-dark":
      setTheme({ ...themeBlueYellow, ...themeDark });
      break;

    case "white-white-light":
      setTheme({ ...themeWhiteWhite });
      break;
    case "white-white-dark":
      setTheme({ ...themeWhiteWhite, ...themeDark });
      break;
    case "orange-orange-light":
      setTheme({ ...themeOrangeOrange });
      break;
    case "orange-orange-dark":
      setTheme({ ...themeOrangeOrange, ...themeDark });
      break;
    default:
      break;
  }
};
