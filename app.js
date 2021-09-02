import { defaultConfig } from "./defaults.js";

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

  //arrow fn so we keep 'this' equaling the class
  delayAndShow = (e) => {
    this.showDelayTimer = delayedEventCallBack(
      this.showPreview,
      this.config.modalDelay
    )(e);
  };

  //arrow fn so we keep 'this' equaling the class
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

  //arrow fn so we keep 'this' equaling the class
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

  //arrow fn so we keep 'this' equaling the class
  closePreview = (e) => {
    if (this.removeModalTimer) clearTimeout(this.removeModalTimer);

    const a = e.target;
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

  //END OF CLASS
}

// LIB
// helper fn that dont need to be in the class
function delayedEventCallBack(cb, time) {
  return (e) => {
    return setTimeout(() => cb(e), time);
  };
}

// NOT SURE IF GOING WITH ESM OR ALLOWING TO BE ON WINDOW
export { PreviewLinks };
window.PreviewLinks = PreviewLinks;
