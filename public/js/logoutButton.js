const logoutBtn = document.getElementById("logout");
axios.defaults.withCredentials = true;

if (logoutBtn && logoutBtn != "undefined") {
  logoutBtn.addEventListener("click", () => {
    axios
      .post("/logout")
      .then((response) => {
        if (response.status === 200) {
          location.reload();
        } else {
          alert("Logout failed:", response.data.message);
        }
      })
      .catch((error) => console.log("Logout Failed", error));
  });
}
