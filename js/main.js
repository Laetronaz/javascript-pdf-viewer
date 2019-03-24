const url = "../docs/MichelPelland20181214.pdf";
//const url = "../docs/invalidPdf.pdf";

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

const scale = 2,
  canvas = document.querySelector("#pdf-render"),
  ctx = canvas.getContext("2d");

//Reder the page
const renderPage = num => {
  pageIsRendering = true;

  //Get page
  pdfDoc.getPage(num).then(page => {
    //Set scale
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport
    };
    page.render(renderContext).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    //Output current page
    document.querySelector("#page-num").textContent = num;
  });
};

// Check for pages rendering
const queueRenderPage = num => {
  if (pageNumIsPending) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// Show Previous Page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

//Get document
pdfjsLib
  .getDocument(url)
  .promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.querySelector("#page-count").textContent = pdfDoc.numPages;
    renderPage(pageNum);
  })
  .catch(err => {
    //Display Error
    const div = document.createElement("div");
    div.className = "error";
    div.appendChild(document.createTextNode(err.message));
    document.querySelector("body").insertBefore(div, canvas);
    //Remove top-bar
    document.querySelector(".top-bar").style.display = "none";
  });

// Buttons Event
document.querySelector("#prev-page").addEventListener("click", showPrevPage);
document.querySelector("#next-page").addEventListener("click", showNextPage);
