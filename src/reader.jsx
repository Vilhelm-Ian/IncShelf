import { useState, useEffect } from 'preact/hooks'
import { createRef } from 'preact'
import './app.css'
import Bookmark from "./bookmarks"
import { HeatMap } from "./heat_map"
import 'cherry-markdown/dist/cherry-markdown.min.css'
import Cherry from 'cherry-markdown';


export function Reader(props) {
  const [highlights, setHighlights] = useState([])
  const [pagesNumber, setPagesNumber] = useState(0)
  const [readPages, setReadPages] = useState([])
  let placeholder = createRef();

  useEffect(() => {
    if (placeholder.current == null) {
      return
    }
    if (pagesNumber != 0) { // to prevent reRendering if book has been loaded
      return
    }
    (async () => {
      let pages = document.getElementById("pages")
      console.log({ pages })
      document.documentViewer.placeholderDiv = placeholder.current;
      document.documentViewer.viewerDivs.pagesDiv = document.getElementById("pages");
      await render_file(props.fileBinary)
      let page_count = document.documentViewer.documentHandler.pageCount + 1;
      setPagesNumber(page_count)
      setReadPages(new Array(page_count + Math.floor(page_count/25)).fill(false))
      track_visibility()
    })()
  }, [placeholder]);

  useEffect(() => {
    document.addEventListener("mousedown", deselect)
    document.addEventListener("mouseup", add_note)
    return () => {
      document.removeEventListener("mousedown", deselect)
      document.removeEventListener("mouseup", add_note)
    };
  }, [placeholder])

function track_visibility() {
  let observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) {
      console.log(readPages)
      let page = entries[0].target.querySelector("a").id.match(/\d+/)[0]
      setReadPages((oldArray) => {
        let newArray = [...oldArray]
        newArray[page] = true
        return newArray
      }
      )
      console.log("elvis left the build")
      console.log(page)
    }
  })
  let targets = document.querySelectorAll(".page")
  targets.forEach(target => observer.observe(target))
}


async function render_file(binary) {
  console.log({ binary })
  let f = new File([binary], "todo", {
    type: "application/pdf"
  })
  await document.documentViewer.openFile(f)
}


function add_highlight() {
  //TODO change document font to monospace
  //TODO extract code below to a different function
  //TODO change the height of the span tag to 1em or 1rem
  const selection = document.getSelection();
  const range = selection.getRangeAt(0);
  let current_element = selection.anchorNode.parentElement;
  let start_offset = (selection.anchorOffset / selection.anchorNode.textContent.length) * 100;
  let current_page_number = document.getSelection().anchorNode.parentElement.parentElement.parentElement.querySelector("a").id.match(/\d+/)[0];
  let current_element_index = Array.from(current_element.parentNode.children).indexOf(current_element)
  let styles = []

  let rects = range.getClientRects();
  let start_width = (selection.toString().length / current_element.textContent.length) * 100;
  current_element.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0) ${start_offset}%, rgba(0,0,255,0.5) ${start_offset}%, rgba(0,0,255,0.5) ${start_offset + start_width}%, rgba(0,0,0,0) 0)`
  styles.push(current_element.style.backgroundImage)


  let end_offset = (selection.extentOffset / selection.extentNode.parentElement.innerText.length) * 100;
  while (current_element.innerHTML !== selection.extentNode.textContent) {
    current_element = current_element.nextSibling;
    current_element.style.backgroundImage = "linear-gradient(rgba(0,0,255,0.5) 100%,rgba(0,0,255,0.5))";
    styles.push(current_element.style.backgroundImage)
  }

  if (rects.length > 1) {
    current_element.style.background = "";
    current_element.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 255, 0.5) ${end_offset}%, rgba(0,0,0,0) ${end_offset}px, rgba(0,0,0,0) 100%)`
    styles.push(current_element.style.backgroundImage)
  }
  // console.log({
  //   current_page_number,
  //   current_element_index,
  //   styles
  // })

  setHighlights(() => {
    let new_highlights = [...highlights]
    new_highlights.push(String(selection))
    return new_highlights
  })
  window.getSelection().removeAllRanges()
}



function add_note(e) {
  let selection = document.getSelection()
  let selection_text = selection.toString()
  if (selection_text === "" || e.target.id == "add_note") {
    return
  }
  if (selection.anchorNode.parentElement.parentElement.className !== "text") {
    return
  }
  let new_note = document.createElement("button")
  new_note.innerText = "Add Note"
  new_note.id = "add_note"
  const rect = selection.anchorNode.parentElement.getBoundingClientRect()
  new_note.style.position = "absolute";
  new_note.style.left = rect.left + 'px';
  new_note.style.top = rect.top + document.documentElement.scrollTop + 'px';
  document.getElementsByTagName("body")[0].appendChild(new_note)
  new_note.onclick = (e) => {
    let markdown = document.createElement("div")
    markdown.id = "markdown"
    markdown.style.position = "absolute";
    markdown.style.left = 0;
    markdown.style.zIndex = 2;
    markdown.style.top = rect.top + document.documentElement.scrollTop + 'px';
    markdown.style.height = "auto";
    document.getElementById("reader").appendChild(markdown)
    let cherry = new Cherry({
      id: "markdown",
      value: selection_text,
      inlineMath: {
        engine: 'MathJax',
        src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js',
      },
      mathBlock: {
        engine: 'MathJax',
        src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js',
        plugins: true,
      },
      editor: {
        height: "100%"
      }
    })
    document.cherry = cherry
    e.target.remove()
  };
}

function deselect(e) {
  if (e.target.id === "add_note") {
    return
  }
  document.getSelection().removeAllRanges()
  let add_note_button = document.getElementById("add_note")
  if (add_note_button === null) {
    return
  }
  add_note_button.remove()
}


let highligt_elements = highlights.map((highlight) => <Bookmark text={highlight.toString()} />)
return (
  <div class="container">
    <HeatMap readPages={readPages} pages={pagesNumber} />
    <div id="reader">
      <div id="pages">
      </div>
      <div ref={placeholder} id="placeholder">
        <div >
          Loading WASM, please wait...
        </div>
      </div>
    </div>
    <div class="notes">
      <button onclick={add_highlight}>add note</button>
      {highligt_elements}
    </div>

  </div>
)
}
