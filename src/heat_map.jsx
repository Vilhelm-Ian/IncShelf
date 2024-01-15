import { useState, useEffect } from 'preact/hooks'
import './app.css'

export function HeatMap(props) {

  function goto_page(e, page_number) {
    props.observer.disconnect()
    document.documentViewer.documentHandler.goToPage(page_number)
    props.observer.observe_all_pages()
  }

  return (
    <div class="heat_map">
      {
      (new Array(props.pages+Math.floor(props.pages/25)).fill(0)).map((_,index) => index %25 ===0 ? <span>{index}</span> : <div className={ props.readPages[index] ? 'read_page' : ''} onClick={(e)=>goto_page(e,index)} key={index}>p</div>)
    }
    </div>
  )
}
