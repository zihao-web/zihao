const bookElement = document.querySelector("#book");
const pages = bookElement.querySelectorAll(".book-page");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
const pageStatus = document.querySelector("#page-status");
const orientationStatus = document.querySelector("#orientation");
const pageWidth = Number(bookElement.dataset.pageWidth) || 512;
const pageHeight = Number(bookElement.dataset.pageHeight) || 640;
document.documentElement.style.setProperty("--page-ratio", pageWidth / pageHeight);

const pageElements = Array.from(pages);

function hydratePage(index) {
  const page = pageElements[index];
  if (!page) return;

  page.querySelectorAll("img[data-src]").forEach((image) => {
    image.src = image.dataset.src;
    image.removeAttribute("data-src");
  });
}

function hydrateAround(index) {
  for (let pageIndex = index - 2; pageIndex <= index + 3; pageIndex += 1) {
    hydratePage(pageIndex);
  }
}

function prepareForwardPages() {
  hydrateAround(Math.min(pageElements.length - 1, currentPage + 2));
}

function prepareBackwardPages() {
  hydrateAround(Math.max(0, currentPage - 2));
}

const pageFlip = new St.PageFlip(bookElement, {
  width: pageWidth,
  height: pageHeight,
  size: "stretch",
  minWidth: Math.max(1, Math.round(pageWidth * 0.56)),
  maxWidth: Math.max(1, Math.round(pageWidth * 1.04)),
  minHeight: Math.max(1, Math.round(pageHeight * 0.56)),
  maxHeight: Math.max(1, Math.round(pageHeight * 1.04)),
  drawShadow: true,
  flippingTime: 760,
  usePortrait: true,
  startZIndex: 10,
  autoSize: true,
  maxShadowOpacity: 0.42,
  showCover: true,
  mobileScrollSupport: false,
  clickEventForward: false,
  useMouseEvents: true,
  swipeDistance: 24,
  showPageCorners: true,
  disableFlipByClick: false,
});

let currentPage = 0;
let isTurning = false;

function updateControls() {
  const pageCount = pageFlip.getPageCount();
  const lastPage = pageCount - 1;
  bookElement.dataset.edge = currentPage === 0 ? "front" : currentPage === lastPage ? "back" : "inside";

  previousButton.disabled = currentPage === 0 || isTurning;
  nextButton.disabled = currentPage === lastPage || isTurning;

  if (currentPage === 0) {
    pageStatus.textContent = "封面";
  } else if (currentPage === lastPage) {
    pageStatus.textContent = "封底";
  } else {
    pageStatus.textContent = `${String(currentPage + 1).padStart(2, "0")} / ${String(pageCount).padStart(2, "0")}`;
  }
}

pageFlip.on("flip", (event) => {
  currentPage = Number(event.data);
  hydrateAround(currentPage);
  updateControls();
});

pageFlip.on("changeState", (event) => {
  isTurning = event.data !== "read";
  updateControls();
});

function updateOrientation(orientation) {
  bookElement.dataset.layout = orientation;
  if (orientationStatus) if (orientationStatus) orientationStatus.textContent = orientation === "portrait" ? "单页阅读" : "双页阅读";
}

pageFlip.on("init", (event) => updateOrientation(event.data.mode));
pageFlip.on("changeOrientation", (event) => updateOrientation(event.data));

hydrateAround(0);
pageFlip.loadFromHTML(pages);
updateControls();

const requestedPage = Number(new URLSearchParams(location.search).get("page"));
if (Number.isInteger(requestedPage) && requestedPage >= 0 && requestedPage < pages.length) {
  hydrateAround(requestedPage);
  pageFlip.turnToPage(requestedPage);
}

previousButton.addEventListener("click", () => {
  if (!isTurning) {
    prepareBackwardPages();
    pageFlip.flipPrev("bottom");
  }
});

nextButton.addEventListener("click", () => {
  if (!isTurning) {
    prepareForwardPages();
    pageFlip.flipNext("bottom");
  }
});

// 左右点击翻页：左1/3往前翻，右1/3往后翻
let touchStartX = 0;
let touchStartY = 0;
bookElement.addEventListener("pointerdown", (e) => {
  touchStartX = e.clientX;
  touchStartY = e.clientY;
}, { passive: true });

bookElement.addEventListener("click", (e) => {
  if (isTurning) return;
  // 如果是拖拽翻书角，不触发
  const dragDistance = Math.abs(e.clientX - touchStartX) + Math.abs(e.clientY - touchStartY);
  if (dragDistance > 10) return;
  
  const rect = bookElement.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const ratio = x / rect.width;
  
  if (ratio < 0.33) {
    // 左侧区域：上一页
    prepareBackwardPages();
    pageFlip.flipPrev("bottom");
  } else if (ratio > 0.67) {
    // 右侧区域：下一页
    prepareForwardPages();
    pageFlip.flipNext("bottom");
  }
});

bookElement.addEventListener("pointerdown", () => {
  prepareBackwardPages();
  prepareForwardPages();
}, { passive: true });

window.addEventListener("keydown", (event) => {
  if (document.querySelector("#photo-viewer")?.open || event.altKey || event.ctrlKey || event.metaKey || isTurning) return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    prepareBackwardPages();
    pageFlip.flipPrev("bottom");
  }

  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    prepareForwardPages();
    pageFlip.flipNext("bottom");
  }

  if (event.key === "Home") pageFlip.turnToPage(0);
  if (event.key === "End") pageFlip.turnToPage(pageFlip.getPageCount() - 1);
});
