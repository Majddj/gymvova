module.exports = async function forceExpoAssets(git) {
  await git.exec('add', '-f', '--', 'assets/node_modules');
};
