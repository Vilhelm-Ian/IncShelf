import { useState, useEffect } from 'preact/hooks'
import { createRef } from 'preact'
import 'cherry-markdown/dist/cherry-markdown.min.css'
import Cherry from 'cherry-markdown';
// import Cherry from 'cherry-markdown/dist/cherry-markdown.engine.core';
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'
import { invoke, get_field_names } from "./utils/anki_connect"
import cloze from "./utils/cloze"


export default function Note(props) {
  let [text, setText] = useState(props.text)
  let [html, setHTML] = useState()
  let input_area = createRef()
  useEffect(() => {
    let cherry = new Cherry({
      id: "markdown",
      value: "**hello**",
      inlineMath: {
        engine: 'MathJax', // katex或MathJax
        src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js',
      },
       fileUpload: myFileUpload,
       mathBlock: {
        engine: 'MathJax', // katex或MathJax
        src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js',
        plugins: true, // 默认加载插件
      },
    })
  }, [])
  function myFileUpload(file, callback) {
    putFile(file, function(err, url, file) {
      if (err) {
      } else {
        if (/image/i.test(file.type)) {
          callback(url, {
            name: '图片',
            isBorder: true, 
            isShadow: true, 
            isRadius: true, 
            width: '60%', 
            height: 'auto',
          });
        } else {
          callback(url);
        }
      }
    });
  }
  return (
    <div>
    </div>
  )
}

