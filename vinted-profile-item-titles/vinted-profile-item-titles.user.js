// ==UserScript==
// @name         Vinted Profile Item Titles
// @version      1.0.0
// @description  Show the item title under each listing on a Vinted profile page
// @match        https://www.vinted.co.uk/member/*
// @license      GPL-3.0-or-later
// @icon         https://marketplace-web-assets.vinted.com/_next/static/media/favicon-32x32.0p~qlj6daueba.png
// @supportURL   https://github.com/bertiewils/userscripts/issues
// ==/UserScript==

// Profile pages are /member/:id, optionally with a username slug appended.
const PROFILE_PATH = /^\/member\/\d+(?:[-/]|$)/;

// Vinted exposes the title only as part of a summary string, in the form
// "<title>, brand: X, size: Y, condition: Z, £1.00". Every label but the price
// is prefixed with ", <lowercase label>: ", so cut at the first one of those.
const METADATA_START = /,\s[a-z][a-z ]*:\s/;
const TRAILING_PRICE = /,\s[^,]*\d[^,]*$/;

const MARKER_CLASS = "userscript-item-title";

function extractTitle(summary) {
  const metadata = METADATA_START.exec(summary);
  const title = metadata
    ? summary.slice(0, metadata.index)
    : summary.replace(TRAILING_PRICE, "");
  return title.trim();
}

function addTitle(link) {
  const id = /^product-item-id-(\d+)--overlay-link$/.exec(
    link.dataset.testid,
  )?.[1];
  if (!id) return;

  const item = link.closest('[data-testid="grid-item"]') ?? document;
  // The description section holds the view count on your own profile, and the
  // brand/size on someone else's; fall back to the section itself if Vinted
  // has not wrapped its contents.
  const anchor =
    item.querySelector(
      `[data-testid="product-item-id-${id}--description--content"]`,
    ) ??
    item.querySelector(`[data-testid="product-item-id-${id}--description"]`);
  if (!anchor || anchor.querySelector(`.${MARKER_CLASS}`)) return;

  const summary =
    link.title ||
    item.querySelector(`[data-testid="product-item-id-${id}--image--img"]`)
      ?.alt ||
    "";
  const title = extractTitle(summary);
  if (!title) return;

  const element = document.createElement("p");
  element.className = `web_ui__Text__text web_ui__Text__caption web_ui__Text__left ${MARKER_CLASS}`;
  // Long unbroken words would otherwise widen the grid item.
  element.style.overflowWrap = "anywhere";
  element.textContent = title;
  anchor.prepend(element);
}

function addTitles() {
  if (!PROFILE_PATH.test(location.pathname)) return;
  document
    .querySelectorAll(
      'a[data-testid^="product-item-id-"][data-testid$="--overlay-link"]',
    )
    .forEach(addTitle);
}

// Listings are rendered client side, paginated, and re-rendered on navigation
// between profiles, so keep watching rather than running once.
let scheduled = false;
new MutationObserver(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    addTitles();
  });
}).observe(document.body, { childList: true, subtree: true });

addTitles();
