function cloze() {
  let selection = document.getSelection()
  let parent = selection.anchorNode.parentElement
  if(parent.attributes.name.value !== "field" ) {
    return;
  }
  let text = selection.getRangeAt(0).extractContents().textContent
  text = "{{c1::" + text + "}}";
  let offset = selection.anchorOffset
  parent.innerHTML = parent.innerHTML.slice(0,offset) + text +parent.innerHTML.slice(offset)
}

export default cloze
