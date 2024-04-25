const createForm = document.querySelector(".create-form");
const usernameMsg = document.querySelector(".username-message");
const passwordInput = document.querySelector("#createPassword");
const confirmPassInput = document.querySelector("#createConfirmPassword");
const createSubmit = document.querySelector("#create-submit");
const usernameInput = document.querySelector("#username");
const displayNameInput = document.querySelector("#trainerName");
const regionInput = document.querySelector("#choose-region");
let passValid = false;
let passedEight = false;
let canSubmitPass = false;
let canSubmitForm = false;
let newUsernameChoice = false;

passwordInput.addEventListener("input", () => {
  const hasEightCharacters = passwordInput.value.length >= 8;
  const hasNumeral = /\d/.test(passwordInput.value); // Regular expression to check for at least one digit
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
    passwordInput.value
  ); // Regular expression to check for at least one symbol
  if (hasEightCharacters) passedEight = true;
  if (hasEightCharacters && hasNumeral && hasSymbol) {
    passwordInput.style.backgroundColor = "#79c74c80";
    passValid = true;
    if (passwordInput.value === confirmPassInput.value) {
      canSubmitPass = true;
    }
  } else {
    canSubmitPass = false;
    passValid = false;
    if (passedEight) {
      passwordInput.style.backgroundColor = "#cc000080";
    }
  }
});

confirmPassInput.addEventListener("input", () => {
  if (passwordInput.value === confirmPassInput.value && passValid) {
    canSubmitPass = true;
  } else {
    canSubmitPass = false;
  }
});

createForm.addEventListener("input", () => {
  if (
    canSubmitPass &&
    usernameInput.value.length > 0 &&
    displayNameInput.value.length > 0 &&
    regionInput.value
  ) {
    canSubmitForm = true;
    createSubmit.style.opacity = 1;
  } else {
    canSubmitForm = false;
    createSubmit.style.opacity = 0.6;
  }
});

createForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (canSubmitForm) {
    axios
      .post(`/api/trainers/createProfile`, {
        password: passwordInput.value,
        username: usernameInput.value,
        region: regionInput.value,
        displayName: displayNameInput.value,
      })
      .then((response) => {
        if (response.status === 200 && response.data.redirectURL) {
          window.location.href = response.data.redirectURL;
        }
      })
      .catch((error) => {
        if (error.response.status === 406) {
          usernameMsg.innerText =
            "Username already exists. Please choose another one.";
          usernameMsg.style.color = "#cc0000";
          usernameMsg.style.fontWeight = 500;
          newUsernameChoice = true;
        } else {
          console.log("Something went wrong", error);
        }
      });
  }
});

usernameInput.addEventListener("input", () => {
  if (newUsernameChoice) {
    usernameMsg.innerText = "The username must be unique.";
    usernameMsg.style.color = "#000";
    usernameMsg.style.fontWeight = 400;
    newUsernameChoice = false;
  }
});

//////////////////////////////
///// Profile Pic Upload /////
//////////////////////////////

const dropArea = document.getElementById("drop-area");
const fileElem = document.getElementById("fileElem");
const preview = document.getElementById("preview");

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("active");
});

dropArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropArea.classList.remove("active");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("active");
  const files = e.dataTransfer.files;
  handleFiles(files);
});

fileElem.addEventListener("change", (e) => {
  const files = e.target.files;
  handleFiles(files);
});

function handleFiles(files) {
  const file = files[0];
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        // Ensure the image is fully loaded
        preview.innerHTML = ""; // Clear the previous contents
        preview.appendChild(image); // Append the new image

        const cropper = new Cropper(image, {
          viewMode: 3,
          dragMode: "move",
          aspectRatio: 1,
          autoCrop: true,
          autoCropArea: 1,
          restore: false,
          guides: false,
          center: false,
          highlight: false,
          cropBoxMovable: false,
          cropBoxResizable: false,
          toggleDragModeOnDblclick: false,
        });
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}
