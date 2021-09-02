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

export const template = (doc) => {
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

export const defaultConfig = {
  previewModalSelector: "preview-modal",
  linkSelector: "a[href]",

  modalSpaceFromEl: 5,

  template,

  modalTimeout: 300,
  modalDelay: 0,
};
