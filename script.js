import { PreviewLinks } from "./app.js";
window.addEventListener("DOMContentLoaded", () => {
  const PL = new PreviewLinks();
  setTimeout(PL.init, 10000);
});
