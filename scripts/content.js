/**
 * Content file that gets injected into the browser
 */
console.log("[Content] this is content script")

function createPopup(selectionText, position) {
    var popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = (position.top - 50) + "px"; // position it above the selection
    popup.style.left = (position.left) + "px"; // align it with the left side of the selection
    popup.style.backgroundColor = "#fff";
    popup.style.border = "1px solid #000";
    popup.style.padding = "10px";
    
    // Create a Popup div
    var selected = document.createElement("div");
    selected.textContent = selectionText;
    popup.appendChild(selected);
    
    popup.id = "myPopup";

    const defaultQuestion = "What does this mean?";

    // Create a text input
    var textField = document.createElement("input");
    textField.type = "text";
    textField.id = "myTextField";
    textField.placeholder = defaultQuestion;
    popup.appendChild(textField);

    // Create a button to search
    var button = document.createElement("button");
    button.textContent = "Send";
    button.onclick = function() {
      button.textContent = "Loading...";
      var textField = document.getElementById("myTextField").value;
      if (!textField) {
        textField = defaultQuestion;
      }
      const queryText = selectionText + "\n" + textField;
      console.log("[Content] Query text: " + queryText);
      chrome.runtime.sendMessage({ type: "getResponse", selection: queryText }).then((response) => {
        button.textContent = "Send";
        console.log("[Content] response from ChatGPT API: " + response.result);
        var resultText = document.createElement("div");
        resultText.textContent = response.result;
        popup.appendChild(resultText);
      });
    }
    popup.appendChild(button);

    return popup;
}

document.addEventListener("mouseup", function(event) {
  var selection = window.getSelection();
  var selectionText = selection.toString().trim();
  console.log("[Content] selection: " + selection);
  if (selectionText && selectionText !== "") {
    var rect = selection.getRangeAt(0).getBoundingClientRect();
    const popup = createPopup(selectionText, rect);
    document.body.appendChild(popup);
    document.addEventListener("mousedown", function(event) {
      var isClickInside = popup.contains(event.target);
      if (!isClickInside) {
          popup.parentNode.removeChild(popup);
          document.removeEventListener("mousedown", arguments.callee);
      }
    });
  }
});