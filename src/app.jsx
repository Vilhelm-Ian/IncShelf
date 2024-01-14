import { useState, useEffect } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'
import Bookmark from "./bookmarks"
import { FileList } from "./filelist"
import {HeatMap} from "./heat_map"
import { createElement } from 'preact'
import 'cherry-markdown/dist/cherry-markdown.min.css'
import Cherry from 'cherry-markdown';


export function App() {
  const [highlights, setHighlights] = useState([])


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

  const updatePosition = event => {
    const { pageX, pageY, clientX, clientY } = event;

    setPosition({
      clientX,
      clientY,
    });
  };

  useEffect(() => {
    document.addEventListener("mousedown", deselect)
    document.addEventListener("mouseup", add_note)
    return () => {
      document.removeEventListener("mousedown", deselect)
      document.removeEventListener("mouseup", add_note)
    };
  }, [])

  function add_note(e) {
    let selection_text = document.getSelection().toString()
    if (selection_text === "" || e.target.id == "add_note") {
      return
    }
    let new_note = document.createElement("button")
    new_note.innerText = "Add Note"
    new_note.id = "add_note"
    const rect = document.getSelection().anchorNode.parentElement.getBoundingClientRect()
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
    new_note.style.left = rect.left + 'px';
    markdown.style.top = rect.top + document.documentElement.scrollTop + 'px';
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
      })
      cherry.setValue = selection_text
      e.target.remove()
      document.getElementById("note").show()
    };
    console.log(position.clientX)
  }

  function deselect(e) {
    if (e.target.id === "add_note") {
      return
    }
    document.getSelection().removeAllRanges()
    document.getElementById("add_note").remove()
  }

  let highligt_elements = highlights.map((highlight) => <Bookmark text={highlight.toString()} />)
  return (
    <div class="container">
      <FileList />
      <HeatMap/>
      <div id="reader">
        <div id="pages">
        </div>
        <div id="placeholder">
          <div>
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
