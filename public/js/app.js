function textCopy(textId) {
    const copyText = document.getElementById(textId).href;
    if (copyText.length > 5) {
        navigator.clipboard.writeText(copyText);
    };
};
function downloadFile(fileId) {
  setTimeout(function() { window.location=window.location;},2000);
  location.href=fileId;
};
function delFile(link) {
  setTimeout(function() { window.location=window.location;},1000);
  location.href=link;
};
function removeFadeOut( el, speed ) {
  var seconds = speed/1000;
  el.style.transition = "opacity "+seconds+"s ease";
  el.style.opacity = 0;
  setTimeout(function() {
      el.parentNode.removeChild(el);
  }, speed);
};
document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    document.querySelectorAll('.alert-dismissible').forEach((alert) => {
      setTimeout(() => {
        removeFadeOut(alert, 1000);
      }, 1500);
    })
  }
};