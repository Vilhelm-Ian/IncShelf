import { useState, useEffect } from 'preact/hooks'
import { createRef } from 'preact'
import './app.css'
import Bookmark from "./bookmarks"
import { HeatMap } from "./heat_map"
import { ContextMenu } from "./context_menu"
import { Anki } from './anki'
import { Note } from './note'
import 'cherry-markdown/dist/cherry-markdown.min.css'
import Cherry from 'cherry-markdown';
import { getPosition } from "./utils/get_position"
import { signal } from "@preact/signals";


export function Reader(props) {
  const [highlights, setHighlights] = useState([])
  const [pagesNumber, setPagesNumber] = useState(0)
  const [readPages, setReadPages] = useState([])
  const [mousePosition, setMousePosition] = useState(undefined)
  const [current_page, setPage] = useState(0)
  const [isLoading, setLoading] = useState(false)
  const [observer, setObserver] = useState(new IntersectionObserver(mark_page_as_read));
  let placeholder = createRef();
  let pages = createRef();
  let [selection, setSelection] = useState("")

  useEffect(() => {
    if (placeholder.current === null) {
      return
    }
    (async () => {
      let pages = document.getElementById("pages")
      console.log({ pages })
      console.log({ binary: props.fileBinary })
      console.log(document.getElementById("placeholder"))
      document.documentViewer.placeholderDiv = document.getElementById("placeholder");
      document.documentViewer.viewerDivs.pagesDiv = document.getElementById("pages");
      await render_file(props.fileBinary)
      let page_count = document.documentViewer.documentHandler.pageCount + 1;
      setPagesNumber(page_count)
      track_visibility()
    })()
  }, [props.fileBinary, placeholder.current === null]);

  useEffect(() => {
    setReadPages(new Array(pagesNumber + Math.floor(pagesNumber / 25)).fill(false))
  }, [pagesNumber])

  useEffect(() => {
    let pages = document.getElementById("pages")
    if(pages.current === null) {
      return
    }
    pages.addEventListener("mousedown", deselect)
    pages.addEventListener("mouseup", show_context_menu)
    return () => {
      pages.removeEventListener("mousedown", deselect)
      pages.removeEventListener("mouseup", show_context_menu)
    };
  }, [placeholder])

  function show_context_menu(e) {
    let current_selection = document.getSelection().toString()
    if (current_selection === "") {
      return
    }
    setMousePosition(getPosition(e))
    setSelection(current_selection)
  }

  function deselect(e) {
    setMousePosition(undefined)
  }


  function track_visibility() {
    observer.observe_all_pages = function() {
      let targets = document.querySelectorAll(".page")
      targets.forEach(target => this.observe(target))
    }
    observer.observe_all_pages()
    console.log({ observer })
  }

  function mark_page_as_read(entries) {
    let page = Number(entries[0].target.querySelector("a").id.match(/\d+/)[0])
    if (entries[0].isIntersecting) {
      return
    }
    setReadPages((oldArray) => {
      let newArray = [...oldArray]
      newArray[page] = true
      return newArray
    })
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

  async function next_book() {
    setLoading(true)
    await props.open_next_in_que()
    setLoading(false)

  }


  let highligt_elements = highlights.map((highlight) => <Bookmark key={highlight} text={highlight.toString()} />)

  return (
    <div>
      {
        isLoading ? <div class="loader"></div> :
          <div class="container">
            <HeatMap observer={observer} readPages={readPages} pages={pagesNumber} />
            <div id="reader">
              <div><input value={current_page} />{pagesNumber}</div>
              <div ref={pages} id="pages">
              </div>
              <div ref={placeholder} id="placeholder">
                <div >
                  Loading WASM, please wait...
                </div>
              </div>
            </div>
            <div class="notes">
              <button onclick={() => next_book()}>Next in que</button>
              <button onclick={add_highlight}>add note</button>
              {highligt_elements}
            </div>
            <ContextMenu position={mousePosition} content={selection}/>
          </div>
      }
    </div>
  )
}
