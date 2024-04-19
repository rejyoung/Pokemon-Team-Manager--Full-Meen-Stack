document.addEventListener("DOMContentLoaded", () => {
  const trainerUsername = document.querySelector(".profile").id;
  const profileContents = document.querySelectorAll(
    ".name-and-region, .trainer-team"
  );
  const allProfileObjects = document.querySelectorAll(
    ".profile-name-label, .trainer-name, .profile-region-label, .trainer-region, .trainer-team h3, .pokemon-thumb, #manage-profile, #manage-team"
  );
  const trainerDisplayName = document.querySelector(".trainer-name");
  const trainerToken = document.querySelector(".profile").dataset.token;
  const manageProfileBtn = document.querySelector("#manage-profile");
  const manageTeamBtn = document.querySelector("#manage-team");
  const editBtns = document.querySelectorAll(".edit-name");
  const editBoxes = document.querySelectorAll(".edit-box");
  const manageAccountFrame = document.querySelector(".manage-account-frame");
  const manageAccountWindow = document.querySelector(".manage-account-window");
  const manageOptions = document.querySelector(".manage-options");
  const changePassMsg = document.querySelector("#change-password-message");
  const changeNameMsg = document.querySelector("#change-name-message");
  const changeNameBtn = document.querySelector("#change-display-name");
  const changeNameForm = document.querySelector(".change-display-name-form");
  const newNameInput = document.querySelector("#newName");
  const newNamePassInput = document.querySelector("#change-name-password");
  const changeNameSave = document.querySelector("#name-save");
  const changePassForm = document.querySelector(".change-password-form");
  const changePassBtn = document.querySelector("#change-password");
  const oldPassInput = document.querySelector("#oldPassword");
  const newPassInput = document.querySelector("#newPassword");
  const confirmPassInput = document.querySelector("#confirmPassword");
  const changePassSave = document.querySelector("#password-save");
  const closeManageBtn = document.querySelector("#close-manage");
  const deleteBtn = document.querySelector("#delete-trainer");
  const yesBtn = document.querySelector("#yes");
  const noBtn = document.querySelector("#no");
  const deleteConfirm = document.querySelector(".delete-confirm");
  const nameBack = document.querySelector("#name-back-to-options");
  const passBack = document.querySelector("#password-back-to-options");
  let canSubmitPass = false;
  let canSubmitName = false;
  let newPassValid = false;
  let passedEight = false;

  // Set axios to send cookies along with the requests
  axios.defaults.withCredentials = true;

  // Manage Team
  manageTeamBtn.addEventListener(
    "click",
    () =>
      (window.location.href = `/trainer/profile/pokemonCollection?token=${trainerToken}`)
  );

  // Edit Nickname
  editBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      let correspondingBox = document.getElementById(btn.dataset.inputBoxId);
      correspondingBox.style.display = "inline-block";
      correspondingBox.focus();
    });
  });

  editBoxes.forEach((box) => {
    function saveName(newName) {
      axios
        .put(`/api/trainers/oneTrainer/${trainerToken}/updateNickname`, {
          id: box.dataset.pokemonId,
          newNickname: newName,
        })
        .then((response) => {
          if (response.status === 200) {
            box.previousElementSibling.innerText = `${response.data.nickname}`;
          }
        })
        .then(setTimeout(() => (box.style.display = "none"), 150))
        .catch((error) => {
          if (response.status === 401) {
            window.location.href = "/login";
          } else {
            console.error("Request failed", error);
            box.style.display = "none";
          }
        });
    }

    box.addEventListener("keyup", (event) => {
      if (event.keyCode == 13) {
        saveName(box.value);
      }
    });
    box.addEventListener("blur", () => {
      saveName(box.value);
    });
  });

  //////////////////////////
  ///// MANAGE PROFILE /////
  //////////////////////////

  manageProfileBtn.addEventListener("click", () => {
    console.log("click");
    gsap
      .timeline()
      .set(manageAccountFrame, { display: "block" })
      .set(manageAccountWindow, { x: "40vw", display: "block" })
      .to(allProfileObjects, { duration: 0.2, rotationX: 90 })
      .set(profileContents, { display: "none" })
      .to(manageAccountWindow, { duration: 0.3, x: 0 });
  });

  closeManageBtn.addEventListener("click", () => {
    gsap
      .timeline()
      .to(manageAccountWindow, { duration: 0.3, x: "40vw" })
      .set(manageAccountWindow, { display: "none" })
      .set(manageAccountFrame, { display: "none" })
      .set(profileContents, { display: "block" })
      .to(allProfileObjects, { duration: 0.2, rotationX: 0 });
    setTimeout(() => {
      closeChangeName();
      closeChangePassword();
    }, 301);
  });

  changeNameBtn.addEventListener("click", () => {
    gsap
      .timeline()
      .set(changeNameForm, { display: "flex", y: "20vw" })
      .to(manageOptions, { duration: 0.5, y: "-550px" })
      .to(changeNameForm, { duration: 0.5, y: "-550px" }, "-=..2")
      .set(manageOptions, { display: "none" })
      .set(changeNameForm, { y: 0 });
  });

  changePassBtn.addEventListener("click", () => {
    gsap
      .timeline()
      .set(changePassForm, { display: "flex" })
      .to(manageOptions, { duration: 0.5, y: "-550px" })
      .to(changePassForm, { duration: 0.5, y: "-550px" }, "-=..2")
      .set(manageOptions, { display: "none" })
      .set(changePassForm, { y: 0 });
  });

  nameBack.addEventListener("click", closeChangeName);

  function closeChangeName() {
    gsap
      .timeline()
      .set(changeNameForm, { y: "-550px" })
      .set(manageOptions, { display: "flex", y: "-550px" })
      .to(changeNameForm, { duration: 0.5, y: "0" })
      .to(manageOptions, { duration: 0.5, y: 0 }, "-=..2")
      .set(changeNameForm, { display: "none" });
    newNamePassInput.value = "";
    newNameInput.value = "";
    changeNameMsg.style.visibility = "hidden";
  }

  passBack.addEventListener("click", closeChangePassword);

  function closeChangePassword() {
    gsap
      .timeline()
      .set(changePassForm, { y: "-550px" })
      .set(manageOptions, { display: "flex", y: "-550px" })
      .to(changePassForm, { duration: 0.5, y: "0" })
      .to(manageOptions, { duration: 0.5, y: 0 }, "-=..2")
      .set(changePassForm, { display: "none" });
    oldPassInput.value = "";
    newPassInput.value = "";
    confirmPassInput.value = "";
    changePassMsg.style.visibility = "hidden";
    newPassInput.style.backgroundColor = "#FFF";
  }

  ///////////////////////////////
  ///// CHANGE DISPLAY NAME /////
  ///////////////////////////////

  newNamePassInput.addEventListener("input", () => {
    if (newNamePassInput.value.length > 7 && newNameInput.value.length > 0) {
      canSubmitName = true;
      changeNameSave.style.opacity = 1;
    } else {
      canSubmitName = false;
      changeNameSave.style.opacity = 0.6;
    }
  });

  newNameInput.addEventListener("input", () => {
    if (newNamePassInput.value > 7 && newNameInput.value > 0) {
      canSubmitName = true;
      changeNameSave.style.opacity = 1;
    } else {
      canSubmitName = false;
      changeNameSave.style.opacity = 0.6;
    }
  });

  changeNameSave.addEventListener("click", () => {
    if (canSubmitName) {
      try {
        axios
          .put(`/api/trainers/oneTrainer/${trainerToken}/changeDisplayName`, {
            password: newNamePassInput.value,
            newDisplayName: newNameInput.value,
          })
          .then((response) => {
            if (response.status === 200) {
              trainerDisplayName.textContent = newNameInput.value;
              newNameInput.placeholder = newNameInput.value;
              changeNameMsg.textContent = "Success!";
              changeNameMsg.style.color = "#000";
              changeNameMsg.style.visibility = "visible";
              newNameInput.value = "";
              newNamePassInput.value = "";
            }
          })
          .catch((error) => {
            if (error.response === 401) {
              changeNameMsg.textContent =
                "Incorrect Password. Please Try Again.";
              changeNameMsg.style.color = "#cc0000";
              changeNameMsg.style.visibility = "visible";
            } else {
              console.log("Something went wrong", error);
            }
          });
      } catch (error) {
        errObj = {
          message: "change name failed",
          payload: error,
        };

        console.log(errObj);
        res.json(errObj);
      }
    }
  });

  ///////////////////////////
  ///// CHANGE PASSWORD /////
  ///////////////////////////

  newPassInput.addEventListener("input", () => {
    const hasEightCharacters = newPassInput.value.length >= 8;
    const hasNumeral = /\d/.test(newPassInput.value); // Regular expression to check for at least one digit
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
      newPassInput.value
    ); // Regular expression to check for at least one symbol
    if (hasEightCharacters) passedEight = true;
    if (hasEightCharacters && hasNumeral && hasSymbol) {
      newPassInput.style.backgroundColor = "#79c74c80";
      newPassValid = true;
      if (
        newPassInput.value === confirmPassInput.value &&
        oldPassInput.value.length > 8
      ) {
        canSubmitPass = true;
        changePassSave.style.opacity = 1;
      }
    } else {
      canSubmitPass = false;
      newPassValid = false;
      changePassSave.style.opacity = 0.6;
      if (passedEight) {
        newPassInput.style.backgroundColor = "#cc000080";
      }
    }
  });

  confirmPassInput.addEventListener("input", () => {
    if (
      newPassInput.value === confirmPassInput.value &&
      newPassValid &&
      oldPassInput.value.length > 7
    ) {
      canSubmit = true;
      changePassSave.style.opacity = 1;
    } else {
      canSubmit = false;
      changePassSave.style.opacity = 0.6;
    }
  });

  oldPassInput.addEventListener("input", () => {
    if (
      oldPassInput.value.length > 7 &&
      newPassInput.value.length > 7 &&
      confirmPassInput.value.length > 7 &&
      newPassValid &&
      confirmPassInput.value === newPassInput.value
    ) {
      canSubmit = true;
      changePassSave.style.opacity = 1;
    } else {
      canSubmit = false;
      changePassSave.style.opacity = 0.6;
    }
  });

  changePassSave.addEventListener("click", () => {
    if (canSubmit) {
      try {
        axios
          .put(`/api/trainers/oneTrainer/${trainerToken}/changePassword`, {
            oldPassword: oldPassInput.value,
            newPassword: newPassInput.value,
          })
          .then((response) => {
            if (response.status === 200) {
              changePassMsg.textContent = "Success!";
              changePassMsg.style.color = "#000";
              changePassMsg.style.visibility = "visible";
              oldPassInput.value = "";
              newPassInput.value = "";
              confirmPassInput.value = "";
              newPassInput.style.backgroundColor = "#FFF";
            }
          })
          .catch((error) => {
            if (error.response === 401) {
              changeNameMsg.textContent =
                "Incorrect Old Password. Please Try Again.";
              changeNameMsg.style.color = "#cc0000";
              changeNameMsg.style.visibility = "visible";
            } else {
              console.log("Something went wrong", error);
            }
          });
      } catch (error) {
        errObj = {
          message: "changePassword failed",
          payload: error,
        };

        console.log(errObj);
        res.json(errObj);
      }
    }
  });

  //////////////////////////
  ///// DELETE TRAINER /////
  //////////////////////////

  deleteBtn.addEventListener("click", () => {
    gsap
      .timeline()
      .set(deleteConfirm, { display: "flex" })
      .to(deleteConfirm, { duration: 0.2, opacity: 1 });
  });

  noBtn.addEventListener("click", () => {
    gsap
      .timeline()
      .to(deleteConfirm, { duration: 0.2, opacity: 0 })
      .set(deleteConfirm, { display: "none" });
  });

  yesBtn.addEventListener("click", () => {
    axios
      .delete(`/api/trainers/oneTrainer/${trainerToken}/deleteTrainer`)
      .then((response) => {
        if (response.status === 200) {
          window.location.href = "/";
        }
      })
      .catch((error) => {
        if (error.response === 401) {
          window.location.href = "/login";
        } else {
          console.error("Request failed", error);
        }
      });
  });
});
