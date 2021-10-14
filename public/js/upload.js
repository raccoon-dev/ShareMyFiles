function uploadFile(uid){
    const form   = document.querySelector("form"),
    progressArea = document.querySelector(".progress-area"),
    uploadedArea = document.querySelector(".uploaded-area");
    fileInput    = document.getElementsByName("edtFile")[0].value
    if (fileInput.length < 3) {
        return;
    };
    const name   = fileInput.replace(/^.*[\\\/]/, '');
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/u/" + uid);
    xhr.upload.addEventListener("progress", ({loaded, total}) =>{
        let fileLoaded = Math.floor((loaded / total) * 100);
        let fileTotal  = Math.floor(total / 1000);
        let fileSize;
        (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024*1024)).toFixed(2) + " MB";
        let progressHTML = `<li class="row">
                            <div class="content text-warning">
                                <div class="details">
                                <i class="bi bi-cloud-arrow-up-fill"></i>
                                <span class="name">${name} • Uploading</span>
                                <span class="percent">${fileLoaded}%</span>
                                </div>
                                <div class="progress-bar">
                                <div class="progress bg-warning" style="width: ${fileLoaded}%"></div>
                                </div>
                            </div>
                            </li>`;
        uploadedArea.classList.add("onprogress");
        progressArea.innerHTML = progressHTML;
        if(loaded == total){
        progressArea.innerHTML = "";
        let uploadedHTML = `<li class="row">
                            <div class="content upload text-warning">
                            <div class="details">
                                <i class="bi bi-cloud-arrow-up-fill"></i>
                                <span class="name">${name} • Uploaded</span>
                                <span class="size">${fileSize}</span>
                                <i class="bi bi-check-lg"></i>
                                </div>
                            </div>
                            </li>`;
        uploadedArea.classList.remove("onprogress");
        uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
        setTimeout(function() {window.location.href = window.location.href}, 1000);
        }
    });
    let data = new FormData(form);
    xhr.send(data);
}