document.addEventListener("DOMContentLoaded", () => {
  const trainerDivs = document.querySelectorAll(".trainer-div");

  trainerDivs.forEach((div) => {
    div.addEventListener("click", () => {
      window.location.href = `/trainer/${div.id}`;
    });
  });
});
