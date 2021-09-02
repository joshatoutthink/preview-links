# Preview Links

Preview Links is a small javascript library that adds tooltip previews of links when you hover or focus on a link.

![a demo of the library showing the tool tip preview of a link](demo.png)

## How to use

Load the library in the footer or head of your html.
This library also support ESM so you can import it in a script[type="module"] if you would like.
Afterwards initalize the `PreviewLink` class with your configuration (optional), then call the `init` function when you are ready to have the previewlinks engaged!

Your also going to want the styles or at least reference them when you build your own.

```html
<link rel="stylesheet" href="/pl-styles.css"/>
<script type="module">
	import {PreviewLinks} from "./pl-script.js"
	const PL = new PreviewLinks()
	window.addEventListener('DOMContentLoaded', PL.init )
</script>
```

## Configuration

While no configuration is required, the problem this library solves can be very specific to the site, so configuration comes in handy. Add any or all fields to a object and give it the constructor

```javascript
const PL = new PreviewLinks({linkSelector:'p a[href]'});
PL.init();
```

### `PreviewModalSelector`

#### Default => 'preview-modal'

this is the class on the modal element. 


### `linkSelector`

#### Default => `a[href]`

This is the selector that will be used to select all the elements that when hovered, will trigger the modalPreview.  You can do exclusions like you would in CSS. `a[href]:not(.menu-link)`

### ` modalSpaceFromEl`

#### Default => `5` (5px)

This is the amount of space between the link hovered and the preview modal.

### `template` 

#### Default =>
```javascript
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
// TEMPLATE FN
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
```

This is a function that recieves a document object (like window.document) of the link being hovered, and returns a string of the markup used inside the modal.  In the above example which is also the default template, you can see that `doc` is passed in, then the data that will be used in the modal markup is found by using `querySelector()` method.  Using a template string you can easily build a the markup with data taken from `doc`. 

### `modalDelay` 

#### Default => `0`

The time in miliseconds, the user must hover over the link before the modal is shown.

### ` modalTimeout`

#### Default => `300`

The time in miliseconds after the user has stopped hovering the modal will stay active

## Styling

You can use the styles that are in this repository as a starting point, or build your own from scratch.  The only required css to get it to work is:
```css
.preview-modal {
  position: absolute;
  top:var(--position-y, calc(100% + 5px));
  left:var(--position-x,0%);
  z-index: 99;
}
```

The `.preview-modal` is the class that is set in the configuration object by setting `PreviewModalSelector` field. So whatever you set there should have the above css properties or some similar variation.
