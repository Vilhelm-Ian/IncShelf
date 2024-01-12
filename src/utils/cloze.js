function cloze() {
  let selection = document.getSelection()
  let text = selection.getRangeAt(0).extractContents().textContent
  text = "{{c1::" + text + "}}";
  let offset = selection.anchorOffset
  let parent = selection.anchorNode.parentElement
  parent.innerHTML = parent.innerHTML.slice(0,offset) + text +(offset)

}

export default cloze
