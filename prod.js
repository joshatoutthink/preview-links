function getSiteData(doc) {
  const title = doc.title;
  const description = doc.querySelector(
    'meta[name="description"], meta[property="og:description"]'
  )?.content;
  const image = doc.querySelector(
    'meta[property="og:image"], meta[property="twitter:image"]'
  )?.content;
  const icon = doc.querySelector('link[rel="icon"]')?.href;
  return { title, description, image, icon };
}

const template = (doc) => {
  const { title, icon, image, description } = getSiteData(doc);
  return ` \
<div>
		${
      title &&
      `<h4 class="title">${
        icon
          ? `<img src="${icon}" width="20" height="20" style="margin-right:10px;"/>`
          : ""
      }${title}</h4>`
    }
		${image ? `<img class="image" src="${image}"   />` : ""}
		${description && `<p>${description}</p>`}
</div> \
`;
};

const defaultConfig = {
  previewModalSelector: "preview-modal",
  linkSelector: "a[href]",

  modalSpaceFromEl: 5,

  template,

  modalTimeout: 300,
  modalDelay: 0,
};

//GLOBAL STATE
// TODO lets add configuration and allow the user to call the initPreviewLinks
// immediately start it

class PreviewLinks {
  constructor(config = {}) {
    this.Store = new Map();
    this.removeDelayTimer = null;
    this.showDelayTimer = null;
    this.config = { ...defaultConfig, ...config };
    this.template = this.config.template;
    this.init = this.initPreviewLinks;
  }

  initPreviewLinks = () => {
    console.log("preview links engaged");
    const links = [...document.querySelectorAll(this.config.linkSelector)];
    links.forEach((link) => {
      link.addEventListener("mouseenter", this.delayAndShow);
      link.addEventListener("focus", this.delayAndShow);
      link.addEventListener("mouseleave", this.delayAndRemove);
      link.addEventListener("blur", this.delayAndRemove);
    });
  };

  delayAndShow = (e) => {
    this.showDelayTimer = delayedEventCallBack(
      this.showPreview,
      this.config.modalDelay
    )(e);
  };

  delayAndRemove = (e) => {
    if (this.showDelayTimer) clearTimeout(this.showDelayTimer);

    this.removeModalTimer = delayedEventCallBack(
      this.closePreview,
      this.config.modalTimeout
    )(e);
  };

  //Retruns the markup
  async fetchPreviewMarkup(link) {
    const href = link.href;
    if (!this.Store.has(href)) {
      const htmlString = await fetch(href, { mode: "no-cors" }).then((res) =>
        res.text()
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const markup = this.template(doc);
      this.Store.set(href, markup);
    }
    return this.Store.get(href);
  }

  showPreview = async (e) => {
    if (this.removeModalTimer) clearTimeout(this.removeModalTimer);

    this.clearAllModals();
    const a = e.target; // the anchor element
    if (document.querySelector(`.${this.config.previewModalSelector}`)) return;
    const modal = this.createModal();
    document.body.appendChild(modal);

    a.dataset.plActive = "true";
    modal.addEventListener("mouseenter", (e) => this.modalKeepPreview(e));
    modal.addEventListener("mouseleave", (e) =>
      setTimeout(() => this.modalClosePreview(e), this.config.modalTimeout)
    );

    const markup = await this.fetchPreviewMarkup(a);
    this.giveModalContent(modal, markup);
    this.setPosition(a, modal);
  };

  modalKeepPreview() {
    clearTimeout(this.removeModalTimer);
  }

  clearAllModals() {
    document
      .querySelectorAll(`.${this.config.previewModalSelector}`)
      .forEach((modal) => {
        modal.removeEventListener("mouseenter", this.modalKeepPreview);
        modal.removeEventListener("mouseleave", this.modalClosePreview);
        modal.parentElement.removeChild(modal);
      });
  }

  closePreview = (e) => {
    if (this.removeModalTimer) clearTimeout(this.removeModalTimer);

    e.target;
    this.clearAllModals();
    document
      .querySelectorAll('[data-pl-active="true"]')
      .forEach((el) => (el.dataset.plActive = "false"));
  };

  // for when mouse leaves modal
  modalClosePreview() {
    if (this.removeModalTimer) clearTimeout(this.removeModalTimer);
    document
      .querySelectorAll(`.${this.config.previewModalSelector}`)
      .forEach((modal) => this.clearAllModals());
  }

  createModal() {
    const el = document.createElement("DIV");
    el.classList.add(this.config.previewModalSelector);
    return el;
  }

  giveModalContent(el, markup) {
    el.innerHTML = markup;
  }

  //POSITIONING;
  setPosition(root, modal) {
    const {
      top: rTop,
      height: rHeight,
      left: rLeft,
    } = root.getBoundingClientRect();

    const { height: mHeight, width: mWidth } = modal.getBoundingClientRect();

    const rightBounds = innerWidth + pageXOffset;
    const bottomBounds = innerHeight + pageYOffset;
    // INITIAL POSITION IN PXs
    let left = rLeft + pageXOffset;
    let top = rTop + pageYOffset + rHeight + this.config.modalSpaceFromEl;
    let right = left + mWidth;
    let bottom = top + mHeight;

    if (right + this.config.modalSpaceFromEl >= rightBounds) {
      //reposition
      const moveLeft = rightBounds - (right + this.config.modalSpaceFromEl);
      left = left + moveLeft;
    }
    if (bottom + this.config.modalSpaceFromEl >= bottomBounds) {
      //reposition
      const moveUp =
        -1 * (mHeight + rHeight + this.config.modalSpaceFromEl + 5);
      top = top + moveUp;
    }
    modal.style.setProperty("--position-x", `${left}px`);
    modal.style.setProperty("--position-y", `${top}px`);
  }
}
//
// LIB
function delayedEventCallBack(cb, time) {
  return (e) => {
    return setTimeout(() => cb(e), time);
  };
}
window.PreviewLinks = PreviewLinks;

export { PreviewLinks };
