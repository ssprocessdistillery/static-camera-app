function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
if (hasGetUserMedia()) {
  // Good to go!
} else {
  alert('getUserMedia() is not supported by your browser');
}

(() => {
  const videoEl = document.querySelector('.video');
  const displayEl = document.querySelector('.display');
  const videoSelect = document.querySelector('#videoSelector');
  const saveBtn = document.querySelector('#saveBtn');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const img = document.querySelector('#image');
  const video = document.querySelector('.display video');
  const cancelBtn = document.querySelector('#cancelBtn');
  const finishBtn = document.querySelector('#finishBtn');
  const brightnessSlider = document.getElementById('brightness');
  const contrastSlider = document.getElementById('contrast');
  const resetBtn = document.querySelector('#reset');
  const desaturateCheckBox = document.getElementById('desaturate');
  let cameraFacing = 'user';
  let pictureArray = [];
  let picturesBtn = document.createElement('select');
  // navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

  videoSelect.onclick = getStream;

  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  const displayVideo = () => {
    let canvasEl = document.querySelector('canvas');
    img.src = '';
    canvas.display = 'none';
    video.style.display = 'inline';
    const constraints = {
      audio: false,
      video: {
        facingMode: 'environment'
      }
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(gotStream)
      .catch(handleError);
  };

  displayVideo();

  saveBtn.onclick = function () {
    if (window.stream) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.filter = `brightness(${brightnessSlider.value}) contrast(${contrastSlider.value})`;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      img.src = canvas.toDataURL('image/png');
      video.style.display = 'none';
      pictureArray.push(img.src);
      displayPhotos();
      displayVideo();
    } else {
      alert('Please select a camera');
    }
  };

  finishBtn.onclick = function () {
    if (pictureArray.length === 0) {
      alert('Please take a picture before finishing');
    }
  };

  function displayPhotos() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    let thumbnail = document.createElement('img');
    thumbnail.src = pictureArray[pictureArray.length - 1];
    thumbnail.classList.add('thumbnail');
    thumbnail.addEventListener('click', () => {
      video.style.display = 'block';
      video.src = thumbnail.src;
    });
    for (let i = 0; i < pictureArray.length; i++) {
      thumbnail = document.createElement('img');
      thumbnail.src = pictureArray[i];
      thumbnail.classList.add('thumbnail', 'h-0', 'w-100', 'h-lg-25', 'mt-2');
      thumbnail.addEventListener('click', () => {
        img.src = thumbnail.src;
        video.style.display = 'none';
        if (window.stream) {
          window.stream.getTracks().forEach((track) => track.stop());
        }
      });
    }
    document.querySelector('.thumbnails').appendChild(thumbnail);
  }

  cancelBtn.onclick = function () {
    let canvasEl = document.querySelector('canvas');
    const thumbnailEl = document.querySelector('.thumbnail');
    video.style.display = 'none';
    canvasEl.style.display = 'none';
    removeAllChildNodes(document.querySelector('.thumbnails'));
    img.src = '';
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  function getStream() {
    if (cameraFacing === 'environment') {
      cameraFacing = 'user';
    } else {
      cameraFacing = 'environment';
    }
    img.src = '';
    if (window.stream) {
      window.stream.getTracks().forEach(function (track) {
        track.stop();
      });
    }

    const constraints = {
      audio: false,
      video: {
        facingMode: `${cameraFacing}`
      }
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(gotStream)
      .catch(handleError);
  }

  function gotStream(stream) {
    window.stream = stream; // make stream available to console
    videoEl.srcObject = stream;
    // adjust brightness using brightness slider
    videoEl.addEventListener('loadedmetadata', function () {
      videoEl.style.display = 'inline';
      videoEl.play();
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      brightnessSlider.addEventListener('input', function () {
        const brightness = this.value;
        const brightnessFilter = `brightness(${brightness})`;
        videoEl.style.filter = brightnessFilter;
      });
      // adjust contrast using contrast slider
      contrastSlider.addEventListener('input', function () {
        const contrast = this.value;
        const contrastFilter = `contrast(${contrast})`;
        videoEl.style.filter = contrastFilter;
      });
    });
  }

  // reset filters
  resetBtn.addEventListener('click', function () {
    videoEl.style.filter = 'none';
    brightnessSlider.value = 1;
    contrastSlider.value = 1;
  });

  function handleError(error) {
    console.error('Error: ', error);
  }
})();
