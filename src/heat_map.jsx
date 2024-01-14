import { useState, useEffect } from 'preact/hooks'
import './app.css'

export function HeatMap() {
    function goto_page(page_number) {
    document.documentViewer.documentHandler.goToPage(page_number)
    }


  return (
    <div class="heat_map">
      {
      (new Array(200).fill(0)).map((_,index) => index %25 ===0 ? <span>{index}</span> : <div onClick={()=>goto_page(index)} key={index}>p</div>)
    }

    </div>
  )
}
