import { useState, useEffect } from 'preact/hooks'
import './app.css'

export function HeatMap(props) {
    function goto_page(page_number) {
    document.documentViewer.documentHandler.goToPage(page_number)
    }


  return (
    <div class="heat_map">
      {
      (new Array(props.pages+Math.floor(props.pages/25)).fill(0)).map((_,index) => index %25 ===0 ? <span>{index}</span> : <div className={ props.readPages[index] ? 'read_page' : ''} onClick={()=>goto_page(index)} key={index}>p</div>)
    }
    </div>
  )
}
