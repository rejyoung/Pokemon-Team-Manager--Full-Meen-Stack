document.addEventListener("DOMContentLoaded", () => {
  const trainerDivs = document.querySelectorAll(".trainer-div");

  trainerDivs.forEach((div) => {
    div.addEventListener("click", () => {
      window.location.href = `/trainer/${div.id}`;
    });
  });

  const allTrainers = document.querySelector(".all-trainers");
  let trainersWidth = allTrainers.clientWidth - 60;
  let columnNum = ~~(trainersWidth / 320);
  let columnGap = (trainersWidth - columnNum * 300) / (columnNum - 1);
  allTrainers.style.gridTemplateColumns = `repeat(${columnNum}, 300px)`;
  allTrainers.style.columnGap = `${columnGap}px`;

  window.addEventListener("resize", () => {
    let trainersWidth = allTrainers.clientWidth - 60;
    console.log(trainersWidth);
    let columnNum = ~~(trainersWidth / 320);
    console.log(columnNum);
    let columnGap = (trainersWidth - columnNum * 300) / (columnNum - 1);
    console.log(columnGap);
    allTrainers.style.gridTemplateColumns = `repeat(${columnNum}, 300px)`;
    allTrainers.style.columnGap = `${columnGap}px`;
  });
});
