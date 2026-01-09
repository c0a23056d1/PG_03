async function main() {
  const Game = await ethers.getContractFactory("Game");
  const game = await Game.deploy();
  
  await game.waitForDeployment();
  
  const address = await game.getAddress();
  console.log("Game contract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
