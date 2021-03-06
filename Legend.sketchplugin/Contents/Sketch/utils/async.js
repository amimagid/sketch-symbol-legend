const { createFiber } = require('sketch/async'); // eslint-disable-line node/no-missing-require

// prevent sketch script clean up https://developer.sketchapp.com/reference/api/#async
const sketchWaitForCompletion = asyncFn => {
  if (typeof asyncFn != 'function') {
    throw new TypeError(
      `Async action ${Object.prototype.toString.call(asyncFn)} is not a function`
    );
  }

  const fiber = createFiber();
  try {
    asyncFn().finally(() => fiber.cleanup());
  } catch (error) {
    fiber.cleanup();
    throw error;
  }
};

module.exports = {
  sketchWaitForCompletion,
};
