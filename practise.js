// const delay = (ms) => {
//   return new Promise((resolve, reject) => setTimeout(() => resolve(), ms));
// };
//
// function main() {
//   delay(3000)
//     .then(() => console.log("3 seconds delay"))
//     .then(() => delay(1000).then(() => console.log("1 seconds delay")));
// }
//
// main();

// function delay(ms) {
//   return new Promise((res, rej) => setTimeout(() => res(), ms));
// }
//
// async function main() {
//   await delay(3000);
//   console.log("3 seconds delay");
//   await delay(1000);
//   console.log("1 second delay");
// }
//
// main();
