if (window.self === window.top && !document.getElementById('myloftTooManyFetchErr')) {
  const mainDiv = document.createElement('div');
  mainDiv.id = "myloftTooManyFetchErr";

  const shadowRoot = mainDiv.attachShadow({ mode: 'open' });

  const styles = document.createElement('style');
  styles.textContent = `
    .tost-message {
      position: absolute;
      z-index: 21474836 !important;
      top: 25px;
      right: 30px;
      border-radius: 8px;
      background: #fff;
      padding: 10px 30px 10px 10px;
      box-shadow: 0 6px 20px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transform: translateX(calc(100% + 30px));
      transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.35);
    }

    .tost-message.active {
      transform: translateX(0%);
    }

    .tost-title {
      font-family: "Mulish", sans-serif;
      color: #000;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: 0.25px;
    }

    .close {
      font-family: "Mulish", sans-serif;
      color: #747b7e;
      background-color: transparent;
      border: transparent;
      font-size: 20px;
      font-weight: bold;
      position: absolute;
      top: 0px;
      right: 4px;
      cursor: pointer;
    }

    .close:hover {
      color: #000;
    }

    .tost-logo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50px;
    }

    .tost-logo img {
      width: 2.5rem;
      height: 2.5rem;
      object-fit: contain;
      border: 1px solid #e9ecef;
      border-radius: 50px;
    }

    .tost-message-item {
      display: flex;
      gap: 10px;
      align-items: center;
    }
   `;

  const mainMsgDiv = document.createElement('div');
  mainMsgDiv.className = 'tost-message active';

  const closeButton = document.createElement('button');
  closeButton.className = 'close';
  closeButton.type = 'button';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = function () {
    mainDiv.remove();
  };

  const logoDiv = document.createElement('div');
  logoDiv.className = 'tost-logo';

  const imgElement = document.createElement('img');
  imgElement.src = chrome.runtime.getURL('/icons/icon128.png');
  imgElement.alt = 'icon';
  logoDiv.appendChild(imgElement);

  const titleDiv = document.createElement('div');
  const h3Element = document.createElement('h3');
  h3Element.className = 'tost-title';
  h3Element.textContent = 'Network errors, please check your connection.';
  titleDiv.appendChild(h3Element);

  const messageItemDiv = document.createElement('div');
  messageItemDiv.className = 'tost-message-item';
  messageItemDiv.appendChild(logoDiv);
  messageItemDiv.appendChild(titleDiv);

  mainMsgDiv.appendChild(closeButton);
  mainMsgDiv.appendChild(messageItemDiv);

  shadowRoot.appendChild(styles);
  shadowRoot.appendChild(mainMsgDiv);

  // auto remove after 5s
  // setTimeout(() => mainDiv.remove(), 5000);

  document.body.appendChild(mainDiv);
}