import { useState, useEffect } from 'preact/hooks'
import './app.css'

export function HeatMap(props) {

  function goto_page(e) {
    props.observer.disconnect()
    document.documentViewer.documentHandler.goToPage(e.target.attributes.page.value)
    props.observer.observe_all_pages()
  }

  function render_heat_map() {
    let current_page = 0;
    let name_later = new Array(props.pages + Math.floor(props.pages / 25)).fill(0)
    return name_later.map((_, index) => {
      if (index % 25 !== 0) {
        current_page += 1;
      }
      return index % 26 === 0 ? <span key={index}>{current_page+"-"+Number(current_page+25)}</span> : <div page={current_page} className={(props.readPages[index] ? 'read_page ' : '') + "tooltip"} onClick={(e) => goto_page(e)} key={index}>{current_page}<span class="tooltiptext">{current_page}</span></div>
    })
  }

  return (
    <div class="heat_map">
      {
        render_heat_map()
      }
    </div>
  )
}
