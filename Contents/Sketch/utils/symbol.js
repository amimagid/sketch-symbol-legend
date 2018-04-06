/**
 * Get library name.
 * @param {SymbolMaster} symbolMaster
 * @return String
 */
const getLibraryName = symbolMaster => {
  const library = AppController
    .sharedInstance()
    .librariesController()
    .libraryForShareableObject(symbolMaster);
  return library ? library.name() : '';
};

const getUserLibraries = () =>
  Array.from(
    AppController
      .sharedInstance()
      .librariesController()
      .userLibraries()
  );

module.exports = {
  getUserLibraries,
  getLibraryName
};
